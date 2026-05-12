import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customer-auth';
import { getReadinessScoreForOrder, listMyPacks } from '@/lib/customer-data';
import {
  Card,
  EmptyState,
  PageHeader,
  StatusPill,
  confidenceBandLabel,
  confidenceBandTone,
  formatDate,
  tierLabel,
} from '../primitives';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Packs — TrustFolder dashboard' };

export default async function PacksPage() {
  const session = getCustomerSession();
  if (!session) redirect('/login');
  const rows = await listMyPacks(session.customer_id);

  if (rows.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Packs"
          title="Your generated packs."
          description="Every delivered pack lives here with its confidence band and creation date."
        />
        <EmptyState
          title="No packs yet"
          description="Packs appear here as soon as a paid order finishes generation and QA. Each pack includes a downloadable zip and a per-document confidence band."
          primaryHref="/pricing"
          primaryLabel="See pricing"
          secondaryHref="/examples"
          secondaryLabel="See an example pack"
        />
      </>
    );
  }

  // Group by order so the customer sees one card per order with its docs.
  const byOrder = new Map<string, typeof rows>();
  for (const p of rows) {
    const list = byOrder.get(p.order_id) ?? [];
    list.push(p);
    byOrder.set(p.order_id, list);
  }

  // Phase 8 — recompute readiness scores per order so the card carries the
  // same view the customer saw on the assessment review screen.
  const readinessByOrder = new Map<string, Awaited<ReturnType<typeof getReadinessScoreForOrder>>>();
  await Promise.all(
    Array.from(byOrder.keys()).map(async (orderId) => {
      readinessByOrder.set(
        orderId,
        await getReadinessScoreForOrder(session.customer_id, orderId),
      );
    }),
  );

  return (
    <>
      <PageHeader
        eyebrow="Packs"
        title="Your generated packs."
        description="One card per delivered order, listing every document inside. Open Downloads to grab a fresh signed link."
      />

      <div className="grid gap-6">
        {Array.from(byOrder.entries()).map(([orderId, docs]) => {
          const first = docs[0];
          if (!first) return null;
          const readiness = readinessByOrder.get(orderId) ?? null;
          return (
            <Card key={orderId} className="!p-6">
              <div className="flex flex-col gap-2 border-b border-[var(--tf-border)]/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[16px] font-semibold text-[var(--tf-ink)]">
                    {tierLabel(first.tier)}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--tf-slate)]">
                    {first.url} · {docs.length}{' '}
                    document{docs.length === 1 ? '' : 's'}
                  </p>
                </div>
                <a
                  href={`/dashboard/downloads`}
                  className="inline-flex h-10 items-center self-start rounded-full bg-[var(--tf-ink)] px-5 text-[13px] font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)] sm:self-auto"
                >
                  Open downloads
                </a>
              </div>
              {readiness && (
                <div className="mt-5 grid gap-2 rounded-2xl border border-[var(--tf-border)]/60 bg-[var(--tf-bg-soft)]/40 p-4 sm:grid-cols-[auto_1fr] sm:items-baseline sm:gap-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">
                      {readiness.overall}
                    </span>
                    <span className="text-[12px] text-[var(--tf-slate-soft)]">/ 100</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[var(--tf-ink)]">
                      {readiness.label} · {readiness.band_label}
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-[var(--tf-slate)]">
                      {readiness.recommended_next_step}
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-4 text-[12px] leading-5 text-[var(--tf-slate-soft)]">
                Your downloadable ZIP includes the Buyer Review Packet
                (<code>buyer-review-packet.html</code>) and the open-review-items file. Open the
                HTML in a browser and Print → Save as PDF for a buyer-facing copy.
              </p>

              <ul className="mt-5 grid gap-3">
                {docs.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[var(--tf-border)]/60 bg-[var(--tf-bg-soft)]/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-[var(--tf-ink)]">
                        {humanizeTemplate(d.template_id)}
                      </p>
                      <p className="text-[12px] text-[var(--tf-slate-soft)]">
                        Created {formatDate(d.created_at)}
                      </p>
                    </div>
                    <StatusPill
                      label={confidenceBandLabel(d.confidence_band)}
                      tone={confidenceBandTone(d.confidence_band)}
                    />
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function humanizeTemplate(id: string): string {
  // Strip 't1-01-' / 't2-' / 't3-' prefixes and turn dashes into spaces.
  return id
    .replace(/^t\d+-?\d*-?/i, '')
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
