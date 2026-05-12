import { listRequests } from '@/lib/admin-data';
import {
  AdminPageHeader,
  AdminTHead,
  AdminTableShell,
  EmptyState,
  StatusBadge,
  formatDate,
  truncate,
} from '../AdminTable';
import RequestRowActions from './RequestRowActions';

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = {
  new: 'info',
  contacted: 'neutral',
  qualified: 'good',
  converted: 'good',
  closed_lost: 'bad',
};

export default async function AdminRequestsPage() {
  const rows = await listRequests({ limit: 200 });

  return (
    <div>
      <AdminPageHeader
        title="Requests"
        subtitle="Inbound paid-pack and contact requests, ordered by created_at."
        count={rows.length}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No requests yet"
          body="Once a visitor submits the form on /request or /contact, they'll appear here."
        />
      ) : (
        <AdminTableShell>
          <AdminTHead
            headers={[
              'Created',
              'Email',
              'Company',
              'Website',
              'Pack',
              'Source',
              'Status',
              'Message / note',
              'Actions',
            ]}
          />
          <tbody className="divide-y divide-[var(--tf-border)]">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--tf-slate)]">
                  {formatDate(r.created_at)}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--tf-ink-soft)]">{r.email}</td>
                <td className="px-4 py-3 text-sm text-[var(--tf-ink-soft)]">
                  {r.company_name ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {r.website_url ? (
                    <a
                      href={r.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--tf-accent)] underline decoration-[var(--tf-border-strong)] underline-offset-2 hover:text-[var(--tf-ink)]"
                    >
                      {truncate(r.website_url.replace(/^https?:\/\//, ''), 28)}
                    </a>
                  ) : (
                    <span className="text-[var(--tf-slate-soft)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--tf-ink-soft)]">
                  {r.package_interest ?? '—'}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--tf-slate)]">
                  {r.source_page ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={r.status} tone={STATUS_TONE[r.status] ?? 'neutral'} />
                </td>
                <td className="px-4 py-3 text-xs text-[var(--tf-slate)]">
                  {r.message && <p>{truncate(r.message, 160)}</p>}
                  {r.internal_note && (
                    <p className="mt-2 rounded-md bg-[var(--tf-warning-soft)] px-2 py-1 text-[11px] text-[#7a4a00]">
                      <span className="font-medium">note:</span> {truncate(r.internal_note, 200)}
                    </p>
                  )}
                  {!r.message && !r.internal_note && (
                    <span className="text-[var(--tf-slate-soft)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  <RequestRowActions
                    id={r.id}
                    initialStatus={r.status}
                    initialNote={r.internal_note ?? ''}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableShell>
      )}
    </div>
  );
}
