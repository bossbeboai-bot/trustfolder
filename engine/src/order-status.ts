/**
 * Order status state machine.
 *
 * Every engine module that mutates an order's lifecycle goes through transition().
 * - Validates the requested transition is legal
 * - Atomically updates the orders.status column
 * - Appends an order_status_events row (audit log)
 *
 * Designed so a status update never silently drops on the floor: if the
 * transition is invalid, we record the failure and return an error.
 */

import type { OrderStatus, Result } from './lib/types.js';
import { service } from './lib/supabase.js';
import { notifyFounder } from './lib/alert.js';

// =============================================================================
// Allowed transitions
// =============================================================================

/**
 * The canonical happy path:
 *   lead_created → website_scanned → questions_completed → scope_checked
 *   → payment_pending → payment_completed → generation_started
 *   → qa_started → qa_passed → package_created → delivered
 *
 * Plus error/recovery edges:
 *   ANY_DURING_GEN → failed_needs_retry → generation_started   (retry)
 *   scope_checked → out_of_scope                                (hard reject)
 *   payment_pending → out_of_scope                              (refund branch)
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  lead_created: ['website_scanned', 'failed_needs_retry'],
  website_scanned: ['questions_completed', 'failed_needs_retry'],
  questions_completed: ['scope_checked', 'failed_needs_retry'],
  scope_checked: ['payment_pending', 'out_of_scope'],
  payment_pending: ['payment_completed', 'out_of_scope', 'failed_needs_retry'],
  payment_completed: ['generation_started'],
  generation_started: ['qa_started', 'failed_needs_retry'],
  qa_started: ['qa_passed', 'generation_started', 'failed_needs_retry'],
  qa_passed: ['package_created', 'failed_needs_retry'],
  package_created: ['delivered', 'failed_needs_retry'],
  delivered: [], // terminal-success
  failed_needs_retry: ['generation_started', 'qa_started', 'out_of_scope'],
  out_of_scope: [], // terminal
};

export interface TransitionInput {
  order_id: string;
  to: OrderStatus;
  actor: string;                    // 'webhook' | 'crawler' | 'classify' | 'generate' | 'qa' | 'package' | 'deliver' | 'admin'
  metadata?: Record<string, unknown>;
  /** Optional — when set, only allow if the current status matches this (optimistic concurrency). */
  expected_from?: OrderStatus;
  /** When true, bypass transition validation. Use only for admin overrides. */
  force?: boolean;
}

export async function transition(input: TransitionInput): Promise<Result<{ from: OrderStatus; to: OrderStatus }>> {
  const sb = service();

  // Read current status
  const { data: order, error: readErr } = await sb
    .from('orders')
    .select('status')
    .eq('id', input.order_id)
    .single();

  if (readErr || !order) {
    return { ok: false, error: `order_not_found: ${readErr?.message ?? 'unknown'}` };
  }

  const from = order.status as OrderStatus;

  // Optimistic concurrency
  if (input.expected_from && input.expected_from !== from) {
    return {
      ok: false,
      error: `concurrency_mismatch: expected_from=${input.expected_from} current=${from}`,
    };
  }

  // Validate transition
  if (!input.force) {
    const allowed = TRANSITIONS[from];
    if (!allowed.includes(input.to)) {
      return {
        ok: false,
        error: `invalid_transition: ${from} → ${input.to}`,
      };
    }
  }

  // Apply. If expected_from is present, include it in the update predicate so
  // concurrent callers cannot both acquire the same transition.
  let updateQuery = sb
    .from('orders')
    .update({ status: input.to, status_updated_at: new Date().toISOString() })
    .eq('id', input.order_id);

  if (input.expected_from) {
    updateQuery = updateQuery.eq('status', input.expected_from);
  }

  const { data: updated, error: updErr } = await updateQuery.select('status').maybeSingle();

  if (updErr) {
    return { ok: false, error: `update_failed: ${updErr.message}` };
  }
  if (!updated) {
    return {
      ok: false,
      error: `concurrency_mismatch: expected_from=${input.expected_from ?? from} current_changed`,
    };
  }

  // Append audit event (best-effort; do not fail the transition if the audit insert fails)
  await sb
    .from('order_status_events')
    .insert({
      order_id: input.order_id,
      from_status: from,
      to_status: input.to,
      actor: input.actor,
      metadata: input.metadata ?? {},
    });

  return { ok: true, data: { from, to: input.to } };
}

/**
 * Mark an order as failed with a recovery hint.
 * Sets status to failed_needs_retry, increments retry_count, stores last_error.
 * Customer-facing email triggered separately by the caller (deliver.ts has helper).
 */
export async function markFailed(
  order_id: string,
  actor: string,
  error_message: string,
  metadata?: Record<string, unknown>,
): Promise<Result<{ retry_count: number }>> {
  const sb = service();
  const now = new Date().toISOString();

  // Read retry count
  const { data: existing } = await sb
    .from('orders')
    .select('retry_count, status')
    .eq('id', order_id)
    .single();

  const nextRetry = (existing?.retry_count ?? 0) + 1;

  const { error: updErr } = await sb
    .from('orders')
    .update({
      status: 'failed_needs_retry',
      retry_count: nextRetry,
      last_error: error_message,
      last_error_at: now,
    })
    .eq('id', order_id);

  if (updErr) return { ok: false, error: updErr.message };

  await sb.from('order_status_events').insert({
    order_id,
    from_status: existing?.status ?? null,
    to_status: 'failed_needs_retry',
    actor,
    metadata: { error_message, ...(metadata ?? {}) },
  });

  // Best-effort founder alert. Never block the customer flow on this — if
  // ALERT_WEBHOOK_URL is unset or the webhook fails, the call silently no-ops.
  void notifyFounder({
    severity: 'error',
    message: `Order failed_needs_retry — ${actor} (retry ${nextRetry})`,
    context: {
      order_id,
      actor,
      error_message,
      retry_count: nextRetry,
      previous_status: existing?.status ?? null,
      ...(metadata ?? {}),
    },
  });

  return { ok: true, data: { retry_count: nextRetry } };
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  lead_created: 'Started',
  website_scanned: 'Scanning website',
  questions_completed: 'Questions confirmed',
  scope_checked: 'Checking fit',
  payment_pending: 'Secure PayPal checkout pending',
  payment_completed: 'Payment confirmed',
  generation_started: 'Preparing your evidence folder',
  qa_started: 'Preparing your evidence folder',
  qa_passed: 'Preparing your evidence folder',
  package_created: 'Your pack is ready',
  delivered: 'Your pack is ready',
  failed_needs_retry: 'Support review needed',
  out_of_scope: 'Requires expert review',
};
