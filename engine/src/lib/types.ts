/**
 * TrustFolder engine — shared types
 *
 * These mirror the Supabase schema (see supabase/migrations/0001_initial_schema.sql)
 * and define the DTOs each engine module exchanges.
 */

// =============================================================================
// Enums
// =============================================================================

/**
 * Pricing-tier identifiers (canonical mapping in `docs/03-pricing-and-tiers.md`):
 *   tier_0 = Free Eligibility Check         · $0   · no documents
 *   tier_1 = Lite Readiness Snapshot        · $99  · single readiness report
 *   tier_2 = Article 50 Disclosure Pack     · $499 · 6-7 disclosure docs
 *   tier_3 = Full AI Governance Evidence    · $999 · 12-13 docs
 *   tier_4 = Premium Buyer/Legal Handoff    · $2.5-4.5k · application-only
 */
export type Tier = 'tier_0' | 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4';

export type ConfidenceBand =
  | 'CLEAR'
  | 'REVIEW'
  | 'UNCERTAIN'
  | 'SOFT_OUT'
  | 'HARD_OUT';

export type OrderStatus =
  | 'lead_created'
  | 'website_scanned'
  | 'questions_completed'
  | 'scope_checked'
  | 'payment_pending'
  | 'payment_completed'
  | 'generation_started'
  | 'qa_started'
  | 'qa_passed'
  | 'package_created'
  | 'delivered'
  | 'failed_needs_retry'
  | 'out_of_scope';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// =============================================================================
// Crawler
// =============================================================================

export interface CrawlPage {
  path: string;
  url: string;
  status: number;
  ok: boolean;
  title?: string;
  description?: string;
  headings: string[];
  body_text: string; // truncated
  fetch_error?: string;
}

export interface CrawlResult {
  url: string;
  ok: boolean;
  pages: CrawlPage[];
  combined_text: string;
  fetched_at: string;
  fetch_error?: string;
}

// =============================================================================
// Extraction (Claude output)
// =============================================================================

export interface AiFeatureSignal {
  /** Short user-facing name e.g. "Customer support chatbot" */
  name: string;
  /** Plain-English description */
  description: string;
  /** Coarse type for downstream classification */
  feature_type:
    | 'chatbot'
    | 'content_generation'
    | 'image_generation'
    | 'video_generation'
    | 'audio_generation'
    | 'recommendation'
    | 'search'
    | 'analytics'
    | 'agent'
    | 'translation'
    | 'summarization'
    | 'other';
  /** Whether this feature is customer-facing */
  customer_facing: boolean;
}

export interface ExtractionData {
  company_name: string;
  product_name?: string;
  product_description: string;
  ai_features: AiFeatureSignal[];
  target_users: string;
  b2b_or_b2c?: 'B2B' | 'B2C' | 'Both' | 'Unknown';
  eu_signals: string[]; // ['eu_pricing', 'gdpr_mention', ...]
  possible_risk_areas: string[]; // ['emotion_recognition', 'biometric', ...]
  sensitive_data_signals: string[];
  confidence: 'low' | 'medium' | 'high';
  notes: string;
}

// =============================================================================
// Questionnaire (8-15 questions, post-extraction confirmation)
// =============================================================================

export interface QuestionnaireAnswers {
  // Always asked
  company_name: string;
  product_description: string;
  primary_ai_use_case: string;
  b2b_or_b2c: 'B2B' | 'B2C' | 'Both';
  has_eu_customers: 'yes' | 'no' | 'unsure';
  ai_user_interaction: 'direct' | 'reviewed' | 'background';
  processes_personal_data: 'yes' | 'no' | 'unsure';
  vertical:
    | 'marketing'
    | 'sales'
    | 'dev_tools'
    | 'customer_support'
    | 'productivity'
    | 'design'
    | 'research'
    | 'other'
    | 'banking'
    | 'healthcare'
    | 'hr'
    | 'biometric'
    | 'children'
    | 'credit'
    | 'law_enforcement';

  // Tier 3 only (12-15 questions for the Full Governance Folder)
  num_eu_customers?: '0' | '1-10' | '11-100' | '100+';
  primary_jurisdictions?: string[];
  data_subject_categories?: string[];
  ai_training_data_sources?: string[];
  third_party_models?: string[];
  human_oversight?: 'always' | 'sometimes' | 'never';
  has_incident_response?: 'yes' | 'no' | 'partial';
}

// =============================================================================
// Scope check
// =============================================================================

export interface ScopeCheckResult {
  in_scope: boolean;
  band: ConfidenceBand;
  matched_keywords: string[];
  reason: string;
  recommended_tier: Tier | null;
  user_message: string;
}

// =============================================================================
// Classification
// =============================================================================

export interface ClassifiedSystem {
  system_id: string;
  name: string;
  description: string;
  feature_type: AiFeatureSignal['feature_type'];
  ai_act_classification:
    | 'limited_risk'
    | 'minimal_risk'
    | 'potentially_high_risk'
    | 'prohibited'
    | 'unclear';
  ai_act_citation: string;
  our_role: 'provider' | 'deployer' | 'both' | 'uncertain';
  role_citation: string;
  confidence_band: ConfidenceBand;
  recommended_action: string;
  /** Disclosure-template IDs that apply to this system (Tier 2 deliverables). */
  applicable_disclosure_templates: string[];
  notes: string;
}

export interface ClassificationResult {
  systems: ClassifiedSystem[];
  overall_band: ConfidenceBand;
  pack_metadata: {
    company_name: string;
    primary_ai_role: 'provider' | 'deployer' | 'both';
    has_eu_customers: boolean;
    risk_summary: string;
  };
}

// =============================================================================
// Generation
// =============================================================================

export interface TemplateSpec {
  id: string;
  /** Pack family: 'disclosure' = Tier 2 pack, 'governance' = Tier 3 pack. */
  pack_family: 'disclosure' | 'governance';
  filepath: string;       // relative to TEMPLATES_DIR
  applicable_when: (ctx: GenerationContext) => boolean;
}

export interface GenerationContext {
  order_id: string;
  company_name: string;
  email: string;
  url: string;
  extraction: ExtractionData;
  answers: QuestionnaireAnswers;
  classification: ClassificationResult;
  generation_date: string; // ISO date
  governance_contact: string;
}

export interface GeneratedDoc {
  template_id: string;
  filename: string;
  content_md: string;
  content_html?: string;
  confidence_band: ConfidenceBand;
  citations: string[];
  api_cost_cents: number;
  duration_ms: number;
  ok: boolean;
  error_message?: string;
}

// =============================================================================
// QA
// =============================================================================

export type QaFlagSeverity = 'auto_fail' | 'warn' | 'info';

export interface QaFlag {
  template_id: string;
  rule: string;
  severity: QaFlagSeverity;
  message: string;
}

export interface QaResult {
  score: number;          // 0-100
  pass: boolean;
  flags: QaFlag[];
  rules_checked: string[];
  api_cost_cents: number;
  duration_ms: number;
}

// =============================================================================
// Package + Deliver
// =============================================================================

export interface PackagedPack {
  order_id: string;
  storage_path: string;
  zip_size_bytes: number;
  signed_url: string;
  signed_url_expires_at: string; // ISO
  doc_count: number;
}

export interface DeliveryReceipt {
  order_id: string;
  email_id: string;
  to_email: string;
  resend_message_id?: string;
  delivered_at: string;
}

// =============================================================================
// PayPal
// =============================================================================

export interface PaypalCreateOrderInput {
  order_id: string;
  tier: Tier;
  amount_cents: number;
  email: string;
}

export interface PaypalCreateOrderOutput {
  paypal_order_id: string;
  approve_url: string;
}

export interface PaypalCaptureResult {
  paypal_order_id: string;
  paypal_capture_id: string;
  amount_cents: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface PaypalWebhookEvent {
  id: string;
  event_type: string;
  resource: Record<string, unknown>;
  create_time: string;
}

// =============================================================================
// DB rows (mirror Supabase tables)
// =============================================================================

export interface OrderRow {
  id: string;
  assessment_id: string | null;
  email: string;
  url: string;
  tier: Tier;
  amount_cents: number;
  currency: string;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  payment_status: PaymentStatus;
  questionnaire_data: QuestionnaireAnswers;
  extraction_data: ExtractionData;
  scope_check_passed: boolean | null;
  scope_check_band: ConfidenceBand | null;
  status: OrderStatus;
  status_updated_at: string;
  signed_download_url: string | null;
  signed_url_expires_at: string | null;
  retry_count: number;
  last_error: string | null;
  last_error_at: string | null;
  created_at: string;
  paid_at: string | null;
  generated_at: string | null;
  delivered_at: string | null;
}

export interface AssessmentRow {
  id: string;
  lead_id: string | null;
  email: string;
  url: string | null;
  scan_id: string | null;
  extraction_data: ExtractionData | Record<string, never>;
  questionnaire_data: QuestionnaireAnswers | Record<string, never>;
  scope_check_passed: boolean | null;
  scope_check_band: ConfidenceBand | null;
  scope_check_matched_keywords: string[];
  recommended_tier: Tier | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Common
// =============================================================================

export interface Result<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
