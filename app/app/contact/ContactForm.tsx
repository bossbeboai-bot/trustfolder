'use client';

/**
 * ContactForm — POSTs to the same `/api/request` endpoint as the paid-pack
 * lead form, with `source_page='/contact'` so the founder admin can filter
 * inbound contact messages from pack interest.
 *
 * UX rules:
 *  - Local validation on email so we never round-trip a malformed input.
 *  - Form values are preserved on error.
 *  - No instant-checkout language.
 */

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const TOPICS = [
  { value: 'custom_scope', label: 'Custom scope' },
  { value: 'partnership', label: 'Partnerships' },
  { value: 'advisor', label: 'Advisor / design partner' },
  { value: 'support', label: 'Support on a delivered pack' },
  { value: 'press', label: 'Press / podcast' },
  { value: 'other', label: 'Something else' },
] as const;

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const reduceMotion = useReducedMotion();
  const [topic, setTopic] = useState<(typeof TOPICS)[number]['value']>('custom_scope');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (state === 'submitting') return;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid work email.');
      setState('error');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please add a short message so we know what you need.');
      setState('error');
      return;
    }

    setState('submitting');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pack_interest: 'contact',
          website,
          company_name: companyName,
          message,
          source_page: '/contact',
          metadata: {
            contact_topic: topic,
            referrer: typeof document !== 'undefined' ? document.referrer || null : null,
          },
        }),
      });

      if (!res.ok) {
        let detail = `request_failed_${res.status}`;
        try {
          const j = (await res.json()) as { error?: string; detail?: string };
          detail = j.detail ?? j.error ?? detail;
        } catch {
          /* ignore */
        }
        setErrorMsg(
          detail === 'missing_email' || detail === 'invalid_email'
            ? 'Please enter a valid work email.'
            : 'Something went wrong saving your request. Please try again or contact us.',
        );
        setState('error');
        return;
      }

      setState('success');
    } catch {
      setErrorMsg('Something went wrong saving your request. Please try again or contact us.');
      setState('error');
    }
  }

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[42px] border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] p-8 shadow-[0_34px_140px_rgba(0,0,0,0.45)] sm:p-12"
    >
      {state === 'success' ? (
        <div className="flex min-h-[480px] flex-col justify-center">
          <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[var(--tf-accent)]">
            Message received
          </p>
          <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-5xl">
            Thanks. We&rsquo;ll reply within 1 business day.
          </h2>
          <p className="mt-6 text-lg leading-8 text-[var(--tf-slate)]">
            If your message needs a quick context check, we may follow up with one or two
            clarifying questions before a longer reply.
          </p>
          <div className="mt-10 rounded-[28px] border border-[var(--tf-border)] bg-[var(--tf-bg-soft)] p-7 text-base leading-8 text-[var(--tf-slate)]">
            <p>
              <span className="font-medium text-[var(--tf-ink)]">Topic:</span>{' '}
              {TOPICS.find((t) => t.value === topic)?.label ?? topic}
            </p>
            <p>
              <span className="font-medium text-[var(--tf-ink)]">From:</span> {email}
            </p>
            {companyName && (
              <p>
                <span className="font-medium text-[var(--tf-ink)]">Company:</span> {companyName}
              </p>
            )}
            {website && (
              <p>
                <span className="font-medium text-[var(--tf-ink)]">Website:</span> {website}
              </p>
            )}
          </div>
          <div className="mt-10">
            <button
              type="button"
              onClick={() => {
                setState('idle');
                setErrorMsg(null);
                setMessage('');
              }}
              className="inline-flex h-14 items-center justify-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-paper)] px-8 text-base font-medium text-[var(--tf-ink)] transition hover:border-[var(--tf-ink-soft)]/40 hover:bg-[var(--tf-document)]"
            >
              Send another message
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label className="text-base font-medium text-[var(--tf-ink)]" htmlFor="topic">
              Topic
            </label>
            <select
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value as typeof topic)}
              className="mt-3 h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
            >
              {TOPICS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-base font-medium text-[var(--tf-ink)]" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@company.com"
              className="mt-3 h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
            />
          </div>

          <div>
            <label className="text-base font-medium text-[var(--tf-ink)]" htmlFor="company">
              Company name <span className="text-[var(--tf-slate-soft)]">(optional)</span>
            </label>
            <input
              id="company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme AI"
              className="mt-3 h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
            />
          </div>

          <div>
            <label className="text-base font-medium text-[var(--tf-ink)]" htmlFor="website">
              Website <span className="text-[var(--tf-slate-soft)]">(optional)</span>
            </label>
            <input
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://company.ai"
              className="mt-3 h-14 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 text-base outline-none transition focus:border-[var(--tf-accent)]"
            />
          </div>

          <div>
            <label className="text-base font-medium text-[var(--tf-ink)]" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="A short paragraph on what you need or what you would like to discuss..."
              rows={7}
              className="mt-3 w-full resize-none rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-5 py-4 text-base leading-7 outline-none transition focus:border-[var(--tf-accent)]"
            />
          </div>

          {errorMsg && (
            <div className="rounded-2xl border border-[#5a2828] bg-[#2a1414] px-5 py-4 text-base text-[#f4a5a5]">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={state === 'submitting'}
            className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[var(--tf-ink)] px-8 text-base font-medium text-[var(--tf-on-light)] shadow-[0_18px_60px_rgba(0,0,0,0.45)] transition hover:bg-[var(--tf-ink-soft)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === 'submitting' ? 'Sending…' : 'Send message'}
          </button>

          <p className="text-sm leading-7 text-[var(--tf-slate-soft)]">
            We use this to understand context before replying. Nothing is charged here.
          </p>
        </form>
      )}
    </motion.section>
  );
}
