import type { Metadata } from 'next';
import './globals.css';
import type { ReactNode } from 'react';
import { Fraunces, DM_Sans, DM_Mono } from 'next/font/google';
import { ROBOTS_DEFAULT, SITE_BASE_URL, SITE_DEFAULT_DESCRIPTION, SITE_NAME } from '@/lib/seo';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_BASE_URL),
  title: {
    default: `${SITE_NAME} - Review-ready AI governance evidence folders`,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: ROBOTS_DEFAULT,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'TrustFolder' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-default.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo-trustfolder.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo-trustfolder.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
