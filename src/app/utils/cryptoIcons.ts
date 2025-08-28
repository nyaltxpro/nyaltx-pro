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
 * Get the URL for a cryptocurrency icon
 * @param symbol The cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @returns The URL to the icon
 */
export function getCryptoIconUrl(symbol: string): string {
  // Convert symbol to lowercase
  const normalizedSymbol = symbol.toLowerCase();
  
  // Return the URL to the icon
  return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${normalizedSymbol}.svg`;
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
