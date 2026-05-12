/**
 * POST /api/paypal/create-order
 *
 * Creates an internal order row + a PayPal order, returning the approve_url
 * the client redirects to. Customer answers are SNAPSHOTTED onto the order
 * row at this point — never lost on payment failure.
 *
 * Inputs:  { assessment_id, tier }
 * Returns: { order_id, paypal_order_id, approve_url, amount_cents, tier }
 */

import { NextResponse } from 'next/server';
import {
  createPaypalOrder,
  priceCentsForTier,
  service,
  transition,
} from '@trustfolder/engine';
import type { Tier } from '@trustfolder/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreateOrderRequest {
  assessment_id: string;
  tier: Tier;
}

export async function POST(req: Request) {
  let body: CreateOrderRequest;
  try {
    body = (await req.json()) as CreateOrderRequest;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.assessment_id || !body.tier) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  // Paid tiers in the automated checkout flow:
  //   tier_2 ($499 disclosure pack)
  //   tier_3 ($999 full evidence folder)
  //
  // tier_0 is free (no checkout). tier_4 is application-only (manual invoice).
  // tier_1 (Lite Readiness Snapshot, $99) is intentionally NOT in instant
  // checkout until `engine/src/snapshot.ts` is implemented — see
  // `docs/24-implementation-gap-audit.md` §4.2. Until then, the snapshot
  // is request-only via /request?type=snapshot.
  if (body.tier === 'tier_1') {
    return NextResponse.json(
      {
        error: 'tier_1_checkout_disabled',
        detail:
          'Snapshot checkout is not live yet. Please request a snapshot at /request?type=snapshot.',
      },
      { status: 400 },
    );
  }
  const ALLOWED_TIERS: ReadonlyArray<string> = ['tier_2', 'tier_3'];
  if (!ALLOWED_TIERS.includes(body.tier)) {
    return NextResponse.json(
      { error: 'unsupported_tier', detail: `tier ${body.tier} not in checkout flow` },
      { status: 400 },
    );
  }

  const sb = service();

  // Read assessment + verify it passed scope check
  const { data: a, error: aErr } = await sb
    .from('assessments')
    .select(
      'id, email, url, extraction_data, questionnaire_data, scope_check_passed, scope_check_band',
    )
    .eq('id', body.assessment_id)
    .single();

  if (aErr || !a) {
    return NextResponse.json({ error: 'assessment_not_found' }, { status: 404 });
  }
  if (a.scope_check_passed === false) {
    return NextResponse.json(
      { error: 'assessment_out_of_scope' },
      { status: 422 },
    );
  }

  const amount_cents = priceCentsForTier(body.tier);
  if (amount_cents <= 0) {
    return NextResponse.json({ error: 'invalid_tier_price' }, { status: 400 });
  }

  // Create internal order with snapshot of assessment data
  const { data: order, error: oErr } = await sb
    .from('orders')
    .insert({
      assessment_id: a.id,
      email: a.email,
      url: a.url ?? '',
      tier: body.tier,
      amount_cents,
      currency: 'usd',
      payment_status: 'pending',
      questionnaire_data: a.questionnaire_data ?? {},
      extraction_data: a.extraction_data ?? {},
      scope_check_passed: a.scope_check_passed,
      scope_check_band: a.scope_check_band,
      status: 'payment_pending',
    })
    .select('id, email, tier, amount_cents')
    .single();

  if (oErr || !order) {
    return NextResponse.json(
      { error: 'order_insert_failed', detail: oErr?.message },
      { status: 500 },
    );
  }

  // Append a status_event for visibility
  await sb.from('order_status_events').insert({
    order_id: order.id,
    from_status: null,
    to_status: 'payment_pending',
    actor: 'api.paypal.create-order',
    metadata: { tier: order.tier, amount_cents: order.amount_cents },
  });

  // Create PayPal order
  const pp = await createPaypalOrder({
    order_id: order.id,
    tier: order.tier,
    amount_cents: order.amount_cents,
    email: order.email,
  });

  if (!pp.ok || !pp.data) {
    return NextResponse.json(
      { error: 'paypal_create_failed', detail: pp.error },
      { status: 502 },
    );
  }

  // Persist paypal_order_id
  await sb
    .from('orders')
    .update({ paypal_order_id: pp.data.paypal_order_id })
    .eq('id', order.id);

  // Touch the status (no-op transition for audit log clarity)
  await transition({
    order_id: order.id,
    to: 'payment_pending',
    actor: 'api.paypal.create-order',
    metadata: { paypal_order_id: pp.data.paypal_order_id },
    force: true,
  });

  return NextResponse.json({
    order_id: order.id,
    paypal_order_id: pp.data.paypal_order_id,
    approve_url: pp.data.approve_url,
    amount_cents: order.amount_cents,
    tier: order.tier,
  });
}
