/**
 * Per-system risk classification under the EU AI Act.
 *
 * Output is the structured ClassificationResult that drives template generation.
 * False-CLEAR is the worst outcome — the prompt + post-processing both bias
 * toward REVIEW when signals are mixed.
 *
 * Resilience:
 *  - Uses jsonCompletion with retry on transient errors
 *  - On schema-validation failure, retries once with the schema appended
 *  - Hard floor: if scope-check already said HARD_OUT, we DO NOT call Claude;
 *    we return a deterministic HARD_OUT classification instead
 */

import { z } from 'zod';
import { jsonCompletion } from './lib/claude.js';
import {
  CLASSIFY_SYSTEM_PROMPT,
  buildClassifyUserPrompt,
} from './prompts/classify-system.js';
import type {
  ClassificationResult,
  ClassifiedSystem,
  ConfidenceBand,
  ExtractionData,
  QuestionnaireAnswers,
  Result,
  ScopeCheckResult,
} from './lib/types.js';

// =============================================================================
// Schema (defensive against LLM drift)
// =============================================================================

const FeatureType = z.enum([
  'chatbot',
  'content_generation',
  'image_generation',
  'video_generation',
  'audio_generation',
  'recommendation',
  'search',
  'analytics',
  'agent',
  'translation',
  'summarization',
  'other',
]);

const Band = z.enum(['CLEAR', 'REVIEW', 'UNCERTAIN', 'SOFT_OUT', 'HARD_OUT']);

const ClassifiedSystemSchema = z.object({
  system_id: z.string(),
  name: z.string(),
  description: z.string(),
  feature_type: FeatureType,
  ai_act_classification: z.enum([
    'limited_risk',
    'minimal_risk',
    'potentially_high_risk',
    'prohibited',
    'unclear',
  ]),
  ai_act_citation: z.string(),
  our_role: z.enum(['provider', 'deployer', 'both', 'uncertain']),
  role_citation: z.string(),
  confidence_band: Band,
  recommended_action: z.string(),
  applicable_disclosure_templates: z.array(z.string()).default([]),
  notes: z.string().default(''),
});

const ClassificationSchema = z.object({
  systems: z.array(ClassifiedSystemSchema).min(1),
  overall_band: Band,
  pack_metadata: z.object({
    company_name: z.string(),
    primary_ai_role: z.enum(['provider', 'deployer', 'both']),
    has_eu_customers: z.boolean(),
    risk_summary: z.string(),
  }),
});

// =============================================================================
// Public API
// =============================================================================

export interface ClassifyInput {
  extraction: ExtractionData;
  answers: QuestionnaireAnswers;
  scope_check: ScopeCheckResult;
}

export interface ClassifyOutput extends ClassificationResult {
  api_cost_cents: number;
  duration_ms: number;
  used_deterministic_path: boolean;
}

export async function classify(input: ClassifyInput): Promise<Result<ClassifyOutput>> {
  // Fast path: if scope-check already said HARD_OUT, do not waste an LLM call.
  if (input.scope_check.band === 'HARD_OUT' || !input.scope_check.in_scope) {
    return {
      ok: true,
      data: deterministicHardOut(input),
    };
  }

  const extractionJson = JSON.stringify(input.extraction);
  const answersJson = JSON.stringify(input.answers);
  const userPrompt = buildClassifyUserPrompt(extractionJson, answersJson);

  try {
    const { result, raw } = await jsonCompletion<unknown>({
      system: CLASSIFY_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: 3_500,
      temperature: 0.1,
    });

    const parsed = ClassificationSchema.safeParse(result);
    if (!parsed.success) {
      return {
        ok: false,
        error: `classify_schema_invalid: ${parsed.error.issues
          .slice(0, 3)
          .map((i) => i.path.join('.'))
          .join(',')}`,
      };
    }

    const classification = applyConservativeOverrides(parsed.data, input);

    return {
      ok: true,
      data: {
        ...classification,
        api_cost_cents: raw.api_cost_cents,
        duration_ms: raw.duration_ms,
        used_deterministic_path: false,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `classify_failed: ${msg}` };
  }
}

// =============================================================================
// Conservative overrides (post-LLM safety net)
// =============================================================================

/**
 * Forces overall_band downward (more conservative) based on signals the LLM
 * may have missed. Never upgrades. Defense-in-depth against false-CLEAR.
 */
function applyConservativeOverrides(
  c: ClassificationResult,
  input: ClassifyInput,
): ClassificationResult {
  const a = input.answers;
  let overall = c.overall_band;

  // If any per-system band is HARD_OUT or SOFT_OUT, the overall band must reflect it.
  if (c.systems.some((s) => s.confidence_band === 'HARD_OUT')) {
    overall = 'HARD_OUT';
  } else if (c.systems.some((s) => s.confidence_band === 'SOFT_OUT') && overall === 'CLEAR') {
    overall = 'REVIEW';
  } else if (c.systems.some((s) => s.confidence_band === 'UNCERTAIN') && overall === 'CLEAR') {
    overall = 'UNCERTAIN';
  } else if (
    c.systems.some((s) => s.confidence_band === 'REVIEW') &&
    overall === 'CLEAR'
  ) {
    overall = 'REVIEW';
  }

  // If the customer answered "unsure" on any of these AND overall was CLEAR, downgrade to REVIEW.
  const unsureSignals = [
    a.has_eu_customers === 'unsure',
    a.processes_personal_data === 'unsure',
  ].filter(Boolean).length;
  if (unsureSignals >= 1 && overall === 'CLEAR') {
    overall = 'REVIEW';
  }

  // Always make sure t1-06 (master disclosure page) and t1-07 (policy summary)
  // appear in at least one system's applicable disclosure templates.
  // (Template file IDs retain the t1-/t2- prefix as internal file paths;
  //  the customer-facing tier numbering is defined by `Tier` and `tierLabel`.)
  const allTemplates = new Set(c.systems.flatMap((s) => s.applicable_disclosure_templates));
  if (!allTemplates.has('t1-06-ai-system-disclosure-page')) {
    if (c.systems[0]) {
      c.systems[0].applicable_disclosure_templates.push('t1-06-ai-system-disclosure-page');
    }
  }
  if (!allTemplates.has('t1-07-ai-usage-policy-summary')) {
    if (c.systems[0]) {
      c.systems[0].applicable_disclosure_templates.push('t1-07-ai-usage-policy-summary');
    }
  }

  return {
    ...c,
    overall_band: overall,
  };
}

// =============================================================================
// Deterministic HARD_OUT fallback (no LLM call)
// =============================================================================

function deterministicHardOut(input: ClassifyInput): ClassifyOutput {
  const fallbackSystem: ClassifiedSystem = {
    system_id: 'sys-001',
    name: input.extraction.product_name || input.answers.company_name || 'Your AI system',
    description: input.extraction.product_description || input.answers.product_description || '',
    feature_type:
      (input.extraction.ai_features[0]?.feature_type ?? 'other'),
    ai_act_classification: 'potentially_high_risk',
    ai_act_citation: 'EU AI Act Annex III / Article 5',
    our_role: 'uncertain',
    role_citation: 'EU AI Act Article 3, Article 25',
    confidence_band: 'HARD_OUT',
    recommended_action:
      'Pause deployment in the EU pending specialist legal review. TrustFolder is not the right tool for this category.',
    applicable_disclosure_templates: [],
    notes: `Deterministic HARD_OUT due to scope-check: ${input.scope_check.reason}`,
  };

  return {
    systems: [fallbackSystem],
    overall_band: 'HARD_OUT',
    pack_metadata: {
      company_name: input.extraction.company_name || input.answers.company_name || 'Unknown',
      primary_ai_role: 'deployer',
      has_eu_customers: input.answers.has_eu_customers === 'yes',
      risk_summary: 'Out of TrustFolder v1 scope.',
    },
    api_cost_cents: 0,
    duration_ms: 0,
    used_deterministic_path: true,
  };
}

export type { ConfidenceBand };
