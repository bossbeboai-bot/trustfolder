import type { Metadata } from 'next';
import { FrameworkLanding } from '../components/FrameworkLanding';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'ISO/IEC 42001 Readiness Pack',
  description:
    'ISO/IEC 42001-aligned readiness pack: AI management system readiness checklist, AI policy draft, AI system inventory, and risk register. Not certification.',
  path: '/iso-42001-readiness',
});

export default function Page() {
  return (
    <FrameworkLanding
      eyebrow="ISO/IEC 42001"
      title="ISO/IEC 42001-aligned readiness pack, in plain English."
      lede="TrustFolder helps you organize an AI management system readiness folder aligned with ISO/IEC 42001 concepts. This is a readiness pack, not certification."
      problem="ISO/IEC 42001 is the AI management system standard. Buyers may reference it, but the formal certification path is long and specialized. TrustFolder gives you a readiness folder so you can show progress today."
      who_for={[
        'B2B AI SaaS teams getting ISO/IEC 42001 questions from buyers.',
        'AI governance leads building a structured AI management system.',
        'Founders preparing for an eventual ISO/IEC 42001 readiness review.',
      ]}
      what_we_prepare={[
        'AI management system readiness checklist.',
        'AI policy draft.',
        'AI system inventory.',
        'Risk / opportunity register.',
        'Human oversight notes.',
        'Supplier / vendor AI review checklist.',
        'Monitoring and improvement log.',
        'Internal governance handoff.',
      ]}
      what_we_dont_guarantee={[
        'This is not certification.',
        'A formal certification path requires a qualified certification body.',
        'TrustFolder is not the certification body.',
      ]}
      sample_outputs={[
        'AI management system readiness checklist',
        'AI policy draft',
        'AI system inventory',
        'Risk / opportunity register',
        'Monitoring and improvement log',
        'Internal governance handoff',
      ]}
      primary_cta={{ href: '/request?type=iso42001-readiness', label: 'Request ISO/IEC 42001-aligned pack' }}
      secondary_cta={{ href: '/safety', label: 'Read safety policy' }}
      faqs={[
        {
          q: 'Will this certify my AI management system?',
          a: 'No. Certification requires a qualified certification body. The pack helps you prepare evidence for that conversation.',
        },
        {
          q: 'How is this different from the AI governance folder?',
          a: 'The governance folder is broader and buyer-focused. The ISO/IEC 42001-aligned readiness pack is specifically structured around AI management system concepts.',
        },
      ]}
    />
  );
}
