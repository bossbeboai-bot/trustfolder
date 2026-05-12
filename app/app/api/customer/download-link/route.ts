/**
 * POST /api/customer/download-link
 *
 * Issues a fresh 7-day Supabase Storage signed URL for a pack the signed-in
 * customer owns. The customer is identified by `tf_customer`; the order is
 * identified by `{ order_id }` in the JSON body.
 *
 * Authorisation: the order must belong to the customer (`orders.customer_id`).
 *
 * Storage path is deterministic — see `engine/src/package.ts`:
 *   `orders/<order_id>/trustfolder-pack-<generation_date>.zip`
 * We list the prefix and pick the most recent zip if multiple exist.
 */

import { NextResponse } from 'next/server';
import { service } from '@trustfolder/engine';
import { requireCustomerApi } from '@/lib/customer-auth';
import { getMyOrder } from '@/lib/customer-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SIGNED_URL_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

interface Body {
  order_id?: string;
}

export async function POST(req: Request) {
  const auth = requireCustomerApi();
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const orderId = (body.order_id ?? '').trim();
  if (!orderId) {
    return NextResponse.json({ error: 'missing_order_id' }, { status: 400 });
  }

  // Authorisation: order must belong to me.
  const order = await getMyOrder(auth.session.customer_id, orderId);
  if (!order) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }
  if (!order.delivered_at) {
    return NextResponse.json(
      { error: 'order_not_delivered', status: order.status },
      { status: 409 },
    );
  }

  const sb = service();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'deliveries';
  const prefix = `orders/${orderId}`;

  // Find the zip(s) for this order.
  const { data: list, error: listErr } = await sb.storage.from(bucket).list(prefix, {
    limit: 50,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (listErr) {
    return NextResponse.json(
      { error: 'storage_list_failed', detail: listErr.message },
      { status: 500 },
    );
  }
  const zip = (list ?? []).find((f) => f.name.endsWith('.zip'));
  if (!zip) {
    return NextResponse.json({ error: 'no_pack_zip_in_storage' }, { status: 404 });
  }

  const objectPath = `${prefix}/${zip.name}`;

  const { data: signed, error: signErr } = await sb.storage
    .from(bucket)
    .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS, {
      download: zip.name,
    });
  if (signErr || !signed?.signedUrl) {
    return NextResponse.json(
      { error: 'signed_url_failed', detail: signErr?.message ?? 'no_url' },
      { status: 500 },
    );
  }

  const expiresAt = new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000).toISOString();

  // Update the order row so the next dashboard load shows the fresh URL.
  await sb
    .from('orders')
    .update({
      signed_download_url: signed.signedUrl,
      signed_url_expires_at: expiresAt,
    })
    .eq('id', orderId);

  return NextResponse.json({
    url: signed.signedUrl,
    expires_at: expiresAt,
    file_name: zip.name,
  });
}
