'use client';

import TradingViewEmbed from '@/components/TradingViewEmbed';
import { toTradingViewSymbol } from '@/lib/tradingViewSymbol';
import { ArrowLeftIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type SecurityDetail = {
  id: string;
  name: string;
  symbol: string;
  underlyingSymbol: string;
  underlyingExchange: string;
  logo: string | null;
  isTradingHalted: boolean;
  openNow: boolean;
  tradingPeriod: string | null;
  networks: string[];
  tokenizedPrice: number | null;
  traditionalPrice: number | null;
  spread: number | null;
  spreadBps: number | null;
};

const formatUsd = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value >= 100 ? 2 : 4,
  }).format(value);
};

const RELATED_TAPE = [
  { description: 'Apple', proName: 'NASDAQ:AAPL' },
  { description: 'Tesla', proName: 'NASDAQ:TSLA' },
  { description: 'NVIDIA', proName: 'NASDAQ:NVDA' },
  { description: 'Microsoft', proName: 'NASDAQ:MSFT' },
  { description: 'Amazon', proName: 'NASDAQ:AMZN' },
  { description: 'Alphabet', proName: 'NASDAQ:GOOGL' },
  { description: 'Meta', proName: 'NASDAQ:META' },
  { description: 'Visa', proName: 'NYSE:V' },
  { description: 'JPMorgan', proName: 'NYSE:JPM' },
];

type StockProfileProps = {
  symbol: string;
};

export default function StockProfile({ symbol }: StockProfileProps) {
  const [security, setSecurity] = useState<SecurityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const underlying = symbol.toUpperCase();

  const tvSymbol = useMemo(
    () =>
      toTradingViewSymbol(
        security?.underlyingSymbol || underlying,
        security?.underlyingExchange,
      ),
    [security, underlying],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/tokenized-securities?mode=symbol&symbol=${encodeURIComponent(underlying)}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load security');
        if (!cancelled) setSecurity(data.security || null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load security');
          setSecurity(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [underlying]);

  const displayName = security?.name?.replace(/ xStock$/i, '') || underlying;
  const tokenSymbol = security?.symbol;

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/tokenized-securities"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:text-white"
        >
          <ArrowLeftIcon />
          Back to board
        </Link>
        <a
          href={`https://www.tradingview.com/symbols/${encodeURIComponent(tvSymbol.replace(':', '-'))}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-3 py-2 text-sm text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
        >
          TradingView
          <ExternalLinkIcon />
        </a>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1628] via-[#0b1220] to-[#061018] p-6">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/10 bg-white/5">
              {security?.logo ? (
                <Image
                  src={security.logo}
                  alt={underlying}
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                  {underlying.slice(0, 2)}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#00d4aa]/80">
                Stock profile
              </p>
              <h1 className="text-2xl font-semibold text-white md:text-3xl">
                {displayName}{' '}
                <span className="text-gray-400">({underlying})</span>
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                {security?.underlyingExchange || '—'}
                {tokenSymbol ? ` · Tokenized ${tokenSymbol}` : ''}
                {loading ? ' · Loading…' : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-2">
              <div className="text-[10px] uppercase tracking-wide text-gray-500">Traditional</div>
              <div className="font-mono text-white">{formatUsd(security?.traditionalPrice ?? null)}</div>
            </div>
            <div className="rounded-xl border border-[#00d4aa]/20 bg-[#00d4aa]/10 px-4 py-2">
              <div className="text-[10px] uppercase tracking-wide text-[#00d4aa]/80">Tokenized</div>
              <div className="font-mono text-[#00d4aa]">
                {formatUsd(security?.tokenizedPrice ?? null)}
              </div>
            </div>
          </div>
        </div>
        {error && (
          <p className="relative z-10 mt-4 text-sm text-amber-300/90">
            {error} — showing TradingView widgets for {tvSymbol}.
          </p>
        )}
      </div>

      {/* Tickers */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        <TradingViewEmbed
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
          config={{
            symbols: [
              { description: displayName, proName: tvSymbol },
              ...RELATED_TAPE.filter(s => s.proName !== tvSymbol),
            ],
            showSymbolLogo: true,
            colorTheme: 'dark',
            isTransparent: true,
            displayMode: 'adaptive',
            locale: 'en',
          }}
        />
      </section>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 lg:col-span-2">
          <TradingViewEmbed
            scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
            config={{
              symbol: tvSymbol,
              width: '100%',
              locale: 'en',
              colorTheme: 'dark',
              isTransparent: true,
            }}
          />
        </section>
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-2">
          <TradingViewEmbed
            scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js"
            config={{
              symbol: tvSymbol,
              colorTheme: 'dark',
              isTransparent: true,
              locale: 'en',
              width: '100%',
            }}
          />
        </section>
      </div>

      {/* Charts */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30" style={{ height: 560 }}>
        <TradingViewEmbed
          height="100%"
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
          config={{
            autosize: true,
            symbol: tvSymbol,
            interval: 'D',
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1',
            locale: 'en',
            allow_symbol_change: true,
            calendar: false,
            support_host: 'https://www.tradingview.com',
          }}
        />
      </section>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/30" style={{ height: 420 }}>
          <TradingViewEmbed
            height="100%"
            scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
            config={{
              symbols: [[tvSymbol, `${underlying}|1D`]],
              chartOnly: false,
              width: '100%',
              height: '100%',
              locale: 'en',
              colorTheme: 'dark',
              autosize: true,
              showVolume: false,
              showMA: false,
              hideDateRanges: false,
              hideMarketStatus: false,
              hideSymbolLogo: false,
              scalePosition: 'right',
              scaleMode: 'Normal',
              fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
              fontSize: '10',
              noTimeScale: false,
              valuesTracking: '1',
              changeMode: 'price-and-percent',
              chartType: 'area',
              lineWidth: 2,
              lineType: 0,
              dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M'],
            }}
          />
        </section>
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/30" style={{ height: 420 }}>
          <TradingViewEmbed
            height="100%"
            scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js"
            config={{
              symbol: tvSymbol,
              width: '100%',
              height: '100%',
              locale: 'en',
              dateRange: '12M',
              colorTheme: 'dark',
              isTransparent: true,
              autosize: true,
              largeChartUrl: '',
            }}
          />
        </section>
      </div>

      {/* Symbol details */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30" style={{ height: 400 }}>
        <TradingViewEmbed
          height="100%"
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js"
          config={{
            width: '100%',
            height: '100%',
            colorTheme: 'dark',
            isTransparent: true,
            symbol: tvSymbol,
            locale: 'en',
          }}
        />
      </section>

      <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30" style={{ height: 500 }}>
        <TradingViewEmbed
          height="100%"
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-financials.js"
          config={{
            colorTheme: 'dark',
            isTransparent: true,
            largeChartUrl: '',
            displayMode: 'adaptive',
            width: '100%',
            height: '100%',
            symbol: tvSymbol,
            locale: 'en',
          }}
        />
      </section>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/30" style={{ height: 440 }}>
          <TradingViewEmbed
            height="100%"
            scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
            config={{
              interval: '1D',
              width: '100%',
              isTransparent: true,
              height: '100%',
              symbol: tvSymbol,
              showIntervalTabs: true,
              displayMode: 'single',
              locale: 'en',
              colorTheme: 'dark',
            }}
          />
        </section>
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/30" style={{ height: 440 }}>
          <TradingViewEmbed
            height="100%"
            scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
            config={{
              feedMode: 'symbol',
              symbol: tvSymbol,
              colorTheme: 'dark',
              isTransparent: true,
              displayMode: 'regular',
              width: '100%',
              height: '100%',
              locale: 'en',
            }}
          />
        </section>
      </div>

      {/* Watchlists / market context */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30" style={{ height: 480 }}>
        <TradingViewEmbed
          height="100%"
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
          config={{
            colorTheme: 'dark',
            dateRange: '12M',
            showChart: true,
            locale: 'en',
            width: '100%',
            height: '100%',
            largeChartUrl: '',
            isTransparent: true,
            showSymbolLogo: true,
            showFloatingTooltip: false,
            plotLineColorGrowing: 'rgba(0, 212, 170, 1)',
            plotLineColorFalling: 'rgba(239, 68, 68, 1)',
            gridLineColor: 'rgba(255, 255, 255, 0.06)',
            scaleFontColor: 'rgba(160, 169, 184, 1)',
            belowLineFillColorGrowing: 'rgba(0, 212, 170, 0.12)',
            belowLineFillColorFalling: 'rgba(239, 68, 68, 0.12)',
            symbolActiveColor: 'rgba(0, 212, 170, 0.12)',
            tabs: [
              {
                title: 'Indices',
                symbols: [
                  { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' },
                  { s: 'FOREXCOM:NSXUSD', d: 'US 100' },
                  { s: 'FOREXCOM:DJI', d: 'Dow 30' },
                ],
              },
              {
                title: 'Related',
                symbols: RELATED_TAPE.slice(0, 6).map(s => ({
                  s: s.proName,
                  d: s.description,
                })),
              },
            ],
          }}
        />
      </section>

      {/* Heatmaps */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30" style={{ height: 520 }}>
        <TradingViewEmbed
          height="100%"
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js"
          config={{
            exchanges: [],
            dataSource: 'SPX500',
            grouping: 'sector',
            blockSize: 'market_cap_basic',
            blockColor: 'change',
            locale: 'en',
            colorTheme: 'dark',
            hasTopBar: true,
            isDataSetEnabled: true,
            isZoomEnabled: true,
            hasSymbolTooltip: true,
            isMonoSize: false,
            width: '100%',
            height: '100%',
          }}
        />
      </section>

      {/* Screener */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30" style={{ height: 520 }}>
        <TradingViewEmbed
          height="100%"
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-screener.js"
          config={{
            width: '100%',
            height: '100%',
            defaultColumn: 'overview',
            defaultScreen: 'most_capitalized',
            market: 'america',
            showToolbar: true,
            colorTheme: 'dark',
            locale: 'en',
            isTransparent: true,
          }}
        />
      </section>

      {/* Calendar */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30" style={{ height: 520 }}>
        <TradingViewEmbed
          height="100%"
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-events.js"
          config={{
            colorTheme: 'dark',
            isTransparent: true,
            width: '100%',
            height: '100%',
            locale: 'en',
            importanceFilter: '-1,0,1',
            countryFilter: 'us',
          }}
        />
      </section>

      {/* Market data / economics context */}
      <section className="mb-2 overflow-hidden rounded-2xl border border-white/10 bg-black/30" style={{ height: 520 }}>
        <TradingViewEmbed
          height="100%"
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
          config={{
            width: '100%',
            height: '100%',
            symbolsGroups: [
              {
                name: 'US indices',
                symbols: [
                  { name: 'FOREXCOM:SPXUSD', displayName: 'S&P 500' },
                  { name: 'FOREXCOM:NSXUSD', displayName: 'US 100' },
                  { name: 'FOREXCOM:DJI', displayName: 'Dow 30' },
                ],
              },
              {
                name: 'Related stocks',
                symbols: RELATED_TAPE.slice(0, 8).map(s => ({
                  name: s.proName,
                  displayName: s.description,
                })),
              },
            ],
            showSymbolLogo: true,
            isTransparent: true,
            colorTheme: 'dark',
            locale: 'en',
          }}
        />
      </section>

      <p className="mt-4 text-center text-xs text-gray-500">
        Charts and market data via{' '}
        <a
          href="https://www.tradingview.com/widget-docs/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00d4aa] hover:underline"
        >
          TradingView Widgets
        </a>
        . Informational only — not a trading venue.
      </p>
    </div>
  );
}
