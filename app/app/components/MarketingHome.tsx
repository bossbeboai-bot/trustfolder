'use client';

/**
 * Homepage — Phase 3.8 premium narrative rebuild.
 *
 * Direction: Premium AI Infrastructure × Editorial Evidence System
 * (see docs/DESIGN.md §3 for the full justification).
 *
 * Sections, top to bottom:
 *  1. Cinematic hero with editorial display H1 + 3-layer evidence scene
 *  2. Trust strip
 *  3. Platform pillars (Website Intelligence / Evidence Folder Engine /
 *     Buyer Handoff Layer)
 *  4. Problem section (5 cards)
 *  5. How-it-works rail (4 steps)
 *  6. Inside the evidence folder (document stack mockup)
 *  7. Packages preview (5 cards)
 *  8. Agencies dark block
 *  9. Safety section with risk areas
 * 10. Final CTA
 *
 * All motion routed through Framer Motion with `useReducedMotion` guards.
 */

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { SiteFooter, SiteHeader } from './SiteChrome';
import {
  DarkCard,
  DocumentCard,
  EvidenceScene,
  Eyebrow,
  MonoLabel,
  MonoNumeral,
  PrimaryLink,
  ProcessRailCard,
  Reveal,
  SecondaryLink,
} from './MarketingPrimitives';
import {
  ComplianceModulesBlock,
  ExpertReviewOnlyBlock,
  FaqSection,
  HeroOutputBullets,
  PlannedModulesBlock,
  ReadinessAreas,
  WhatTrustFolderPrepares,
  WhatYouGet,
} from './ClarityBlocks';

const pillars = [
  {
    eyebrow: 'Website Intelligence',
    title: 'Scans your AI claims where buyers read them.',
    body: 'Pulls product, pricing, and about pages. Extracts AI-use signals, customer-exposure language, and EU/UK references — the surface buyers and legal review first.',
  },
  {
    eyebrow: 'Evidence Folder Engine',
    title: 'Turns confirmed product context into review-ready drafts.',
    body: 'Disclosure language, governance summary, evidence tracker, and source notes — organised around your specific AI feature, not a generic template.',
  },
  {
    eyebrow: 'Buyer Handoff Layer',
    title: 'Packages everything into a clean folder for review.',
    body: 'Cover sheet, navigation index, lawyer-review note, and a 30-day next-steps roadmap — what a senior counsel or enterprise buyer expects to see.',
  },
];

const problems = [
  'AI claims are scattered across product, pricing, and about pages.',
  'Buyer and legal questions arrive late in the deal.',
  'Founders do not know which documents to prepare first.',
  'Free templates do not understand your specific AI feature.',
  'Lawyers are expensive when the evidence is messy.',
];

const steps = [
  ['01', 'Enter your website', 'Start with the product URL buyers already review.'],
  ['02', 'Confirm what we found', 'Review AI use, customer exposure, EU signals, and scope flags.'],
  ['03', 'TrustFolder prepares your folder', 'Disclosure, governance, evidence, and handoff drafts assembled around your product.'],
  ['04', 'Use it for buyer or legal review', 'Bring a cleaner package to review — without claiming certification.'],
] as const;

const packs = [
  {
    name: 'Free Eligibility Check',
    price: 'Free',
    cta: 'Start free check',
    href: '/assessment',
    items: ['Likely fit / needs review / out of scope', 'Recommended next step', 'No documents'],
  },
  {
    name: 'AI Website Trust Snapshot',
    price: '$99',
    cta: 'Request snapshot',
    href: '/request?type=snapshot',
    items: ['Website scan summary', 'AI product overview', 'Likely disclosure areas', 'Readiness result', 'Next steps'],
  },
  {
    name: 'AI Disclosure Pack',
    price: '$499',
    cta: 'Request pack',
    href: '/request?type=disclosure',
    featured: true,
    items: ['Chatbot disclosure', 'AI-generated content notice', 'AI system disclosure page', 'Placement guide', 'Internal transparency summary', 'Legal-review note'],
  },
  {
    name: 'Buyer-Ready AI Governance Folder',
    price: '$999',
    cta: 'Request pack',
    href: '/request?type=governance',
    items: ['AI system inventory', 'Governance policy draft', 'Disclosure docs', 'Evidence tracker', 'Risk notes', 'Lawyer/buyer handoff', '30-day roadmap'],
  },
  {
    name: 'Enterprise Buyer Handoff',
    price: '$2,500+',
    cta: 'Apply',
    href: '/request?type=premium',
    items: ['Everything in governance folder', 'Handoff cleanup', 'Loom walkthrough', 'One revision', 'Optional advisor-supported review later'],
  },
];

const folderItems = [
  { layer: '01', title: 'AI system summary', meta: 'What the product does · who uses it · where' },
  { layer: '02', title: 'AI disclosure drafts', meta: 'Chatbot · generated content · system page' },
  { layer: '03', title: 'Placement guide', meta: 'Where each disclosure lives on your site' },
  { layer: '04', title: 'Governance policy draft', meta: 'Internal transparency · review cadence' },
  { layer: '05', title: 'Evidence tracker', meta: 'Source notes · review status · open items' },
  { layer: '06', title: 'Lawyer / buyer handoff', meta: 'Cover sheet · scope · open questions' },
];

const riskAreas = [
  'Hiring',
  'Healthcare diagnosis',
  'Credit scoring',
  'Biometrics',
  'Children’s products',
  'Law enforcement',
  'Critical infrastructure',
  'Education grading',
];

export default function HomePage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--tf-bg)] text-[var(--tf-ink)]">
      <SiteHeader active="product" />
      <main>
        {/* ---------------------------------------------------------------- */}
        {/* 1. Cinematic hero — editorial H1 + 3-layer evidence scene        */}
        {/* ---------------------------------------------------------------- */}
        <section
          id="product"
          className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-[1600px] gap-12 px-6 pb-16 pt-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:px-12 lg:pb-20 lg:pt-16 2xl:px-16"
        >
          {/* soft accent halo */}
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[620px] w-[1000px] -translate-x-1/2 rounded-full bg-[var(--tf-accent-soft)] blur-3xl" />
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="self-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,124,138,0.2)] bg-[var(--tf-accent-soft)] px-4 py-1.5">
              <MonoLabel>AI governance documents · review-ready drafts</MonoLabel>
            </span>
            <h1 className="mt-8 max-w-5xl text-balance text-[clamp(3.4rem,4.9vw,6rem)] font-semibold leading-[0.94] tracking-[-0.065em]">
              AI governance documents for B2B AI companies selling to serious buyers.
            </h1>
            <p className="mt-8 max-w-3xl text-pretty text-xl leading-9 text-[var(--tf-slate)] sm:text-2xl sm:leading-10">
              TrustFolder scans your AI product website and prepares review-ready drafts for AI
              disclosures, governance summaries, evidence trackers, source notes, and
              buyer/legal handoff documents.
            </p>
            <HeroOutputBullets />
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <PrimaryLink href="/assessment">Run free check</PrimaryLink>
              <SecondaryLink href="/examples">See sample documents</SecondaryLink>
            </div>
            <p className="mt-7 font-mono text-[12px] uppercase leading-6 tracking-[0.18em] text-[var(--tf-slate-soft)]">
              Not legal advice · Not certification · Not a compliance guarantee
            </p>
          </motion.div>
          <EvidenceScene />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* 1.5. What TrustFolder prepares — explicit document list          */}
        {/* ---------------------------------------------------------------- */}
        <WhatTrustFolderPrepares
          description="Every TrustFolder pack is a small folder of related drafts. The list below is what arrives in the higher tiers — lighter tiers ship a subset."
        />

        {/* ---------------------------------------------------------------- */}
        {/* 2. Trust strip                                                   */}
        {/* ---------------------------------------------------------------- */}
        <Reveal className="border-y border-[var(--tf-border)] bg-[var(--tf-bg-soft)]/80 px-6 py-8 sm:px-8">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4 text-base leading-7 md:flex-row md:items-center md:justify-between">
            <p className="max-w-4xl text-lg text-[var(--tf-ink-soft)]">
              For B2B AI SaaS, AI agencies, chatbot products, agent platforms, and AI automation
              teams preparing for buyer review.
            </p>
            <p className="text-base text-[var(--tf-slate)]">
              Not legal advice. Not certification. Not a compliance guarantee.
            </p>
          </div>
        </Reveal>

        {/* ---------------------------------------------------------------- */}
        {/* 3. Platform pillars                                              */}
        {/* ---------------------------------------------------------------- */}
        <Section
          id="platform"
          eyebrow="The platform"
          title="A small platform with three clear jobs."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.eyebrow}>
                <DocumentCard className="flex min-h-[360px] flex-col">
                  <div className="flex items-center justify-between">
                    <MonoNumeral>{`0${i + 1}`}</MonoNumeral>
                    <MonoLabel tone="soft">Layer · {`0${i + 1}`}</MonoLabel>
                  </div>
                  <p className="mt-12 font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
                    {pillar.eyebrow}
                  </p>
                  <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em]">
                    {pillar.title}
                  </h3>
                  <p className="mt-5 text-base leading-8 text-[var(--tf-slate)]">{pillar.body}</p>
                </DocumentCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* 4. Problem section                                               */}
        {/* ---------------------------------------------------------------- */}
        <Section
          id="problem"
          eyebrow="The buyer-review gap"
          title="Your buyers will not only ask what your AI does. They will ask how it is governed."
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {problems.map((item) => (
              <Reveal
                key={item}
                className="min-h-[240px] rounded-[30px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-8 shadow-[0_26px_90px_rgba(7,17,31,0.07)]"
              >
                <div className="mb-16 h-px w-full bg-[var(--tf-border)]" />
                <p className="text-xl font-medium leading-8 tracking-[-0.035em] text-[var(--tf-ink-soft)]">
                  {item}
                </p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* 5. How it works                                                  */}
        {/* ---------------------------------------------------------------- */}
        <Section
          id="how-it-works"
          eyebrow="How it works"
          title="A calm handoff flow from website scan to review-ready folder."
        >
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map(([k, title, body]) => (
              <Reveal key={title}>
                <ProcessRailCard step={k} title={title} body={body} />
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* 6. Inside the evidence folder                                    */}
        {/* ---------------------------------------------------------------- */}
        <Section
          id="inside"
          eyebrow="Inside the evidence folder"
          title="Document layers your buyer, internal team, or lawyer can actually review."
        >
          <div className="grid gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <Reveal className="max-w-2xl">
              <p className="text-xl leading-9 text-[var(--tf-slate)]">
                TrustFolder organises the materials that usually live across a website, sales
                call, product doc, and founder memory into a single structured handoff folder —
                so the next person reviewing your AI does not have to assemble it themselves.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PrimaryLink href="/request?type=governance">Request governance folder</PrimaryLink>
                <SecondaryLink href="/examples">See example folder</SecondaryLink>
              </div>
              <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
                Sample · Not a real customer pack
              </p>
            </Reveal>
            <FolderIndex items={folderItems} />
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* 7. Packages preview                                              */}
        {/* ---------------------------------------------------------------- */}
        <Section
          id="packs"
          eyebrow="Request-oriented packs"
          title="Choose the level of buyer-review preparation you need."
        >
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {packs.map((pack) => (
              <Reveal key={pack.name}>
                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex min-h-[520px] flex-col rounded-[32px] border p-8 shadow-[0_28px_100px_rgba(0,0,0,0.4)] ${
                    pack.featured
                      ? 'border-[var(--tf-border-strong)] bg-[var(--tf-paper)] text-[var(--tf-ink)]'
                      : 'border-[var(--tf-border)] bg-[var(--tf-surface)]'
                  }`}
                >
                  <p
                    className={`text-base ${
                      pack.featured ? 'text-[#a9dce2]' : 'text-[var(--tf-slate)]'
                    }`}
                  >
                    {pack.price}
                  </p>
                  <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.045em]">
                    {pack.name}
                  </h3>
                  <ul
                    className={`mt-8 space-y-3 text-base leading-7 ${
                      pack.featured ? 'text-[var(--tf-ink-soft)]' : 'text-[var(--tf-slate)]'
                    }`}
                  >
                    {pack.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                            pack.featured ? 'bg-[#a9dce2]' : 'bg-[var(--tf-accent)]'
                          }`}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={pack.href}
                    className={`mt-auto inline-flex h-14 items-center justify-center rounded-full px-6 text-base font-medium transition ${
                      pack.featured
                        ? 'bg-[var(--tf-ink)] text-[var(--tf-on-light)] hover:bg-[var(--tf-ink-soft)]'
                        : 'border border-[var(--tf-border-strong)] bg-[var(--tf-paper)] text-[var(--tf-ink)] hover:border-[var(--tf-ink-soft)]/40 hover:bg-[var(--tf-document)]'
                    }`}
                  >
                    {pack.cta}
                  </Link>
                </motion.div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <Link
              href="/pricing"
              className="text-base font-medium text-[var(--tf-accent)] underline decoration-[var(--tf-border-strong)] underline-offset-4 transition hover:text-[var(--tf-accent-deep)]"
            >
              See full pricing details →
            </Link>
          </Reveal>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* 8. Agencies block                                                */}
        {/* ---------------------------------------------------------------- */}
        <Reveal id="agencies" className="mx-auto max-w-[1520px] px-6 py-24 sm:px-8 lg:px-12 2xl:px-16">
          <DarkCard className="overflow-hidden p-10 sm:p-14 lg:p-20">
            <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <div>
                <MonoLabel tone="invert">For AI agencies</MonoLabel>
                <h2 className="mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[1] tracking-[-0.06em] sm:text-7xl">
                  Add a governance handoff folder to every AI client project.
                </h2>
              </div>
              <div>
                <p className="text-xl leading-9 text-[var(--tf-slate)]">
                  TrustFolder helps AI agencies deliver cleaner client handoffs for chatbots,
                  agents, and automation projects — without owning the legal review.
                </p>
                <Link
                  href="/request?type=agency"
                  className="mt-8 inline-flex h-14 items-center rounded-full bg-[var(--tf-ink)] px-8 text-base font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)]"
                >
                  Request agency pack
                </Link>
              </div>
            </div>
          </DarkCard>
        </Reveal>

        {/* ---------------------------------------------------------------- */}
        {/* 8.5. Readiness areas — what we help prepare for                  */}
        {/* ---------------------------------------------------------------- */}
        <ReadinessAreas />

        <ComplianceModulesBlock />

        {/* ---------------------------------------------------------------- */}
        {/* 9. Safety section                                                */}
        {/* ---------------------------------------------------------------- */}
        <Section
          id="safety"
          eyebrow="Safety and scope"
          title="Safe by default. Clear when expert review is needed."
        >
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <DocumentCard className="h-full">
                <p className="text-xl leading-9 text-[var(--tf-slate)]">
                  We do not auto-generate packs for high-risk areas. For these, TrustFolder
                  routes you to expert review instead of producing a generic pack.
                </p>
                <div className="mt-8">
                  <PrimaryLink href="/safety">Read scope policy</PrimaryLink>
                </div>
              </DocumentCard>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2">
              {riskAreas.map((item) => (
                <Reveal
                  key={item}
                  className="rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-document)] px-6 py-5 text-base font-medium text-[var(--tf-ink-soft)]"
                >
                  {item}
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* 9.5. What you get — compact recap                                */}
        {/* ---------------------------------------------------------------- */}
        <WhatYouGet
          description="Every pack ships as a structured document folder. The exact contents depend on the tier — see /pricing for a side-by-side comparison."
          ctaHref="/pricing"
          ctaLabel="Compare packs"
        />

        {/* ---------------------------------------------------------------- */}
        {/* 9.7. FAQ — homepage answers + JSON-LD                            */}
        {/* ---------------------------------------------------------------- */}
        <FaqSection />

        {/* ---------------------------------------------------------------- */}
        {/* 10. Final CTA                                                    */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 py-28 sm:px-8 lg:px-12 2xl:px-16">
          <Reveal className="mx-auto max-w-[1520px] rounded-[48px] border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] p-10 text-center shadow-[0_36px_150px_rgba(7,17,31,0.13)] sm:p-16 lg:p-24">
            <MonoLabel>Ready when you are</MonoLabel>
            <h2 className="mx-auto mt-5 max-w-5xl text-balance text-5xl font-semibold leading-[1] tracking-[-0.06em] sm:text-7xl">
              Prepare your AI product for serious buyer review.
            </h2>
            <p className="mx-auto mt-7 max-w-3xl text-xl leading-9 text-[var(--tf-slate)]">
              Start with a free eligibility check, then request the paid pack that matches your
              buyer-review moment.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryLink href="/assessment">Run free check</PrimaryLink>
              <SecondaryLink href="/request?type=disclosure">Request paid pack</SecondaryLink>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Local helpers                                                              */
/* -------------------------------------------------------------------------- */

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-[1520px] px-6 py-20 sm:px-8 lg:px-12 lg:py-28 2xl:px-16">
      <Reveal className="mb-12 max-w-5xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
          {title}
        </h2>
      </Reveal>
      {children}
    </section>
  );
}

/**
 * Folder index — the cinematic document-stack mockup used in section 6.
 * Six rows in a single Document card with monospace layer numerals.
 * Tilted slightly so it reads as "a real folder" without being kitschy.
 */
function FolderIndex({
  items,
}: {
  items: { layer: string; title: string; meta: string }[];
}) {
  const reduceMotion = useReducedMotion();
  return (
    <Reveal className="relative">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 30, rotate: -1.5 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: -1.5 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[42px] border border-[var(--tf-border-strong)] bg-[var(--tf-document)] p-8 shadow-[0_38px_150px_rgba(7,17,31,0.16)] sm:p-11 lg:p-12"
      >
        <div className="pointer-events-none absolute -right-12 -top-10 h-44 w-64 rotate-6 rounded-[32px] border border-[var(--tf-border)] bg-[var(--tf-paper)]/80" />
        <div className="flex items-center justify-between">
          <MonoLabel tone="soft">TrustFolder · Evidence pack</MonoLabel>
          <span className="rounded-full border border-[var(--tf-border)] bg-[var(--tf-surface)] px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate)]">
            DRAFT
          </span>
        </div>
        <h3 className="mt-8 text-4xl font-semibold tracking-[-0.055em]">
          Acme.ai · Buyer-Ready Folder
        </h3>
        <p className="mt-3 text-lg leading-8 text-[var(--tf-slate)]">
          Generated · 8 documents · prepared for review
        </p>
        <ul className="mt-9 divide-y divide-[var(--tf-border)] border-y border-[var(--tf-border)]">
          {items.map((it) => (
            <li
              key={it.layer}
              className="flex items-center justify-between gap-5 py-5 transition hover:bg-[var(--tf-surface)]"
            >
              <div className="flex items-center gap-6">
                <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
                  {it.layer}
                </span>
                <div>
                  <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--tf-ink)]">
                    {it.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--tf-slate)]">{it.meta}</p>
                </div>
              </div>
              <span className="text-2xl text-[var(--tf-slate-soft)]" aria-hidden>
                →
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
          ↳ source · website scan · founder confirmation
        </p>
      </motion.div>
    </Reveal>
  );
}
