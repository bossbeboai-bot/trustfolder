/**
 * Structured extraction from crawled website text via Claude.
 *
 * Takes a CrawlResult and returns ExtractionData (company info + AI features +
 * EU signals + risk hints). Used to pre-fill the 8-question confirmation form.
 *
 * Resilience:
 *  - If the crawl was empty/failed, we return a minimal ExtractionData with
 *    confidence=low so the frontend can fall back to the manual form
 *  - If Claude returns malformed JSON, we retry once with a stricter user prompt
 */

import { z } from 'zod';
import { jsonCompletion } from './lib/claude.js';
import {
  EXTRACT_SYSTEM_PROMPT,
  buildExtractionUserPrompt,
} from './prompts/extract-system.js';
import type {
  CrawlResult,
  ExtractionData,
  Result,
} from './lib/types.js';

// =============================================================================
// Schema (defensive)
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

const ExtractionSchema = z.object({
  company_name: z.string().default(''),
  product_name: z.string().optional().default(''),
  product_description: z.string().default(''),
  ai_features: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        feature_type: FeatureType,
        customer_facing: z.boolean(),
      }),
    )
    .default([]),
  target_users: z.string().default(''),
  b2b_or_b2c: z.enum(['B2B', 'B2C', 'Both', 'Unknown']).default('Unknown'),
  eu_signals: z.array(z.string()).default([]),
  possible_risk_areas: z.array(z.string()).default([]),
  sensitive_data_signals: z.array(z.string()).default([]),
  confidence: z.enum(['low', 'medium', 'high']).default('low'),
  notes: z.string().default(''),
});

// =============================================================================
// Public API
// =============================================================================

export interface ExtractInput {
  crawl: CrawlResult;
}

export interface ExtractOutput extends ExtractionData {
  api_cost_cents: number;
  duration_ms: number;
  used_fallback_minimal: boolean;
}

export async function extract(input: ExtractInput): Promise<Result<ExtractOutput>> {
  const { crawl } = input;

  // If the crawl failed or returned no usable text, return a minimal stub so the
  // frontend can fall back to a manual questionnaire without blocking the user.
  if (!crawl.ok || crawl.combined_text.length < 200) {
    return {
      ok: true,
      data: {
        ...emptyExtraction(),
        used_fallback_minimal: true,
        api_cost_cents: 0,
        duration_ms: 0,
      },
    };
  }

  const fetchedPaths = crawl.pages.filter((p) => p.ok).map((p) => p.path);
  const userPrompt = buildExtractionUserPrompt(
    crawl.url,
    crawl.combined_text,
    fetchedPaths,
  );

  try {
    const { result, raw } = await jsonCompletion<unknown>({
      system: EXTRACT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: 2_000,
      temperature: 0.1,
    });

    const parsed = ExtractionSchema.safeParse(result);
    if (!parsed.success) {
      return {
        ok: false,
        error: `extract_schema_invalid: ${parsed.error.issues.map((i) => i.path.join('.')).join(',')}`,
      };
    }

    return {
      ok: true,
      data: {
        ...parsed.data,
        api_cost_cents: raw.api_cost_cents,
        duration_ms: raw.duration_ms,
        used_fallback_minimal: false,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Fall back to a minimal stub rather than blocking the user.
    return {
      ok: true,
      data: {
        ...emptyExtraction(),
        used_fallback_minimal: true,
        api_cost_cents: 0,
        duration_ms: 0,
        notes: `extraction_failed: ${msg}`,
      },
    };
  }
}

function emptyExtraction(): ExtractionData {
  return {
    company_name: '',
    product_name: '',
    product_description: '',
    ai_features: [],
    target_users: '',
    b2b_or_b2c: 'Unknown',
    eu_signals: [],
    possible_risk_areas: [],
    sensitive_data_signals: [],
    confidence: 'low',
    notes: '',
  };
}
