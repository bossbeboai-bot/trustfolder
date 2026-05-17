/**
 * Post-payment async pipeline.
 *
 * Tied to the `payment_completed` order status. Orchestrates:
 *   classify -> tier-specific generation -> package -> deliver
 *
 * Tier routing:
 *   tier_1 -> autonomous Lite Readiness Snapshot
 *   tier_2 -> AI Disclosure Pack
 *   tier_3 -> Buyer-Ready Governance Folder
 *   tier_0, tier_4 -> not in the automated pipeline
 *
 * The $2,500+ premium handoff remains manual/request-led.
 */

import { classify } from './classify.js';
import { deliverPack, sendRetryNotice } from './deliver.js';
import { env } from './lib/env.js';
import { service, dbError } from './lib/supabase.js';
import type {
  GenerationContext,
  OrderRow,
  Result,
  ScopeCheckResult,
} from './lib/types.js';
import { markFailed, transition } from './order-status.js';
import { buildPack, buildSnapshotPack } from './package.js';
import { tierLabel } from './paypal.js';
import { qa } from './qa.js';
import { generate } from './generate.js';
import { runSnapshot } from './snapshot.js';

// =============================================================================
// Public API
// =============================================================================

export interface RunPipelineInput {
  order_id: string;
  /** When true, advance retry_count and re-run starting from generation. Default: auto. */
  is_retry?: boolean;
}

export interface RunPipelineOutput {
  delivered: boolean;
  generation_run: number;
  qa_score: number;
  qa_pass: boolean;
  doc_count: number;
  message: string;
}

export async function runPipeline(input: RunPipelineInput): Promise<Result<RunPipelineOutput>> {
  const sb = service();

  // 1. Read order.
  const { data: order, error } = await sb
    .from('orders')
    .select('*')
    .eq('id', input.order_id)
    .single();
  if (error || !order) {
    return { ok: false, error: `order_not_found:${error?.message ?? 'unknown'}` };
  }
  const o = order as OrderRow;

  if (o.payment_status !== 'completed') {
    return { ok: false, error: `payment_not_completed:${o.payment_status}` };
  }

  if (!input.is_retry && o.status !== 'payment_completed') {
    return {
      ok: true,
      data: {
        delivered: o.status === 'delivered',
        generation_run: 0,
        qa_score: 0,
        qa_pass: false,
        doc_count: 0,
        message: `Pipeline not started because order is already ${o.status}`,
      },
    };
  }

  // Determine generation_run.
  const { data: existingGens } = await sb
    .from('generated_packs')
    .select('generation_run')
    .eq('order_id', o.id);
  const maxRun = (existingGens ?? []).reduce(
    (m: number, r: { generation_run: number }) => Math.max(m, r.generation_run ?? 1),
    0,
  );
  const generationRun = input.is_retry || maxRun > 0 ? maxRun + 1 : 1;

  // 2. Transition: payment_completed -> generation_started.
  const t1 = await transition({
    order_id: o.id,
    to: 'generation_started',
    actor: 'pipeline',
    metadata: { generation_run: generationRun },
    expected_from: input.is_retry ? undefined : 'payment_completed',
  });
  if (!t1.ok) {
    if (input.is_retry) {
      await transition({
        order_id: o.id,
        to: 'generation_started',
        actor: 'pipeline',
        metadata: { generation_run: generationRun, retry: true },
        force: true,
      });
    } else {
      return { ok: false, error: `transition_failed:${t1.error}` };
    }
  }

  // 2.5. Tier routing: premium remains manual, free has no checkout.
  if (o.tier === 'tier_0' || o.tier === 'tier_4') {
    await markFailed(
      o.id,
      'pipeline.tier_routing',
      `tier_not_in_automated_pipeline:${o.tier}`,
    );
    return { ok: false, error: `tier_not_in_automated_pipeline:${o.tier}` };
  }

  // 3. Classify.
  const scope_check: ScopeCheckResult = {
    in_scope: o.scope_check_passed ?? true,
    band: o.scope_check_band ?? 'CLEAR',
    matched_keywords: [],
    reason: '',
    recommended_tier: o.tier,
    user_message: '',
  };

  const cls = await classify({
    extraction: o.extraction_data,
    answers: o.questionnaire_data,
    scope_check,
  });
  if (!cls.ok || !cls.data) {
    await markFailed(o.id, 'pipeline.classify', cls.error ?? 'unknown');
    await sendRetryNotice({ order_id: o.id, to_email: o.email, reason: 'classify_failed' });
    return { ok: false, error: `classify_failed:${cls.error}` };
  }

  const ctx: GenerationContext = {
    order_id: o.id,
    company_name: cls.data.pack_metadata.company_name,
    email: o.email,
    url: o.url,
    extraction: o.extraction_data,
    answers: o.questionnaire_data,
    classification: cls.data,
    generation_date: new Date().toISOString().slice(0, 10),
    governance_contact: o.email,
  };

  if (o.tier === 'tier_1') {
    return runSnapshotPipeline({
      order: o,
      scope_check,
      ctx,
      generationRun,
    });
  }

  // 4. Generate.
  const gen = await generate({ context: ctx, tier: o.tier, generation_run: generationRun });
  if (!gen.ok || !gen.data) {
    await markFailed(o.id, 'pipeline.generate', gen.error ?? 'unknown');
    await sendRetryNotice({ order_id: o.id, to_email: o.email, reason: 'generate_failed' });
    return { ok: false, error: `generate_failed:${gen.error}` };
  }

  // 5. QA.
  await transition({
    order_id: o.id,
    to: 'qa_started',
    actor: 'pipeline',
    metadata: { generation_run: generationRun },
  });

  const qaInitial = await qa({ order_id: o.id, generation_run: generationRun, docs: gen.data.docs });
  if (!qaInitial.ok || !qaInitial.data) {
    await markFailed(o.id, 'pipeline.qa', qaInitial.error ?? 'unknown');
    await sendRetryNotice({ order_id: o.id, to_email: o.email, reason: 'qa_failed' });
    return { ok: false, error: `qa_failed:${qaInitial.error}` };
  }

  let activeDocs = gen.data.docs;
  let activeQa = qaInitial.data;

  // 6. QA-fail retry: regenerate once if QA did not pass on first run.
  if (!activeQa.pass && generationRun === 1 && env.generationMaxRetries() > 0) {
    const retryRun = 2;
    const gen2 = await generate({ context: ctx, tier: o.tier, generation_run: retryRun });
    if (gen2.ok && gen2.data) {
      const qa2 = await qa({ order_id: o.id, generation_run: retryRun, docs: gen2.data.docs });
      if (qa2.ok && qa2.data && qa2.data.pass) {
        activeDocs = gen2.data.docs;
        activeQa = qa2.data;
      }
    }
  }

  if (!activeQa.pass) {
    await markFailed(
      o.id,
      'pipeline.qa',
      `qa_min_score_not_met:score=${activeQa.score}`,
      { flags: activeQa.flags },
    );
    await sendRetryNotice({ order_id: o.id, to_email: o.email, reason: 'qa_score_low' });
    return { ok: false, error: 'qa_did_not_pass' };
  }

  // 7. QA passed.
  await transition({
    order_id: o.id,
    to: 'qa_passed',
    actor: 'pipeline',
    metadata: { score: activeQa.score },
  });

  // 8. Package.
  const pkg = await buildPack({
    order_id: o.id,
    email: o.email,
    tier: o.tier,
    docs: activeDocs,
    company_name: cls.data.pack_metadata.company_name,
    generation_date: ctx.generation_date,
    source_url: o.url,
    extraction: o.extraction_data,
    answers: o.questionnaire_data,
    scope: { in_scope: scope_check.in_scope, band: scope_check.band },
    support_email: process.env.SUPPORT_EMAIL || 'support@trustfolder.com',
  });
  if (!pkg.ok || !pkg.data) {
    await markFailed(o.id, 'pipeline.package', pkg.error ?? 'unknown');
    await sendRetryNotice({ order_id: o.id, to_email: o.email, reason: 'package_failed' });
    return { ok: false, error: `package_failed:${pkg.error}` };
  }

  await transition({
    order_id: o.id,
    to: 'package_created',
    actor: 'pipeline',
    metadata: { storage_path: pkg.data.storage_path, doc_count: pkg.data.doc_count },
  });

  await markOrderGenerated(o.id, 'pipeline.markGenerated');

  // 10. Deliver.
  const del = await deliverPack({
    order_id: o.id,
    to_email: o.email,
    company_name: cls.data.pack_metadata.company_name,
    pack: pkg.data,
    tier_label: tierLabel(o.tier),
  });
  if (!del.ok) {
    await markFailed(o.id, 'pipeline.deliver', del.error ?? 'unknown');
    return { ok: false, error: `deliver_failed:${del.error}` };
  }

  await transition({
    order_id: o.id,
    to: 'delivered',
    actor: 'pipeline',
    metadata: { email_id: del.data?.email_id },
  });

  return {
    ok: true,
    data: {
      delivered: true,
      generation_run: generationRun,
      qa_score: activeQa.score,
      qa_pass: activeQa.pass,
      doc_count: pkg.data.doc_count,
      message: 'Pack delivered to customer',
    },
  };
}

interface SnapshotPipelineInput {
  order: OrderRow;
  scope_check: ScopeCheckResult;
  ctx: GenerationContext;
  generationRun: number;
}

async function runSnapshotPipeline(input: SnapshotPipelineInput): Promise<Result<RunPipelineOutput>> {
  const { order: o, scope_check, ctx, generationRun } = input;

  const snapshot = await runSnapshot({ context: ctx, scope_check });
  if (!snapshot.ok || !snapshot.data) {
    await markFailed(o.id, 'pipeline.snapshot', snapshot.error ?? 'unknown');
    await sendRetryNotice({ order_id: o.id, to_email: o.email, reason: 'snapshot_failed' });
    return { ok: false, error: `snapshot_failed:${snapshot.error}` };
  }

  await transition({
    order_id: o.id,
    to: 'qa_started',
    actor: 'pipeline.snapshot',
    metadata: {
      generation_run: generationRun,
      stage: 'snapshot_internal_qa',
    },
  });

  await transition({
    order_id: o.id,
    to: 'qa_passed',
    actor: 'pipeline.snapshot',
    metadata: {
      generation_run: generationRun,
      readiness_score: snapshot.data.readiness_score.overall,
      confidence_band: snapshot.data.confidence_band,
    },
  });

  const pkg = await buildSnapshotPack({
    order_id: o.id,
    email: o.email,
    company_name: ctx.company_name,
    generation_date: ctx.generation_date,
    source_url: o.url,
    report_md: snapshot.data.report_md,
    readiness_score: snapshot.data.readiness_score,
    support_email: process.env.SUPPORT_EMAIL || 'support@trustfolder.com',
  });
  if (!pkg.ok || !pkg.data) {
    await markFailed(o.id, 'pipeline.snapshot_package', pkg.error ?? 'unknown');
    await sendRetryNotice({ order_id: o.id, to_email: o.email, reason: 'snapshot_package_failed' });
    return { ok: false, error: `snapshot_package_failed:${pkg.error}` };
  }

  await transition({
    order_id: o.id,
    to: 'package_created',
    actor: 'pipeline.snapshot',
    metadata: { storage_path: pkg.data.storage_path, doc_count: pkg.data.doc_count },
  });

  await markOrderGenerated(o.id, 'pipeline.snapshot.markGenerated');

  const del = await deliverPack({
    order_id: o.id,
    to_email: o.email,
    company_name: ctx.company_name,
    pack: pkg.data,
    tier_label: tierLabel(o.tier),
  });
  if (!del.ok) {
    await markFailed(o.id, 'pipeline.snapshot.deliver', del.error ?? 'unknown');
    return { ok: false, error: `deliver_failed:${del.error}` };
  }

  await transition({
    order_id: o.id,
    to: 'delivered',
    actor: 'pipeline.snapshot',
    metadata: { email_id: del.data?.email_id },
  });

  return {
    ok: true,
    data: {
      delivered: true,
      generation_run: generationRun,
      qa_score: snapshot.data.readiness_score.overall,
      qa_pass: true,
      doc_count: pkg.data.doc_count,
      message: 'Snapshot delivered to customer',
    },
  };
}

async function markOrderGenerated(orderId: string, actor: string): Promise<void> {
  try {
    await service()
      .from('orders')
      .update({ generated_at: new Date().toISOString() })
      .eq('id', orderId);
  } catch (err) {
    dbError(actor, err);
  }
}
