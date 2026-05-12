import type { Metadata } from 'next';
import HomePage from './_marketing/home/HomePage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'TrustFolder - AI Governance Documents, Disclosure Drafts, and Buyer-Review Packs',
  description:
    'TrustFolder scans your AI product website and assembles a structured evidence folder with AI disclosures, governance summaries, buyer handoff materials, and source notes.',
  path: '/',
});

export default function RootHomePage() {
  return <HomePage />;
}
