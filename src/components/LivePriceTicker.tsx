'use client';

import TickerTapeRow from '@/components/TickerTapeRow';
import { FAMOUS_TV_STOCKS } from '@/lib/famousStocks';
import { toTradingViewSymbol } from '@/lib/tradingViewSymbol';
import { BarChartIcon, CubeIcon } from '@radix-ui/react-icons';
import { useEffect, useMemo, useState } from 'react';

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

const LivePriceTicker: React.FC = () => {
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

  // Top 100 famous TV stocks; enrich names from xStocks when available.
  const xStockSymbols = useMemo(() => {
    const byUnderlying = new Map<string, TickerSecurity>();
    for (const s of securities) {
      const key = (s.underlyingSymbol || s.symbol.replace(/x$/i, '') || s.symbol).toUpperCase();
      if (key && !byUnderlying.has(key)) byUnderlying.set(key, s);
    }

    return FAMOUS_TV_STOCKS.map(stock => {
      const matched = byUnderlying.get(stock.underlying.toUpperCase());
      const exchange = matched?.underlyingExchange || stock.exchange;
      return {
        description: matched?.name?.replace(/ xStock$/i, '') || stock.description,
        proName: toTradingViewSymbol(stock.underlying, exchange),
      };
    });
  }, [securities]);

  // Dedicated /go route server-redirects to profile (no board flash).
  const xStocksChartUrl = origin
    ? `${origin}/dashboard/tokenized-securities/go`
    : '/dashboard/tokenized-securities/go'

  const digitalAssetsChartUrl = origin
    ? `${origin}/dashboard/trending`
    : '/dashboard/trending';

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
};

export default LivePriceTicker;
