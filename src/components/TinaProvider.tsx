'use client';

import { TinaCMS } from 'tinacms';
import { ReactNode } from 'react';

interface TinaProviderProps {
  children: ReactNode;
}

// Create a CMS instance
const cms = new TinaCMS({
  enabled: process.env.NODE_ENV !== 'production',
  sidebar: true,
});

export default function TinaProvider({ children }: TinaProviderProps) {
  return <>{children}</>;
}
