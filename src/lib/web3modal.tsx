'use client';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { arbitrum, base, mainnet, polygon, scroll } from '@reown/appkit/networks';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { cookieStorage, createStorage, http } from '@wagmi/core';
import { FC, ReactNode, useMemo } from 'react';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Get projectId from https://dashboard.reown.com
export const projectId = 'f56614799c9232532c3e3e76536d3be3';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// EVM networks for Wagmi
export const networks = [mainnet, arbitrum, polygon, base, scroll];

// Solana Wallet Context Provider
export const SolanaWalletContext: FC<{ children: ReactNode }> = ({ children }) => {
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Set up the Wagmi Adapter (Config) for EVM chains
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
    [scroll.id]: http(),
  },
});

export const config = wagmiAdapter.wagmiConfig;
