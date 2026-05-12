import { listOutOfScope } from '@/lib/admin-data';
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

const REASON_TONE: Record<string, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = {
  hard_out: 'bad',
  hard_out_band: 'bad',
  soft_out_band: 'warn',
  unknown: 'neutral',
};

export default async function AdminOutOfScopePage() {
  const rows = await listOutOfScope({ limit: 200 });

  return (
    <div>
      <AdminPageHeader
        title="Out-of-scope leads"
        subtitle="Assessments that hit the hard-out scope check or the soft-out review band."
        count={rows.length}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No out-of-scope leads"
          body="When an assessment routes to /out-of-scope or surfaces SOFT_OUT, the lead lands here."
        />
      ) : (
        <AdminTableShell>
          <AdminTHead
            headers={['Created', 'Email', 'Website', 'Vertical', 'Band', 'Reason', 'Source']}
          />
          <tbody className="divide-y divide-[var(--tf-border)]">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--tf-slate)]">
                  {formatDate(r.created_at)}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--tf-ink-soft)]">{r.email}</td>
                <td className="px-4 py-3 text-sm">
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
                <td className="px-4 py-3 text-xs text-[var(--tf-ink-soft)]">{r.vertical ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-[var(--tf-ink-soft)]">{r.band ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={r.reason} tone={REASON_TONE[r.reason] ?? 'neutral'} />
                </td>
                <td className="px-4 py-3 text-xs text-[var(--tf-slate)]">{r.source}</td>
              </tr>
            ))}
          </tbody>
        </AdminTableShell>
      )}
    </div>
  );
}
