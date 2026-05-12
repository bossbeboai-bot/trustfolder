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
    type: 'disclosure',
  },
  {
    docNumber: '02',
    title: 'Evidence Tracker',
    description: 'Structured table linking every claim to source material and verification status.',
    type: 'tracker',
  },
  {
    docNumber: '03',
    title: 'Buyer Handoff Cover Sheet',
    description: 'Executive summary for procurement reviewers and legal teams.',
    type: 'handoff',
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
          <div className="mt-7 flex flex-col items-start gap-3 rounded-xl border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[48ch] text-[14px] leading-relaxed text-[color:var(--m-muted)]">
              Want this mapped to your own AI product website?
            </p>
            <a
              href="/assessment"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[color:var(--m-green)] px-5 text-[14px] font-medium text-[color:var(--m-white)] transition-colors hover:bg-[color:var(--m-green-dark)]"
            >
              Get this for your product
            </a>
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
              <SampleDocumentMock type={doc.type} />
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

function SampleDocumentMock({ type }: { type: string }) {
  if (type === 'tracker') {
    return (
      <div className="mt-4 rounded-md border border-[color:var(--m-border)] bg-[color:var(--m-cream)] p-4">
        <div className="grid grid-cols-[1.1fr_0.8fr_0.7fr] gap-2 border-b border-[color:var(--m-border)] pb-2 font-mono text-[9px] uppercase tracking-wideish text-[color:var(--m-subtle)]">
          <span>Claim</span>
          <span>Source</span>
          <span>Status</span>
        </div>
        {[
          ['AI support assistant', 'Product page', 'Verified'],
          ['Human escalation path', 'Help center', 'Review'],
          ['Retention language', 'Privacy page', 'Open'],
        ].map(([claim, source, status]) => (
          <div key={claim} className="grid grid-cols-[1.1fr_0.8fr_0.7fr] gap-2 border-b border-[color:var(--m-border)] py-2 text-[10px] leading-5 text-[color:var(--m-muted)] last:border-b-0">
            <span className="text-[color:var(--m-black)]">{claim}</span>
            <span>{source}</span>
            <span>{status}</span>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'handoff') {
    return (
      <div className="mt-4 rounded-md border border-[color:var(--m-border)] bg-[color:var(--m-cream)] p-4">
        <p className="font-serif text-[16px] font-semibold text-[color:var(--m-black)]">
          Buyer Handoff - ACME.ai
        </p>
        <div className="mt-3 grid gap-2 text-[11px] leading-5 text-[color:var(--m-muted)]">
          <p><span className="font-medium text-[color:var(--m-black)]">Scope:</span> AI support assistant and generated response drafts.</p>
          <p><span className="font-medium text-[color:var(--m-black)]">Included:</span> disclosure draft, source notes, governance summary.</p>
          <p><span className="font-medium text-[color:var(--m-black)]">Next review:</span> counsel review of disclosure placement.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-md border border-[color:var(--m-border)] bg-[color:var(--m-cream)] p-4">
      <div className="flex items-start justify-between gap-3 border-b border-[color:var(--m-border)] pb-3">
        <div>
          <p className="font-serif text-[16px] font-semibold text-[color:var(--m-black)]">
            AI Disclosure Draft
          </p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-wideish text-[color:var(--m-subtle)]">
            Prepared for review
          </p>
        </div>
        <span className="rounded-sm bg-[color:var(--m-green-light)] px-2 py-1 font-mono text-[9px] uppercase text-[color:var(--m-green-dark)]">
          Draft
        </span>
      </div>
      <p className="mt-3 text-[11px] leading-6 text-[color:var(--m-muted)]">
        ACME.ai uses AI to draft support responses. Users should be told when AI assists a reply and when a human reviewer is involved.
      </p>
      <p className="mt-3 border-t border-[color:var(--m-border)] pt-3 font-mono text-[9px] text-[color:var(--m-subtle)]">
        Source: acme.ai/product - scanned 12 May 2026
      </p>
    </div>
  );
}
