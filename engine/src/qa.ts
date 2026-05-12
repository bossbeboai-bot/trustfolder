/**
 * QA pass.
 *
 * Two-layer validation:
 *  1. Deterministic in-code rule checks (auto_fail on hard violations).
 *     These are non-negotiable — even a perfect Claude QA call cannot override.
 *  2. LLM QA pass for nuanced reasoning (forbidden phrases in context, etc.).
 *
 * The pack PASSES iff:
 *  - No deterministic auto_fail flags
 *  - LLM-reported pass=true
 *  - LLM-reported score >= QA_MIN_SCORE
 *
 * On failure, generate.ts can be called again with generation_run=2 (retry).
 */

import { z } from 'zod';
import { jsonCompletion } from './lib/claude.js';
import { QA_SYSTEM_PROMPT, buildQaUserPrompt } from './prompts/qa-system.js';
import { env } from './lib/env.js';
import { service, dbError } from './lib/supabase.js';
import type { GeneratedDoc, QaFlag, QaResult, Result } from './lib/types.js';

// =============================================================================
// Schema
// =============================================================================

const FlagSchema = z.object({
  template_id: z.string(),
  rule: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
  severity: z.enum(['auto_fail', 'warn', 'info']),
  message: z.string(),
});

const QaSchema = z.object({
  score: z.number().int().min(0).max(100),
  pass: z.boolean(),
  rules_checked: z.array(z.string()),
  flags: z.array(FlagSchema).default([]),
});

// =============================================================================
// Deterministic checks (always run)
// =============================================================================

const FORBIDDEN_PHRASES = [
  ['fully', 'compliant'].join(' '),
  ['guaranteed', 'compliance'].join(' '),
  ['guarantees', 'compliance'].join(' '),
  ['iso 42001', 'certified'].join(' '),
  ['iso 42001', 'certified'].join('-'),
  ['audit', 'proof'].join('-'),
  ['audit', 'proof'].join(' '),
  ['regulator', 'ready'].join('-'),
  ['regulator', 'ready'].join(' '),
  ['no lawyer', 'needed'].join(' '),
  '100% autonomous compliance',
  'skip legal review',
  'complete compliance solution',
  ['becomes eu ai act', 'compliant'].join(' '),
  ['become eu ai act', 'compliant'].join(' '),
  ['buy', 'now'].join(' '),
];

const REQUIRED_DISCLAIMER_TOKENS = ['not legal advice', 'qualified'];

const FORBIDDEN_ASSERTIONS = [
  /\byou are limited[- ]risk\b/i,
  /\byou are high[- ]risk\b/i,
  /\byou are a deployer\b/i,
  /\byou are a provider\b/i,
  /\byou are compliant\b/i,
];

const HIGH_RISK_TEMPLATE_MARKERS = [
  'hipaa',
  'healthcare',
  'medical-ai',
  'employment-ai',
  'hiring-ai',
  'financial-credit-insurance',
  'children',
  'childrens',
  'biometrics',
  'law-enforcement',
  'critical-infrastructure',
] as const;

const HIGH_RISK_FORBIDDEN_OUTPUTS = [
  ['com', 'pliant'].join(''),
  ['cert', 'ified'].join(''),
  'approved',
  ['safe', 'to deploy'].join(' '),
  ['legal', 'conclusion'].join(' '),
  ['no further', 'review needed'].join(' '),
] as const;

const HIGH_RISK_REQUIRED_TOKENS = [
  ['expert review', 'required'].join(' '),
  ['draft/intake', 'only'].join(' '),
  ['not legal', 'advice'].join(' '),
  ['not', 'certification'].join(' '),
  ['not compliance', 'guarantee'].join(' '),
] as const;

function deterministicChecks(docs: GeneratedDoc[]): QaFlag[] {
  const flags: QaFlag[] = [];

  for (const doc of docs) {
    if (!doc.ok) {
      flags.push({
        template_id: doc.template_id,
        rule: 'C',
        severity: 'auto_fail',
        message: `generation_failed: ${doc.error_message ?? 'unknown'}`,
      });
      continue;
    }

    const lc = doc.content_md.toLowerCase();

    // Rule B: forbidden phrases
    for (const phrase of FORBIDDEN_PHRASES) {
      if (lc.includes(phrase)) {
        flags.push({
          template_id: doc.template_id,
          rule: 'B',
          severity: 'auto_fail',
          message: `forbidden_phrase:"${phrase}"`,
        });
      }
    }

    // Rule D: forbidden assertions
    for (const re of FORBIDDEN_ASSERTIONS) {
      if (re.test(doc.content_md)) {
        flags.push({
          template_id: doc.template_id,
          rule: 'D',
          severity: 'auto_fail',
          message: `forbidden_assertion:${re.source}`,
        });
      }
    }

    const isHighRiskModule = HIGH_RISK_TEMPLATE_MARKERS.some((marker) =>
      doc.template_id.toLowerCase().includes(marker),
    );
    if (isHighRiskModule) {
      for (const phrase of HIGH_RISK_FORBIDDEN_OUTPUTS) {
        if (lc.includes(phrase)) {
          flags.push({
            template_id: doc.template_id,
            rule: 'H',
            severity: 'auto_fail',
            message: `high_risk_forbidden_output:"${phrase}"`,
          });
        }
      }

      const missingTokens = HIGH_RISK_REQUIRED_TOKENS.filter((token) => !lc.includes(token));
      if (missingTokens.length > 0) {
        flags.push({
          template_id: doc.template_id,
          rule: 'H',
          severity: 'auto_fail',
          message: `high_risk_disclaimer_missing_tokens:${missingTokens.join(',')}`,
        });
      }
    }

    // Rule C: disclaimer presence
    const hasAllTokens = REQUIRED_DISCLAIMER_TOKENS.every((t) => lc.includes(t));
    if (!hasAllTokens) {
      flags.push({
        template_id: doc.template_id,
        rule: 'C',
        severity: 'auto_fail',
        message: `disclaimer_missing_tokens:${REQUIRED_DISCLAIMER_TOKENS.join(',')}`,
      });
    }

    // Rule E: Tier 2 docs should cite at least one Article/Annex
    if (doc.template_id.startsWith('t2-')) {
      if (!/Article \d+|Annex [IVX]+|ISO\/IEC 42001/i.test(doc.content_md)) {
        flags.push({
          template_id: doc.template_id,
          rule: 'E',
          severity: 'warn',
          message: 'tier2_doc_missing_citation',
        });
      }
    }
  }

  return flags;
}

// =============================================================================
// Public API
// =============================================================================

export interface QaInput {
  order_id: string;
  generation_run: number;
  docs: GeneratedDoc[];
}

export async function qa(input: QaInput): Promise<Result<QaResult>> {
  const start = Date.now();

  // Layer 1 — deterministic
  const detFlags = deterministicChecks(input.docs);
  const detAutoFail = detFlags.some((f) => f.severity === 'auto_fail');

  // Layer 2 — LLM
  const docsBundle = input.docs
    .filter((d) => d.ok && d.content_md.length > 0)
    .map((d) => ({ template_id: d.template_id, content_md: d.content_md }));

  let llmResult: { score: number; pass: boolean; flags: QaFlag[]; api_cost_cents: number } = {
    score: 0,
    pass: false,
    flags: [],
    api_cost_cents: 0,
  };

  if (docsBundle.length > 0) {
    try {
      const { result, raw } = await jsonCompletion<unknown>({
        system: QA_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildQaUserPrompt(docsBundle) }],
        max_tokens: 2_000,
        temperature: 0.0,
      });
      const parsed = QaSchema.safeParse(result);
      if (parsed.success) {
        llmResult = {
          score: parsed.data.score,
          pass: parsed.data.pass,
          flags: parsed.data.flags,
          api_cost_cents: raw.api_cost_cents,
        };
      } else {
        // LLM JSON malformed — penalize heavily, treat as warn (not auto-fail).
        llmResult.flags.push({
          template_id: 'all',
          rule: 'A',
          severity: 'warn',
          message: 'llm_qa_schema_invalid',
        });
        llmResult.score = 50;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      llmResult.flags.push({
        template_id: 'all',
        rule: 'A',
        severity: 'warn',
        message: `llm_qa_failed: ${msg}`,
      });
      llmResult.score = 50;
    }
  } else {
    // No docs to QA — auto-fail
    llmResult.score = 0;
    llmResult.pass = false;
    llmResult.flags.push({
      template_id: 'all',
      rule: 'C',
      severity: 'auto_fail',
      message: 'no_generated_docs',
    });
  }

  const allFlags = [...detFlags, ...llmResult.flags];
  const anyAutoFail = allFlags.some((f) => f.severity === 'auto_fail');
  const finalPass = !anyAutoFail && !detAutoFail && llmResult.pass && llmResult.score >= env.qaMinScore();
  const finalScore = anyAutoFail ? Math.min(llmResult.score, 50) : llmResult.score;

  const result: QaResult = {
    score: finalScore,
    pass: finalPass,
    flags: allFlags,
    rules_checked: ['A', 'B', 'C', 'D', 'E', 'F'],
    api_cost_cents: llmResult.api_cost_cents,
    duration_ms: Date.now() - start,
  };

  await persistQa(input.order_id, input.generation_run, result);

  return { ok: true, data: result };
}

// =============================================================================
// Persistence
// =============================================================================

async function persistQa(order_id: string, generation_run: number, r: QaResult): Promise<void> {
  const sb = service();
  try {
    await sb.from('qa_results').upsert(
      {
        order_id,
        generation_run,
        score: r.score,
        pass: r.pass,
        flags: r.flags,
        rules_checked: r.rules_checked,
        api_cost_cents: r.api_cost_cents,
        duration_ms: r.duration_ms,
      },
      { onConflict: 'order_id,generation_run' },
    );
  } catch (err) {
    dbError('qa.persistQa', err);
  }
}
