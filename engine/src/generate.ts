/**
 * Document generator.
 *
 * For each applicable master template, runs Claude to fill placeholders + render
 * the customer-ready markdown. Persists every doc into generated_packs.
 *
 * Behavior (per `docs/03-pricing-and-tiers.md` ladder):
 *  - tier_1 (Lite Readiness Snapshot) is NOT handled here — routes to `snapshot.ts`
 *    via `pipeline.ts`. Calls to `generate({ tier: 'tier_1' })` return an error.
 *  - tier_2 (Article 50 Disclosure Pack) generates the 7 disclosure templates
 *    (some conditional on AI features).
 *  - tier_3 (Full AI Governance Evidence Folder) generates disclosures + 12
 *    governance templates = 19 total.
 *  - tier_4 (Premium Buyer/Legal Handoff) is application-only and not
 *    triggered through the automated pipeline.
 *  - Templates are filled in a small concurrency pool (default 4) for speed.
 *  - One retry per template on failure; second failure is logged and the doc
 *    is marked failed but the run continues. QA + package handle missing docs.
 *
 * Template file paths (`tier-1/t1-*.md`, `tier-2/t2-*.md`) retain their original
 * naming — they are internal file IDs that pre-date the 5-tier ladder rename.
 * The customer-facing tier identifiers (`tier_1` … `tier_4`) are independent.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { completion } from './lib/claude.js';
import {
  GENERATE_SYSTEM_PROMPT,
  buildGenerateUserPrompt,
} from './prompts/generate-system.js';
import { service, dbError } from './lib/supabase.js';
import { env } from './lib/env.js';
import type {
  GeneratedDoc,
  GenerationContext,
  Result,
  Tier,
} from './lib/types.js';

// =============================================================================
// Template manifest
// =============================================================================

/** Templates that are conditionally generated based on the customer's AI feature mix. */
type ConditionFn = (ctx: GenerationContext) => boolean;

interface TemplateEntry {
  id: string;
  filename: string;
  /** Pack family: 'disclosure' → included in Tier 2+; 'governance' → Tier 3 only. */
  pack_family: 'disclosure' | 'governance';
  /** Always-on templates have applies = () => true. */
  applies: ConditionFn;
}

/**
 * The Article 50 Disclosure templates.
 * Included in Tier 2 (disclosure pack) and Tier 3 (full evidence folder).
 */
const DISCLOSURE_DOCS: TemplateEntry[] = [
  {
    id: 't1-01-chatbot-disclosure',
    filename: 'tier-1/t1-01-chatbot-disclosure.md',
    pack_family: 'disclosure',
    applies: (ctx) =>
      ctx.extraction.ai_features.some((f) =>
        ['chatbot', 'agent', 'translation', 'summarization'].includes(f.feature_type),
      ) || /chatbot|agent|assistant/i.test(ctx.answers.primary_ai_use_case ?? ''),
  },
  {
    id: 't1-02-ai-content-labeling',
    filename: 'tier-1/t1-02-ai-content-labeling.md',
    pack_family: 'disclosure',
    applies: (ctx) =>
      ctx.extraction.ai_features.some((f) =>
        ['content_generation', 'image_generation', 'video_generation', 'audio_generation'].includes(
          f.feature_type,
        ),
      ),
  },
  {
    id: 't1-03-deepfake-notice',
    filename: 'tier-1/t1-03-deepfake-notice.md',
    pack_family: 'disclosure',
    applies: (ctx) =>
      ctx.extraction.possible_risk_areas.includes('deepfake') ||
      /deepfake|face swap|voice clon|synthetic media/i.test(JSON.stringify(ctx.extraction)),
  },
  {
    id: 't1-04-emotion-recognition-notice',
    filename: 'tier-1/t1-04-emotion-recognition-notice.md',
    pack_family: 'disclosure',
    applies: (ctx) =>
      ctx.extraction.possible_risk_areas.includes('emotion_recognition') ||
      /emotion recognition|sentiment from face|affective comput/i.test(
        JSON.stringify(ctx.extraction),
      ),
  },
  {
    id: 't1-05-biometric-categorization-notice',
    filename: 'tier-1/t1-05-biometric-categorization-notice.md',
    pack_family: 'disclosure',
    applies: (ctx) =>
      ctx.extraction.possible_risk_areas.includes('biometric_categorization') ||
      /biometric categoriz|age estimation|liveness detection/i.test(JSON.stringify(ctx.extraction)),
  },
  {
    id: 't1-06-ai-system-disclosure-page',
    filename: 'tier-1/t1-06-ai-system-disclosure-page.md',
    pack_family: 'disclosure',
    applies: () => true,
  },
  {
    id: 't1-07-ai-usage-policy-summary',
    filename: 'tier-1/t1-07-ai-usage-policy-summary.md',
    pack_family: 'disclosure',
    applies: () => true,
  },
];

/**
 * The Governance + Evidence + Lawyer-Handoff templates.
 * Included only in Tier 3 (Full AI Governance Evidence Folder).
 */
const GOVERNANCE_DOCS: TemplateEntry[] = [
  { id: 't2-01-ai-system-inventory', filename: 'tier-2/t2-01-ai-system-inventory.md', pack_family: 'governance', applies: () => true },
  { id: 't2-02-provider-deployer-memo', filename: 'tier-2/t2-02-provider-deployer-memo.md', pack_family: 'governance', applies: () => true },
  { id: 't2-03-risk-classification-memo', filename: 'tier-2/t2-03-risk-classification-memo.md', pack_family: 'governance', applies: () => true },
  { id: 't2-04-iso-42001-checklist', filename: 'tier-2/t2-04-iso-42001-checklist.md', pack_family: 'governance', applies: () => true },
  { id: 't2-05-evidence-tracker', filename: 'tier-2/t2-05-evidence-tracker.md', pack_family: 'governance', applies: () => true },
  { id: 't2-06-ai-policy-draft', filename: 'tier-2/t2-06-ai-policy-draft.md', pack_family: 'governance', applies: () => true },
  { id: 't2-07-human-oversight-procedure', filename: 'tier-2/t2-07-human-oversight-procedure.md', pack_family: 'governance', applies: () => true },
  { id: 't2-08-vendor-questionnaire', filename: 'tier-2/t2-08-vendor-questionnaire.md', pack_family: 'governance', applies: () => true },
  { id: 't2-09-lawyer-handoff-pack', filename: 'tier-2/t2-09-lawyer-handoff-pack.md', pack_family: 'governance', applies: () => true },
  { id: 't2-10-governance-roadmap', filename: 'tier-2/t2-10-governance-roadmap.md', pack_family: 'governance', applies: () => true },
  { id: 't2-11-pack-readme', filename: 'tier-2/t2-11-pack-readme.md', pack_family: 'governance', applies: () => true },
  {
    id: 't2-12-out-of-scope-handoff',
    filename: 'tier-2/t2-12-out-of-scope-handoff.md',
    pack_family: 'governance',
    applies: (ctx) =>
      ctx.classification.systems.some((s) => s.confidence_band === 'SOFT_OUT'),
  },
];

// =============================================================================
// Public API
// =============================================================================

export interface GenerateInput {
  context: GenerationContext;
  tier: Tier;
  generation_run?: number; // default 1
}

export interface GenerateOutput {
  docs: GeneratedDoc[];
  total_cost_cents: number;
  total_duration_ms: number;
  generation_run: number;
}

const CONCURRENCY = 4;

export async function generate(input: GenerateInput): Promise<Result<GenerateOutput>> {
  const generationRun = input.generation_run ?? 1;
  const start = Date.now();

  let manifest: TemplateEntry[];
  if (input.tier === 'tier_1') {
    // Tier 1 = Lite Readiness Snapshot. Routed via `snapshot.ts`, not here.
    return {
      ok: false,
      error:
        'tier_1_uses_snapshot_module: route to engine/src/snapshot.ts via pipeline.ts',
    };
  } else if (input.tier === 'tier_2') {
    // Tier 2 = Article 50 Disclosure Pack — disclosures only.
    manifest = DISCLOSURE_DOCS.filter((t) => t.applies(input.context));
  } else if (input.tier === 'tier_3') {
    // Tier 3 = Full AI Governance Evidence Folder — disclosures + governance.
    manifest = [
      ...DISCLOSURE_DOCS.filter((t) => t.applies(input.context)),
      ...GOVERNANCE_DOCS.filter((t) => t.applies(input.context)),
    ];
  } else if (input.tier === 'tier_0' || input.tier === 'tier_4') {
    // tier_0 = free check (no docs). tier_4 = application-only manual fulfillment.
    return { ok: false, error: `tier_not_in_automated_pipeline:${input.tier}` };
  } else {
    return { ok: false, error: `unsupported_tier:${input.tier}` };
  }

  // Always include t1-06 and t1-07 even if a heuristic missed them
  for (const id of ['t1-06-ai-system-disclosure-page', 't1-07-ai-usage-policy-summary']) {
    if (!manifest.find((m) => m.id === id)) {
      const entry = DISCLOSURE_DOCS.find((m) => m.id === id);
      if (entry) manifest.push(entry);
    }
  }

  // Run with concurrency
  const docs: GeneratedDoc[] = [];
  const queue = [...manifest];
  const workers: Promise<void>[] = [];

  for (let w = 0; w < CONCURRENCY; w++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const next = queue.shift();
          if (!next) return;
          const doc = await runOneTemplate(next, input.context);
          docs.push(doc);
          await persistDoc(input.context.order_id, generationRun, doc);
        }
      })(),
    );
  }
  await Promise.all(workers);

  const total_cost_cents = docs.reduce((acc, d) => acc + d.api_cost_cents, 0);
  return {
    ok: true,
    data: {
      docs,
      total_cost_cents,
      total_duration_ms: Date.now() - start,
      generation_run: generationRun,
    },
  };
}

// =============================================================================
// Internal: per-template generation with retry
// =============================================================================

async function runOneTemplate(entry: TemplateEntry, ctx: GenerationContext): Promise<GeneratedDoc> {
  const start = Date.now();
  const filename = filenameForCustomer(entry.id);

  const templateContent = await readTemplate(entry.filename);
  if (templateContent === null) {
    return {
      template_id: entry.id,
      filename,
      content_md: '',
      confidence_band: 'UNCERTAIN',
      citations: [],
      api_cost_cents: 0,
      duration_ms: Date.now() - start,
      ok: false,
      error_message: `template_not_found:${entry.filename}`,
    };
  }

  const userPrompt = buildGenerateUserPrompt(templateContent, JSON.stringify(ctx));
  const maxRetries = env.generationMaxRetries();

  let lastErr: string | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const out = await completion({
        system: GENERATE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 6_000,
        temperature: 0.2,
      });
      return {
        template_id: entry.id,
        filename,
        content_md: stripWrappingFences(out.text),
        confidence_band: detectBand(ctx, entry.id),
        citations: extractCitations(templateContent),
        api_cost_cents: out.api_cost_cents,
        duration_ms: out.duration_ms,
        ok: true,
      };
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    template_id: entry.id,
    filename,
    content_md: '',
    confidence_band: 'UNCERTAIN',
    citations: [],
    api_cost_cents: 0,
    duration_ms: Date.now() - start,
    ok: false,
    error_message: lastErr ?? 'unknown_generation_error',
  };
}

async function readTemplate(rel: string): Promise<string | null> {
  const root = path.resolve(env.templatesDir());
  const full = path.join(root, rel);
  try {
    return await fs.readFile(full, 'utf8');
  } catch {
    return null;
  }
}

function stripWrappingFences(text: string): string {
  // If the model accidentally wraps the entire document in ``` fences, strip them.
  const t = text.trim();
  if (t.startsWith('```')) {
    const m = t.match(/^```[a-zA-Z]*\n([\s\S]*?)\n```$/);
    if (m && m[1]) return m[1];
  }
  return text;
}

function extractCitations(template: string): string[] {
  const pat = /(EU AI Act[^\n,.;]*|Article \d+\([^\)]*\)?[^\n,.;]*|Annex [IVX]+(?:\([^)]+\))?[^\n,.;]*|ISO\/IEC 42001[^\n,.;]*|GDPR[^\n,.;]*)/g;
  const found = template.match(pat) ?? [];
  return Array.from(new Set(found.map((s) => s.trim()))).slice(0, 12);
}

function detectBand(ctx: GenerationContext, template_id: string): GeneratedDoc['confidence_band'] {
  // Use the per-system band where the template is system-specific; otherwise overall.
  if (template_id.startsWith('t1-')) return ctx.classification.overall_band;
  return ctx.classification.overall_band;
}

function filenameForCustomer(template_id: string): string {
  // Tier 1 -> '01-chatbot-disclosure.md' style; Tier 2 -> '02-01-inventory.md'
  return `${template_id.replace(/^t1-/, '01-').replace(/^t2-/, '02-')}.md`;
}

// =============================================================================
// Persistence
// =============================================================================

async function persistDoc(
  order_id: string,
  generation_run: number,
  doc: GeneratedDoc,
): Promise<void> {
  const sb = service();
  try {
    await sb.from('generated_packs').upsert(
      {
        order_id,
        generation_run,
        template_id: doc.template_id,
        content_md: doc.content_md,
        content_html: doc.content_html ?? null,
        confidence_band: doc.confidence_band,
        citations: doc.citations,
        api_cost_cents: doc.api_cost_cents,
        duration_ms: doc.duration_ms,
        generation_status: doc.ok ? 'ok' : 'failed',
        error_message: doc.error_message ?? null,
      },
      { onConflict: 'order_id,generation_run,template_id' },
    );
  } catch (err) {
    dbError('generate.persistDoc', err);
  }
}
