'use client';

import TradingViewEmbed from '@/components/TradingViewEmbed';
import Link from 'next/link';
import type { ReactNode } from 'react';

export type TickerTapeSymbol = {
  description: string;
  proName: string;
};

type TickerTapeRowProps = {
  label: string;
  href: string;
  icon: ReactNode;
  accentClassName: string;
  iconClassName: string;
  symbols: TickerTapeSymbol[];
  largeChartUrl: string;
  loading?: boolean;
  borderClassName?: string;
};

export default function TickerTapeRow({
  label,
  href,
  icon,
  accentClassName,
  iconClassName,
  symbols,
  largeChartUrl,
  loading = false,
  borderClassName = 'border-b border-gray-800/50',
}: TickerTapeRowProps) {
  return (
    <div
      className={`w-full bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-lg ${borderClassName}`}
      style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
    >
      <div className="flex items-stretch">
        <Link
          href={href}
          className="flex shrink-0 items-center gap-2 border-r border-gray-800/60 px-4 py-2 transition hover:bg-white/5"
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconClassName}`}
          >
            {icon}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold tracking-wide ${accentClassName}`}
              style={{
                fontFamily:
                  'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
            >
              {label}
            </span>
            <span className={`h-2 w-2 animate-pulse rounded-full ${accentClassName.replace('text-', 'bg-')}`} />
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
}
