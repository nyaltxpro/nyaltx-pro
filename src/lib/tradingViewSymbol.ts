/** Map xStocks exchange labels to TradingView {EXCHANGE}:{SYMBOL} form. */

const EXCHANGE_MAP: Record<string, string> = {
  NASDAQ: 'NASDAQ',
  NYSE: 'NYSE',
  AMEX: 'AMEX',
  'NYSE ARCA': 'AMEX',
  ARCA: 'AMEX',
  BATS: 'BATS',
  CBOE: 'CBOE',
  OTC: 'OTC',
  TSX: 'TSX',
  LSE: 'LSE',
  HKEX: 'HKEX',
};

/** Tickers that are usually listed on NYSE when exchange is missing/unknown. */
const NYSE_DEFAULTS = new Set([
  'V',
  'JPM',
  'WMT',
  'XOM',
  'JNJ',
  'PG',
  'MA',
  'HD',
  'BAC',
  'KO',
  'DIS',
  'CRM',
  'IBM',
  'GE',
  'BA',
  'CAT',
  'GS',
  'AXP',
  'NKE',
  'MCD',
  'UNH',
  'LLY',
  'BRK.B',
  'SHOP',
  'BABA',
  'UBER',
  'ORCL',
]);

export function toTradingViewSymbol(
  underlyingSymbol: string,
  underlyingExchange?: string | null,
): string {
  const symbol = (underlyingSymbol || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!symbol) return 'NASDAQ:AAPL';

  const rawEx = (underlyingExchange || '').trim().toUpperCase();
  const mapped = EXCHANGE_MAP[rawEx];
  if (mapped) return `${mapped}:${symbol}`;

  if (rawEx.includes('NASDAQ')) return `NASDAQ:${symbol}`;
  if (rawEx.includes('NYSE')) return `NYSE:${symbol}`;

  if (NYSE_DEFAULTS.has(symbol)) return `NYSE:${symbol}`;
  return `NASDAQ:${symbol}`;
}

export function stockProfilePath(underlyingSymbol: string): string {
  const symbol = underlyingSymbol.trim().toUpperCase();
  return `/dashboard/tokenized-securities/${encodeURIComponent(symbol)}`;
}

/** Strip EXCHANGE: prefix from TradingView `tvwidgetsymbol` query values. */
export function underlyingFromTvWidgetSymbol(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw).trim().toUpperCase();
  if (!decoded) return null;
  const colon = decoded.lastIndexOf(':');
  const symbol = colon >= 0 ? decoded.slice(colon + 1) : decoded;
  return symbol || null;
}

const QUOTE_SUFFIXES = ['USDT', 'USDC', 'BUSD', 'USD', 'PERP'];

/**
 * From TradingView crypto symbols like BINANCE:BTCUSDT → BTC for /dashboard/trade?base=
 */
export function cryptoBaseFromTvWidgetSymbol(raw: string | null | undefined): string | null {
  const pair = underlyingFromTvWidgetSymbol(raw);
  if (!pair) return null;

  for (const quote of QUOTE_SUFFIXES) {
    if (pair.endsWith(quote) && pair.length > quote.length) {
      return pair.slice(0, -quote.length);
    }
  }
  return pair;
}

export function tokenTradePath(baseSymbol: string): string {
  const base = baseSymbol.trim().toUpperCase();
  return `/dashboard/trade?base=${encodeURIComponent(base)}`;
}
