'use client';

import { Toaster } from 'react-hot-toast';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          border: '1px solid rgb(255 255 255 / 10%)',
          borderRadius: '0.75rem',
          background: '#111821',
          color: '#e2e8f0',
          boxShadow: '0 12px 32px rgb(0 0 0 / 35%)',
          fontFamily: 'var(--font-sans, sans-serif)',
        },
        success: {
          style: {
            border: '1px solid rgb(52 211 153 / 25%)',
            background: '#102019',
            color: '#d1fae5',
          },
        },
        error: {
          style: {
            border: '1px solid rgb(248 113 113 / 25%)',
            background: '#241315',
            color: '#fee2e2',
          },
        },
      }}
    />
  );
}
