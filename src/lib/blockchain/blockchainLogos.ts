/**
 * Utility for mapping blockchain IDs to their logo files
 */

/**
 * Direct mapping from blockchain IDs to logo files in /cc directory
 */
export const blockchainLogoMap: Record<string, string> = {
  'arbitrum-one': '/cc/arbitrum.png',
  'base': '/cc/base.png',
  'fantom': '/cc/fantom.png',
  'optimistic-ethereum': '/cc/optimism.png',
  'ronin': '/cc/ronin.png',
  'sei-v2': '/cc/sei.png',
  'sui': '/cc/sui.png',
  'xai': '/cc/xai.png',
};

/**
 * Map blockchain ID to a cryptocurrency symbol for icon lookup
 */
export const blockchainSymbolMap: Record<string, string> = {
  'ethereum': 'ETH',
  'bitcoin': 'BTC',
  'binance-smart-chain': 'BNB',
  'solana': 'SOL',
  'polygon-pos': 'MATIC',
  'avalanche': 'AVAX',
  'tron': 'TRX',
  'cardano': 'ADA',
  'cosmos': 'ATOM',
  'polkadot': 'DOT',
  'near-protocol': 'NEAR',
  'internet-computer': 'ICP',
  'celestia': 'TIA'
};

/**
 * Get the logo URL for a blockchain
 * @param blockchainId The blockchain ID
 * @returns The URL to the blockchain logo
 */
export function getBlockchainLogoUrl(blockchainId: string): string {
  // First check if we have a direct PNG in /cc directory
  if (blockchainLogoMap[blockchainId]) {
    return blockchainLogoMap[blockchainId];
  }
  
  // Get the symbol for this blockchain
  const symbol = blockchainSymbolMap[blockchainId] || blockchainId.toUpperCase();
  
  // Fallback to cryptocurrency icons
  return `/crypto-icons/color/${symbol.toLowerCase()}.svg`;
}
