import type { Metadata } from 'next';
import { MarketingShell } from '../_marketing/components/Shell';
import { PrimaryCTA, GhostCTA } from '../_marketing/components/Button';
import { DocumentDictionary } from '../_marketing/components/DocumentDictionary';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Sample AI Governance Documents and Buyer Review Packet',
  description:
    'View an illustrative TrustFolder buyer-review packet with AI disclosure drafts, evidence tracker, source notes, readiness score, and open review items.',
  path: '/sample-ai-governance-documents',
});

const DOCS = [
  ['AI disclosure draft', 'User-facing language for an AI support assistant.', 'Prepared for review'],
  ['AI use summary', 'Plain-English scope and product context for buyer intake.', 'Source-traced'],
  ['Evidence tracker', 'Claims mapped to product page, help center, and privacy page.', '3 open items'],
  ['Buyer/legal handoff', 'One-page orientation for counsel and procurement.', 'Packet-ready'],
] as const;

const OPEN_ITEMS = [
  'Confirm whether AI output is always reviewed before account-impacting actions.',
  'Add public retention language for AI support transcripts.',
  'Decide where the AI disclosure notice should appear in-product.',
] as const;

export default function SampleGovernanceDocumentsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-site px-6 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
              Sample buyer packet
            </p>
            <h1 className="mt-4 max-w-[12ch] font-serif text-[42px] font-semibold leading-[1.02] text-[color:var(--m-black)] md:text-[64px]">
              See what buyers can review.
            </h1>
            <p className="mt-6 max-w-[48ch] text-[16px] leading-relaxed text-[color:var(--m-muted)]">
              This fictional packet shows the shape of a TrustFolder handoff: scope, readiness score, artifact inventory, source trail, and open review items.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <PrimaryCTA href="/assessment" size="lg">
                Run free readiness check
              </PrimaryCTA>
              <GhostCTA href="/examples" size="lg">
                Back to examples
              </GhostCTA>
            </div>
            <p className="mt-5 max-w-[48ch] font-mono text-[11px] leading-relaxed text-[color:var(--m-subtle)]">
              Illustrative sample. Not a real customer pack. Not legal advice, certification, or a compliance guarantee.
            </p>
          </div>
          <SamplePacket />
        </div>
      </section>

      <DocumentDictionary />

      <section className="bg-[color:var(--m-cream)]">
        <div className="mx-auto max-w-site px-6 py-16 text-center md:px-8 md:py-20">
          <h2 className="mx-auto max-w-[24ch] font-serif text-[34px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[44px]">
            Want this mapped to your own AI product?
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[15px] leading-relaxed text-[color:var(--m-muted)]">
            Start with the free check. TrustFolder scans your product website and shows whether a source-traced evidence folder is a fit.
          </p>
          <div className="mt-8">
            <PrimaryCTA href="/assessment" size="lg">
              Run free readiness check
            </PrimaryCTA>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

function SamplePacket() {
  return (
    <article className="rounded-2xl border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-6 shadow-[0_24px_80px_rgba(28,49,38,0.12)] md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--m-border)] pb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            Buyer review packet
          </p>
          <h2 className="mt-2 font-serif text-[28px] font-semibold leading-tight text-[color:var(--m-black)]">
            ACME.ai Support Assistant
          </h2>
        </div>
        <span className="rounded-sm bg-[color:var(--m-green-light)] px-2 py-1 font-mono text-[10px] uppercase tracking-wideish text-[color:var(--m-green-dark)]">
          Fictional sample
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-xl border border-[color:var(--m-border)] bg-[color:var(--m-cream)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            AI documentation readiness
          </p>
          <p className="mt-4 font-serif text-[56px] font-semibold leading-none text-[color:var(--m-black)]">
            74<span className="text-[24px] text-[color:var(--m-muted)]">/100</span>
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--m-muted)]">
            Good starting posture. Review retention language and disclosure placement before external use.
          </p>
        </div>
        <div className="rounded-xl border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            Scope summary
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--m-muted)]">
            ACME.ai uses an AI assistant to draft customer support replies. Users interact with AI-assisted output directly, while account-impacting actions are escalated to a human reviewer.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wideish text-[color:var(--m-subtle)]">
            Sources: acme.ai/product, acme.ai/help, acme.ai/privacy
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {DOCS.map(([title, body, status]) => (
          <div key={title} className="grid gap-3 rounded-xl border border-[color:var(--m-border)] bg-[color:var(--m-cream)] p-4 md:grid-cols-[0.7fr_1fr_auto] md:items-center">
            <p className="font-medium text-[color:var(--m-black)]">{title}</p>
            <p className="text-[13px] leading-relaxed text-[color:var(--m-muted)]">{body}</p>
            <span className="font-mono text-[10px] uppercase tracking-wideish text-[color:var(--m-green-dark)]">
              {status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-[color:var(--m-amber)] bg-[color:var(--m-amber-light)] p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-amber-dark)]">
          Open review items
        </p>
        <ul className="mt-3 grid gap-2">
          {OPEN_ITEMS.map((item) => (
            <li key={item} className="flex gap-3 text-[13px] leading-relaxed text-[color:var(--m-muted)]">
              <span className="text-[color:var(--m-amber-dark)]">!</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
