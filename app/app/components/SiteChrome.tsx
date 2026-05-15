'use client';

/**
 * SiteChrome — shared header + footer for the public marketing site.
 *
 * Nav per docs/15-phase-3-site-plan.md and Phase 3.6 spec:
 *   Product · Pricing · Examples · Agencies · Safety · Contact
 *   plus persistent CTAs: "Run free check" + "Request paid pack".
 *
 * Footer carries the canonical scope note from docs/14-DESIGN.md and the
 * full nav so the legal note is visible on every page (not hidden).
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '../_marketing/components/Logo';

const NAV_LINKS = [
  ['Overview', '/'],
  ['Pricing', '/pricing'],
  ['Examples', '/examples'],
  ['Agencies', '/agencies'],
  ['Safety', '/safety'],
  ['Contact', '/contact'],
] as const;

export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--tf-border)] bg-[var(--tf-bg)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-8 px-6 sm:px-8 lg:px-12 2xl:px-16">
        <Link href="/" className="text-xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]" aria-label="TrustFolder home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-[15px] text-[var(--tf-slate)] xl:flex">
          {NAV_LINKS.map(([label, href]) => {
            const isActive = active === label.toLowerCase();
            return (
              <Link
                key={href}
                href={href}
                className={`transition hover:text-[var(--tf-ink)] ${
                  isActive ? 'text-[var(--tf-ink)]' : ''
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/request?type=disclosure"
            className="hidden h-12 items-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-6 text-[15px] font-medium text-[var(--tf-ink)] transition hover:border-[var(--tf-ink-soft)]/40 hover:bg-[var(--tf-paper)] sm:inline-flex"
          >
            Request paid pack
          </Link>
          <Link
            href="/assessment"
            className="inline-flex h-12 items-center rounded-full bg-[var(--tf-ink)] px-6 text-[15px] font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)]"
          >
            Run free check
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--tf-border)] bg-[var(--tf-bg-soft)] px-6 py-16 sm:px-8 lg:px-12 2xl:px-16">
      <div className="mx-auto grid max-w-[1600px] gap-10 text-base text-[var(--tf-slate)] md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Link href="/" className="inline-flex text-[var(--tf-ink)]" aria-label="TrustFolder home">
            <Logo />
          </Link>
          <p className="mt-4 max-w-3xl leading-8">
            TrustFolder prepares AI-generated governance evidence drafts for review. It is not
            legal advice, certification, or a compliance guarantee.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--tf-slate-soft)]">
            Built for international AI startups, AI agencies, and B2B software teams preparing for
            buyer review.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
          {NAV_LINKS.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[var(--tf-ink)]">
              {label}
            </Link>
          ))}
          <Link href="/assessment" className="hover:text-[var(--tf-ink)]">
            Run free check
          </Link>
          <Link href="/request?type=disclosure" className="hover:text-[var(--tf-ink)]">
            Request paid pack
          </Link>
        </nav>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--tf-border)] pt-6 text-sm text-[var(--tf-slate-soft)]">
        <Link href="/terms" className="hover:text-[var(--tf-ink)]">Terms</Link>
        <Link href="/privacy" className="hover:text-[var(--tf-ink)]">Privacy</Link>
        <Link href="/refund" className="hover:text-[var(--tf-ink)]">Refund</Link>
        <Link href="/legal" className="hover:text-[var(--tf-ink)]">Legal</Link>
      </div>
    </footer>
  );
}

export function SiteChrome({
  children,
  active,
}: {
  children: ReactNode;
  active?: string;
}) {
  return (
    <div className="tf-marketing tf-public-light min-h-screen bg-[var(--tf-bg)] text-[var(--tf-ink)]">
      <SiteHeader active={active} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
