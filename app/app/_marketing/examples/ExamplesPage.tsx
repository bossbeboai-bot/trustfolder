/**
 * Examples page - document preview gallery with animated product walkthrough
 */

'use client';

import { Reveal } from '../components/Reveal';
import { DocumentPreviewPlayer } from '../components/DocumentPreviewPlayer';

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
            See sample TrustFolder packs and document previews
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--m-muted)]">
            Sample document previews showing the structure and language calibration for buyer review.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
              Animated product walkthrough
            </p>
            <h2 className="mt-3 font-serif text-[28px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[34px]">
              From website scan to review-ready evidence folder
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--m-muted)]">
              Watch how TrustFolder moves from website scan to review-ready evidence folder.
            </p>
          </div>
          <DocumentPreviewPlayer />
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
              className="min-w-0 rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--m-border-mid)]"
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
              <pre className="mt-3 max-w-full whitespace-pre-wrap break-words rounded bg-[color:var(--m-cream)] p-3 font-mono text-[10px] leading-relaxed text-[color:var(--m-black)]">
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
