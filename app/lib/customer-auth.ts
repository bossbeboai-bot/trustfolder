/**
 * Customer auth — Phase 5 / Batch 1.
 *
 * Magic-link only. No passwords. Mirrors the structure of `admin-auth.ts`
 * but with a per-customer HMAC cookie so the server knows *which* customer
 * is signed in.
 *
 * Cookie: `tf_customer`
 *   value:   `<exp_unix>.<customer_id>.<hex_hmac_sha256>`
 *   payload: `<exp_unix>.<customer_id>` (signed)
 *   key:     `CUSTOMER_SESSION_SECRET` (server-only env)
 *   flags:   HttpOnly, SameSite=Lax, Secure in prod, Path=/, 30-day TTL
 *
 * Magic-link tokens (separate flow):
 *   - 32 random bytes, hex-encoded → 64-char token in the URL
 *   - DB stores `sha256(token)` only, never the raw token
 *   - 15-minute TTL, single-use
 *   - Issued only for emails already in `requests` / `orders` / `assessments`
 *
 * Hard rules:
 *   - Never log CUSTOMER_SESSION_SECRET, raw tokens, or full email addresses.
 *   - Never expose this lib client-side. Re-export ONLY the helpers needed.
 *   - Admin and customer cookies are independent — `tf_admin` and
 *     `tf_customer` may coexist in a single browser without conflict.
 *   - Every `/dashboard/*` page and every `/api/customer/*` route must call
 *     `requireCustomerSession()` before doing any work.
 */

import { createHmac, timingSafeEqual, randomBytes, createHash } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'tf_customer';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const TOKEN_TTL_SECONDS = 60 * 15;             // 15 minutes
const TOKEN_BYTES = 32;                         // 64 hex chars

export const CUSTOMER_COOKIE_NAME = COOKIE_NAME;
export const CUSTOMER_TOKEN_TTL_SECONDS = TOKEN_TTL_SECONDS;

// =============================================================================
// Internal helpers
// =============================================================================

function getSigningKey(): string | null {
  const secret = (process.env.CUSTOMER_SESSION_SECRET ?? '').trim();
  if (secret.length > 0) return secret;
  // Fall back to ADMIN_SESSION_SECRET only as a last resort so a partially
  // configured env still works in dev. In prod we fail closed on missing key.
  if (process.env.NODE_ENV !== 'production') {
    const fallback = (process.env.ADMIN_SESSION_SECRET ?? '').trim();
    if (fallback.length > 0) return `customer:${fallback}`;
  }
  return null;
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// =============================================================================
// Session cookie
// =============================================================================

export interface CustomerSession {
  customer_id: string;
  exp_unix: number;
}

/**
 * Build a signed cookie value for the given customer + expiry.
 * Returns null if the server is misconfigured (no signing key).
 */
export function signSession(customerId: string, expiryUnixSeconds: number): string | null {
  const key = getSigningKey();
  if (!key) return null;
  if (!isUuid(customerId)) return null;
  const payload = `${expiryUnixSeconds}.${customerId}`;
  const sig = hmacHex(key, payload);
  return `${payload}.${sig}`;
}

/**
 * Verify a cookie value. Returns the parsed session on success, null otherwise.
 */
export function verifySessionCookie(value: string | null | undefined): CustomerSession | null {
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length !== 3) return null;
  const [expStr, customerId, sig] = parts;
  if (!expStr || !customerId || !sig) return null;
  if (!isUuid(customerId)) return null;

  const exp = Number.parseInt(expStr, 10);
  if (!Number.isFinite(exp)) return null;
  if (exp * 1000 <= Date.now()) return null;

  const key = getSigningKey();
  if (!key) return null;
  const expected = hmacHex(key, `${expStr}.${customerId}`);
  if (!constantTimeEqualHex(sig, expected)) return null;

  return { customer_id: customerId, exp_unix: exp };
}

/**
 * Read + verify the customer cookie from the current request context.
 * Server-only. Throws if called outside a Next request context.
 */
export function getCustomerSession(): CustomerSession | null {
  const c = cookies().get(COOKIE_NAME)?.value;
  return verifySessionCookie(c);
}

/**
 * Build a fresh cookie spec for `NextResponse.cookies.set(...)`.
 * Returns null if the signing key is missing or customerId is malformed.
 */
export function buildSessionCookie(customerId: string): {
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
  const value = signSession(customerId, exp);
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
 * Cookie spec that immediately invalidates the customer session.
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
 * Convenience for /api/customer/* routes. Returns 401 JSON response if the
 * caller is not authenticated; otherwise returns { ok: true, session }.
 */
export function requireCustomerApi():
  | { ok: true; session: CustomerSession }
  | { ok: false; status: 401; body: { error: 'unauthorized' } } {
  const session = getCustomerSession();
  if (session) return { ok: true, session };
  return { ok: false, status: 401, body: { error: 'unauthorized' } };
}

// =============================================================================
// Magic-link tokens (raw token + hash helpers)
// =============================================================================

/** Generate a fresh single-use magic-link token. Returns { token, token_hash, expires_at }. */
export function generateMagicLinkToken(): {
  token: string;
  token_hash: string;
  expires_at: Date;
} {
  const token = randomBytes(TOKEN_BYTES).toString('hex');
  const token_hash = sha256Hex(token);
  const expires_at = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);
  return { token, token_hash, expires_at };
}

/** sha256(value) → hex. Used for token_hash storage. */
export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Mask an email address for log lines. `founder@trustfolder.io` → `f***@trustfolder.io`.
 */
export function maskEmailForLog(email: string): string {
  const at = email.indexOf('@');
  if (at < 1) return '***';
  return `${email[0]}***${email.slice(at)}`;
}

export function isCustomerAuthConfigured(): boolean {
  return getSigningKey() !== null;
}
