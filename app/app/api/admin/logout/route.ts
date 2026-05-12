/**
 * POST /api/admin/logout
 *
 * Invalidates the admin session cookie. Always succeeds — there's no point
 * in distinguishing between "no cookie" and "had a cookie" for the founder.
 */

import { NextResponse } from 'next/server';
import { buildLogoutCookie } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const cookie = buildLogoutCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
