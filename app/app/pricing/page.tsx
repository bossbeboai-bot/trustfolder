import { MarketingShell } from '../_marketing/components/Shell';
import { PricingPage } from '../_marketing/pricing/PricingPage';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'AI Governance Document Packs and Disclosure Drafts — TrustFolder',
  description:
    'Compare TrustFolder packs for AI disclosure drafts, governance summaries, evidence trackers, buyer/legal handoff documents, and AI readiness review.',
  path: '/pricing',
});

export default function Page() {
  return (
    <MarketingShell>
      <PricingPage />
    </MarketingShell>
  );
}
