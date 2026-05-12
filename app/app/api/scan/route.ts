/**
 * POST /api/scan
 *
 * Step 1 of the customer journey.
 * Inputs: { url, email }
 * Effects:
 *  - Creates a leads row
 *  - Crawls the URL
 *  - Runs Claude extraction
 *  - Creates an assessments row with extraction_data
 *  - Returns assessment_id + extracted summary for the prefilled form
 *
 * Resilience:
 *  - If crawl fails or extraction returns minimal-fallback, we STILL create
 *    the assessment and return an empty extraction so the frontend falls
 *    back to manual questions. Never blocks the user.
 */

import { NextResponse } from 'next/server';
import { crawl, extract, service } from '@trustfolder/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ScanRequest {
  url: string;
  email: string;
}

export async function POST(req: Request) {
  let body: ScanRequest;
  try {
    body = (await req.json()) as ScanRequest;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  // URL is optional — if missing, we skip the crawl and go straight to manual questions
  const url = (body.url ?? '').trim();

  const sb = service();

  // 1. Lead
  const { data: lead, error: leadErr } = await sb
    .from('leads')
    .insert({
      email: body.email,
      url: url || null,
      source: 'free_assessment',
    })
    .select('id')
    .single();
  if (leadErr || !lead) {
    return NextResponse.json(
      { error: 'lead_insert_failed', detail: leadErr?.message },
      { status: 500 },
    );
  }

  // 2. Crawl + extract (best-effort)
  let extraction = null as null | Awaited<ReturnType<typeof extract>>['data'];
  let scan_id: string | null = null;
  let scanOk = false;

  if (url) {
    const crawlRes = await crawl({ url });
    if (crawlRes.ok && crawlRes.data) {
      scanOk = crawlRes.data.ok;
      // Lookup the most recent scan row for this URL (we just inserted it inside crawl())
      const { data: scanRow } = await sb
        .from('website_scans')
        .select('id')
        .eq('url', crawlRes.data.url)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      scan_id = scanRow?.id ?? null;

      const extractRes = await extract({ crawl: crawlRes.data });
      if (extractRes.ok && extractRes.data) {
        extraction = extractRes.data;
      }
    }
  }

  // 3. Create assessment
  const { data: assessment, error: aErr } = await sb
    .from('assessments')
    .insert({
      lead_id: lead.id,
      email: body.email,
      url: url || null,
      scan_id,
      extraction_data: extraction ?? {},
      extraction_confidence: extraction?.confidence ?? 'low',
      extraction_at: extraction ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (aErr || !assessment) {
    return NextResponse.json(
      { error: 'assessment_insert_failed', detail: aErr?.message },
      { status: 500 },
    );
  }

  // 4. Return prefilled summary (small payload — only what the UI needs)
  return NextResponse.json({
    assessment_id: assessment.id,
    scan_ok: scanOk,
    extraction: extraction
      ? {
          company_name: extraction.company_name,
          product_name: extraction.product_name,
          product_description: extraction.product_description,
          ai_features: extraction.ai_features,
          target_users: extraction.target_users,
          b2b_or_b2c: extraction.b2b_or_b2c,
          eu_signals: extraction.eu_signals,
          possible_risk_areas: extraction.possible_risk_areas,
          confidence: extraction.confidence,
          used_fallback_minimal: extraction.used_fallback_minimal,
        }
      : null,
  });
}
