/**
 * StatusTimeline — Phase 8 batch 6.
 *
 * Renders the order status progression as a small visual timeline. Used on
 * the customer dashboard orders / overview surfaces. Server component.
 */

import type { OrderTimelineStep } from '@/lib/customer-data';

export function StatusTimeline({ steps }: { steps: OrderTimelineStep[] }) {
  return (
    <ol className="grid gap-2">
      {steps.map((s) => (
        <li
          key={s.key}
          className="flex items-center gap-3 rounded-xl border border-[var(--tf-border)]/60 bg-[var(--tf-bg-soft)]/40 px-3 py-2 text-[13px]"
        >
          <span
            aria-hidden
            className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${dotClass(s.state)}`}
          />
          <span className={textClass(s.state)}>{s.label}</span>
          <span className="ml-auto text-[11px] uppercase tracking-[0.16em] text-[var(--tf-slate-soft)]">
            {labelForState(s.state)}
          </span>
        </li>
      ))}
    </ol>
  );
}

function dotClass(state: OrderTimelineStep['state']): string {
  switch (state) {
    case 'done':
      return 'bg-emerald-500';
    case 'current':
      return 'bg-[var(--tf-accent)] ring-2 ring-[var(--tf-accent)]/30';
    case 'failed':
      return 'bg-rose-500';
    case 'upcoming':
      return 'bg-[var(--tf-slate-soft)]/40';
  }
}

function textClass(state: OrderTimelineStep['state']): string {
  switch (state) {
    case 'done':
      return 'text-[var(--tf-ink-soft)]';
    case 'current':
      return 'text-[var(--tf-ink)] font-medium';
    case 'failed':
      return 'text-rose-700 font-medium';
    case 'upcoming':
      return 'text-[var(--tf-slate-soft)]';
  }
}

function labelForState(state: OrderTimelineStep['state']): string {
  switch (state) {
    case 'done':
      return 'Done';
    case 'current':
      return 'In progress';
    case 'failed':
      return 'Needs review';
    case 'upcoming':
      return 'Upcoming';
  }
}
