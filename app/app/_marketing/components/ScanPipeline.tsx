'use client';

/**
 * ScanPipeline — hero visual representing:
 *   website URL → scan → assembled folder with 8/8 documents
 *
 * Pure CSS + SVG, respects prefers-reduced-motion. Used as the hero
 * preview for Phase 1, and continues to act as a graceful fallback if
 * the Remotion player fails to hydrate in Phase 3.
 */

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EDITORIAL_EASE } from '../lib/motion';

const DOC_LABELS = [
  '01 AI DISCLOSURE DRAFT',
  '02 AI USE SUMMARY',
  '03 EVIDENCE TRACKER',
  '04 GOVERNANCE SUMMARY',
  '05 BUYER HANDOFF',
  '06 SOURCE NOTES',
  '07 READINESS ROADMAP',
  '08 EU AI ACT NOTES',
];

export function ScanPipeline() {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % 240), 50);
    return () => window.clearInterval(id);
  }, [reduce]);

  // Derived scene state, 0..3 cycling every ~8s.
  const scene = Math.floor(tick / 60);

  return (
    <div className="overflow-hidden rounded-xl border border-[color:var(--m-border-mid)] bg-[color:var(--m-cream)] shadow-[0_1px_0_rgba(14,15,13,0.04)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-[color:var(--m-border)] bg-[color:var(--m-white)] px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#E24B4A]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#F4B33A]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#4CAE6A]" />
        <span className="ml-3 truncate font-mono text-[11px] text-[color:var(--m-subtle)]">
          acme.ai/product
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
          {scene === 0 ? 'SCAN' : scene === 1 ? 'ASSEMBLE' : scene === 2 ? 'DRAFT' : 'READINESS'}
        </span>
      </div>

      {/* Stage */}
      <div className="relative h-[280px] bg-[color:var(--m-cream)] sm:h-[320px]">
        {/* Scan line — Scene 0 */}
        {!reduce ? (
          <motion.div
            key={`scanline-${scene}`}
            aria-hidden
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[color:var(--m-green)] to-transparent"
            initial={{ top: 0, opacity: 0 }}
            animate={{ top: ['0%', '100%'], opacity: [0, 0.9, 0] }}
            transition={{ duration: 2.2, ease: EDITORIAL_EASE, repeat: Infinity }}
          />
        ) : null}

        {/* Detected signals */}
        <div className="absolute left-5 top-5 space-y-1.5 font-mono text-[11px] text-[color:var(--m-green-dark)]">
          <AnimatedLine delay={0.1}>✓ 4 AI signals detected</AnimatedLine>
          <AnimatedLine delay={0.35}>✓ EU references found</AnimatedLine>
          <AnimatedLine delay={0.6}>✓ Disclosure gaps flagged</AnimatedLine>
        </div>

        {/* Building pack counter */}
        <div className="absolute right-5 top-5 rounded-sm border border-[color:var(--m-border-mid)] bg-[color:var(--m-white)] px-2.5 py-1 font-mono text-[10px] tracking-wideish text-[color:var(--m-muted)]">
          Building pack · <span className="text-[color:var(--m-green)]">{Math.min(8, scene + 3)}/8</span>
        </div>

        {/* Folder with documents stacking in */}
        <div className="absolute bottom-5 left-5 right-5 flex items-end gap-3">
          <FolderSvg />
          <div className="flex-1 space-y-1.5">
            {DOC_LABELS.slice(0, Math.min(8, (scene + 1) * 3)).map((label, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4, ease: EDITORIAL_EASE }}
                className="flex items-center justify-between gap-3 rounded-md border border-[color:var(--m-border)] bg-[color:var(--m-white)] px-3 py-1.5"
              >
                <span className="truncate font-mono text-[10px] text-[color:var(--m-black)]">
                  {label}
                </span>
                <span className="h-[3px] w-14 rounded-full bg-[color:var(--m-border-mid)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Scene pips */}
      <div className="flex items-center gap-2 border-t border-[color:var(--m-border)] bg-[color:var(--m-white)] px-4 py-2.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-[3px] w-8 rounded-full transition-colors duration-300 ${
              i === scene ? 'bg-[color:var(--m-green)]' : 'bg-[color:var(--m-border-mid)]'
            }`}
          />
        ))}
        <span className="ml-auto font-mono text-[10px] tracking-wideish text-[color:var(--m-subtle)]">
          TrustFolder · preview
        </span>
      </div>
    </div>
  );
}

function AnimatedLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: EDITORIAL_EASE }}
    >
      {children}
    </motion.p>
  );
}

function FolderSvg() {
  return (
    <svg width="72" height="72" viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="sp-mint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6DD5C9" />
          <stop offset="100%" stopColor="#55BCAF" />
        </linearGradient>
        <linearGradient id="sp-navy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0C2557" />
        </linearGradient>
      </defs>
      <rect x="6" y="14" width="42" height="40" rx="5" fill="url(#sp-navy)" />
      <rect x="12" y="18" width="42" height="40" rx="5" fill="url(#sp-mint)" />
      <rect x="18" y="22" width="42" height="40" rx="5" fill="url(#sp-navy)" />
      <path
        d="M26 42 L33 49 L49 33"
        stroke="#FAFAF8"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
