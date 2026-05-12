'use client';

import Link from 'next/link';
import { useState } from 'react';

type FormState = 'idle' | 'submitting' | 'sent' | 'error';

const GENERIC_SENT_MESSAGE =
  "If this email is linked to a TrustFolder request, we'll send a sign-in link. Check your inbox in the next minute.";

export default function LoginForm({
  initialStatus,
}: {
  initialStatus: string | null;
}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);

  const initialBanner =
    initialStatus === 'invalid_link'
      ? 'That sign-in link has expired or already been used. Request a new one below.'
      : initialStatus === 'not_configured'
        ? 'Sign-in is temporarily unavailable. Please contact support.'
        : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (state === 'submitting') return;
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid email address.');
      setState('error');
      return;
    }

    setState('submitting');
    setError(null);

    try {
      const res = await fetch('/api/customer/login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        setError('Could not reach the server. Please try again.');
        setState('error');
        return;
      }
      // Always show the generic sent state — even if the email was unknown.
      setState('sent');
    } catch {
      setError('Could not reach the server. Please try again.');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-[var(--tf-accent)]/40 bg-[var(--tf-accent)]/8 p-5">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[var(--tf-accent)]">
            Check your email
          </p>
          <p className="mt-3 text-[15px] leading-[1.55] text-[var(--tf-ink-soft)]">
            {GENERIC_SENT_MESSAGE}
          </p>
        </div>
        <div className="space-y-3 text-[14px] text-[var(--tf-slate)]">
          <p>Didn&apos;t receive an email after a minute or two?</p>
          <ul className="space-y-2 text-[13px] text-[var(--tf-slate-soft)]">
            <li>· Check your spam folder.</li>
            <li>
              · Make sure you used the same email address as your TrustFolder request or free
              check.
            </li>
            <li>
              · If you haven&apos;t requested anything yet, start with the{' '}
              <Link href="/assessment" className="text-[var(--tf-accent)] underline-offset-4 hover:underline">
                free check
              </Link>{' '}
              or{' '}
              <Link href="/request" className="text-[var(--tf-accent)] underline-offset-4 hover:underline">
                request a pack
              </Link>
              .
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => {
            setEmail('');
            setState('idle');
          }}
          className="text-[13px] font-medium text-[var(--tf-accent)] hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="customer-email"
          className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--tf-slate)]"
        >
          Work email
        </label>
        <input
          id="customer-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="founder@company.com"
          autoFocus
          className="mt-3 h-12 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-4 text-[15px] text-[var(--tf-ink)] outline-none transition focus:border-[var(--tf-accent)]"
        />
      </div>

      {initialBanner && (
        <div className="rounded-2xl border border-[#5a4828] bg-[#2a2114] px-4 py-3 text-[13px] leading-[1.55] text-[#f4d59a]">
          {initialBanner}
        </div>
      )}

      {state === 'error' && error && (
        <div className="rounded-2xl border border-[#5a2828] bg-[#2a1414] px-4 py-3 text-[13px] text-[#f4a5a5]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--tf-ink)] px-6 text-[15px] font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === 'submitting' ? 'Sending sign-in link…' : 'Email me a sign-in link'}
      </button>

      <div className="grid gap-2 text-[13px] text-[var(--tf-slate)]">
        <p className="leading-[1.55]">
          Haven&apos;t used TrustFolder yet?
        </p>
        <div className="flex flex-wrap gap-3 text-[var(--tf-accent)]">
          <Link href="/assessment" className="underline-offset-4 hover:underline">
            Run a free check
          </Link>
          <span className="text-[var(--tf-slate-soft)]">·</span>
          <Link href="/request" className="underline-offset-4 hover:underline">
            Request a pack
          </Link>
          <span className="text-[var(--tf-slate-soft)]">·</span>
          <Link href="/contact" className="underline-offset-4 hover:underline">
            Contact us
          </Link>
        </div>
      </div>
    </form>
  );
}
