'use client';

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SolanaWalletProvider } from './SolanaWalletProvider';
import { config } from '../lib/web3modal';

// Create a client
const queryClient = new QueryClient();

interface UnifiedWalletProviderProps {
  children: React.ReactNode;
}

export function UnifiedWalletProvider({ children }: UnifiedWalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Hook to determine which wallet type to use based on context
export function useWalletType() {
  const [walletType, setWalletType] = React.useState<'evm' | 'solana' | null>(null);
  
  return {
    walletType,
    setWalletType,
    isEVM: walletType === 'evm',
    isSolana: walletType === 'solana',
  };
}
