/**
 * Marketing homepage — Phase 4 rebuild.
 *
 * Implements the 14-section conversion structure defined in
 * trustfolder_windsurf_prompt.md + homepage preview reference.
 *
 * Server component. Client-only sub-components (HeroDocumentLoop, Reveal, Nav)
 * opt into 'use client' themselves, so this file stays static-rendering
 * friendly.
 */

import type { ReactNode } from 'react';
import { MarketingShell } from '../components/Shell';
import { PrimaryCTA, GhostCTA, TextCTA, InverseCTA } from '../components/Button';
import { TrustBadge, CheckDot } from '../components/TrustBadge';
import { DocumentCard } from '../components/DocumentCard';
import { ObjectionCard } from '../components/ObjectionCard';
import { PricingCard, type PricingFeature } from '../components/PricingCard';
import { FounderCard } from '../components/FounderCard';
import { HeroDocumentLoop } from '../components/HeroDocumentLoop';
import { Reveal } from '../components/Reveal';

// --- Content constants (copy-bank per brief §SAMPLE COPY BANK) ----------

const HERO = {
  eyebrow: 'AI Governance · EU AI Act · Buyer Readiness',
  h1: 'Your enterprise buyer just asked how your AI is governed.',
  sub:
    'TrustFolder scans your product website and assembles a structured evidence folder - AI disclosures, governance summary, buyer handoff, and source notes for legal review.',
  trustLine: ['AI transparency readiness', 'Buyer handoff', 'Source-traced drafts'],
};

const STATS = [
  ['8', 'documents per pack'],
  ['< 24h', 'typical first draft window'],
  ['$499', 'starting paid pack'],
];

const PROBLEMS = [
  "AI claims scattered across product, pricing, and about pages",
  "Buyer or legal questions arrive late in the deal",
  "No one owns the documentation internally",
  "Free templates don't know your specific product",
  "Lawyers charge $400/hr to start from your messy notes",
];

const SOLUTIONS = [
  "One structured folder, scanned from your actual website",
  "Review-ready in hours, not weeks",
  "8 specific documents, not a generic template",
  "Every claim traced back to a source",
  "Your lawyer starts from a clean first draft",
];

const OBJECTION_CARDS = [
  {
    title: 'A chat prompt',
    items: [
      'Generates generic paragraphs',
      'No source tracing',
      "Lawyer can't verify claims",
      'No folder structure',
      'Starts from nothing',
    ],
    variant: 'neutral' as const,
  },
  {
    title: 'A generic template',
    items: [
      'Blank fields to fill in',
      'Not product-specific',
      'No website scan',
      'No readiness score',
      'No buyer handoff layer',
    ],
    variant: 'neutral' as const,
  },
  {
    title: 'TrustFolder',
    items: [
      'Scanned from your actual website',
      'Every claim traced to a source',
      'Scored against EU AI Act signals',
      'Structured pack a lawyer can review',
      'Buyer handoff layer included',
    ],
    variant: 'featured' as const,
    badge: 'Structured',
  },
];

const DOCUMENTS = [
  ['01', 'AI disclosure drafts', 'Plain-language disclosure for your product page and vendor intake.'],
  ['02', 'AI use summary', 'One-paragraph summary of how AI is used inside the product.'],
  ['03', 'Evidence tracker', 'Every claim mapped to a verifiable source on your site.'],
  ['04', 'Governance summary', 'Who is accountable for AI decisions, review cadence, and escalation.'],
  ['05', 'Buyer / legal handoff', 'Cover sheet + navigation index for senior counsel review.'],
  ['06', 'Source notes', 'Scan log with timestamps — what we read and when.'],
  ['07', '30-day readiness roadmap', 'What to fix next, in order of buyer impact.'],
  ['08', 'ISO/IEC 42001-aligned checklist', 'Readiness checkpoints aligned to the AI management-system scope.'],
  ['09', 'EU AI Act transparency notes', 'Article 50 / 52 readiness notes, not a compliance statement.'],
];

const STEPS = [
  ['01', 'Enter your website URL', 'Start with the product page your buyers already review.'],
  ['02', 'Confirm what we found', 'Review AI signals, customer exposure, EU flags, and scope.'],
  ['03', 'TrustFolder assembles your folder', '8 documents drafted around your specific product.'],
  ['04', 'Use it for buyer or legal review', 'Hand a clean package to review — without claiming certification.'],
];

const BEFORE_LIST = [
  'Buyer emails asking for AI governance docs',
  'Founder opens Notion, Slack, 4 browser tabs',
  'Sales call paused for "legal review"',
  'Three weeks later the deal re-engages',
  'Legal team still improvising answers',
];

const AFTER_LIST = [
  'Buyer asks. You send the TrustFolder pack.',
  'Disclosure drafts, governance summary, source notes',
  'Evidence tracker with every claim verified',
  'Lawyer reviews a clean starting folder',
  'Deal moves forward.',
];

const SCENARIO_QUOTES = [
  {
    text:
      "A prospect's legal team just asked for our AI disclosure docs. We don't have anything written down. What do we even send them?",
    from: 'Founder, B2B AI SaaS',
  },
  {
    text:
      "Our enterprise RFP has 12 questions about AI governance and data use. I've been copy-pasting from our website and it looks terrible.",
    from: 'Head of Product, AI agency',
  },
  {
    text:
      "We're EU-based and selling to German banks. They want to see our AI Act transparency docs. We have nothing.",
    from: 'Co-founder, AI automation platform',
  },
];

const TRUST_BADGES = [
  'EU AI Act 2026',
  'ISO/IEC 42001-aligned checklist',
  'GDPR-aware readiness',
  'Review-ready drafts',
  'Buyer handoff support',
];

const PRICING_PREVIEW: Array<{
  tier: string;
  price: string;
  priceSuffix?: string;
  description: string;
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref: string;
  popular?: boolean;
}> = [
  {
    tier: 'Free',
    price: '$0',
    description: 'Eligibility check — see where your AI product stands in minutes.',
    features: [
      { label: 'Readiness verdict', included: true },
      { label: 'AI signal scan', included: true },
      { label: 'Pack generation', included: false },
    ],
    ctaLabel: 'Run free check',
    ctaHref: '/assessment',
  },
  {
    tier: 'Disclosure Pack',
    price: '$499',
    priceSuffix: 'one-off',
    description: 'Core 8-document pack for buyer and legal review.',
    features: [
      { label: '8 documents drafted from your site', included: true },
      { label: 'Source notes + evidence tracker', included: true },
      { label: 'Buyer handoff cover sheet', included: true },
    ],
    ctaLabel: 'Request disclosure pack',
    ctaHref: '/request?type=disclosure',
    popular: true,
  },
  {
    tier: 'Buyer-ready Folder',
    price: '$999',
    priceSuffix: 'one-off',
    description: 'Everything in the pack plus EU AI Act + ISO 42001 readiness notes.',
    features: [
      { label: 'Disclosure pack + readiness notes', included: true },
      { label: '30-day roadmap + expert follow-up', included: true },
      { label: 'Buyer / vendor intake ready', included: true },
    ],
    ctaLabel: 'Request buyer folder',
    ctaHref: '/request?type=buyer-ready',
  },
];

// --- Page -----------------------------------------------------------------

export default function HomePage() {
  return (
    <MarketingShell>
      <Hero />
      <StatBar />
      <ProblemSection />
      <ObjectionSection />
      <DocumentInventory />
      <HowItWorks />
      <BeforeAfter />
      <FounderSignal />
      <Quotes />
      <TrustBadgeRow />
      <PricingPreview />
      <AgencyStrip />
      <FinalCTA />
    </MarketingShell>
  );
}

// --- Sections -------------------------------------------------------------

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-site px-6 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-[1.08fr_0.92fr]">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
              {HERO.eyebrow}
            </p>
            <h1 className="mt-4 font-serif text-[36px] font-semibold leading-[1.08] tracking-tightish text-[color:var(--m-black)] md:text-[52px]">
              {HERO.h1}
            </h1>
            <p className="mt-6 max-w-[48ch] text-[16px] leading-relaxed text-[color:var(--m-muted)] md:text-[17px]">
              {HERO.sub}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <PrimaryCTA href="/assessment" size="lg">
                Run free readiness check
              </PrimaryCTA>
              <TextCTA href="/examples">See a sample folder →</TextCTA>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-[11px] tracking-wideish text-[color:var(--m-subtle)]">
              {HERO.trustLine.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckDot />
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <HeroDocumentLoop />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function StatBar() {
  return (
    <section className="border-y border-[color:var(--m-border)] bg-[color:var(--m-cream)]">
      <div className="mx-auto grid max-w-site grid-cols-1 md:grid-cols-3">
        {STATS.map(([n, label], i) => (
          <div
            key={label}
            className={`px-6 py-7 text-center md:px-8 md:py-8 ${
              i > 0 ? 'border-t border-[color:var(--m-border)] md:border-l md:border-t-0' : ''
            }`}
          >
            <p className="font-serif text-[32px] font-semibold leading-none text-[color:var(--m-black)] md:text-[36px]">
              {n}
            </p>
            <p className="mt-2 text-[13px] text-[color:var(--m-muted)]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionWrap({
  children,
  className = '',
  tone = 'white',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'white' | 'cream' | 'dark';
}) {
  const bg =
    tone === 'cream'
      ? 'bg-[color:var(--m-cream)]'
      : tone === 'dark'
      ? 'bg-[color:var(--m-black)] text-[color:var(--m-white)]'
      : 'bg-[color:var(--m-white)]';
  return (
    <section className={`${bg} ${className}`}>
      <div className="mx-auto max-w-site px-6 py-16 md:px-8 md:py-24">{children}</div>
    </section>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
      {children}
    </p>
  );
}

function SectionH2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`mt-3 max-w-[30ch] font-serif text-[28px] font-semibold leading-tight tracking-tightish text-[color:var(--m-black)] md:text-[36px] ${className}`}
    >
      {children}
    </h2>
  );
}

function ProblemSection() {
  return (
    <SectionWrap tone="cream">
      <Reveal>
        <SectionEyebrow>The problem</SectionEyebrow>
        <SectionH2>The deal stalls when legal asks about AI.</SectionH2>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Reveal delay={0.05}>
          <ProblemColumn
            tone="bad"
            label="Without TrustFolder"
            items={PROBLEMS}
            icon="✗"
          />
        </Reveal>
        <Reveal delay={0.12}>
          <ProblemColumn
            tone="good"
            label="With TrustFolder"
            items={SOLUTIONS}
            icon="✓"
          />
        </Reveal>
      </div>
    </SectionWrap>
  );
}

function ProblemColumn({
  tone,
  label,
  items,
  icon,
}: {
  tone: 'bad' | 'good';
  label: string;
  items: string[];
  icon: string;
}) {
  const bg = tone === 'bad' ? 'bg-[color:var(--m-red-light)]' : 'bg-[color:var(--m-green-light)]';
  const chipBg =
    tone === 'bad'
      ? 'bg-[rgba(139,32,32,0.12)] text-[color:var(--m-red)]'
      : 'bg-[rgba(26,107,74,0.14)] text-[color:var(--m-green-dark)]';
  const iconColor = tone === 'bad' ? 'text-[color:var(--m-red)]' : 'text-[color:var(--m-green-dark)]';
  return (
    <div className={`rounded-xl p-6 md:p-7 ${bg}`}>
      <span className={`inline-block rounded-sm px-2 py-0.5 font-mono text-[11px] tracking-wideish ${chipBg}`}>
        {label}
      </span>
      <ul className="mt-4 divide-y divide-[color:var(--m-border)]">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-3 py-3 text-[13.5px] leading-relaxed text-[color:var(--m-muted)]">
            <span aria-hidden className={`mt-[3px] font-mono text-[13px] ${iconColor}`}>
              {icon}
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ObjectionSection() {
  return (
    <SectionWrap>
      <Reveal>
        <SectionEyebrow>Objection killer</SectionEyebrow>
        <SectionH2>Why not just ask ChatGPT?</SectionH2>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {OBJECTION_CARDS.map((card, i) => (
          <Reveal key={card.title} delay={0.05 + i * 0.06}>
            <ObjectionCard
              title={card.title}
              items={card.items}
              variant={card.variant}
              badge={'badge' in card ? card.badge : undefined}
            />
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.25}>
        <p className="mt-8 rounded-md bg-[color:var(--m-cream)] px-5 py-4 font-mono text-[12px] italic leading-relaxed text-[color:var(--m-muted)]">
          The difference isn&apos;t speed. It&apos;s structure, traceability, and a first draft your
          lawyer can actually start from.
        </p>
      </Reveal>
    </SectionWrap>
  );
}

function DocumentInventory() {
  return (
    <SectionWrap tone="cream">
      <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-start">
        <div>
          <Reveal>
            <SectionEyebrow>Inside the pack</SectionEyebrow>
            <SectionH2>The exact documents that arrive in your folder.</SectionH2>
            <p className="mt-4 max-w-[48ch] text-[14.5px] leading-relaxed text-[color:var(--m-muted)]">
              Each document is drafted from your actual product website - not a
              template. Every claim links to a source, so your lawyer starts from a
              cleaner position.
            </p>
          </Reveal>

          <ul className="mt-8 divide-y divide-[color:var(--m-border)] rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-white)]">
            {DOCUMENTS.map(([num, name, desc], i) => (
              <Reveal as="li" key={num} delay={0.03 * i}>
                <div className="group grid grid-cols-[auto_1fr] items-start gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-[color:var(--m-cream)]">
                  <span className="mt-0.5 font-mono text-[11px] text-[color:var(--m-subtle)]">
                    {num}
                  </span>
                  <div>
                    <p className="text-[13.5px] font-medium text-[color:var(--m-black)]">
                      {name}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[color:var(--m-muted)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:opacity-80">
                      {desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <Reveal delay={0.1}>
            <DocumentCard
              docNumber="01"
              title="AI DISCLOSURE DRAFT"
              stamp="Draft — prepared for review"
              previewLines={5}
              source="acme.ai/product — sample"
            />
          </Reveal>
          <Reveal delay={0.18}>
            <DocumentCard
              docNumber="03"
              title="EVIDENCE TRACKER"
              stamp="Linked to sources"
              previewLines={4}
              blurred
            />
          </Reveal>
          <Reveal delay={0.24}>
            <DocumentCard
              docNumber="05"
              title="BUYER / LEGAL HANDOFF"
              stamp="Cover sheet"
              previewLines={3}
              source="Prepared for review by counsel"
              accent="featured"
            />
          </Reveal>
        </div>
      </div>
    </SectionWrap>
  );
}

function HowItWorks() {
  return (
    <SectionWrap>
      <Reveal>
        <SectionEyebrow>How it works</SectionEyebrow>
        <SectionH2>From website scan to structured evidence folder.</SectionH2>
      </Reveal>
      <ol className="mt-10 grid gap-6 md:grid-cols-4">
        {STEPS.map(([num, title, desc], i) => (
          <Reveal as="li" key={num} delay={0.05 + i * 0.07}>
            <div className="relative h-full rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-5 transition-colors duration-200 hover:border-[color:var(--m-border-mid)]">
              <div className="flex items-center gap-2 font-mono text-[10px] font-medium tracking-wideish text-[color:var(--m-green)]">
                <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-[color:var(--m-green)]" />
                Step {num}
              </div>
              <p className="mt-3 text-[14px] font-medium text-[color:var(--m-black)]">{title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--m-muted)]">{desc}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </SectionWrap>
  );
}

function BeforeAfter() {
  return (
    <section className="bg-[color:var(--m-black)] text-[color:var(--m-white)]">
      <div className="mx-auto max-w-site px-6 py-16 md:px-8 md:py-24">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-white/50">
            Before. After.
          </p>
          <h2 className="mt-3 max-w-[30ch] font-serif text-[28px] font-semibold leading-tight tracking-tightish text-white md:text-[36px]">
            Before TrustFolder. After TrustFolder.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/10 md:grid-cols-2">
          <Reveal className="h-full">
            <div className="h-full bg-[rgba(139,32,32,0.22)] p-7">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-white/50">Before</p>
              <ul className="mt-5 space-y-3 text-[13.5px] text-white/70">
                {BEFORE_LIST.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="h-full">
            <div className="h-full bg-[rgba(26,107,74,0.28)] p-7">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-white/60">After</p>
              <ul className="mt-5 space-y-3 text-[13.5px] text-white/85">
                {AFTER_LIST.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[color:var(--m-green-light)]" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FounderSignal() {
  return (
    <SectionWrap>
      <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:items-center">
        <Reveal>
          <SectionEyebrow>Founder signal</SectionEyebrow>
          <SectionH2>Built by someone who&apos;s been in the room.</SectionH2>
        </Reveal>
        <Reveal delay={0.1}>
          <FounderCard
            name="Aaron Miller"
            initials="AM"
            bio="Built TrustFolder after watching AI founders lose deals to documentation gaps they didn't know existed. The product is opinionated about what buyers and legal teams actually need to see."
            email="aaron.miller198@protonmail.com"
          />
        </Reveal>
      </div>
    </SectionWrap>
  );
}

function Quotes() {
  return (
    <SectionWrap tone="cream">
      <Reveal>
        <SectionEyebrow>Scenarios</SectionEyebrow>
        <SectionH2>What founders ask before they have TrustFolder.</SectionH2>
        <p className="mt-3 max-w-[56ch] text-[13.5px] text-[color:var(--m-muted)]">
          Scenario-based quotes, not named customers. TrustFolder was built for exactly these moments.
        </p>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {SCENARIO_QUOTES.map((q, i) => (
          <Reveal key={q.from} delay={0.06 + i * 0.05}>
            <article className="h-full rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-5">
              <p className="border-l-2 border-[color:var(--m-border-mid)] pl-3 text-[12.5px] italic leading-relaxed text-[color:var(--m-muted)]">
                “{q.text}”
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
                — {q.from}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionWrap>
  );
}

function TrustBadgeRow() {
  return (
    <section className="border-y border-[color:var(--m-border)] bg-[color:var(--m-cream)]">
      <div className="mx-auto flex max-w-site flex-col items-center gap-4 px-6 py-8 text-center md:px-8">
        <Reveal>
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {TRUST_BADGES.map((t) => (
              <li key={t}>
                <TrustBadge variant="framework">
                  <span aria-hidden className="mr-1 text-[color:var(--m-green)]">✦</span>
                  {t}
                </TrustBadge>
              </li>
            ))}
          </ul>
          <p className="mt-3 max-w-[56ch] text-[12px] text-[color:var(--m-subtle)]">
            Frameworks TrustFolder helps you prepare for. Not certifications.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function PricingPreview() {
  return (
    <SectionWrap>
      <Reveal>
        <SectionEyebrow>Pricing preview</SectionEyebrow>
        <SectionH2>Start free. Upgrade when a buyer actually asks.</SectionH2>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {PRICING_PREVIEW.map((p, i) => (
          <Reveal key={p.tier} delay={0.06 + i * 0.06}>
            <PricingCard {...p} />
          </Reveal>
        ))}
      </div>
      <div className="mt-8 text-center">
        <TextCTA href="/pricing">See full pricing {'->'}</TextCTA>
      </div>
    </SectionWrap>
  );
}

function AgencyStrip() {
  return (
    <section className="bg-[color:var(--m-green)] text-[color:var(--m-white)]">
      <div className="mx-auto flex max-w-site flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-white/65">
            For AI agencies
          </p>
          <h3 className="mt-2 max-w-[32ch] font-serif text-[22px] font-semibold leading-tight text-white md:text-[26px]">
            AI agency? Add governance to every client handoff.
          </h3>
          <p className="mt-2 max-w-[44ch] text-[13.5px] leading-relaxed text-white/75">
            TrustFolder gives agencies a repeatable delivery asset for chatbot,
            agent, and automation projects - without owning the legal review.
          </p>
        </div>
        <InverseCTA href="/agencies" size="lg" className="whitespace-nowrap">
          Explore agency packs →
        </InverseCTA>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-[color:var(--m-cream)]">
      <div className="mx-auto max-w-site px-6 py-20 text-center md:px-8 md:py-24">
        <Reveal>
          <h2 className="mx-auto max-w-[22ch] font-serif text-[32px] font-semibold leading-tight tracking-tightish text-[color:var(--m-black)] md:text-[40px]">
            Prepare your AI product for serious buyer review.
          </h2>
          <p className="mx-auto mt-4 max-w-[44ch] text-[14.5px] text-[color:var(--m-muted)]">
            Start with a free eligibility check. Takes about 3 minutes. Have a scope question? Contact us.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <PrimaryCTA href="/assessment" size="lg">
              Run free check
            </PrimaryCTA>
            <TextCTA href="/request?type=disclosure">
              Request paid pack {'->'}
            </TextCTA>
          </div>
          <div className="mt-4">
            <TextCTA href="/contact">Ask a scope question</TextCTA>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
