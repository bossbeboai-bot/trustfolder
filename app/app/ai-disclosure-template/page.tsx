import type { Metadata } from 'next';
import { FrameworkLanding } from '../components/FrameworkLanding';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'AI Disclosure Template — TrustFolder',
  description:
    'Review-ready AI disclosure drafts for chatbots, AI-generated content, and AI-assisted product features. Not legal advice. Not certification.',
  path: '/ai-disclosure-template',
});

export default function Page() {
  return (
    <FrameworkLanding
      eyebrow="AI disclosure"
      title="AI disclosure templates that read like a clean brief for a lawyer."
      lede="TrustFolder prepares review-ready AI disclosure drafts you can adapt for your product, your privacy/trust page, and your lawyer's review."
      problem="Most B2B AI teams know they need user-facing AI disclosure, but the existing templates online are generic and hard to apply. TrustFolder prepares drafts that read from your actual product surface."
      who_for={[
        'B2B AI SaaS founders rolling out a new chatbot, AI feature, or assistant.',
        'AI agencies delivering chatbot or AI-content features to clients.',
        'Legal / compliance leads who want a clean draft to review, not a blank page.',
      ]}
      what_we_prepare={[
        'Chatbot / assistant disclosure draft.',
        'AI-generated content notice draft.',
        'AI system disclosure page draft.',
        'Placement guide (where each disclosure should appear in the product).',
        'Internal transparency summary.',
        'Legal-review note.',
      ]}
      what_we_dont_guarantee={[
        'TrustFolder is not legal advice.',
        'TrustFolder does not claim that your disclosures satisfy any specific law.',
        'Drafts should be reviewed by qualified counsel before publication.',
      ]}
      sample_outputs={[
        'Chatbot disclosure draft (paragraph + placement note)',
        'AI-generated content notice with example wording',
        'Public AI system disclosure page draft',
        'Internal transparency summary for your team',
        'Lawyer-review handoff note',
      ]}
      primary_cta={{ href: '/assessment', label: 'Run free check' }}
      secondary_cta={{ href: '/request?type=disclosure', label: 'Request paid pack' }}
      faqs={[
        {
          q: 'Is the disclosure draft a one-size-fits-all template?',
          a: 'No. It is prepared from your website and your intake answers, so the language reflects how users actually meet your AI.',
        },
        {
          q: 'Can I edit the draft?',
          a: 'Yes. Customers always edit the draft before publishing. The pack is a starting point, not a final deliverable.',
        },
      ]}
    />
  );
}
