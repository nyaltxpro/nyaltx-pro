// perhaps in a client-only module
import { arbitrum, mainnet, solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { projectId, wagmiAdapter, solanaWeb3JsAdapter } from '../lib/web3modal';




export const modal = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  networks: [mainnet, arbitrum, solana, solanaTestnet, solanaDevnet],
  projectId,
  features: { analytics: true },
  themeMode: 'dark',
  metadata: {
    name: 'NYALTX',
    description: 'NYALTX - Crypto Trading Platform',
    url: 'https://nyaltx.com',
    icons: ['https://nyaltx.com/logo.png']
  }
});
