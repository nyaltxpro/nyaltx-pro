'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  MathWalletAdapter,
  Coin98WalletAdapter,
  SafePalWalletAdapter,
  BitKeepWalletAdapter,
  CloverWalletAdapter,
  TrezorWalletAdapter,
  TrustWalletAdapter,
  WalletConnectWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

interface SolanaWalletProviderProps {
  children: React.ReactNode;
  network?: WalletAdapterNetwork;
  endpoint?: string;
}

export function SolanaWalletProvider({ 
  children, 
  network = WalletAdapterNetwork.Mainnet,
  endpoint 
}: SolanaWalletProviderProps) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const solanaNetwork = network;

  // You can also provide a custom RPC endpoint.
  const rpcEndpoint = useMemo(() => {
    if (endpoint) return endpoint;
    
    // Use environment variable if available, otherwise use default
    const envEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT;
    if (envEndpoint) return envEndpoint;
    
    return clusterApiUrl(solanaNetwork);
  }, [solanaNetwork, endpoint]);

  const wallets = useMemo(
    () => [
      // Popular wallets
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: solanaNetwork }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      
      // Additional wallets
      new MathWalletAdapter(),
      new Coin98WalletAdapter(),
      new SafePalWalletAdapter(),
      new BitKeepWalletAdapter(),
      new CloverWalletAdapter(),
      new TrezorWalletAdapter({
        email: 'support@nyaltx.com',
      }),
      new TrustWalletAdapter(),
      new WalletConnectWalletAdapter({
        network: solanaNetwork === WalletAdapterNetwork.Mainnet ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet,
        options: {
          relayUrl: 'wss://relay.walletconnect.com',
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'f56614799c9232532c3e3e76536d3be3',
          metadata: {
            name: 'NYALTX',
            description: 'NYALTX - Crypto Trading Platform',
            url: 'https://nyaltx.com',
            icons: ['https://nyaltx.com/logo.png'],
          },
        },
      }),
    ],
    [solanaNetwork]
  );

  return (
    <ConnectionProvider endpoint={rpcEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// Hook to get Solana wallet connection status
export { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Export wallet modal hook
export { useWalletModal } from '@solana/wallet-adapter-react-ui';
