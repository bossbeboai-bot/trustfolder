/**
 * /checkout/return?order=<our_order_id>&token=<paypal_order_id>
 *
 * Customer lands here after approving on PayPal. We trigger capture (idempotent
 * with the webhook) and redirect to the success page.
 *
 * Server component on purpose — captures happen server-side without exposing
 * the order id to the client until we're ready.
 */

import { redirect } from 'next/navigation';
import { capturePaypalOrder, service, transition, runPipeline, sendOrderConfirmation, tierLabel } from '@trustfolder/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SearchParams {
  order?: string;
  token?: string;
}

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const orderId = searchParams.order;
  if (!orderId) {
    redirect('/');
  }

  const sb = service();
  const { data: order } = await sb
    .from('orders')
    .select('id, email, tier, amount_cents, currency, paypal_order_id, payment_status')
    .eq('id', orderId!)
    .single();

  if (!order) {
    redirect('/');
  }

  // If webhook already processed, jump straight to success
  if (order!.payment_status === 'completed') {
    redirect(`/success/${orderId}`);
  }

  if (order!.paypal_order_id) {
    const cap = await capturePaypalOrder(order!.paypal_order_id);
    if (cap.ok && cap.data && cap.data.status === 'completed') {
      await sb
        .from('orders')
        .update({
          paypal_capture_id: cap.data.paypal_capture_id,
          payment_status: 'completed',
          paid_at: new Date().toISOString(),
        })
        .eq('id', order!.id);

      const moved = await transition({
        order_id: order!.id,
        to: 'payment_completed',
        actor: 'checkout.return',
        metadata: { paypal_capture_id: cap.data.paypal_capture_id },
        expected_from: 'payment_pending',
      });

      if (moved.ok) {
        void sendOrderConfirmation({
          order_id: order!.id,
          to_email: order!.email,
          tier_label: tierLabel(order!.tier),
          amount_cents: order!.amount_cents,
          currency: order!.currency,
        });
      }

      if (moved.ok) {
        void runPipeline({ order_id: order!.id }).catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[checkout.return] pipeline failed', err);
        });
      }
    }
  }

  redirect(`/success/${orderId}`);
}
