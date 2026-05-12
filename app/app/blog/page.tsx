import Link from 'next/link';
import type { Metadata } from 'next';
import { MarketingShell } from '../_marketing/components/Shell';
import { PrimaryCTA } from '../_marketing/components/Button';
import { TextHero } from '../_marketing/components/TextPage';
import { formatBlogDate, listBlogPosts } from '@/lib/blog';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'AI Governance Readiness Guides - TrustFolder Blog',
  description:
    'Practical guidance for AI founders preparing disclosures, governance docs, and buyer-review materials.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const posts = listBlogPosts();
  const [featured, ...rest] = posts;

  return (
    <MarketingShell>
      <TextHero
        eyebrow="Blog"
        title="Practical AI governance guidance for founders"
        lede="Practical guidance for AI founders preparing disclosures, governance docs, and buyer-review materials."
      />

      {featured && (
        <section className="mx-auto max-w-site px-6 pb-12 md:px-8">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid overflow-hidden rounded-2xl border border-[color:var(--m-border)] bg-[color:var(--m-white)] md:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="bg-[color:var(--m-green)] p-8 text-[color:var(--m-white)] md:p-10">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-white/70">
                Featured guide
              </p>
              <p className="mt-10 max-w-sm font-serif text-[30px] font-semibold leading-tight md:text-[38px]">
                Turn scattered AI claims into reviewable evidence.
              </p>
            </div>
            <div className="p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wideish text-[color:var(--m-subtle)]">
                <span>{formatBlogDate(featured.published_at)}</span>
                <span>-</span>
                <span>{featured.reading_minutes} min read</span>
              </div>
              <h2 className="mt-4 font-serif text-[28px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[34px]">
                {featured.title}
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-[color:var(--m-muted)]">
                {featured.description}
              </p>
              <span className="mt-7 inline-flex text-[14px] font-medium text-[color:var(--m-green)] group-hover:underline">
                Read featured guide
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="mx-auto max-w-site px-6 pb-20 md:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex min-h-[320px] flex-col rounded-lg border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--m-border-mid)]"
            >
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wideish text-[color:var(--m-subtle)]">
                <span>{post.tags[0]}</span>
                <span>-</span>
                <span>{post.reading_minutes} min read</span>
              </div>
              <h2 className="mt-4 font-serif text-[24px] font-semibold leading-tight text-[color:var(--m-black)]">
                {post.title}
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-[color:var(--m-muted)]">
                {post.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-[color:var(--m-border)] bg-[color:var(--m-cream)] px-2 py-1 font-mono text-[10px] text-[color:var(--m-subtle)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="mt-auto pt-8 text-[13px] font-medium text-[color:var(--m-green)] group-hover:underline">
                Read guide
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-site px-6 pb-24 md:px-8">
        <div className="rounded-2xl border border-[color:var(--m-border)] bg-[color:var(--m-green-light)] p-8 md:p-10">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-green-dark)]">
            Start here
          </p>
          <h2 className="mt-3 max-w-2xl font-serif text-[30px] font-semibold leading-tight text-[color:var(--m-black)]">
            Turn your website into a review-ready AI governance folder.
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[color:var(--m-muted)]">
            Run the free check to see whether TrustFolder can prepare a useful draft pack from your public product context.
          </p>
          <div className="mt-7">
            <PrimaryCTA href="/assessment">Run free readiness check</PrimaryCTA>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
