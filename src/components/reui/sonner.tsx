'use client';

import { Toaster } from 'react-hot-toast';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          border: '1px solid rgba(255,255,255,.1)',
          background: '#111821',
          color: '#e2e8f0',
        },
      }}
    />
  );
}
