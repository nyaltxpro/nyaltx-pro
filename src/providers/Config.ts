// perhaps in a client-only module
import { arbitrum, mainnet, solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { projectId, , wagmiAdapter } from '../lib/web3modal';




export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum, solana, solanaTestnet, solanaDevnet],
  projectId,
  features: { analytics: true },
  themeMode: 'dark',

});
