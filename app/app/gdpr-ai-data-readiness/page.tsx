import type { Metadata } from 'next';
import { FrameworkLanding } from '../components/FrameworkLanding';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'GDPR AI/Data Readiness Pack — TrustFolder',
  description:
    'Organize AI data-use and processing information for privacy/legal review. GDPR AI/data readiness pack — not GDPR compliance certification.',
  path: '/gdpr-ai-data-readiness',
});

export default function Page() {
  return (
    <FrameworkLanding
      eyebrow="GDPR readiness"
      title="GDPR AI/data readiness pack for B2B AI teams."
      lede="TrustFolder helps you organize AI data-use and processing information for privacy/legal review. This is a readiness pack, not a certification of GDPR compliance."
      problem="DPOs and privacy reviewers ask AI vendors detailed questions about data use, lawful basis, subprocessors, and retention. TrustFolder gives you a structured intake and review pack so the conversation moves faster."
      who_for={[
        'B2B AI SaaS teams selling into the EU or to EU-bound buyers.',
        'DPOs scoping vendor AI for buyer review.',
        'Founders preparing for a GDPR-aware procurement reviewer.',
      ]}
      what_we_prepare={[
        'Data processing summary draft.',
        'AI data-use summary.',
        'Personal data intake checklist.',
        'Subprocessor / vendor evidence tracker.',
        'DPA / privacy review handoff.',
        'User-rights readiness notes.',
      ]}
      what_we_dont_guarantee={[
        'TrustFolder does not assert that your data handling meets GDPR.',
        'TrustFolder is not legal advice or DPA review.',
        'Cross-border transfer, special-category data, and children data routes to expert review.',
      ]}
      sample_outputs={[
        'Data processing summary draft',
        'AI data-use summary',
        'Personal data intake checklist',
        'Lawful-basis discussion prompts',
        'DPA / privacy review handoff',
      ]}
      primary_cta={{ href: '/request?type=gdpr-ai-data-readiness', label: 'Request GDPR readiness pack' }}
      secondary_cta={{ href: '/safety', label: 'Read safety policy' }}
      faqs={[
        {
          q: 'Will this make my product GDPR compliant?',
          a: 'No. TrustFolder helps prepare review-ready privacy material. Final compliance review belongs to qualified counsel or a privacy specialist.',
        },
        {
          q: 'Do you handle DPAs?',
          a: 'We prepare DPA review inputs and a handoff document. We do not generate final legal agreements.',
        },
      ]}
    />
  );
}
