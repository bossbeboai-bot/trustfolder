'use client';

import { useState } from 'react';

type State = 'idle' | 'loading' | 'ready' | 'error';

export default function DownloadButton({ orderId }: { orderId: string }) {
  const [state, setState] = useState<State>('idle');
  const [url, setUrl] = useState<string | null>(null);
  const [expires, setExpires] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function issueLink() {
    if (state === 'loading') return;
    setState('loading');
    setError(null);
    try {
      const res = await fetch('/api/customer/download-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      });
      const j = (await res.json()) as {
        url?: string;
        expires_at?: string;
        error?: string;
      };
      if (!res.ok || !j.url) {
        setError(j.error ?? 'request_failed');
        setState('error');
        return;
      }
      setUrl(j.url);
      setExpires(j.expires_at ?? null);
      setState('ready');
    } catch {
      setError('network_error');
      setState('error');
    }
  }

  if (state === 'ready' && url) {
    return (
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <a
          href={url}
          download
          className="inline-flex h-11 items-center rounded-full bg-[var(--tf-ink)] px-6 text-[13px] font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)]"
        >
          Download zip
        </a>
        <button
          type="button"
          onClick={issueLink}
          className="text-[12px] text-[var(--tf-slate)] hover:text-[var(--tf-ink)]"
        >
          Refresh link
        </button>
        {expires && (
          <span className="text-[11px] text-[var(--tf-slate-soft)]">
            Link valid until {new Date(expires).toLocaleString()}
          </span>
        )}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <button
          type="button"
          onClick={issueLink}
          className="inline-flex h-11 items-center rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-5 text-[13px] font-medium text-[var(--tf-ink)] transition hover:bg-[var(--tf-paper)]"
        >
          Try again
        </button>
        <span className="text-[12px] text-[#f4a5a5]">
          {error === 'order_not_delivered'
            ? 'This order is still being prepared.'
            : error === 'no_pack_zip_in_storage'
              ? 'No pack zip found yet — check back shortly.'
              : 'Could not issue a link. Try again.'}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={issueLink}
      disabled={state === 'loading'}
      className="inline-flex h-11 items-center rounded-full bg-[var(--tf-ink)] px-6 text-[13px] font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {state === 'loading' ? 'Issuing link…' : 'Issue download link'}
    </button>
  );
}
