'use client';
import { arbitrum, base, mainnet, polygon, scroll } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
import { projectId, SolanaWalletContext, wagmiAdapter } from '../lib/web3modal';


const queryClient = new QueryClient();
if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Create the modal with EVM adapter only
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum, base, polygon, scroll],
  defaultNetwork: mainnet,
  metadata: {
    name: 'NYALTX',
    description: 'NYALTX - Crypto Trading Platform',
    url: 'https://nyaltx.com',
    icons: ['https://nyaltx.com/logo.png'],
  },
  features: {
    analytics: true,
    connectMethodsOrder: ['wallet', 'social'],
    onramp: false,
  },
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  allWallets: 'SHOW',
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  ],
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    '--w3m-accent': '#00b8d8',
    '--w3m-color-mix': '#00b8d8',
    '--w3m-color-mix-strength': 20,
  },
});


function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
      reconnectOnMount={false}
    >
      <QueryClientProvider client={queryClient}>
        <SolanaWalletContext>
          {children}
        </SolanaWalletContext>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
