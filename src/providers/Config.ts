// perhaps in a client-only module
import { sepolia } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { projectId, wagmiAdapter } from '../lib/web3modal';

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia],
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
