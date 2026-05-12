/**
 * /api/customer/me
 *
 * GET:   returns the signed-in customer's profile (no PII beyond their own email).
 * PATCH: updates display_name / company_name / website_url / notification_opt_in.
 */

import { NextResponse } from 'next/server';
import { service } from '@trustfolder/engine';
import { requireCustomerApi } from '@/lib/customer-auth';
import { getCustomerProfileById, logAuthEvent } from '@/lib/customer-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = requireCustomerApi();
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  const profile = await getCustomerProfileById(auth.session.customer_id);
  if (!profile) return NextResponse.json({ error: 'profile_not_found' }, { status: 404 });
  return NextResponse.json({ profile });
}

interface PatchBody {
  display_name?: string | null;
  company_name?: string | null;
  website_url?: string | null;
  notification_opt_in?: boolean;
}

function clean(value: unknown, max = 200): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined as unknown as null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, max);
}

export async function PATCH(req: Request) {
  const auth = requireCustomerApi();
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if ('display_name' in body) patch.display_name = clean(body.display_name);
  if ('company_name' in body) patch.company_name = clean(body.company_name);
  if ('website_url' in body) patch.website_url = clean(body.website_url, 500);
  if (typeof body.notification_opt_in === 'boolean') {
    patch.notification_opt_in = body.notification_opt_in;
  }

  // Drop accidental `undefined` from clean() returning a sentinel.
  for (const k of Object.keys(patch)) {
    if (patch[k] === undefined) delete patch[k];
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'no_changes' }, { status: 400 });
  }

  const sb = service();
  const updated = await sb
    .from('customer_profiles')
    .update(patch)
    .eq('id', auth.session.customer_id)
    .select('*')
    .maybeSingle();

  if (updated.error || !updated.data) {
    return NextResponse.json(
      { error: 'profile_update_failed', detail: updated.error?.message },
      { status: 500 },
    );
  }

  await logAuthEvent({
    email: (updated.data as { email: string }).email,
    customer_id: auth.session.customer_id,
    event_type: 'profile_updated',
    metadata: { fields: Object.keys(patch) },
  });

  return NextResponse.json({ profile: updated.data });
}
