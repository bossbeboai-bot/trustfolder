/**
 * Marketing CTA button primitives.
 * - PrimaryCTA: solid governance green, white text
 * - GhostCTA:   bordered, ink text
 * - TextCTA:    green text link with underline-on-hover
 */

import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type Size = 'md' | 'lg';

const sizeClass: Record<Size, string> = {
  md: 'h-10 px-5 text-[13px]',
  lg: 'h-12 px-7 text-[14px]',
};

interface BaseProps {
  children: ReactNode;
  href: string;
  size?: Size;
  className?: string;
  ariaLabel?: string;
}

export function PrimaryCTA({ children, href, size = 'lg', className = '', ariaLabel }: BaseProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[color:var(--m-green)] font-medium text-[color:var(--m-white)] transition-all duration-200 ease-editorial hover:bg-[color:var(--m-green-dark)] hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--m-green-dark)] ${sizeClass[size]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function GhostCTA({ children, href, size = 'md', className = '', ariaLabel }: BaseProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[color:var(--m-border-mid)] bg-transparent font-medium text-[color:var(--m-black)] transition-colors duration-200 hover:border-[color:var(--m-black)] hover:bg-[color:var(--m-cream)] ${sizeClass[size]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function TextCTA({ children, href, className = '', ariaLabel }: BaseProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 text-[14px] font-medium text-[color:var(--m-green)] underline-offset-4 transition-colors duration-200 hover:underline hover:text-[color:var(--m-green-dark)] ${className}`}
    >
      {children}
    </Link>
  );
}

export function InverseCTA({ children, href, size = 'md', className = '', ariaLabel }: BaseProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-white/50 bg-transparent font-medium text-white transition-colors duration-200 hover:bg-white hover:text-[color:var(--m-green-dark)] ${sizeClass[size]} ${className}`}
    >
      {children}
    </Link>
  );
}

// Keeping a native-button export for completeness even though current usage is Link-only.
interface NativeButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'ghost';
  size?: Size;
}

export function ActionButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: NativeButtonProps) {
  const base =
    variant === 'primary'
      ? 'bg-[color:var(--m-green)] text-[color:var(--m-white)] hover:bg-[color:var(--m-green-dark)]'
      : 'border border-[color:var(--m-border-mid)] text-[color:var(--m-black)] hover:border-[color:var(--m-black)]';
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 ${base} ${sizeClass[size]} ${className}`}
    >
      {children}
    </button>
  );
}
