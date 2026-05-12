import { listAssessments } from '@/lib/admin-data';
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

const BAND_TONE: Record<string, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = {
  CLEAR: 'good',
  REVIEW: 'warn',
  UNCERTAIN: 'warn',
  SOFT_OUT: 'bad',
  HARD_OUT: 'bad',
};

const STEP_TONE: Record<string, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = {
  pay: 'good',
  soft_out_review: 'warn',
  out_of_scope: 'bad',
  unknown: 'neutral',
};

export default async function AdminAssessmentsPage() {
  const rows = await listAssessments({ limit: 200 });

  return (
    <div>
      <AdminPageHeader
        title="Assessments"
        subtitle="Free eligibility checks. One row per /assessment completion."
        count={rows.length}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No assessments yet"
          body="Assessments are created when a visitor completes the free eligibility check on /assessment."
        />
      ) : (
        <AdminTableShell>
          <AdminTHead
            headers={[
              'Created',
              'Email',
              'Website',
              'Company / product',
              'B2B/C',
              'Vertical',
              'Confidence',
              'Band',
              'Recommended tier',
              'Next step',
            ]}
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
                <td className="px-4 py-3 text-sm text-[var(--tf-ink-soft)]">
                  {r.extraction?.company_name ? (
                    <p className="font-medium">{r.extraction.company_name}</p>
                  ) : (
                    <span className="text-[var(--tf-slate-soft)]">—</span>
                  )}
                  {r.extraction?.product_description && (
                    <p className="mt-0.5 text-xs text-[var(--tf-slate)]">
                      {truncate(r.extraction.product_description, 120)}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--tf-ink-soft)]">
                  {r.extraction?.b2b_or_b2c ?? '—'}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--tf-ink-soft)]">
                  {r.vertical ?? '—'}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--tf-slate)]">
                  {r.extraction?.confidence ?? '—'}
                </td>
                <td className="px-4 py-3">
                  {r.scope_check_band ? (
                    <StatusBadge
                      label={r.scope_check_band}
                      tone={BAND_TONE[r.scope_check_band] ?? 'neutral'}
                    />
                  ) : (
                    <span className="text-xs text-[var(--tf-slate-soft)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--tf-ink-soft)]">
                  {r.recommended_tier ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={r.next_step} tone={STEP_TONE[r.next_step] ?? 'neutral'} />
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableShell>
      )}
    </div>
  );
}
