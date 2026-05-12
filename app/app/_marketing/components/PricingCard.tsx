/**
 * PricingCard — premium tier card with optional "Most popular" state,
 * green border accent, feature list, and CTA.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

export interface PricingFeature {
  label: string;
  included: boolean;
}

interface PricingCardProps {
  tier: string;
  price: string;
  priceSuffix?: string;
  description: string;
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref: string;
  popular?: boolean;
  note?: string;
  badge?: ReactNode;
}

export function PricingCard({
  tier,
  price,
  priceSuffix,
  description,
  features,
  ctaLabel,
  ctaHref,
  popular = false,
  note,
  badge,
}: PricingCardProps) {
  return (
    <article
      className={`relative flex flex-col gap-5 rounded-xl bg-[color:var(--m-white)] p-6 transition-all duration-200 ease-editorial hover:-translate-y-0.5 ${
        popular
          ? 'border-2 border-[color:var(--m-green)] shadow-[0_1px_0_rgba(14,15,13,0.04),0_8px_24px_-12px_rgba(26,107,74,0.25)]'
          : 'border border-[color:var(--m-border)] hover:border-[color:var(--m-border-mid)]'
      }`}
    >
      {popular ? (
        <span className="absolute right-5 top-5 rounded-sm bg-[color:var(--m-green-light)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wideish text-[color:var(--m-green-dark)]">
          Most popular
        </span>
      ) : badge ? (
        <span className="absolute right-5 top-5 rounded-sm bg-[color:var(--m-cream)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wideish text-[color:var(--m-muted)]">
          {badge}
        </span>
      ) : null}

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
          {tier}
        </p>
        <p className="mt-3 flex items-baseline gap-1 font-serif text-[28px] font-semibold text-[color:var(--m-black)]">
          {price}
          {priceSuffix ? (
            <span className="text-[13px] font-normal text-[color:var(--m-muted)]">
              {priceSuffix}
            </span>
          ) : null}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--m-muted)]">
          {description}
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px]">
            <span
              aria-hidden
              className={`mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full ${
                f.included ? 'bg-[color:var(--m-green)]' : 'bg-[color:var(--m-border-mid)]'
              }`}
            />
            <span
              className={
                f.included
                  ? 'text-[color:var(--m-black)]'
                  : 'text-[color:var(--m-subtle)] line-through decoration-[color:var(--m-border-mid)]'
              }
            >
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`mt-auto inline-flex h-11 items-center justify-center rounded-lg text-[14px] font-medium transition-colors duration-200 ${
          popular
            ? 'bg-[color:var(--m-green)] text-[color:var(--m-white)] hover:bg-[color:var(--m-green-dark)]'
            : 'border border-[color:var(--m-border-mid)] bg-transparent text-[color:var(--m-black)] hover:border-[color:var(--m-black)] hover:bg-[color:var(--m-cream)]'
        }`}
      >
        {ctaLabel}
      </Link>

      {note ? (
        <p className="font-mono text-[10px] leading-relaxed text-[color:var(--m-subtle)]">
          {note}
        </p>
      ) : null}
    </article>
  );
}
