/**
 * DocumentCard — stylised preview of one document in a TrustFolder pack.
 * Shows a DM-Mono label, stamp, preview lines, and source note.
 *
 * All content is sample/placeholder. Never real customer data.
 */

import type { ReactNode } from 'react';

interface DocumentCardProps {
  docNumber: string; // e.g. "01"
  title: string;
  previewLines?: number;
  stamp?: string;
  source?: string;
  blurred?: boolean;
  accent?: 'default' | 'featured';
  children?: ReactNode;
}

export function DocumentCard({
  docNumber,
  title,
  previewLines = 4,
  stamp,
  source,
  blurred = false,
  accent = 'default',
  children,
}: DocumentCardProps) {
  const borderClass =
    accent === 'featured'
      ? 'border-2 border-[color:var(--m-green)]'
      : 'border border-[color:var(--m-border-mid)]';

  return (
    <article
      className={`group relative overflow-hidden rounded-lg bg-[color:var(--m-white)] p-4 transition-all duration-200 ease-editorial hover:-translate-y-0.5 hover:border-[color:var(--m-black)] ${borderClass}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-[color:var(--m-border)] pb-3">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-wideish text-[color:var(--m-black)]">
          <span className="text-[color:var(--m-subtle)]">{docNumber}</span>
          <span className="truncate">{title}</span>
        </span>
        {stamp ? (
          <span className="shrink-0 rounded-sm border border-[color:var(--m-green)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wideish text-[color:var(--m-green)]">
            {stamp}
          </span>
        ) : null}
      </header>
      <div className="mt-3 space-y-1.5">
        {Array.from({ length: previewLines }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full bg-[color:var(--m-border-mid)]/60 ${
              i === previewLines - 1 ? 'w-[62%]' : 'w-full'
            } ${blurred ? 'blur-[1.2px]' : ''}`}
          />
        ))}
      </div>
      {children ? <div className="mt-3 text-[12px] text-[color:var(--m-muted)]">{children}</div> : null}
      {source ? (
        <p className="mt-3 font-mono text-[10px] text-[color:var(--m-subtle)]">
          ↳ Source: {source}
        </p>
      ) : null}
    </article>
  );
}
