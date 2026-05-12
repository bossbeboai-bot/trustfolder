/**
 * POST /api/admin/orders/[id]/reissue-download
 *
 * Phase 8 batch 8 — admin rescue. Generates a fresh signed download URL for
 * an order's most recently uploaded pack and persists it on the order row.
 *
 * Auth: requires `tf_admin` session cookie.
 *
 * Hard rules:
 *  - Service-role only on the server.
 *  - Does NOT re-run generation.
 *  - Does NOT delete or overwrite storage objects.
 *  - Idempotent: calling twice just returns a new signed URL.
 *
 * Returns: { signed_url, expires_at } on success.
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { service, env } from '@trustfolder/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

export async function POST(_req: Request, ctx: RouteParams) {
  const auth = requireAdminApi();
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  const orderId = ctx.params.id;
  if (!orderId) {
    return NextResponse.json({ error: 'missing_order_id' }, { status: 400 });
  }

  const sb = service();
  const bucket = env.supabaseStorageBucket();

  // Look up the order to find the storage object path we previously uploaded.
  const order = await sb
    .from('orders')
    .select('id, email, tier, signed_download_url, signed_url_expires_at, generated_at')
    .eq('id', orderId)
    .maybeSingle();
  if (order.error || !order.data) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }

  // Storage path follows the same convention as engine/src/package.ts.
  const generationDate = order.data.generated_at
    ? new Date(order.data.generated_at).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const objectPath = `orders/${orderId}/trustfolder-pack-${generationDate}.zip`;

  const ttlSeconds = 24 * 60 * 60; // 24h is enough for a manual reissue.
  const { data: urlData, error: urlErr } = await sb.storage
    .from(bucket)
    .createSignedUrl(objectPath, ttlSeconds, {
      download: `trustfolder-pack-${generationDate}.zip`,
    });

  if (urlErr || !urlData?.signedUrl) {
    return NextResponse.json(
      { error: 'signed_url_failed', detail: urlErr?.message ?? 'no_url' },
      { status: 500 },
    );
  }

  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  await sb
    .from('orders')
    .update({
      signed_download_url: urlData.signedUrl,
      signed_url_expires_at: expiresAt,
    })
    .eq('id', orderId);

  return NextResponse.json({
    signed_url: urlData.signedUrl,
    expires_at: expiresAt,
    ttl_seconds: ttlSeconds,
  });
}
