'use client';

/**
 * /request — Phase 3.8 premium consultation flow.
 *
 * Layout:
 *  1. Selected-package hero (eyebrow + Display L headline + price line + lede)
 *  2. "What happens next" timeline — 4 steps
 *  3. Form card + summary side card (sticky on lg)
 *  4. Polished success state replaces the form on submission
 *
 * The backend contract (POST /api/request) is unchanged. All five ?type=
 * keys are supported (snapshot / disclosure / governance / premium / agency)
 * plus the legacy alias `pack` → `disclosure`.
 *
 * See docs/DESIGN.md §14.2 (/request quality bar).
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ComplianceModulesBlock,
  ExpertReviewOnlyBlock,
  ReadinessAreas,
  WhatYouGet,
} from './ClarityBlocks';
import { SiteFooter, SiteHeader } from './SiteChrome';
import {
  DocumentCard,
  GlassCard,
  MonoLabel,
  MonoNumeral,
  TrustNote,
} from './MarketingPrimitives';
import { DocumentDictionary } from '../_marketing/components/DocumentDictionary';

const options = {
  snapshot: 'AI Website Trust Snapshot',
  disclosure: 'AI Disclosure Pack',
  governance: 'Buyer-Ready AI Governance Folder',
  premium: 'Enterprise Buyer Handoff',
  agency: 'Agency Pack',
  'soc2-readiness': 'SOC 2 Readiness Evidence Pack',
  'security-questionnaire': 'Enterprise Security Questionnaire Support',
  'gdpr-ai-data-readiness': 'GDPR AI/Data Readiness Pack',
  'dpa-privacy-handoff': 'DPA / Privacy Agreement Handoff Pack',
  'iso42001-readiness': 'ISO/IEC 42001-Aligned Readiness Pack',
  'hipaa-healthcare-intake': 'HIPAA / Healthcare Data Intake Pack',
  'medical-ai-intake': 'Medical AI Expert-Review Intake',
  'employment-ai-intake': 'Hiring AI Expert-Review Intake',
  'financial-credit-insurance-intake': 'Financial / Credit / Insurance AI Intake',
  'childrens-products-intake': 'Children’s Product Expert-Review Intake',
  'biometrics-intake': 'Biometrics Expert-Review Intake',
  'law-enforcement-critical-infrastructure-intake': 'Law Enforcement / Critical Infrastructure Intake',
} as const;

type OptionKey = keyof typeof options;
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const PRICE_LABEL: Record<OptionKey, string> = {
  snapshot: '$99 · founder-prepared snapshot',
  disclosure: '$499 · disclosure pack',
  governance: '$999 · governance folder',
  premium: '$2,500+ · application only',
  agency: 'Custom · agency pack',
  'soc2-readiness': 'Request-only · readiness evidence pack',
  'security-questionnaire': 'Request-only · questionnaire support',
  'gdpr-ai-data-readiness': 'Request-only · privacy-readiness pack',
  'dpa-privacy-handoff': 'Apply · expert-review handoff',
  'iso42001-readiness': 'Request-only · readiness pack',
  'hipaa-healthcare-intake': 'Apply · expert-review intake only',
  'medical-ai-intake': 'Apply · expert-review intake only',
  'employment-ai-intake': 'Apply · expert-review intake only',
  'financial-credit-insurance-intake': 'Apply · expert-review intake only',
  'childrens-products-intake': 'Apply · expert-review intake only',
  'biometrics-intake': 'Apply · expert-review intake only',
  'law-enforcement-critical-infrastructure-intake': 'Apply · expert-review intake only',
};

const HEADLINE: Record<OptionKey, string> = {
  snapshot: 'Request your AI Website Trust Snapshot.',
  disclosure: 'Request your AI Disclosure Pack.',
  governance: 'Request your Buyer-Ready AI Governance Folder.',
  premium: 'Apply for the Enterprise Buyer Handoff.',
  agency: 'Request the agency governance pack.',
  'soc2-readiness': 'Request your SOC 2 readiness evidence pack.',
  'security-questionnaire': 'Request enterprise security questionnaire support.',
  'gdpr-ai-data-readiness': 'Request your GDPR AI/data readiness pack.',
  'dpa-privacy-handoff': 'Apply for a DPA / privacy handoff pack.',
  'iso42001-readiness': 'Request your ISO/IEC 42001-aligned readiness pack.',
  'hipaa-healthcare-intake': 'Apply for HIPAA / healthcare data intake.',
  'medical-ai-intake': 'Apply for medical AI expert-review intake.',
  'employment-ai-intake': 'Apply for hiring AI expert-review intake.',
  'financial-credit-insurance-intake': 'Apply for financial, credit, or insurance AI intake.',
  'childrens-products-intake': 'Apply for children’s product expert-review intake.',
  'biometrics-intake': 'Apply for biometrics expert-review intake.',
  'law-enforcement-critical-infrastructure-intake': 'Apply for sensitive-use expert-review intake.',
};

const SUBHEAD: Record<OptionKey, string> = {
  snapshot:
    'A short readiness snapshot prepared from your website and a few confirmation details. We review and reply within 1 business day.',
  disclosure:
    'Filled disclosure docs, placement guide, and legal-review note for your AI product. We review and reply with next steps within 1 business day.',
  governance:
    'The full buyer-ready governance folder. We review and reply with scope, expectations, and a delivery window within 1 business day.',
  premium:
    'The premium handoff is application-only. Tell us about your buyer-review moment and we will reply with whether the engagement fits.',
  agency:
    'Add a governance handoff folder to every AI client project. We review and reply with how the agency pack fits your client delivery.',
  'soc2-readiness':
    'A request-only readiness evidence pack for organizing security/control evidence for buyer review and future advisor review.',
  'security-questionnaire':
    'Request support preparing draft questionnaire answers, evidence/source maps, unknowns, confidence flags, and buyer-response handoff materials.',
  'gdpr-ai-data-readiness':
    'A request-only readiness pack for organizing AI data-use and processing information for privacy/legal review.',
  'dpa-privacy-handoff':
    'An expert-review handoff pack that prepares structured inputs for counsel or a privacy expert. We do not generate final legal agreements.',
  'iso42001-readiness':
    'A request-only readiness pack for organizing an AI management-system readiness folder aligned with ISO/IEC 42001 concepts.',
  'hipaa-healthcare-intake':
    'Expert-review intake only. We collect structured healthcare-data context and route sensitive review to qualified experts.',
  'medical-ai-intake':
    'Expert-review intake only. We capture intended use, user type, clinical role, and risk context without automated compliance conclusions.',
  'employment-ai-intake':
    'Expert-review intake only. We capture hiring or employment AI use for qualified expert/legal review.',
  'financial-credit-insurance-intake':
    'Expert-review intake only. We capture regulated decisioning context for qualified expert/legal review.',
  'childrens-products-intake':
    'Expert-review intake only. We capture child-directed product and data context for qualified expert/legal review.',
  'biometrics-intake':
    'Expert-review intake only. We capture biometric use, data type, notice prompts, retention evidence, and handoff context.',
  'law-enforcement-critical-infrastructure-intake':
    'Expert-review intake only. We route sensitive public-sector or critical infrastructure use cases away from standard automation.',
};

const PACK_INCLUDES: Record<OptionKey, string[]> = {
  snapshot: [
    'Website scan summary',
    'AI product overview',
    'Likely disclosure areas',
    'Readiness result + confidence band',
    'Recommended next steps',
  ],
  disclosure: [
    'Chatbot / agent disclosure',
    'AI-generated content notice',
    'AI system disclosure page',
    'Disclosure placement guide',
    'Internal transparency summary',
    'Legal-review note',
  ],
  governance: [
    'AI system inventory',
    'Governance policy draft',
    'Disclosure documents',
    'Evidence tracker',
    'Risk notes',
    'Lawyer / buyer handoff',
    '30-day next-steps roadmap',
  ],
  premium: [
    'Everything in the governance folder',
    'Handoff cleanup pass',
    'Loom walkthrough',
    'One revision round',
    'Optional advisor-supported review later',
  ],
  agency: [
    'Per-client folder template',
    'Agency master folder',
    'Client-handoff cover sheet',
    'Repeatable scoping checklist',
    'Pricing handled per engagement',
  ],
  'soc2-readiness': [
    'SOC 2 readiness summary',
    'Control/evidence tracker',
    'Security checklist drafts',
    'Buyer security review handoff',
    'Auditor/advisor review note',
  ],
  'security-questionnaire': [
    'Questionnaire answer draft',
    'Evidence/source map',
    'Unknowns list',
    'Confidence flags',
    'Buyer-response handoff',
  ],
  'gdpr-ai-data-readiness': [
    'Data processing summary draft',
    'AI data-use summary',
    'Personal data intake checklist',
    'DPA/privacy review handoff',
    'GDPR review note',
  ],
  'dpa-privacy-handoff': [
    'Processing activity summary',
    'Subprocessor list draft',
    'Data categories summary',
    'Open legal questions',
    'Counsel review handoff',
  ],
  'iso42001-readiness': [
    'AI management system readiness checklist',
    'AI policy draft',
    'AI system inventory',
    'Risk/opportunity register',
    'Internal governance handoff',
  ],
  'hipaa-healthcare-intake': [
    'PHI/ePHI intake summary',
    'Question set',
    'Safeguard evidence checklist',
    'Data flow summary',
    'Expert-review handoff',
  ],
  'medical-ai-intake': [
    'Medical AI intake summary',
    'Intended-use summary',
    'User/risk context summary',
    'Clinical decision-support flag',
    'Expert-review handoff',
  ],
  'employment-ai-intake': [
    'Employment AI intake summary',
    'Decision-impact checklist',
    'Exposure summary',
    'Human oversight summary',
    'Expert-review handoff',
  ],
  'financial-credit-insurance-intake': [
    'Regulated decisioning intake',
    'Affected-user summary',
    'Decision-impact summary',
    'Data-use summary',
    'Expert-review handoff',
  ],
  'childrens-products-intake': [
    'Child-user intake summary',
    'Data collection summary',
    'Parental/guardian flow checklist',
    'Risk flags',
    'Expert-review handoff',
  ],
  'biometrics-intake': [
    'Biometric-use intake summary',
    'Data type summary',
    'Notice/consent prompt list',
    'Retention evidence checklist',
    'Expert-review handoff',
  ],
  'law-enforcement-critical-infrastructure-intake': [
    'High-risk intake summary',
    'Use-case context',
    'Impacted-user summary',
    'Risk flags',
    'Expert-review handoff',
  ],
};

const TIMELINE: { step: string; title: string; body: string }[] = [
  {
    step: '01',
    title: 'You send the request',
    body: 'Tell us your pack interest, work email, website, and what buyer review moment is coming up.',
  },
  {
    step: '02',
    title: 'A founder reviews',
    body: 'We read your website with the request as context, check scope, and confirm the right pack for your case.',
  },
  {
    step: '03',
    title: 'We reply within 1 business day',
    body: 'You get a short note with scope, expectations, and a delivery window — or a clear out-of-scope explanation.',
  },
  {
    step: '04',
    title: 'You confirm and we begin',
    body: 'No charge until you confirm scope. Each pack is reviewed by a founder before delivery.',
  },
];

function normalizeType(raw: string | null): OptionKey {
  if (raw === 'pack') return 'disclosure';
  if (raw && raw in options) return raw as OptionKey;
  return 'disclosure';
}

export default function RequestPage() {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<OptionKey>('disclosure');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailDeliveryHint, setEmailDeliveryHint] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelected(normalizeType(params.get('type')));
  }, []);

  const selectedLabel = useMemo(() => options[selected], [selected]);
  const headline = HEADLINE[selected];
  const subhead = SUBHEAD[selected];
  const priceLabel = PRICE_LABEL[selected];
  const submitted = submitState === 'success';

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitState === 'submitting') return;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid work email.');
      setSubmitState('error');
      return;
    }

    setSubmitState('submitting');
    setErrorMsg(null);

    try {
      const params = new URLSearchParams(window.location.search);
      const queryType = params.get('type');
      const referrer = typeof document !== 'undefined' ? document.referrer : '';

      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pack_interest: selected,
          website,
          company_name: companyName,
          message: notes,
          source_page: '/request',
          metadata: {
            query_type: queryType ?? null,
            normalized_type: selected,
            role: role || null,
            referrer: referrer || null,
          },
        }),
      });

      if (!res.ok) {
        let detail = `request_failed_${res.status}`;
        try {
          const j = (await res.json()) as { error?: string; detail?: string };
          detail = j.detail ?? j.error ?? detail;
        } catch {
          // ignore body parse errors
        }
        setErrorMsg(
          detail === 'missing_email' || detail === 'invalid_email'
            ? 'Please enter a valid work email.'
            : 'Something went wrong saving your request. Please try again or contact us.',
        );
        setSubmitState('error');
        return;
      }

      setEmailDeliveryHint(
        'A confirmation will reach the email above shortly. If you do not see it, check spam or reply here directly.',
      );
      setSubmitState('success');
    } catch {
      setErrorMsg(
        'Something went wrong saving your request. Please try again or contact us.',
      );
      setSubmitState('error');
    }
  }

  return (
    <div className="tf-marketing tf-public-light min-h-screen overflow-hidden bg-[var(--tf-bg)] text-[var(--tf-ink)]">
      <SiteHeader />

      {/* ----------------------------------------------------------------- */}
      {/* 1. Selected-package hero                                           */}
      {/* ----------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-[var(--tf-border)]/80 bg-[var(--tf-bg-soft)]/60 px-6 pb-16 pt-20 sm:px-8 sm:pt-24 lg:px-12 lg:pb-24 lg:pt-32 2xl:px-16">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--tf-accent-soft)]/70 blur-3xl" />
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-[1520px]"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,124,138,0.2)] bg-[var(--tf-accent-soft)] px-4 py-1.5">
            <MonoLabel>Request paid pack · {selectedLabel}</MonoLabel>
          </span>
          <h1 className="mt-7 max-w-5xl text-balance text-[clamp(3rem,5.2vw,6rem)] font-semibold leading-[0.98] tracking-[-0.06em]">
            {headline}
          </h1>
          <p className="mt-7 max-w-4xl text-pretty text-xl leading-9 text-[var(--tf-slate)]">
            {subhead}
          </p>
          <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--tf-slate-soft)]">
            {priceLabel}
          </p>
        </motion.div>
      </section>

      <ReadinessAreas />

      <WhatYouGet
        description="TrustFolder helps B2B AI companies prepare review-ready AI governance documents, including AI disclosure drafts, AI use summaries, evidence trackers, source notes, buyer/legal handoff notes, and ISO/IEC 42001-aligned readiness checklists."
      />

      <DocumentDictionary />

      {/* ----------------------------------------------------------------- */}
      {/* 2. What happens next — timeline                                    */}
      {/* ----------------------------------------------------------------- */}
      {!submitted && (
        <section className="mx-auto max-w-[1520px] px-6 pt-20 sm:px-8 lg:px-12 2xl:px-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12 max-w-5xl"
          >
            <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[var(--tf-accent)]">
              What happens after you request
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
              No checkout. A founder reviews every request.
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {TIMELINE.map((t) => (
              <motion.div
                key={t.step}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <DocumentCard className="h-full">
                  <div className="flex items-center justify-between">
                    <MonoNumeral>{t.step}</MonoNumeral>
                    <span className="h-2 w-2 rounded-full bg-[var(--tf-accent)]" />
                  </div>
                  <h3 className="mt-10 text-2xl font-semibold leading-tight tracking-[-0.04em]">
                    {t.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">{t.body}</p>
                </DocumentCard>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 3. Form card + summary side card                                   */}
      {/* ----------------------------------------------------------------- */}
      <main className="mx-auto grid max-w-[1520px] gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:px-12 lg:py-28 2xl:px-16">
        {submitted ? (
          <SuccessCard
            selected={selected}
            selectedLabel={selectedLabel}
            email={email}
            companyName={companyName}
            website={website}
            notes={notes}
            emailDeliveryHint={emailDeliveryHint}
            onReset={() => {
              setSubmitState('idle');
              setErrorMsg(null);
            }}
          />
        ) : (
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[42px] border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] p-8 shadow-[0_34px_140px_rgba(7,17,31,0.13)] sm:p-12"
          >
            <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[var(--tf-accent)]">Send a request</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Tell us about your AI product and what review is coming up.
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">
              All fields except the email are optional but help us reply with the right next
              step.
            </p>
            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <FormField label="Pack interest" htmlFor="pack">
                <select
                  id="pack"
                  value={selected}
                  onChange={(event) => setSelected(event.target.value as OptionKey)}
                  className="h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
                >
                  {Object.entries(options).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Work email" htmlFor="email" required>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="founder@company.com"
                  required
                  className="h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Company name" htmlFor="company">
                  <input
                    id="company"
                    type="text"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="Acme AI"
                    className="h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
                  />
                </FormField>
                <FormField label="Product website" htmlFor="website">
                  <input
                    id="website"
                    type="text"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    placeholder="https://company.ai"
                    className="h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
                  />
                </FormField>
              </div>

              <FormField
                label="Your role / company type"
                hint="Optional"
                htmlFor="role"
              >
                <input
                  id="role"
                  type="text"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="Founder · AI agency · Head of compliance · …"
                  className="h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
                />
              </FormField>

              <FormField label="What are you preparing for?" htmlFor="notes">
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Buyer review · agency handoff · legal review · internal AI governance cleanup …"
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 py-4 text-base leading-7 outline-none transition focus:border-[var(--tf-accent)]"
                />
              </FormField>

              {errorMsg && (
                <div className="rounded-2xl border border-[#cdb47a]/40 bg-[var(--tf-warning-soft)] px-4 py-3 text-sm leading-6 text-[#7a4a00]">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitState === 'submitting'}
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[var(--tf-ink)] px-8 text-base font-medium text-[var(--tf-on-light)] shadow-[0_18px_60px_rgba(7,17,31,0.2)] transition hover:bg-[var(--tf-ink-soft)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitState === 'submitting' ? 'Sending request…' : 'Send request'}
              </button>

              <p className="text-sm leading-7 text-[var(--tf-slate-soft)]">
                Nothing is charged. We use this to understand your AI product, scope, and handoff
                needs before preparing a paid pack.
              </p>
            </form>
          </motion.section>
        )}

        {/* Side card — package summary, sticky on lg */}
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5 lg:sticky lg:top-28 lg:self-start"
        >
          <GlassCard>
            <MonoLabel>Package summary</MonoLabel>
            <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">
              {selectedLabel}
            </p>
            <p className="mt-3 text-base leading-7 text-[var(--tf-slate)]">{priceLabel}</p>
            <ul className="mt-6 space-y-3 border-t border-[var(--tf-border)] pt-6 text-base leading-7 text-[var(--tf-ink-soft)]">
              {PACK_INCLUDES[selected].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-[var(--tf-border)] pt-5 font-mono text-[11px] uppercase leading-6 tracking-[0.18em] text-[var(--tf-slate-soft)]">
              ↳ Each pack reviewed by a founder before delivery
            </p>
          </GlassCard>
          <GlassCard>
            <MonoLabel>Privacy note</MonoLabel>
            <ul className="mt-4 space-y-3">
              <TrustNote icon="✓">No payment required at this step</TrustNote>
              <TrustNote icon="§">Not legal advice. Not certification.</TrustNote>
              <TrustNote icon="↗">High-risk areas route to expert review</TrustNote>
              <TrustNote icon="✉">We reply within 1 business day</TrustNote>
            </ul>
            <p className="mt-6 text-sm leading-7 text-[var(--tf-slate-soft)]">
              Not sure which pack fits?{' '}
              <Link
                href="/pricing"
                className="underline decoration-[var(--tf-border-strong)] underline-offset-2 hover:text-[var(--tf-ink)]"
              >
                Compare packs
              </Link>{' '}
              or{' '}
              <Link
                href="/assessment"
                className="underline decoration-[var(--tf-border-strong)] underline-offset-2 hover:text-[var(--tf-ink)]"
              >
                run the free check
              </Link>{' '}
              first.
            </p>
          </GlassCard>
        </motion.aside>
      </main>
      <ComplianceModulesBlock
        eyebrow="Request-only modules"
        title="Choose a compliance-readiness module or expert-review intake."
        showCtas
      />

      <ExpertReviewOnlyBlock />

      <SiteFooter />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Local helpers                                                              */
/* -------------------------------------------------------------------------- */

function FormField({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="flex items-baseline justify-between text-base font-medium text-[var(--tf-ink)]"
      >
        <span>
          {label}
          {required && <span className="ml-1 text-[var(--tf-accent)]">*</span>}
        </span>
        {hint && (
          <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
            {hint}
          </span>
        )}
      </label>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SuccessCard({
  selected,
  selectedLabel,
  email,
  companyName,
  website,
  notes,
  emailDeliveryHint,
  onReset,
}: {
  selected: OptionKey;
  selectedLabel: string;
  email: string;
  companyName: string;
  website: string;
  notes: string;
  emailDeliveryHint: string | null;
  onReset: () => void;
}) {
  void selected;
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[36px] border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] p-6 shadow-[0_30px_120px_rgba(7,17,31,0.12)] sm:p-10"
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--tf-success-soft)] px-3 py-1 text-xs font-medium text-[#0f6b3a]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#0f6b3a]" />
        Request received
      </span>
      <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.04] tracking-[-0.05em] sm:text-4xl">
        We&rsquo;ll review your website and reply with next steps.
      </h2>
      <p className="mt-5 text-base leading-7 text-[var(--tf-slate)]">
        A founder will read this within 1 business day. Nothing is charged. We&rsquo;ll follow up
        by email with the next step for the pack you asked about.
      </p>
      {emailDeliveryHint && (
        <p className="mt-3 text-sm leading-6 text-[var(--tf-slate-soft)]">{emailDeliveryHint}</p>
      )}
      <div className="mt-8 rounded-[24px] border border-[var(--tf-border)] bg-[var(--tf-bg-soft)] p-6">
        <MonoLabel tone="soft">Submitted summary</MonoLabel>
        <dl className="mt-4 grid gap-3 text-sm leading-6 text-[var(--tf-ink-soft)] sm:grid-cols-[8.5rem_1fr]">
          <SummaryRow label="Pack" value={selectedLabel} />
          <SummaryRow label="Email" value={email || 'Not provided'} />
          {companyName && <SummaryRow label="Company" value={companyName} />}
          <SummaryRow label="Website" value={website || 'Not provided'} />
          {notes && <SummaryRow label="Notes" value={notes} multiline />}
        </dl>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-6 text-sm font-medium text-[var(--tf-ink)] transition hover:bg-[var(--tf-accent-soft)]"
        >
          Send another request
        </button>
        <Link
          href="/assessment"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--tf-ink)] px-6 text-sm font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)]"
        >
          Run free eligibility check
        </Link>
      </div>
    </motion.section>
  );
}

function SummaryRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <>
      <dt className="text-[var(--tf-slate)]">{label}</dt>
      <dd
        className={`text-[var(--tf-ink-soft)] ${
          multiline ? 'whitespace-pre-wrap leading-relaxed' : ''
        }`}
      >
        {value}
      </dd>
    </>
  );
}
