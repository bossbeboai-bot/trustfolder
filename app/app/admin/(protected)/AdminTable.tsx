/**
 * Small server-friendly table primitives shared across admin pages.
 * No client interactivity here — purely presentational.
 */

import type { ReactNode } from 'react';

export function AdminPageHeader({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle?: string;
  count?: number;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-[var(--tf-slate)]">{subtitle}</p>}
      </div>
      {typeof count === 'number' && (
        <p className="rounded-full border border-[var(--tf-border)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--tf-slate)]">
          {count} total
        </p>
      )}
    </div>
  );
}

export function AdminCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-surface)] p-5 ${className}`}>
      {children}
    </div>
  );
}

export function AdminTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-surface)]">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function AdminTHead({ headers }: { headers: string[] }) {
  return (
    <thead className="bg-[var(--tf-bg-soft)] text-xs uppercase tracking-[0.14em] text-[var(--tf-slate)]">
      <tr>
        {headers.map((h) => (
          <th key={h} className="px-4 py-3 font-medium">
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function StatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info';
}) {
  const palette: Record<string, string> = {
    neutral: 'bg-[var(--tf-bg-soft)] text-[var(--tf-ink-soft)] border-[var(--tf-border)]',
    good: 'bg-[var(--tf-accent-soft)] text-[var(--tf-accent)] border-[var(--tf-accent)]/20',
    warn: 'bg-[var(--tf-warning-soft)] text-[#7a4a00] border-[#cdb47a]/40',
    bad: 'bg-[#fdf3f3] text-[#7a1f1f] border-[#f0c0c0]',
    info: 'bg-[var(--tf-surface)] text-[var(--tf-ink-soft)] border-[var(--tf-border)]',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em] ${palette[tone]}`}
    >
      {label}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--tf-border)] bg-[var(--tf-surface)] px-6 py-12 text-center">
      <p className="text-sm font-medium text-[var(--tf-ink)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--tf-slate)]">{body}</p>
    </div>
  );
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  // YYYY-MM-DD HH:mm UTC — readable, sortable, no timezone confusion.
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi} UTC`;
}

export function truncate(s: string | null | undefined, n: number): string {
  if (!s) return '—';
  if (s.length <= n) return s;
  return `${s.slice(0, n).trimEnd()}…`;
}
