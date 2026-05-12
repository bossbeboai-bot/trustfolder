import { MarketingShell } from '../_marketing/components/Shell';
import { ExamplesPage } from '../_marketing/examples/ExamplesPage';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Sample AI Governance Documents and Disclosure Drafts',
  description:
    'Sample AI governance documents, AI disclosure drafts, evidence trackers, and buyer handoff previews for TrustFolder packs.',
  path: '/examples',
});

export default function Page() {
  return (
    <MarketingShell>
      <ExamplesPage />
    </MarketingShell>
  );
}
