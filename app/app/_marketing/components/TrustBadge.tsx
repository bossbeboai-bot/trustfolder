/**
 * TrustBadge — small framework/scope badge used in hero trust line,
 * trust badge row, pricing cards, and section eyebrows.
 */

import type { ReactNode } from 'react';

type Variant = 'framework' | 'scope' | 'safe' | 'neutral' | 'caution';

const variantClass: Record<Variant, string> = {
  framework:
    'border border-[color:var(--m-border-mid)] text-[color:var(--m-muted)] bg-transparent',
  scope:
    'bg-[color:var(--m-amber-light)] text-[color:var(--m-amber)] border border-transparent',
  safe:
    'bg-[color:var(--m-green-light)] text-[color:var(--m-green-dark)] border border-transparent',
  neutral:
    'bg-[color:var(--m-cream)] text-[color:var(--m-muted)] border border-[color:var(--m-border)]',
  caution:
    'bg-[color:var(--m-red-light)] text-[color:var(--m-red)] border border-transparent',
};

interface TrustBadgeProps {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
}

export function TrustBadge({
  children,
  variant = 'framework',
  icon,
  className = '',
}: TrustBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 font-mono text-[11px] tracking-wideish ${variantClass[variant]} ${className}`}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </span>
  );
}

export function CheckDot() {
  return (
    <span
      aria-hidden
      className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--m-green)]"
    />
  );
}
