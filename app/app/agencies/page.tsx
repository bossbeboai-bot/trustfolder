import { MarketingShell } from '../_marketing/components/Shell';
import { AgenciesPage } from '../_marketing/agencies/AgenciesPage';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Agencies — TrustFolder',
  description:
    'TrustFolder gives AI agencies a repeatable governance handoff asset for chatbot, agent, and automation client projects.',
  path: '/agencies',
});

export default function Page() {
  return (
    <MarketingShell>
      <AgenciesPage />
    </MarketingShell>
  );
}
