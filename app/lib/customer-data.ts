/**
 * Customer data layer — Phase 5 / Batch 1.
 *
 * Server-only helpers for the customer dashboard and the magic-link flow.
 * Every function uses the engine's service-role Supabase client (bypassing
 * RLS) and is responsible for scoping reads to the signed-in customer.
 *
 * Hard rules:
 *   - Never accept a `customer_id` from the client. Always read it from the
 *     verified `tf_customer` cookie via `customer-auth.ts`.
 *   - Never return admin-only fields to the customer (internal_note,
 *     last_error, retry_count, raw extraction_data, raw questionnaire_data,
 *     QA flags). The `*ForCustomer` view types below define what is safe.
 *   - "Known email" is defined as: appears in `requests.email`,
 *     `orders.email`, or `assessments.email`. The customer_profiles row may
 *     not exist yet — we only create one when an email is confirmed known.
 */

import { computeReadinessScore, service } from '@trustfolder/engine';
import type {
  ExtractionData,
  QuestionnaireAnswers,
  ConfidenceBand,
  ReadinessScore,
} from '@trustfolder/engine';
import { sha256Hex } from './customer-auth';

const KNOWN_EMAIL_TABLES = ['requests', 'orders', 'assessments'] as const;

// =============================================================================
// Profile + known-email gate
// =============================================================================

export interface CustomerProfile {
  id: string;
  email: string;
  display_name: string | null;
  company_name: string | null;
  website_url: string | null;
  notification_opt_in: boolean;
  created_at: string;
  last_login_at: string | null;
  status: 'active' | 'disabled';
}

/**
 * Returns true if the email appears in any of the three known-email tables.
 * Used as the gate before issuing a magic link.
 */
export async function isKnownEmail(email: string): Promise<boolean> {
  const sb = service();
  const lower = email.trim().toLowerCase();
  if (!lower) return false;

  for (const table of KNOWN_EMAIL_TABLES) {
    const { count, error } = await sb
      .from(table)
      .select('id', { count: 'exact', head: true })
      .ilike('email', lower)
      .limit(1);
    if (error) {
      // Log + continue — a single-table error should not falsely deny a real customer.
      // eslint-disable-next-line no-console
      console.error(`[customer-data] isKnownEmail/${table}`, error.message);
      continue;
    }
    if ((count ?? 0) > 0) return true;
  }
  return false;
}

/**
 * Get-or-create the customer_profiles row for a known email.
 *
 * Caller must have already verified that `email` is known (via `isKnownEmail`).
 * Idempotent on the email unique index.
 */
export async function ensureCustomerProfile(email: string): Promise<CustomerProfile | null> {
  const sb = service();
  const lower = email.trim().toLowerCase();
  if (!lower) return null;

  // Try to read first.
  const existing = await sb
    .from('customer_profiles')
    .select('*')
    .ilike('email', lower)
    .maybeSingle();
  if (existing.data) return existing.data as CustomerProfile;

  // Insert; rely on `email unique` to dedupe a race with another login.
  const inserted = await sb
    .from('customer_profiles')
    .insert({ email: lower })
    .select('*')
    .maybeSingle();
  if (inserted.data) return inserted.data as CustomerProfile;

  // Lost a race — read again.
  const after = await sb
    .from('customer_profiles')
    .select('*')
    .ilike('email', lower)
    .maybeSingle();
  return (after.data as CustomerProfile | null) ?? null;
}

export async function getCustomerProfileById(id: string): Promise<CustomerProfile | null> {
  const sb = service();
  const r = await sb.from('customer_profiles').select('*').eq('id', id).maybeSingle();
  if (r.error) return null;
  return (r.data as CustomerProfile | null) ?? null;
}

export async function updateCustomerLastLogin(id: string): Promise<void> {
  const sb = service();
  await sb
    .from('customer_profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', id);
}

// =============================================================================
// Idempotent backfill — link existing rows to this customer on first login.
// =============================================================================

/**
 * Stamp `customer_id` onto every row in `requests`, `orders`, `assessments`
 * where the email matches the customer's email AND the customer_id is null.
 *
 * Safe to call repeatedly. Returns counts per table for logging.
 */
export async function backfillCustomerLinks(profile: CustomerProfile): Promise<{
  requests: number;
  orders: number;
  assessments: number;
}> {
  const sb = service();
  const counts = { requests: 0, orders: 0, assessments: 0 };

  for (const table of KNOWN_EMAIL_TABLES) {
    try {
      const r = await sb
        .from(table)
        .update({ customer_id: profile.id })
        .ilike('email', profile.email)
        .is('customer_id', null)
        .select('id');
      if (!r.error && Array.isArray(r.data)) {
        counts[table] = r.data.length;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[customer-data] backfillCustomerLinks/${table}`, err);
    }
  }
  return counts;
}

// =============================================================================
// Magic-link tokens — DB side
// =============================================================================

export async function persistLinkToken(input: {
  customer_id: string;
  token_hash: string;
  expires_at: Date;
  ip: string | null;
  user_agent: string | null;
}): Promise<void> {
  const sb = service();
  await sb.from('customer_link_tokens').insert({
    customer_id: input.customer_id,
    token_hash: input.token_hash,
    expires_at: input.expires_at.toISOString(),
    ip: input.ip,
    user_agent: input.user_agent,
  });
}

/**
 * Find an unused, unexpired token by raw value. Marks it `used_at = now()`
 * atomically (single update). Returns the customer_id on success, null otherwise.
 */
export async function consumeLinkToken(rawToken: string): Promise<string | null> {
  const sb = service();
  const tokenHash = sha256Hex(rawToken);
  const nowIso = new Date().toISOString();

  // Atomic: update the row only if not yet used and not yet expired.
  const r = await sb
    .from('customer_link_tokens')
    .update({ used_at: nowIso })
    .eq('token_hash', tokenHash)
    .is('used_at', null)
    .gt('expires_at', nowIso)
    .select('customer_id')
    .maybeSingle();

  if (r.error || !r.data) return null;
  return (r.data as { customer_id: string }).customer_id;
}

// =============================================================================
// Auth event log (audit)
// =============================================================================

export type CustomerAuthEventType =
  | 'link_sent'
  | 'link_unknown_email'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'profile_updated';

export async function logAuthEvent(input: {
  email: string;
  event_type: CustomerAuthEventType;
  customer_id?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const sb = service();
  try {
    await sb.from('customer_auth_events').insert({
      customer_id: input.customer_id ?? null,
      email: input.email.trim().toLowerCase(),
      event_type: input.event_type,
      ip: input.ip ?? null,
      user_agent: input.user_agent ?? null,
      metadata: input.metadata ?? {},
    });
  } catch (err) {
    // Best-effort. Do not break the request on audit-log insert failure.
    // eslint-disable-next-line no-console
    console.error('[customer-data] logAuthEvent', err);
  }
}

// =============================================================================
// Customer-scoped reads (used by /api/customer/* routes)
// =============================================================================

export interface CustomerRequestView {
  id: string;
  created_at: string;
  status: string;
  package_interest: string | null;
  website_url: string | null;
  company_name: string | null;
  message: string | null;
  source_page: string | null;
}

export async function listMyRequests(customerId: string, limit = 50): Promise<CustomerRequestView[]> {
  const sb = service();
  const r = await sb
    .from('requests')
    .select('id, created_at, status, package_interest, website_url, company_name, message, source_page')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (r.error || !r.data) return [];
  return r.data as CustomerRequestView[];
}

export interface CustomerOrderView {
  id: string;
  created_at: string;
  paid_at: string | null;
  delivered_at: string | null;
  tier: string;
  amount_cents: number;
  currency: string;
  payment_status: string;
  status: string;
  url: string;
}

export async function listMyOrders(customerId: string, limit = 50): Promise<CustomerOrderView[]> {
  const sb = service();
  const r = await sb
    .from('orders')
    .select(
      'id, created_at, paid_at, delivered_at, tier, amount_cents, currency, payment_status, status, url',
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (r.error || !r.data) return [];
  return r.data as CustomerOrderView[];
}

export interface CustomerPackView {
  id: string;
  order_id: string;
  template_id: string;
  confidence_band: string | null;
  created_at: string;
  generation_status: string;
  tier: string;
  url: string;
}

/**
 * Customer-visible packs view. Joins generated_packs to orders to filter by customer_id.
 * Only returns packs whose generation_status is 'ok' to avoid surfacing partial state.
 */
export async function listMyPacks(customerId: string, limit = 50): Promise<CustomerPackView[]> {
  const sb = service();
  // Two-step query keeps the SQL portable and matches the rest of the codebase.
  const orders = await sb
    .from('orders')
    .select('id, tier, url')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (orders.error || !orders.data || orders.data.length === 0) return [];

  const orderById = new Map<string, { tier: string; url: string }>();
  for (const o of orders.data as Array<{ id: string; tier: string; url: string }>) {
    orderById.set(o.id, { tier: o.tier, url: o.url });
  }

  const packs = await sb
    .from('generated_packs')
    .select('id, order_id, template_id, confidence_band, created_at, generation_status')
    .in('order_id', Array.from(orderById.keys()))
    .eq('generation_status', 'ok')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (packs.error || !packs.data) return [];

  return (packs.data as Array<{
    id: string;
    order_id: string;
    template_id: string;
    confidence_band: string | null;
    created_at: string;
    generation_status: string;
  }>).map((p) => {
    const o = orderById.get(p.order_id);
    return {
      id: p.id,
      order_id: p.order_id,
      template_id: p.template_id,
      confidence_band: p.confidence_band,
      created_at: p.created_at,
      generation_status: p.generation_status,
      tier: o?.tier ?? '',
      url: o?.url ?? '',
    };
  });
}

// =============================================================================
// Phase 8 — order timeline + readiness score for customer surfaces.
// =============================================================================

export interface OrderTimelineStep {
  key: string;
  label: string;
  state: 'done' | 'current' | 'upcoming' | 'failed';
}

const TIMELINE_ORDER = [
  { key: 'lead_created', label: 'Request received' },
  { key: 'scope_checked', label: 'Scope reviewed' },
  { key: 'payment_pending', label: 'Payment pending' },
  { key: 'payment_completed', label: 'Payment confirmed' },
  { key: 'generation_started', label: 'Preparing evidence folder' },
  { key: 'qa_started', label: 'QA checking' },
  { key: 'qa_passed', label: 'Pack ready' },
  { key: 'delivered', label: 'Download available' },
] as const;

const TIMELINE_INDEX: Record<string, number> = Object.fromEntries(
  TIMELINE_ORDER.map((s, i) => [s.key, i]),
);

export function buildOrderTimeline(input: {
  status: string;
  payment_status: string;
}): OrderTimelineStep[] {
  const status = input.status;
  // Treat package_created as the same column as qa_passed for display.
  const collapsed = status === 'package_created' ? 'qa_passed' : status;
  const isFailed = status === 'failed_needs_retry' || input.payment_status === 'failed';
  const currentIdx = TIMELINE_INDEX[collapsed] ?? -1;

  const base = TIMELINE_ORDER.map((s, i): OrderTimelineStep => {
    if (isFailed && i > 0 && i >= currentIdx) {
      return { key: s.key, label: s.label, state: i === currentIdx ? 'failed' : 'upcoming' };
    }
    if (currentIdx === -1) return { key: s.key, label: s.label, state: 'upcoming' };
    if (i < currentIdx) return { key: s.key, label: s.label, state: 'done' };
    if (i === currentIdx) return { key: s.key, label: s.label, state: 'current' };
    return { key: s.key, label: s.label, state: 'upcoming' };
  });

  if (isFailed) {
    base.push({ key: 'manual_review', label: 'Manual review needed', state: 'failed' });
  }
  return base;
}

export interface PackReadinessView extends ReadinessScore {
  order_id: string;
}

export async function getReadinessScoreForOrder(
  customerId: string,
  orderId: string,
): Promise<PackReadinessView | null> {
  const sb = service();
  const r = await sb
    .from('orders')
    .select(
      'id, customer_id, extraction_data, questionnaire_data, scope_check_passed, scope_check_band',
    )
    .eq('id', orderId)
    .maybeSingle();
  if (r.error || !r.data) return null;
  const row = r.data as {
    id: string;
    customer_id: string | null;
    extraction_data: ExtractionData | null;
    questionnaire_data: QuestionnaireAnswers | null;
    scope_check_passed: boolean | null;
    scope_check_band: ConfidenceBand | null;
  };
  if (row.customer_id !== customerId) return null;
  if (!row.extraction_data || !row.questionnaire_data) return null;

  const score = computeReadinessScore({
    extraction: row.extraction_data,
    answers: row.questionnaire_data,
    scope: row.scope_check_passed === null
      ? null
      : { in_scope: row.scope_check_passed, band: (row.scope_check_band ?? 'CLEAR') as ConfidenceBand },
  });
  return { ...score, order_id: row.id };
}

/**
 * Authorisation-aware lookup for a single order.
 * Returns null if the order does not belong to the given customer.
 */
export async function getMyOrder(customerId: string, orderId: string): Promise<CustomerOrderView | null> {
  const sb = service();
  const r = await sb
    .from('orders')
    .select(
      'id, created_at, paid_at, delivered_at, tier, amount_cents, currency, payment_status, status, url, customer_id',
    )
    .eq('id', orderId)
    .maybeSingle();
  if (r.error || !r.data) return null;
  if ((r.data as { customer_id: string | null }).customer_id !== customerId) return null;
  // Strip customer_id from the returned shape.
  const { customer_id: _omit, ...view } = r.data as CustomerOrderView & {
    customer_id: string | null;
  };
  return view;
}
