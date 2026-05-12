/**
 * GET /api/admin/failures
 *
 * Failed pipeline runs and failed/refunded payments. The dashboard renders
 * the same list at /admin/failures.
 *
 * Auth: requires `tf_admin` session cookie.
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { listFailures } from '@/lib/admin-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = requireAdminApi();
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  const url = new URL(req.url);
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam
    ? Math.min(Math.max(Number.parseInt(limitParam, 10) || 0, 1), 500)
    : undefined;

  const rows = await listFailures({ limit });
  return NextResponse.json({ rows, count: rows.length });
}
