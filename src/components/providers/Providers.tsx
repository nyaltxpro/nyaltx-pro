'use client';

import ReduxProvider from './ReduxProvider';
import Web3Provider from '@/providers/Web3Provider';
import { SolanaWalletProvider } from '@/components/SolanaWalletProvider';
import AnalyticsProvider from '@/components/AnalyticsProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider>
      <Web3Provider cookies={null}>
        <SolanaWalletProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </SolanaWalletProvider>
      </Web3Provider>
    </ReduxProvider>
  );
}
