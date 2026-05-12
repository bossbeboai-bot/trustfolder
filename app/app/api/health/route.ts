/**
 * GET /api/health
 *
 * Lightweight production health probe. Returns:
 *   200 { ok: true,  checks: { app: true,  supabase: bool, storage: bool } }
 *   503 { ok: false, checks: { app: true,  supabase: bool, storage: bool } }
 *
 * Never returns secrets, project IDs, schema details, or row data.
 *
 * Used by:
 *   - UptimeRobot / Better Stack on the production domain.
 *   - scripts/qa-production-readiness.mjs
 *   - manual smoke after every deploy.
 *
 * Hard rules:
 *   - No secret values in the response.
 *   - No exception details in the response (only true/false per check).
 *   - Never trust the request to influence which checks run.
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface HealthChecks {
  app: boolean;
  supabase: boolean;
  storage: boolean;
}

async function checkSupabaseAndStorage(): Promise<{ supabase: boolean; storage: boolean }> {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'deliveries';
  if (!url || !serviceKey) return { supabase: false, storage: false };

  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } as const;
  const trimmed = url.replace(/\/+$/, '');

  let supabaseOk = false;
  let storageOk = false;
  try {
    const r = await fetch(`${trimmed}/rest/v1/orders?select=id&limit=0`, {
      method: 'HEAD',
      headers,
      cache: 'no-store',
    });
    supabaseOk = r.status >= 200 && r.status < 500 && r.status !== 401 && r.status !== 403;
  } catch {
    supabaseOk = false;
  }
  try {
    const r = await fetch(`${trimmed}/storage/v1/bucket/${encodeURIComponent(bucket)}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    storageOk = r.status >= 200 && r.status < 300;
  } catch {
    storageOk = false;
  }

  return { supabase: supabaseOk, storage: storageOk };
}

export async function GET() {
  const { supabase, storage } = await checkSupabaseAndStorage();
  const checks: HealthChecks = { app: true, supabase, storage };
  const ok = checks.app && checks.supabase && checks.storage;
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
