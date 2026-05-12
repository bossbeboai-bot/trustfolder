import { SiteChrome } from '../components/SiteChrome';
import { PageHeader } from '../components/MarketingPrimitives';
import ContactForm from './ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — TrustFolder',
  description:
    'Custom scope, partnerships, advisor interest, support, or press. Reach the TrustFolder founder directly.',
};

export default function ContactPage() {
  return (
    <SiteChrome active="contact">
      <PageHeader
        eyebrow="Contact"
        title="Custom scope, partnerships, advisor interest, support, or press."
        lede="The fastest path to a reply is to send your context here. The same form sits behind every founder request, so nothing is lost."
      />

      <section className="mx-auto grid max-w-[1520px] gap-14 px-6 pb-28 pt-14 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-12 lg:pb-32 2xl:px-16">
        <div>
          <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[var(--tf-accent)]">
            What this is for
          </p>
          <ul className="mt-6 space-y-4 text-lg leading-9 text-[var(--tf-slate)]">
            {[
              'Custom scope or pack variations',
              'Partnerships with agencies and studios',
              'Advisor or design-partner interest',
              'Support on a delivered pack',
              'Press, podcasts, and writing requests',
            ].map((row, i) => (
              <li key={row} className="flex items-baseline gap-4">
                <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">{`0${i + 1}`}</span>
                <span>{row}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-[30px] border border-[var(--tf-border-strong)] bg-[var(--tf-surface)] p-8 text-base leading-8 text-[var(--tf-slate)] shadow-[0_22px_80px_rgba(7,17,31,0.1)] backdrop-blur-xl">
            <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--tf-accent)]">
              Reply window
            </p>
            <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[var(--tf-ink)]">A person reads every message.</p>
            <p className="mt-3 text-base leading-8 text-[var(--tf-slate)]">
              We reply within 1 business day. No auto-responder. No queue. The reply is from a
              person on the founding team.
            </p>
          </div>

          <p className="mt-10 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tf-slate-soft)]">
            Not legal advice · Not certification · Not a compliance guarantee
          </p>
        </div>

        <ContactForm />
      </section>
    </SiteChrome>
  );
}
