/**
 * POST /api/customer/logout
 *
 * Clears the `tf_customer` session cookie. Always returns 200.
 * Logs a best-effort audit row when a session was present.
 */

import { NextResponse } from 'next/server';
import { buildLogoutCookie, getCustomerSession } from '@/lib/customer-auth';
import { getCustomerProfileById, logAuthEvent } from '@/lib/customer-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const session = getCustomerSession();
  if (session) {
    const profile = await getCustomerProfileById(session.customer_id);
    if (profile) {
      await logAuthEvent({
        email: profile.email,
        customer_id: profile.id,
        event_type: 'logout',
      });
    }
  }
  const res = NextResponse.json({ ok: true });
  const c = buildLogoutCookie();
  res.cookies.set(c.name, c.value, c.options);
  return res;
}
