/**
 * Tier 1 - Lite Readiness Snapshot generator.
 *
 * Deterministic v1 renderer. `pipeline.ts` still does not route paid tier_1
 * orders through this module; the public product remains request-only. This
 * module exists so admin/internal previews can show the real shape of the
 * $99 snapshot without requiring checkout, email, or storage.
 */

import type {
  ClassificationResult,
  ExtractionData,
  GenerationContext,
  Result,
  ScopeCheckResult,
} from './lib/types.js';

// =============================================================================
// Public API
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
  /** API cost in cents. Deterministic v1 has no LLM cost. */
  api_cost_cents: number;
  /** Total wall-clock time. */
  duration_ms: number;
}

export async function runSnapshot(
  input: RunSnapshotInput,
): Promise<Result<RunSnapshotOutput>> {
  const started = Date.now();
  const { context, scope_check } = input;
  const report_md = renderSnapshotMarkdown(
    context.extraction,
    context.classification,
    scope_check,
    context.company_name,
    context.generation_date,
  );

  return {
    ok: true,
    data: {
      report_md,
      report_pdf_bytes: null,
      confidence_band: context.classification.overall_band,
      api_cost_cents: 0,
      duration_ms: Date.now() - started,
    },
  };
}

export function renderSnapshotMarkdown(
  extraction: ExtractionData,
  classification: ClassificationResult,
  scope_check: ScopeCheckResult,
  company_name: string,
  generation_date: string,
): string {
  const featureLines = extraction.ai_features.length > 0
    ? extraction.ai_features
        .map(
          (feature) =>
            `- **${feature.name}** - ${feature.description} (${feature.feature_type}; ${
              feature.customer_facing ? 'customer-facing' : 'not customer-facing'
            })`,
        )
        .join('\n')
    : '- No specific AI feature was confidently extracted from the scanned pages.';

  const systems = classification.systems.length > 0
    ? classification.systems
        .map(
          (system) =>
            `- **${system.name}** - ${system.ai_act_classification}; role: ${system.our_role}; confidence: ${system.confidence_band}. ${system.recommended_action}`,
        )
        .join('\n')
    : '- No classified AI system is available for this snapshot.';

  const transparencyAreas = classification.systems.length > 0
    ? classification.systems
        .flatMap((system) => system.applicable_disclosure_templates)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .map((template) => `- ${labelForDisclosureTemplate(template)}`)
        .join('\n')
    : '- Confirm whether the product needs user-facing AI disclosure language.';

  const riskSignals = [
    ...extraction.possible_risk_areas.map((r) => `Possible risk area: ${r}`),
    ...extraction.sensitive_data_signals.map((s) => `Sensitive data signal: ${s}`),
    ...scope_check.matched_keywords.map((k) => `Scope keyword: ${k}`),
  ];

  const scopeLine = scope_check.in_scope
    ? `The current intake appears eligible for a TrustFolder document pack. Scope band: **${scope_check.band}**.`
    : `This use case should route to expert review before any automated pack is prepared. Scope band: **${scope_check.band}**.`;

  const recommendedPack = scope_check.recommended_tier
    ? tierRecommendation(scope_check.recommended_tier)
    : 'Request a manual review so the right pack can be confirmed.';

  return [
    `# Lite Readiness Snapshot - ${company_name}`,
    '',
    `**Generated:** ${generation_date}`,
    '**Product:** TrustFolder buyer-review evidence snapshot',
    '**Format:** Single readiness report',
    '',
    '---',
    '',
    '## 1. Website scan summary',
    '',
    `TrustFolder reviewed the public product context available for **${extraction.product_name || company_name}** and found the following product description:`,
    '',
    `> ${safeLine(extraction.product_description)}`,
    '',
    `Extraction confidence: **${extraction.confidence}**.`,
    extraction.eu_signals.length > 0
      ? `EU-facing signals noticed: ${extraction.eu_signals.join(', ')}.`
      : 'No explicit EU-facing signal was confirmed from the scan alone.',
    '',
    '## 2. AI product overview',
    '',
    featureLines,
    '',
    `Target users: ${safeLine(extraction.target_users)}`,
    '',
    '## 3. Likely transparency / disclosure areas',
    '',
    transparencyAreas,
    '',
    '## 4. Simple readiness result',
    '',
    `Overall confidence band: **${classification.overall_band}**.`,
    '',
    systems,
    '',
    scopeLine,
    '',
    '## 5. Recommended next steps',
    '',
    recommendedPack,
    '',
    'Suggested next actions:',
    '',
    '- Confirm the AI use summary with the product owner.',
    '- Confirm whether personal data, regulated users, or sensitive domains are involved.',
    '- Prepare source-traced disclosure and governance drafts before sharing with a buyer or legal reviewer.',
    '- Send the snapshot to qualified counsel if any legal-impact claim will be published externally.',
    '',
    '## 6. Expert-review / out-of-scope flags',
    '',
    riskSignals.length > 0
      ? riskSignals.map((signal) => `- ${signal}`).join('\n')
      : '- No expert-review flag was raised by this lightweight snapshot. Confirm with counsel for legal-impact uses.',
    '',
    '---',
    '',
    '## Disclaimer',
    '',
    'This snapshot is for preparatory and informational use. It is not legal advice, not certification, and not a compliance guarantee. TrustFolder prepares source-traced drafts and review materials; final decisions belong with qualified counsel and your team.',
    '',
    '*Illustrative admin preview output may use fictional company data.*',
    '',
  ].join('\n');
}

function labelForDisclosureTemplate(templateId: string): string {
  switch (templateId) {
    case 't1-01-chatbot-disclosure':
      return 'Chatbot or AI assistant disclosure surface';
    case 't1-02-ai-content-labeling':
      return 'AI-generated content labeling';
    case 't1-03-deepfake-synthetic-media':
      return 'Synthetic media or generated media labeling';
    case 't1-04-ai-interaction-notice':
      return 'Direct AI interaction notice';
    case 't1-05-user-instructions':
      return 'User-facing instructions for AI output limits';
    case 't1-06-ai-system-disclosure-page':
      return 'AI system disclosure page';
    case 't1-07-ai-usage-policy-summary':
      return 'Legal-review note / AI usage summary';
    default:
      return `Disclosure area: ${templateId}`;
  }
}

function tierRecommendation(tier: string): string {
  switch (tier) {
    case 'tier_1':
      return 'The $99 Lite Readiness Snapshot is enough for an initial founder review, but it is not a full evidence folder.';
    case 'tier_2':
      return 'Recommended next pack: $499 AI Disclosure Pack for buyer/legal disclosure drafts and source notes.';
    case 'tier_3':
      return 'Recommended next pack: $999 Buyer-Ready AI Governance Folder for governance, evidence, readiness, open items, and buyer handoff.';
    case 'tier_4':
      return 'Recommended path: premium/manual buyer-legal handoff because this requires scoping before fulfillment.';
    default:
      return 'Request a manual review so the right pack can be confirmed.';
  }
}

function safeLine(value: string | undefined): string {
  const trimmed = (value ?? '').replace(/\s+/g, ' ').trim();
  return trimmed.length > 0 ? trimmed : 'No public description was available from the scan.';
}
