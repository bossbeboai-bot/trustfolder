/**
 * Admin auth — Phase 3.6 v1.
 *
 * Single-seat password gating for the founder admin dashboard. No user
 * accounts, no roles, no password reset, no customer auth — that all lives
 * downstream of `docs/21` (Later phase).
 *
 * Auth model:
 *   - `ADMIN_PASSWORD` (server-only env) is the password.
 *   - `ADMIN_SESSION_SECRET` (optional) is the HMAC key for the session
 *     cookie. If unset, we use ADMIN_PASSWORD as the key — rotating the
 *     password automatically invalidates outstanding sessions.
 *   - Cookie value: `<expiry_unix>.<hex_hmac_sha256>`
 *   - Cookie name: `tf_admin`
 *   - HttpOnly, SameSite=Lax, Secure in production, Path=/.
 *   - 30-day TTL.
 *
 * Hard rules:
 *   - Never log ADMIN_PASSWORD or ADMIN_SESSION_SECRET.
 *   - Never expose them client-side.
 *   - Every /admin/* page and every /api/admin/* route must call
 *     `requireAdminSessionFromCookies()` before doing any work.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'tf_admin';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

function getSigningKey(): string | null {
  const secret = (process.env.ADMIN_SESSION_SECRET ?? '').trim();
  if (secret.length > 0) return secret;
  const password = (process.env.ADMIN_PASSWORD ?? '').trim();
  if (password.length > 0) return password;
  return null;
}

function getAdminPassword(): string | null {
  const password = (process.env.ADMIN_PASSWORD ?? '').trim();
  return password.length > 0 ? password : null;
}

function hmacHex(key: string, payload: string): string {
  return createHmac('sha256', key).update(payload).digest('hex');
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Build a signed cookie value for the given expiry. Returns `null` if the
 * server is misconfigured (no signing key available).
 */
export function signSession(expiryUnixSeconds: number): string | null {
  const key = getSigningKey();
  if (!key) return null;
  const sig = hmacHex(key, String(expiryUnixSeconds));
  return `${expiryUnixSeconds}.${sig}`;
}

/**
 * Verify a cookie value. Returns true only when:
 *   - the format is `<exp>.<sig>`
 *   - the signature matches
 *   - the expiry is in the future
 */
export function verifySessionCookie(value: string | null | undefined): boolean {
  if (!value) return false;
  const dot = value.indexOf('.');
  if (dot < 1) return false;
  const expStr = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const exp = Number.parseInt(expStr, 10);
  if (!Number.isFinite(exp)) return false;
  if (exp * 1000 <= Date.now()) return false;

  const key = getSigningKey();
  if (!key) return false;
  const expected = hmacHex(key, expStr);
  return constantTimeEqualHex(sig, expected);
}

/**
 * Constant-time password check. Returns false when either side is missing.
 */
export function checkAdminPassword(submitted: string | null | undefined): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  if (typeof submitted !== 'string' || submitted.length === 0) return false;

  const a = Buffer.from(submitted);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Read the admin cookie from the current request and verify it.
 * Server-only. Throws if called outside a Next request context.
 */
export function hasAdminSessionFromCookies(): boolean {
  const c = cookies().get(COOKIE_NAME)?.value;
  return verifySessionCookie(c);
}

/**
 * Issue a fresh session cookie. Returns the cookie object suitable for
 * `NextResponse.cookies.set(...)`. Returns null when ADMIN_PASSWORD is unset.
 */
export function buildSessionCookie(): {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    sameSite: 'lax';
    path: '/';
    secure: boolean;
    maxAge: number;
  };
} | null {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const value = signSession(exp);
  if (!value) return null;
  return {
    name: COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_TTL_SECONDS,
    },
  };
}

/**
 * Returns a cookie spec that immediately invalidates the admin session.
 */
export function buildLogoutCookie(): {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    sameSite: 'lax';
    path: '/';
    secure: boolean;
    maxAge: 0;
  };
} {
  return {
    name: COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
    },
  };
}

/**
 * Convenience for /api/admin/* routes. Returns 401 JSON response if the
 * caller is not authenticated; otherwise returns null and the route can
 * proceed.
 */
export function requireAdminApi():
  | { ok: true }
  | { ok: false; status: 401; body: { error: string } } {
  if (hasAdminSessionFromCookies()) return { ok: true };
  return { ok: false, status: 401, body: { error: 'unauthorized' } };
}

export function isAdminConfigured(): boolean {
  return getAdminPassword() !== null;
}
