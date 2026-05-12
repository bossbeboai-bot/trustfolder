import { MarketingShell } from '../_marketing/components/Shell';
import { ExamplesPage } from '../_marketing/examples/ExamplesPage';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Examples — TrustFolder',
  description:
    'Illustrative samples of how TrustFolder packs are structured for B2B AI SaaS, an AI agency, and an AI productivity tool. None of these are real customers.',
  path: '/examples',
});

export default function Page() {
  return (
    <MarketingShell>
      <ExamplesPage />
    </MarketingShell>
  );
}
