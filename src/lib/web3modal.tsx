// import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { arbitrum, base, mainnet, polygon, scroll } from '@reown/appkit/networks';
import { cookieStorage, createStorage, http } from '@wagmi/core';

// Get projectId from https://dashboard.reown.com
export const projectId = 'f56614799c9232532c3e3e76536d3be3';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const networks = [mainnet, arbitrum, polygon, base, scroll]; // Removed sepolia, mainnet is default

// export const solanaWeb3JsAdapter = new SolanaAdapter({
//   registerWalletStandard: true,
//   wallets: [/* only show these specific wallets */]
// })

//Set up the Wagmi Adapter (Config)
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
