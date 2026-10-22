'use client';

import { useEffect, useRef, useState } from 'react';

type TradingViewEmbedProps = {
  scriptSrc: string;
  config: Record<string, unknown>;
  className?: string;
  /** Fill parent when true (parent must have explicit height). */
  fill?: boolean;
  /** Explicit pixel height for the widget iframe/container. */
  heightPx?: number;
};

/**
 * Mounts a TradingView external-embedding widget script inside a container.
 * Only runs after client mount to avoid SSR/hydration blank pages.
 * @see https://www.tradingview.com/widget-docs/
 */
export default function TradingViewEmbed({
  scriptSrc,
  config,
  className = '',
  fill = false,
  heightPx,
}: TradingViewEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const mergedConfig = {
    ...config,
    ...(heightPx != null
      ? {
          height: heightPx,
          width: config.width ?? '100%',
          autosize: false,
        }
      : {}),
  };
  const configKey = JSON.stringify(mergedConfig);

  useEffect(() => {
    if (!ready) return;
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const widgetEl = document.createElement('div');
    widgetEl.className = 'tradingview-widget-container__widget';
    widgetEl.style.width = '100%';
    if (heightPx != null) {
      widgetEl.style.height = `${heightPx}px`;
    } else if (fill) {
      widgetEl.style.height = '100%';
    }
    container.appendChild(widgetEl);

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.type = 'text/javascript';
    script.async = true;
    script.text = configKey;
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [ready, scriptSrc, configKey, fill, heightPx]);

  return (
    <div
      className={`tradingview-widget-container h-full w-full ${className}`}
      ref={containerRef}
      style={heightPx != null ? { height: heightPx, minHeight: heightPx } : undefined}
    />
  );
}
