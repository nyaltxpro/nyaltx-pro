'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const NewshubPage = dynamic(
  () => import('@/page-components/Newshub/NewshubPage'),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b12', color: '#8a99ad' }}>
        Loading News Hub...
      </div>
    ),
  }
);

export default function NewsHubComponent() {
  return <NewshubPage />;
}
