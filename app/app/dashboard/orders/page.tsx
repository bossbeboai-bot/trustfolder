import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customer-auth';
import { buildOrderTimeline, listMyOrders } from '@/lib/customer-data';
import { StatusTimeline } from '../StatusTimeline';
import {
  Card,
  EmptyState,
  PageHeader,
  StatusPill,
  formatAmount,
  formatDate,
  orderStatusLabel,
  orderStatusTone,
  tierLabel,
} from '../primitives';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Orders — TrustFolder dashboard' };

export default async function OrdersPage() {
  const session = getCustomerSession();
  if (!session) redirect('/login');
  const rows = await listMyOrders(session.customer_id);

  if (rows.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Orders"
          title="Your paid orders."
          description="Every paid pack appears here with its payment and delivery status."
        />
        <EmptyState
          title="No orders yet"
          description="Once you complete a paid order, it shows up here with the live status of preparation, QA, and delivery."
          primaryHref="/pricing"
          primaryLabel="See pricing"
          secondaryHref="/request"
          secondaryLabel="Request a pack"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Orders"
        title="Your paid orders."
        description="Every paid pack with its payment and delivery status. Click an order to open the matching pack."
      />

      <div className="grid gap-5">
        {rows.map((o) => (
          <Card key={o.id} className="!p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[16px] font-semibold text-[var(--tf-ink)]">
                  {tierLabel(o.tier)}
                </p>
                <p className="mt-1 text-[13px] text-[var(--tf-slate)]">{o.url}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-[var(--tf-slate-soft)]">
                  <span className="text-[var(--tf-ink-soft)]">
                    {formatAmount(o.amount_cents, o.currency)}
                  </span>
                  <span>·</span>
                  <span>Created {formatDate(o.created_at)}</span>
                  {o.paid_at && (
                    <>
                      <span>·</span>
                      <span>Paid {formatDate(o.paid_at)}</span>
                    </>
                  )}
                  {o.delivered_at && (
                    <>
                      <span>·</span>
                      <span>Delivered {formatDate(o.delivered_at)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-shrink-0 flex-col items-start gap-2 sm:items-end">
                <StatusPill
                  label={orderStatusLabel(o.status)}
                  tone={orderStatusTone(o.status, o.payment_status)}
                />
                <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--tf-slate-soft)]">
                  Payment: {paymentStatusLabel(o.payment_status)}
                </span>
                {(o.payment_status === 'failed' || o.payment_status === 'refunded') && (
                  <a
                    href="/contact"
                    className="text-[12px] font-medium text-[var(--tf-accent)] underline decoration-[var(--tf-border-strong)] underline-offset-4"
                  >
                    Contact support
                  </a>
                )}
              </div>
            </div>
            <div className="mt-6 border-t border-[var(--tf-border)]/60 pt-4">
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
                Status timeline
              </p>
              <StatusTimeline
                steps={buildOrderTimeline({
                  status: o.status,
                  payment_status: o.payment_status,
                })}
              />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function paymentStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Secure PayPal checkout pending';
    case 'completed':
      return 'Payment confirmed';
    case 'failed':
      return 'Payment failed';
    case 'refunded':
      return 'Payment refunded';
    default:
      return status.replaceAll('_', ' ');
  }
}
