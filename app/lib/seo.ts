/**
 * Shared SEO helpers — single source of truth for site-wide metadata.
 *
 * Used by:
 *   - app/layout.tsx for the root defaults
 *   - app/sitemap.ts for the sitemap.xml route
 *   - app/robots.ts for /robots.txt
 *   - per-page metadata exports
 *
 * Keep titles ≤ 60 chars and descriptions ≤ 160 chars where reasonable.
 * No legal overclaims. No "compliant" or "guaranteed" language.
 */

import type { Metadata } from 'next';

const RAW_BASE = (process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'https://trustfolder.io').trim();
export const SITE_BASE_URL = RAW_BASE.replace(/\/+$/, '');
export const SITE_NAME = 'TrustFolder';
export const SITE_TAGLINE = 'AI governance documents for B2B AI companies';

export const SITE_DEFAULT_DESCRIPTION =
  'TrustFolder prepares review-ready AI disclosure drafts, governance summaries, evidence trackers, source notes, and buyer/legal handoff documents for B2B AI SaaS companies and AI agencies.';

export const ROBOTS_DEFAULT = {
  index: true,
  follow: true,
  nocache: false,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large' as const,
    'max-snippet': -1,
    'max-video-preview': -1,
  },
};

export interface BuildPageMetadataInput {
  title: string;
  description: string;
  /** Path beginning with `/`, e.g. `/pricing`. Used for canonical + OG URL. */
  path: string;
  /** Override the OG image relative to the base URL. Default `/og-default.png`. */
  ogImagePath?: string;
  /** Set true to no-index (e.g. dashboard, admin, success pages). */
  noindex?: boolean;
}

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const url = `${SITE_BASE_URL}${input.path}`;
  const ogImage = `${SITE_BASE_URL}${input.ogImagePath ?? '/og-default.png'}`;
  const fullTitle = input.title.includes(SITE_NAME)
    ? input.title
    : `${input.title} — ${SITE_NAME}`;

  return {
    title: fullTitle,
    description: input.description,
    alternates: { canonical: url },
    robots: input.noindex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: { index: false, follow: false },
        }
      : ROBOTS_DEFAULT,
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description: input.description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: input.description,
      images: [ogImage],
    },
  };
}

/**
 * Public route map used by sitemap.ts. Each entry must remain crawlable.
 * Dashboard, admin, login, success, checkout-cancel are NOT included —
 * they are handled by the noindex robots meta on those routes.
 */
export const PUBLIC_ROUTES: ReadonlyArray<{
  path: string;
  changefreq: 'weekly' | 'monthly' | 'yearly';
  priority: number;
}> = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/pricing', changefreq: 'weekly', priority: 0.9 },
  { path: '/examples', changefreq: 'monthly', priority: 0.8 },
  { path: '/agencies', changefreq: 'monthly', priority: 0.8 },
  { path: '/safety', changefreq: 'monthly', priority: 0.7 },
  { path: '/contact', changefreq: 'monthly', priority: 0.6 },
  { path: '/blog', changefreq: 'weekly', priority: 0.7 },
  { path: '/assessment', changefreq: 'weekly', priority: 0.6 },
  { path: '/request', changefreq: 'weekly', priority: 0.6 },
  { path: '/terms', changefreq: 'yearly', priority: 0.3 },
  { path: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { path: '/refund', changefreq: 'yearly', priority: 0.3 },
  { path: '/legal', changefreq: 'yearly', priority: 0.3 },
  { path: '/eu-ai-act-transparency-readiness', changefreq: 'monthly', priority: 0.7 },
  { path: '/ai-disclosure-template', changefreq: 'monthly', priority: 0.7 },
  { path: '/ai-governance-documents', changefreq: 'monthly', priority: 0.7 },
  { path: '/soc2-readiness-evidence-pack', changefreq: 'monthly', priority: 0.7 },
  { path: '/gdpr-ai-data-readiness', changefreq: 'monthly', priority: 0.7 },
  { path: '/security-questionnaire-support', changefreq: 'monthly', priority: 0.7 },
  { path: '/iso-42001-readiness', changefreq: 'monthly', priority: 0.7 },
  { path: '/ai-agency-client-handoff', changefreq: 'monthly', priority: 0.7 },
] as const;

export const NOINDEX_PATH_PREFIXES: ReadonlyArray<string> = [
  '/admin',
  '/dashboard',
  '/login',
  '/checkout/',
  '/success/',
  '/api/',
  '/out-of-scope',
];
