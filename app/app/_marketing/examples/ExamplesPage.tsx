/**
 * Examples page - document preview gallery with Remotion placeholder
 */

'use client';

import { Reveal } from '../components/Reveal';

const SAMPLE_DOCUMENTS = [
  {
    docNumber: '01',
    title: 'AI Disclosure Draft',
    description: 'User-facing disclosure language for chatbots, assistants, and AI-generated content.',
    preview:
      'This assistant is an AI system. It generates replies based on your message and may be incorrect. A human reviews escalations before any account or billing change is made...',
  },
  {
    docNumber: '02',
    title: 'Evidence Tracker',
    description: 'Structured table linking every claim to source material and verification status.',
    preview:
      'Claim | Source | Status | Notes\nModel family documented | Product page | Verified\nHuman oversight process | Internal policy | Verified\nData retention period | Privacy policy | Needs review...',
  },
  {
    docNumber: '03',
    title: 'Buyer Handoff Cover Sheet',
    description: 'Executive summary for procurement reviewers and legal teams.',
    preview:
      'TrustFolder Governance Pack - [Product Name]\nPrepared: [Date] | Scope: AI disclosure and governance readiness\nThis folder contains review-ready drafts aligned with EU AI Act...',
  },
];

export function ExamplesPage() {
  return (
    <div className="flex flex-col gap-20 px-5 py-16 md:px-8 lg:px-12">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            Examples
          </p>
          <h1 className="mt-4 font-serif text-[32px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[40px]">
            See what arrives in your TrustFolder pack
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--m-muted)]">
            Sample document previews showing the structure and language calibration for buyer review.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto max-w-4xl">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-[color:var(--m-border)] bg-[color:var(--m-cream)]">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-full border-4 border-dashed border-[color:var(--m-border-mid)] p-6">
                <svg
                  className="h-12 w-12 text-[color:var(--m-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="font-mono text-[12px] uppercase tracking-widest text-[color:var(--m-subtle)]">
                Animated preview coming in Phase 3
              </p>
              <p className="mt-2 text-[14px] text-[color:var(--m-muted)]">
                A Remotion animation will show the full document pack assembly process here.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start gap-4 rounded-lg border border-[color:var(--m-amber)] bg-[color:var(--m-amber-light)] p-5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--m-amber)] bg-[color:var(--m-white)] font-mono text-[12px] text-[color:var(--m-amber-dark)]">
              !
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-amber-dark)]">
                Sample documents
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--m-black)]">
                These are illustrative samples, not real customer packs. Final documents are calibrated to your specific product.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_DOCUMENTS.map((doc, index) => (
            <div
              key={index}
              className="rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--m-border-mid)]"
            >
              <div className="flex items-center justify-between gap-2 border-b border-[color:var(--m-border)] pb-3">
                <span className="font-mono text-[11px] font-medium tracking-wideish text-[color:var(--m-black)]">
                  <span className="text-[color:var(--m-subtle)]">{doc.docNumber}</span> {doc.title}
                </span>
                <span className="shrink-0 rounded-sm border border-[color:var(--m-green)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wideish text-[color:var(--m-green)]">
                  SAMPLE
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--m-muted)]">
                {doc.description}
              </p>
              <pre className="mt-3 overflow-x-auto rounded bg-[color:var(--m-cream)] p-3 font-mono text-[10px] leading-relaxed text-[color:var(--m-black)]">
                {doc.preview}
              </pre>
              <p className="mt-3 font-mono text-[10px] text-[color:var(--m-subtle)]">
                Sample - not a real customer pack
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-[24px] font-semibold text-[color:var(--m-black)]">
            Want a pack like this for your product?
          </p>
          <p className="mt-3 text-[14px] text-[color:var(--m-muted)]">
            Start with the free eligibility check. Takes 3 minutes.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="/assessment"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[color:var(--m-green)] px-6 text-[14px] font-medium text-[color:var(--m-white)] transition-colors hover:bg-[color:var(--m-green-dark)]"
            >
              Run free check
            </a>
            <a
              href="/request"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[color:var(--m-border-mid)] px-6 text-[14px] font-medium text-[color:var(--m-black)] transition-colors hover:border-[color:var(--m-black)] hover:bg-[color:var(--m-cream)]"
            >
              Request a pack
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
