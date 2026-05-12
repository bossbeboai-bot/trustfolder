/**
 * Readiness Score — Phase 8.
 *
 * Deterministic 0–100 score expressed across 5 dimensions. Inspired by
 * competitor risk/maturity frameworks (VerifyWise, Modulos, OneTrust)
 * BUT framed strictly as documentation readiness, never a compliance,
 * audit, or legal conclusion.
 *
 * Hard rules:
 *  - Never call this a "compliance score", "audit score", or "legal score".
 *  - Always treat HARD_OUT scope as "Not ready / expert review likely".
 *  - Never assert that a customer satisfies a named law or framework.
 *  - This is documentation readiness only; final decisions belong to
 *    qualified counsel / security / privacy reviewers.
 */

import type {
  ConfidenceBand,
  ExtractionData,
  QuestionnaireAnswers,
  ScopeCheckResult,
} from './lib/types.js';

export type ReadinessBand = 'strong' | 'good' | 'partial' | 'not_ready';

export type ReadinessDimensionKey =
  | 'ai_disclosure_clarity'
  | 'ai_use_summary_completeness'
  | 'governance_documentation_readiness'
  | 'evidence_source_strength'
  | 'expert_review_need';

export interface ReadinessDimension {
  key: ReadinessDimensionKey;
  label: string;
  score: number; // 0-100
  rationale: string;
}

export interface ReadinessScore {
  /** Overall buyer-readiness score, 0–100. */
  overall: number;
  band: ReadinessBand;
  band_label: string;
  /**
   * The five dimensions, in display order. Each is 0–100 and includes a
   * one-line rationale that never asserts compliance or legal status.
   */
  dimensions: ReadinessDimension[];
  /** Plain-English recommended next step. */
  recommended_next_step: string;
  /**
   * Customer-facing disclaimer. Always included; never refer to compliance.
   */
  disclaimer: string;
  /**
   * Documentation notes about scoring limitations. Always shown near the
   * score on customer surfaces.
   */
  limitations: string[];
  /** Friendly label like "AI documentation readiness score". */
  label: string;
}

const BAND_LABEL: Record<ReadinessBand, string> = {
  strong: 'Strong readiness',
  good: 'Good start, needs review',
  partial: 'Partial readiness',
  not_ready: 'Not ready / expert review likely',
};

const DEFAULT_DISCLAIMER =
  'AI documentation readiness score. Not legal advice. Not certification. Not a compliance guarantee.';

const DEFAULT_LIMITATIONS: ReadonlyArray<string> = [
  'Scored from your website scan and intake answers only.',
  'Does not assert that any law or framework is satisfied.',
  'Does not replace qualified counsel, security review, or privacy review.',
];

export interface ReadinessInput {
  extraction: ExtractionData | null;
  answers: QuestionnaireAnswers | null;
  scope: Pick<ScopeCheckResult, 'in_scope' | 'band'> | null;
  /** Optional generated-doc citations from a delivered pack. */
  citations_count?: number;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function computeReadinessScore(input: ReadinessInput): ReadinessScore {
  const dims = [
    scoreDisclosureClarity(input),
    scoreAiUseCompleteness(input),
    scoreGovernanceReadiness(input),
    scoreEvidenceStrength(input),
    scoreExpertReviewHeadroom(input),
  ];

  const overall = clamp(
    Math.round(dims.reduce((a, d) => a + d.score, 0) / dims.length),
    0,
    100,
  );
  const band = bandFor(overall, input);
  const band_label = BAND_LABEL[band];

  return {
    overall,
    band,
    band_label,
    dimensions: dims,
    recommended_next_step: recommendation(band),
    disclaimer: DEFAULT_DISCLAIMER,
    limitations: [...DEFAULT_LIMITATIONS],
    label: 'AI documentation readiness score',
  };
}

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------

function scoreDisclosureClarity(input: ReadinessInput): ReadinessDimension {
  const a = input.answers;
  const e = input.extraction;
  let score = 50;
  const reasons: string[] = [];

  // Direct interaction with AI output raises disclosure clarity need; that
  // typically maps to *higher* draft clarity in the pack — disclosures are
  // well-defined when the interaction is direct.
  if (a?.ai_user_interaction === 'direct') {
    score += 15;
    reasons.push('Users interact with AI output directly.');
  } else if (a?.ai_user_interaction === 'reviewed') {
    score += 5;
  } else if (a?.ai_user_interaction === 'background') {
    score -= 10;
    reasons.push('AI runs in the background — disclosure surface is unclear.');
  }

  if (a?.b2b_or_b2c === 'B2C' || a?.b2b_or_b2c === 'Both') {
    score += 10;
    reasons.push('Consumer-facing surface raises disclosure need.');
  }

  const customerFacing = (e?.ai_features ?? []).filter((f) => f.customer_facing);
  if (customerFacing.length > 0) {
    score += Math.min(15, customerFacing.length * 5);
    reasons.push(`${customerFacing.length} customer-facing AI feature(s) detected.`);
  }

  return {
    key: 'ai_disclosure_clarity',
    label: 'AI disclosure clarity',
    score: clamp(score, 0, 100),
    rationale: reasons.join(' ') || 'Disclosure clarity inferred from intake only.',
  };
}

function scoreAiUseCompleteness(input: ReadinessInput): ReadinessDimension {
  const a = input.answers;
  const e = input.extraction;
  let score = 30;
  const reasons: string[] = [];

  if (a?.product_description && a.product_description.length > 60) {
    score += 20;
    reasons.push('Product description present.');
  }
  if (a?.primary_ai_use_case && a.primary_ai_use_case.length > 20) {
    score += 20;
    reasons.push('Primary AI use case described.');
  }
  if ((e?.ai_features ?? []).length > 0) {
    score += 15;
    reasons.push(`${e?.ai_features.length} AI feature(s) inferred.`);
  }
  if (e?.confidence === 'high') {
    score += 15;
    reasons.push('High extraction confidence from your website.');
  } else if (e?.confidence === 'medium') {
    score += 5;
  } else if (e?.confidence === 'low') {
    reasons.push('Extraction confidence is low — confirm key facts before review.');
  }

  return {
    key: 'ai_use_summary_completeness',
    label: 'AI use summary completeness',
    score: clamp(score, 0, 100),
    rationale: reasons.join(' ') || 'AI use summary inputs are limited.',
  };
}

function scoreGovernanceReadiness(input: ReadinessInput): ReadinessDimension {
  const a = input.answers;
  let score = 40;
  const reasons: string[] = [];

  if (a?.human_oversight === 'always') {
    score += 25;
    reasons.push('Human oversight reported as always-on.');
  } else if (a?.human_oversight === 'sometimes') {
    score += 10;
    reasons.push('Partial human oversight reported.');
  } else if (a?.human_oversight === 'never') {
    score -= 15;
    reasons.push('No human oversight reported — flag in pack.');
  }

  if (a?.has_incident_response === 'yes') {
    score += 15;
    reasons.push('Incident response present.');
  } else if (a?.has_incident_response === 'partial') {
    score += 5;
  } else if (a?.has_incident_response === 'no') {
    score -= 10;
  }

  if (a?.processes_personal_data === 'yes') {
    reasons.push('Personal data flagged — governance documentation matters.');
  }

  return {
    key: 'governance_documentation_readiness',
    label: 'Governance documentation readiness',
    score: clamp(score, 0, 100),
    rationale: reasons.join(' ') || 'Governance fields are partly answered.',
  };
}

function scoreEvidenceStrength(input: ReadinessInput): ReadinessDimension {
  const e = input.extraction;
  const citations = input.citations_count ?? 0;
  let score = 35;
  const reasons: string[] = [];

  if (e?.product_description && e.product_description.length > 80) {
    score += 10;
    reasons.push('Substantial product description content.');
  }
  const features = e?.ai_features ?? [];
  if (features.length > 0) {
    score += Math.min(20, features.length * 5);
    reasons.push(`${features.length} AI feature(s) extracted from your site.`);
  }
  if ((e?.eu_signals ?? []).length > 0) {
    score += 10;
    reasons.push('EU presence signals detected on site.');
  }

  if (citations > 0) {
    score += Math.min(25, citations * 3);
    reasons.push(`${citations} pack citation(s) recorded.`);
  }

  return {
    key: 'evidence_source_strength',
    label: 'Evidence and source strength',
    score: clamp(score, 0, 100),
    rationale: reasons.join(' ') || 'Source signals are thin — pack will flag unknowns.',
  };
}

function scoreExpertReviewHeadroom(input: ReadinessInput): ReadinessDimension {
  // High score = LOW need for expert review. Low score = HIGH need.
  const sc = input.scope;
  const e = input.extraction;
  let score = 80;
  const reasons: string[] = [];

  if (sc && !sc.in_scope) {
    score = 5;
    reasons.push('Scope check routed to expert review.');
  } else if (sc?.band === 'REVIEW') {
    score -= 35;
    reasons.push('Sensitive areas flagged in scope check.');
  } else if (sc?.band === 'SOFT_OUT') {
    score -= 25;
    reasons.push('Sensitive aspects need founder review.');
  } else if (sc?.band === 'CLEAR') {
    score += 0;
    reasons.push('Scope clear from intake.');
  }

  const risk = e?.possible_risk_areas ?? [];
  if (risk.length > 0) {
    score -= Math.min(20, risk.length * 5);
    reasons.push(`${risk.length} risk area(s) flagged on your site.`);
  }

  return {
    key: 'expert_review_need',
    label: 'Expert-review headroom',
    score: clamp(score, 0, 100),
    rationale:
      reasons.join(' ') ||
      'No expert-review signals from intake — still confirm with counsel for legal-impact areas.',
  };
}

// ---------------------------------------------------------------------------
// Banding + recommendation
// ---------------------------------------------------------------------------

function bandFor(overall: number, input: ReadinessInput): ReadinessBand {
  // Out-of-scope hard caps the band to not_ready, regardless of the average.
  if (input.scope && input.scope.in_scope === false) return 'not_ready';
  // REVIEW band caps to partial at most, even if numbers are high.
  if (input.scope?.band === 'REVIEW' && overall >= 80) return 'good';
  if (overall >= 80) return 'strong';
  if (overall >= 60) return 'good';
  if (overall >= 40) return 'partial';
  return 'not_ready';
}

function recommendation(band: ReadinessBand): string {
  switch (band) {
    case 'strong':
      return 'Request a paid pack. Plan for a brief internal review before sharing.';
    case 'good':
      return 'Request the paid pack and budget time to review flagged items with your team.';
    case 'partial':
      return 'Complete the assessment intake, then request a pack. Expect more open review items.';
    case 'not_ready':
      return 'Expert review likely needed. See /safety. We will not auto-generate a pack for high-risk areas.';
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

export type { ConfidenceBand };
