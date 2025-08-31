/**
 * List of top 20 blockchain IDs based on market presence and popularity
 * These IDs match the ones used in the chains.json file
 */
export const TOP_BLOCKCHAINS = [
  'ethereum',        // Ethereum
  'bitcoin',         // Bitcoin
  'binance-smart-chain', // Binance Smart Chain (BSC)
  'solana',          // Solana
  'polygon-pos',     // Polygon
  'avalanche',       // Avalanche
  'arbitrum-one',    // Arbitrum
  'optimistic-ethereum', // Optimism
  'tron',            // Tron
  'base',            // Base
  'cardano',         // Cardano
  'cosmos',          // Cosmos
  'polkadot',        // Polkadot
  'near-protocol',   // Near
  'fantom',          // Fantom
  'xai',             // XAI
  'sei-v2',          // Sei Network
  'internet-computer', // Internet Computer
  'ronin',           // Ronin
  'celestia'         // Celestia
];

/**
 * Function to check if a blockchain is in the top 20 list
 * @param blockchainId The ID of the blockchain to check
 * @returns boolean indicating if the blockchain is in the top 20
 */
export const isTopBlockchain = (blockchainId: string): boolean => {
  return TOP_BLOCKCHAINS.includes(blockchainId);
};
