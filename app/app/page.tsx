import type { Metadata } from 'next';
import MarketingHome from './components/MarketingHome';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'TrustFolder — AI Governance Documents for B2B AI Companies',
  description:
    'TrustFolder prepares review-ready AI disclosure drafts, governance summaries, evidence trackers, source notes, and buyer/legal handoff documents for B2B AI SaaS companies and AI agencies.',
  path: '/',
});

export default function HomePage() {
  return <MarketingHome />;
}
