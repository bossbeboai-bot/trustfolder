import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MarketingShell } from '../../_marketing/components/Shell';
import { GhostCTA, PrimaryCTA } from '../../_marketing/components/Button';
import {
  cleanBlogText,
  formatBlogDate,
  getBlogPost,
  listBlogSlugs,
} from '@/lib/blog';
import { buildPageMetadata } from '@/lib/seo';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return listBlogSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) {
    return buildPageMetadata({
      title: 'AI Governance Readiness Guide Not Found',
      description: 'This TrustFolder guide could not be found.',
      path: '/blog',
      noindex: true,
    });
  }

  return buildPageMetadata({
    title: post.title,
    description: cleanBlogText(post.description),
    path: `/blog/${post.slug}`,
  });
}

export default function BlogPostPage({ params }: { params: Params }) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <MarketingShell>
      <article className="mx-auto max-w-[880px] px-6 py-16 md:px-8 md:py-24">
        <Link
          href="/blog"
          className="font-mono text-[11px] uppercase tracking-widest2 text-[color:var(--m-green)] hover:text-[color:var(--m-green-dark)]"
        >
          Back to guides
        </Link>

        <header className="mt-8 border-b border-[color:var(--m-border)] pb-10">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wideish text-[color:var(--m-subtle)]">
            <span>{formatBlogDate(post.published_at)}</span>
            <span>-</span>
            <span>{post.reading_minutes} min read</span>
          </div>
          <h1 className="mt-5 font-serif text-[38px] font-semibold leading-[1.06] text-[color:var(--m-black)] md:text-[58px]">
            {cleanBlogText(post.title)}
          </h1>
          <p className="mt-6 text-[18px] leading-8 text-[color:var(--m-muted)]">
            {cleanBlogText(post.lede)}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-[color:var(--m-border)] bg-[color:var(--m-cream)] px-2 py-1 font-mono text-[10px] text-[color:var(--m-subtle)]"
              >
                {cleanBlogText(tag)}
              </span>
            ))}
          </div>
        </header>

        <div className="mt-10 space-y-7">
          {post.sections.map((section, index) => {
            if (section.type === 'h2') {
              return (
                <h2
                  key={index}
                  id={section.id}
                  className="pt-5 font-serif text-[30px] font-semibold leading-tight text-[color:var(--m-black)]"
                >
                  {cleanBlogText(section.text)}
                </h2>
              );
            }
            if (section.type === 'h3') {
              return (
                <h3
                  key={index}
                  id={section.id}
                  className="pt-3 text-[22px] font-semibold leading-tight text-[color:var(--m-black)]"
                >
                  {cleanBlogText(section.text)}
                </h3>
              );
            }
            if (section.type === 'p') {
              return (
                <p key={index} className="text-[17px] leading-8 text-[color:var(--m-muted)]">
                  {cleanBlogText(section.text)}
                </p>
              );
            }
            if (section.type === 'ul') {
              return (
                <ul key={index} className="space-y-3 pl-5 marker:text-[color:var(--m-green)]">
                  {section.items.map((item) => (
                    <li key={item} className="text-[16px] leading-8 text-[color:var(--m-muted)]">
                      {cleanBlogText(item)}
                    </li>
                  ))}
                </ul>
              );
            }
            if (section.type === 'ol') {
              return (
                <ol key={index} className="space-y-3 pl-5 marker:font-mono marker:text-[color:var(--m-green)]">
                  {section.items.map((item) => (
                    <li key={item} className="text-[16px] leading-8 text-[color:var(--m-muted)]">
                      {cleanBlogText(item)}
                    </li>
                  ))}
                </ol>
              );
            }
            if (section.type === 'quote') {
              return (
                <blockquote
                  key={index}
                  className="rounded-2xl border border-[color:var(--m-border)] bg-[color:var(--m-cream)] p-6 text-[19px] leading-8 text-[color:var(--m-black)]"
                >
                  <p>{cleanBlogText(section.text)}</p>
                  {section.cite && (
                    <footer className="mt-4 font-mono text-[11px] uppercase tracking-wideish text-[color:var(--m-subtle)]">
                      {cleanBlogText(section.cite)}
                    </footer>
                  )}
                </blockquote>
              );
            }
            return (
              <div
                key={index}
                className={`rounded-2xl border p-6 ${
                  section.tone === 'warn'
                    ? 'border-[color:var(--m-amber)] bg-[color:var(--m-amber-light)]'
                    : 'border-[color:var(--m-border)] bg-[color:var(--m-green-light)]'
                }`}
              >
                {section.title && (
                  <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-green-dark)]">
                    {cleanBlogText(section.title)}
                  </p>
                )}
                <p className="mt-3 text-[15px] leading-8 text-[color:var(--m-muted)]">
                  {cleanBlogText(section.text)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-14 rounded-2xl border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-7">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            Scope note
          </p>
          <p className="mt-3 text-[14px] leading-7 text-[color:var(--m-muted)]">
            TrustFolder prepares drafts for review. It is not legal advice, certification, or a compliance guarantee.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-[color:var(--m-border)] bg-[color:var(--m-green-light)] p-7">
          <h2 className="font-serif text-[30px] font-semibold leading-tight text-[color:var(--m-black)]">
            Want to see what TrustFolder would prepare for your AI product?
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[color:var(--m-muted)]">
            Run the free check. We scan your AI product website, ask a few confirmation questions, and show the recommended next step.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PrimaryCTA href="/assessment">Run free check</PrimaryCTA>
            <GhostCTA href="/examples" size="lg">See sample documents</GhostCTA>
          </div>
        </div>
      </article>
    </MarketingShell>
  );
}
