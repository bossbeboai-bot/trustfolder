'use client';

/**
 * /assessment — Phase 3.7 premium-polish guided flow.
 *
 * 4 visible steps: Website -> Confirm -> Review -> Request.
 * Backend contract is unchanged: POST /api/scan, POST /api/confirm.
 * Supported paid tiers create a PayPal checkout after the fit check. Snapshot
 * remains request-only until snapshot generation is implemented.
 */

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { SiteChrome } from '../components/SiteChrome';
import {
  ConfidenceBadge as TFConfidenceBadge,
  DocumentCard,
  Eyebrow,
  GlassCard,
  MonoLabel,
  MonoNumeral,
  SideInfoCard as TFSideInfoCard,
  TrustNote,
} from '../components/MarketingPrimitives';
import { ReadinessScoreCard, type ReadinessScoreView } from '../components/ReadinessScoreCard';

// ---------- types ----------
type Step = 'enter' | 'scanning' | 'confirm' | 'review' | 'result' | 'out_of_scope';

interface ExtractionPayload {
  company_name: string;
  product_name?: string;
  product_description: string;
  ai_features: Array<{
    name: string;
    description: string;
    feature_type: string;
    customer_facing: boolean;
  }>;
  target_users: string;
  b2b_or_b2c: string;
  eu_signals: string[];
  possible_risk_areas: string[];
  confidence: 'low' | 'medium' | 'high';
  used_fallback_minimal: boolean;
}
interface ScanResponse {
  assessment_id: string;
  scan_ok: boolean;
  extraction: ExtractionPayload | null;
}
type PaidTier = 'tier_1' | 'tier_2' | 'tier_3';
interface ConfirmResponse {
  in_scope: boolean;
  band: string;
  recommended_tier: PaidTier | null;
  user_message: string;
  next_step: 'pay' | 'out_of_scope' | 'soft_out_review';
  readiness?: ReadinessScoreView | null;
}
interface TierOption {
  id: PaidTier;
  name: string;
  price: string;
  tagline: string;
  bullets: string[];
}

// ---------- constants ----------
const TIER_OPTIONS: Record<PaidTier, TierOption> = {
  tier_1: {
    id: 'tier_1',
    name: 'AI Website Trust Snapshot',
    price: '$99',
    tagline: 'A short readiness snapshot you can share internally.',
    bullets: [
      'Website scan summary + AI product overview',
      'Likely disclosure areas, in plain English',
      'Readiness result with confidence band',
      'Recommended next steps + expert-review flags',
    ],
  },
  tier_2: {
    id: 'tier_2',
    name: 'AI Disclosure Pack',
    price: '$499',
    tagline: 'Filled disclosure documents for your AI product.',
    bullets: [
      '6-7 filled disclosure documents',
      'Disclosure placement guide',
      'Internal transparency summary',
      '1-page legal-review note for your lawyer',
    ],
  },
  tier_3: {
    id: 'tier_3',
    name: 'Buyer-Ready AI Governance Folder',
    price: '$999',
    tagline: 'The full buyer-ready folder. Disclosure + governance + handoff.',
    bullets: [
      'Everything in the Disclosure Pack',
      'AI system inventory + governance policy',
      'Evidence tracker + risk notes',
      'Lawyer/buyer handoff + 30-day roadmap',
    ],
  },
};

const VERTICAL_OPTIONS = [
  { v: 'marketing', label: 'Marketing / sales / growth' },
  { v: 'sales', label: 'Sales tools (SDR, CRM enrichment)' },
  { v: 'dev_tools', label: 'Developer tools' },
  { v: 'customer_support', label: 'Customer support / chat' },
  { v: 'productivity', label: 'Productivity / collaboration' },
  { v: 'design', label: 'Design tools' },
  { v: 'research', label: 'Research / search' },
  { v: 'other', label: 'Something else (in-scope)' },
  { v: 'banking', label: 'Banking / finance / lending - out of scope' },
  { v: 'healthcare', label: 'Healthcare / medical - out of scope' },
  { v: 'hr', label: 'HR / hiring / employment - out of scope' },
  { v: 'biometric', label: 'Biometric ID - out of scope' },
  { v: 'children', label: "Children's product (under 18) - out of scope" },
  { v: 'credit', label: 'Credit scoring - out of scope' },
  { v: 'law_enforcement', label: 'Law enforcement / legal-litigation - out of scope' },
];

const PROGRESS_STEPS = [
  { num: 1, label: 'Website' },
  { num: 2, label: 'Confirm' },
  { num: 3, label: 'Review' },
  { num: 4, label: 'Request' },
] as const;

const SCAN_STAGES = [
  'Scanning website',
  'Extracting AI use signals',
  'Preparing confirmation questions',
  'Checking scope fit',
] as const;

// ---------- heuristics (unchanged) ----------
function computeLikelyDisclosures(args: {
  primaryUse: string;
  extraction: ExtractionPayload | null;
  aiInteraction: 'direct' | 'reviewed' | 'background';
}): string[] {
  const items: string[] = [];
  const primaryLower = (args.primaryUse || '').toLowerCase();
  const features = args.extraction?.ai_features ?? [];
  const riskAreas = args.extraction?.possible_risk_areas ?? [];
  const hasChatbot =
    features.some((f) =>
      ['chatbot', 'agent', 'translation', 'summarization'].includes(f.feature_type),
    ) ||
    /chatbot|agent|assistant|chat/.test(primaryLower) ||
    args.aiInteraction === 'direct';
  if (hasChatbot) items.push('Chatbot / assistant disclosure - a short notice so users know they\u2019re talking to AI');
  const hasContentGen = features.some((f) =>
    ['content_generation', 'image_generation', 'video_generation', 'audio_generation'].includes(
      f.feature_type,
    ),
  );
  if (hasContentGen) items.push('AI-generated content labeling - a clear "made with AI" marker on output');
  if (riskAreas.includes('deepfake') || /deepfake|face swap|voice clon|synthetic media/.test(primaryLower))
    items.push('Deepfake / synthetic-media notice');
  if (riskAreas.includes('emotion_recognition') || /emotion|sentiment from face|affective/.test(primaryLower))
    items.push('Emotion-recognition transparency notice');
  if (riskAreas.includes('biometric_categorization') || /biometric|age estimation|liveness/.test(primaryLower))
    items.push('Biometric-categorization transparency notice');
  items.push('Public AI disclosure page (one clean page linking everything above)');
  items.push('Internal AI usage policy summary (so your team answers buyer questions consistently)');
  return items;
}

function computeRiskFlags(args: {
  band: string;
  riskAreas: string[];
}): Array<{ label: string; tone: 'info' | 'warn' }> {
  const flags: Array<{ label: string; tone: 'info' | 'warn' }> = [];
  if (args.band === 'REVIEW')
    flags.push({
      label: 'A few items in your setup deserve a human review. The pack will include extra notes for your lawyer.',
      tone: 'warn',
    });
  if (args.band === 'SOFT_OUT')
    flags.push({
      label: 'Some aspects look sensitive. We\u2019ll flag those clearly inside the pack so your lawyer knows what to look at first.',
      tone: 'warn',
    });
  if (args.riskAreas.includes('deepfake'))
    flags.push({ label: 'Possible synthetic-media use detected.', tone: 'info' });
  if (args.riskAreas.includes('emotion_recognition'))
    flags.push({ label: 'Emotion recognition mentioned on your site.', tone: 'info' });
  if (args.riskAreas.includes('biometric_categorization'))
    flags.push({ label: 'Biometric categorization mentioned on your site.', tone: 'info' });
  return flags;
}

// ---------- main ----------
export default function AssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('enter');
  const [scanStage, setScanStage] = useState(0);
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [scanResp, setScanResp] = useState<ScanResponse | null>(null);
  const [confirmResp, setConfirmResp] = useState<ConfirmResponse | null>(null);
  const [selectedTier, setSelectedTier] = useState<PaidTier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [primaryUse, setPrimaryUse] = useState('');
  const [b2bOrB2c, setB2bOrB2c] = useState<'B2B' | 'B2C' | 'Both'>('B2B');
  const [hasEu, setHasEu] = useState<'yes' | 'no' | 'unsure'>('yes');
  const [aiInteraction, setAiInteraction] = useState<'direct' | 'reviewed' | 'background'>('direct');
  const [personalData, setPersonalData] = useState<'yes' | 'no' | 'unsure'>('no');
  const [vertical, setVertical] = useState('marketing');

  const stepNumber = useMemo(() => {
    if (step === 'enter' || step === 'scanning') return 1;
    if (step === 'confirm') return 2;
    if (step === 'review') return 3;
    return 4;
  }, [step]);

  async function startScan() {
    setErrorMsg(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email.');
      return;
    }
    setSubmitting(true);
    setScanStage(0);
    setStep('scanning');
    const stageDelays = [400, 2200, 4400, 6600];
    const stageTimers = stageDelays.map((delay, idx) => setTimeout(() => setScanStage(idx), delay));
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `scan_failed_${res.status}`);
      }
      const data = (await res.json()) as ScanResponse;
      setScanResp(data);
      const e = data.extraction;
      setCompanyName(e?.company_name ?? '');
      setProductDesc(e?.product_description ?? '');
      const firstFeature = e?.ai_features?.[0];
      setPrimaryUse(firstFeature ? firstFeature.description || firstFeature.name : '');
      const b = e?.b2b_or_b2c;
      if (b === 'B2B' || b === 'B2C' || b === 'Both') setB2bOrB2c(b);
      if (e?.eu_signals.length) setHasEu('yes');
      setStep('confirm');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`We couldn't scan that page, but you can fill the form manually below. (${msg})`);
      setScanResp(null);
      setStep('confirm');
    } finally {
      stageTimers.forEach((t) => clearTimeout(t));
      setSubmitting(false);
    }
  }

  async function submitConfirm() {
    if (!scanResp?.assessment_id) {
      setErrorMsg('Restarting - please try again.');
      setStep('enter');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: scanResp.assessment_id,
          answers: {
            company_name: companyName,
            product_description: productDesc,
            primary_ai_use_case: primaryUse,
            b2b_or_b2c: b2bOrB2c,
            has_eu_customers: hasEu,
            ai_user_interaction: aiInteraction,
            processes_personal_data: personalData,
            vertical,
          },
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `confirm_failed_${res.status}`);
      }
      const data = (await res.json()) as ConfirmResponse;
      setConfirmResp(data);
      if (data.next_step === 'out_of_scope') setStep('out_of_scope');
      else {
        setSelectedTier(data.recommended_tier ?? 'tier_2');
        setStep('review');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Something went wrong checking fit. ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  function tierToRequestType(t: PaidTier): 'snapshot' | 'disclosure' | 'governance' {
    if (t === 'tier_1') return 'snapshot';
    if (t === 'tier_2') return 'disclosure';
    return 'governance';
  }
  async function startCheckout() {
    if (!selectedTier) return;
    if (selectedTier === 'tier_1') {
      router.push(`/request?type=${tierToRequestType(selectedTier)}`);
      return;
    }
    if (!scanResp?.assessment_id) {
      setErrorMsg('Please restart the free check before checkout.');
      setStep('enter');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: scanResp.assessment_id,
          tier: selectedTier,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        approve_url?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok || !data.approve_url) {
        throw new Error(data.detail ?? data.error ?? `checkout_failed_${res.status}`);
      }
      window.location.assign(data.approve_url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Secure PayPal checkout could not be opened. ${msg}`);
      setSubmitting(false);
    }
  }

  return (
    <SiteChrome>
      <PageHero />
      <main className="mx-auto max-w-[1520px] px-6 pb-28 sm:px-8 lg:px-12 2xl:px-16">
        <StepProgress current={stepNumber} />
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.45fr_0.55fr] lg:items-start">
          <div className="rounded-[38px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-8 shadow-[0_32px_120px_rgba(7,17,31,0.1)] sm:p-12">
            <AnimatePresence mode="wait">
              {step === 'enter' && (
                <Step1Enter
                  key="enter"
                  url={url}
                  email={email}
                  onUrl={setUrl}
                  onEmail={setEmail}
                  onSubmit={startScan}
                  submitting={submitting}
                  error={errorMsg}
                />
              )}
              {step === 'scanning' && <ScanningView key="scanning" stageIndex={scanStage} />}
              {step === 'confirm' && (
                <Step2Confirm
                  key="confirm"
                  extraction={scanResp?.extraction ?? null}
                  companyName={companyName}
                  productDesc={productDesc}
                  primaryUse={primaryUse}
                  b2bOrB2c={b2bOrB2c}
                  hasEu={hasEu}
                  aiInteraction={aiInteraction}
                  personalData={personalData}
                  vertical={vertical}
                  onCompanyName={setCompanyName}
                  onProductDesc={setProductDesc}
                  onPrimaryUse={setPrimaryUse}
                  onB2bOrB2c={setB2bOrB2c}
                  onHasEu={setHasEu}
                  onAiInteraction={setAiInteraction}
                  onPersonalData={setPersonalData}
                  onVertical={setVertical}
                  onSubmit={submitConfirm}
                  submitting={submitting}
                  error={errorMsg}
                />
              )}
              {step === 'review' && confirmResp && (
                <Step3Review
                  key="review"
                  confirm={confirmResp}
                  extraction={scanResp?.extraction ?? null}
                  companyName={companyName}
                  productDesc={productDesc}
                  primaryUse={primaryUse}
                  b2bOrB2c={b2bOrB2c}
                  hasEu={hasEu}
                  aiInteraction={aiInteraction}
                  vertical={vertical}
                  onConfirm={() => {
                    setErrorMsg(null);
                    setStep('result');
                  }}
                  onEditAnswers={() => {
                    setErrorMsg(null);
                    setStep('confirm');
                  }}
                  onSwitchToManual={() => {
                    setErrorMsg(null);
                    if (scanResp) setScanResp({ ...scanResp, extraction: null });
                    setStep('confirm');
                  }}
                />
              )}
              {step === 'result' && confirmResp && (
                <Step4Result
                  key="result"
                  confirm={confirmResp}
                  selectedTier={selectedTier ?? confirmResp.recommended_tier ?? 'tier_2'}
                  onSelectTier={setSelectedTier}
                  onCheckout={startCheckout}
                  submitting={submitting}
                  error={errorMsg}
                />
              )}
              {step === 'out_of_scope' && confirmResp && (
                <OutOfScopeView key="oos" message={confirmResp.user_message} />
              )}
            </AnimatePresence>
          </div>
          <SideInfoCard stepNumber={stepNumber} />
        </div>
      </main>
    </SiteChrome>
  );
}

// ---------- hero / progress / side info ----------
function PageHero() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="relative overflow-hidden border-b border-[var(--tf-border)]/80 bg-[var(--tf-bg-soft)]/60 px-6 pb-16 pt-20 sm:px-8 sm:pt-24 lg:px-12 lg:pb-24 lg:pt-32 2xl:px-16">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--tf-accent-soft)]/70 blur-3xl" />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[1520px]"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,124,138,0.2)] bg-[var(--tf-accent-soft)] px-4 py-1.5">
          <MonoLabel>Free eligibility check</MonoLabel>
        </span>
        <h1 className="mt-7 max-w-5xl text-balance text-[clamp(3rem,5.2vw,6rem)] font-semibold leading-[0.98] tracking-[-0.06em]">
          See whether TrustFolder fits your AI product
          <span className="text-[var(--tf-accent)]"> — in two minutes</span>.
        </h1>
        <p className="mt-7 max-w-4xl text-pretty text-xl leading-9 text-[var(--tf-slate)]">
          Scan your AI product website, confirm a few details, and see whether we can prepare a
          buyer-ready evidence folder for your team. Each request is reviewed by a founder.
        </p>
      </motion.div>
    </section>
  );
}

function StepProgress({ current }: { current: number }) {
  return (
    <ol className="mt-14 flex flex-wrap items-center gap-3 sm:gap-5">
      {PROGRESS_STEPS.map(({ num, label }, idx) => {
        const isActive = num === current;
        const isComplete = num < current;
        return (
          <li key={num} className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border font-mono text-[13px] font-semibold tracking-[0.04em] transition ${
                isActive
                  ? 'border-[var(--tf-ink)] bg-[var(--tf-ink)] text-[var(--tf-on-light)] shadow-[0_10px_30px_rgba(7,17,31,0.18)]'
                  : isComplete
                    ? 'border-[var(--tf-accent)] bg-[var(--tf-accent-soft)] text-[var(--tf-accent)]'
                    : 'border-[var(--tf-border-strong)] bg-[var(--tf-surface)] text-[var(--tf-slate-soft)]'
              }`}
            >
              {isComplete ? '\u2713' : `0${num}`}
            </div>
            <span
              className={`text-base font-medium ${
                isActive
                  ? 'text-[var(--tf-ink)]'
                  : isComplete
                    ? 'text-[var(--tf-ink-soft)]'
                    : 'text-[var(--tf-slate-soft)]'
              }`}
            >
              {label}
            </span>
            {idx < PROGRESS_STEPS.length - 1 && (
              <span className="hidden h-px w-10 bg-[var(--tf-border)] sm:inline-block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SideInfoCard({ stepNumber }: { stepNumber: number }) {
  const trustNotes: { icon: React.ReactNode; label: React.ReactNode }[] = [
    { icon: '\u2713', label: 'No payment required' },
    { icon: '\u23F1', label: 'Takes about 2 minutes' },
    { icon: '\u00A7', label: 'Not legal advice' },
    { icon: '\u2197', label: 'High-risk areas route to expert review' },
  ];
  const stepNotes: Record<number, { title: string; body: string }> = {
    1: {
      title: "What we'll do next",
      body: 'We scan your homepage and pricing page, extract AI signals, and prepare a short set of questions. About 10–15 seconds.',
    },
    2: {
      title: 'Confirm a few details',
      body: 'Edit anything we got wrong. The pack we prepare will use these answers — accuracy matters more than speed here.',
    },
    3: {
      title: 'Your fit summary',
      body: "Here's what your pack will contain. You can still edit answers, switch to manual entry, or continue.",
    },
    4: {
      title: 'Request your pack',
      body: 'No charge here. We review your website and reply with next steps within 1 business day.',
    },
  };
  const note = stepNotes[stepNumber];
  return (
    <aside className="space-y-5">
      <TFSideInfoCard
        eyebrow={`Step ${stepNumber} \u00B7 What's happening`}
        title={note.title}
        body={note.body}
        notes={trustNotes}
        tertiary={{ href: '/safety', label: 'Read scope policy' }}
      />
      <p className="px-1 text-sm leading-7 text-[var(--tf-slate-soft)]">
        AI-generated drafts for review. Not legal advice. Not certification. Not a compliance
        guarantee.
      </p>
    </aside>
  );
}

// ---------- step 1 ----------
function Step1Enter(props: {
  url: string;
  email: string;
  onUrl: (v: string) => void;
  onEmail: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <StepFrame>
      <StepEyebrow>Step 1 · Website</StepEyebrow>
      <StepTitle>Start with your AI product URL.</StepTitle>
      <StepLede>
        We scan your homepage and pricing page to pre-fill what we can. Email is required so we can
        send you the result.
      </StepLede>
      <div className="mt-10 space-y-6">
        <Field label="Your product URL" hint="Optional. Skip if you'd prefer to fill the form manually.">
          <input
            type="text"
            value={props.url}
            onChange={(e) => props.onUrl(e.target.value)}
            placeholder="example.com"
            className="h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
          />
        </Field>
        <Field label="Work email" hint="Where should we send your assessment result?">
          <input
            type="email"
            value={props.email}
            onChange={(e) => props.onEmail(e.target.value)}
            placeholder="founder@company.com"
            required
            className="h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
          />
        </Field>
      </div>
      {props.error && <ErrorBanner message={props.error} />}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={props.onSubmit}
          disabled={props.submitting || !props.email}
          className="inline-flex h-14 items-center justify-center rounded-full bg-[var(--tf-ink)] px-8 text-base font-medium text-[var(--tf-on-light)] shadow-[0_18px_60px_rgba(7,17,31,0.2)] transition hover:bg-[var(--tf-ink-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {props.submitting ? 'Working...' : 'Start free check'}
        </button>
        <p className="text-sm text-[var(--tf-slate-soft)]">Nothing is charged. No account is created.</p>
      </div>
    </StepFrame>
  );
}

// ---------- scanning ----------
function ScanningView({ stageIndex }: { stageIndex: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <StepFrame>
      <StepEyebrow>Step 1 · Scanning</StepEyebrow>
      <StepTitle>Reading your website…</StepTitle>
      <StepLede>This usually takes 10-15 seconds.</StepLede>
      <ol className="mt-10 space-y-4">
        {SCAN_STAGES.map((stage, i) => {
          const isActive = i === stageIndex;
          const isComplete = i < stageIndex;
          return (
            <li
              key={stage}
              className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition ${
                isActive
                  ? 'border-[var(--tf-accent)] bg-[var(--tf-accent-soft)]/40'
                  : isComplete
                    ? 'border-[var(--tf-border)] bg-[var(--tf-surface)]'
                    : 'border-[var(--tf-border)] bg-[var(--tf-bg-soft)] opacity-60'
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)]">
                {isComplete ? (
                  <span className="text-[var(--tf-accent)]">✓</span>
                ) : isActive ? (
                  <motion.span
                    animate={reduceMotion ? {} : { rotate: 360 }}
                    transition={{ duration: 1.6, repeat: reduceMotion ? 0 : Infinity, ease: 'linear' }}
                    className="inline-block h-3 w-3 rounded-full border-2 border-[var(--tf-accent)] border-t-transparent"
                  />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[var(--tf-border-strong)]" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive
                    ? 'text-[var(--tf-ink)]'
                    : isComplete
                      ? 'text-[var(--tf-ink-soft)]'
                      : 'text-[var(--tf-slate)]'
                }`}
              >
                {stage}
                {isActive && <span className="ml-1 text-[var(--tf-accent)]">…</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </StepFrame>
  );
}

// ---------- step 2 ----------
function Step2Confirm(props: {
  extraction: ExtractionPayload | null;
  companyName: string;
  productDesc: string;
  primaryUse: string;
  b2bOrB2c: 'B2B' | 'B2C' | 'Both';
  hasEu: 'yes' | 'no' | 'unsure';
  aiInteraction: 'direct' | 'reviewed' | 'background';
  personalData: 'yes' | 'no' | 'unsure';
  vertical: string;
  onCompanyName: (v: string) => void;
  onProductDesc: (v: string) => void;
  onPrimaryUse: (v: string) => void;
  onB2bOrB2c: (v: 'B2B' | 'B2C' | 'Both') => void;
  onHasEu: (v: 'yes' | 'no' | 'unsure') => void;
  onAiInteraction: (v: 'direct' | 'reviewed' | 'background') => void;
  onPersonalData: (v: 'yes' | 'no' | 'unsure') => void;
  onVertical: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const e = props.extraction;
  const detectedFeatures =
    e?.ai_features?.map((f) => f.name).join(', ') || "(we couldn't detect any from your site)";
  const usedScan = !!(e && !e.used_fallback_minimal);
  return (
    <StepFrame>
      <StepEyebrow>Step 2 · Confirm</StepEyebrow>
      <StepTitle>Confirm a few details about your AI product.</StepTitle>
      <StepLede>
        {usedScan
          ? `Here's what we picked up from ${props.companyName || 'your site'}. Edit anything that's off.`
          : 'Tell us a bit about your product so we can prepare the right pack.'}
      </StepLede>
      {usedScan && (
        <div className="mt-6 rounded-2xl border border-[var(--tf-accent)]/25 bg-[var(--tf-accent-soft)] px-5 py-4 text-sm text-[var(--tf-accent)]">
          <p className="font-medium">We detected: {detectedFeatures}</p>
        </div>
      )}
      <div className="mt-10 space-y-6">
        <QuestionCard title="Company basics">
          <Field label="Company name">
            <input
              type="text"
              value={props.companyName}
              onChange={(e) => props.onCompanyName(e.target.value)}
              className="h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
            />
          </Field>
          <Field label="What does your product do?">
            <textarea
              value={props.productDesc}
              onChange={(e) => props.onProductDesc(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-5 py-4 text-base leading-7 outline-none transition focus:border-[var(--tf-accent)]"
            />
          </Field>
        </QuestionCard>
        <QuestionCard title="AI use">
          <Field label="What's your main AI feature?" hint="In one sentence, what does the AI actually do?">
            <input
              type="text"
              value={props.primaryUse}
              onChange={(e) => props.onPrimaryUse(e.target.value)}
              placeholder="e.g. Summarises customer support emails."
              className="h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
            />
          </Field>
        </QuestionCard>
        <QuestionCard title="Market and geography">
          <OptionPills
            label="Who do you sell to?"
            value={props.b2bOrB2c}
            onChange={props.onB2bOrB2c}
            options={[
              { v: 'B2B', label: 'Businesses (B2B)' },
              { v: 'B2C', label: 'Consumers (B2C)' },
              { v: 'Both', label: 'Both' },
            ]}
          />
          <OptionPills
            label="Do you have customers in the EU?"
            value={props.hasEu}
            onChange={props.onHasEu}
            options={[
              { v: 'yes', label: 'Yes' },
              { v: 'no', label: 'No' },
              { v: 'unsure', label: 'Not sure' },
            ]}
          />
          <Field label="Which best describes your vertical?">
            <select
              value={props.vertical}
              onChange={(e) => props.onVertical(e.target.value)}
              className="h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
            >
              {VERTICAL_OPTIONS.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </QuestionCard>
        <QuestionCard title="User exposure">
          <OptionPills
            label="How do users meet the AI output?"
            value={props.aiInteraction}
            onChange={props.onAiInteraction}
            options={[
              { v: 'direct', label: 'Users see / interact with AI output directly' },
              { v: 'reviewed', label: 'A human reviews AI output before users see it' },
              { v: 'background', label: 'AI runs in the background, no direct exposure' },
            ]}
          />
        </QuestionCard>
        <QuestionCard title="Personal data">
          <OptionPills
            label="Does your product process personal data?"
            value={props.personalData}
            onChange={props.onPersonalData}
            options={[
              { v: 'yes', label: 'Yes' },
              { v: 'no', label: 'No' },
              { v: 'unsure', label: 'Not sure' },
            ]}
          />
        </QuestionCard>
      </div>
      {props.error && <ErrorBanner message={props.error} />}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={props.onSubmit}
          disabled={props.submitting || !props.companyName || !props.primaryUse}
          className="inline-flex h-14 items-center justify-center rounded-full bg-[var(--tf-ink)] px-8 text-base font-medium text-[var(--tf-on-light)] shadow-[0_18px_60px_rgba(7,17,31,0.2)] transition hover:bg-[var(--tf-ink-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {props.submitting ? 'Checking fit...' : 'Continue to review \u2192'}
        </button>
        <p className="text-sm text-[var(--tf-slate-soft)]">We’ll show you a summary on the next screen.</p>
      </div>
    </StepFrame>
  );
}

// ---------- step 3 review ----------
function Step3Review(props: {
  confirm: ConfirmResponse;
  extraction: ExtractionPayload | null;
  companyName: string;
  productDesc: string;
  primaryUse: string;
  b2bOrB2c: 'B2B' | 'B2C' | 'Both';
  hasEu: 'yes' | 'no' | 'unsure';
  aiInteraction: 'direct' | 'reviewed' | 'background';
  vertical: string;
  onConfirm: () => void;
  onEditAnswers: () => void;
  onSwitchToManual: () => void;
}) {
  const tier = props.confirm.recommended_tier ?? 'tier_2';
  const tierOpt = TIER_OPTIONS[tier];
  const disclosures = computeLikelyDisclosures({
    primaryUse: props.primaryUse,
    extraction: props.extraction,
    aiInteraction: props.aiInteraction,
  });
  const riskFlags = computeRiskFlags({
    band: props.confirm.band,
    riskAreas: props.extraction?.possible_risk_areas ?? [],
  });
  const aiFeatureLabel =
    (props.extraction?.ai_features?.[0]?.name ?? '').trim() ||
    (props.primaryUse || '').trim() ||
    'AI feature you described';
  const audienceLabel =
    props.b2bOrB2c === 'B2B'
      ? 'Businesses (B2B)'
      : props.b2bOrB2c === 'B2C'
        ? 'Consumers (B2C)'
        : 'Businesses and consumers (B2B + B2C)';
  const euLabel =
    props.hasEu === 'yes'
      ? 'Yes'
      : props.hasEu === 'no'
        ? 'No'
        : "Not sure - we'll treat this as yes to be safe";
  const interactionLabel =
    props.aiInteraction === 'direct'
      ? 'Users interact with the AI directly'
      : props.aiInteraction === 'reviewed'
        ? 'AI output is reviewed by a human before users see it'
        : "AI runs in the background (users don't see it directly)";
  const verticalLabel = VERTICAL_OPTIONS.find((v) => v.v === props.vertical)?.label ?? props.vertical;
  const wasScanUsed = !!(props.extraction && !props.extraction.used_fallback_minimal);
  return (
    <StepFrame>
      <StepEyebrow>Step 3 · Review</StepEyebrow>
      <StepTitle>Here’s what your pack will be built from.</StepTitle>
      <StepLede>
        Take a moment to check the summary. You can still edit answers, switch to manual entry, or
        continue to the next step.
      </StepLede>
      <ConfidenceBadge band={props.confirm.band} />
      {props.confirm.readiness && (
        <div className="mt-8">
          <ReadinessScoreCard score={props.confirm.readiness} />
        </div>
      )}
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ReviewCard title="Your details">
          <ReviewRow label="Company" value={props.companyName || '\u2014'} />
          <ReviewRow label="Product" value={props.productDesc || '\u2014'} multiline />
          <ReviewRow label="AI feature" value={aiFeatureLabel} />
          <ReviewRow label="Target users" value={audienceLabel} />
          <ReviewRow label="EU customers" value={euLabel} />
          <ReviewRow label="User interaction" value={interactionLabel} />
          <ReviewRow label="Vertical" value={verticalLabel} />
        </ReviewCard>
        <ReviewCard title="Likely disclosure needs">
          <ul className="space-y-3 text-base leading-7 text-[var(--tf-ink-soft)]">
            {disclosures.map((d) => (
              <li key={d} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-[var(--tf-slate-soft)]">
            Final list is calibrated when we generate the pack.
          </p>
        </ReviewCard>
      </div>
      {riskFlags.length > 0 && (
        <ReviewCard title="Heads-up before you continue" className="mt-6">
          <ul className="space-y-3 text-base leading-7">
            {riskFlags.map((f) => (
              <li
                key={f.label}
                className={
                  f.tone === 'warn'
                    ? 'rounded-xl border border-[#cdb47a]/40 bg-[var(--tf-warning-soft)] px-4 py-3 text-[#7a4a00]'
                    : 'flex gap-3 text-[var(--tf-ink-soft)]'
                }
              >
                {f.tone === 'warn' ? (
                  <span>⚠ {f.label}</span>
                ) : (
                  <>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-slate-soft)]" />
                    <span>{f.label}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </ReviewCard>
      )}
      <ReviewCard title="Recommended for you" className="mt-5" highlight>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">{tierOpt.name}</p>
          <p className="text-2xl font-semibold text-[var(--tf-ink)]">{tierOpt.price}</p>
        </div>
        <p className="mt-3 text-base leading-7 text-[var(--tf-slate)]">{tierOpt.tagline}</p>
        <ul className="mt-5 space-y-3 text-base leading-7 text-[var(--tf-ink-soft)]">
          {tierOpt.bullets.map((b) => (
            <li key={b} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-[var(--tf-slate-soft)]">
          You’ll see all package options on the next screen. Supported paid packs use secure PayPal checkout after fit is confirmed.
        </p>
      </ReviewCard>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={props.onConfirm}
          className="inline-flex h-14 items-center justify-center rounded-full bg-[var(--tf-ink)] px-8 text-base font-medium text-[var(--tf-on-light)] shadow-[0_18px_60px_rgba(7,17,31,0.2)] transition hover:bg-[var(--tf-ink-soft)]"
        >
          See packages →
        </button>
        <button
          onClick={props.onEditAnswers}
          type="button"
          className="inline-flex h-14 items-center justify-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-7 text-base font-medium text-[var(--tf-ink)] transition hover:bg-[var(--tf-accent-soft)]"
        >
          Edit answers
        </button>
        {wasScanUsed && (
          <button
            onClick={props.onSwitchToManual}
            type="button"
            className="inline-flex h-14 items-center justify-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-7 text-base font-medium text-[var(--tf-slate)] transition hover:text-[var(--tf-ink)]"
          >
            Scan looks wrong - fill in manually
          </button>
        )}
      </div>
      <p className="mt-7 text-sm leading-7 text-[var(--tf-slate-soft)]">
        No payment is taken on this review screen. Supported paid packs go to secure PayPal
        checkout next; snapshot requests stay founder-reviewed.
      </p>
    </StepFrame>
  );
}

// ---------- step 4 result ----------
function Step4Result(props: {
  confirm: ConfirmResponse;
  selectedTier: PaidTier;
  onSelectTier: (t: PaidTier) => void;
  onCheckout: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const recommended = props.confirm.recommended_tier ?? 'tier_2';
  const orderedTiers: PaidTier[] = ['tier_1', 'tier_2', 'tier_3'];
  const selectedUsesCheckout = props.selectedTier === 'tier_2' || props.selectedTier === 'tier_3';
  return (
    <StepFrame>
      <StepEyebrow>Step 4 · Next step</StepEyebrow>
      <StepTitle>Choose the pack that fits your buyer-review moment.</StepTitle>
      <StepLede>{props.confirm.user_message}</StepLede>
      <div className="mt-10 grid gap-5">
        {orderedTiers.map((id, idx) => {
          const opt = TIER_OPTIONS[id];
          const isSelected = props.selectedTier === id;
          const isRecommended = recommended === id;
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => props.onSelectTier(id)}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-[30px] border bg-[var(--tf-surface)] p-8 text-left transition ${
                isSelected
                  ? 'border-[var(--tf-ink)] shadow-[0_28px_90px_rgba(7,17,31,0.1)] ring-2 ring-[var(--tf-ink)]/10'
                  : 'border-[var(--tf-border)] hover:border-[var(--tf-border-strong)] hover:shadow-[0_20px_60px_rgba(7,17,31,0.08)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <MonoNumeral>{`0${idx + 1}`}</MonoNumeral>
                {isRecommended && (
                  <span className="rounded-full bg-[var(--tf-accent-soft)] px-4 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tf-accent)]">
                    Recommended
                  </span>
                )}
              </div>
              <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">
                  {opt.name}
                </h3>
                <p className="text-2xl font-semibold text-[var(--tf-ink)]">{opt.price}</p>
              </div>
              <p className="mt-3 text-base leading-7 text-[var(--tf-slate)]">{opt.tagline}</p>
              <ul className="mt-5 space-y-3 text-base leading-7 text-[var(--tf-ink-soft)]">
                {opt.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.button>
          );
        })}
      </div>
      {props.confirm.band === 'REVIEW' && (
        <p className="mt-6 rounded-2xl border border-[#cdb47a]/40 bg-[var(--tf-warning-soft)] px-6 py-5 text-base leading-7 text-[#7a4a00]">
          Heads up: some parts of your AI use look sensitive. The pack will include extra notes for
          your lawyer.
        </p>
      )}
      <p className="mt-6 rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-soft)] px-6 py-5 text-base leading-7 text-[var(--tf-ink-soft)]">
        The snapshot is request-only. Disclosure Pack and Governance Folder use secure PayPal
        checkout, and generation starts only after payment is confirmed.
      </p>
      {props.error && <ErrorBanner message={props.error} />}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={props.onCheckout}
          disabled={props.submitting}
          className="inline-flex h-14 items-center justify-center rounded-full bg-[var(--tf-ink)] px-8 text-base font-medium text-[var(--tf-on-light)] shadow-[0_18px_60px_rgba(7,17,31,0.2)] transition hover:bg-[var(--tf-ink-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {props.submitting
            ? selectedUsesCheckout
              ? 'Opening secure PayPal checkout...'
              : 'Opening request...'
            : selectedUsesCheckout
              ? 'Start secure PayPal checkout →'
              : 'Request snapshot →'}
        </button>
        <p className="text-sm text-[var(--tf-slate-soft)]">
          {selectedUsesCheckout
            ? 'Payment confirmed before your evidence folder is prepared.'
            : 'Request-only until snapshot generation is implemented.'}
        </p>
      </div>
    </StepFrame>
  );
}

// ---------- out of scope ----------
function OutOfScopeView({ message }: { message: string }) {
  return (
    <StepFrame>
      <StepEyebrow>Expert review</StepEyebrow>
      <StepTitle>This looks like an expert-review case.</StepTitle>
      <StepLede>
        Some of your answers point at areas where a generic governance pack isn’t the right
        fit. We don’t auto-generate packs for these — they need an expert with domain context.
      </StepLede>
      <div className="mt-8 rounded-2xl border border-[var(--tf-border)] bg-[var(--tf-bg-soft)] p-6 text-sm leading-7 text-[var(--tf-ink-soft)]">
        <p>{message}</p>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/contact"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--tf-ink)] px-6 text-sm font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)]"
        >
          Request expert review
        </Link>
        <Link
          href="/safety"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-5 text-sm font-medium text-[var(--tf-ink)] transition hover:bg-[var(--tf-accent-soft)]"
        >
          Read our scope policy
        </Link>
      </div>
      <p className="mt-6 text-xs leading-6 text-[var(--tf-slate-soft)]">
        Nothing was charged. If you think this was a mistake, reply to the confirmation email
        we’ll send shortly and we’ll take another look.
      </p>
    </StepFrame>
  );
}

// ---------- primitives ----------
function StepFrame({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
      exit={reduceMotion ? {} : { opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
function StepEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[var(--tf-accent)]">{children}</p>;
}
function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-5xl">
      {children}
    </h2>
  );
}
function StepLede({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--tf-slate)]">{children}</p>;
}
function QuestionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[var(--tf-border)] bg-[var(--tf-bg-soft)] p-6 sm:p-8">
      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate)]">{title}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-base font-medium text-[var(--tf-ink)]">{label}</span>
      {hint && <span className="mt-1.5 block text-sm text-[var(--tf-slate-soft)]">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
function OptionPills<T extends string>(props: {
  label: string;
  value: T;
  options: Array<{ v: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-base font-medium text-[var(--tf-ink)]">{props.label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {props.options.map((o) => {
          const isActive = props.value === o.v;
          return (
            <button
              type="button"
              key={o.v}
              onClick={() => props.onChange(o.v)}
              className={`inline-flex items-center rounded-full border px-5 py-2.5 text-base transition ${
                isActive
                  ? 'border-[var(--tf-ink)] bg-[var(--tf-ink)] text-[var(--tf-on-light)]'
                  : 'border-[var(--tf-border-strong)] bg-[var(--tf-surface)] text-[var(--tf-ink-soft)] hover:bg-[var(--tf-accent-soft)]'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
function ReviewCard({
  title,
  children,
  className = '',
  highlight = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[28px] border p-6 sm:p-8 ${
        highlight
          ? 'border-[var(--tf-ink)]/20 bg-[var(--tf-document)] shadow-[0_24px_80px_rgba(7,17,31,0.08)]'
          : 'border-[var(--tf-border)] bg-[var(--tf-surface)]'
      } ${className}`}
    >
      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate)]">{title}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}
function ReviewRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="grid grid-cols-[9.5rem_1fr] items-baseline gap-4 py-2 text-base">
      <span className="text-[var(--tf-slate)]">{label}</span>
      <span
        className={`text-[var(--tf-ink-soft)] ${multiline ? 'whitespace-pre-wrap leading-relaxed' : 'truncate'}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
function ConfidenceBadge({ band }: { band: string }) {
  const tone: 'fit' | 'review' | 'expert' =
    band === 'CLEAR' ? 'fit' : band === 'REVIEW' || band === 'SOFT_OUT' ? 'review' : 'expert';
  const label =
    band === 'CLEAR'
      ? 'Likely fit'
      : band === 'REVIEW'
        ? 'Some review needed'
        : band === 'SOFT_OUT'
          ? 'Sensitive areas — extra care'
          : band;
  return (
    <div className="mt-6">
      <TFConfidenceBadge tone={tone} label={label} />
    </div>
  );
}
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-[#f0c0c0] bg-[#fdf3f3] px-4 py-3 text-sm text-[#7a1f1f]">
      {message}
    </div>
  );
}
