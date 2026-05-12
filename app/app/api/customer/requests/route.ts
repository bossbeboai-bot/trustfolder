import { NextResponse } from 'next/server';
import { requireCustomerApi } from '@/lib/customer-auth';
import { listMyRequests } from '@/lib/customer-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = requireCustomerApi();
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });
  const rows = await listMyRequests(auth.session.customer_id);
  return NextResponse.json({ rows, count: rows.length });
}
