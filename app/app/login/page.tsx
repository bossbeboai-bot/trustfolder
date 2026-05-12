import type { Metadata } from 'next';
import { SiteChrome } from '@/app/components/SiteChrome';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign in — TrustFolder',
  description:
    'Sign in to your TrustFolder dashboard with a magic link. We email a one-time link if your address is linked to a TrustFolder request.',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const status = searchParams?.status ?? null;
  return (
    <SiteChrome>
      <section className="mx-auto max-w-[1180px] px-6 py-24 sm:px-8 lg:px-12 2xl:px-16">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--tf-accent)]">
              Customer sign-in
            </p>
            <h1 className="mt-5 text-[56px] font-semibold leading-[1.05] tracking-[-0.025em] text-[var(--tf-ink)] sm:text-[68px]">
              Open your TrustFolder dashboard.
            </h1>
            <p className="mt-6 max-w-[36rem] text-[18px] leading-[1.55] text-[var(--tf-slate)]">
              We use magic-link sign-in. Enter the email you used for your free check or paid
              request and we&apos;ll send a one-time sign-in link. The link expires in 15 minutes.
            </p>
            <ul className="mt-10 space-y-3 text-[15px] text-[var(--tf-slate-soft)]">
              <li className="flex items-start gap-3">
                <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--tf-accent)]" />
                No passwords. We don&apos;t store one.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--tf-accent)]" />
                Sign-in links are single-use and expire in 15 minutes.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--tf-accent)]" />
                Only addresses linked to a TrustFolder request can sign in.
              </li>
            </ul>
          </div>

          <div className="rounded-[28px] border border-[var(--tf-border)] bg-[var(--tf-surface)] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <LoginForm initialStatus={status} />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
