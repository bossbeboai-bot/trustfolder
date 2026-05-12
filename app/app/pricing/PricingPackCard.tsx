'use client';

/**
 * Pricing pack card with hover motion. Extracted into its own file because
 * pricing/page.tsx is a server component (it exports `metadata`) while the
 * card needs Framer Motion which is client-only.
 */

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { MonoNumeral, Reveal } from '../components/MarketingPrimitives';
import type { Pack } from './page';

export default function PricingPackCard({
  pack: p,
  index,
}: {
  pack: Pack;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <Reveal>
      <motion.div
        whileHover={reduceMotion ? undefined : { y: -6 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`flex h-full min-h-[620px] flex-col rounded-[34px] border p-9 shadow-[0_30px_120px_rgba(0,0,0,0.4)] lg:p-10 ${
          p.featured
            ? 'border-[var(--tf-border-strong)] bg-[var(--tf-paper)] text-[var(--tf-ink)]'
            : 'border-[var(--tf-border)] bg-[var(--tf-surface)]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`font-mono text-[13px] uppercase tracking-[0.18em] ${
              p.featured ? 'text-[#a9dce2]' : 'text-[var(--tf-accent)]'
            }`}
          >
            {p.featured ? `0${index + 1} · Featured` : (
              <MonoNumeral>{`0${index + 1}`}</MonoNumeral>
            )}
          </span>
          <p
            className={`text-lg font-medium ${
              p.featured ? 'text-[#a9dce2]' : 'text-[var(--tf-slate)]'
            }`}
          >
            {p.price}
          </p>
        </div>
        <h3 className="mt-7 text-3xl font-semibold leading-tight tracking-[-0.05em]">{p.name}</h3>
        <p
          className={`mt-5 text-base leading-8 ${
            p.featured ? 'text-[var(--tf-ink-soft)]' : 'text-[var(--tf-slate)]'
          }`}
        >
          <span className="font-medium">For: </span>
          {p.for_who}
        </p>
        <ul
          className={`mt-8 space-y-3 text-base leading-7 ${
            p.featured ? 'text-[var(--tf-ink-soft)]' : 'text-[var(--tf-slate)]'
          }`}
        >
          {p.what.map((item) => (
            <li key={item} className="flex gap-3">
              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                  p.featured ? 'bg-[#a9dce2]' : 'bg-[var(--tf-accent)]'
                }`}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p
          className={`mt-8 text-sm leading-7 ${
            p.featured ? 'text-[var(--tf-slate)]' : 'text-[var(--tf-slate-soft)]'
          }`}
        >
          <span className="font-medium">Delivery: </span>
          {p.delivery}
        </p>
        <p
          className={`mt-4 font-mono text-[11px] uppercase leading-6 tracking-[0.18em] ${
            p.featured ? 'text-[var(--tf-slate-soft)]' : 'text-[var(--tf-slate-soft)]'
          }`}
        >
          ↳ Not legal advice · Not certification · Not a compliance guarantee
        </p>
        <div className="mt-auto pt-10">
          <Link
            href={p.cta_href}
            className={`inline-flex h-14 items-center justify-center rounded-full px-8 text-base font-medium transition ${
              p.featured
                ? 'bg-[var(--tf-ink)] text-[var(--tf-on-light)] hover:bg-[var(--tf-ink-soft)]'
                : 'bg-[var(--tf-ink)] text-[var(--tf-on-light)] hover:bg-[var(--tf-ink-soft)]'
            }`}
          >
            {p.cta_label}
          </Link>
        </div>
      </motion.div>
    </Reveal>
  );
}
