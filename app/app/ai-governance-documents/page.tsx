import type { Metadata } from 'next';
import { FrameworkLanding } from '../components/FrameworkLanding';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'AI Governance Documents — TrustFolder',
  description:
    'AI system inventory, policy draft, evidence tracker, governance summary, and buyer/legal handoff. Review-ready AI governance documents for B2B AI teams.',
  path: '/ai-governance-documents',
});

export default function Page() {
  return (
    <FrameworkLanding
      eyebrow="AI governance"
      title="AI governance documents your buyers and lawyers will recognise."
      lede="TrustFolder prepares an AI system inventory, governance policy draft, evidence tracker, and buyer/legal handoff materials for B2B AI teams."
      problem="When a buyer asks for AI governance documentation, most B2B AI teams scramble. TrustFolder gives you a structured folder with named documents your buyer and lawyer can review in one sitting."
      who_for={[
        'B2B AI SaaS teams preparing for enterprise buyer review.',
        'AI agencies bundling governance documents into client handoff.',
        'Heads of compliance / legal building their first AI governance posture.',
      ]}
      what_we_prepare={[
        'AI system inventory.',
        'AI governance policy draft.',
        'Human oversight notes / procedure draft.',
        'Evidence tracker linking governance claims back to source.',
        'Buyer / legal handoff note.',
        '30-day governance roadmap.',
      ]}
      what_we_dont_guarantee={[
        'TrustFolder is not certification or audit.',
        'TrustFolder does not assert that your governance satisfies any specific framework.',
        'Drafts should be reviewed internally and by qualified counsel before external use.',
      ]}
      sample_outputs={[
        'AI system inventory',
        'Governance policy draft',
        'Evidence tracker',
        'Risk notes',
        'Buyer / legal handoff',
        '30-day next-steps roadmap',
      ]}
      primary_cta={{ href: '/assessment', label: 'Run free check' }}
      secondary_cta={{ href: '/request?type=governance', label: 'Request governance folder' }}
      faqs={[
        {
          q: 'Does this replace formal AI governance training or program design?',
          a: 'No. The pack is a documentation layer. Program design, training, and internal change still belong with your team.',
        },
        {
          q: 'Will my lawyer find this useful?',
          a: 'The pack is structured so a lawyer can scan it in a single read and flag what needs attention. That is the design goal.',
        },
      ]}
    />
  );
}
