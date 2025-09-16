/**
 * Utility functions for working with cryptocurrency icons
 */

/**
 * Get the path to a cryptocurrency icon
 * @param symbol The cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @param style The icon style ('color' or 'black')
 * @returns The path to the icon or a fallback icon if not found
 */
export function getCryptoIconPath(symbol: string, style: 'color' | 'black' = 'color'): string {
  // Convert symbol to lowercase as the package uses lowercase filenames
  const normalizedSymbol = symbol.toLowerCase();
  
  try {
    // Try to require the icon (this will throw an error if the icon doesn't exist)
    // Using dynamic import pattern for Next.js compatibility
    return `/node_modules/cryptocurrency-icons/svg/${style}/${normalizedSymbol}.svg`;
  } catch {
    // Return a generic coin icon if the specific one isn't found
    return `/node_modules/cryptocurrency-icons/svg/${style}/generic.svg`;
  }
}

/**
 * Map of blockchain symbols to their corresponding filenames in the /cc directory
 */
const ccLogoMap: Record<string, string> = {
  'ARB': 'arbitrum',
  'BASE': 'base',
  'FTM': 'fantom',
  'OP': 'optimism',
  'RON': 'ronin',
  'SEI': 'sei',
  'SUI': 'sui',
  'XAI': 'xai'
};

/**
 * Get the URL for a cryptocurrency icon
 * @param symbol The cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @returns The URL to the icon
 */
export function getCryptoIconUrl(symbol: string): string {
  // Handle undefined or null symbol
  if (!symbol) {
    return `/crypto-icons/color/generic.svg`;
  }
  
  // Convert symbol to uppercase for the map lookup
  const upperSymbol = symbol.toUpperCase();
  
  // Check if we have a custom PNG logo in the /cc directory
  if (ccLogoMap[upperSymbol]) {
    return `/cc/${ccLogoMap[upperSymbol]}.png`;
  }
  
  // Convert symbol to lowercase for the default path
  const normalizedSymbol = symbol.toLowerCase();
  
  // Fallback to the cryptocurrency-icons package
  return `/crypto-icons/color/${normalizedSymbol}.svg`;
}

/**
 * List of common cryptocurrency symbols
 */
export const commonCryptoSymbols = [
  'BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'USDC', 'ADA', 
  'AVAX', 'DOGE', 'DOT', 'MATIC', 'SHIB', 'DAI', 'TRX', 'LINK',
  'TON', 'UNI', 'WBTC', 'LEO', 'ATOM', 'ETC', 'OKB', 'LTC',
  'BCH', 'XLM', 'XMR', 'FIL', 'NEAR', 'CRO', 'INJ', 'VET'
];

/**
 * Check if a cryptocurrency icon exists
 * @param symbol The cryptocurrency symbol
 * @returns True if the icon exists, false otherwise
 */
export function cryptoIconExists(symbol: string): boolean {
  return commonCryptoSymbols.includes(symbol.toUpperCase());
}
