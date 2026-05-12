import { listOrders } from '@/lib/admin-data';
import {
  AdminPageHeader,
  AdminTHead,
  AdminTableShell,
  EmptyState,
  StatusBadge,
  formatDate,
  truncate,
} from '../AdminTable';

export const dynamic = 'force-dynamic';

const PAYMENT_TONE: Record<string, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = {
  pending: 'warn',
  completed: 'good',
  failed: 'bad',
  refunded: 'bad',
};

const STATUS_TONE: Record<string, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = {
  payment_pending: 'warn',
  payment_completed: 'info',
  generation_started: 'info',
  qa_started: 'info',
  qa_passed: 'info',
  package_created: 'info',
  delivered: 'good',
  failed_needs_retry: 'bad',
  out_of_scope: 'bad',
};

function formatAmount(cents: number, currency: string): string {
  const amount = (cents / 100).toFixed(2);
  return `${currency.toUpperCase()} ${amount}`;
}

export default async function AdminOrdersPage() {
  const rows = await listOrders({ limit: 200 });

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        subtitle="Paid orders, latest first. PayPal capture / payment status are read directly from `orders`."
        count={rows.length}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="Orders appear once an assessment converts and PayPal create-order is called."
        />
      ) : (
        <AdminTableShell>
          <AdminTHead
            headers={[
              'Created',
              'Order id',
              'Email',
              'Tier',
              'Payment',
              'Order status',
              'Amount',
              'Website',
              'Delivered',
            ]}
          />
          <tbody className="divide-y divide-[var(--tf-border)]">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--tf-slate)]">
                  {formatDate(r.created_at)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--tf-ink-soft)]">
                  {r.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--tf-ink-soft)]">{r.email}</td>
                <td className="px-4 py-3 text-xs text-[var(--tf-ink-soft)]">{r.tier}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={r.payment_status}
                    tone={PAYMENT_TONE[r.payment_status] ?? 'neutral'}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={r.status} tone={STATUS_TONE[r.status] ?? 'neutral'} />
                </td>
                <td className="px-4 py-3 text-xs text-[var(--tf-ink-soft)]">
                  {formatAmount(r.amount_cents, r.currency)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--tf-accent)] underline decoration-[var(--tf-border-strong)] underline-offset-2 hover:text-[var(--tf-ink)]"
                    >
                      {truncate(r.url.replace(/^https?:\/\//, ''), 26)}
                    </a>
                  ) : (
                    <span className="text-[var(--tf-slate-soft)]">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--tf-slate)]">
                  {r.delivered_at ? (
                    formatDate(r.delivered_at)
                  ) : r.status === 'failed_needs_retry' ? (
                    <span className="text-[#7a1f1f]">failed</span>
                  ) : (
                    <span className="text-[var(--tf-slate-soft)]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableShell>
      )}
    </div>
  );
}
