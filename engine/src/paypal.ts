/**
 * PayPal integration.
 *
 * Three operations:
 *  1. createOrder     — create a PayPal order, returning approve_url for the SPA to redirect to
 *  2. captureOrder    — capture the order after the user approves
 *  3. verifyWebhook   — verify webhook signature using PayPal's verify-webhook-signature API
 *
 * All HTTP calls go through fetch with explicit env switching between sandbox
 * and production. Tokens are cached in-memory for their lifetime.
 *
 * Idempotency:
 *  - createOrder is keyed by our internal order_id (we send it as custom_id)
 *  - capture and webhook handlers must be idempotent at the caller — we
 *    record paypal_capture_id and dedupe at the DB level
 */

import { env } from './lib/env.js';
import type {
  PaypalCreateOrderInput,
  PaypalCreateOrderOutput,
  PaypalCaptureResult,
  PaypalWebhookEvent,
  Result,
  Tier,
} from './lib/types.js';

// =============================================================================
// OAuth token cache
// =============================================================================

interface CachedToken {
  access_token: string;
  expires_at: number; // epoch ms
}
let _tokenCache: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expires_at - 60_000) {
    return _tokenCache.access_token;
  }

  const auth = Buffer.from(
    `${env.paypalClientId()}:${env.paypalClientSecret()}`,
  ).toString('base64');

  const res = await fetch(`${env.paypalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`paypal_oauth_failed:${res.status}:${t}`);
  }
  const j = (await res.json()) as { access_token: string; expires_in: number };
  _tokenCache = {
    access_token: j.access_token,
    expires_at: Date.now() + j.expires_in * 1000,
  };
  return j.access_token;
}

// =============================================================================
// Pricing per tier (canonical source of truth in the engine)
// =============================================================================

/**
 * Canonical price source for the engine. Founding prices per
 * `docs/03-pricing-and-tiers.md`. Returns 0 for non-checkout tiers
 * (tier_0 free, tier_4 application-only/manual invoice).
 */
export function priceCentsForTier(tier: Tier): number {
  switch (tier) {
    case 'tier_0':
      return 0; // Free Eligibility Check
    case 'tier_1':
      return 9_900; // $99.00 — Lite Readiness Snapshot
    case 'tier_2':
      return 49_900; // $499.00 — Article 50 Disclosure Pack
    case 'tier_3':
      return 99_900; // $999.00 — Full AI Governance Evidence Folder
    case 'tier_4':
      return 0; // Premium Buyer/Legal Handoff — application-only, manual invoice
    default:
      return 0;
  }
}

export function tierLabel(tier: Tier): string {
  switch (tier) {
    case 'tier_0':
      return 'Free Eligibility Check';
    case 'tier_1':
      return 'Lite Readiness Snapshot';
    case 'tier_2':
      return 'Article 50 Disclosure Pack';
    case 'tier_3':
      return 'Full AI Governance Evidence Folder';
    case 'tier_4':
      return 'Premium Buyer/Legal Handoff Pack';
    default:
      return 'TrustFolder Pack';
  }
}

// =============================================================================
// Create order
// =============================================================================

export async function createPaypalOrder(
  input: PaypalCreateOrderInput,
): Promise<Result<PaypalCreateOrderOutput>> {
  if (input.amount_cents <= 0) {
    return { ok: false, error: 'invalid_amount' };
  }
  const token = await getAccessToken();

  const value = (input.amount_cents / 100).toFixed(2);

  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: { currency_code: 'USD', value },
        custom_id: input.order_id,
        description: `TrustFolder · ${tierLabel(input.tier)}`,
        soft_descriptor: 'TRUSTFOLDER',
      },
    ],
    application_context: {
      brand_name: 'TrustFolder',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
      return_url: `${env.appBaseUrl()}/checkout/return?order=${encodeURIComponent(input.order_id)}`,
      cancel_url: `${env.appBaseUrl()}/checkout/cancel?order=${encodeURIComponent(input.order_id)}`,
    },
  };

  const res = await fetch(`${env.paypalApiBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': input.order_id, // idempotency
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    return { ok: false, error: `paypal_create_failed:${res.status}:${t}` };
  }

  const json = (await res.json()) as {
    id: string;
    links: Array<{ rel: string; href: string; method: string }>;
  };

  const approve = json.links.find((l) => l.rel === 'approve' || l.rel === 'payer-action');
  if (!approve) return { ok: false, error: 'paypal_no_approve_link' };

  return {
    ok: true,
    data: {
      paypal_order_id: json.id,
      approve_url: approve.href,
    },
  };
}

// =============================================================================
// Capture order
// =============================================================================

export async function capturePaypalOrder(
  paypal_order_id: string,
): Promise<Result<PaypalCaptureResult>> {
  const token = await getAccessToken();

  const res = await fetch(
    `${env.paypalApiBase()}/v2/checkout/orders/${encodeURIComponent(paypal_order_id)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `cap-${paypal_order_id}`,
      },
      body: '{}',
    },
  );

  if (!res.ok) {
    const t = await res.text();
    return { ok: false, error: `paypal_capture_failed:${res.status}:${t}` };
  }

  const json = (await res.json()) as {
    status: string;
    purchase_units?: Array<{
      payments?: { captures?: Array<{ id: string; status: string; amount: { value: string } }> };
    }>;
  };

  const capture = json.purchase_units?.[0]?.payments?.captures?.[0];
  if (!capture) return { ok: false, error: 'paypal_no_capture' };

  const cents = Math.round(parseFloat(capture.amount.value) * 100);

  return {
    ok: true,
    data: {
      paypal_order_id,
      paypal_capture_id: capture.id,
      amount_cents: cents,
      status:
        capture.status === 'COMPLETED'
          ? 'completed'
          : capture.status === 'PENDING'
            ? 'pending'
            : 'failed',
    },
  };
}

// =============================================================================
// Webhook signature verification
// =============================================================================

export interface VerifyWebhookInput {
  headers: Record<string, string>;
  raw_body: string;
}

export async function verifyWebhookSignature(
  input: VerifyWebhookInput,
): Promise<Result<{ verified: boolean; event: PaypalWebhookEvent }>> {
  const token = await getAccessToken();

  const event = JSON.parse(input.raw_body) as PaypalWebhookEvent;

  const verifyBody = {
    auth_algo: input.headers['paypal-auth-algo'],
    cert_url: input.headers['paypal-cert-url'],
    transmission_id: input.headers['paypal-transmission-id'],
    transmission_sig: input.headers['paypal-transmission-sig'],
    transmission_time: input.headers['paypal-transmission-time'],
    webhook_id: env.paypalWebhookId(),
    webhook_event: event,
  };

  const res = await fetch(
    `${env.paypalApiBase()}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyBody),
    },
  );

  if (!res.ok) {
    const t = await res.text();
    return { ok: false, error: `webhook_verify_failed:${res.status}:${t}` };
  }

  const json = (await res.json()) as { verification_status: string };
  return {
    ok: true,
    data: {
      verified: json.verification_status === 'SUCCESS',
      event,
    },
  };
}

// =============================================================================
// Refund (used for out-of-scope auto-refunds)
// =============================================================================

export async function refundCapture(
  paypal_capture_id: string,
  reason?: string,
): Promise<Result<{ refund_id: string; status: string }>> {
  const token = await getAccessToken();

  const res = await fetch(
    `${env.paypalApiBase()}/v2/payments/captures/${encodeURIComponent(paypal_capture_id)}/refund`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `ref-${paypal_capture_id}`,
      },
      body: JSON.stringify(reason ? { note_to_payer: reason } : {}),
    },
  );

  if (!res.ok) {
    const t = await res.text();
    return { ok: false, error: `paypal_refund_failed:${res.status}:${t}` };
  }

  const json = (await res.json()) as { id: string; status: string };
  return { ok: true, data: { refund_id: json.id, status: json.status } };
}
