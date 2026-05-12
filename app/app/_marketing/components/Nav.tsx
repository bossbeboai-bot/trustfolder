'use client';

/**
 * Sticky marketing nav. Blurs on scroll, collapses to full-screen overlay
 * on mobile. All internal routes preserved.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { GhostCTA, PrimaryCTA } from './Button';

const NAV_LINKS = [
  ['Overview', '/'],
  ['Pricing', '/pricing'],
  ['Examples', '/examples'],
  ['Agencies', '/agencies'],
  ['Safety', '/safety'],
] as const;

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-[color:var(--m-border)] bg-[color:var(--m-white)]/85 backdrop-blur-md'
          : 'border-b border-transparent bg-[color:var(--m-white)]/70'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-site items-center gap-6 px-6 md:px-8">
        <Link href="/" className="shrink-0" aria-label="TrustFolder home">
          <Logo />
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-7 text-[13px] text-[color:var(--m-muted)] md:flex">
          {NAV_LINKS.map(([label, href]) => {
            const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`transition-colors duration-150 hover:text-[color:var(--m-black)] ${
                  isActive ? 'text-[color:var(--m-black)]' : ''
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <GhostCTA href="/examples" size="md">
            See sample pack
          </GhostCTA>
          <PrimaryCTA href="/assessment" size="md">
            Run free check
            <span aria-hidden>{'->'}</span>
          </PrimaryCTA>
        </div>
        <button
          type="button"
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--m-border-mid)] text-[color:var(--m-black)] md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile overlay */}
      {menuOpen ? (
        <div className="fixed inset-0 top-16 z-40 flex flex-col bg-[color:var(--m-white)] md:hidden">
          <nav className="flex flex-col gap-1 px-6 py-6 text-[16px] text-[color:var(--m-black)]">
            {NAV_LINKS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-3 font-medium hover:bg-[color:var(--m-cream)]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3 px-6 pb-10">
            <GhostCTA href="/examples" size="lg" className="w-full">
              See sample pack
            </GhostCTA>
            <PrimaryCTA href="/assessment" size="lg" className="w-full">
              Run free check {'->'}
            </PrimaryCTA>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  );
}
