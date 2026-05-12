import { listFailures } from '@/lib/admin-data';
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

const KIND_TONE: Record<string, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = {
  pipeline: 'bad',
  payment: 'warn',
  refund: 'warn',
};

export default async function AdminFailuresPage() {
  const rows = await listFailures({ limit: 200 });

  return (
    <div>
      <AdminPageHeader
        title="Failures"
        subtitle="Orders that need founder follow-up: failed pipeline runs and failed/refunded payments."
        count={rows.length}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No failures right now"
          body="failed_needs_retry, payment_status=failed, and payment_status=refunded all show up here."
        />
      ) : (
        <>
          <p className="mb-4 text-xs text-[var(--tf-slate-soft)]">
            v1: retry buttons are not wired in this view. Manual follow-up required for each row.
          </p>
          <AdminTableShell>
            <AdminTHead
              headers={[
                'Created',
                'Order id',
                'Email',
                'Failure kind',
                'Current status',
                'Last status event',
                'Retry count',
                'Retry needed',
                'Last error',
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
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={r.failure_kind}
                      tone={KIND_TONE[r.failure_kind] ?? 'warn'}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--tf-ink-soft)]">{r.status}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--tf-slate)]">
                    {formatDate(r.status_updated_at)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--tf-ink-soft)]">{r.retry_count}</td>
                  <td className="px-4 py-3">
                    {r.retry_needed ? (
                      <StatusBadge label="manual follow-up required" tone="bad" />
                    ) : (
                      <StatusBadge label="info only" tone="neutral" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--tf-slate)]">
                    {r.last_error ? truncate(r.last_error, 200) : '—'}
                    {r.last_error_at && (
                      <span className="block text-[10px] text-[var(--tf-slate-soft)]">
                        at {formatDate(r.last_error_at)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTableShell>
        </>
      )}
    </div>
  );
}
