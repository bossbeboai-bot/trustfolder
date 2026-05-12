'use client';

import { useState } from 'react';

type LoginState = 'idle' | 'submitting' | 'error';

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [state, setState] = useState<LoginState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (state === 'submitting') return;

    if (!password) {
      setErrorMsg('Enter the admin password.');
      setState('error');
      return;
    }

    setState('submitting');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // The server has set the cookie. Redirect to the dashboard.
        window.location.href = '/admin';
        return;
      }

      let detail = `login_failed_${res.status}`;
      try {
        const j = (await res.json()) as { error?: string };
        detail = j.error ?? detail;
      } catch {
        /* ignore */
      }
      setErrorMsg(
        detail === 'invalid_password'
          ? 'Incorrect password.'
          : detail === 'admin_not_configured'
            ? 'Admin password is not configured on the server.'
            : 'Could not sign in. Please try again.',
      );
      setState('error');
    } catch {
      setErrorMsg('Could not reach the server. Please try again.');
      setState('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label className="text-sm font-medium text-[var(--tf-ink)]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="mt-2 h-12 w-full rounded-2xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-4 text-sm outline-none transition focus:border-[var(--tf-accent)]"
        />
      </div>
      {errorMsg && (
        <div className="rounded-2xl border border-[#5a2828] bg-[#2a1414] px-4 py-3 text-sm text-[#f4a5a5]">
          {errorMsg}
        </div>
      )}
      <button
        type="submit"
        disabled={state === 'submitting'}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--tf-ink)] px-6 text-sm font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === 'submitting' ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
