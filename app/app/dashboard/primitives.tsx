/**
 * Shared visual primitives for the customer dashboard.
 * Server-component-friendly (no client hooks).
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

// =============================================================================
// PageHeader
// =============================================================================

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-12 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--tf-accent)]">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-[44px] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--tf-ink)] sm:text-[52px]">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-[44rem] text-[16px] leading-[1.55] text-[var(--tf-slate)]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// =============================================================================
// Card
// =============================================================================

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        'rounded-[24px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-7 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_24px_60px_rgba(0,0,0,0.35)] ' +
        className
      }
    >
      {children}
    </div>
  );
}

// =============================================================================
// EmptyState
// =============================================================================

export function EmptyState({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <Card className="text-center">
      <div className="mx-auto max-w-[28rem] py-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--tf-slate-soft)]">
          Nothing here yet
        </p>
        <h2 className="mt-3 text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--tf-ink)]">
          {title}
        </h2>
        <p className="mt-3 text-[15px] leading-[1.55] text-[var(--tf-slate)]">{description}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={primaryHref}
            className="inline-flex h-12 items-center rounded-full bg-[var(--tf-ink)] px-6 text-[14px] font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)]"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="inline-flex h-12 items-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-6 text-[14px] font-medium text-[var(--tf-ink)] transition hover:bg-[var(--tf-paper)]"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// StatusPill
// =============================================================================

export type StatusTone = 'neutral' | 'progress' | 'success' | 'warning' | 'danger';

const TONE: Record<StatusTone, string> = {
  neutral:
    'border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] text-[var(--tf-slate)]',
  progress:
    'border-[var(--tf-accent)]/40 bg-[var(--tf-accent)]/10 text-[var(--tf-accent)]',
  success:
    'border-[#3b6f5f] bg-[#163a30] text-[#7fd1c4]',
  warning:
    'border-[#5a4828] bg-[#2a2114] text-[#f4d59a]',
  danger:
    'border-[#5a2828] bg-[#2a1414] text-[#f4a5a5]',
};

export function StatusPill({ label, tone = 'neutral' }: { label: string; tone?: StatusTone }) {
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] ' +
        TONE[tone]
      }
    >
      <span className={'inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80'} />
      {label}
    </span>
  );
}

// =============================================================================
// Order status -> tone + label
// =============================================================================

export function orderStatusTone(status: string, paymentStatus: string): StatusTone {
  if (paymentStatus === 'failed' || paymentStatus === 'refunded') return 'danger';
  if (status === 'delivered') return 'success';
  if (status === 'failed_needs_retry' || status === 'out_of_scope') return 'danger';
  if (status === 'payment_pending') return 'warning';
  return 'progress';
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  lead_created: 'Lead created',
  website_scanned: 'Website scanned',
  questions_completed: 'Questions completed',
  scope_checked: 'Scope checked',
  payment_pending: 'Awaiting payment',
  payment_completed: 'Payment received',
  generation_started: 'Preparing pack',
  qa_started: 'QA running',
  qa_passed: 'QA passed',
  package_created: 'Pack ready',
  delivered: 'Delivered',
  failed_needs_retry: 'Needs review',
  out_of_scope: 'Out of scope',
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status.replaceAll('_', ' ');
}

// =============================================================================
// Tier labels
// =============================================================================

const TIER_LABELS: Record<string, string> = {
  tier_0: 'Free Eligibility Check',
  tier_1: 'Lite Readiness Snapshot',
  tier_2: 'AI Disclosure Pack',
  tier_3: 'Buyer-Ready AI Governance Folder',
  tier_4: 'Premium Buyer Handoff',
};

export function tierLabel(tier: string): string {
  return TIER_LABELS[tier] ?? tier;
}

// =============================================================================
// Request status
// =============================================================================

export function requestStatusTone(status: string): StatusTone {
  switch (status) {
    case 'new':
      return 'progress';
    case 'contacted':
    case 'qualified':
      return 'progress';
    case 'converted':
      return 'success';
    case 'closed_lost':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function requestStatusLabel(status: string): string {
  switch (status) {
    case 'new':
      return 'Awaiting reply';
    case 'contacted':
      return 'Founder contacted';
    case 'qualified':
      return 'Qualified';
    case 'converted':
      return 'Converted to order';
    case 'closed_lost':
      return 'Closed';
    default:
      return status.replaceAll('_', ' ');
  }
}

// =============================================================================
// Confidence band
// =============================================================================

export function confidenceBandTone(band: string | null | undefined): StatusTone {
  switch (band) {
    case 'CLEAR':
      return 'success';
    case 'REVIEW':
    case 'UNCERTAIN':
      return 'warning';
    case 'SOFT_OUT':
    case 'HARD_OUT':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function confidenceBandLabel(band: string | null | undefined): string {
  switch (band) {
    case 'CLEAR':
      return 'Clear';
    case 'REVIEW':
      return 'Some review needed';
    case 'UNCERTAIN':
      return 'Uncertain';
    case 'SOFT_OUT':
      return 'Soft out';
    case 'HARD_OUT':
      return 'Out of scope';
    default:
      return 'Pending';
  }
}

// =============================================================================
// Formatting
// =============================================================================

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return value;
  }
}

export function formatAmount(amountCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amountCents / 100);
  } catch {
    return `$${(amountCents / 100).toFixed(0)}`;
  }
}

// =============================================================================
// SectionTitle
// =============================================================================

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--tf-slate-soft)]">
      {children}
    </h2>
  );
}
