import { SiteChrome } from '../components/SiteChrome';
import { PageHeader, Section } from '../components/MarketingPrimitives';
import type { Metadata } from 'next';

export default function RefundPage() {
  return (
    <SiteChrome>
      <PageHeader
        eyebrow="Refunds"
        title="Refund Policy"
        lede="A starter refund policy. TrustFolder is request-led and founder-reviewed for paid packs. Refund requests are reviewed case by case."
      />

      <Section eyebrow="Service nature" title="Digital, custom-prepared.">
        <p className="text-base leading-8 text-[var(--tf-slate)]">
          TrustFolder packs are digital documents prepared from your website,
          intake, and review notes. Once meaningful custom work has begun on a
          pack, refunds are reviewed individually rather than offered
          automatically.
        </p>
      </Section>

      <Section eyebrow="Before work begins" title="Pre-delivery refund.">
        <p className="text-base leading-8 text-[var(--tf-slate)]">
          If you have paid but generation has not yet started for your pack,
          you can request a full refund by emailing
          <a className="underline" href="mailto:support@trustfolder.com"> support@trustfolder.com</a>.
        </p>
      </Section>

      <Section eyebrow="After delivery" title="Post-delivery refund.">
        <p className="text-base leading-8 text-[var(--tf-slate)]">
          After your pack is delivered, if it does not meet what was promised,
          contact us within 14 days. We will work with you to fix it or, where
          appropriate, issue a refund. Where local law gives you a stronger
          right to a refund, that law applies.
        </p>
      </Section>

      <Section eyebrow="Failed payments" title="Payment failure or reversal.">
        <p className="text-base leading-8 text-[var(--tf-slate)]">
          If a payment fails, is denied, or is reversed by your bank or
          PayPal, your order is paused. We do not deliver a pack against an
          unsuccessful payment. Contact us if you would like help completing
          checkout via a manual invoice.
        </p>
      </Section>

      <Section eyebrow="How to ask" title="Submit a refund request.">
        <p className="text-base leading-8 text-[var(--tf-slate)]">
          Email <a className="underline" href="mailto:support@trustfolder.com">support@trustfolder.com</a>{' '}
          with your order ID, the email used at checkout, and a short
          description of the issue. We will reply within one business day.
        </p>
      </Section>
    </SiteChrome>
  );
}

export const metadata: Metadata = {
  title: 'Refund Policy — TrustFolder',
  description:
    'TrustFolder refund policy: request-led packs, digital service nature, pre and post-delivery rules, and how to contact support.',
};
