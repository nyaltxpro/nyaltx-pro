'use client';

import TradingViewEmbed from '@/components/TradingViewEmbed';
import { toTradingViewSymbol } from '@/lib/tradingViewSymbol';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';

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

function WidgetCard({
  title,
  children,
  className = '',
  bodyClassName = '',
  style,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]/80 ${className}`}
      style={style}
    >
      {title ? (
        <header className="shrink-0 border-b border-white/10 px-4 py-2.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            {title}
          </h2>
        </header>
      ) : null}
      <div className={`relative min-h-0 flex-1 overflow-hidden ${bodyClassName}`}>{children}</div>
    </section>
  );
}

type StockProfileProps = {
  symbol: string;
};

export default function StockProfile({ symbol }: StockProfileProps) {
  const [security, setSecurity] = useState<SecurityDetail | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const underlying = symbol.includes(':')
    ? symbol.slice(symbol.lastIndexOf(':') + 1).toUpperCase()
    : symbol.toUpperCase();

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
        const res = await fetch(
          `/api/tokenized-securities?mode=symbol&symbol=${encodeURIComponent(underlying)}`,
        );
        const data = await res.json();
        if (!cancelled) setSecurity(data.security || null);
      } catch {
        if (!cancelled) setSecurity(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [underlying]);

  const displayName = security?.name?.replace(/ xStock$/i, '') || underlying;

  return (
    <div className="min-h-screen w-full px-3 py-5 sm:px-4 lg:px-6">
      <div className="mb-4">
        <Link
          href="/dashboard/tokenized-securities"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:text-white"
        >
          <ArrowLeftIcon />
          Board
        </Link>
      </div>

      {/* Full-width ticker tape — clicks go to our stock profile via largeChartUrl */}
      <WidgetCard className="mb-4" title="Ticker tape">
        <div className="min-h-[72px]">
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
              largeChartUrl: origin
                ? `${origin}/dashboard/tokenized-securities`
                : '/dashboard/tokenized-securities',
            }}
          />
        </div>
      </WidgetCard>

      {/* Left 25% | Center 50% | Right 25% (mini + company + market) */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr_1fr] lg:items-stretch">
        <div className="flex flex-col gap-4">
          <WidgetCard
            bodyClassName="h-[440px]"
            title="Symbol info"
          >
            <TradingViewEmbed
              fill
              heightPx={440}
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
              config={{
                symbol: tvSymbol,
                width: '100%',
                locale: 'en',
                colorTheme: 'dark',
                isTransparent: true,
              }}
            />
          </WidgetCard>
          <WidgetCard
            bodyClassName="h-[440px]"
            title="Market overview"
          >
            <TradingViewEmbed
              fill
              heightPx={440}
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
              config={{
                colorTheme: 'dark',
                dateRange: '12M',
                showChart: true,
                locale: 'en',
                width: '100%',
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
          </WidgetCard>
        </div>

        <div className="flex flex-col gap-4">
          <WidgetCard
            bodyClassName="h-[440px]"
            title="Advanced chart"
          >
            <TradingViewEmbed
              fill
              heightPx={440}
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
              config={{
                symbol: tvSymbol,
                interval: 'D',
                timezone: 'Etc/UTC',
                theme: 'dark',
                style: '1',
                locale: 'en',
                allow_symbol_change: true,
                calendar: false,
                hide_top_toolbar: false,
                support_host: 'https://www.tradingview.com',
              }}
            />
          </WidgetCard>
          <WidgetCard bodyClassName="h-[440px]" title="Top stories">
            <TradingViewEmbed
              fill
              heightPx={440}
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
              config={{
                feedMode: 'symbol',
                symbol: tvSymbol,
                colorTheme: 'dark',
                isTransparent: true,
                displayMode: 'regular',
                width: '100%',
                locale: 'en',
              }}
            />
          </WidgetCard>
        </div>

        <div className="flex flex-col gap-4">
          <WidgetCard
            className="flex-1"
            style={{ minHeight: 320 }}
            bodyClassName="h-[280px]"
            title="Mini chart"
          >
            <TradingViewEmbed
              fill
              heightPx={280}
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js"
              config={{
                symbol: tvSymbol,
                width: '100%',
                locale: 'en',
                dateRange: '12M',
                colorTheme: 'dark',
                isTransparent: true,
                largeChartUrl: '',
              }}
            />
          </WidgetCard>
          <WidgetCard
            className="flex-1"
            style={{ minHeight: 320 }}
            bodyClassName="h-[280px]"
            title="Company profile"
          >
            <TradingViewEmbed
              fill
              heightPx={280}
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js"
              config={{
                width: '100%',
                colorTheme: 'dark',
                isTransparent: true,
                symbol: tvSymbol,
                locale: 'en',
              }}
            />
          </WidgetCard>
          <WidgetCard
            className="flex-1"
            style={{ minHeight: 320 }}
            bodyClassName="h-[280px]"
            title="Technical analysis"
          >
            <TradingViewEmbed
              fill
              heightPx={280}
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
              config={{
                interval: '1D',
                width: '100%',
                isTransparent: true,
                symbol: tvSymbol,
                showIntervalTabs: true,
                displayMode: 'single',
                locale: 'en',
                colorTheme: 'dark',
              }}
            />
          </WidgetCard>
        </div>
      </div>

    </div>
  );
}
