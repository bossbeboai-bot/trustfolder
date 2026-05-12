import type { Metadata } from 'next';
import { FrameworkLanding } from '../components/FrameworkLanding';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'SOC 2 Readiness Evidence Pack — TrustFolder',
  description:
    'Organize security and AI governance evidence for buyer due-diligence preparation. SOC 2 readiness evidence pack, not an audit or certification.',
  path: '/soc2-readiness-evidence-pack',
});

export default function Page() {
  return (
    <FrameworkLanding
      eyebrow="SOC 2 readiness"
      title="SOC 2 readiness evidence pack for AI startups."
      lede="TrustFolder helps you organize security and AI governance evidence for buyer due-diligence preparation. This is a readiness pack, not a SOC 2 audit or certification."
      problem="Buyers ask for SOC 2 evidence long before a startup is ready for a real audit. TrustFolder gives you a structured evidence pack so you can answer those questions without claiming an attestation you do not have."
      who_for={[
        'Early-stage AI SaaS teams that buyers ask for SOC 2 evidence.',
        'Founders preparing for first procurement / security review.',
        'Security leads building the evidence index before engaging an auditor.',
      ]}
      what_we_prepare={[
        'SOC 2 readiness summary.',
        'Control / evidence tracker.',
        'Security policy draft checklist.',
        'Access control evidence checklist.',
        'Vendor / subprocessor evidence checklist.',
        'Incident response readiness checklist.',
        'Buyer security review handoff.',
      ]}
      what_we_dont_guarantee={[
        'This is not a SOC 2 report, audit, or attestation.',
        'TrustFolder is not a CPA firm and does not issue SOC 2 opinions.',
        'A formal audit must still be performed by a qualified auditor.',
      ]}
      sample_outputs={[
        'SOC 2 readiness summary',
        'Control / evidence tracker',
        'Security policy draft checklist',
        'Vendor evidence checklist',
        'Incident response readiness checklist',
        'Buyer security review handoff',
      ]}
      primary_cta={{ href: '/request?type=soc2-readiness', label: 'Request SOC 2 readiness pack' }}
      secondary_cta={{ href: '/safety', label: 'Read safety policy' }}
      faqs={[
        {
          q: 'Is this a SOC 2 audit?',
          a: 'No. This is a readiness evidence pack. A SOC 2 audit must be performed by a qualified CPA firm.',
        },
        {
          q: 'Will my buyer accept this in place of a SOC 2 report?',
          a: 'Some early-stage buyers accept evidence packs as part of a graduated review. Others require an actual report. Confirm with your buyer directly.',
        },
      ]}
    />
  );
}
