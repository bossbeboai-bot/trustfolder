'use client';

/**
 * Readiness Score card — Phase 8 batch 1.
 *
 * Renders a deterministic readiness score across 5 dimensions. Inspired by
 * competitor risk/maturity frameworks BUT framed strictly as documentation
 * readiness, never compliance / audit / legal.
 *
 * Wording rules:
 *  - Never call this a compliance, audit, or legal score.
 *  - Always render the disclaimer.
 *  - Always render the recommended next step.
 */

import type { ReactNode } from 'react';

export interface ReadinessDimensionView {
  key: string;
  label: string;
  score: number;
  rationale: string;
}

export interface ReadinessScoreView {
  overall: number;
  band: 'strong' | 'good' | 'partial' | 'not_ready';
  band_label: string;
  dimensions: ReadinessDimensionView[];
  recommended_next_step: string;
  disclaimer: string;
  limitations: string[];
  label: string;
}

const BAND_BG: Record<ReadinessScoreView['band'], string> = {
  strong: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
  good: 'bg-amber-50 text-amber-900 ring-amber-200',
  partial: 'bg-orange-50 text-orange-900 ring-orange-200',
  not_ready: 'bg-rose-50 text-rose-900 ring-rose-200',
};

export function ReadinessScoreCard({
  score,
  footer,
  compact = false,
}: {
  score: ReadinessScoreView;
  footer?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-7 shadow-[0_22px_80px_rgba(7,17,31,0.07)] sm:p-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[var(--tf-accent)]">
            {score.label}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)] sm:text-3xl">
            Buyer-readiness score
          </h3>
        </div>
        <div
          className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-[12px] font-medium ring-1 ring-inset ${BAND_BG[score.band]}`}
        >
          {score.band_label}
        </div>
      </div>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="text-5xl font-semibold tracking-[-0.05em] text-[var(--tf-ink)]">
          {score.overall}
        </span>
        <span className="text-[14px] text-[var(--tf-slate-soft)]">/ 100</span>
      </div>

      <p className="mt-3 text-[14px] leading-7 text-[var(--tf-slate)]">
        {score.recommended_next_step}
      </p>

      {!compact && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {score.dimensions.map((d) => (
            <li
              key={d.key}
              className="rounded-2xl border border-[var(--tf-border)]/60 bg-[var(--tf-bg-soft)]/40 px-4 py-3"
            >
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-[var(--tf-ink)]">{d.label}</span>
                <span className="text-[var(--tf-accent)]">{d.score}/100</span>
              </div>
              <p className="mt-1 text-[12px] leading-5 text-[var(--tf-slate)]">{d.rationale}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-[12px] leading-6 text-[var(--tf-slate-soft)]">{score.disclaimer}</p>
      {score.limitations.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-[12px] leading-6 text-[var(--tf-slate-soft)]">
          {score.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
      {footer && <div className="mt-5">{footer}</div>}
    </div>
  );
}
