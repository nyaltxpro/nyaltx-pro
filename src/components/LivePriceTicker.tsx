'use client';

import TradingViewEmbed from '@/components/TradingViewEmbed';
import { toTradingViewSymbol } from '@/lib/tradingViewSymbol';
import { BarChartIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type TickerSecurity = {
  id: string;
  name: string;
  symbol: string;
  underlyingSymbol: string;
  underlyingExchange: string;
};

const SYNC_MS = 5 * 60 * 1000;

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
        const res = await fetch('/api/tokenized-securities?mode=ticker&limit=24');
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

  const symbols = useMemo(
    () =>
      securities.map(s => {
        const underlying = s.underlyingSymbol || s.symbol.replace(/x$/i, '') || s.symbol;
        return {
          description: (s.name || underlying).replace(/ xStock$/i, ''),
          proName: toTradingViewSymbol(underlying, s.underlyingExchange),
        };
      }),
    [securities],
  );

  // Clicks append ?tvwidgetsymbol=EXCHANGE:SYMBOL — board page redirects to our profile.
  const largeChartUrl = origin
    ? `${origin}/dashboard/tokenized-securities`
    : '/dashboard/tokenized-securities';

  return (
    <div
      className="w-full border-y border-gray-800/50 bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-lg"
      style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
    >
      <div className="flex items-stretch">
        <Link
          href="/dashboard/tokenized-securities"
          className="flex shrink-0 items-center gap-2 border-r border-gray-800/60 px-4 py-2 transition hover:bg-white/5"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-[#00d4aa] to-[#3b82f6]">
            <BarChartIcon className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold tracking-wide text-[#00d4aa]"
              style={{
                fontFamily:
                  'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
            >
              TOKENIZED SECURITIES
            </span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00d4aa]" />
          </div>
        </Link>

        <div className="min-h-[46px] min-w-0 flex-1 overflow-hidden">
          {loading && symbols.length === 0 ? (
            <div className="flex h-full items-center px-4 text-sm text-gray-400">
              Loading ticker tape…
            </div>
          ) : symbols.length === 0 ? null : (
            <TradingViewEmbed
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
              config={{
                symbols,
                showSymbolLogo: true,
                colorTheme: 'dark',
                isTransparent: true,
                displayMode: 'adaptive',
                locale: 'en',
                largeChartUrl,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LivePriceTicker;
