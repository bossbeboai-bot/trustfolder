import type { Metadata } from 'next';
import HomePage from './_marketing/home/HomePage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'TrustFolder — Review-ready AI governance folders for B2B AI teams',
  description:
    'TrustFolder scans your AI product website and prepares a structured evidence folder — AI disclosures, governance summary, buyer handoff, and source notes — ready for legal review.',
  path: '/',
});

export default function RootHomePage() {
  return <HomePage />;
}
