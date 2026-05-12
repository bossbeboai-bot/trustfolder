'use client';

/**
 * DashboardChrome — sidebar nav + topbar for the customer dashboard.
 * Mirrors the editorial dark palette used by the public site, but in a
 * workspace layout (sidebar instead of marketing top nav).
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

const NAV: ReadonlyArray<readonly [string, string]> = [
  ['Overview', '/dashboard/overview'],
  ['Requests', '/dashboard/requests'],
  ['Orders', '/dashboard/orders'],
  ['Packs', '/dashboard/packs'],
  ['Downloads', '/dashboard/downloads'],
  ['Settings', '/dashboard/settings'],
] as const;

export default function DashboardChrome({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? '';
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/customer/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--tf-bg)] text-[var(--tf-ink)]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-0 lg:flex-row">
        <aside className="border-b border-[var(--tf-border)]/70 bg-[var(--tf-bg-soft)]/70 px-6 py-8 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex-shrink-0 lg:border-b-0 lg:border-r lg:py-12 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[18px] font-semibold tracking-[-0.035em] text-[var(--tf-ink)]"
          >
            TrustFolder
            <span className="rounded-full border border-[var(--tf-border)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--tf-slate)]">
              Workspace
            </span>
          </Link>

          <nav className="mt-10 grid gap-1 lg:mt-12">
            {NAV.map(([label, href]) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    'rounded-xl px-3 py-2.5 text-[15px] transition ' +
                    (active
                      ? 'bg-[var(--tf-surface)] text-[var(--tf-ink)] shadow-[inset_0_0_0_1px_var(--tf-border-strong)]'
                      : 'text-[var(--tf-slate)] hover:bg-[var(--tf-surface)]/60 hover:text-[var(--tf-ink)]')
                  }
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-12 border-t border-[var(--tf-border)] pt-6 text-[13px] text-[var(--tf-slate-soft)]">
            <p className="truncate text-[var(--tf-ink-soft)]" title={email}>
              {email}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 inline-flex items-center gap-2 text-[13px] text-[var(--tf-slate)] hover:text-[var(--tf-ink)]"
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-12 sm:px-8 lg:px-14 lg:py-14">
          {children}
        </main>
      </div>
    </div>
  );
}
