/**
 * POST /api/paypal/capture
 *
 * Manual capture endpoint — used as a backup to the webhook for environments
 * where webhooks aren't reachable (e.g., local dev). The webhook handler is
 * the canonical authoritative path; this endpoint short-circuits to the
 * same logic.
 *
 * Inputs:  { order_id }   (our internal order id)
 * Returns: { status: 'completed' | 'pending' | 'failed' }
 *
 * NOTE: This endpoint MUST be idempotent — calling it twice on the same
 * order should not cause double generation. The pipeline is invoked only
 * if the order has just transitioned to payment_completed.
 */

import { NextResponse } from 'next/server';
import {
  capturePaypalOrder,
  service,
  transition,
  runPipeline,
  sendOrderConfirmation,
  tierLabel,
} from '@trustfolder/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CaptureRequest {
  order_id: string;
}

export async function POST(req: Request) {
  let body: CaptureRequest;
  try {
    body = (await req.json()) as CaptureRequest;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.order_id) {
    return NextResponse.json({ error: 'missing_order_id' }, { status: 400 });
  }

  const sb = service();

  const { data: order, error: oErr } = await sb
    .from('orders')
    .select('id, email, tier, amount_cents, currency, paypal_order_id, status, payment_status')
    .eq('id', body.order_id)
    .single();
  if (oErr || !order) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }
  if (!order.paypal_order_id) {
    return NextResponse.json({ error: 'no_paypal_order_id_yet' }, { status: 400 });
  }

  // Idempotency: if the order is already past payment_pending, do nothing.
  // If payment_status is completed but status is still payment_pending, repair
  // the lifecycle transition below so the customer is not stuck.
  if (order.payment_status === 'completed' && order.status !== 'payment_pending') {
    return NextResponse.json({ status: 'completed', already_captured: true });
  }

  const cap =
    order.payment_status === 'completed'
      ? null
      : await capturePaypalOrder(order.paypal_order_id);
  if (cap && (!cap.ok || !cap.data)) {
    return NextResponse.json(
      { error: 'paypal_capture_failed', detail: cap.error },
      { status: 502 },
    );
  }

  const captureResult = cap?.data ?? null;

  if (captureResult && captureResult.status !== 'completed') {
    return NextResponse.json({
      status: captureResult.status,
      message: 'capture_pending_or_failed_at_paypal',
    });
  }

  // Persist capture
  const paypalCaptureId = captureResult?.paypal_capture_id ?? null;
  if (paypalCaptureId) {
    await sb
      .from('orders')
      .update({
        paypal_capture_id: paypalCaptureId,
        payment_status: 'completed',
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id);
  }

  // Transition: payment_pending → payment_completed. Only the caller that
  // acquires this transition is allowed to send confirmation or start generation.
  const moved = await transition({
    order_id: order.id,
    to: 'payment_completed',
    actor: 'api.paypal.capture',
    metadata: { paypal_capture_id: paypalCaptureId, repaired: !cap },
    expected_from: 'payment_pending',
  });

  // Send order-confirmation email. Await it so serverless runtimes do not
  // freeze the send after returning the response.
  if (moved.ok) {
    const confirmation = await sendOrderConfirmation({
      order_id: order.id,
      to_email: order.email,
      tier_label: tierLabel(order.tier),
      amount_cents: order.amount_cents,
      currency: order.currency,
    });
    if (!confirmation.ok) {
      console.error('[capture] sendOrderConfirmation failed', confirmation.error);
    }
  }

  // Run the delivery pipeline in-request. Vercel can freeze fire-and-forget
  // work after the response, leaving paid orders stuck in payment_completed.
  let pipelineOk: boolean | null = null;
  if (moved.ok) {
    const pipeline = await runPipeline({ order_id: order.id });
    pipelineOk = pipeline.ok;
    if (!pipeline.ok) {
      console.error('[capture] pipeline failed', pipeline.error);
    }
  }

  return NextResponse.json({
    status: 'completed',
    already_processed: !moved.ok,
    pipeline_ok: pipelineOk,
  });
}
