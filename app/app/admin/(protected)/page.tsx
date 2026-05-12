import Link from 'next/link';
import { getSummary } from '@/lib/admin-data';
import {
  AdminCard,
  AdminPageHeader,
  EmptyState,
  StatusBadge,
  formatDate,
  truncate,
} from './AdminTable';

export const dynamic = 'force-dynamic';

const REQUEST_STATUS_TONE: Record<
  string,
  'neutral' | 'good' | 'warn' | 'bad' | 'info'
> = {
  new: 'info',
  contacted: 'neutral',
  qualified: 'good',
  converted: 'good',
  closed_lost: 'bad',
};

interface SummaryCardProps {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  tone?: 'default' | 'warn' | 'bad';
}

function SummaryCard({ label, value, hint, href, tone = 'default' }: SummaryCardProps) {
  const palette =
    tone === 'bad'
      ? 'border-[#f0c0c0] bg-[#fdf3f3]'
      : tone === 'warn'
        ? 'border-[#cdb47a]/40 bg-[var(--tf-warning-soft)]'
        : 'border-[var(--tf-border)] bg-[var(--tf-surface)]';

  const inner = (
    <div className={`rounded-2xl border p-5 transition ${palette} ${href ? 'hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(7,17,31,0.08)]' : ''}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--tf-slate)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-[var(--tf-slate-soft)]">{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminOverviewPage() {
  const summary = await getSummary();

  return (
    <div>
      <AdminPageHeader
        title="Founder ops overview"
        subtitle="Lead pipeline, order pipeline, and rescue queue at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total requests"
          value={summary.total_requests}
          href="/admin/requests"
        />
        <SummaryCard
          label="New requests"
          value={summary.new_requests}
          hint="Untouched inbound"
          href="/admin/requests"
          tone={summary.new_requests > 0 ? 'warn' : 'default'}
        />
        <SummaryCard
          label="Paid pack interest"
          value={summary.paid_pack_interest}
          hint="snapshot · disclosure · governance · premium · agency"
          href="/admin/requests"
        />
        <SummaryCard
          label="Out-of-scope leads"
          value={summary.out_of_scope_leads}
          hint="From assessments"
          href="/admin/out-of-scope"
        />
        <SummaryCard
          label="Failed jobs"
          value={summary.failed_jobs}
          hint="failed_needs_retry"
          href="/admin/failures"
          tone={summary.failed_jobs > 0 ? 'bad' : 'default'}
        />
        <SummaryCard
          label="Orders pending"
          value={summary.orders_pending}
          hint="In flight (payment → delivery)"
          href="/admin/orders"
        />
        <SummaryCard
          label="Delivered packs"
          value={summary.delivered_packs}
          href="/admin/orders"
        />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Latest requests</h2>
          <Link
            href="/admin/requests"
            className="text-sm text-[var(--tf-slate)] underline decoration-[var(--tf-border-strong)] underline-offset-4 hover:text-[var(--tf-ink)]"
          >
            View all
          </Link>
        </div>

        {summary.latest_requests.length === 0 ? (
          <EmptyState
            title="No requests yet"
            body="As soon as someone submits the request form, they’ll appear here."
          />
        ) : (
          <div className="space-y-3">
            {summary.latest_requests.map((r) => (
              <AdminCard key={r.id} className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="font-medium text-[var(--tf-ink)]">{r.email}</p>
                    <StatusBadge
                      label={r.status}
                      tone={REQUEST_STATUS_TONE[r.status] ?? 'neutral'}
                    />
                    {r.package_interest && (
                      <span className="text-xs text-[var(--tf-slate)]">
                        · {r.package_interest}
                      </span>
                    )}
                    {r.source_page && (
                      <span className="text-xs text-[var(--tf-slate-soft)]">
                        from {r.source_page}
                      </span>
                    )}
                  </div>
                  {r.company_name && (
                    <p className="mt-1 text-sm text-[var(--tf-slate)]">{r.company_name}</p>
                  )}
                  {r.message && (
                    <p className="mt-1 text-sm text-[var(--tf-slate)]">{truncate(r.message, 200)}</p>
                  )}
                </div>
                <div className="text-right text-xs text-[var(--tf-slate-soft)]">
                  <p>{formatDate(r.created_at)}</p>
                  {r.website_url && (
                    <a
                      href={r.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block underline decoration-[var(--tf-border-strong)] underline-offset-2 hover:text-[var(--tf-ink)]"
                    >
                      Open site ↗
                    </a>
                  )}
                </div>
              </AdminCard>
            ))}
          </div>
        )}
      </div>

      <p className="mt-12 text-xs text-[var(--tf-slate-soft)]">
        Counts are pulled live from Supabase via the engine service-role client. Not cached.
      </p>
    </div>
  );
}
