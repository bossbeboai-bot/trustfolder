import { SiteChrome } from '../components/SiteChrome';
import {
  ComplianceModulesBlock,
  ExpertReviewOnlyBlock,
  ReadinessAreas,
} from '../components/ClarityBlocks';
import {
  Card,
  ConfidenceBadge,
  FinalCta,
  PageHeader,
  Reveal,
  ScopeNote,
  Section,
} from '../components/MarketingPrimitives';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Safety and scope — TrustFolder',
  description:
    'What TrustFolder does, what it does not do, and which verticals are out of scope. Not legal advice. Not certification. Not a compliance guarantee.',
};

const DOES = [
  'Scan a public AI product website and read its public claims.',
  'Help you confirm a few details about your AI product in plain English.',
  'Prepare AI governance evidence drafts (disclosure, governance, handoff) organised around your product.',
  'Format the drafts for buyer, internal, and lawyer review.',
  'Flag where AI-aware buyers are likely to ask follow-up questions.',
];

const DOES_NOT = [
  'Provide legal advice. We are not a law firm.',
  'Audit, certify, or accredit your product or company.',
  'Guarantee that any pack will pass procurement, legal review, or any regulator.',
  'Replace your lawyer, your DPO, or your security review process.',
  'Auto-publish anything to your live site or your customers.',
  'Auto-generate packs for high-risk verticals or prohibited use cases.',
];

const OUT_OF_SCOPE = [
  {
    label: 'Healthcare diagnosis',
    blurb: 'Diagnostic AI, clinical decision support, medical device classification.',
  },
  {
    label: 'HR and hiring',
    blurb: 'Resume screening, candidate scoring, employee performance scoring.',
  },
  {
    label: 'Credit scoring',
    blurb: 'Lending decisions, credit eligibility, repayment risk scoring.',
  },
  {
    label: 'Insurance decisions',
    blurb: 'Underwriting, claims handling automation, premium scoring.',
  },
  {
    label: 'Biometrics',
    blurb: 'Face / voice / iris recognition, biometric categorisation, liveness.',
  },
  {
    label: "Children's products",
    blurb: 'Products primarily targeted at users under 18.',
  },
  {
    label: 'Law enforcement',
    blurb: 'Predictive policing, surveillance assistance, evidence weighting.',
  },
  {
    label: 'Critical infrastructure',
    blurb: 'Energy grid, water, transport safety control loops.',
  },
  {
    label: 'Education grading and admissions',
    blurb: 'Auto-grading, admissions decisions, plagiarism scoring used to penalise.',
  },
];

export default function SafetyPage() {
  return (
    <SiteChrome active="safety">
      <PageHeader
        eyebrow="Safety and scope"
        title="Safe by default. Clear when expert review is needed."
        lede="TrustFolder is designed to make buyer review smoother, not to replace legal review or certification. This page explains where we help, where we do not, and which verticals are out of scope."
      />

      <ReadinessAreas />

      <Section eyebrow="Confidence bands" title="How we describe fit on the assessment.">
        <p className="-mt-4 mb-10 max-w-4xl text-lg leading-9 text-[var(--tf-slate)]">
          The free check returns one of three bands. Each band has a clear next step. We never
          fail silently.
        </p>
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="rounded-[34px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-9 shadow-[0_30px_110px_rgba(7,17,31,0.09)]">
            <ConfidenceBadge tone="fit" label="Likely fit" />
            <p className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.04em] text-[var(--tf-ink)]">
              We can prepare a pack.
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">
              Your AI use looks like one of the patterns TrustFolder is calibrated for. The
              assessment recommends a pack tier and you decide whether to request it.
            </p>
          </Reveal>
          <Reveal className="rounded-[34px] border border-[var(--tf-border)] bg-[var(--tf-warning-soft)]/60 p-9 shadow-[0_30px_110px_rgba(7,17,31,0.09)]">
            <ConfidenceBadge tone="review" label="Some review needed" />
            <p className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.04em] text-[var(--tf-ink)]">
              Pack ships with extra notes.
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">
              Some answers point at sensitive areas. We still prepare the pack, but include extra
              notes for your lawyer pointing at the highest-risk language first.
            </p>
          </Reveal>
          <Reveal className="rounded-[34px] border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] p-9 shadow-[0_30px_110px_rgba(7,17,31,0.09)]">
            <ConfidenceBadge tone="expert" label="Expert review required" />
            <p className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.04em] text-[var(--tf-ink)]">
              We do not prepare a pack.
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">
              Your product operates in an out-of-scope vertical (see below). We route you to
              expert review with a short explanation of why — and never charge anything.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section eyebrow="What TrustFolder does" title="What we will help you prepare.">
        <div className="grid gap-6 lg:grid-cols-3">
          {DOES.map((item) => (
            <Card key={item}>
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
                We do
              </p>
              <p className="mt-4 text-base leading-8 text-[var(--tf-ink-soft)]">{item}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="What TrustFolder does not do" title="What we will not pretend to do.">
        <div className="grid gap-6 lg:grid-cols-3">
          {DOES_NOT.map((item) => (
            <Reveal
              key={item}
              className="rounded-[30px] border border-[var(--tf-border)] bg-[var(--tf-bg-soft)] p-9"
            >
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
                We do not
              </p>
              <p className="mt-4 text-base leading-8 text-[var(--tf-ink-soft)]">{item}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Out of scope"
        title="We do not auto-generate packs for the following verticals."
      >
        <p className="-mt-4 mb-8 max-w-4xl text-lg leading-9 text-[var(--tf-slate)]">
          If your product operates in any of these areas, the free eligibility check will route you
          to expert-review messaging instead of preparing a pack. This is not a judgement on your
          product. It reflects that these verticals carry stricter rules that need specialised
          legal review beyond what TrustFolder is designed to do.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {OUT_OF_SCOPE.map((v, i) => (
            <Reveal
              key={v.label}
              className="rounded-[30px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-9 shadow-[0_26px_90px_rgba(7,17,31,0.08)]"
            >
              <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
                {`Out · 0${i + 1}`}
              </span>
              <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">
                {v.label}
              </p>
              <p className="mt-3 text-base leading-8 text-[var(--tf-slate)]">{v.blurb}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <ComplianceModulesBlock
        eyebrow="Module safety"
        title="Readiness packs, expert-review handoffs, and intake-only routing."
      />

      <ExpertReviewOnlyBlock />

      <Section
        eyebrow="When in doubt"
        title="The free eligibility check tells you whether TrustFolder is a fit before you spend anything."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">If you fit</p>
            <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">
              We tell you which pack matches your buyer-review moment. You decide whether to
              request the pack.
            </p>
          </Card>
          <Card>
            <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">If you do not fit</p>
            <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">
              We tell you plainly. We do not prepare a pack and we do not charge anything. Where
              useful, we point at categories of legal review that are likely to be relevant.
            </p>
          </Card>
        </div>
        <div className="mt-10">
          <ScopeNote />
        </div>
      </Section>

      <FinalCta
        title="Check your fit before requesting a pack."
        body="The free eligibility check takes about two minutes and never charges anything."
        primary={{ href: '/assessment', label: 'Check your fit' }}
        secondary={{ href: '/pricing', label: 'Compare packs' }}
      />
    </SiteChrome>
  );
}
