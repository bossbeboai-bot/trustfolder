/**
 * GET /api/status/[orderId]
 *
 * Lightweight status endpoint. The frontend success page polls this to
 * show progress messages: "Generating documents", "Quality-checking",
 * "Sending your pack", etc. We never block the user, but give them
 * reassuring real-time feedback.
 *
 * Returns 404 (not 500) for unknown orders so the SPA can show a clean
 * "we couldn't find that order" without a stack trace.
 */

import { NextResponse } from 'next/server';
import { service, STATUS_LABELS } from '@trustfolder/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  context: { params: { orderId: string } },
) {
  const { orderId } = context.params;
  if (!orderId) {
    return NextResponse.json({ error: 'missing_order_id' }, { status: 400 });
  }

  const sb = service();

  const { data: order, error } = await sb
    .from('orders')
    .select(
      'id, status, tier, payment_status, retry_count, last_error_at, delivered_at, signed_url_expires_at',
    )
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }

  // For privacy, don't return the signed URL via this endpoint — that goes
  // only via email. Frontend just shows status messages.
  return NextResponse.json({
    id: order.id,
    status: order.status,
    status_label: STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] ?? order.status,
    tier: order.tier,
    payment_status: order.payment_status,
    retry_count: order.retry_count,
    delivered: order.status === 'delivered',
    delivered_at: order.delivered_at,
    is_failed: order.status === 'failed_needs_retry',
    is_out_of_scope: order.status === 'out_of_scope',
  });
}
