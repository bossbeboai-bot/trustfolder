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

export const metadata: Metadata = {
  title: 'For AI agencies — TrustFolder',
  description:
    'Add a governance handoff folder to every AI client project. For chatbot, automation, and agent-build agencies handing off AI work to mid-market clients.',
};

const PROBLEMS = [
  'Agencies build AI workflows quickly, but client procurement teams ask the same trust questions every project.',
  'Engineers write the AI; nobody writes the disclosure language, sub-processor list, or governance summary.',
  'Each new client kick-off rewrites the same trust artifacts from scratch, badly.',
  'Deals stall in the buyer’s security review because the handoff folder was never assembled.',
];

const VALUE = [
  {
    title: 'A governance handoff folder per client',
    body:
      'Adapted from the Buyer-Ready AI Governance Folder, sized to the project, with the buyer-facing disclosures and lawyer-review note already in place.',
  },
  {
    title: 'Per-client disclosure templates',
    body:
      'Reusable templates for chat, agent, and automation projects. Clear language buyers and procurement teams accept.',
  },
  {
    title: 'Agency-side data handling explanation',
    body:
      'A standardised data-handling explanation you can include in every client engagement, plus a sub-processor list template.',
  },
  {
    title: 'Handoff checklist for kick-offs and close-outs',
    body:
      'A short checklist the agency completes at project start and project handoff so the trust artifacts ship with the deliverable.',
  },
];

const PACK_CONTENTS = [
  '01-agency-templates/per-client-ai-disclosure.md',
  '01-agency-templates/data-handling-template.md',
  '01-agency-templates/sub-processor-list-template.md',
  '02-agency-policy/ai-policy-summary.md',
  '03-handoff/client-handoff-checklist.md',
  '04-buyer-legal-handoff/lawyer-review-note.md',
  'sources-and-notes.md',
];

const HOW_IT_HELPS = [
  {
    label: 'Faster client kick-off',
    blurb:
      'Pre-filled disclosure and data-handling templates skip a week of bespoke writing per engagement.',
  },
  {
    label: 'Cleaner client procurement reviews',
    blurb:
      'Buyers see a packaged handoff folder, not a stack of ad-hoc Slack messages and screenshots.',
  },
  {
    label: 'Lower legal review friction',
    blurb:
      'Each handoff folder includes a lawyer-review note pointing at the highest-risk areas first.',
  },
  {
    label: 'Repeatable internal artifact',
    blurb:
      'You stop rewriting trust artifacts per engagement. The agency policy summary stays consistent.',
  },
];

export default function AgenciesPage() {
  return (
    <SiteChrome active="agencies">
      <PageHeader
        eyebrow="For AI agencies"
        title="Add a governance handoff folder to every AI client project."
        lede="For chatbot agencies, automation studios, and agent-build shops delivering AI work to mid-market clients. The agency pack adapts the Buyer-Ready AI Governance Folder for repeatable client delivery."
      />

      <Section
        eyebrow="The problem"
        title="The AI build is fast. The trust artifacts are not."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {PROBLEMS.map((p) => (
            <Reveal
              key={p}
              className="rounded-[30px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-9 shadow-[0_22px_80px_rgba(7,17,31,0.06)]"
            >
              <p className="text-xl leading-9 tracking-[-0.03em] text-[var(--tf-ink-soft)]">{p}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="What the agency pack delivers"
        title="A reusable handoff folder you can adapt per client."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {VALUE.map((v, i) => (
            <Card key={v.title}>
              <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
                {`Layer · 0${i + 1}`}
              </span>
              <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">
                {v.title}
              </p>
              <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">{v.body}</p>
            </Card>
          ))}
        </div>

        <Reveal className="mt-10">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
              Example pack contents
            </p>
            <span className="rounded-full border border-[var(--tf-border)] bg-[var(--tf-surface)] px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate)]">
              DRAFT
            </span>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-paper)]/40 p-6 font-mono text-sm leading-7 text-[var(--tf-ink-soft)]">
            {PACK_CONTENTS.join('\n')}
          </pre>
          <p className="mt-4 font-mono text-[12px] uppercase leading-6 tracking-[0.18em] text-[var(--tf-slate-soft)]">
            ↳ Final contents calibrated to your client mix and project types
          </p>
        </Reveal>
      </Section>

      <Section eyebrow="How it helps client delivery" title="Repeat-project value, not a one-off artefact.">
        <div className="grid gap-5 lg:grid-cols-2">
          {HOW_IT_HELPS.map((h, i) => (
            <Reveal
              key={h.label}
              className="rounded-[30px] border border-[var(--tf-border)] bg-[var(--tf-bg-soft)] p-9"
            >
              <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
                {`Value · 0${i + 1}`}
              </span>
              <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">
                {h.label}
              </p>
              <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">{h.blurb}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-10">
          <ScopeNote />
        </div>
      </Section>

      <FinalCta
        title="Request the agency pack."
        body="Tell us about your client mix and the project types you handle most. We reply with how the agency pack fits within 1 business day."
        primary={{ href: '/request?type=agency', label: 'Request agency pack' }}
        secondary={{ href: '/pricing', label: 'Compare packs' }}
      />
    </SiteChrome>
  );
}
