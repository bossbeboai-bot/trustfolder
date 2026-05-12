/**
 * Dashboard layout — auth gate.
 *
 * Every /dashboard/* route checks the `tf_customer` cookie server-side
 * and redirects to /login if absent or expired. The signed-in customer's
 * email is passed into the chrome so the sidebar can render it.
 */

import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customer-auth';
import { getCustomerProfileById } from '@/lib/customer-data';
import DashboardChrome from './DashboardChrome';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = getCustomerSession();
  if (!session) {
    redirect('/login');
  }
  const profile = await getCustomerProfileById(session.customer_id);
  if (!profile || profile.status !== 'active') {
    redirect('/login?status=invalid_link');
  }
  return <DashboardChrome email={profile.email}>{children}</DashboardChrome>;
}
