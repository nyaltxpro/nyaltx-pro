'use client';

import TickerTapeRow from '@/components/TickerTapeRow';
import { FAMOUS_TV_STOCKS } from '@/lib/famousStocks';
import { toTradingViewSymbol } from '@/lib/tradingViewSymbol';
import { BarChartIcon, CubeIcon } from '@radix-ui/react-icons';
import { Component, type ReactNode, useEffect, useMemo, useState } from 'react';

type TickerSecurity = {
  id: string;
  name: string;
  symbol: string;
  underlyingSymbol: string;
  underlyingExchange: string;
};

const SYNC_MS = 5 * 60 * 1000;

const DIGITAL_ASSET_SYMBOLS = [
  { description: 'Bitcoin', proName: 'BINANCE:BTCUSDT' },
  { description: 'Ethereum', proName: 'BINANCE:ETHUSDT' },
  { description: 'Solana', proName: 'BINANCE:SOLUSDT' },
  { description: 'BNB', proName: 'BINANCE:BNBUSDT' },
  { description: 'XRP', proName: 'BINANCE:XRPUSDT' },
  { description: 'Dogecoin', proName: 'BINANCE:DOGEUSDT' },
  { description: 'Cardano', proName: 'BINANCE:ADAUSDT' },
  { description: 'Avalanche', proName: 'BINANCE:AVAXUSDT' },
  { description: 'Chainlink', proName: 'BINANCE:LINKUSDT' },
  { description: 'Polkadot', proName: 'BINANCE:DOTUSDT' },
  { description: 'Near', proName: 'BINANCE:NEARUSDT' },
  { description: 'Uniswap', proName: 'BINANCE:UNIUSDT' },
  { description: 'Litecoin', proName: 'BINANCE:LTCUSDT' },
  { description: 'Cosmos', proName: 'BINANCE:ATOMUSDT' },
];

class TickerErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full border-y border-gray-800/50 bg-black/80 px-4 py-3 text-sm text-gray-500">
          Market tickers temporarily unavailable
        </div>
      );
    }
    return this.props.children;
  }
}

type LivePriceTickerProps = {
  /** Fewer symbols / lighter load (e.g. on stock profile pages). */
  compact?: boolean;
};

function LivePriceTickerInner({ compact = false }: LivePriceTickerProps) {
  const [securities, setSecurities] = useState<TickerSecurity[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchTicker = async () => {
      try {
        const res = await fetch('/api/tokenized-securities?mode=ticker&limit=100');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load ticker');
        if (!cancelled) {
          setSecurities(Array.isArray(data.securities) ? data.securities : []);
        }
      } catch (err) {
        console.error('Tokenized securities ticker error:', err);
        if (!cancelled) setSecurities([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTicker();
    const id = window.setInterval(fetchTicker, SYNC_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const xStockSymbols = useMemo(() => {
    const byUnderlying = new Map<string, TickerSecurity>();
    for (const s of securities) {
      const key = (s.underlyingSymbol || s.symbol.replace(/x$/i, '') || s.symbol).toUpperCase();
      if (key && !byUnderlying.has(key)) byUnderlying.set(key, s);
    }

    const list = compact ? FAMOUS_TV_STOCKS.slice(0, 30) : FAMOUS_TV_STOCKS;

    return list.map(stock => {
      const matched = byUnderlying.get(stock.underlying.toUpperCase());
      const exchange = matched?.underlyingExchange || stock.exchange;
      return {
        description: matched?.name?.replace(/ xStock$/i, '') || stock.description,
        proName: toTradingViewSymbol(stock.underlying, exchange),
      };
    });
  }, [securities, compact]);

  const xStocksChartUrl = origin
    ? `${origin}/dashboard/tokenized-securities/go`
    : '/dashboard/tokenized-securities/go';

  const digitalAssetsChartUrl = origin
    ? `${origin}/dashboard/trending`
    : '/dashboard/trending';

  // Wait for origin so largeChartUrl is absolute (TV needs it for click routing).
  if (!origin) {
    return <div className="min-h-[92px] w-full border-y border-gray-800/50 bg-black/80" />;
  }

  return (
    <div className="w-full border-y border-gray-800/50">
      <TickerTapeRow
        label="TOKENIZED XSTOCKS"
        href="/dashboard/tokenized-securities"
        icon={<BarChartIcon className="h-4 w-4 text-white" />}
        accentClassName="text-[#00d4aa]"
        iconClassName="bg-gradient-to-r from-[#00d4aa] to-[#3b82f6]"
        symbols={xStockSymbols}
        largeChartUrl={xStocksChartUrl}
        loading={loading && xStockSymbols.length === 0}
        borderClassName="border-b border-gray-800/40"
      />
      <TickerTapeRow
        label="DIGITAL ASSETS"
        href="/dashboard/trending"
        icon={<CubeIcon className="h-4 w-4 text-white" />}
        accentClassName="text-cyan-400"
        iconClassName="bg-gradient-to-r from-cyan-500 to-blue-600"
        symbols={DIGITAL_ASSET_SYMBOLS}
        largeChartUrl={digitalAssetsChartUrl}
        borderClassName=""
      />
    </div>
  );
}

export default function LivePriceTicker({ compact = false }: LivePriceTickerProps) {
  return (
    <TickerErrorBoundary>
      <LivePriceTickerInner compact={compact} />
    </TickerErrorBoundary>
  );
}
