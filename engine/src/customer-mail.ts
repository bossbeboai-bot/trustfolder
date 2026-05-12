/**
 * Customer-account transactional emails (Phase 5 / Batch 1).
 *
 * Currently only one template: `customer_magic_link`. Sent in response to a
 * /api/customer/login-link request when the email is in our known-emails
 * set. The link points at /api/customer/verify?t=<token>.
 *
 * All sends route through `lib/resend.sendTransactional`, which logs into
 * `email_events`. We use a separate template_id so the founder admin can
 * see auth-link sends in the email log without drowning out pack delivery.
 *
 * Hard rules:
 *   - Never log the raw token.
 *   - Never email anything other than the link in this template — the body
 *     should be calm and short; if a buyer sees this without expecting it,
 *     they should be able to ignore the email safely.
 */

import { sendTransactional } from './lib/resend.js';
import type { Result } from './lib/types.js';

export interface SendCustomerMagicLinkInput {
  to_email: string;
  /** Fully-qualified URL to /api/customer/verify?t=... */
  link_url: string;
  /** Used in copy: "Sign in to TrustFolder". Defaults to "TrustFolder". */
  product_name?: string;
  /** Token TTL in minutes for copy. Defaults to 15. */
  expires_in_minutes?: number;
}

export async function sendCustomerMagicLink(
  input: SendCustomerMagicLinkInput,
): Promise<Result<{ email_id: string }>> {
  const product = input.product_name ?? 'TrustFolder';
  const minutes = input.expires_in_minutes ?? 15;
  const subject = `Sign in to ${product}`;
  const html = renderHtml(input.link_url, product, minutes);
  const text = renderText(input.link_url, product, minutes);

  const send = await sendTransactional({
    to: input.to_email,
    subject,
    html,
    text,
    template_id: 'customer_magic_link',
    order_id: null,
    metadata: { expires_in_minutes: minutes },
  });

  if (send.status === 'failed') {
    return { ok: false, error: send.error ?? 'email_send_failed' };
  }
  return { ok: true, data: { email_id: send.email_id } };
}

// =============================================================================
// Templates
// =============================================================================

function renderHtml(linkUrl: string, product: string, minutes: number): string {
  const safeUrl = escapeHtml(linkUrl);
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.55">
      <p style="font-size:15px;color:#0f172a;margin:0 0 16px">Sign in to ${escapeHtml(product)}.</p>
      <p style="font-size:14px;color:#475569;margin:0 0 24px">Click the button below to open your dashboard. This link expires in ${minutes} minutes and can only be used once.</p>
      <p style="margin:0 0 32px">
        <a href="${safeUrl}" style="display:inline-block;background:#0f172a;color:#f4f1ea;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px">Open dashboard</a>
      </p>
      <p style="font-size:13px;color:#64748b;margin:0 0 8px">Or copy this link into your browser:</p>
      <p style="font-size:12px;color:#475569;word-break:break-all;margin:0 0 24px">${safeUrl}</p>
      <p style="font-size:12px;color:#94a3b8;margin:32px 0 0">If you didn't request this email, you can safely ignore it. TrustFolder is an AI governance evidence drafter — not legal advice, not certification, and not a compliance guarantee.</p>
    </div>`.trim();
}

function renderText(linkUrl: string, product: string, minutes: number): string {
  return `Sign in to ${product}.

Open your dashboard:
${linkUrl}

This link expires in ${minutes} minutes and can only be used once.

If you didn't request this email, you can safely ignore it. TrustFolder is an AI governance evidence drafter — not legal advice, not certification, and not a compliance guarantee.`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
