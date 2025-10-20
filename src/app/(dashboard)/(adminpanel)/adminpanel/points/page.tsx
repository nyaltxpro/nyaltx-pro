'use client';

import dynamic from 'next/dynamic';

const TokenPointsManager = dynamic(
  () => import('@/components/admin/TokenPointsManager'),
  { ssr: false }
);



export default function TokenPointsPage() {
  return <TokenPointsManager />;
}
