/**
 * Post-payment async pipeline.
 *
 * Tied to the `payment_completed` order status. Orchestrates:
 *   classify → generate → qa → (retry once on QA fail) → package → deliver
 *
 * Tier routing (per `docs/03-pricing-and-tiers.md`):
 *   tier_1 → snapshot path (single readiness report — see TODO note below)
 *   tier_2 → disclosure pack (full pipeline)
 *   tier_3 → full evidence folder (full pipeline)
 *   tier_0, tier_4 → not in the automated pipeline (handled out-of-band)
 *
 * Designed to be invoked from the PayPal webhook (fire-and-forget) or from
 * the admin retry endpoint. NEVER blocks the user on screen.
 *
 * Idempotency: first-run generation only starts when this function acquires
 * the payment_completed → generation_started transition. Replayed capture
 * paths, webhook replays, or return-page retries are no-ops once an order is
 * already preparing, packaged, delivered, failed, or refunded.
 *
 * TODO (smoke-test path B): build `engine/src/snapshot.ts` and route tier_1
 * orders to it from this orchestrator. Until then, tier_1 orders trip
 * `markFailed` here so the customer gets a calm "we're finishing your pack"
 * email rather than a silent stall.
 */

import { service, dbError } from './lib/supabase.js';
import { transition, markFailed } from './order-status.js';
import { classify } from './classify.js';
import { generate } from './generate.js';
import { qa } from './qa.js';
import { buildPack } from './package.js';
import { deliverPack, sendRetryNotice } from './deliver.js';
import { tierLabel } from './paypal.js';
import { env } from './lib/env.js';
import type {
  ClassificationResult,
  GenerationContext,
  OrderRow,
  Result,
  ScopeCheckResult,
} from './lib/types.js';

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

  // 1. Read order
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

  // Determine generation_run
  const { data: existingGens } = await sb
    .from('generated_packs')
    .select('generation_run')
    .eq('order_id', o.id);
  const maxRun = (existingGens ?? []).reduce(
    (m: number, r: { generation_run: number }) => Math.max(m, r.generation_run ?? 1),
    0,
  );
  const generationRun = input.is_retry || maxRun > 0 ? maxRun + 1 : 1;

  // 2. Transition: payment_completed → generation_started
  const t1 = await transition({
    order_id: o.id,
    to: 'generation_started',
    actor: 'pipeline',
    metadata: { generation_run: generationRun },
    expected_from: input.is_retry ? undefined : 'payment_completed',
  });
  if (!t1.ok) {
    // It might already have moved past payment_completed (retry case);
    // for retry, force-set status.
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

  // 2.5. Tier routing — reject tiers not handled by this orchestrator.
  // tier_1 is intentionally rejected here until `snapshot.ts` is built.
  if (o.tier === 'tier_1') {
    await markFailed(
      o.id,
      'pipeline.tier_routing',
      'tier_1_snapshot_module_not_implemented_yet',
      { tier: o.tier, todo: 'engine/src/snapshot.ts' },
    );
    await sendRetryNotice({ order_id: o.id, to_email: o.email, reason: 'snapshot_pending' });
    return {
      ok: false,
      error:
        'tier_1_snapshot_not_implemented: pipeline must route to engine/src/snapshot.ts (see docs/10 §14 known-pending items)',
    };
  }
  if (o.tier === 'tier_0' || o.tier === 'tier_4') {
    await markFailed(
      o.id,
      'pipeline.tier_routing',
      `tier_not_in_automated_pipeline:${o.tier}`,
    );
    return { ok: false, error: `tier_not_in_automated_pipeline:${o.tier}` };
  }

  // 3. Classify
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

  // 4. Generate
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

  const gen = await generate({ context: ctx, tier: o.tier, generation_run: generationRun });
  if (!gen.ok || !gen.data) {
    await markFailed(o.id, 'pipeline.generate', gen.error ?? 'unknown');
    await sendRetryNotice({ order_id: o.id, to_email: o.email, reason: 'generate_failed' });
    return { ok: false, error: `generate_failed:${gen.error}` };
  }

  // 5. QA — transition to qa_started
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

  // Narrow once and use a non-optional alias from here on.
  let activeDocs = gen.data.docs;
  let activeQa = qaInitial.data;

  // 6. QA-fail retry: regenerate ONCE if QA didn't pass on the first run
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

  // 7. QA passed
  await transition({
    order_id: o.id,
    to: 'qa_passed',
    actor: 'pipeline',
    metadata: { score: activeQa.score },
  });

  // 8. Package — Phase 8: pass intake/scope so readiness score + open review
  // items + buyer review packet are computed inside the pack.
  const pkg = await buildPack({
    order_id: o.id,
    email: o.email,
    tier: o.tier,
    docs: activeDocs,
    company_name: cls.data.pack_metadata.company_name,
    generation_date: ctx.generation_date,
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

  // 9. Mark generated_at
  try {
    await sb
      .from('orders')
      .update({ generated_at: new Date().toISOString() })
      .eq('id', o.id);
  } catch (err) {
    dbError('pipeline.markGenerated', err);
  }

  // 10. Deliver
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
