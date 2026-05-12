/**
 * Tier 1 — Lite Readiness Snapshot generator (STUB · NOT YET IMPLEMENTED).
 *
 * STATUS: Placeholder. `pipeline.ts` currently rejects `tier_1` orders with a
 * `failed_needs_retry` status + retry-notice email so the customer is never
 * abandoned. Build this module before smoke-test path B can pass.
 *
 * SCOPE (per `docs/03-pricing-and-tiers.md` Tier 1):
 *   The Lite Readiness Snapshot is a SINGLE polished readiness report,
 *   delivered as Markdown + PDF email attachment. It is NOT a pack of
 *   templates — there is no ZIP, no folder structure.
 *
 *   The report contains 6 sections:
 *     1. Website scan summary
 *     2. AI product overview (company, product, AI features detected)
 *     3. Likely transparency / disclosure areas (plain English)
 *     4. Simple readiness result (CLEAR / REVIEW / UNCERTAIN with confidence band)
 *     5. Recommended next steps (which Tier 2/3 pack and why)
 *     6. Expert-review / out-of-scope flags surfaced inline
 *   Plus the canonical disclaimer footer.
 *
 * IMPLEMENTATION OUTLINE (when ready to build, ~2-3 hours):
 *
 *   1. Reuse the already-computed inputs:
 *      - `extraction` (from `extract.ts`)
 *      - `classification` (from `classify.ts` — already cheap to run)
 *      - `scope_check` (from `scope-check.ts`)
 *
 *   2. Render the report deterministically from those inputs (NO new LLM call
 *      required for the basic version). The data is already structured.
 *
 *   3. (Optional) one Claude polish pass to smooth the prose. Use
 *      `lib/claude.ts:completion` with temperature 0.2 and a tight system
 *      prompt that ONLY rewrites for tone, not facts.
 *
 *   4. Convert Markdown → PDF. Recommended approach: `markdown-it` +
 *      `puppeteer` for HTML rendering, OR skip PDF for v1 and deliver the
 *      Markdown inline as the email HTML body.
 *
 *   5. Persist into `generated_packs` as a single row with `template_id =
 *      'tier_1_snapshot'` so the existing QA + delivery flow can pick it up.
 *
 *   6. Wire into `pipeline.ts`: replace the current `markFailed` branch with
 *      `runSnapshot({ context })` → `package.ts` skip → `deliver.ts` send.
 *
 *   7. Update `package.ts` to handle Tier 1 by passing the Markdown straight
 *      through (no ZIP) when called for `tier_1`. (Currently `package.ts`
 *      returns an error for `tier_1` to prevent silent stalls.)
 *
 *   8. Update `deliver.ts` to attach the snapshot file directly to the
 *      delivery email rather than including a signed-URL ZIP link.
 *
 * Tracked in `docs/10-world-class-product-standards.md` §14 (smoke test
 * gate) under "Known-pending items before Path B can pass".
 */

import type {
  ClassificationResult,
  ExtractionData,
  GenerationContext,
  Result,
  ScopeCheckResult,
} from './lib/types.js';

// =============================================================================
// Public API (signature-stable; body is a stub)
// =============================================================================

export interface RunSnapshotInput {
  context: GenerationContext;
  /** Pre-computed scope-check result; carried through from the pipeline. */
  scope_check: ScopeCheckResult;
}

export interface RunSnapshotOutput {
  /** The full report as Markdown. */
  report_md: string;
  /** PDF buffer. May be null in v1 if PDF rendering is deferred. */
  report_pdf_bytes: Uint8Array | null;
  /** Confidence band surfaced in section 4 of the report. */
  confidence_band: ClassificationResult['overall_band'];
  /** API cost in cents (one Claude polish pass at most). */
  api_cost_cents: number;
  /** Total wall-clock time. */
  duration_ms: number;
}

/**
 * Generate the Tier 1 Lite Readiness Snapshot.
 *
 * NOT YET IMPLEMENTED. Returns a clear error so callers in `pipeline.ts`
 * can route to `markFailed` + `sendRetryNotice` rather than stalling.
 */
export async function runSnapshot(
  _input: RunSnapshotInput,
): Promise<Result<RunSnapshotOutput>> {
  return {
    ok: false,
    error:
      'snapshot_not_implemented: see engine/src/snapshot.ts header for the build outline',
  };
}

/**
 * Pure helper — render the snapshot Markdown from already-computed inputs.
 * Exposed so `pipeline.ts` (or a future `runSnapshot`) can call it without
 * touching the LLM at all when Claude is unavailable.
 *
 * Stub for now — the real implementation should produce the 6-section
 * report described in the file header.
 */
export function renderSnapshotMarkdown(
  _extraction: ExtractionData,
  _classification: ClassificationResult,
  _scope_check: ScopeCheckResult,
  _company_name: string,
  _generation_date: string,
): string {
  // TODO: implement the 6-section report described in this file's header.
  return [
    '# TrustFolder Readiness Snapshot — STUB',
    '',
    '_(Not yet implemented. See `engine/src/snapshot.ts` for the build plan.)_',
    '',
  ].join('\n');
}
