'use client';

import dynamic from 'next/dynamic';

const RequestLeadPage = dynamic(() => import('../components/RequestLeadPage'), {
  ssr: false,
});

export default function RequestPage() {
  return <RequestLeadPage />;
}
