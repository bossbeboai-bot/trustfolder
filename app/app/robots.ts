import type { MetadataRoute } from 'next';
import { NOINDEX_PATH_PREFIXES, SITE_BASE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...NOINDEX_PATH_PREFIXES],
      },
    ],
    sitemap: `${SITE_BASE_URL}/sitemap.xml`,
    host: SITE_BASE_URL,
  };
}
