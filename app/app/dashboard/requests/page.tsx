import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customer-auth';
import { listMyRequests } from '@/lib/customer-data';
import {
  Card,
  EmptyState,
  PageHeader,
  StatusPill,
  formatDate,
  requestStatusLabel,
  requestStatusTone,
} from '../primitives';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Requests — TrustFolder dashboard' };

export default async function RequestsPage() {
  const session = getCustomerSession();
  if (!session) redirect('/login');
  const rows = await listMyRequests(session.customer_id);

  if (rows.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Requests"
          title="Your inbound requests."
          description="Every paid-pack interest, contact request, or premium handoff application appears here."
        />
        <EmptyState
          title="No requests yet"
          description="Requests show up here once you've submitted a paid-pack interest, a custom-scope request, or a contact form."
          primaryHref="/request"
          primaryLabel="Request a pack"
          secondaryHref="/contact"
          secondaryLabel="Contact us"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Requests"
        title="Your inbound requests."
        description="Every paid-pack interest, contact request, or premium handoff application appears here."
      />

      <div className="grid gap-5">
        {rows.map((r) => (
          <Card key={r.id} className="!p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[16px] font-semibold leading-[1.4] text-[var(--tf-ink)]">
                  {r.package_interest
                    ? `Pack interest: ${r.package_interest}`
                    : 'Custom request'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-[var(--tf-slate)]">
                  {r.company_name && <span>{r.company_name}</span>}
                  {r.website_url && (
                    <a
                      href={normalizeUrl(r.website_url)}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[var(--tf-accent)] underline-offset-4 hover:underline"
                    >
                      {r.website_url}
                    </a>
                  )}
                </div>
                {r.message && (
                  <p className="mt-3 max-w-[60ch] text-[14px] leading-[1.6] text-[var(--tf-slate)]">
                    {r.message}
                  </p>
                )}
              </div>
              <div className="flex flex-shrink-0 flex-col items-start gap-2 sm:items-end">
                <StatusPill
                  label={requestStatusLabel(r.status)}
                  tone={requestStatusTone(r.status)}
                />
                <span className="text-[12px] text-[var(--tf-slate-soft)]">
                  {formatDate(r.created_at)}
                </span>
                {r.source_page && (
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--tf-slate-soft)]">
                    via {r.source_page}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function normalizeUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}
