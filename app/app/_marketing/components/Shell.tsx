/**
 * Shell — applies the marketing light theme wrapper and binds Nav + Footer
 * so each page stays a simple composition of sections.
 */

import type { ReactNode } from 'react';
import { Nav } from './Nav';
import { Footer } from './Footer';

interface ShellProps {
  children: ReactNode;
}

export function MarketingShell({ children }: ShellProps) {
  return (
    <div className="tf-marketing min-h-screen">
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
