import { SiteChrome } from '../components/SiteChrome';
import {
  ExpertReviewOnlyBlock,
  PlannedModulesBlock,
  ReadinessAreas,
  WhatYouGet,
} from '../components/ClarityBlocks';
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
  title: 'Examples — TrustFolder',
  description:
    'Illustrative samples of how TrustFolder packs are structured for B2B AI SaaS, an AI agency, and an AI productivity tool. None of these are real customers.',
};

interface Example {
  label: string;
  product: string;
  scan_summary: string[];
  disclosure_needs: string[];
  folder_contents: string[];
  doc_snippet: { title: string; body: string };
  next_steps: string[];
}

const EXAMPLES: Example[] = [
  {
    label: 'B2B AI chatbot',
    product:
      'A customer support chatbot that drafts replies for a small SaaS team. The chat widget is embedded on the marketing site and inside the product.',
    scan_summary: [
      'Homepage mentions “AI-powered support” without explaining model use',
      'Pricing page references “AI replies” without disclosure language',
      'No security or AI policy page found',
      'No sub-processor list found',
    ],
    disclosure_needs: [
      'Chatbot user-facing disclosure',
      'AI-generated reply notice',
      'AI system disclosure page (linked from footer)',
      'Internal transparency summary',
      'Legal-review note for the lawyer',
    ],
    folder_contents: [
      '01-disclosures/chatbot-disclosure.md',
      '01-disclosures/ai-content-notice.md',
      '01-disclosures/ai-system-disclosure-page.md',
      '01-disclosures/placement-guide.md',
      '02-internal-summary.md',
      '03-legal-review-note.md',
      'sources-and-notes.md',
    ],
    doc_snippet: {
      title: 'Chatbot disclosure (excerpt)',
      body:
        '“This assistant is an AI system. It generates replies based on your message and may be incorrect. A human reviews escalations before any account or billing change is made. You can ask to speak to a person at any time.”',
    },
    next_steps: [
      'Place the chatbot disclosure inside the chat header',
      'Link the AI system disclosure page from the site footer',
      'Share the legal-review note with your external lawyer',
      'Re-run a check after any product copy change',
    ],
  },
  {
    label: 'AI automation agency',
    product:
      'A studio of three people building chatbots, internal copilots, and workflow automations for mid-market clients across the EU and US.',
    scan_summary: [
      'Service pages list AI agent and automation work',
      'Several client case studies, none with governance language',
      'No public AI policy or sub-processor list',
      'No data handling explanation visible to a client procurement team',
    ],
    disclosure_needs: [
      'Per-client AI use disclosure template',
      'Agency-side data handling explanation',
      'Sub-processor list template',
      'Client-facing AI policy summary',
      'Handoff checklist for new client kick-offs',
    ],
    folder_contents: [
      '01-agency-templates/per-client-ai-disclosure.md',
      '01-agency-templates/data-handling-template.md',
      '01-agency-templates/sub-processor-list-template.md',
      '02-agency-policy/ai-policy-summary.md',
      '03-handoff/client-handoff-checklist.md',
      '04-buyer-legal-handoff/lawyer-review-note.md',
      'sources-and-notes.md',
    ],
    doc_snippet: {
      title: 'Per-client AI use disclosure (excerpt)',
      body:
        '“For [Client], the agent assists [function]. It uses [model family] and may be incorrect. [Client]’s team reviews [decision points] before any user-facing action. Personal data is handled per [Client]’s privacy policy and the data-handling addendum in this folder.”',
    },
    next_steps: [
      'Embed the per-client AI use disclosure into every project handoff',
      'Add the agency policy summary to the public site',
      'Pre-fill the sub-processor list before each client kick-off',
      'Use the handoff checklist as the close-out artifact for each engagement',
    ],
  },
  {
    label: 'AI productivity tool',
    product:
      'A B2B productivity copilot that summarises meetings and drafts follow-ups. Sold to ops, sales, and HR teams. Some customers are in the EU.',
    scan_summary: [
      'Homepage and product pages reference AI in nearly every section',
      'Pricing page describes “AI summarisation” without model context',
      'A short privacy note exists, but no dedicated AI use page',
      'EU pricing visible (signals EU customer base)',
    ],
    disclosure_needs: [
      'AI-generated content notice on summaries',
      'Customer-facing AI use page',
      'Data handling explanation for EU customers',
      'Internal transparency summary',
      'Lawyer/buyer handoff note',
    ],
    folder_contents: [
      '01-disclosures/ai-content-notice.md',
      '01-disclosures/ai-system-disclosure-page.md',
      '01-disclosures/placement-guide.md',
      '02-governance/data-handling.md',
      '02-governance/eu-customer-notes.md',
      '03-internal-summary.md',
      '04-buyer-legal-handoff/handoff-note.md',
      'sources-and-notes.md',
    ],
    doc_snippet: {
      title: 'AI-generated content notice (excerpt)',
      body:
        '“This summary was generated by an AI model from your meeting transcript. Names and quotes may be incorrect. We recommend a quick review before sharing externally. Originals remain available in your meeting record.”',
    },
    next_steps: [
      'Add the AI-generated content notice to every summary export',
      'Link the AI system disclosure page from the app and the marketing site',
      'Share the EU customer note with the data protection lead',
      'Use the handoff note in the next enterprise procurement review',
    ],
  },
];

const MODULE_EXAMPLES = [
  {
    title: 'SOC 2 readiness evidence pack',
    purpose: 'Organize security/control evidence for buyer review and future advisor preparation.',
    outputs: [
      'SOC 2 readiness summary',
      'Control/evidence tracker',
      'Security policy draft checklist',
      'Access control evidence checklist',
      'Buyer security review handoff',
      'Auditor/advisor review note',
    ],
  },
  {
    title: 'Enterprise security questionnaire support',
    purpose: 'Prepare draft buyer-questionnaire answers from existing product, security, and governance context.',
    outputs: [
      'Questionnaire answer draft',
      'Evidence/source map',
      'Unknowns list',
      'Red/yellow/green confidence flags',
      'Supporting-doc checklist',
      'Buyer-response handoff',
    ],
  },
  {
    title: 'GDPR AI/data readiness pack',
    purpose: 'Organize AI data-use and processing information for privacy/legal review.',
    outputs: [
      'Data processing summary draft',
      'AI data-use summary',
      'Personal data intake checklist',
      'Subprocessor/vendor evidence tracker',
      'DPA/privacy review handoff',
      'GDPR review note',
    ],
  },
  {
    title: 'ISO 42001 readiness pack',
    purpose: 'Organize an AI management-system readiness folder aligned with ISO 42001-inspired concepts.',
    outputs: [
      'AI management system readiness checklist',
      'AI policy draft',
      'AI system inventory',
      'Risk/opportunity register',
      'Monitoring and improvement log',
      'Internal governance handoff',
    ],
  },
  {
    title: 'Expert-review intake example',
    purpose: 'Route sensitive healthcare, hiring, financial, biometric, child-directed, public-sector, or critical infrastructure use cases away from standard automation.',
    outputs: [
      'High-risk intake summary',
      'Use-case context',
      'Impacted-user summary',
      'Risk flags',
      'Open expert-review questions',
      'Expert-review handoff',
    ],
  },
] as const;

export default function ExamplesPage() {
  return (
    <SiteChrome active="examples">
      <PageHeader
        eyebrow="Examples"
        title="Illustrative samples of how a TrustFolder pack is structured."
        lede="None of the examples below are real customers. They are written to show how a typical pack is organised and how the language is calibrated for buyer review."
      />

      <ReadinessAreas />

      <WhatYouGet
        description="Example folders show the kind of review-ready drafts TrustFolder prepares: AI disclosure drafts, AI use summaries, governance notes, evidence trackers, source notes, buyer/legal handoff notes, and readiness roadmaps."
        ctaHref="/pricing"
        ctaLabel="Compare packs"
      />

      <Section>
        <div className="flex items-start gap-4 rounded-[28px] border border-[#cdb47a]/40 bg-[var(--tf-warning-soft)] px-8 py-7 text-base leading-8 text-[var(--tf-ink)]">
          <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#cdb47a]/60 bg-[var(--tf-surface)] font-mono text-[12px] tracking-[0.18em] text-[#7a4a00]">
            ⚠
          </span>
          <div>
            <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[#7a4a00]">
              Illustrative sample
            </p>
            <p className="mt-2 text-base leading-8">
              Not a real customer pack. The companies, products, and quoted snippets below are
              fictional and exist solely to show the structure of a TrustFolder pack.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="space-y-12">
          {EXAMPLES.map((ex, i) => (
            <Reveal key={ex.label}>
              <div className="rounded-[36px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-9 shadow-[0_30px_120px_rgba(7,17,31,0.09)] sm:p-12">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
                    {`Example · 0${i + 1}`}
                  </span>
                  <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
                    Illustrative sample · not a real customer pack
                  </span>
                </div>
                <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                  {ex.label}
                </h2>
                <p className="mt-5 text-lg leading-8 text-[var(--tf-slate)]">{ex.product}</p>

                <div className="mt-12 grid gap-8 lg:grid-cols-2">
                  <div>
                    <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
                      Website scan summary
                    </p>
                    <ul className="mt-4 space-y-3 text-base leading-8 text-[var(--tf-slate)]">
                      {ex.scan_summary.map((s) => (
                        <li key={s} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
                      Likely disclosure needs
                    </p>
                    <ul className="mt-4 space-y-3 text-base leading-8 text-[var(--tf-slate)]">
                      {ex.disclosure_needs.map((s) => (
                        <li key={s} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-12">
                  <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
                    Folder contents
                  </p>
                  <pre className="mt-4 overflow-x-auto rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-paper)]/40 p-6 font-mono text-sm leading-7 text-[var(--tf-ink-soft)]">
                    {ex.folder_contents.join('\n')}
                  </pre>
                </div>

                <div className="mt-12 rounded-[34px] border border-[var(--tf-border)] bg-[var(--tf-document)] p-9 shadow-[0_26px_90px_rgba(7,17,31,0.09)]">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
                      {ex.doc_snippet.title}
                    </p>
                    <span className="rounded-full border border-[var(--tf-border)] bg-[var(--tf-surface)] px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate)]">
                      DRAFT
                    </span>
                  </div>
                  <p className="mt-5 text-base leading-8 text-[var(--tf-ink-soft)]">
                    {ex.doc_snippet.body}
                  </p>
                  <p className="mt-5 font-mono text-[12px] uppercase leading-6 tracking-[0.18em] text-[var(--tf-slate-soft)]">
                    ↳ Illustrative wording · final pack copy calibrated to your product
                  </p>
                </div>

                <div className="mt-10">
                  <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
                    Next-step roadmap preview
                  </p>
                  <ul className="mt-4 space-y-3 text-base leading-8 text-[var(--tf-slate)]">
                    {ex.next_steps.map((s) => (
                      <li key={s} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-12">
          <ScopeNote />
        </div>
      </Section>

      <Section eyebrow="Compliance-readiness module examples" title="Illustrative samples for the Phase 6 module architecture.">
        <p className="-mt-4 mb-10 max-w-4xl text-lg leading-9 text-[var(--tf-slate)]">
          Illustrative sample. Not a real customer pack. These examples show how module outputs are
          framed as readiness drafts, evidence packs, intake summaries, questionnaire support, and
          expert-review handoff materials.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          {MODULE_EXAMPLES.map((example) => (
            <Reveal
              key={example.title}
              className="rounded-[30px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-8 shadow-[0_24px_80px_rgba(7,17,31,0.08)]"
            >
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
                Illustrative sample. Not a real customer pack.
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.05em] text-[var(--tf-ink)]">
                {example.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">{example.purpose}</p>
              <ul className="mt-6 space-y-3 text-base leading-7 text-[var(--tf-ink-soft)]">
                {example.outputs.map((output) => (
                  <li key={output} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
                    <span>{output}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-7 text-[var(--tf-slate-soft)]">
                Not legal advice. Not certification. Not a compliance guarantee.
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      <PlannedModulesBlock />

      <ExpertReviewOnlyBlock />

      <FinalCta
        title="Want a pack like this for your product?"
        body="Run the free eligibility check, then request the pack that matches your buyer-review moment."
        primary={{ href: '/assessment', label: 'Run free eligibility check' }}
        secondary={{ href: '/pricing', label: 'Compare packs' }}
      />
    </SiteChrome>
  );
}
