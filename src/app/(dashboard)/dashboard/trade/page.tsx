'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Trade = dynamic(() => import('@/page-components/Trade'), {
  loading: () => (
    <div className="p-4 text-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b8d8] mx-auto mb-4"></div>
        <p className="text-xl">Loading trading interface...</p>
      </div>
    </div>
  ),
  ssr: false
});

export default function TradePage() {
  return <Trade />;
}
