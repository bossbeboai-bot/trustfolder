import type { Metadata } from 'next';
import { MarketingShell } from '../_marketing/components/Shell';
import { TextHero, TextList, TextPageBody, TextSection } from '../_marketing/components/TextPage';

export const metadata: Metadata = {
  title: 'Privacy Notice',
  description:
    'TrustFolder privacy notice: what data is collected, who processes it, and how to contact us about retention or deletion. Starter document for review by counsel.',
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <TextHero
        eyebrow="Privacy"
        title="Privacy Notice"
        lede="A starter privacy notice. It describes the data TrustFolder collects today and the providers that help us run the service. It is not legal advice and should be reviewed by counsel before scale."
      />

      <TextPageBody>
        <TextSection eyebrow="What we collect" title="The data TrustFolder collects.">
          <TextList>
            <li>Contact details you provide (email, optional company name, optional role).</li>
            <li>Website URL and public site content we read with your authorization to prepare a pack.</li>
            <li>Intake answers you submit during the assessment or in a request.</li>
            <li>Any documents or notes you choose to share with us.</li>
            <li>Order metadata for paid packs (tier, amount, payment status - never card numbers).</li>
          </TextList>
        </TextSection>

        <TextSection eyebrow="Who processes data" title="Sub-processors we use today.">
          <TextList>
            <li>Vercel - hosting for the Next.js app.</li>
            <li>Supabase - database and storage for orders, packs, and customer accounts.</li>
            <li>PayPal - payment processing. PayPal handles card data; TrustFolder never sees card numbers.</li>
            <li>Resend - transactional email (request received, magic link, pack delivered, etc.).</li>
            <li>The configured AI provider (Anthropic by default, or a hosted Ollama-compatible model). Used only on demand to generate readiness drafts from the data above.</li>
          </TextList>
        </TextSection>

        <TextSection eyebrow="Why we use it" title="What the data is used for.">
          <TextList>
            <li>Run the free eligibility check.</li>
            <li>Prepare the requested pack.</li>
            <li>Send transactional emails about your request, payment, or pack.</li>
            <li>Improve TrustFolder&rsquo;s safety boundaries (forbidden phrase scans, scope routing).</li>
            <li>Support and customer service.</li>
          </TextList>
          <p className="mt-6">
            We do not sell personal data. We do not run ad-tech tracking on customer-only surfaces.
          </p>
        </TextSection>

        <TextSection eyebrow="Retention" title="How long data stays.">
          <p>
            We retain order and pack records as long as the customer account is active and for a reasonable period after, so that we can support
            questions about a delivered pack. To request deletion, email{' '}
            <a className="text-[color:var(--m-green)] underline" href="mailto:support@trustfolder.com">support@trustfolder.com</a>.
          </p>
        </TextSection>

        <TextSection eyebrow="Your choices" title="Access, correction, deletion.">
          <p>
            You can ask for a copy of the data we hold about you, ask us to correct it, or ask us to delete it. Some retention obligations may
            apply to financial records.
          </p>
        </TextSection>

        <TextSection eyebrow="Contact" title="Questions or a privacy request.">
          <p>
            Email <a className="text-[color:var(--m-green)] underline" href="mailto:support@trustfolder.com">support@trustfolder.com</a>.
          </p>
        </TextSection>
      </TextPageBody>
    </MarketingShell>
  );
}
