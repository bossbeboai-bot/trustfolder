import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customer-auth';
import { listMyOrders } from '@/lib/customer-data';
import {
  Card,
  EmptyState,
  PageHeader,
  formatDate,
  tierLabel,
} from '../primitives';
import DownloadButton from './DownloadButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Downloads — TrustFolder dashboard' };

export default async function DownloadsPage() {
  const session = getCustomerSession();
  if (!session) redirect('/login');

  const orders = await listMyOrders(session.customer_id);
  const delivered = orders.filter((o) => Boolean(o.delivered_at));

  if (delivered.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Downloads"
          title="Secure pack downloads."
          description="Re-issue a fresh 7-day signed link any time. Links are private to you and expire automatically."
        />
        <EmptyState
          title="No delivered packs yet"
          description="Once a paid order finishes generation and QA, your pack appears here with a fresh download link."
          primaryHref="/pricing"
          primaryLabel="See pricing"
          secondaryHref="/dashboard/orders"
          secondaryLabel="View orders"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Downloads"
        title="Secure pack downloads."
        description="Each link is valid for 7 days and is private to your account. Click ‘Refresh link’ any time to re-issue."
      />

      <div className="grid gap-5">
        {delivered.map((o) => (
          <Card key={o.id} className="!p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[16px] font-semibold text-[var(--tf-ink)]">
                  {tierLabel(o.tier)}
                </p>
                <p className="mt-1 text-[13px] text-[var(--tf-slate)]">{o.url}</p>
                <p className="mt-2 text-[12px] text-[var(--tf-slate-soft)]">
                  Delivered {formatDate(o.delivered_at)}
                </p>
              </div>
              <DownloadButton orderId={o.id} />
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-12 text-[12px] leading-[1.6] text-[var(--tf-slate-soft)]">
        Signed links are valid for 7 days. If a link expires before you finish reviewing, click
        ‘Refresh link’ to issue a fresh one. You can re-issue as often as you need.
      </p>
    </>
  );
}
