'use client';

/**
 * Shared clarity blocks — used by homepage, pricing, and request pages.
 *
 * Goal: a 10-second visitor should know
 *   1. What TrustFolder prepares (the documents).
 *   2. What you get in a pack (the package shape).
 *   3. The honest "what we don't guarantee" line.
 *   4. Common-question answers (FAQ).
 *
 * Wording rules (see docs/14-DESIGN.md §12 + docs/35 §5):
 *   - "review-ready drafts", never "compliant" or "guaranteed".
 *   - Always carry the disclaimer line near the CTA.
 *   - Keep card copy plain-English, ≤ 25 words.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// =============================================================================
// What TrustFolder prepares — 6 cards
// =============================================================================

const PREPARES = [
  {
    title: 'AI disclosure drafts',
    body: 'User-facing language for AI chatbots, AI-generated content, and AI-assisted product features.',
  },
  {
    title: 'AI use summary',
    body: 'A plain-English explanation of what your AI feature does, who uses it, and where users see AI output.',
  },
  {
    title: 'Evidence tracker',
    body: 'A structured record of what your website says, what you confirmed, and what still needs review.',
  },
  {
    title: 'Governance summary',
    body: 'Internal notes covering human review, AI use boundaries, user exposure, and review responsibilities.',
  },
  {
    title: 'Buyer / legal handoff',
    body: 'A clean document pack your internal team, buyer, or lawyer can review without starting from scattered website copy.',
  },
  {
    title: 'Next-step roadmap',
    body: 'A practical list of what to fix, review, disclose, or prepare next.',
  },
  {
    title: 'ISO/IEC 42001-aligned checklist support',
    body: 'A readiness checklist that helps your team organise AI governance evidence before expert review.',
  },
  {
    title: 'EU AI Act transparency-readiness notes',
    body: 'Plain-English notes that help your team prepare transparency and disclosure materials for review.',
  },
  {
    title: 'Source notes',
    body: 'References back to your website, intake answers, and reviewer notes so the pack is easier to check.',
  },
] as const;

export function WhatTrustFolderPrepares({
  eyebrow = 'What TrustFolder prepares',
  title = 'The exact documents that arrive in your pack.',
  description,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <section
      id="prepares"
      className="mx-auto max-w-[1520px] px-6 py-20 sm:px-8 lg:px-12 lg:py-24 2xl:px-16"
    >
      <div className="mb-12 max-w-4xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--tf-accent)]">
          {eyebrow}
        </p>
        <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        {description && (
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--tf-slate)]">{description}</p>
        )}
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PREPARES.map((p, i) => (
          <motion.div
            key={p.title}
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
            className="rounded-[24px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
          >
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
              {`0${i + 1}`}
            </p>
            <h3 className="mt-4 text-xl font-semibold leading-[1.3] tracking-[-0.02em] text-[var(--tf-ink)]">
              {p.title}
            </h3>
            <p className="mt-3 text-[15px] leading-[1.65] text-[var(--tf-slate)]">{p.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// What you get — compact recap block (homepage / pricing / request)
// =============================================================================

const WHAT_YOU_GET = [
  'AI disclosure drafts',
  'AI system / AI use summary',
  'Governance summary',
  'Evidence tracker',
  'Source notes',
  'Buyer / legal handoff',
  '30-day readiness roadmap',
  'ISO/IEC 42001-aligned checklist support',
  'EU AI Act transparency-readiness notes',
] as const;

export function WhatYouGet({
  variant = 'section',
  eyebrow = 'What you get',
  title = 'What you get in a TrustFolder pack',
  description,
  ctaHref,
  ctaLabel,
}: {
  variant?: 'section' | 'inline';
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const wrapperClass =
    variant === 'inline'
      ? 'rounded-[28px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-8 sm:p-10'
      : 'mx-auto my-16 max-w-[1320px] rounded-[36px] border border-[var(--tf-border)] bg-[var(--tf-surface)] px-8 py-12 sm:px-12 sm:py-16';
  return (
    <section className={wrapperClass} id="what-you-get">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--tf-accent)]">
        {eyebrow}
      </p>
      <h2 className="mt-4 max-w-3xl text-balance text-[34px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[40px]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-3xl text-[16px] leading-[1.6] text-[var(--tf-slate)]">
          {description}
        </p>
      )}
      <ul className="mt-8 grid gap-x-8 gap-y-3 text-[15px] text-[var(--tf-ink-soft)] sm:grid-cols-2 lg:grid-cols-4">
        {WHAT_YOU_GET.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
            <span className="leading-[1.55]">{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-[12px] leading-[1.6] text-[var(--tf-slate-soft)]">
        TrustFolder supports AI governance and transparency-readiness preparation. It is not legal
        advice, certification, or a compliance guarantee.
      </p>
      {ctaHref && ctaLabel && (
        <div className="mt-7">
          <Link
            href={ctaHref}
            className="inline-flex h-12 items-center rounded-full bg-[var(--tf-ink)] px-6 text-[14px] font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)]"
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </section>
  );
}

// =============================================================================
// Hero output bullets (used on homepage hero)
// =============================================================================

export const HERO_OUTPUT_BULLETS: ReadonlyArray<string> = [
  'AI disclosure drafts',
  'AI system / use summary',
  'Governance summary',
  'Evidence tracker',
  'Source notes',
  'Buyer / legal handoff',
  '30-day readiness roadmap',
  'ISO/IEC 42001-aligned checklist support',
  'EU AI Act transparency-readiness notes',
];

export function HeroOutputBullets({ bullets = HERO_OUTPUT_BULLETS }: { bullets?: ReadonlyArray<string> }) {
  return (
    <ul className="mt-8 grid gap-x-6 gap-y-2 text-[14px] text-[var(--tf-ink-soft)] sm:grid-cols-2">
      {bullets.map((b) => (
        <li key={b} className="flex items-start gap-2.5">
          <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

// =============================================================================
// Readiness areas — supports text on homepage + safety
// =============================================================================

const READINESS_AREAS = [
  'EU AI Act transparency-readiness',
  'AI disclosure readiness',
  'AI governance documentation',
  'AI vendor / buyer review preparation',
  'AI evidence folder preparation',
  'ISO/IEC 42001-aligned checklist support',
  'Legal-review handoff preparation',
] as const;

const PLANNED_MODULES = [
  'SOC 2 readiness evidence pack',
  'GDPR AI/data readiness pack',
  'Enterprise security questionnaire support',
  'DPA / privacy agreement handoff pack',
  'Full ISO/IEC 42001-aligned readiness pack',
] as const;

const EXPERT_REVIEW_AREAS = [
  'HIPAA / healthcare data',
  'Medical AI',
  'Employment / hiring AI',
  'Financial services AI',
  'Insurance / credit decisioning',
  'Children’s products',
  'Biometrics',
  'Law enforcement',
  'Critical infrastructure',
] as const;

const MODULE_GROUPS = [
  {
    title: 'Available readiness packs',
    body: 'Readiness drafts, evidence checklists, questionnaire support, and buyer/legal handoff materials.',
    ctaLabel: 'Request readiness pack',
    items: [
      ['AI governance and disclosure readiness', '/request?type=disclosure'],
      ['SOC 2 readiness evidence pack', '/request?type=soc2-readiness'],
      ['Enterprise security questionnaire support', '/request?type=security-questionnaire'],
      ['GDPR AI/data readiness pack', '/request?type=gdpr-ai-data-readiness'],
      ['ISO/IEC 42001-aligned readiness pack', '/request?type=iso42001-readiness'],
    ],
  },
  {
    title: 'Expert-review handoff packs',
    body: 'Structured intake summaries and expert-review handoff materials for sensitive privacy, healthcare, hiring, and regulated decisioning areas.',
    ctaLabel: 'Apply for expert handoff',
    items: [
      ['DPA / privacy agreement handoff', '/request?type=dpa-privacy-handoff'],
      ['HIPAA / healthcare data intake', '/request?type=hipaa-healthcare-intake'],
      ['Medical AI intake', '/request?type=medical-ai-intake'],
      ['Employment / hiring AI intake', '/request?type=employment-ai-intake'],
      ['Financial services / credit / insurance AI intake', '/request?type=financial-credit-insurance-intake'],
    ],
  },
  {
    title: 'Sensitive/high-risk intake only',
    body: 'Intake-only routing for products that should not be handled as automated compliance packs.',
    ctaLabel: 'Request intake review',
    items: [
      ['Children’s products', '/request?type=childrens-products-intake'],
      ['Biometrics', '/request?type=biometrics-intake'],
      ['Law enforcement', '/request?type=law-enforcement-critical-infrastructure-intake'],
      ['Critical infrastructure', '/request?type=law-enforcement-critical-infrastructure-intake'],
    ],
  },
] as const;

export function ReadinessAreas() {
  return (
    <section
      id="readiness"
      className="mx-auto max-w-[1520px] px-6 py-16 sm:px-8 lg:px-12 lg:py-20 2xl:px-16"
    >
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--tf-accent)]">
        What we help prepare for
      </p>
      <h2 className="mt-5 max-w-4xl text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.025em] sm:text-4xl lg:text-5xl">
        Current supported scope.
      </h2>
      <p className="mt-5 max-w-3xl text-[16px] leading-[1.65] text-[var(--tf-slate)]">
        TrustFolder helps B2B AI companies prepare review-ready AI governance documents, including
        AI disclosure drafts, AI use summaries, evidence trackers, source notes, buyer/legal
        handoff notes, and ISO/IEC 42001-aligned readiness checklists.
      </p>
      <p className="mt-4 max-w-3xl text-[14px] leading-[1.7] text-[var(--tf-slate-soft)]">
        TrustFolder supports AI governance and transparency-readiness preparation. It is not legal
        advice, certification, or a compliance guarantee.
      </p>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {READINESS_AREAS.map((area) => (
          <li
            key={area}
            className="rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-soft)]/60 px-5 py-4 text-[14px] leading-[1.5] text-[var(--tf-ink-soft)]"
          >
            {area}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PlannedModulesBlock() {
  return (
    <section
      id="planned-modules"
      className="mx-auto max-w-[1520px] px-6 py-16 sm:px-8 lg:px-12 lg:py-20 2xl:px-16"
    >
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--tf-accent)]">
        Roadmap
      </p>
      <h2 className="mt-5 max-w-4xl text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.025em] sm:text-4xl lg:text-5xl">
        Planned compliance-readiness modules
      </h2>
      <p className="mt-5 max-w-4xl text-[16px] leading-[1.65] text-[var(--tf-slate)]">
        TrustFolder is expanding into adjacent compliance-readiness packs for B2B AI teams. These
        modules will be released only after the document templates, QA checks, safety boundaries,
        and review workflow are ready.
      </p>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PLANNED_MODULES.map((module) => (
          <li
            key={module}
            className="rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-surface)] px-5 py-4 text-[14px] leading-[1.5] text-[var(--tf-ink-soft)]"
          >
            {module}
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-4xl text-[13px] leading-[1.7] text-[var(--tf-slate-soft)]">
        These are roadmap modules, not currently available products, and they are not checkout
        options.
      </p>
    </section>
  );
}

export function ExpertReviewOnlyBlock() {
  return (
    <section
      id="expert-review-only"
      className="mx-auto max-w-[1520px] px-6 py-16 sm:px-8 lg:px-12 lg:py-20 2xl:px-16"
    >
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--tf-accent)]">
        Safety boundary
      </p>
      <h2 className="mt-5 max-w-4xl text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.025em] sm:text-4xl lg:text-5xl">
        Expert-review only areas
      </h2>
      <p className="mt-5 max-w-4xl text-[16px] leading-[1.65] text-[var(--tf-slate)]">
        Some compliance areas are too sensitive for fully automated document generation.
        TrustFolder may help organize intake and handoff materials, but these areas require
        qualified expert review before use.
      </p>
      <p className="mt-4 max-w-4xl text-[14px] leading-[1.7] text-[var(--tf-slate-soft)]">
        These areas are not eligible for standard automated packs. They may be routed to expert
        review, custom scope, or declined.
      </p>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXPERT_REVIEW_AREAS.map((area) => (
          <li
            key={area}
            className="rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-soft)]/60 px-5 py-4 text-[14px] leading-[1.5] text-[var(--tf-ink-soft)]"
          >
            {area}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ComplianceModulesBlock({
  eyebrow = 'Compliance-readiness modules',
  title = 'Compliance-readiness modules for AI teams.',
  showCtas = false,
}: {
  eyebrow?: string;
  title?: string;
  showCtas?: boolean;
}) {
  return (
    <section
      id="compliance-readiness-modules"
      className="mx-auto max-w-[1520px] px-6 py-20 sm:px-8 lg:px-12 lg:py-24 2xl:px-16"
    >
      <div className="mb-12 max-w-5xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--tf-accent)]">
          {eyebrow}
        </p>
        <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        <p className="mt-6 max-w-4xl text-lg leading-8 text-[var(--tf-slate)]">
          TrustFolder currently prepares AI governance and disclosure readiness documents. We are
          expanding into adjacent evidence packs for security, privacy, vendor review, and
          expert-review handoffs.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {MODULE_GROUPS.map((group) => (
          <div
            key={group.title}
            className="rounded-[30px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-8 shadow-[0_24px_80px_rgba(7,17,31,0.08)]"
          >
            <h3 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-[var(--tf-ink)]">
              {group.title}
            </h3>
            <p className="mt-4 text-[15px] leading-7 text-[var(--tf-slate)]">{group.body}</p>
            <ul className="mt-7 space-y-3">
              {group.items.map(([label, href]) => (
                <li
                  key={label}
                  className="flex items-start justify-between gap-4 text-[15px] leading-6 text-[var(--tf-ink-soft)]"
                >
                  <span className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
                    <span>{label}</span>
                  </span>
                  {showCtas && (
                    <Link
                      href={href}
                      className="shrink-0 text-[13px] font-medium text-[var(--tf-accent)] underline decoration-[var(--tf-border-strong)] underline-offset-4"
                    >
                      Request
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            {showCtas && (
              <Link
                href={group.items[0][1]}
                className="mt-8 inline-flex h-11 items-center rounded-full bg-[var(--tf-ink)] px-5 text-[13px] font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)]"
              >
                {group.ctaLabel}
              </Link>
            )}
          </div>
        ))}
      </div>
      <p className="mt-8 max-w-5xl text-[13px] leading-7 text-[var(--tf-slate-soft)]">
        Some modules produce readiness drafts and evidence checklists. Sensitive or regulated areas
        are routed to expert review and are not handled as automated compliance packs.
      </p>
    </section>
  );
}

// =============================================================================
// FAQ section — used on homepage; structured for future JSON-LD upgrade.
// =============================================================================

const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'What documents does TrustFolder prepare?',
    a: 'TrustFolder helps B2B AI companies prepare review-ready AI governance documents, including AI disclosure drafts, AI use summaries, evidence trackers, source notes, buyer/legal handoff notes, and ISO/IEC 42001-aligned readiness checklists.',
  },
  {
    q: 'Is TrustFolder legal advice?',
    a: 'No. TrustFolder prepares AI-generated governance evidence drafts for review. It is not legal advice, certification, or a compliance guarantee.',
  },
  {
    q: 'Does TrustFolder make my company compliant under the EU AI Act?',
    a: 'No. TrustFolder helps prepare transparency-readiness and governance documentation for review. Final compliance decisions should be reviewed by qualified counsel.',
  },
  {
    q: 'Who is TrustFolder for?',
    a: 'B2B AI SaaS companies, AI agencies, chatbot products, AI agent platforms, and automation teams preparing for customer, buyer, legal, or internal review.',
  },
  {
    q: 'What happens after I run the free check?',
    a: 'You receive a fit summary and a recommended next step. If it is a fit, you can request a snapshot, disclosure pack, governance folder, or premium handoff.',
  },
  {
    q: 'What products are out of scope?',
    a: 'High-risk areas such as healthcare diagnosis, hiring, credit, insurance, biometrics, children\u2019s products, law enforcement, critical infrastructure, and education grading or admissions may require expert review and may not be eligible for automated packs.',
  },
];

export function FaqSection({
  eyebrow = 'Common questions',
  title = 'What people ask before requesting a pack.',
  faqs = FAQ,
  footer,
}: {
  eyebrow?: string;
  title?: string;
  faqs?: ReadonlyArray<{ q: string; a: string }>;
  footer?: ReactNode;
}) {
  // JSON-LD structured data for FAQPage. Server-safe (rendered as a script tag).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section
      id="faq"
      className="mx-auto max-w-[1320px] px-6 py-20 sm:px-8 lg:px-12 lg:py-24 2xl:px-16"
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-12 max-w-3xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--tf-accent)]">
          {eyebrow}
        </p>
        <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-5xl">
          {title}
        </h2>
      </div>
      <div className="grid gap-3">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-surface)] px-6 py-5 transition hover:bg-[var(--tf-surface)]/80"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium tracking-[-0.005em] text-[var(--tf-ink)]">
              <span>{f.q}</span>
              <span
                className="text-[var(--tf-slate-soft)] transition group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="mt-4 text-[15px] leading-[1.7] text-[var(--tf-slate)]">{f.a}</p>
          </details>
        ))}
      </div>
      {footer && <div className="mt-10">{footer}</div>}
    </section>
  );
}
