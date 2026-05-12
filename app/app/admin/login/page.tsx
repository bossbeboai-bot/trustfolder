import LoginForm from './LoginForm';
import type { Metadata } from 'next';
import { hasAdminSessionFromCookies } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin login — TrustFolder',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  // If the founder is already signed in, send them straight to the dashboard.
  if (hasAdminSessionFromCookies()) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-[var(--tf-bg)] text-[var(--tf-ink)]">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16 sm:px-8">
        <div className="rounded-[28px] border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] p-8 shadow-[0_30px_120px_rgba(7,17,31,0.1)] sm:p-10">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--tf-accent)]">
            TrustFolder · admin
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Founder sign-in
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--tf-slate)]">
            Single-seat password. Use the value from <code className="rounded bg-[var(--tf-bg-soft)] px-1.5 py-0.5 text-[12px] text-[var(--tf-ink)]">app/.env.local</code>.
          </p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-[var(--tf-slate-soft)]">
          This area is for founder operations. Customer-facing pages are at{' '}
          <a
            href="/"
            className="underline decoration-[var(--tf-border-strong)] underline-offset-2 hover:text-[var(--tf-ink)]"
          >
            trustfolder
          </a>
          .
        </p>
      </main>
    </div>
  );
}
