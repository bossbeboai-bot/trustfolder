import type { Metadata } from 'next';
import { MarketingShell } from '../_marketing/components/Shell';
import { TextHero, TextList, TextPageBody, TextSection } from '../_marketing/components/TextPage';

export const metadata: Metadata = {
  title: 'Legal Notice',
  description:
    'TrustFolder legal notice: scope, disclaimers, expert-review-only areas, and counsel-review recommendation.',
};

export default function LegalPage() {
  return (
    <MarketingShell>
      <TextHero
        eyebrow="Legal"
        title="Legal Notice"
        lede="A plain-English summary of what TrustFolder does and the limits we ask everyone to respect."
      />

      <TextPageBody>
        <TextSection eyebrow="What TrustFolder does" title="Readiness drafts and evidence material.">
          <p>
            TrustFolder prepares AI-generated readiness drafts and evidence material for B2B AI teams. We help organize information for buyer,
            internal, and legal review. The output is review-ready, not decision-ready.
          </p>
        </TextSection>

        <TextSection eyebrow="What TrustFolder is not" title="Disclaimers.">
          <TextList>
            <li>TrustFolder is not legal advice.</li>
            <li>TrustFolder is not certification or accreditation.</li>
            <li>TrustFolder is not a compliance guarantee.</li>
            <li>TrustFolder does not run runtime monitoring, guardrails, bias detection, or model drift detection.</li>
            <li>TrustFolder does not replace your lawyer, DPO, security reviewer, or qualified expert reviewer.</li>
          </TextList>
        </TextSection>

        <TextSection eyebrow="Expert-review-only" title="Areas TrustFolder does not auto-pack.">
          <p>
            TrustFolder is intake-only and routes to expert review for high-risk areas, including healthcare diagnosis, medical AI, hiring or
            employment AI, financial services, credit, insurance, biometrics, children&rsquo;s products, law enforcement, critical
            infrastructure, and education grading or admissions. See /safety for the full list.
          </p>
        </TextSection>

        <TextSection eyebrow="Counsel review" title="Always have a qualified reviewer.">
          <p>
            Before you publish or share any TrustFolder pack with a buyer, regulator, or auditor, have it reviewed by your team and by
            qualified counsel where the pack has legal impact.
          </p>
        </TextSection>

        <TextSection eyebrow="Contact" title="Legal questions.">
          <p>
            Email <a className="text-[color:var(--m-green)] underline" href="mailto:support@trustfolder.com">support@trustfolder.com</a>.
          </p>
        </TextSection>
      </TextPageBody>
    </MarketingShell>
  );
}
