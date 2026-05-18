/**
 * POST /api/paypal/webhook
 *
 * The CANONICAL trigger for the post-payment pipeline.
 *
 * - Verifies signature against the PayPal webhook ID.
 * - Handles PAYMENT.CAPTURE.COMPLETED → transitions order to payment_completed,
 *   triggers the async pipeline.
 * - Idempotent: dedupes by paypal_capture_id; replayed events are no-ops.
 *
 * Returns 200 quickly, before the pipeline finishes — PayPal demands fast acks.
 */

import { NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  service,
  transition,
  runPipeline,
  sendOrderConfirmation,
  sendPaymentFailed,
  notifyFounder,
  tierLabel,
} from '@trustfolder/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // 1. Read raw body (needed for signature verification)
  const raw = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });

  // 2. Verify
  const verify = await verifyWebhookSignature({ headers, raw_body: raw });
  if (!verify.ok || !verify.data || !verify.data.verified) {
    return NextResponse.json(
      { error: 'webhook_verification_failed', detail: verify.error },
      { status: 401 },
    );
  }

  const event = verify.data.event;

  // 3. Filter event types we care about
  const interestingTypes = new Set([
    'CHECKOUT.ORDER.APPROVED',
    'PAYMENT.CAPTURE.COMPLETED',
    'PAYMENT.CAPTURE.DENIED',
    'PAYMENT.CAPTURE.REFUNDED',
    'PAYMENT.CAPTURE.REVERSED',
  ]);
  if (!interestingTypes.has(event.event_type)) {
    return NextResponse.json({ ok: true, ignored: event.event_type });
  }

  const sb = service();

  // 4. Locate our internal order
  const resource = event.resource as Record<string, unknown>;
  const customId = (resource['custom_id'] as string) ?? extractCustomIdFromCapture(resource);
  const captureId = (resource['id'] as string) ?? null;

  if (!customId) {
    return NextResponse.json(
      { ok: true, warning: 'no_custom_id_in_event' },
      { status: 200 },
    );
  }

  let orderQuery = sb
    .from('orders')
    .select(
      'id, email, tier, amount_cents, currency, paypal_capture_id, payment_status, status',
    );
  orderQuery = isUuid(customId)
    ? orderQuery.eq('id', customId)
    : orderQuery.eq('paypal_order_id', customId);
  const { data: order, error: oErr } = await orderQuery.single();

  if (oErr || !order) {
    return NextResponse.json(
      { ok: true, warning: `order_not_found_for_${customId}` },
      { status: 200 },
    );
  }

  // 5. Handle by event type (idempotent)
  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    if (order.payment_status === 'completed') {
      return NextResponse.json({ ok: true, status: 'already_processed' });
    }

    await sb
      .from('orders')
      .update({
        paypal_capture_id: captureId,
        payment_status: 'completed',
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    const moved = await transition({
      order_id: order.id,
      to: 'payment_completed',
      actor: 'webhook',
      metadata: { paypal_capture_id: captureId, event_id: event.id },
      expected_from: 'payment_pending',
    });

    if (moved.ok) {
      const confirmation = await sendOrderConfirmation({
        order_id: order.id,
        to_email: order.email,
        tier_label: tierLabel(order.tier),
        amount_cents: order.amount_cents,
        currency: order.currency,
      });
      if (!confirmation.ok) {
        console.error('[webhook] sendOrderConfirmation failed', confirmation.error);
      }
    }

    // Run the delivery pipeline in-request. Vercel can freeze fire-and-forget
    // work after the response, leaving paid orders stuck in payment_completed.
    let pipelineOk: boolean | null = null;
    if (moved.ok) {
      const pipeline = await runPipeline({ order_id: order.id });
      pipelineOk = pipeline.ok;
      if (!pipeline.ok) {
        console.error('[webhook] pipeline failed', pipeline.error);
      }
    }

    return NextResponse.json({
      ok: true,
      status: moved.ok ? 'capture_recorded' : 'already_processed',
      pipeline_ok: pipelineOk,
    });
  }

  if (event.event_type === 'PAYMENT.CAPTURE.DENIED') {
    await sb
      .from('orders')
      .update({ payment_status: 'failed' })
      .eq('id', order.id);

    // If we are still in payment_pending, move to a safe failed state so the
    // /success/[orderId] page does not show "Awaiting payment" forever.
    // order_status_t lacks a dedicated `payment_failed` value (see
    // `docs/24-implementation-gap-audit.md` §4.7). The closest legal
    // transition from payment_pending is failed_needs_retry, which is what
    // we use here. /success/[orderId] reads payment_status alongside status
    // and shows the correct copy when payment_status === 'failed'.
    if (order.status === 'payment_pending') {
      await transition({
        order_id: order.id,
        to: 'failed_needs_retry',
        actor: 'webhook.payment_denied',
        metadata: { event_id: event.id, capture_id: captureId },
      });
    } else {
      // Past payment_completed (e.g. delivered): record an audit row but do
      // not change order.status (we cannot retroactively undelete a pack).
      await sb.from('order_status_events').insert({
        order_id: order.id,
        from_status: order.status,
        to_status: order.status,
        actor: 'webhook.payment_denied',
        metadata: { event_id: event.id, capture_id: captureId },
      });
    }

    const failedEmail = await sendPaymentFailed({
      order_id: order.id,
      to_email: order.email,
      reason: 'denied',
      tier_label: tierLabel(order.tier),
    });
    if (!failedEmail.ok) {
      console.error('[webhook] sendPaymentFailed failed', failedEmail.error);
    }
    await notifyFounder({
      severity: 'warn',
      message: `PayPal capture denied for order ${order.id}`,
      context: {
        order_id: order.id,
        email: order.email,
        tier: order.tier,
        amount_cents: order.amount_cents,
        previous_status: order.status,
        event_id: event.id,
      },
    });

    return NextResponse.json({ ok: true, status: 'capture_denied' });
  }

  if (
    event.event_type === 'PAYMENT.CAPTURE.REFUNDED' ||
    event.event_type === 'PAYMENT.CAPTURE.REVERSED'
  ) {
    const isRefunded = event.event_type === 'PAYMENT.CAPTURE.REFUNDED';
    await sb
      .from('orders')
      .update({ payment_status: 'refunded' })
      .eq('id', order.id);

    // Record an audit row regardless of current status. We do NOT change
    // order.status when the order is past payment_pending — the customer may
    // have already received their pack and we cannot retroactively undelete.
    if (order.status === 'payment_pending') {
      await transition({
        order_id: order.id,
        to: 'failed_needs_retry',
        actor: isRefunded ? 'webhook.payment_refunded' : 'webhook.payment_reversed',
        metadata: { event_id: event.id, capture_id: captureId },
      });
    } else {
      await sb.from('order_status_events').insert({
        order_id: order.id,
        from_status: order.status,
        to_status: order.status,
        actor: isRefunded ? 'webhook.payment_refunded' : 'webhook.payment_reversed',
        metadata: { event_id: event.id, capture_id: captureId },
      });
    }

    const failedEmail = await sendPaymentFailed({
      order_id: order.id,
      to_email: order.email,
      reason: isRefunded ? 'refunded' : 'reversed',
      tier_label: tierLabel(order.tier),
    });
    if (!failedEmail.ok) {
      console.error('[webhook] sendPaymentFailed failed', failedEmail.error);
    }
    await notifyFounder({
      severity: isRefunded ? 'info' : 'warn',
      message: `PayPal capture ${isRefunded ? 'refunded' : 'reversed'} for order ${order.id}`,
      context: {
        order_id: order.id,
        email: order.email,
        tier: order.tier,
        amount_cents: order.amount_cents,
        previous_status: order.status,
        event_id: event.id,
      },
    });

    return NextResponse.json({ ok: true, status: 'capture_refunded' });
  }

  return NextResponse.json({ ok: true });
}

/**
 * For PAYMENT.CAPTURE.* events, the custom_id is sometimes nested under
 * supplementary_data.related_ids or links. We try a few common locations.
 */
function extractCustomIdFromCapture(resource: Record<string, unknown>): string | undefined {
  const direct = resource['custom_id'];
  if (typeof direct === 'string') return direct;
  // Some payloads include it under supplementary_data
  const supp = resource['supplementary_data'] as Record<string, unknown> | undefined;
  const rel = supp?.['related_ids'] as Record<string, unknown> | undefined;
  if (rel && typeof rel['order_id'] === 'string') return rel['order_id'] as string;
  return undefined;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
