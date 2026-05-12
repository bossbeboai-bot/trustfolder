import type { Metadata } from 'next';
import { FrameworkLanding } from '../components/FrameworkLanding';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'AI Agency Client Handoff — TrustFolder',
  description:
    'Repeatable client handoff materials for AI agencies: per-client governance folder, agency master folder, client cover sheet, and scoping checklist.',
  path: '/ai-agency-client-handoff',
});

export default function Page() {
  return (
    <FrameworkLanding
      eyebrow="AI agencies"
      title="A governance handoff folder for every AI client project."
      lede="TrustFolder helps AI agencies deliver cleaner client handoffs for chatbots, agents, and automation projects — without owning the legal review."
      problem="AI agencies finish a build and hand it off, but clients are increasingly asking for governance documentation. TrustFolder gives agencies a repeatable per-client folder so the handoff feels professional without the agency taking on legal exposure."
      who_for={[
        'AI agencies and automation studios delivering AI features to clients.',
        'Boutique chatbot / agent agencies preparing structured handoff.',
        'Agency operators who want a repeatable governance handoff template.',
      ]}
      what_we_prepare={[
        'Per-client governance folder template.',
        'Agency master folder.',
        'Client-handoff cover sheet.',
        'Repeatable scoping checklist.',
        'Buyer / legal handoff note for the client.',
      ]}
      what_we_dont_guarantee={[
        'TrustFolder is not legal advice or certification.',
        'Each client must still review and own their disclosure / governance posture.',
        'Agencies do not take on legal responsibility for client compliance.',
      ]}
      sample_outputs={[
        'Per-client folder template',
        'Agency master folder',
        'Client-handoff cover sheet',
        'Repeatable scoping checklist',
        'Buyer / legal handoff note',
      ]}
      primary_cta={{ href: '/request?type=agency', label: 'Request agency pack' }}
      secondary_cta={{ href: '/agencies', label: 'See agency overview' }}
      faqs={[
        {
          q: 'Do I rebrand the pack as my own?',
          a: 'Some agencies wrap the materials inside their own delivery. Talk to us about scope before doing so.',
        },
        {
          q: 'Does this remove our legal exposure?',
          a: 'No. The pack reduces friction in handoff. Legal exposure depends on contracts and how the agency frames its service.',
        },
      ]}
    />
  );
}
