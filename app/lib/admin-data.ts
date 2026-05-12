/**
 * Admin data helpers — Phase 3.6 v1.
 *
 * Server-only. Every function here uses the engine `service()` Supabase
 * client (service-role bypass). They are imported by the protected admin
 * pages (server components) and by the `/api/admin/*` route handlers, so
 * the read logic exists in exactly one place.
 *
 * Hard rules:
 *   - Server-only. Never import from a client component.
 *   - Service-role key never leaves the engine module.
 *   - Functions return plain JSON-safe objects so they cross the RSC
 *     boundary cleanly.
 */

import { service } from '@trustfolder/engine';

// =============================================================================
// Types
// =============================================================================

export type AdminRequestStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'closed_lost';

export interface AdminRequestRow {
  id: string;
  email: string;
  website_url: string | null;
  company_name: string | null;
  package_interest: string | null;
  message: string | null;
  source_page: string | null;
  status: AdminRequestStatus;
  created_at: string;
  updated_at: string | null;
  internal_note: string | null;
  metadata: Record<string, unknown> | null;
}

export interface AdminAssessmentRow {
  id: string;
  created_at: string;
  email: string;
  url: string | null;
  scope_check_passed: boolean | null;
  scope_check_band: string | null;
  recommended_tier: string | null;
  extraction: {
    company_name?: string;
    product_description?: string;
    b2b_or_b2c?: string;
    confidence?: string;
  } | null;
  vertical: string | null;
  next_step: 'pay' | 'out_of_scope' | 'soft_out_review' | 'unknown';
}

export interface AdminOrderRow {
  id: string;
  created_at: string;
  email: string;
  url: string | null;
  tier: string;
  amount_cents: number;
  currency: string;
  payment_status: string;
  status: string;
  status_updated_at: string;
  delivered_at: string | null;
  retry_count: number;
  last_error: string | null;
  last_error_at: string | null;
}

export interface AdminFailureRow {
  id: string;
  created_at: string;
  email: string;
  tier: string;
  payment_status: string;
  status: string;
  status_updated_at: string;
  retry_count: number;
  last_error: string | null;
  last_error_at: string | null;
  failure_kind: 'pipeline' | 'payment' | 'refund';
  retry_needed: boolean;
}

export interface AdminOutOfScopeRow {
  id: string;
  created_at: string;
  email: string;
  url: string | null;
  vertical: string | null;
  band: string | null;
  reason: string;
  source: 'assessment';
}

export interface AdminSummary {
  total_requests: number;
  new_requests: number;
  paid_pack_interest: number;
  out_of_scope_leads: number;
  failed_jobs: number;
  orders_pending: number;
  delivered_packs: number;
  latest_requests: AdminRequestRow[];
}

// =============================================================================
// Internal helpers
// =============================================================================

const REQUEST_COLS =
  'id, email, website_url, company_name, package_interest, message, source_page, status, created_at, updated_at, internal_note, metadata';

const ORDER_COLS =
  'id, created_at, email, url, tier, amount_cents, currency, payment_status, status, status_updated_at, delivered_at, retry_count, last_error, last_error_at';

const ASSESSMENT_COLS =
  'id, created_at, email, url, scope_check_passed, scope_check_band, recommended_tier, extraction_data, questionnaire_data';

interface RawAssessment {
  id: string;
  created_at: string;
  email: string;
  url: string | null;
  scope_check_passed: boolean | null;
  scope_check_band: string | null;
  recommended_tier: string | null;
  extraction_data: Record<string, unknown> | null;
  questionnaire_data: Record<string, unknown> | null;
}

function toAssessmentRow(r: RawAssessment): AdminAssessmentRow {
  const ext = (r.extraction_data ?? {}) as {
    company_name?: string;
    product_description?: string;
    b2b_or_b2c?: string;
    confidence?: string;
  };
  const q = (r.questionnaire_data ?? {}) as { vertical?: string };
  let next_step: AdminAssessmentRow['next_step'] = 'unknown';
  if (r.scope_check_passed === false) next_step = 'out_of_scope';
  else if (r.scope_check_band === 'SOFT_OUT') next_step = 'soft_out_review';
  else if (r.scope_check_passed === true) next_step = 'pay';
  return {
    id: r.id,
    created_at: r.created_at,
    email: r.email,
    url: r.url,
    scope_check_passed: r.scope_check_passed,
    scope_check_band: r.scope_check_band,
    recommended_tier: r.recommended_tier,
    extraction: Object.keys(ext).length
      ? {
          company_name: ext.company_name,
          product_description: ext.product_description,
          b2b_or_b2c: ext.b2b_or_b2c,
          confidence: ext.confidence,
        }
      : null,
    vertical: q.vertical ?? null,
    next_step,
  };
}

// =============================================================================
// Public API
// =============================================================================

export async function getSummary(): Promise<AdminSummary> {
  const sb = service();

  const [
    requestsTotal,
    requestsNew,
    requestsPaidInterest,
    failedOrders,
    pendingOrders,
    deliveredOrders,
    outOfScopeAssessments,
    latest,
  ] = await Promise.all([
    sb.from('requests').select('id', { count: 'exact', head: true }),
    sb
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new'),
    sb
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .in('package_interest', [
        'snapshot',
        'disclosure',
        'governance',
        'premium',
        'agency',
        'soc2-readiness',
        'security-questionnaire',
        'gdpr-ai-data-readiness',
        'dpa-privacy-handoff',
        'iso42001-readiness',
        'hipaa-healthcare-intake',
        'medical-ai-intake',
        'employment-ai-intake',
        'financial-credit-insurance-intake',
        'childrens-products-intake',
        'biometrics-intake',
        'law-enforcement-critical-infrastructure-intake',
        // legacy alias still in flight from older inbound links
        'pack',
      ]),
    sb
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'failed_needs_retry'),
    sb
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', [
        'payment_pending',
        'payment_completed',
        'generation_started',
        'qa_started',
        'qa_passed',
        'package_created',
      ]),
    sb
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'delivered'),
    sb
      .from('assessments')
      .select('id', { count: 'exact', head: true })
      .eq('scope_check_passed', false),
    sb
      .from('requests')
      .select(REQUEST_COLS)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  return {
    total_requests: requestsTotal.count ?? 0,
    new_requests: requestsNew.count ?? 0,
    paid_pack_interest: requestsPaidInterest.count ?? 0,
    out_of_scope_leads: outOfScopeAssessments.count ?? 0,
    failed_jobs: failedOrders.count ?? 0,
    orders_pending: pendingOrders.count ?? 0,
    delivered_packs: deliveredOrders.count ?? 0,
    latest_requests: ((latest.data ?? []) as AdminRequestRow[]) ?? [],
  };
}

export async function listRequests(options?: {
  status?: AdminRequestStatus;
  limit?: number;
}): Promise<AdminRequestRow[]> {
  const sb = service();
  let q = sb
    .from('requests')
    .select(REQUEST_COLS)
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 200);

  if (options?.status) q = q.eq('status', options.status);

  const { data, error } = await q;
  if (error || !data) return [];
  return data as AdminRequestRow[];
}

export async function getRequest(id: string): Promise<AdminRequestRow | null> {
  const sb = service();
  const { data, error } = await sb
    .from('requests')
    .select(REQUEST_COLS)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as AdminRequestRow;
}

export async function updateRequest(
  id: string,
  patch: { status?: AdminRequestStatus; internal_note?: string | null },
): Promise<{ ok: true; data: AdminRequestRow } | { ok: false; error: string }> {
  const sb = service();
  const update: Record<string, unknown> = {};
  if (patch.status) update.status = patch.status;
  if ('internal_note' in patch) update.internal_note = patch.internal_note ?? null;
  if (Object.keys(update).length === 0) {
    return { ok: false, error: 'no_changes' };
  }

  const { data, error } = await sb
    .from('requests')
    .update(update)
    .eq('id', id)
    .select(REQUEST_COLS)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'update_failed' };
  }
  return { ok: true, data: data as AdminRequestRow };
}

export async function listAssessments(options?: {
  limit?: number;
}): Promise<AdminAssessmentRow[]> {
  const sb = service();
  const { data, error } = await sb
    .from('assessments')
    .select(ASSESSMENT_COLS)
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 200);
  if (error || !data) return [];
  return (data as RawAssessment[]).map(toAssessmentRow);
}

export async function listOrders(options?: { limit?: number }): Promise<AdminOrderRow[]> {
  const sb = service();
  const { data, error } = await sb
    .from('orders')
    .select(ORDER_COLS)
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 200);
  if (error || !data) return [];
  return data as AdminOrderRow[];
}

export async function listFailures(options?: { limit?: number }): Promise<AdminFailureRow[]> {
  const sb = service();
  const limit = options?.limit ?? 200;

  const [pipelineFailures, paymentFailures] = await Promise.all([
    sb
      .from('orders')
      .select(ORDER_COLS)
      .eq('status', 'failed_needs_retry')
      .order('status_updated_at', { ascending: false })
      .limit(limit),
    sb
      .from('orders')
      .select(ORDER_COLS)
      .in('payment_status', ['failed', 'refunded'])
      .order('status_updated_at', { ascending: false })
      .limit(limit),
  ]);

  const out: AdminFailureRow[] = [];
  const seen = new Set<string>();

  function push(rows: AdminOrderRow[] | null, kind: AdminFailureRow['failure_kind']) {
    if (!rows) return;
    for (const r of rows) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push({
        id: r.id,
        created_at: r.created_at,
        email: r.email,
        tier: r.tier,
        payment_status: r.payment_status,
        status: r.status,
        status_updated_at: r.status_updated_at,
        retry_count: r.retry_count,
        last_error: r.last_error,
        last_error_at: r.last_error_at,
        failure_kind: kind,
        retry_needed: kind === 'pipeline',
      });
    }
  }

  push((pipelineFailures.data ?? []) as AdminOrderRow[], 'pipeline');
  push(
    (paymentFailures.data ?? []).map((r): AdminOrderRow => r as AdminOrderRow),
    'payment',
  );

  out.sort((a, b) => (a.status_updated_at < b.status_updated_at ? 1 : -1));
  return out.slice(0, limit);
}

export async function listOutOfScope(options?: {
  limit?: number;
}): Promise<AdminOutOfScopeRow[]> {
  const sb = service();
  const { data, error } = await sb
    .from('assessments')
    .select(ASSESSMENT_COLS)
    .or('scope_check_passed.eq.false,scope_check_band.in.(SOFT_OUT,HARD_OUT)')
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 200);

  if (error || !data) return [];

  return (data as RawAssessment[]).map((r) => {
    const q = (r.questionnaire_data ?? {}) as { vertical?: string };
    const reason =
      r.scope_check_passed === false
        ? 'hard_out'
        : r.scope_check_band === 'HARD_OUT'
          ? 'hard_out_band'
          : r.scope_check_band === 'SOFT_OUT'
            ? 'soft_out_band'
            : 'unknown';
    return {
      id: r.id,
      created_at: r.created_at,
      email: r.email,
      url: r.url,
      vertical: q.vertical ?? null,
      band: r.scope_check_band ?? null,
      reason,
      source: 'assessment' as const,
    };
  });
}
