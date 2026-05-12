'use client';

import { useState } from 'react';

interface InitialProfile {
  email: string;
  display_name: string;
  company_name: string;
  website_url: string;
  notification_opt_in: boolean;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function SettingsForm({ initial }: { initial: InitialProfile }) {
  const [displayName, setDisplayName] = useState(initial.display_name);
  const [companyName, setCompanyName] = useState(initial.company_name);
  const [websiteUrl, setWebsiteUrl] = useState(initial.website_url);
  const [notify, setNotify] = useState(initial.notification_opt_in);
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'saving') return;
    setState('saving');
    setError(null);
    try {
      const res = await fetch('/api/customer/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim() || null,
          company_name: companyName.trim() || null,
          website_url: websiteUrl.trim() || null,
          notification_opt_in: notify,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'save_failed');
        setState('error');
        return;
      }
      setState('saved');
      setTimeout(() => setState('idle'), 2400);
    } catch {
      setError('network_error');
      setState('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-5">
      <Field label="Email" hint="Verified — change requires support">
        <input
          type="email"
          value={initial.email}
          disabled
          className="h-11 w-full rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-soft)] px-3 text-[14px] text-[var(--tf-slate-soft)]"
        />
      </Field>

      <Field label="Display name">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How we should address you"
          className="h-11 w-full rounded-xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-3 text-[14px] text-[var(--tf-ink)] outline-none transition focus:border-[var(--tf-accent)]"
        />
      </Field>

      <Field label="Company name">
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme AI"
          className="h-11 w-full rounded-xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-3 text-[14px] text-[var(--tf-ink)] outline-none transition focus:border-[var(--tf-accent)]"
        />
      </Field>

      <Field label="Website">
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://acme.ai"
          className="h-11 w-full rounded-xl border border-[var(--tf-border-strong)] bg-[var(--tf-bg-soft)] px-3 text-[14px] text-[var(--tf-ink)] outline-none transition focus:border-[var(--tf-accent)]"
        />
      </Field>

      <label className="flex items-center gap-3 rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg-soft)]/60 px-4 py-3 text-[14px] text-[var(--tf-ink-soft)]">
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
          className="h-4 w-4 accent-[var(--tf-accent)]"
        />
        <span>Email me about my orders, packs, and refresh prompts.</span>
      </label>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={state === 'saving'}
          className="inline-flex h-11 items-center rounded-full bg-[var(--tf-ink)] px-6 text-[13px] font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
        {state === 'saved' && (
          <span className="text-[13px] text-[#7fd1c4]">Saved</span>
        )}
        {state === 'error' && (
          <span className="text-[13px] text-[#f4a5a5]">
            {error === 'no_changes' ? 'Nothing to save.' : 'Could not save. Try again.'}
          </span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--tf-slate)]">
          {label}
        </label>
        {hint && <span className="text-[11px] text-[var(--tf-slate-soft)]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
