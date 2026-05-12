/**
 * Marketing footer.
 * Carries the canonical disclaimer once (per docs/14-DESIGN + brief §CONTENT).
 */

import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--m-border)] bg-[color:var(--m-white)]">
      <div className="mx-auto grid max-w-site gap-10 px-6 py-14 md:grid-cols-[1.3fr_1fr_1fr] md:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-[32ch] text-[13px] leading-relaxed text-[color:var(--m-subtle)]">
            TrustFolder prepares review-ready AI governance drafts. Your lawyer
            takes it from there — faster, and from a better starting point.
            <br />
            <span className="mt-2 inline-block font-mono text-[11px] tracking-wideish text-[color:var(--m-subtle)]">
              Not legal advice · Not certification · Not a compliance guarantee
            </span>
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-[color:var(--m-muted)] md:grid-cols-1">
          <FooterHeading>Product</FooterHeading>
          <FooterLink href="/">Overview</FooterLink>
          <FooterLink href="/pricing">Pricing</FooterLink>
          <FooterLink href="/examples">Examples</FooterLink>
          <FooterLink href="/agencies">Agencies</FooterLink>
          <FooterLink href="/safety">Safety</FooterLink>
        </nav>
        <nav className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-[color:var(--m-muted)] md:grid-cols-1">
          <FooterHeading>Company</FooterHeading>
          <FooterLink href="/blog">Blog</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/assessment">Run free check</FooterLink>
          <FooterLink href="/request?type=disclosure">Request paid pack</FooterLink>
        </nav>
      </div>
      <div className="border-t border-[color:var(--m-border)]">
        <div className="mx-auto flex max-w-site flex-col gap-3 px-6 py-5 text-[12px] text-[color:var(--m-subtle)] md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            Built for international AI startups, AI agencies, and B2B software teams.
          </p>
          <ul className="flex flex-wrap gap-5">
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/refund">Refund</FooterLink>
            <FooterLink href="/legal">Legal</FooterLink>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <span className="col-span-full font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
      {children}
    </span>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li className="list-none">
      <Link
        href={href}
        className="inline-block text-[color:var(--m-muted)] transition-colors duration-150 hover:text-[color:var(--m-black)]"
      >
        {children}
      </Link>
    </li>
  );
}
