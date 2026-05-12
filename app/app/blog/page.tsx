import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteChrome } from '../components/SiteChrome';
import { Card, PageHeader, Section } from '../components/MarketingPrimitives';
import { formatBlogDate, listBlogPosts } from '@/lib/blog';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'AI Governance Readiness Guides — TrustFolder Blog',
  description:
    'Plain-English guides on AI disclosure documents, EU AI Act transparency readiness, AI governance checklists, and buyer due diligence for AI products.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  return (
    <SiteChrome active="product">
      <PageHeader
        eyebrow="Blog"
        title="AI Governance Readiness Guides"
        lede="Plain-English guides for AI startups and agencies preparing disclosures, governance notes, and buyer-review evidence."
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <Card className="flex min-h-[320px] flex-col transition group-hover:-translate-y-1 group-hover:border-[var(--tf-border-strong)]">
                <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
                  <span>{formatBlogDate(post.published_at)}</span>
                  <span>·</span>
                  <span>{post.reading_minutes} min read</span>
                </div>
                <h2 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-[-0.045em] text-[var(--tf-ink)]">
                  {post.title}
                </h2>
                <p className="mt-4 text-base leading-8 text-[var(--tf-slate)]">
                  {post.description}
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--tf-border)] bg-[var(--tf-bg-soft)] px-3 py-1 text-xs text-[var(--tf-slate)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="mt-auto pt-8 text-sm font-medium text-[var(--tf-accent)]">
                  Read guide →
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </SiteChrome>
  );
}
