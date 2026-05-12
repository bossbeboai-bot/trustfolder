import type { Metadata } from 'next';
import { MarketingShell } from '../_marketing/components/Shell';
import { TextHero } from '../_marketing/components/TextPage';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Product questions, enterprise buyer handoff questions, agency inquiries, and scope questions for sensitive AI modules.',
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <TextHero
        eyebrow="Contact"
        title="Contact TrustFolder about scope, handoff, or fit."
        lede="Product questions, enterprise buyer handoff questions, agency inquiries, and scope questions for sensitive AI modules all start here."
      />

      <section className="mx-auto grid max-w-site gap-10 px-6 pb-24 md:px-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            What this is for
          </p>
          <ul className="mt-6 space-y-4 text-[15px] leading-8 text-[color:var(--m-muted)]">
            {[
              'Product questions before the free check',
              'Enterprise or buyer handoff questions',
              'Agency inquiries and repeatable client delivery',
              'Scope questions for sensitive AI modules',
              'Support on a delivered pack',
            ].map((row, i) => (
              <li key={row} className="flex items-baseline gap-4">
                <span className="font-mono text-[11px] uppercase tracking-wideish text-[color:var(--m-subtle)]">{`0${i + 1}`}</span>
                <span>{row}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border border-[color:var(--m-border)] bg-[color:var(--m-green-light)] p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-green-dark)]">
              Clear routing
            </p>
            <p className="mt-3 text-[15px] leading-7 text-[color:var(--m-muted)]">
              We will tell you clearly if your use case needs expert review rather than an automated pack.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
              Direct email
            </p>
            <a
              href="mailto:aaron.miller198@protonmail.com"
              className="mt-3 inline-flex text-[15px] font-medium text-[color:var(--m-green)] underline-offset-4 hover:underline"
            >
              aaron.miller198@protonmail.com
            </a>
          </div>

          <p className="mt-8 font-mono text-[11px] uppercase tracking-wideish text-[color:var(--m-subtle)]">
            Not legal advice - Not certification - Not a compliance guarantee
          </p>
        </div>

        <ContactForm />
      </section>
    </MarketingShell>
  );
}
