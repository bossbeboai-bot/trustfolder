import { SiteChrome } from '../components/SiteChrome';
import {
  Card,
  FinalCta,
  PageHeader,
  Reveal,
  ScopeNote,
  Section,
} from '../components/MarketingPrimitives';
import type { Metadata } from 'next';
import Link from 'next/link';
import PricingPackCard from './PricingPackCard';
import {
  ComplianceModulesBlock,
  ReadinessAreas,
  WhatYouGet,
} from '../components/ClarityBlocks';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'AI Governance Document Packs and Disclosure Drafts — TrustFolder',
  description:
    'Compare TrustFolder packs for AI disclosure drafts, governance summaries, evidence trackers, buyer/legal handoff documents, and AI readiness review.',
  path: '/pricing',
});

export interface Pack {
  name: string;
  price: string;
  for_who: string;
  what: string[];
  delivery: string;
  cta_label: string;
  cta_href: string;
  featured?: boolean;
}

const PACKS: Pack[] = [
  {
    name: 'Free Eligibility Check',
    price: 'Free',
    for_who:
      'Founders and operators who want a quick read on whether TrustFolder is a fit before spending anything.',
    what: [
      'Plain-English fit result: likely fit, needs review, or out of scope',
      'Recommended next step',
      'No documents prepared at this step',
    ],
    delivery: 'Same session. About 2 minutes.',
    cta_label: 'Run free check',
    cta_href: '/assessment',
  },
  {
    name: 'AI Website Trust Snapshot',
    price: '$99',
    for_who:
      'Teams who want a short readiness snapshot they can share internally before deciding on a full pack.',
    what: [
      'Website scan summary',
      'AI product overview',
      'Likely disclosure areas',
      'Readiness result with confidence band',
      'Recommended next steps',
    ],
    delivery:
      'Founder-prepared. We reply with next steps within 1 business day after you submit the request.',
    cta_label: 'Request snapshot',
    cta_href: '/request?type=snapshot',
  },
  {
    name: 'AI Disclosure Pack',
    price: '$499',
    for_who:
      'B2B AI SaaS teams that need filled disclosure documents they can apply to their product and share with their lawyer.',
    what: [
      'Chatbot / assistant disclosure',
      'AI-generated content notice',
      'AI system disclosure page',
      'Placement guide (where each disclosure goes)',
      'Internal transparency summary',
      'Legal-review note',
    ],
    delivery:
      'Secure PayPal checkout is available after the free fit check confirms this tier is supported for your product.',
    cta_label: 'Start secure checkout',
    cta_href: '/assessment',
    featured: true,
  },
  {
    name: 'Buyer-Ready AI Governance Folder',
    price: '$999',
    for_who:
      'Teams preparing for enterprise buyer review or building their first formal AI governance posture.',
    what: [
      'Everything in the AI Disclosure Pack',
      'AI system inventory + provider/deployer notes',
      'Governance policy draft + human oversight procedure',
      'Evidence tracker',
      'Risk notes',
      'Lawyer/buyer handoff doc',
      '30-day governance roadmap',
    ],
    delivery:
      'Secure PayPal checkout is available after the free fit check confirms this tier is supported for your product.',
    cta_label: 'Start secure checkout',
    cta_href: '/assessment',
  },
  {
    name: 'Enterprise Buyer Handoff',
    price: '$2,500+',
    for_who:
      'Companies in active enterprise procurement who need a hands-on handoff and an advisor-supported review later.',
    what: [
      'Everything in the Governance Folder',
      'Handoff cleanup against your buyer’s questions',
      'Loom walkthrough of the folder',
      'One revision pass',
      'Optional advisor-supported review later',
    ],
    delivery:
      'Application only. We review fit and reply with whether the engagement is a match within 1 business day.',
    cta_label: 'Apply',
    cta_href: '/request?type=premium',
  },
  {
    name: 'Agency Pack',
    price: 'Custom · request',
    for_who:
      'AI agencies and automation studios who want to add a governance handoff folder to every client project.',
    what: [
      'Adapted from the Governance Folder',
      'Per-client trust handoff template',
      'Agency-side delivery checklist',
      'Custom scope by project type',
    ],
    delivery:
      'Custom scope. We reply with how the agency pack fits your client delivery within 1 business day.',
    cta_label: 'Request agency pack',
    cta_href: '/request?type=agency',
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Which tiers use secure PayPal checkout?',
    a: 'The AI Disclosure Pack and Buyer-Ready AI Governance Folder can use secure PayPal checkout after the free fit check. The snapshot, enterprise handoff, and agency pack stay request-only for now.',
  },
  {
    q: 'Is this legal advice?',
    a: 'No. TrustFolder produces AI-generated drafts for review. They are not legal advice, certification, or a compliance guarantee. Packs are formatted for lawyer review, not as a substitute for counsel.',
  },
  {
    q: 'How fast can you turn around a pack?',
    a: 'For PayPal-supported tiers, generation starts only after payment is confirmed. Request-only tiers receive a founder reply within 1 business day with scope, expectations, and a delivery window.',
  },
  {
    q: 'What happens if my product is out of scope?',
    a: 'High-risk areas (hiring, healthcare diagnosis, credit, biometrics, law enforcement, children’s products) are not auto-generated. We route those to expert review and explain why on the assessment result.',
  },
  {
    q: 'Can I switch packs later?',
    a: 'Yes. Many teams start with the snapshot or disclosure pack and later move to the governance folder before a buyer review. We handle those upgrades manually so scope stays clear.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'If we accept your request and you are not satisfied with the delivered pack, contact us within 14 days. We will work to fix it or refund the pack — case by case, founder-reviewed.',
  },
];

export default function PricingPage() {
  return (
    <SiteChrome active="pricing">
      <PageHeader
        eyebrow="Pricing"
        title="Pick the level of buyer-review preparation you need."
        lede="Every pack is request-led and founder-reviewed. Nothing is billed instantly. We use the request to confirm scope and reply with next steps within 1 business day."
      />

      <WhatYouGet
        description="The exact documents vary by tier, but every paid pack is built around a clear AI use summary, disclosure readiness, governance notes, evidence tracking, and a buyer/legal handoff."
        ctaHref="/examples"
        ctaLabel="See sample documents"
      />

      <ReadinessAreas />

      <Section>
        <div className="grid gap-7 lg:grid-cols-2">
          {PACKS.map((p, i) => (
            <PricingPackCard key={p.name} pack={p} index={i} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Notes" title="What every pack has in common.">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--tf-ink)]">Founder-reviewed</p>
            <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">
              Every pack is reviewed by the founder before delivery. Templates exist as scaffolds,
              not as a generator left running unattended.
            </p>
          </Card>
          <Card>
            <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--tf-ink)]">Lawyer-review-ready</p>
            <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">
              Packs are formatted so a procurement reviewer or external lawyer can read them
              without a back-and-forth. They are not a substitute for legal advice.
            </p>
          </Card>
          <Card>
            <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--tf-ink)]">Out-of-scope safe</p>
            <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">
              We do not auto-generate packs for high-risk areas like healthcare diagnosis, hiring,
              credit, biometrics, or law enforcement.{' '}
              <Link
                href="/safety"
                className="underline decoration-[var(--tf-border-strong)] underline-offset-2 hover:text-[var(--tf-ink)]"
              >
                Read the scope rules
              </Link>
              .
            </p>
          </Card>
        </div>
        <div className="mt-10">
          <ScopeNote />
        </div>
      </Section>

      <ComplianceModulesBlock
        eyebrow="Compliance-readiness modules"
        title="Request-only modules. No checkout yet."
        showCtas
      />

      <Section eyebrow="Frequently asked" title="Questions buyers, founders, and agencies ask first.">
        <div className="grid gap-5 lg:grid-cols-2">
          {FAQS.map((f, i) => (
            <Reveal
              key={f.q}
              className="rounded-[28px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-8 shadow-[0_22px_80px_rgba(7,17,31,0.07)] sm:p-9"
            >
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
                {`Q · 0${i + 1}`}
              </p>
              <h3 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.04em] text-[var(--tf-ink)]">
                {f.q}
              </h3>
              <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">{f.a}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <FinalCta
        title="Not sure which pack fits?"
        body="Start with the free eligibility check. We will reply with what an AI-aware buyer is likely to ask and which pack fits."
        primary={{ href: '/assessment', label: 'Run free eligibility check' }}
        secondary={{ href: '/request?type=disclosure', label: 'Request paid pack' }}
      />
    </SiteChrome>
  );
}
