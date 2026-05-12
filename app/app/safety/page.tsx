import { MarketingShell } from '../_marketing/components/Shell';
import { SafetyPage } from '../_marketing/safety/SafetyPage';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Safety and scope — TrustFolder',
  description:
    'What TrustFolder does, what it does not do, and which verticals are out of scope. Not legal advice. Not certification. Not a compliance guarantee.',
  path: '/safety',
});

export default function Page() {
  return (
    <MarketingShell>
      <SafetyPage />
    </MarketingShell>
  );
}
