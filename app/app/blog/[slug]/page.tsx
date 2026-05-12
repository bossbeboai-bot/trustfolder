import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SiteChrome } from '../../components/SiteChrome';
import { Card, ScopeNote } from '../../components/MarketingPrimitives';
import { formatBlogDate, getBlogPost, listBlogSlugs } from '@/lib/blog';
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
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

export default function BlogPostPage({ params }: { params: Params }) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <SiteChrome active="product">
      <main className="mx-auto max-w-[1040px] px-6 py-20 sm:px-8 lg:px-12 lg:py-28 2xl:px-16">
        <Link
          href="/blog"
          className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-accent)] hover:text-[var(--tf-accent-deep)]"
        >
          ← AI Governance Readiness Guides
        </Link>

        <header className="mt-10 border-b border-[var(--tf-border)] pb-12">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
            <span>{formatBlogDate(post.published_at)}</span>
            <span>·</span>
            <span>{post.reading_minutes} min read</span>
          </div>
          <h1 className="mt-6 text-balance text-[clamp(3rem,6vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.065em] text-[var(--tf-ink)]">
            {post.title}
          </h1>
          <p className="mt-7 max-w-3xl text-xl leading-9 text-[var(--tf-slate)]">
            {post.lede}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--tf-border)] bg-[var(--tf-bg-soft)] px-3 py-1 text-xs text-[var(--tf-slate)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <article className="prose prose-invert mt-12 max-w-none prose-headings:tracking-[-0.035em] prose-p:text-[var(--tf-slate)] prose-li:text-[var(--tf-slate)]">
          {post.sections.map((section, index) => {
            if (section.type === 'h2') {
              return (
                <h2 key={index} id={section.id} className="mt-14 text-3xl font-semibold text-[var(--tf-ink)]">
                  {section.text}
                </h2>
              );
            }
            if (section.type === 'h3') {
              return (
                <h3 key={index} id={section.id} className="mt-10 text-2xl font-semibold text-[var(--tf-ink)]">
                  {section.text}
                </h3>
              );
            }
            if (section.type === 'p') {
              return (
                <p key={index} className="text-lg leading-9 text-[var(--tf-slate)]">
                  {section.text}
                </p>
              );
            }
            if (section.type === 'ul') {
              return (
                <ul key={index} className="my-6 space-y-3 pl-0">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 text-lg leading-8 text-[var(--tf-slate)]">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tf-accent)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            if (section.type === 'ol') {
              return (
                <ol key={index} className="my-6 space-y-3 pl-0">
                  {section.items.map((item, itemIndex) => (
                    <li key={item} className="flex gap-4 text-lg leading-8 text-[var(--tf-slate)]">
                      <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
                        {String(itemIndex + 1).padStart(2, '0')}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              );
            }
            if (section.type === 'quote') {
              return (
                <blockquote
                  key={index}
                  className="my-8 rounded-[28px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-7 text-xl leading-9 text-[var(--tf-ink-soft)]"
                >
                  <p>{section.text}</p>
                  {section.cite && (
                    <footer className="mt-4 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
                      {section.cite}
                    </footer>
                  )}
                </blockquote>
              );
            }
            return (
              <Card key={index} className={section.tone === 'warn' ? 'border-[#cdb47a]/50 bg-[var(--tf-warning-soft)]/60' : ''}>
                {section.title && (
                  <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
                    {section.title}
                  </p>
                )}
                <p className="mt-3 text-lg leading-8 text-[var(--tf-slate)]">{section.text}</p>
              </Card>
            );
          })}
        </article>

        <div className="mt-16">
          <ScopeNote />
        </div>

        <div className="mt-12 rounded-[32px] border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] p-8 sm:p-10">
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
            Next step
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--tf-ink)]">
            Want to see what TrustFolder would prepare for your AI product?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--tf-slate)]">
            Run the free check. We scan your AI product website, ask a few confirmation questions,
            and show the recommended next step.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/assessment"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--tf-ink)] px-6 text-sm font-medium text-[var(--tf-on-light)] transition hover:bg-[var(--tf-ink-soft)]"
            >
              Run free check
            </Link>
            <Link
              href="/examples"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--tf-border-strong)] px-6 text-sm font-medium text-[var(--tf-ink)] transition hover:bg-[var(--tf-bg-soft)]"
            >
              See sample documents
            </Link>
          </div>
        </div>
      </main>
    </SiteChrome>
  );
}
