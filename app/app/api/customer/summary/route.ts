/**
 * GET /api/customer/summary
 *
 * Compact payload for the dashboard Overview tab. Returns at-a-glance counts
 * and the latest snippets for requests / orders / packs.
 */

import { NextResponse } from 'next/server';
import { requireCustomerApi } from '@/lib/customer-auth';
import {
  listMyOrders,
  listMyPacks,
  listMyRequests,
} from '@/lib/customer-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = requireCustomerApi();
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  const [requests, orders, packs] = await Promise.all([
    listMyRequests(auth.session.customer_id, 10),
    listMyOrders(auth.session.customer_id, 10),
    listMyPacks(auth.session.customer_id, 10),
  ]);

  return NextResponse.json({
    counts: {
      requests: requests.length,
      orders: orders.length,
      packs: packs.length,
    },
    latest: {
      request: requests[0] ?? null,
      order: orders[0] ?? null,
      pack: packs[0] ?? null,
    },
  });
}
