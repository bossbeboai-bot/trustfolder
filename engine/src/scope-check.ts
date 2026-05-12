/**
 * Scope check — hard-coded keyword detection of out-of-scope verticals.
 *
 * NO LLM JUDGMENT. The whole point of this module is determinism: a regulated
 * vertical (banking, healthcare, HR, biometric ID, children, credit, law-enforcement)
 * MUST be caught reliably and refunded automatically.
 *
 * Two layers:
 *  1. Vertical (questionnaire answer) — direct match → HARD_OUT
 *  2. Keyword scan over (extraction + answers) — flags + decision
 *
 * Soft-out cases (insurance, legal litigation, government) are flagged but
 * the user is still allowed to proceed; founder triages within 24 hrs.
 */

import type {
  ConfidenceBand,
  ExtractionData,
  QuestionnaireAnswers,
  ScopeCheckResult,
  Tier,
} from './lib/types.js';

// =============================================================================
// Keyword tables
// =============================================================================

/** Exact matches against questionnaire `vertical` field → HARD_OUT */
const HARD_OUT_VERTICALS = new Set([
  'banking',
  'healthcare',
  'hr',
  'biometric',
  'children',
  'credit',
  'law_enforcement',
]);

/**
 * Phrase matches in extraction text + answer free-text → HARD_OUT.
 * Lowercased; word-boundary matched in the matcher.
 */
const HARD_OUT_KEYWORDS = [
  // Banking / lending / credit
  'bank lending',
  'credit scoring',
  'credit decisioning',
  'underwriting',
  'loan approval',
  'loan origination',
  'loan decision',
  'mortgage approval',
  'aml ',
  'anti-money laundering',
  'kyc decision',

  // Healthcare / medical
  'medical diagnosis',
  'patient diagnosis',
  'clinical decision support',
  'electronic health record',
  'medical device software',
  'mdr ',
  'fda 510(k)',
  'health record',
  'patient triage',
  'symptom checker',
  'radiology ai',

  // HR / employment
  'cv screening',
  'resume screening',
  'candidate scoring',
  'hiring decision',
  'employee performance scoring',
  'workforce monitoring',
  'recruiting ai',
  'applicant tracking ai',
  'firing decision',
  'promotion decision',

  // Biometric ID (vs categorization)
  'face recognition',
  'facial recognition',
  'fingerprint identification',
  'voice identification',
  'biometric identification',
  'identity verification by face',

  // Children
  'k-12',
  'k12 ',
  "children's product",
  'minors only',
  'kids app',
  'students under 18',

  // Law enforcement
  'predictive policing',
  'law enforcement ai',
  'criminal recidivism',
  'evidence evaluation ai',

  // Migration / asylum / border
  'border control ai',
  'asylum decision',
  'visa screening',

  // Education scoring
  'student admissions ai',
  'student scoring',
  'exam grading ai for high-stakes',

  // Critical infrastructure
  'power grid management',
  'water treatment ai',
  'air-traffic ai',

  // Article 5 prohibitions
  'social scoring',
  'subliminal manipulation',
  'real-time biometric identification in public',
  'workplace emotion recognition',
  'classroom emotion recognition',
];

/** Soft-out cases — allowed through but flagged for human triage. */
const SOFT_OUT_KEYWORDS = [
  'insurance underwriting',
  'auto-insurance pricing',
  'legal litigation ai',
  'court filing ai',
  'government procurement',
  'defense contractor',
  'military ai',
  'defense ai',
  'nuclear',
  'manufacturing safety ai',
];

// =============================================================================
// Public API
// =============================================================================

export interface ScopeCheckInput {
  extraction: ExtractionData;
  answers: QuestionnaireAnswers;
}

export function scopeCheck(input: ScopeCheckInput): ScopeCheckResult {
  // Layer 1: vertical match
  if (HARD_OUT_VERTICALS.has(input.answers.vertical)) {
    return hardOut([`vertical:${input.answers.vertical}`]);
  }

  // Layer 2: keyword scan
  const haystack = buildHaystack(input);
  const hardMatches = HARD_OUT_KEYWORDS.filter((kw) => haystack.includes(kw));
  if (hardMatches.length > 0) {
    return hardOut(hardMatches);
  }
  const softMatches = SOFT_OUT_KEYWORDS.filter((kw) => haystack.includes(kw));
  if (softMatches.length > 0) {
    return softOut(softMatches);
  }

  // Layer 3: extraction-supplied risk hints (LLM may have flagged something)
  const extractionRisk = input.extraction.possible_risk_areas;
  const prohibited = ['emotion_recognition_workplace', 'social_scoring', 'biometric_identification_public'];
  const sensitive = ['emotion_recognition', 'biometric_categorization', 'deepfake'];

  if (extractionRisk.some((r) => prohibited.includes(r))) {
    return hardOut(extractionRisk.filter((r) => prohibited.includes(r)));
  }
  if (extractionRisk.some((r) => sensitive.includes(r))) {
    return review(extractionRisk.filter((r) => sensitive.includes(r)));
  }

  // Layer 4: data-subject signals
  if (input.answers.processes_personal_data === 'yes' && input.answers.has_eu_customers === 'yes') {
    // Personal data + EU users is in-scope (limited-risk transparency obligations); just CLEAR.
    // No special flag here.
  }

  // Default: in-scope CLEAR. Recommend Tier 2 ($499 disclosure pack) by default;
  // EU + complex products upgrade to Tier 3 ($999 full evidence folder).
  return {
    in_scope: true,
    band: 'CLEAR',
    matched_keywords: [],
    reason: 'No regulated-vertical signals detected. Looks like standard B2B AI SaaS.',
    recommended_tier: recommendTier(input),
    user_message:
      'Looks like a good fit. We can prepare your transparency disclosures.',
  };
}

// =============================================================================
// Internal helpers
// =============================================================================

function buildHaystack(input: ScopeCheckInput): string {
  const a = input.answers;
  const e = input.extraction;
  const parts: string[] = [
    e.company_name ?? '',
    e.product_name ?? '',
    e.product_description ?? '',
    e.target_users ?? '',
    e.notes ?? '',
    ...e.ai_features.flatMap((f) => [f.name, f.description]),
    ...e.eu_signals,
    ...e.possible_risk_areas,
    ...e.sensitive_data_signals,
    a.company_name ?? '',
    a.product_description ?? '',
    a.primary_ai_use_case ?? '',
    a.vertical ?? '',
    ...(a.primary_jurisdictions ?? []),
    ...(a.data_subject_categories ?? []),
    ...(a.ai_training_data_sources ?? []),
    ...(a.third_party_models ?? []),
  ];
  return parts.filter(Boolean).join(' \n ').toLowerCase();
}

function hardOut(matched: string[]): ScopeCheckResult {
  return {
    in_scope: false,
    band: 'HARD_OUT',
    matched_keywords: matched,
    reason: `regulated_vertical_signals: ${matched.slice(0, 3).join(', ')}`,
    recommended_tier: null,
    user_message:
      "Thanks for considering us. Based on what you described, your product looks like it operates in a regulated category that needs specialized expert review beyond what our automated tool can safely do. We won't charge you. We'd recommend a specialized AI/regulatory lawyer for this one.",
  };
}

function softOut(matched: string[]): ScopeCheckResult {
  return {
    in_scope: true,
    band: 'SOFT_OUT',
    matched_keywords: matched,
    reason: `sensitive_signals_review_recommended: ${matched.slice(0, 3).join(', ')}`,
    // Soft-out customers default to Tier 2 (disclosure pack) once cleared by founder review.
    recommended_tier: 'tier_2',
    user_message:
      "We can help, but your use case has some sensitive aspects we'd like a human to confirm before generating. We'll route this for a quick founder review and follow up within 24 hours. No charge yet.",
  };
}

function review(matched: string[]): ScopeCheckResult {
  return {
    in_scope: true,
    band: 'REVIEW',
    matched_keywords: matched,
    reason: `extraction_flagged_sensitive_areas: ${matched.join(', ')}`,
    // REVIEW-band customers benefit from the full evidence folder (Tier 3) — extra lawyer notes.
    recommended_tier: 'tier_3',
    user_message:
      "Some parts of your AI use are sensitive (we flagged them). We can still prepare your evidence folder — it'll include extra notes for your lawyer.",
  };
}

/**
 * Tier recommendation heuristic for in-scope, CLEAR-band customers.
 *
 * Mapping (per `docs/03-pricing-and-tiers.md`):
 *   tier_1 → $99 Lite Readiness Snapshot   (single short report)
 *   tier_2 → $499 Article 50 Disclosure Pack (default for most B2B AI SaaS)
 *   tier_3 → $999 Full AI Governance Evidence Folder (EU + complex products)
 *
 * Decision tree:
 *   - EU customers + (multiple AI systems OR processes personal data)
 *       → tier_3 (they need the lawyer-handoff + governance docs)
 *   - Otherwise (any in-scope CLEAR case)
 *       → tier_2 (the disclosure pack is the natural starting point)
 *
 * Tier 1 (snapshot) is never auto-recommended here — it's an opt-in lower
 * step the user can choose if they aren't yet ready for the disclosure pack.
 */
function recommendTier(input: ScopeCheckInput): Tier {
  const a = input.answers;
  const e = input.extraction;
  const multipleSystems = e.ai_features.length >= 2;
  const euYes = a.has_eu_customers === 'yes';
  const personalData = a.processes_personal_data === 'yes';

  if (euYes && (multipleSystems || personalData)) return 'tier_3';
  return 'tier_2';
}

/** Pure helper exported for testing. */
export function _internal_haystack(input: ScopeCheckInput): string {
  return buildHaystack(input);
}

/** Confidence band re-export for clarity at call sites. */
export type { ConfidenceBand };
