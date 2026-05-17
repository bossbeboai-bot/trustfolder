/**
 * Pricing page - tier cards with FAQ accordion
 */

'use client';

import { useState } from 'react';
import { DocumentDictionary } from '../components/DocumentDictionary';
import { PricingCard } from '../components/PricingCard';
import { Reveal } from '../components/Reveal';

const PACKS = [
  {
    tier: 'Free',
    price: '$0',
    priceSuffix: 'one-time',
    description: 'Eligibility check for AI product scope.',
    features: [
      { label: 'AI product eligibility scan', included: true },
      { label: 'Scope assessment report', included: true },
      { label: 'EU AI Act risk flag check', included: true },
    ],
    ctaLabel: 'Run free check',
    ctaHref: '/assessment',
    popular: false,
    note: 'No credit card required. Upgrade when you need document drafts.',
  },
  {
    tier: 'Lite Readiness Snapshot',
    price: '$99',
    priceSuffix: 'one-time',
    description: 'An autonomous branded readiness snapshot for early-stage AI products.',
    features: [
      { label: 'AI product eligibility scan', included: true },
      { label: 'Scope assessment report', included: true },
      { label: 'EU AI Act risk flag check', included: true },
      { label: 'Readiness score + summary', included: true },
      { label: 'Branded HTML + editable Markdown', included: true },
    ],
    ctaLabel: 'Run assessment for snapshot',
    ctaHref: '/assessment',
    popular: false,
    badge: 'Automated',
    note: 'Secure PayPal checkout after the free fit check.',
  },
  {
    tier: 'AI Disclosure Pack',
    price: '$499',
    priceSuffix: 'one-time',
    description: 'AI disclosure pack for buyer and legal review - EU AI Act transparency readiness.',
    features: [
      { label: 'AI product eligibility scan', included: true },
      { label: 'Scope assessment report', included: true },
      { label: 'EU AI Act risk flag check', included: true },
      { label: 'AI disclosure draft', included: true },
      { label: 'AI use summary', included: true },
      { label: 'Evidence tracker', included: true },
      { label: 'Governance summary', included: true },
      { label: 'Buyer handoff kit', included: true },
      { label: 'Source notes', included: true },
      { label: '30-day readiness roadmap', included: true },
    ],
    ctaLabel: 'Run assessment to get this pack',
    ctaHref: '/assessment',
    popular: true,
    note: 'Secure PayPal checkout after the free fit check.',
  },
  {
    tier: 'Buyer-Ready AI Governance Folder',
    price: '$999',
    priceSuffix: 'one-time',
    description: 'Full evidence folder for serious buyer-review moments.',
    features: [
      { label: 'Everything in AI Disclosure Pack', included: true },
      { label: 'ISO/IEC 42001-aligned readiness checklist', included: true },
      { label: 'EU AI Act transparency notes', included: true },
      { label: 'Data processing addendum draft', included: true },
      { label: 'Legal review handoff notes', included: true },
    ],
    ctaLabel: 'Run assessment to get this pack',
    ctaHref: '/assessment',
    popular: false,
    badge: 'Full folder',
    note: 'Secure PayPal checkout after the free fit check.',
  },
  {
    tier: 'Premium Buyer/Legal Handoff',
    price: '$2,500+',
    priceSuffix: 'custom',
    description: 'Tailored governance for complex AI products.',
    features: [
      { label: 'Everything in Governance Folder', included: true },
      { label: 'Custom document drafting', included: true },
      { label: 'Multiple product coverage', included: true },
      { label: 'Ongoing updates (3 months)', included: true },
    ],
    ctaLabel: 'Apply for handoff',
    ctaHref: '/request?type=premium',
    popular: false,
    badge: 'Application-only',
    note: 'Application-only; manual invoice.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Is this legal advice?',
    answer: 'No. TrustFolder prepares review-ready drafts based on public frameworks (EU AI Act, ISO/IEC 42001, GDPR principles). You should have qualified legal counsel review the documents before use.',
  },
  {
    question: 'Does this make me EU AI Act compliant?',
    answer: 'No. TrustFolder helps you prepare documentation that aligns with EU AI Act transparency requirements. Compliance is a legal determination that depends on your specific product, use case, and jurisdiction.',
  },
  {
    question: 'How long does it take?',
    answer: 'The free eligibility check takes 3 minutes. Paid packs are delivered within 2 business days after we receive your product information.',
  },
  {
    question: 'What if my product is out of scope?',
    answer: 'The free eligibility check will tell you if your product falls within the scope of current AI governance frameworks. If it does not, we will not sell you a pack.',
  },
  {
    question: 'Can I use this for a client project?',
    answer: 'Yes, agencies can use TrustFolder for client projects. We offer custom agency packs with multi-product coverage. Contact us for agency pricing.',
  },
  {
    question: 'What format are the documents?',
    answer: 'Generated packs are delivered as downloadable files with editable source materials and a buyer-review packet where included. The Lite Snapshot, Disclosure Pack, and Governance Folder are automated after checkout; premium handoff remains founder-scoped and request-led.',
  },
];

export function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-20 px-5 py-16 md:px-8 lg:px-12">
      {/* Header */}
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            Pricing
          </p>
          <h1 className="mt-4 font-serif text-[32px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[40px]">
            Choose the buyer-review evidence level after the free check
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--m-muted)]">
            Start with a readiness check, then choose the snapshot or evidence pack that fits your buyer review moment.
          </p>
        </div>
      </Reveal>

      {/* Pricing Cards */}
      <Reveal>
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {PACKS.map((pack, index) => (
            <PricingCard key={index} {...pack} />
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto max-w-4xl rounded-xl border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
                Sample packet
              </p>
              <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-[color:var(--m-muted)]">
                Review an illustrative buyer packet before choosing a snapshot, disclosure pack, or governance folder.
              </p>
            </div>
            <a
              href="/sample-ai-governance-documents"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-[color:var(--m-border-mid)] px-5 text-[14px] font-medium text-[color:var(--m-black)] transition-colors hover:border-[color:var(--m-black)] hover:bg-[color:var(--m-cream)]"
            >
              See sample packet
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <DocumentDictionary />
      </Reveal>

      {/* Founder Note */}
      <Reveal>
        <div className="mx-auto max-w-3xl rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-cream)] p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            Founder note
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--m-black)]">
            These prices are intentional. AI governance documents should be accessible to early-stage founders, not just enterprises. If pricing is a barrier, contact me directly at aaron.miller198@protonmail.com.
          </p>
        </div>
      </Reveal>

      {/* FAQ Section */}
      <Reveal>
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-[24px] font-semibold text-[color:var(--m-black)]">
            Frequently asked questions
          </h2>
          <div className="mt-8 flex flex-col gap-4">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-white)]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[color:var(--m-cream)]"
                  aria-expanded={openFaq === index}
                >
                  <span className="font-medium text-[14px] text-[color:var(--m-black)]">
                    {item.question}
                  </span>
                  <span
                    className={`ml-4 flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--m-border-mid)] text-[10px] transition-transform ${
                      openFaq === index ? 'rotate-45 border-[color:var(--m-green)]' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-[14px] leading-relaxed text-[color:var(--m-muted)]">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-[24px] font-semibold text-[color:var(--m-black)]">
            Not sure which pack is right for you?
          </p>
          <p className="mt-3 text-[14px] text-[color:var(--m-muted)]">
            Start with the free eligibility check. It takes 3 minutes.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="/assessment"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[color:var(--m-green)] px-6 text-[14px] font-medium text-[color:var(--m-white)] transition-colors hover:bg-[color:var(--m-green-dark)]"
            >
              Run free check
            </a>
            <a
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[color:var(--m-border-mid)] px-6 text-[14px] font-medium text-[color:var(--m-black)] transition-colors hover:border-[color:var(--m-black)] hover:bg-[color:var(--m-cream)]"
            >
              Contact us
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
