import { MarketingShell } from '../components/Shell';
import type { ReactNode } from 'react';
import { PrimaryCTA, GhostCTA, TextCTA } from '../components/Button';
import { DocumentDictionary } from '../components/DocumentDictionary';
import { FounderCard } from '../components/FounderCard';
import { HeroDocumentLoop } from '../components/HeroDocumentLoop';
import { PricingCard, type PricingFeature } from '../components/PricingCard';
import { Reveal } from '../components/Reveal';
import { CheckDot, TrustBadge } from '../components/TrustBadge';

const HERO = {
  h1: "Enterprise buyers don't pause deals over AI features. They pause over missing governance evidence.",
  sub:
    'TrustFolder scans your AI product website and assembles a source-traced evidence folder: disclosure drafts, AI use summary, governance summary, evidence tracker, open review items, readiness roadmap, and buyer/legal handoff.',
  trustLine: ['Source-traced artifacts', 'Buyer/legal handoff', 'Not legal advice'],
};

const TRUST_ITEMS = [
  'EU AI Act Article 50 transparency rules start applying on 2 Aug 2026',
  'ISO/IEC 42001-aligned readiness checklist, not certification',
  'Evidence folder designed for buyer and counsel review',
];

const WITHOUT_ITEMS = [
  'AI claims scattered across product pages, pitch decks, and internal notes',
  'No clear source trail for what the product actually says',
  'Counsel starts from messy context instead of a structured packet',
  'Buyer review slows while the team reconstructs answers',
];

const WITH_ITEMS = [
  'Source-traced folder assembled from the product website and intake answers',
  'Disclosure drafts, evidence tracker, and source notes in one place',
  'Open review items called out instead of buried',
  'Buyer/legal handoff gives counsel a clean starting point',
];

const CHATGPT_COMPARE = [
  {
    title: 'A prompt',
    items: ['Drafts generic paragraphs', 'Does not know the product surface', 'No source trail', 'No open-items list'],
  },
  {
    title: 'A template',
    items: ['Leaves blanks for the founder', 'No website scan', 'No readiness score', 'No buyer packet'],
  },
  {
    title: 'TrustFolder',
    featured: true,
    items: ['Scans the live product context', 'Traces claims to sources', 'Flags review gaps', 'Prepares a buyer packet'],
  },
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
  badge?: string;
  note?: string;
}> = [
  {
    tier: 'Free check',
    price: '$0',
    description: 'Fit and readiness check. No document pack generated.',
    features: [
      { label: 'Website scan and intake flow', included: true },
      { label: 'Fit/readiness result', included: true },
      { label: 'Recommended next step', included: true },
    ],
    ctaLabel: 'Run free check',
    ctaHref: '/assessment',
    note: 'Best first step for every buyer-review moment.',
  },
  {
    tier: 'Lite Readiness Snapshot',
    price: '$99',
    priceSuffix: 'one-time',
    description: 'A short founder-reviewed snapshot for early-stage AI products.',
    features: [
      { label: 'Readiness summary', included: true },
      { label: 'Disclosure areas', included: true },
      { label: 'Request-only delivery', included: true },
    ],
    ctaLabel: 'Request snapshot',
    ctaHref: '/request?type=snapshot',
    badge: 'Request-only',
    note: 'Available on request.',
  },
  {
    tier: 'AI Disclosure Pack',
    price: '$499',
    priceSuffix: 'one-time',
    description: 'Core disclosure docs and placement guidance after assessment.',
    features: [
      { label: 'Disclosure drafts', included: true },
      { label: 'AI use summary', included: true },
      { label: 'Source notes and handoff note', included: true },
    ],
    ctaLabel: 'Run assessment to get this pack',
    ctaHref: '/assessment',
    popular: true,
    note: 'Secure PayPal checkout after fit is confirmed.',
  },
  {
    tier: 'Buyer-Ready Folder',
    price: '$999',
    priceSuffix: 'one-time',
    description: 'Governance folder with buyer-review packet and roadmap.',
    features: [
      { label: 'Disclosure + governance artifacts', included: true },
      { label: 'Evidence tracker and open review items', included: true },
      { label: 'Buyer review packet', included: true },
    ],
    ctaLabel: 'Run assessment to get this pack',
    ctaHref: '/assessment',
    badge: 'Full folder',
    note: 'Secure PayPal checkout after fit is confirmed.',
  },
  {
    tier: 'Premium Handoff',
    price: '$2,500+',
    priceSuffix: 'custom',
    description: 'Manual buyer/legal handoff for complex review moments.',
    features: [
      { label: 'Custom scope', included: true },
      { label: 'Manual invoice', included: true },
      { label: 'Application-only', included: true },
    ],
    ctaLabel: 'Apply for handoff',
    ctaHref: '/request?type=premium',
    badge: 'Manual',
    note: 'No automated checkout.',
  },
];

const SCENARIOS = [
  {
    text:
      "A prospect's legal team just asked for our AI governance docs. We have product copy, but nothing they can actually review.",
    from: 'Founder, B2B AI SaaS',
  },
  {
    text:
      'The buyer wants our AI use, data handling, and human review posture in one place. We are still pulling it from three tools.',
    from: 'Head of Product, AI agency',
  },
  {
    text:
      'We need a first draft our lawyer can start from, with sources and open questions already visible.',
    from: 'Co-founder, AI automation platform',
  },
];

export default function HomePage() {
  return (
    <MarketingShell>
      <Hero />
      <BuyerProofStrip />
      <EvidenceProblem />
      <ProductStory />
      <DocumentDictionary />
      <ChatGPTComparison />
      <SamplePacketCTA />
      <PricingPreview />
      <ProofSection />
      <FinalCTA />
    </MarketingShell>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
      {children}
    </p>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--m-white)]">
      <div className="mx-auto max-w-site px-6 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-[1.02fr_0.98fr]">
          <Reveal>
            <h1 className="font-serif text-[40px] font-semibold leading-[1.03] tracking-tightish text-[color:var(--m-black)] md:text-[62px]">
              {HERO.h1}
            </h1>
            <p className="mt-6 max-w-[56ch] text-[16px] leading-relaxed text-[color:var(--m-muted)] md:text-[18px]">
              {HERO.sub}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <PrimaryCTA href="/assessment" size="lg">
                Run free readiness check
              </PrimaryCTA>
              <GhostCTA href="/sample-ai-governance-documents" size="lg">
                See sample buyer packet
              </GhostCTA>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-[11px] tracking-wideish text-[color:var(--m-subtle)]">
              {HERO.trustLine.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckDot />
                  {item}
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

function BuyerProofStrip() {
  return (
    <section className="border-y border-[color:var(--m-border)] bg-[color:var(--m-cream)]">
      <div className="mx-auto grid max-w-site gap-px md:grid-cols-3">
        {TRUST_ITEMS.map((item) => (
          <div key={item} className="bg-[color:var(--m-cream)] px-6 py-7 text-center md:px-8">
            <p className="mx-auto max-w-[30ch] text-[13px] leading-relaxed text-[color:var(--m-muted)]">
              {item}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EvidenceProblem() {
  return (
    <section className="bg-[color:var(--m-cream)]">
      <div className="mx-auto max-w-site px-6 py-16 md:px-8 md:py-24">
        <Reveal>
          <SectionEyebrow>Buyer review reality</SectionEyebrow>
          <h2 className="mt-3 max-w-[28ch] font-serif text-[32px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[44px]">
            When legal asks, the problem is not AI. It is evidence.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <ComparisonPanel title="Without TrustFolder" tone="bad" items={WITHOUT_ITEMS} />
          <ComparisonPanel title="With TrustFolder" tone="good" items={WITH_ITEMS} />
        </div>
      </div>
    </section>
  );
}

function ComparisonPanel({
  title,
  tone,
  items,
}: {
  title: string;
  tone: 'bad' | 'good';
  items: string[];
}) {
  return (
    <Reveal>
      <article
        className={`h-full rounded-2xl border p-7 ${
          tone === 'good'
            ? 'border-[color:var(--m-green)] bg-[color:var(--m-green-light)]'
            : 'border-[color:var(--m-border)] bg-[color:var(--m-white)]'
        }`}
      >
        <p
          className={`font-mono text-[11px] uppercase tracking-widest2 ${
            tone === 'good' ? 'text-[color:var(--m-green-dark)]' : 'text-[color:var(--m-subtle)]'
          }`}
        >
          {title}
        </p>
        <ul className="mt-5 divide-y divide-[color:var(--m-border)]">
          {items.map((item) => (
            <li key={item} className="flex gap-3 py-4 text-[14px] leading-relaxed text-[color:var(--m-muted)]">
              <span className={tone === 'good' ? 'text-[color:var(--m-green)]' : 'text-[color:var(--m-red)]'}>
                {tone === 'good' ? '+' : '-'}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>
    </Reveal>
  );
}

function ProductStory() {
  return (
    <section className="bg-[color:var(--m-white)]">
      <div className="mx-auto grid max-w-site gap-10 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-8 md:py-24 md:items-center">
        <Reveal>
          <SectionEyebrow>Product story</SectionEyebrow>
          <h2 className="mt-3 max-w-[13ch] font-serif text-[32px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[42px]">
            From scan to buyer packet.
          </h2>
          <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-[color:var(--m-muted)]">
            See how public product context becomes a structured evidence folder with a readiness score, open review items, and handoff output.
          </p>
          <div className="mt-6">
            <TextCTA href="/examples">Watch the walkthrough {'->'}</TextCTA>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <HeroDocumentLoop />
        </Reveal>
      </div>
    </section>
  );
}

function ChatGPTComparison() {
  return (
    <section className="bg-[color:var(--m-cream)]">
      <div className="mx-auto max-w-site px-6 py-16 md:px-8 md:py-24">
        <Reveal>
          <SectionEyebrow>Not another prompt</SectionEyebrow>
          <h2 className="mt-3 max-w-[30ch] font-serif text-[32px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[44px]">
            A prompt can draft words. It cannot prove what your product actually says.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {CHATGPT_COMPARE.map((card) => (
            <Reveal key={card.title}>
              <article
                className={`h-full rounded-2xl border p-6 ${
                  card.featured
                    ? 'border-[color:var(--m-green)] bg-[color:var(--m-green-light)]'
                    : 'border-[color:var(--m-border)] bg-[color:var(--m-white)]'
                }`}
              >
                <p className="font-serif text-[22px] font-semibold text-[color:var(--m-black)]">
                  {card.title}
                </p>
                <ul className="mt-5 grid gap-3">
                  {card.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[13.5px] leading-relaxed text-[color:var(--m-muted)]">
                      <span className={card.featured ? 'text-[color:var(--m-green)]' : 'text-[color:var(--m-subtle)]'}>
                        {card.featured ? '+' : '-'}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SamplePacketCTA() {
  return (
    <section className="bg-[color:var(--m-white)]">
      <div className="mx-auto max-w-site px-6 py-16 md:px-8 md:py-20">
        <Reveal>
          <div className="grid gap-8 rounded-2xl border border-[color:var(--m-border)] bg-[color:var(--m-green)] p-8 text-[color:var(--m-white)] md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-white/65">
                Illustrative sample
              </p>
              <h2 className="mt-3 max-w-[22ch] font-serif text-[32px] font-semibold leading-tight md:text-[42px]">
                See the buyer packet before you request one.
              </h2>
              <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-white/75">
                A fictional HTML packet showing the structure buyers and lawyers receive: scope, readiness score, document inventory, source trail, and open review items.
              </p>
            </div>
            <GhostCTA href="/sample-ai-governance-documents" size="lg" className="border-white/50 text-white hover:bg-white hover:text-[color:var(--m-green-dark)]">
              Open sample packet
            </GhostCTA>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PricingPreview() {
  return (
    <section className="bg-[color:var(--m-cream)]">
      <div className="mx-auto max-w-site px-6 py-16 md:px-8 md:py-24">
        <Reveal>
          <SectionEyebrow>Pricing ladder</SectionEyebrow>
          <h2 className="mt-3 max-w-[24ch] font-serif text-[32px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[44px]">
            Start with the check. Choose the evidence level after fit is clear.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {PRICING_PREVIEW.map((pack) => (
            <Reveal key={pack.tier}>
              <PricingCard {...pack} />
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <TextCTA href="/pricing">Compare all pricing {'->'}</TextCTA>
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  return (
    <section className="bg-[color:var(--m-white)]">
      <div className="mx-auto grid max-w-site gap-12 px-6 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <Reveal>
            <SectionEyebrow>Founder signal</SectionEyebrow>
            <h2 className="mt-3 max-w-[16ch] font-serif text-[32px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[42px]">
              Built by someone who has been in the room.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <FounderCard
              name="Aaron Miller"
              initials="AM"
              bio="Built TrustFolder after watching AI founders lose deals to documentation gaps they did not know existed. The product is opinionated about what buyers and legal teams actually need to see."
              email="aaron.miller198@protonmail.com"
            />
          </Reveal>
        </div>
        <Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {SCENARIOS.map((scenario) => (
              <article key={scenario.from} className="rounded-2xl border border-[color:var(--m-border)] bg-[color:var(--m-cream)] p-6">
                <p className="font-serif text-[20px] italic leading-relaxed text-[color:var(--m-black)]">
                  "{scenario.text}"
                </p>
                <p className="mt-5 font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
                  - {scenario.from}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-center text-[12px] leading-relaxed text-[color:var(--m-subtle)]">
            Scenario-based proof points, not named customer testimonials.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-[color:var(--m-cream)]">
      <div className="mx-auto max-w-site px-6 py-20 text-center md:px-8 md:py-24">
        <Reveal>
          <ul className="mb-7 flex flex-wrap items-center justify-center gap-2">
            {['EU AI Act transparency-readiness', 'Source-traced drafts', 'Buyer review handoff'].map((item) => (
              <li key={item}>
                <TrustBadge>{item}</TrustBadge>
              </li>
            ))}
          </ul>
          <h2 className="mx-auto max-w-[24ch] font-serif text-[34px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[46px]">
            Prepare the evidence before the buyer asks twice.
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[15px] leading-relaxed text-[color:var(--m-muted)]">
            Start with a free readiness check. If your product fits, choose the snapshot, disclosure pack, governance folder, or manual handoff path.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <PrimaryCTA href="/assessment" size="lg">
              Run free readiness check
            </PrimaryCTA>
            <TextCTA href="/contact">Ask a scope question</TextCTA>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
