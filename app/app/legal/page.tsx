import { SiteChrome } from '../components/SiteChrome';
import { PageHeader, Section } from '../components/MarketingPrimitives';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Notice — TrustFolder',
  description:
    'TrustFolder legal notice: scope, disclaimers, expert-review-only areas, and counsel-review recommendation.',
};

export default function LegalPage() {
  return (
    <SiteChrome>
      <PageHeader
        eyebrow="Legal"
        title="Legal Notice"
        lede="A plain-English summary of what TrustFolder does and the limits we ask everyone to respect."
      />

      <Section eyebrow="What TrustFolder does" title="Readiness drafts and evidence material.">
        <p className="text-base leading-8 text-[var(--tf-slate)]">
          TrustFolder prepares AI-generated readiness drafts and evidence
          material for B2B AI teams. We help organize information for buyer,
          internal, and legal review. The output is review-ready, not
          decision-ready.
        </p>
      </Section>

      <Section eyebrow="What TrustFolder is not" title="Disclaimers.">
        <ul className="list-disc space-y-3 pl-5 text-base leading-8 text-[var(--tf-slate)]">
          <li>TrustFolder is not legal advice.</li>
          <li>TrustFolder is not certification or accreditation.</li>
          <li>TrustFolder is not a compliance guarantee.</li>
          <li>TrustFolder does not run runtime monitoring, guardrails, bias detection, or model drift detection.</li>
          <li>TrustFolder does not replace your lawyer, DPO, security reviewer, or qualified expert reviewer.</li>
        </ul>
      </Section>

      <Section eyebrow="Expert-review-only" title="Areas TrustFolder does not auto-pack.">
        <p className="text-base leading-8 text-[var(--tf-slate)]">
          TrustFolder is intake-only and routes to expert review for
          high-risk areas, including healthcare diagnosis, medical AI,
          hiring or employment AI, financial services, credit, insurance,
          biometrics, children&rsquo;s products, law enforcement, critical
          infrastructure, and education grading or admissions. See `/safety`
          for the full list.
        </p>
      </Section>

      <Section eyebrow="Counsel review" title="Always have a qualified reviewer.">
        <p className="text-base leading-8 text-[var(--tf-slate)]">
          Before you publish or share any TrustFolder pack with a buyer,
          regulator, or auditor, have it reviewed by your team and by
          qualified counsel where the pack has legal impact.
        </p>
      </Section>

      <Section eyebrow="Contact" title="Legal questions.">
        <p className="text-base leading-8 text-[var(--tf-slate)]">
          Email <a className="underline" href="mailto:support@trustfolder.com">support@trustfolder.com</a>.
        </p>
      </Section>
    </SiteChrome>
  );
}
