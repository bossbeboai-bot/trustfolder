/**
 * Delivery emailer.
 *
 * Email types:
 *  - pack_delivery        — final ZIP download link
 *  - retry_notice         — "We're finishing your pack and will send shortly"
 *  - order_confirmation   — sent right after PayPal capture
 *  - out_of_scope_refund  — sent if scope-check rejects after payment (rare)
 *  - request_received     — acknowledgement for /api/request submissions
 *  - payment_failed       — denied / reversed / refunded payment notifications
 *
 * All sends route through lib/resend.sendTransactional which logs to email_events.
 *
 * Every helper returns a Result; callers should treat email as best-effort and
 * never fail the customer flow because an email did not send.
 */

import { sendTransactional } from './lib/resend.js';
import { service, dbError } from './lib/supabase.js';
import { env } from './lib/env.js';
import type { PackagedPack, Result } from './lib/types.js';

// =============================================================================
// Public API
// =============================================================================

export interface DeliverPackInput {
  order_id: string;
  to_email: string;
  company_name: string;
  pack: PackagedPack;
  tier_label: string; // "Article 50 Disclosure Pack" | "AI Governance Readiness Pack"
}

export async function deliverPack(input: DeliverPackInput): Promise<Result<{ email_id: string }>> {
  const subject = `Your ${input.tier_label} is ready`;
  const html = renderDeliveryHtml(input);
  const text = renderDeliveryText(input);

  const send = await sendTransactional({
    to: input.to_email,
    subject,
    html,
    text,
    template_id: 'pack_delivery',
    order_id: input.order_id,
    metadata: {
      doc_count: input.pack.doc_count,
      signed_url_expires_at: input.pack.signed_url_expires_at,
    },
  });

  if (send.status === 'failed') {
    return { ok: false, error: send.error ?? 'email_send_failed' };
  }

  // Persist delivery state on the order
  const sb = service();
  try {
    await sb
      .from('orders')
      .update({
        delivery_email_id: send.email_id,
        delivered_at: new Date().toISOString(),
      })
      .eq('id', input.order_id);
  } catch (err) {
    dbError('deliver.persistDeliveryState', err);
  }

  return { ok: true, data: { email_id: send.email_id } };
}

// -----------------------------------------------------------------------------

export interface SendOrderConfirmationInput {
  order_id: string;
  to_email: string;
  tier_label: string;
  amount_cents: number;
  currency: string;
}

export async function sendOrderConfirmation(input: SendOrderConfirmationInput): Promise<Result<{ email_id: string }>> {
  const amountFmt = formatAmount(input.amount_cents, input.currency);
  const subject = `Payment received — your ${input.tier_label} is being prepared`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.5">
      <p>Thanks for your order.</p>
      <p>We've received your payment of <strong>${amountFmt}</strong>. Your <strong>${escapeHtml(input.tier_label)}</strong> is being prepared now.</p>
      <p>You'll receive a separate email with the download link in the next few minutes.</p>
      <p style="margin-top:32px;font-size:13px;color:#64748b">TrustFolder is an AI governance evidence folder, not a legal compliance guarantee.</p>
    </div>`;
  const text = `Thanks for your order.

We've received your payment of ${amountFmt}. Your ${input.tier_label} is being prepared now.

You'll receive a separate email with the download link in the next few minutes.

TrustFolder is an AI governance evidence folder, not a legal compliance guarantee.`;

  const send = await sendTransactional({
    to: input.to_email,
    subject,
    html,
    text,
    template_id: 'order_confirmation',
    order_id: input.order_id,
    metadata: { amount_cents: input.amount_cents, currency: input.currency },
  });

  if (send.status === 'failed') return { ok: false, error: send.error };
  return { ok: true, data: { email_id: send.email_id } };
}

// -----------------------------------------------------------------------------

export interface SendRetryNoticeInput {
  order_id: string;
  to_email: string;
  reason?: string;
}

export async function sendRetryNotice(input: SendRetryNoticeInput): Promise<Result<{ email_id: string }>> {
  const subject = `We're finishing your pack — sending shortly`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.5">
      <p>Your TrustFolder pack hit a small bump on our side. Nothing to worry about — your order is safe and we're finishing the documents now.</p>
      <p>We'll email the download link as soon as it's ready, usually within an hour.</p>
      <p>If you don't hear from us in 24 hours, reply to this email and we'll sort it out personally.</p>
      <p style="margin-top:32px;font-size:13px;color:#64748b">TrustFolder is an AI governance evidence folder, not a legal compliance guarantee.</p>
    </div>`;
  const text = `Your TrustFolder pack hit a small bump on our side. Nothing to worry about — your order is safe and we're finishing the documents now.

We'll email the download link as soon as it's ready, usually within an hour.

If you don't hear from us in 24 hours, reply to this email and we'll sort it out personally.

TrustFolder is an AI governance evidence folder, not a legal compliance guarantee.`;

  const send = await sendTransactional({
    to: input.to_email,
    subject,
    html,
    text,
    template_id: 'retry_notice',
    order_id: input.order_id,
    metadata: input.reason ? { reason: input.reason } : {},
  });

  if (send.status === 'failed') return { ok: false, error: send.error };
  return { ok: true, data: { email_id: send.email_id } };
}

// -----------------------------------------------------------------------------

export interface SendOutOfScopeRefundInput {
  order_id: string;
  to_email: string;
  reason: string;
}

export async function sendOutOfScopeRefund(input: SendOutOfScopeRefundInput): Promise<Result<{ email_id: string }>> {
  const subject = `Refund issued — your product needs specialist review`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.5">
      <p>Thanks for considering TrustFolder.</p>
      <p>We've reviewed the information you provided and your product appears to operate in a regulated category that needs specialized expert review beyond our automated tool's scope.</p>
      <p>We've issued a full refund. We'd recommend reaching out to a specialized AI/regulatory lawyer for this category. We're happy to provide pointers — just reply to this email.</p>
      <p style="margin-top:32px;font-size:13px;color:#64748b">Reason: ${escapeHtml(input.reason)}</p>
      <p style="margin-top:8px;font-size:13px;color:#64748b">TrustFolder is an AI governance evidence folder, not a legal compliance guarantee.</p>
    </div>`;
  const text = `Thanks for considering TrustFolder.

We've reviewed the information you provided and your product appears to operate in a regulated category that needs specialized expert review beyond our automated tool's scope.

We've issued a full refund. We'd recommend reaching out to a specialized AI/regulatory lawyer for this category. We're happy to provide pointers — just reply to this email.

Reason: ${input.reason}

TrustFolder is an AI governance evidence folder, not a legal compliance guarantee.`;

  const send = await sendTransactional({
    to: input.to_email,
    subject,
    html,
    text,
    template_id: 'out_of_scope_refund',
    order_id: input.order_id,
    metadata: { reason: input.reason },
  });

  if (send.status === 'failed') return { ok: false, error: send.error };
  return { ok: true, data: { email_id: send.email_id } };
}

// =============================================================================
// Internal: rendering
// =============================================================================

function renderDeliveryHtml(input: DeliverPackInput): string {
  const expires = new Date(input.pack.signed_url_expires_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.5">
    <p>Your <strong>${escapeHtml(input.tier_label)}</strong> for <strong>${escapeHtml(input.company_name)}</strong> is ready.</p>

    <div style="margin:24px 0;text-align:center">
      <a href="${input.pack.signed_url}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600">Download your pack (.zip)</a>
    </div>

    <p style="font-size:14px;color:#475569">The download link is valid until <strong>${expires}</strong>.</p>

    <h3 style="margin-top:32px">What's inside</h3>
    <p style="font-size:14px">${input.pack.doc_count} documents, organized into a Notion-importable folder. Open <code>README.md</code> first.</p>

    <h3 style="margin-top:32px">What to do next</h3>
    <ol style="font-size:14px">
      <li>Read <code>README.md</code> for an overview (5 min)</li>
      <li>Open <code>next-steps-roadmap.md</code> for the 30-day plan</li>
      <li>For Tier 3 packs, start with <code>04-buyer-legal-handoff/02-09-lawyer-handoff-pack.md</code> — it briefs your lawyer in 1–2 pages</li>
      <li>Apply the disclosure drafts to your product UI before public launch</li>
    </ol>

    <p style="margin-top:32px;font-size:13px;color:#64748b">Need help? Reply to this email.</p>
    <p style="margin-top:8px;font-size:13px;color:#64748b">TrustFolder is an AI governance evidence folder, not a legal compliance guarantee. Always review with qualified legal counsel.</p>
  </div>`;
}

function renderDeliveryText(input: DeliverPackInput): string {
  const expires = new Date(input.pack.signed_url_expires_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `Your ${input.tier_label} for ${input.company_name} is ready.

Download your pack (.zip):
${input.pack.signed_url}

The download link is valid until ${expires}.

What's inside: ${input.pack.doc_count} documents, organized into a Notion-importable folder. Open README.md first.

What to do next:
1. Read README.md for an overview (5 min)
2. Open next-steps-roadmap.md for the 30-day plan
3. For Tier 3 packs, start with 04-buyer-legal-handoff/02-09-lawyer-handoff-pack.md — it briefs your lawyer in 1-2 pages
4. Apply the disclosure drafts to your product UI before public launch

Need help? Reply to this email.

TrustFolder is an AI governance evidence folder, not a legal compliance guarantee. Always review with qualified legal counsel.

— TrustFolder
${env.appBaseUrl()}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

// -----------------------------------------------------------------------------
// request_received — acknowledgement for /api/request lead submissions
// -----------------------------------------------------------------------------

export interface SendRequestReceivedInput {
  request_id: string;
  to_email: string;
  package_interest?: string | null;
  website_url?: string | null;
  company_name?: string | null;
  message?: string | null;
}

export async function sendRequestReceived(
  input: SendRequestReceivedInput,
): Promise<Result<{ email_id: string }>> {
  const packLine = input.package_interest
    ? ` — ${escapeHtml(input.package_interest)}`
    : '';
  const subject = `We received your request${packLine}`;

  const detailRows: Array<[string, string | null | undefined]> = [
    ['Pack interest', input.package_interest ?? null],
    ['Company', input.company_name ?? null],
    ['Website', input.website_url ?? null],
    ['Notes', input.message ?? null],
  ];
  const detailsHtml = detailRows
    .filter(([, v]) => v && v.toString().trim().length > 0)
    .map(
      ([k, v]) =>
        `<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}</li>`,
    )
    .join('');
  const detailsText = detailRows
    .filter(([, v]) => v && v.toString().trim().length > 0)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.5">
      <p>Thanks for the request — we received it.</p>
      <p>We&rsquo;ll review your website and reply with next steps within 1 business day.</p>
      ${
        detailsHtml
          ? `<p style="margin-top:16px;font-size:14px;color:#334155">What we received:</p>
             <ul style="font-size:14px;color:#334155;padding-left:20px">${detailsHtml}</ul>`
          : ''
      }
      <p style="margin-top:24px;font-size:14px">If you need to add anything, just reply to this email.</p>
      <p style="margin-top:32px;font-size:13px;color:#64748b">TrustFolder is an AI governance evidence folder, not a legal compliance guarantee. AI-generated drafts for review. Not legal advice. Not certification.</p>
    </div>`;

  const text = `Thanks for the request — we received it.

We'll review your website and reply with next steps within 1 business day.

${detailsText ? `What we received:\n${detailsText}\n\n` : ''}If you need to add anything, just reply to this email.

TrustFolder is an AI governance evidence folder, not a legal compliance guarantee. AI-generated drafts for review. Not legal advice. Not certification.`;

  const send = await sendTransactional({
    to: input.to_email,
    subject,
    html,
    text,
    template_id: 'request_received',
    order_id: null,
    metadata: {
      request_id: input.request_id,
      package_interest: input.package_interest ?? null,
    },
  });

  if (send.status === 'failed') return { ok: false, error: send.error };
  return { ok: true, data: { email_id: send.email_id } };
}

// -----------------------------------------------------------------------------
// payment_failed — denied / reversed / refunded notifications
// -----------------------------------------------------------------------------

export type PaymentFailedReason = 'denied' | 'reversed' | 'refunded';

export interface SendPaymentFailedInput {
  order_id: string;
  to_email: string;
  reason: PaymentFailedReason;
  tier_label?: string;
}

export async function sendPaymentFailed(
  input: SendPaymentFailedInput,
): Promise<Result<{ email_id: string }>> {
  const human = humanReason(input.reason);
  const subject =
    input.reason === 'refunded'
      ? `Refund issued for your TrustFolder order`
      : `Payment didn't go through`;

  const tierClause = input.tier_label
    ? ` for the <strong>${escapeHtml(input.tier_label)}</strong>`
    : '';
  const tierClauseText = input.tier_label ? ` for the ${input.tier_label}` : '';

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.5">
      <p>${
        input.reason === 'refunded'
          ? `We&rsquo;ve processed a refund${tierClause}.`
          : `Your payment${tierClause} did not complete.`
      }</p>
      <p>${human}</p>
      <p>No pack has been generated. If you&rsquo;d like to try again or talk through the next step, just reply to this email — we&rsquo;ll sort it out personally.</p>
      <p style="margin-top:32px;font-size:13px;color:#64748b">TrustFolder is an AI governance evidence folder, not a legal compliance guarantee.</p>
    </div>`;

  const text = `${
    input.reason === 'refunded'
      ? `We've processed a refund${tierClauseText}.`
      : `Your payment${tierClauseText} did not complete.`
  }

${human}

No pack has been generated. If you'd like to try again or talk through the next step, just reply to this email — we'll sort it out personally.

TrustFolder is an AI governance evidence folder, not a legal compliance guarantee.`;

  const send = await sendTransactional({
    to: input.to_email,
    subject,
    html,
    text,
    template_id: 'payment_failed',
    order_id: input.order_id,
    metadata: { reason: input.reason },
  });

  if (send.status === 'failed') return { ok: false, error: send.error };
  return { ok: true, data: { email_id: send.email_id } };
}

function humanReason(reason: PaymentFailedReason): string {
  switch (reason) {
    case 'denied':
      return 'PayPal reported the capture was denied — usually a card-issuer or risk-system decline. No charge was completed on your end.';
    case 'reversed':
      return 'PayPal reversed the capture after the fact. This can happen with bank-side reversals or chargebacks; the funds have been returned.';
    case 'refunded':
      return 'The amount has been returned to your original payment method. Please allow 3–5 business days for the refund to appear.';
  }
}
