import type { Metadata } from 'next';
import './globals.css';
import type { ReactNode } from 'react';
import { ROBOTS_DEFAULT, SITE_BASE_URL, SITE_DEFAULT_DESCRIPTION, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_BASE_URL),
  title: {
    default: `${SITE_NAME} — AI Governance Documents for B2B AI Companies`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: ROBOTS_DEFAULT,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
