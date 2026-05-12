/**
 * Agencies page - value proposition for AI agencies
 */

'use client';

import { Reveal } from '../components/Reveal';

const BENEFITS = [
  {
    title: 'Repeatable delivery asset',
    description: 'Add a governance handoff folder to every client project without starting from scratch each time.',
  },
  {
    title: 'Cleaner client handoff',
    description: 'Give clients a professional, review-ready package instead of a scattered internal doc.',
  },
  {
    title: 'Reduce handoff gaps',
    description: 'Keep scope documentation and evidence tracking consistent for every AI project.',
  },
];

const QUOTES = [
  {
    text: 'Our enterprise client asked for AI governance docs during procurement. We had nothing prepared and the deal stalled.',
    author: 'Founder, AI Automation Agency',
  },
  {
    text: "We build chatbots for 20+ clients but no two have the same governance requirements. It's a nightmare to scale.",
    author: 'Partner, AI Studio',
  },
  {
    text: 'Legal teams keep asking about our AI models and data handling. We need a standard answer we can customize per client.',
    author: 'Head of Delivery, AI Agency',
  },
];

export function AgenciesPage() {
  return (
    <div className="flex flex-col gap-20 px-5 py-16 md:px-8 lg:px-12">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            For agencies
          </p>
          <h1 className="mt-4 font-serif text-[32px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[40px]">
            Add governance to every AI client handoff
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--m-muted)]">
            TrustFolder gives agencies a repeatable, professional delivery asset for chatbot, agent, and automation projects without owning the legal review.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {BENEFITS.map((benefit, index) => (
            <div
              key={index}
              className="rounded-xl border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--m-border-mid)]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--m-green-light)]">
                <svg
                  className="h-5 w-5 text-[color:var(--m-green-dark)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
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
                {benefit.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--m-muted)]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-[24px] font-semibold text-[color:var(--m-black)]">
            How agency packs work
          </h2>
          <div className="mt-8 flex flex-col gap-6">
            {[
              ['1', 'Request a custom agency pack', 'Tell us about your typical client projects and the AI systems you build.'],
              ['2', 'We build a reusable template', 'Per-client disclosure templates, data handling explanations, and handoff checklists.'],
              ['3', 'Customize for each client', 'Fill in client-specific details and deliver a professional governance package.'],
            ].map(([step, title, body]) => (
              <div key={step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--m-green)] font-mono text-[12px] font-medium text-[color:var(--m-white)]">
                  {step}
                </div>
                <div>
                  <p className="font-medium text-[14px] text-[color:var(--m-black)]">{title}</p>
                  <p className="mt-1 text-[13px] text-[color:var(--m-muted)]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            What agencies ask before they have TrustFolder
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {QUOTES.map((quote, index) => (
              <div
                key={index}
                className="rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-cream)] p-6"
              >
                <p className="font-mono text-[13px] italic leading-relaxed text-[color:var(--m-black)]">
                  "{quote.text}"
                </p>
                <p className="mt-3 text-[12px] text-[color:var(--m-muted)]">Scenario: {quote.author}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-[13px] text-[color:var(--m-muted)]">
            TrustFolder was built for exactly these moments.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto max-w-3xl rounded-xl border-2 border-[color:var(--m-green)] bg-[color:var(--m-green-light)] p-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-green-dark)]">
            Custom agency pricing
          </p>
          <h2 className="mt-4 font-serif text-[24px] font-semibold text-[color:var(--m-black)]">
            Get a repeatable governance asset for your agency
          </h2>
          <p className="mt-3 text-[14px] text-[color:var(--m-muted)]">
            Custom scope based on your project types and client volume. One-time setup, reusable across client engagements.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="/request?type=agency"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[color:var(--m-green)] px-6 text-[14px] font-medium text-[color:var(--m-white)] transition-colors hover:bg-[color:var(--m-green-dark)]"
            >
              Request agency pack
            </a>
            <a
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[color:var(--m-green)] bg-transparent px-6 text-[14px] font-medium text-[color:var(--m-green)] transition-colors hover:bg-[color:var(--m-white)]"
            >
              Contact us
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] leading-relaxed text-[color:var(--m-subtle)]">
            Agency packs are review-ready drafts, not legal advice. Your clients should have qualified legal counsel review the documents before use.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
