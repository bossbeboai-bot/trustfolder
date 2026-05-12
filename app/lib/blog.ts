/**
 * Blog content layer.
 *
 * Posts are typed structured data — no MDX, no external CMS, no markdown
 * parser. Each post is rendered to JSX directly from `sections`. This keeps
 * the build deterministic, removes XSS risk, and forces every post to fit
 * a small repeatable shape that reads consistently.
 *
 * Adding a new post: append a new `BlogPost` object to BLOG_POSTS, place
 * it at the top so the most recent post is first. The slug must be
 * URL-safe and unique.
 */

export type BlogSection =
  | { type: 'h2'; text: string; id?: string }
  | { type: 'h3'; text: string; id?: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; tone?: 'info' | 'warn'; title?: string; text: string }
  | { type: 'quote'; text: string; cite?: string };

export interface BlogPost {
  slug: string;
  title: string;
  /** Plain-English description used for meta + index card. ≤ 160 chars. */
  description: string;
  /** Single-sentence lede shown above the body. */
  lede: string;
  published_at: string; // ISO
  updated_at?: string;  // ISO
  /** 4–8 word tags used for keyword clustering + future filtering. */
  tags: string[];
  /** Time-to-read estimate in minutes. */
  reading_minutes: number;
  /** Structured sections rendered in order by app/app/blog/[slug]/page.tsx. */
  sections: BlogSection[];
}

// Imported lazily to keep this module small + tree-shakeable.
import { BLOG_POSTS } from './blog-posts';

export function listBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => Date.parse(b.published_at) - Date.parse(a.published_at),
  );
}

export function getBlogPost(slug: string): BlogPost | null {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

export function listBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}

export function formatBlogDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
}
