/**
 * GET /api/customer/verify?t=<token>
 *
 * Public endpoint. Consumes a single-use magic-link token, sets the
 * `tf_customer` cookie, runs the idempotent backfill of email → customer_id
 * on existing rows, and 302s to /dashboard.
 *
 * On any failure (missing token, bad token, expired token, already used),
 * 302s to /login?status=invalid_link with no cookie set.
 */

import { NextResponse } from 'next/server';
import {
  buildSessionCookie,
  isCustomerAuthConfigured,
} from '@/lib/customer-auth';
import {
  backfillCustomerLinks,
  consumeLinkToken,
  getCustomerProfileById,
  logAuthEvent,
  updateCustomerLastLogin,
} from '@/lib/customer-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clientHints(req: Request): { ip: string | null; ua: string | null } {
  const ua = req.headers.get('user-agent');
  const fwd =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    null;
  const ip = fwd ? fwd.split(',')[0]?.trim() ?? null : null;
  return { ip, ua };
}

function redirectTo(path: string, base: string): NextResponse {
  return NextResponse.redirect(new URL(path, base));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = `${url.protocol}//${url.host}`;

  if (!isCustomerAuthConfigured()) {
    return redirectTo('/login?status=not_configured', base);
  }

  const token = url.searchParams.get('t');
  if (!token || token.length < 32) {
    return redirectTo('/login?status=invalid_link', base);
  }

  const customerId = await consumeLinkToken(token);
  if (!customerId) {
    await logAuthEvent({
      email: 'unknown',
      event_type: 'login_failed',
      metadata: { reason: 'token_invalid_or_expired' },
    });
    return redirectTo('/login?status=invalid_link', base);
  }

  const profile = await getCustomerProfileById(customerId);
  if (!profile || profile.status !== 'active') {
    await logAuthEvent({
      email: profile?.email ?? 'unknown',
      customer_id: customerId,
      event_type: 'login_failed',
      metadata: { reason: 'profile_inactive' },
    });
    return redirectTo('/login?status=invalid_link', base);
  }

  // Idempotent backfill of customer_id across existing rows.
  void backfillCustomerLinks(profile).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[customer/verify] backfillCustomerLinks', err);
  });
  void updateCustomerLastLogin(customerId);

  const cookieSpec = buildSessionCookie(customerId);
  if (!cookieSpec) {
    return redirectTo('/login?status=not_configured', base);
  }

  const { ip, ua } = clientHints(req);
  await logAuthEvent({
    email: profile.email,
    customer_id: customerId,
    event_type: 'login_success',
    ip,
    user_agent: ua,
  });

  const res = redirectTo('/dashboard', base);
  res.cookies.set(cookieSpec.name, cookieSpec.value, cookieSpec.options);
  return res;
}
