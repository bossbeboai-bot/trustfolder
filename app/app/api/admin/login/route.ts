/**
 * POST /api/admin/login
 *
 * Single-seat admin password login. On success, sets the HMAC-signed
 * `tf_admin` cookie (HttpOnly, SameSite=Lax, Secure in production).
 * Always responds in constant-time-ish to avoid timing oracles on the
 * password compare path.
 *
 * Body:  { password: string }
 * 200    { ok: true }
 * 400    { error: 'invalid_body' }
 * 401    { error: 'invalid_password' }
 * 500    { error: 'admin_not_configured' }
 */

import { NextResponse } from 'next/server';
import {
  buildSessionCookie,
  checkAdminPassword,
  isAdminConfigured,
} from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LoginBody {
  password?: unknown;
}

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'admin_not_configured' }, { status: 500 });
  }

  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const submitted = typeof body.password === 'string' ? body.password : '';
  if (!checkAdminPassword(submitted)) {
    return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
  }

  const cookie = buildSessionCookie();
  if (!cookie) {
    return NextResponse.json({ error: 'admin_not_configured' }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
