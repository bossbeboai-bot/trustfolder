import type { Metadata } from 'next';
import { FrameworkLanding } from '../components/FrameworkLanding';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'EU AI Act Transparency Readiness — TrustFolder',
  description:
    'Plain-English EU AI Act transparency-readiness preparation: disclosure drafts, AI use summaries, and review-ready governance documentation for B2B AI teams.',
  path: '/eu-ai-act-transparency-readiness',
});

export default function Page() {
  return (
    <FrameworkLanding
      eyebrow="EU AI Act"
      title="EU AI Act transparency-readiness, in plain English."
      lede="TrustFolder helps B2B AI teams prepare review-ready transparency and governance documentation for EU AI Act preparation. We do not claim to make any company compliant under the EU AI Act."
      problem="The EU AI Act introduces transparency obligations for many B2B AI products — even those that are not high-risk. Most founders are not sure which disclosures apply, where they should appear, or what evidence a buyer or DPO will ask for."
      who_for={[
        'B2B AI SaaS founders preparing for EU customers.',
        'AI agencies delivering chatbots, agents, or automation to EU buyers.',
        'Heads of compliance / legal asked to prepare AI-related buyer answers.',
        'DPOs scoping AI governance documentation needs.',
      ]}
      what_we_prepare={[
        'AI chatbot / assistant disclosure draft.',
        'AI-generated content notice draft.',
        'AI system disclosure page draft.',
        'AI use summary in plain English.',
        'Evidence tracker linking disclosures back to public claims.',
        'Buyer / legal handoff note.',
      ]}
      what_we_dont_guarantee={[
        'TrustFolder does not assert that your product satisfies the EU AI Act.',
        'TrustFolder does not provide legal advice or certification.',
        'High-risk uses (e.g. hiring AI, biometric ID, credit scoring) are routed to expert review and are not auto-packed.',
      ]}
      sample_outputs={[
        'Chatbot disclosure draft',
        'AI-generated content notice draft',
        'AI system disclosure page draft',
        'Placement guide (where each disclosure goes)',
        'Lawyer / buyer handoff note',
        '30-day next-steps roadmap',
      ]}
      primary_cta={{ href: '/assessment', label: 'Run free check' }}
      secondary_cta={{ href: '/request?type=disclosure', label: 'Request paid pack' }}
      faqs={[
        {
          q: 'Does TrustFolder make my company compliant under the EU AI Act?',
          a: 'No. TrustFolder helps prepare transparency-readiness and governance documentation for review. Final compliance decisions should be reviewed by qualified counsel.',
        },
        {
          q: 'What if my product looks high-risk under the EU AI Act?',
          a: 'High-risk areas (hiring, healthcare, credit, biometrics, law enforcement, children) are routed to expert review and are not handled as automated compliance packs.',
        },
        {
          q: 'How long does this take?',
          a: 'The free eligibility check is about two minutes. A paid pack is request-led and founder-reviewed; we reply within one business day.',
        },
      ]}
    />
  );
}
