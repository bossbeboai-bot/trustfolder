import type { Metadata } from 'next';
import { FrameworkLanding } from '../components/FrameworkLanding';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Enterprise Security Questionnaire Support — TrustFolder',
  description:
    'Draft answers, evidence pointers, and confidence flags for enterprise security questionnaires. Answers must be reviewed by your security/legal owner before submission.',
  path: '/security-questionnaire-support',
});

export default function Page() {
  return (
    <FrameworkLanding
      eyebrow="Security questionnaires"
      title="Enterprise security questionnaire support — fast first-draft answers."
      lede="TrustFolder helps you prepare draft answers, evidence pointers, and confidence flags for buyer security questionnaires. Answers must be reviewed by your security/legal owner before submission."
      problem="Enterprise security questionnaires arrive with 100+ questions and a tight deadline. Most founders write each answer from scratch. TrustFolder prepares a draft answer pack so you can review and refine instead of starting from a blank page."
      who_for={[
        'B2B AI SaaS founders responding to enterprise procurement.',
        'Security or compliance leads triaging a new questionnaire.',
        'AI agencies answering security review on behalf of clients.',
      ]}
      what_we_prepare={[
        'Questionnaire answer draft.',
        'Evidence / source map per answer.',
        'Unknowns list with owner suggestions.',
        'Red / yellow / green confidence flags.',
        'Supporting-doc checklist.',
        'Buyer-response handoff.',
      ]}
      what_we_dont_guarantee={[
        'TrustFolder is not legal advice or security certification.',
        'Draft answers must be reviewed by your security / legal owner before submission.',
        'TrustFolder does not assert that the answers satisfy any specific buyer review framework.',
      ]}
      sample_outputs={[
        'Draft answer table',
        'Evidence / source map',
        'Unknowns list',
        'Red / yellow / green confidence flags',
        'Supporting-doc checklist',
        'Buyer-response handoff',
      ]}
      primary_cta={{ href: '/request?type=security-questionnaire', label: 'Request questionnaire support' }}
      secondary_cta={{ href: '/safety', label: 'Read safety policy' }}
      faqs={[
        {
          q: 'Will you fill out the questionnaire and send it to the buyer?',
          a: 'No. We prepare draft answers and a buyer-response handoff. Your security / legal owner reviews and submits.',
        },
        {
          q: 'How accurate are the draft answers?',
          a: 'The draft uses your website, intake, and product documentation. Every answer carries a confidence flag and an evidence pointer.',
        },
      ]}
    />
  );
}
