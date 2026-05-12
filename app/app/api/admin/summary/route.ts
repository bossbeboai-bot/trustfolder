/**
 * GET /api/admin/summary
 *
 * Returns the founder dashboard summary cards as JSON. Mirrors the data
 * rendered by `/admin` (the protected overview page) so any internal tooling
 * can consume the same shape.
 *
 * Auth: requires a valid `tf_admin` session cookie.
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { getSummary } from '@/lib/admin-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = requireAdminApi();
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  const summary = await getSummary();
  return NextResponse.json(summary);
}
