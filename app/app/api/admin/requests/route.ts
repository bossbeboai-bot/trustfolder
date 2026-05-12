/**
 * GET /api/admin/requests
 *
 * Returns inbound `requests` rows for the founder admin dashboard. Optional
 * `?status=` query filters by status (`new` | `contacted` | `qualified` |
 * `converted` | `closed_lost`).
 *
 * Auth: requires a valid `tf_admin` session cookie.
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { listRequests, type AdminRequestStatus } from '@/lib/admin-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_STATUSES: AdminRequestStatus[] = [
  'new',
  'contacted',
  'qualified',
  'converted',
  'closed_lost',
];

export async function GET(req: Request) {
  const auth = requireAdminApi();
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  const url = new URL(req.url);
  const rawStatus = url.searchParams.get('status');
  const limitParam = url.searchParams.get('limit');

  const status = VALID_STATUSES.includes(rawStatus as AdminRequestStatus)
    ? (rawStatus as AdminRequestStatus)
    : undefined;

  const limit = limitParam ? Math.min(Math.max(Number.parseInt(limitParam, 10) || 0, 1), 500) : undefined;

  const rows = await listRequests({ status, limit });
  return NextResponse.json({ rows, count: rows.length });
}
