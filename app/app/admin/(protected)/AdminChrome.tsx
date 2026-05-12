'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV: Array<{ label: string; href: string }> = [
  { label: 'Overview', href: '/admin' },
  { label: 'Requests', href: '/admin/requests' },
  { label: 'Assessments', href: '/admin/assessments' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Failures', href: '/admin/failures' },
  { label: 'Out-of-scope', href: '/admin/out-of-scope' },
];

export default function AdminChrome() {
  const pathname = usePathname();

  async function logout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      /* ignore */
    } finally {
      window.location.href = '/admin/login';
    }
  }

  return (
    <header className="border-b border-[var(--tf-border)] bg-[var(--tf-surface)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm font-semibold tracking-[-0.03em]">
            TrustFolder · admin
          </Link>
          <span className="rounded-full border border-[var(--tf-border)] px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-[var(--tf-slate)]">
            v1
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--tf-slate)]">
          {NAV.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition hover:text-[var(--tf-ink)] ${
                  isActive ? 'text-[var(--tf-ink)]' : ''
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] px-3 py-1 text-xs font-medium text-[var(--tf-ink)] transition hover:bg-[var(--tf-bg-soft)]"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
