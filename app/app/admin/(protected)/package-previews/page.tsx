import Link from 'next/link';
import { PACKAGE_PREVIEW_CATALOG } from '@/lib/admin-package-previews';
import { AdminCard, AdminPageHeader, StatusBadge } from '../AdminTable';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Package previews - TrustFolder admin',
};

const OUTPUT_TONE: Record<string, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = {
  page: 'info',
  markdown: 'good',
  zip: 'warn',
};

export default function AdminPackagePreviewsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Package previews"
        subtitle="No-payment admin previews for every pricing category. These outputs use fictional data and do not create orders, payments, emails, or storage objects."
        count={PACKAGE_PREVIEW_CATALOG.length}
      />

      <div className="mb-6 rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-surface)] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--tf-ink)]">
              Download the admin-only sample bundle
            </p>
            <p className="mt-1 text-sm text-[var(--tf-slate)]">
              Includes every pricing category as a sample for internal inspection. Real
              customers receive only their purchased or requested package.
            </p>
          </div>
          <a
            href="/api/admin/package-previews/all"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--tf-ink)] px-5 text-sm font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)]"
          >
            Download admin bundle
          </a>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {PACKAGE_PREVIEW_CATALOG.map((item) => (
          <AdminCard key={item.id} className="flex flex-col justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--tf-slate)]">
                    {item.price}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--tf-ink)]">
                    {item.label}
                  </h2>
                </div>
                <StatusBadge label={item.readiness} tone={OUTPUT_TONE[item.outputKind]} />
              </div>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-[var(--tf-slate-soft)]">
                    How customer receives it
                  </dt>
                  <dd className="mt-1 text-[var(--tf-ink-soft)]">{item.delivery}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-[var(--tf-slate-soft)]">
                    What is inside
                  </dt>
                  <dd className="mt-1 text-[var(--tf-ink-soft)]">{item.customerReceives}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-[var(--tf-slate-soft)]">
                    Public funnel route
                  </dt>
                  <dd className="mt-1">
                    <Link
                      href={item.route}
                      className="text-[var(--tf-accent)] underline decoration-[var(--tf-border-strong)] underline-offset-2 hover:text-[var(--tf-ink)]"
                    >
                      {item.route}
                    </Link>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-[var(--tf-border)] pt-5">
              <a
                href={`/api/admin/package-previews/${item.id}`}
                target={item.outputKind === 'zip' ? undefined : '_blank'}
                rel={item.outputKind === 'zip' ? undefined : 'noreferrer'}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-4 text-sm font-medium text-[var(--tf-ink)] transition hover:bg-[var(--tf-bg-soft)]"
              >
                {item.outputKind === 'zip' ? 'Download sample ZIP' : 'Open sample output'}
              </a>
            </div>
          </AdminCard>
        ))}
      </div>

      <p className="mt-10 text-xs leading-6 text-[var(--tf-slate-soft)]">
        Preview outputs are for admin inspection only. They are fictional, safe-copy
        bounded, and separate from real order delivery.
      </p>
    </div>
  );
}
