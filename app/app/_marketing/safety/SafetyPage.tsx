/**
 * Safety page - trust document with scope philosophy
 */

'use client';

import { Reveal } from '../components/Reveal';

const IN_SCOPE_ITEMS = [
  'AI disclosure drafts for chatbots, assistants, and AI-generated content',
  'AI use summaries and transparency documentation',
  'Governance policy drafts and human oversight procedures',
  'Evidence trackers linking claims to source material',
  'Buyer/legal handoff notes and readiness roadmaps',
  'EU AI Act transparency notes for non-high-risk systems',
  'ISO 42001-inspired readiness checklists',
];

const OUT_OF_SCOPE_ITEMS = [
  'Healthcare diagnosis or treatment recommendations',
  'Hiring, employment, or worker evaluation decisions',
  'Credit scoring, lending, or financial underwriting',
  'Biometric identification or emotion recognition',
  'Law enforcement or criminal justice applications',
  'Children-directed products or educational content',
  'Critical infrastructure or public safety systems',
];

const HIGH_RISK_CATEGORIES = [
  {
    category: 'Healthcare',
    description: 'Medical diagnosis, treatment recommendations, or clinical decision support systems.',
  },
  {
    category: 'Hiring & Employment',
    description: 'Resume screening, candidate evaluation, or worker performance assessment.',
  },
  {
    category: 'Financial Services',
    description: 'Credit scoring, lending decisions, insurance underwriting, or investment advice.',
  },
  {
    category: 'Biometrics',
    description: 'Facial recognition, emotion detection, or other sensitive biometric processing.',
  },
  {
    category: 'Law Enforcement',
    description: 'Predictive policing, criminal justice decision support, or surveillance applications.',
  },
  {
    category: 'Children',
    description: 'Products or services directed at children under 13, including educational content.',
  },
  {
    category: 'Critical Infrastructure',
    description: 'Power grid, transportation, water systems, or other essential services.',
  },
];

export function SafetyPage() {
  return (
    <div className="flex flex-col gap-20 px-5 py-16 md:px-8 lg:px-12">
      {/* Header */}
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            Safety & scope
          </p>
          <h1 className="mt-4 font-serif text-[32px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[40px]">
            Safe by default. Clear when expert review is needed.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--m-muted)]">
            TrustFolder prepares review-ready governance documents for AI products. We do not auto-generate packs for high-risk use cases that require specialized legal and regulatory expertise.
          </p>
        </div>
      </Reveal>

      {/* Scope Table */}
      <Reveal>
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-[24px] font-semibold text-[color:var(--m-black)]">
            What TrustFolder can prepare vs. what requires expert review
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* In Scope */}
            <div className="rounded-xl border-2 border-[color:var(--m-green)] bg-[color:var(--m-green-light)] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--m-green)]">
                  <svg
                    className="h-4 w-4 text-[color:var(--m-white)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-[18px] font-semibold text-[color:var(--m-black)]">
                  In scope
                </h3>
              </div>
              <ul className="mt-4 flex flex-col gap-2">
                {IN_SCOPE_ITEMS.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-[13px] text-[color:var(--m-black)]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--m-green)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Out of Scope */}
            <div className="rounded-xl border-2 border-[color:var(--m-amber)] bg-[color:var(--m-amber-light)] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--m-amber)]">
                  <svg
                    className="h-4 w-4 text-[color:var(--m-white)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-[18px] font-semibold text-[color:var(--m-black)]">
                  Requires expert review
                </h3>
              </div>
              <ul className="mt-4 flex flex-col gap-2">
                {OUT_OF_SCOPE_ITEMS.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-[13px] text-[color:var(--m-black)]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--m-amber)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>

      {/* High-Risk Categories */}
      <Reveal>
        <div className="mx-auto max-w-4xl">
          <h2 className="font-serif text-[24px] font-semibold text-[color:var(--m-black)]">
            High-risk categories that require expert review
          </h2>
          <p className="mt-3 text-[14px] text-[color:var(--m-muted)]">
            These use cases are not auto-generated. We route them to expert review and explain why on the assessment result.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {HIGH_RISK_CATEGORIES.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-5"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--m-amber-light)] font-mono text-[10px] font-medium text-[color:var(--m-amber-dark)]">
                    !
                  </span>
                  <h3 className="font-medium text-[14px] text-[color:var(--m-black)]">
                    {item.category}
                  </h3>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--m-muted)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Disclaimer */}
      <Reveal>
        <div className="mx-auto max-w-3xl rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-cream)] p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            Important disclaimer
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--m-black)]">
            TrustFolder prepares review-ready drafts based on public frameworks (EU AI Act, ISO/IEC 42001, GDPR principles). These documents are not legal advice, certification, or a compliance guarantee. You should have qualified legal counsel review the documents before use, especially for high-risk use cases or regulated industries.
          </p>
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-[24px] font-semibold text-[color:var(--m-black)]">
            Questions about scope?
          </p>
          <p className="mt-3 text-[14px] text-[color:var(--m-muted)]">
            If you're unsure whether your product is in scope, run the free eligibility check or contact us directly.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="/assessment"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[color:var(--m-green)] px-6 text-[14px] font-medium text-[color:var(--m-white)] transition-colors hover:bg-[color:var(--m-green-dark)]"
            >
              Run eligibility check
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
