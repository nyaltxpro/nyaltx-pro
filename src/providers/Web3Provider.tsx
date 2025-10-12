// AppKitProvider.tsx (client-side)
'use client';

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AppKitNetwork } from "@reown/appkit/networks";
import { arbitrum, mainnet, solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { ReactNode, useEffect, useState } from 'react';
import { projectId } from '../lib/web3modal';

export function AppKitProvider({ children }: { children: ReactNode }) {
  const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
    mainnet, arbitrum, solana, solanaTestnet, solanaDevnet
  ];

  const wagmiAdapter = new WagmiAdapter({
    ssr: true,
    projectId,
    networks,
  });

  // we delay Solana adapter only when client
  const [modal, setModal] = useState<ReturnType<typeof createAppKit> | null>(null);

  useEffect(() => {
    async function init() {
      const { SolanaAdapter } = await import('@reown/appkit-adapter-solana');
      const solanaAdapter = new SolanaAdapter({
        registerWalletStandard: true,
        wallets: [],
      });
      const m = createAppKit({
        adapters: [wagmiAdapter, solanaAdapter],
        networks,
        metadata: {
          name: 'appkit-example',
          description: 'AppKit Example',
          url: 'https://appkitexampleapp.com',
          icons: ['https://avatars.githubusercontent.com/u/179229932'],
        },
        projectId,
        features: { analytics: true },
        themeMode: 'dark',
        themeVariables: {
          '--w3m-font-family': 'Roboto, sans-serif',
          '--w3m-accent': '#00b8d8',
          '--w3m-color-mix': '#00b8d8',
          '--w3m-color-mix-strength': 20,
        },
      });
      setModal(m);
    }
    init();
  }, []);

  // until modal is ready, you can render nothing or a fallback
  if (!modal) return <>{children}</>;

  return (
    <modal.AppKitProvider>
      {children}
    </modal.AppKitProvider>
  );
}
