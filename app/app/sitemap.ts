import type { MetadataRoute } from 'next';
import { PUBLIC_ROUTES, SITE_BASE_URL } from '@/lib/seo';
import { listBlogPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((r) => ({
    url: `${SITE_BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changefreq,
    priority: r.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = listBlogPosts().map((p) => ({
    url: `${SITE_BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at ?? p.published_at),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticEntries, ...blogEntries];
}
