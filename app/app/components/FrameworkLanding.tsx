/**
 * FrameworkLanding — Phase 8 batch 7.
 *
 * Shared layout for framework / topic landing pages. Each page passes its
 * own copy. The component enforces the "what we don't guarantee" line and a
 * single CTA pattern so all eight pages stay consistent.
 *
 * Wording rules:
 *  - Never claim certification or guarantee-style legal outcomes.
 *  - Always include the standard disclaimer.
 *  - Always describe sample outputs as drafts / readiness material.
 */

import Link from 'next/link';
import { SiteChrome } from './SiteChrome';
import { PageHeader, Section } from './MarketingPrimitives';
import { FaqSection } from './ClarityBlocks';

export interface FrameworkLandingProps {
  eyebrow: string;
  title: string;
  lede: string;
  problem: string;
  who_for: string[];
  what_we_prepare: string[];
  what_we_dont_guarantee: string[];
  sample_outputs: string[];
  primary_cta: { href: string; label: string };
  secondary_cta?: { href: string; label: string };
  faqs: { q: string; a: string }[];
}

export function FrameworkLanding(props: FrameworkLandingProps) {
  return (
    <SiteChrome>
      <PageHeader eyebrow={props.eyebrow} title={props.title} lede={props.lede} />

      <Section eyebrow="The problem" title="What this page is about.">
        <p className="text-base leading-8 text-[var(--tf-slate)]">{props.problem}</p>
      </Section>

      <Section eyebrow="Who it is for" title="Who reads this page.">
        <ul className="grid gap-2 text-base leading-8 text-[var(--tf-slate)] sm:grid-cols-2">
          {props.who_for.map((w) => (
            <li key={w} className="flex gap-3">
              <span className="mt-3 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="What TrustFolder prepares" title="Documents and evidence material.">
        <ul className="grid gap-3 text-base leading-8 text-[var(--tf-ink-soft)] sm:grid-cols-2">
          {props.what_we_prepare.map((w) => (
            <li key={w} className="flex gap-3 rounded-2xl border border-[var(--tf-border)]/60 bg-[var(--tf-surface)] px-4 py-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="What we do not guarantee" title="The honest boundary.">
        <ul className="grid gap-2 text-base leading-8 text-[var(--tf-slate)]">
          {props.what_we_dont_guarantee.map((w) => (
            <li key={w} className="flex gap-3">
              <span className="mt-3 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-slate-soft)]" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-7 text-[var(--tf-slate-soft)]">
          TrustFolder prepares review-ready AI governance and disclosure readiness drafts. It is
          not legal advice, certification, or a compliance guarantee.
        </p>
      </Section>

      <Section eyebrow="Sample outputs" title="What a TrustFolder pack typically includes.">
        <p className="-mt-4 mb-6 text-sm text-[var(--tf-slate-soft)]">
          Illustrative sample. Not a real customer pack.
        </p>
        <ul className="grid gap-3 text-base leading-8 text-[var(--tf-ink-soft)] sm:grid-cols-2">
          {props.sample_outputs.map((s) => (
            <li key={s} className="flex gap-3 rounded-2xl border border-[var(--tf-border)]/60 bg-[var(--tf-bg-soft)]/40 px-4 py-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Next step" title="Run the free check or request a pack.">
        <div className="flex flex-wrap gap-3">
          <Link
            href={props.primary_cta.href}
            className="inline-flex h-12 items-center rounded-full bg-[var(--tf-ink)] px-6 text-[14px] font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)]"
          >
            {props.primary_cta.label}
          </Link>
          {props.secondary_cta && (
            <Link
              href={props.secondary_cta.href}
              className="inline-flex h-12 items-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-6 text-[14px] font-medium text-[var(--tf-ink)] transition hover:bg-[var(--tf-paper)]"
            >
              {props.secondary_cta.label}
            </Link>
          )}
        </div>
      </Section>

      <FaqSection
        eyebrow="Frequently asked"
        title="Questions buyers, founders, and reviewers ask."
        faqs={props.faqs}
      />
    </SiteChrome>
  );
}
