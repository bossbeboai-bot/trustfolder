import type { Metadata } from 'next';
import { MarketingShell } from '../_marketing/components/Shell';
import { TextHero, TextPageBody, TextSection } from '../_marketing/components/TextPage';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'TrustFolder refund policy: automated packs, request-led premium work, digital service nature, pre and post-delivery rules, and how to contact support.',
};

export default function RefundPage() {
  return (
    <MarketingShell>
      <TextHero
        eyebrow="Refunds"
        title="Refund Policy"
        lede="A starter refund policy for automated packs and request-led premium work. Refund requests are reviewed case by case."
      />

      <TextPageBody>
        <TextSection eyebrow="Service nature" title="Digital, custom-prepared.">
          <p>
            TrustFolder packs are digital documents prepared from your website, intake, and review notes. Once meaningful custom work has begun on a
            pack, refunds are reviewed individually rather than offered automatically.
          </p>
        </TextSection>

        <TextSection eyebrow="Before work begins" title="Pre-delivery refund.">
          <p>
            If you have paid but generation has not yet started for your pack, you can request a full refund by emailing{' '}
            <a className="text-[color:var(--m-green)] underline" href="mailto:support@trustfolder.com">support@trustfolder.com</a>.
          </p>
        </TextSection>

        <TextSection eyebrow="After delivery" title="Post-delivery refund.">
          <p>
            After your pack is delivered, if it does not meet what was promised, contact us within 14 days. We will work with you to fix it or,
            where appropriate, issue a refund. Where local law gives you a stronger right to a refund, that law applies.
          </p>
        </TextSection>

        <TextSection eyebrow="Failed payments" title="Payment failure or reversal.">
          <p>
            If a payment fails, is denied, or is reversed by your bank or PayPal, your order is paused. We do not deliver a pack against an
            unsuccessful payment. Contact us if you would like help completing checkout via a manual invoice.
          </p>
        </TextSection>

        <TextSection eyebrow="How to ask" title="Submit a refund request.">
          <p>
            Email <a className="text-[color:var(--m-green)] underline" href="mailto:support@trustfolder.com">support@trustfolder.com</a>{' '}
            with your order ID, the email used at checkout, and a short description of the issue. We will reply within one business day.
          </p>
        </TextSection>
      </TextPageBody>
    </MarketingShell>
  );
}
