import type { Metadata } from 'next';
import { MarketingShell } from '../_marketing/components/Shell';
import { TextHero, TextList, TextPageBody, TextSection } from '../_marketing/components/TextPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'TrustFolder terms of service: service description, acceptable use, payment, liability placeholder, and contact. Starter document for review by counsel.',
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <TextHero
        eyebrow="Terms"
        title="Terms of Service"
        lede="A starter document. These terms describe how TrustFolder is offered today and the limits we ask customers to respect. They are not lawyer-grade and should be reviewed by counsel before any meaningful scale."
      />

      <TextPageBody>
        <TextSection eyebrow="Service" title="What TrustFolder is.">
          <p>
            TrustFolder prepares review-ready AI governance and disclosure readiness drafts and evidence material for B2B AI companies. It
            helps organize information for buyer, internal, and legal review. It is not legal advice. It is not certification. It is not a
            compliance guarantee. Final decisions about whether a document is fit for use belong with your team and with qualified counsel.
          </p>
        </TextSection>

        <TextSection eyebrow="Your responsibility" title="What you agree to.">
          <TextList>
            <li>Provide accurate information about your AI product and its use.</li>
            <li>Review every TrustFolder draft before sharing it externally.</li>
            <li>Use TrustFolder only for AI products and governance contexts you control or are authorized to represent.</li>
            <li>Have qualified counsel review legal-impact drafts before use.</li>
            <li>Comply with all laws that apply to your business.</li>
          </TextList>
        </TextSection>

        <TextSection eyebrow="Acceptable use" title="What you agree not to do.">
          <TextList>
            <li>Do not use TrustFolder to prepare materials for products you do not have rights to represent.</li>
            <li>Do not use TrustFolder to mislead users, regulators, buyers, or auditors.</li>
            <li>Do not reverse-engineer, scrape, or attempt to bypass any safety control on the service.</li>
            <li>Do not request packs for sensitive or regulated AI use cases that require expert review without engaging a qualified reviewer (see Restrictions below and /safety).</li>
          </TextList>
        </TextSection>

        <TextSection eyebrow="Restrictions" title="High-risk and regulated areas.">
          <p>
            TrustFolder does not produce final compliance conclusions for high-risk or regulated AI use cases such as healthcare diagnosis,
            medical AI, hiring or employment AI, financial services, credit, insurance, biometrics, children&rsquo;s products, law enforcement,
            critical infrastructure, or education grading and admissions. For these areas TrustFolder is intake-only and routes to expert review.
            See /safety for the full list and the routing policy.
          </p>
        </TextSection>

        <TextSection eyebrow="Payments and refunds" title="Payment terms.">
          <p>
            Paid packs are delivered after payment is confirmed by our payment provider. Refunds are handled per /refund. Some tiers are
            request-only and are not billed via instant checkout.
          </p>
        </TextSection>

        <TextSection eyebrow="Liability" title="Limitation of liability (placeholder).">
          <p>
            To the extent permitted by law, TrustFolder is provided &ldquo;as is&rdquo; without warranty of any kind. TrustFolder&rsquo;s
            total liability for any claim arising out of the service is limited to the amount you paid for the pack that gave rise to the claim.
            This is a placeholder clause and must be reviewed and finalized by counsel.
          </p>
        </TextSection>

        <TextSection eyebrow="Changes" title="Updates to these terms.">
          <p>
            We may update these terms over time. Material changes will be described in the public commit history of these pages.
          </p>
        </TextSection>

        <TextSection eyebrow="Contact" title="Questions about these terms.">
          <p>
            Email <a className="text-[color:var(--m-green)] underline" href="mailto:support@trustfolder.com">support@trustfolder.com</a>.
          </p>
        </TextSection>
      </TextPageBody>
    </MarketingShell>
  );
}
