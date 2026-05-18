/**
 * POST /api/request
 *
 * Lead-capture endpoint for paid pack interest, contact requests, and the
 * "Apply for premium handoff" flow. Inserts a row into `requests` (see
 * migration 0002), best-effort sends a `request_received` email, and best-effort
 * notifies the founder. Email + alert never break the form: a missing
 * Resend / ALERT_WEBHOOK_URL just no-ops.
 *
 * Inputs:
 *   {
 *     email: string                       // required
 *     pack_interest?: string              // 'snapshot' | 'pack' | 'governance' | 'agency' | 'premium' | ...
 *     website?: string
 *     company_name?: string
 *     message?: string
 *     source_page?: string                // '/request', '/contact', '/agencies', ...
 *     metadata?: Record<string, unknown>  // utm, referrer, etc
 *   }
 *
 * Returns:
 *   { request_id, status: 'new', expected_reply_window_hours: 24 }
 */

import { NextResponse } from 'next/server';
import {
  createRequest,
  notifyFounder,
  sendRequestReceived,
} from '@trustfolder/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RequestBody {
  email: string;
  pack_interest?: string | null;
  website?: string | null;
  company_name?: string | null;
  message?: string | null;
  source_page?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.email || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'missing_email' }, { status: 400 });
  }

  const inserted = await createRequest({
    email: body.email,
    package_interest: body.pack_interest ?? null,
    website_url: body.website ?? null,
    company_name: body.company_name ?? null,
    message: body.message ?? null,
    source_page: body.source_page ?? null,
    metadata: body.metadata ?? {},
  });

  if (!inserted.ok || !inserted.data) {
    return NextResponse.json(
      { error: 'request_insert_failed', detail: inserted.error },
      { status: 500 },
    );
  }

  const row = inserted.data;

  // Best-effort acknowledgement email — never fail the form on this.
  const emailResult = await sendRequestReceived({
    request_id: row.id,
    to_email: row.email,
    package_interest: row.package_interest,
    website_url: row.website_url,
    company_name: row.company_name,
    message: row.message,
  });
  if (!emailResult.ok) {
    console.error('[request] sendRequestReceived failed', emailResult.error);
  }

  // Best-effort founder alert — never fail the form on this.
  await notifyFounder({
    severity: 'info',
    message: `New request: ${row.package_interest ?? 'unspecified'} (${row.email})`,
    context: {
      request_id: row.id,
      email: row.email,
      website_url: row.website_url,
      company_name: row.company_name,
      package_interest: row.package_interest,
      source_page: row.source_page,
      created_at: row.created_at,
    },
  });

  return NextResponse.json(
    {
      request_id: row.id,
      status: row.status,
      expected_reply_window_hours: 24,
    },
    { status: 200 },
  );
}
