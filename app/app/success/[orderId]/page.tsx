'use client';

/**
 * /success/[orderId]
 *
 * Polls /api/status/[orderId] and shows live progress messages.
 * Tells the user the pack arrives by email — never blocks them on screen.
 * Handles failure (failed_needs_retry) gracefully with a reassuring message.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface StatusPayload {
  id: string;
  status: string;
  status_label: string;
  tier: string;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  delivered: boolean;
  delivered_at: string | null;
  is_failed: boolean;
  is_out_of_scope: boolean;
}

export default function SuccessPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId;
  const [status, setStatus] = useState<StatusPayload | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      try {
        const res = await fetch(`/api/status/${orderId}`);
        if (!res.ok) {
          if (alive) timer = setTimeout(tick, 5_000);
          return;
        }
        const data = (await res.json()) as StatusPayload;
        if (!alive) return;
        setStatus(data);

        // Stop polling on terminal states
        if (data.delivered || data.is_out_of_scope) return;
        timer = setTimeout(tick, 4_000);
      } catch {
        if (alive) timer = setTimeout(tick, 6_000);
      }
    };
    tick();

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [orderId]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">
        Payment received — your pack is being prepared
      </h1>
      <p className="mt-3 text-[var(--tf-slate)]">
        We&rsquo;ll email you the download link in the next few minutes. You can close this page.
      </p>

      <div className="mt-10 p-6 bg-[var(--tf-surface)] border border-[var(--tf-border)] rounded-lg">
        <p className="text-xs uppercase tracking-wide text-[var(--tf-slate-soft)] mb-2">Current step</p>
        <p className="text-lg font-medium text-[var(--tf-ink)]">
          {status?.status_label ?? 'Getting started…'}
        </p>

        <div className="mt-6 space-y-2 text-sm">
          <Step label="Payment received" done done2={!!status} />
          <Step
            label="Generating documents"
            done={['qa_started', 'qa_passed', 'package_created', 'delivered'].includes(
              status?.status ?? '',
            )}
            done2={['generation_started'].includes(status?.status ?? '')}
          />
          <Step
            label="Quality-checking"
            done={['qa_passed', 'package_created', 'delivered'].includes(status?.status ?? '')}
            done2={['qa_started'].includes(status?.status ?? '')}
          />
          <Step
            label="Packaging"
            done={['delivered'].includes(status?.status ?? '')}
            done2={['package_created'].includes(status?.status ?? '')}
          />
          <Step
            label="Sending your pack"
            done={status?.delivered ?? false}
            done2={['package_created'].includes(status?.status ?? '')}
          />
        </div>

        {status?.delivered && (
          <p className="mt-6 text-sm text-[#7fd1c4] bg-green-50 border border-green-200 rounded p-3">
            ✓ Delivered. Check your inbox.
          </p>
        )}

        {status?.is_failed && (
          status?.payment_status === 'failed' || status?.payment_status === 'refunded' ? (
            <p className="mt-6 text-sm text-[var(--tf-ink-soft)] bg-[var(--tf-paper)] rounded p-3">
              {status.payment_status === 'refunded'
                ? 'Your payment was reversed. We have not generated a pack and there is no charge to dispute on your end. Check your email for next steps.'
                : 'Your payment did not complete. No pack has been generated and there is no charge on your end. Check your email for next steps.'}
            </p>
          ) : (
            <p className="mt-6 text-sm text-[var(--tf-ink-soft)] bg-[var(--tf-paper)] rounded p-3">
              We hit a small bump and are finishing your pack now. We&rsquo;ll email it shortly.
              Your order is safe — no action needed.
            </p>
          )
        )}

        {status?.is_out_of_scope && (
          <p className="mt-6 text-sm text-[var(--tf-ink-soft)] bg-[var(--tf-paper)] rounded p-3">
            On closer look, your product needs specialist review. We&rsquo;ve issued a refund
            and will email you with details.
          </p>
        )}
      </div>

      <p className="mt-8 text-xs text-[var(--tf-slate)]">
        Order ID: <code>{orderId}</code>
      </p>
    </div>
  );
}

function Step({ label, done, done2 }: { label: string; done: boolean; done2?: boolean }) {
  const icon = done ? '✓' : done2 ? '⏳' : '○';
  const cls = done ? 'text-[#7fd1c4]' : done2 ? 'text-[var(--tf-accent)]' : 'text-[var(--tf-slate-soft)]';
  return (
    <div className={`flex items-center gap-2 ${cls}`}>
      <span className="font-mono">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
