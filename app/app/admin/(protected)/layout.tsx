import { redirect } from 'next/navigation';
import { hasAdminSessionFromCookies, isAdminConfigured } from '@/lib/admin-auth';
import AdminChrome from './AdminChrome';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — TrustFolder',
  robots: { index: false, follow: false },
};

// Always re-evaluate auth on each request. Admin pages are not cacheable.
export const dynamic = 'force-dynamic';

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  // Auth gate. Server-side. Redirects before any data is fetched or rendered.
  if (!isAdminConfigured()) {
    return (
      <div className="min-h-screen bg-[var(--tf-bg)] text-[var(--tf-ink)]">
        <main className="mx-auto max-w-2xl px-6 py-24 sm:px-8">
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">
            Admin not configured
          </h1>
          <p className="mt-5 text-base leading-7 text-[var(--tf-slate)]">
            Set <code className="rounded bg-[var(--tf-bg-soft)] px-1.5 py-0.5 text-[12px]">ADMIN_PASSWORD</code> in
            <code className="ml-1 rounded bg-[var(--tf-bg-soft)] px-1.5 py-0.5 text-[12px]">app/.env.local</code>{' '}
            and restart the server.
          </p>
        </main>
      </div>
    );
  }

  if (!hasAdminSessionFromCookies()) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[var(--tf-bg)] text-[var(--tf-ink)]">
      <AdminChrome />
      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
