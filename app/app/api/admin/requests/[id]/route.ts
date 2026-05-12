/**
 * PATCH /api/admin/requests/[id]
 *
 * Updates a single `requests` row from the founder admin UI.
 * Currently supports two fields:
 *   - status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed_lost'
 *   - internal_note: string | null
 *
 * Auth: requires a valid `tf_admin` session cookie.
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { updateRequest, type AdminRequestStatus } from '@/lib/admin-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_STATUSES: AdminRequestStatus[] = [
  'new',
  'contacted',
  'qualified',
  'converted',
  'closed_lost',
];

interface PatchBody {
  status?: unknown;
  internal_note?: unknown;
}

export async function PATCH(
  req: Request,
  context: { params: { id: string } },
) {
  const auth = requireAdminApi();
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  const { id } = context.params;
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const patch: { status?: AdminRequestStatus; internal_note?: string | null } = {};

  if (typeof body.status === 'string') {
    if (!VALID_STATUSES.includes(body.status as AdminRequestStatus)) {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
    }
    patch.status = body.status as AdminRequestStatus;
  }

  if ('internal_note' in body) {
    if (body.internal_note === null) {
      patch.internal_note = null;
    } else if (typeof body.internal_note === 'string') {
      const trimmed = body.internal_note.trim();
      patch.internal_note = trimmed.length === 0 ? null : trimmed.slice(0, 4000);
    } else {
      return NextResponse.json({ error: 'invalid_internal_note' }, { status: 400 });
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'no_changes' }, { status: 400 });
  }

  const result = await updateRequest(id, patch);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ row: result.data });
}
