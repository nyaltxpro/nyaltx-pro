/**
 * Blockchain Provider utilities
 */
import { JsonRpcProvider } from 'ethers';

// RPC URLs for different chains
const RPC_URLS = {
  1: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY', // Ethereum
  56: 'https://bsc-dataseed.binance.org/', // BSC
  137: 'https://polygon-rpc.com/', // Polygon
  42161: 'https://arb1.arbitrum.io/rpc', // Arbitrum
  10: 'https://mainnet.optimism.io', // Optimism
  43114: 'https://api.avax.network/ext/bc/C/rpc', // Avalanche
  250: 'https://rpc.ftm.tools/', // Fantom
  8453: 'https://mainnet.base.org', // Base
  11155111:
    process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
    process.env.SEPOLIA_RPC_URL ||
    'https://rpc.sepolia.org', // Sepolia (testnet)
  101: 'https://api.mainnet-beta.solana.com', // Solana
};

// Cache for providers to avoid creating multiple instances
const providerCache: { [chainId: number]: any } = {};

/**
 * Get a blockchain provider for the given chain ID
 */
export function getProvider(chainId: number): JsonRpcProvider | null {
  if (providerCache[chainId]) {
    return providerCache[chainId];
  }

  const rpcUrl = RPC_URLS[chainId as keyof typeof RPC_URLS];
  if (!rpcUrl) {
    console.warn(`No RPC URL configured for chain ID ${chainId}`);
    return null;
  }

  try {
    const provider = new JsonRpcProvider(rpcUrl);
    providerCache[chainId] = provider;
    return provider;
  } catch (error) {
    console.error(`Failed to create provider for chain ${chainId}:`, error);
    return null;
  }
}

/**
 * Get a Solana connection (for Solana-based DEXes like Raydium)
 */
export function getSolanaConnection() {
  // This would use @solana/web3.js Connection
  // For now, return null as we're not implementing full Solana support
  return null;
}
