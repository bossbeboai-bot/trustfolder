/**
 * POST /api/customer/login-link
 *
 * Public endpoint. Always returns 200 with the same generic body so it
 * cannot be used to enumerate which emails are TrustFolder customers.
 *
 * Behaviour:
 *   - If the email appears in `requests`, `orders`, or `assessments`:
 *       1. Get-or-create a `customer_profiles` row.
 *       2. Issue a fresh magic-link token, store sha256(token) only.
 *       3. Email the link to the customer.
 *       4. Log a `link_sent` audit row.
 *   - Otherwise: log a `link_unknown_email` audit row and return 200.
 *
 * Response body always:
 *   { ok: true, message: 'If this email is linked to a TrustFolder request,
 *                         we'll send a sign-in link.' }
 */

import { NextResponse } from 'next/server';
import { sendCustomerMagicLink } from '@trustfolder/engine';
import {
  ensureCustomerProfile,
  isKnownEmail,
  logAuthEvent,
  persistLinkToken,
} from '@/lib/customer-data';
import {
  generateMagicLinkToken,
  isCustomerAuthConfigured,
  maskEmailForLog,
} from '@/lib/customer-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GENERIC_OK = {
  ok: true,
  message:
    "If this email is linked to a TrustFolder request, we'll send a sign-in link.",
};

interface Body {
  email?: string;
}

function originFromReq(req: Request): string {
  const explicit = (process.env.NEXT_PUBLIC_BASE_URL ?? '').trim();
  if (explicit) return explicit.replace(/\/+$/, '');
  // Fall back to the request origin so dev (localhost:3000) and prod both work.
  try {
    const u = new URL(req.url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return 'http://localhost:3000';
  }
}

function clientHints(req: Request): { ip: string | null; ua: string | null } {
  const ua = req.headers.get('user-agent');
  const fwd =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    null;
  const ip = fwd ? fwd.split(',')[0]?.trim() ?? null : null;
  return { ip, ua };
}

export async function POST(req: Request) {
  if (!isCustomerAuthConfigured()) {
    // Dev-friendly: return 200 with a generic body but log a server warning.
    // eslint-disable-next-line no-console
    console.warn('[customer/login-link] CUSTOMER_SESSION_SECRET not configured');
    return NextResponse.json(GENERIC_OK, { status: 200 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    // Treat as no-op rather than 400 — keeps responses uniform.
    return NextResponse.json(GENERIC_OK, { status: 200 });
  }

  const rawEmail = (body.email ?? '').trim();
  if (!rawEmail || !rawEmail.includes('@')) {
    return NextResponse.json(GENERIC_OK, { status: 200 });
  }

  const email = rawEmail.toLowerCase();
  const { ip, ua } = clientHints(req);

  const known = await isKnownEmail(email);
  if (!known) {
    await logAuthEvent({
      email,
      event_type: 'link_unknown_email',
      ip,
      user_agent: ua,
    });
    // eslint-disable-next-line no-console
    console.info(`[customer/login-link] unknown ${maskEmailForLog(email)}`);
    return NextResponse.json(GENERIC_OK, { status: 200 });
  }

  const profile = await ensureCustomerProfile(email);
  if (!profile) {
    // Should be very rare. Log + return generic to avoid info leaks.
    // eslint-disable-next-line no-console
    console.error(`[customer/login-link] profile_upsert_failed ${maskEmailForLog(email)}`);
    return NextResponse.json(GENERIC_OK, { status: 200 });
  }

  const { token, token_hash, expires_at } = generateMagicLinkToken();
  await persistLinkToken({
    customer_id: profile.id,
    token_hash,
    expires_at,
    ip,
    user_agent: ua,
  });

  const linkUrl = `${originFromReq(req)}/api/customer/verify?t=${encodeURIComponent(token)}`;
  // Best-effort send, but await it so serverless runtimes do not freeze the
  // email after the response is returned. The audit log remains the source of
  // truth and the public response stays generic.
  const sent = await sendCustomerMagicLink({ to_email: profile.email, link_url: linkUrl });
  if (!sent.ok) {
    // eslint-disable-next-line no-console
    console.error('[customer/login-link] sendCustomerMagicLink', sent.error);
  }

  await logAuthEvent({
    email: profile.email,
    customer_id: profile.id,
    event_type: 'link_sent',
    ip,
    user_agent: ua,
  });

  return NextResponse.json(GENERIC_OK, { status: 200 });
}
