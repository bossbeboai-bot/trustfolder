import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customer-auth';
import {
  getCustomerProfileById,
  listMyOrders,
  listMyPacks,
  listMyRequests,
} from '@/lib/customer-data';
import {
  Card,
  EmptyState,
  PageHeader,
  SectionTitle,
  StatusPill,
  confidenceBandLabel,
  confidenceBandTone,
  formatAmount,
  formatDate,
  orderStatusLabel,
  orderStatusTone,
  requestStatusLabel,
  requestStatusTone,
  tierLabel,
} from '../primitives';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Overview — TrustFolder dashboard' };

export default async function OverviewPage() {
  const session = getCustomerSession();
  if (!session) redirect('/login');
  const profile = await getCustomerProfileById(session.customer_id);
  if (!profile) redirect('/login');

  const [requests, orders, packs] = await Promise.all([
    listMyRequests(session.customer_id, 5),
    listMyOrders(session.customer_id, 5),
    listMyPacks(session.customer_id, 5),
  ]);

  const latestOrder = orders[0] ?? null;
  const latestRequest = requests[0] ?? null;
  const latestPack = packs[0] ?? null;

  // Choose ONE primary next action.
  const next = chooseNextAction({ latestOrder, latestRequest, latestPack });

  if (requests.length === 0 && orders.length === 0 && packs.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow={`Welcome, ${profile.email}`}
          title="Your TrustFolder workspace."
          description="When you submit a request or order, it'll appear here. Start with a free check or request a paid pack."
        />
        <EmptyState
          title="No activity yet"
          description="Your dashboard becomes useful once you've run a free check, requested a pack, or completed a paid order."
          primaryHref="/assessment"
          primaryLabel="Run free check"
          secondaryHref="/request"
          secondaryLabel="Request a pack"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Your evidence workspace at a glance."
        description="One next action, plus a snapshot of your latest request, order, and pack."
      />

      {/* Primary next action */}
      <Card className="mb-10">
        <SectionTitle>Next step</SectionTitle>
        <h2 className="mt-3 text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--tf-ink)]">
          {next.title}
        </h2>
        <p className="mt-3 max-w-[42rem] text-[15px] leading-[1.6] text-[var(--tf-slate)]">
          {next.description}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={next.primaryHref}
            className="inline-flex h-12 items-center rounded-full bg-[var(--tf-ink)] px-6 text-[14px] font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)]"
          >
            {next.primaryLabel}
          </Link>
          {next.secondaryHref && next.secondaryLabel && (
            <Link
              href={next.secondaryHref}
              className="inline-flex h-12 items-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-6 text-[14px] font-medium text-[var(--tf-ink)] transition hover:bg-[var(--tf-paper)]"
            >
              {next.secondaryLabel}
            </Link>
          )}
        </div>
      </Card>

      {/* Three latest snapshots */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Latest request */}
        <Card>
          <div className="flex items-center justify-between">
            <SectionTitle>Latest request</SectionTitle>
            <Link
              href="/dashboard/requests"
              className="text-[12px] font-medium text-[var(--tf-accent)] hover:underline"
            >
              View all
            </Link>
          </div>
          {latestRequest ? (
            <div className="mt-4 space-y-3">
              <p className="text-[15px] font-semibold text-[var(--tf-ink)]">
                {latestRequest.package_interest
                  ? `Pack interest: ${latestRequest.package_interest}`
                  : 'Custom request'}
              </p>
              <div className="flex items-center gap-3">
                <StatusPill
                  label={requestStatusLabel(latestRequest.status)}
                  tone={requestStatusTone(latestRequest.status)}
                />
                <span className="text-[13px] text-[var(--tf-slate-soft)]">
                  {formatDate(latestRequest.created_at)}
                </span>
              </div>
              {latestRequest.company_name && (
                <p className="text-[13px] text-[var(--tf-slate)]">
                  {latestRequest.company_name}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.55] text-[var(--tf-slate-soft)]">
              No requests yet.
            </p>
          )}
        </Card>

        {/* Latest order */}
        <Card>
          <div className="flex items-center justify-between">
            <SectionTitle>Latest order</SectionTitle>
            <Link
              href="/dashboard/orders"
              className="text-[12px] font-medium text-[var(--tf-accent)] hover:underline"
            >
              View all
            </Link>
          </div>
          {latestOrder ? (
            <div className="mt-4 space-y-3">
              <p className="text-[15px] font-semibold text-[var(--tf-ink)]">
                {tierLabel(latestOrder.tier)}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill
                  label={orderStatusLabel(latestOrder.status)}
                  tone={orderStatusTone(latestOrder.status, latestOrder.payment_status)}
                />
                <span className="text-[13px] text-[var(--tf-slate-soft)]">
                  {formatAmount(latestOrder.amount_cents, latestOrder.currency)} ·{' '}
                  {formatDate(latestOrder.paid_at ?? latestOrder.created_at)}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.55] text-[var(--tf-slate-soft)]">
              No orders yet.
            </p>
          )}
        </Card>

        {/* Latest pack */}
        <Card>
          <div className="flex items-center justify-between">
            <SectionTitle>Latest pack</SectionTitle>
            <Link
              href="/dashboard/packs"
              className="text-[12px] font-medium text-[var(--tf-accent)] hover:underline"
            >
              View all
            </Link>
          </div>
          {latestPack ? (
            <div className="mt-4 space-y-3">
              <p className="text-[15px] font-semibold text-[var(--tf-ink)]">
                {tierLabel(latestPack.tier)}
              </p>
              <div className="flex items-center gap-3">
                <StatusPill
                  label={confidenceBandLabel(latestPack.confidence_band)}
                  tone={confidenceBandTone(latestPack.confidence_band)}
                />
                <span className="text-[13px] text-[var(--tf-slate-soft)]">
                  {formatDate(latestPack.created_at)}
                </span>
              </div>
              <Link
                href="/dashboard/downloads"
                className="inline-block text-[13px] font-medium text-[var(--tf-accent)] hover:underline"
              >
                Open downloads →
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-[14px] leading-[1.55] text-[var(--tf-slate-soft)]">
              No packs yet. Once an order is delivered, it appears here.
            </p>
          )}
        </Card>
      </div>

      {/* Footer disclaimer */}
      <p className="mt-12 text-[12px] leading-[1.6] text-[var(--tf-slate-soft)]">
        TrustFolder prepares AI-generated governance evidence drafts for review. It is not legal
        advice, certification, or a compliance guarantee.
      </p>
    </>
  );
}

// =============================================================================
// Next-action chooser
// =============================================================================

type Order = NonNullable<Awaited<ReturnType<typeof listMyOrders>>[number]>;
type Request_ = NonNullable<Awaited<ReturnType<typeof listMyRequests>>[number]>;
type Pack = NonNullable<Awaited<ReturnType<typeof listMyPacks>>[number]>;

interface NextAction {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

function chooseNextAction(input: {
  latestOrder: Order | null;
  latestRequest: Request_ | null;
  latestPack: Pack | null;
}): NextAction {
  const { latestOrder, latestRequest, latestPack } = input;

  // 1. Delivered pack ready to download
  if (latestOrder && latestOrder.status === 'delivered') {
    return {
      title: `Your ${tierLabel(latestOrder.tier)} is ready.`,
      description:
        'Open Downloads to grab a fresh signed link, valid for 7 days. You can re-issue the link any time.',
      primaryHref: '/dashboard/downloads',
      primaryLabel: 'Open downloads',
      secondaryHref: '/dashboard/packs',
      secondaryLabel: 'View pack details',
    };
  }

  // 2. Order in progress
  if (latestOrder && (latestOrder.status === 'generation_started' || latestOrder.status === 'qa_started' || latestOrder.status === 'payment_completed' || latestOrder.status === 'package_created')) {
    return {
      title: 'Your pack is being prepared.',
      description:
        'Generation and QA can take a few minutes. We email you the moment it is ready, and the order page updates automatically.',
      primaryHref: '/dashboard/orders',
      primaryLabel: 'See order status',
    };
  }

  // 3. Order needs review
  if (latestOrder && (latestOrder.status === 'failed_needs_retry' || latestOrder.payment_status === 'failed')) {
    return {
      title: 'Your latest order needs a quick check.',
      description:
        'Open the order to see what happened. The founder reviews every flagged order before any further action.',
      primaryHref: '/dashboard/orders',
      primaryLabel: 'See order',
      secondaryHref: '/contact',
      secondaryLabel: 'Contact support',
    };
  }

  // 4. Outstanding request awaiting reply
  if (latestRequest && (latestRequest.status === 'new' || latestRequest.status === 'contacted')) {
    return {
      title: 'Your request is in the queue.',
      description:
        'A founder reviews every request and replies within one business day. You can add context any time by replying to our acknowledgement email.',
      primaryHref: '/dashboard/requests',
      primaryLabel: 'See request status',
    };
  }

  // 5. Has packs but nothing else live
  if (latestPack) {
    return {
      title: 'Browse your delivered packs.',
      description:
        'Your packs are stored in the workspace. Re-download any time, or request an updated pack as your product evolves.',
      primaryHref: '/dashboard/packs',
      primaryLabel: 'View packs',
      secondaryHref: '/request',
      secondaryLabel: 'Request a refresh',
    };
  }

  // 6. Default — nothing actionable, but profile exists.
  return {
    title: 'Start with a free eligibility check.',
    description:
      'See whether TrustFolder fits your AI product in two minutes. We scan your homepage and confirm a few details.',
    primaryHref: '/assessment',
    primaryLabel: 'Run free check',
    secondaryHref: '/request',
    secondaryLabel: 'Request a pack',
  };
}
