'use client';

/**
 * Shared marketing primitives.
 *
 * Tiny visual building blocks used by the homepage and every secondary
 * marketing page (`/pricing`, `/examples`, `/safety`, `/agencies`, `/contact`).
 * Centralised here so the visual quality bar from `docs/14-DESIGN.md` stays
 * consistent across pages without each page reimplementing buttons and
 * scroll-reveal sections.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-14 items-center justify-center rounded-full bg-[var(--tf-ink)] px-8 text-base font-medium text-[var(--tf-on-light)] shadow-[0_18px_60px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:bg-[var(--tf-ink-soft)]"
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-14 items-center justify-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-8 text-base font-medium text-[var(--tf-ink)] transition hover:-translate-y-0.5 hover:border-[var(--tf-ink-soft)]/40 hover:bg-[var(--tf-paper)]"
    >
      {children}
    </Link>
  );
}

export function Reveal({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      id={id}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-[1520px] px-6 pt-20 sm:px-8 lg:px-12 lg:pt-28 2xl:px-16">
      <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[var(--tf-accent)]">{eyebrow}</p>
      <h1 className="mt-6 max-w-5xl text-balance text-5xl font-semibold leading-[1] tracking-[-0.06em] sm:text-7xl">
        {title}
      </h1>
      {lede && (
        <p className="mt-7 max-w-4xl text-pretty text-xl leading-9 text-[var(--tf-slate)]">
          {lede}
        </p>
      )}
    </Reveal>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-[1520px] px-6 py-20 sm:px-8 lg:px-12 lg:py-24 2xl:px-16">
      {(eyebrow || title) && (
        <Reveal className="mb-12 max-w-5xl">
          {eyebrow && (
            <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[var(--tf-accent)]">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
              {title}
            </h2>
          )}
        </Reveal>
      )}
      {children}
    </section>
  );
}

export function ScopeNote({ className = '' }: { className?: string }) {
  return (
    <p className={`text-sm leading-7 text-[var(--tf-slate-soft)] ${className}`}>
      AI-generated drafts for review. Not legal advice. Not certification. Not a compliance
      guarantee.
    </p>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-8 shadow-[0_26px_90px_rgba(0,0,0,0.35)] sm:p-9 ${className}`}
    >
      {children}
    </div>
  );
}

export function FinalCta({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="px-6 py-20 sm:px-8 lg:px-12 lg:py-28 2xl:px-16">
      <Reveal className="mx-auto max-w-[1520px] rounded-[44px] border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] p-10 text-center shadow-[0_34px_140px_rgba(0,0,0,0.45)] sm:p-16 lg:p-24">
        <h2 className="mx-auto max-w-5xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
          {title}
        </h2>
        <p className="mx-auto mt-7 max-w-3xl text-xl leading-9 text-[var(--tf-slate)]">{body}</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <PrimaryLink href={primary.href}>{primary.label}</PrimaryLink>
          {secondary && <SecondaryLink href={secondary.href}>{secondary.label}</SecondaryLink>}
        </div>
      </Reveal>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Phase 3.8 — premium visual primitives. See docs/DESIGN.md §8.              */
/* -------------------------------------------------------------------------- */

/** Monospace eyebrow / micro-label.  Renders as caps + tracking. */
export function MonoLabel({
  children,
  tone = 'accent',
  className = '',
}: {
  children: ReactNode;
  tone?: 'accent' | 'slate' | 'soft' | 'invert';
  className?: string;
}) {
  const toneClass =
    tone === 'accent'
      ? 'text-[var(--tf-accent)]'
      : tone === 'slate'
        ? 'text-[var(--tf-slate)]'
        : tone === 'invert'
          ? 'text-[#a9dce2]'
          : 'text-[var(--tf-slate-soft)]';
  return (
    <span
      className={`font-mono text-[12px] uppercase leading-5 tracking-[0.18em] ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}

/** Warm-cream surface card. Use for anything that should read as a document. */
export function DocumentCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[30px] border border-[var(--tf-border)] bg-[var(--tf-document)] p-8 shadow-[0_26px_90px_rgba(0,0,0,0.35)] sm:p-9 ${className}`}
    >
      {children}
    </div>
  );
}

/** Dark ink card. Featured pack, agencies hero, final CTA option. */
export function DarkCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[34px] border border-[var(--tf-border-strong)] bg-[var(--tf-paper)] p-9 text-[var(--tf-ink)] shadow-[0_34px_140px_rgba(0,0,0,0.5)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Glass / blurred card. Sticky side info, in-flow micro-cards over hero. */
export function GlassCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[30px] border border-[var(--tf-border-strong)] bg-[var(--tf-surface)]/85 p-8 shadow-[0_22px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

/** Trust-note row: small icon + caption.  Used in side info cards. */
export function TrustNote({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 text-base leading-7 text-[var(--tf-slate)]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-paper)] text-[12px] text-[var(--tf-accent)]">
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

/** Confidence band pill. Three tones — see DESIGN.md §8.9. */
export function ConfidenceBadge({
  tone,
  label,
}: {
  tone: 'fit' | 'review' | 'expert';
  label: string;
}) {
  const map = {
    fit: {
      bg: 'bg-[var(--tf-success-soft)]',
      text: 'text-[#0f6b3a]',
      dot: 'bg-[#0f6b3a]',
    },
    review: {
      bg: 'bg-[var(--tf-warning-soft)]',
      text: 'text-[#7a4a00]',
      dot: 'bg-[#7a4a00]',
    },
    expert: {
      bg: 'bg-[var(--tf-paper)]',
      text: 'text-[var(--tf-ink-soft)]',
      dot: 'bg-[var(--tf-slate)]',
    },
  } as const;
  const cls = map[tone];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full ${cls.bg} ${cls.text} px-3.5 py-1.5 text-sm font-medium`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cls.dot}`} />
      {label}
    </span>
  );
}

/** Mono numeral, e.g. 01 / 02 / 03 — used in process rails. */
export function MonoNumeral({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
      {children}
    </span>
  );
}

/** Eyebrow heading row used above section H2s outside the Section helper. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">{children}</p>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero-grade evidence scene — three-layer cinematic visual.                  */
/*                                                                            */
/* Used on the homepage hero, optionally on /agencies and /examples to keep   */
/* the document-first signature consistent. See DESIGN.md §3 (chosen          */
/* direction) and §8.4 (document/folder visual language).                     */
/* -------------------------------------------------------------------------- */

export function EvidenceScene() {
  const reduceMotion = useReducedMotion();

  const rows = [
    { label: 'Website URL', value: 'acme.ai', detail: 'Public claims scanned', delay: 0 },
    { label: 'AI scan', value: '4 signals', detail: 'Disclosure areas found', delay: 0.3 },
    { label: 'Review summary', value: 'Fit likely', detail: 'Founder confirms details', delay: 0.6 },
    { label: 'Evidence folder', value: '8 docs', detail: 'Prepared for review', delay: 0.9 },
  ];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.97 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-[680px] lg:min-h-[760px]"
    >
      {/* Background paper sheet — Layer 02 disclosure draft */}
      <div className="absolute -right-3 top-24 hidden w-[430px] rotate-[4deg] rounded-[32px] border border-[var(--tf-border-strong)] bg-[var(--tf-paper)] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:block">
        <MonoLabel tone="soft">Layer · 02</MonoLabel>
        <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">
          Disclosure draft
        </p>
        <div className="mt-7 space-y-3">
          <div className="h-2.5 w-4/5 rounded-full bg-[var(--tf-accent)]/40" />
          <div className="h-2.5 w-full rounded-full bg-[var(--tf-border-strong)]" />
          <div className="h-2.5 w-3/5 rounded-full bg-[var(--tf-border-strong)]" />
          <div className="h-2.5 w-[88%] rounded-full bg-[var(--tf-border-strong)]" />
          <div className="h-2 w-[55%] rounded-full bg-[var(--tf-border-strong)]" />
        </div>
      </div>

      {/* Main glass-panel TrustFolder pipeline card */}
      <div className="relative z-[1] mx-auto w-full max-w-[680px] rounded-[44px] border border-[var(--tf-border-strong)] bg-[var(--tf-paper)] p-6 shadow-[0_46px_160px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="rounded-[34px] border border-white/5 bg-[var(--tf-surface)] p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <MonoLabel tone="invert">TrustFolder pipeline</MonoLabel>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                Website scan → evidence folder
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#a9dce2]/15 px-3.5 py-1.5 text-sm font-medium text-[#a9dce2]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a9dce2]" />
              Explainer
            </span>
          </div>
          <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/12">
            <motion.div
              className="h-full rounded-full bg-[var(--tf-accent)]"
              initial={reduceMotion ? { width: '100%' } : { width: '15%' }}
              animate={
                reduceMotion
                  ? { width: '100%' }
                  : { width: ['15%', '45%', '75%', '100%', '15%'] }
              }
              transition={{ duration: 6, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div className="mt-7 space-y-3">
            {rows.map((row) => (
              <motion.div
                key={row.label}
                animate={reduceMotion ? {} : { y: [0, -3, 0] }}
                transition={{
                  duration: 4.5,
                  delay: row.delay,
                  repeat: reduceMotion ? 0 : Infinity,
                  ease: 'easeInOut',
                }}
                className="flex items-center justify-between gap-5 rounded-[24px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.18)]"
              >
                <div>
                  <MonoLabel tone="invert">{row.label}</MonoLabel>
                  <p className="mt-1.5 text-xl font-semibold tracking-[-0.04em] text-white">{row.value}</p>
                </div>
                <p className="max-w-[190px] text-right text-sm leading-6 text-white/64">
                  {row.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Foreground floating buyer-handoff card */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 30, rotate: -3 }}
        animate={reduceMotion ? { opacity: 1, rotate: -3 } : { opacity: 1, y: 0, rotate: -3 }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -left-4 bottom-0 z-[2] hidden w-[300px] rounded-[30px] border border-[var(--tf-border-strong)] bg-[var(--tf-document)] p-7 text-[var(--tf-ink)] shadow-[0_30px_110px_rgba(0,0,0,0.55)] sm:block"
      >
        <MonoLabel>Buyer handoff</MonoLabel>
        <p className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em]">
          Lawyer-ready cover sheet
        </p>
        <p className="mt-4 text-sm leading-6 text-[var(--tf-slate)]">
          One page summarising scope, disclosures, and the open review questions.
        </p>
        <div className="mt-4 flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#a9dce2]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#a9dce2]/50" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#a9dce2]/25" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Process rail card — used in /how-it-works and /agencies workflow.          */
/* -------------------------------------------------------------------------- */

export function ProcessRailCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <DocumentCard className="group transition hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <MonoNumeral>{step}</MonoNumeral>
        <span className="h-2 w-2 rounded-full bg-[var(--tf-accent)]" />
      </div>
      <h3 className="mt-12 text-xl font-semibold tracking-[-0.035em]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--tf-slate)]">{body}</p>
      <div className="mt-8 h-1 overflow-hidden rounded-full bg-[var(--tf-border)]">
        <div className="h-full w-1/3 rounded-full bg-[var(--tf-accent)] transition-all duration-500 group-hover:w-full" />
      </div>
    </DocumentCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Side info card — sticky on lg, carries trust notes + tertiary link.        */
/* -------------------------------------------------------------------------- */

export function SideInfoCard({
  eyebrow,
  title,
  body,
  notes,
  tertiary,
}: {
  eyebrow: string;
  title: string;
  body: string;
  notes: { icon: ReactNode; label: ReactNode }[];
  tertiary?: { href: string; label: string };
}) {
  return (
    <GlassCard className="lg:sticky lg:top-28">
      <MonoLabel>{eyebrow}</MonoLabel>
      <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-[var(--tf-slate)]">{body}</p>
      <ul className="mt-5 space-y-3">
        {notes.map((n, i) => (
          <TrustNote key={i} icon={n.icon}>
            {n.label}
          </TrustNote>
        ))}
      </ul>
      {tertiary && (
        <Link
          href={tertiary.href}
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--tf-accent)] underline decoration-[var(--tf-border-strong)] underline-offset-4 transition hover:text-[var(--tf-accent-deep)]"
        >
          {tertiary.label} →
        </Link>
      )}
    </GlassCard>
  );
}
