/**
 * Mapping of cryptocurrency symbols to their full names
 */
export const cryptoNames: Record<string, string> = {
  'BTC': 'Bitcoin',
  'ETH': 'Ethereum',
  'USDT': 'Tether',
  'BNB': 'Binance Coin',
  'SOL': 'Solana',
  'XRP': 'XRP',
  'USDC': 'USD Coin',
  'ADA': 'Cardano',
  'AVAX': 'Avalanche',
  'DOGE': 'Dogecoin',
  'DOT': 'Polkadot',
  'MATIC': 'Polygon',
  'SHIB': 'Shiba Inu',
  'DAI': 'Dai',
  'TRX': 'TRON',
  'LINK': 'Chainlink',
  'TON': 'Toncoin',
  'UNI': 'Uniswap',
  'WBTC': 'Wrapped Bitcoin',
  'LEO': 'LEO Token',
  'ATOM': 'Cosmos',
  'ETC': 'Ethereum Classic',
  'OKB': 'OKB',
  'LTC': 'Litecoin',
  'BCH': 'Bitcoin Cash',
  'XLM': 'Stellar',
  'XMR': 'Monero',
  'FIL': 'Filecoin',
  'NEAR': 'NEAR Protocol',
  'CRO': 'Cronos',
  'INJ': 'Injective',
  'VET': 'VeChain',
  'ARB': 'Arbitrum',
  'BASE': 'Base',
  'FTM': 'Fantom',
  'OP': 'Optimism',
  'RON': 'Ronin',
  'SEI': 'Sei',
  'SUI': 'Sui',
  'XAI': 'Xai'
};

/**
 * Get the full name of a cryptocurrency by its symbol
 * @param symbol The cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @returns The full name of the cryptocurrency or the symbol if not found
 */
export function getCryptoName(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  return cryptoNames[upperSymbol] || upperSymbol;
}
