'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
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
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-6 shadow-[0_24px_70px_rgba(28,49,38,0.12)] sm:p-8"
    >
      {state === 'success' ? (
        <div className="flex min-h-[480px] flex-col justify-center">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-green)]">
            Message received
          </p>
          <h2 className="mt-5 font-serif text-[34px] font-semibold leading-tight text-[color:var(--m-black)] sm:text-[42px]">
            Thanks. We&rsquo;ll reply within 1 business day.
          </h2>
          <p className="mt-6 text-[15px] leading-7 text-[color:var(--m-muted)]">
            If your message needs a quick context check, we may follow up with one or two
            clarifying questions before a longer reply.
          </p>
          <div className="mt-10 rounded-2xl border border-[color:var(--m-border)] bg-[color:var(--m-cream)] p-6 text-[14px] leading-7 text-[color:var(--m-muted)]">
            <p>
              <span className="font-medium text-[color:var(--m-black)]">Topic:</span>{' '}
              {TOPICS.find((t) => t.value === topic)?.label ?? topic}
            </p>
            <p>
              <span className="font-medium text-[color:var(--m-black)]">From:</span> {email}
            </p>
            {companyName && (
              <p>
                <span className="font-medium text-[color:var(--m-black)]">Company:</span> {companyName}
              </p>
            )}
            {website && (
              <p>
                <span className="font-medium text-[color:var(--m-black)]">Website:</span> {website}
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
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[color:var(--m-border-mid)] bg-transparent px-5 text-[14px] font-medium text-[color:var(--m-black)] transition hover:border-[color:var(--m-black)] hover:bg-[color:var(--m-cream)]"
            >
              Send another message
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Topic" id="topic">
            <select
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value as typeof topic)}
              className="mt-3 h-12 w-full rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-cream)] px-4 text-[14px] text-[color:var(--m-black)] outline-none transition focus:border-[color:var(--m-green)]"
            >
              {TOPICS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Work email" id="email">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@company.com"
              className="mt-3 h-12 w-full rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-cream)] px-4 text-[14px] text-[color:var(--m-black)] outline-none transition focus:border-[color:var(--m-green)]"
            />
          </FormField>

          <FormField label="Company name" id="company" optional>
            <input
              id="company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme AI"
              className="mt-3 h-12 w-full rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-cream)] px-4 text-[14px] text-[color:var(--m-black)] outline-none transition focus:border-[color:var(--m-green)]"
            />
          </FormField>

          <FormField label="Website" id="website" optional>
            <input
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://company.ai"
              className="mt-3 h-12 w-full rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-cream)] px-4 text-[14px] text-[color:var(--m-black)] outline-none transition focus:border-[color:var(--m-green)]"
            />
          </FormField>

          <FormField label="Message" id="message">
            <textarea
              id="message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="A short paragraph on what you need or what you would like to discuss..."
              rows={7}
              className="mt-3 w-full resize-none rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-cream)] px-4 py-4 text-[14px] leading-7 text-[color:var(--m-black)] outline-none transition focus:border-[color:var(--m-green)]"
            />
          </FormField>

          {errorMsg && (
            <div className="rounded-lg border border-[#c94b4b]/40 bg-[#fff2f2] px-4 py-3 text-[14px] text-[#8a2020]">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={state === 'submitting'}
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[color:var(--m-green)] px-6 text-[14px] font-medium text-[color:var(--m-white)] transition hover:bg-[color:var(--m-green-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === 'submitting' ? 'Sending...' : 'Send message'}
          </button>

          <p className="text-[13px] leading-6 text-[color:var(--m-subtle)]">
            We use this to understand context before replying. Nothing is charged here.
          </p>
        </form>
      )}
    </motion.section>
  );
}

function FormField({
  label,
  id,
  optional,
  children,
}: {
  label: string;
  id: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-[14px] font-medium text-[color:var(--m-black)]" htmlFor={id}>
        {label}
        {optional && <span className="text-[color:var(--m-subtle)]"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}
