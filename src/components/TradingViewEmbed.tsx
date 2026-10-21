'use client';

import { useEffect, useId, useRef } from 'react';

type TradingViewEmbedProps = {
  scriptSrc: string;
  config: Record<string, unknown>;
  className?: string;
  height?: number | string;
};

/**
 * Mounts a TradingView external-embedding widget script inside a container.
 * @see https://www.tradingview.com/widget-docs/
 */
export default function TradingViewEmbed({
  scriptSrc,
  config,
  className = '',
  height,
}: TradingViewEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const configKey = JSON.stringify(config);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const widgetEl = document.createElement('div');
    widgetEl.className = 'tradingview-widget-container__widget';
    if (height) {
      widgetEl.style.height = typeof height === 'number' ? `${height}px` : height;
      widgetEl.style.width = '100%';
    }
    container.appendChild(widgetEl);

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = configKey;
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [scriptSrc, configKey, height, reactId]);

  return (
    <div
      className={`tradingview-widget-container ${className}`}
      ref={containerRef}
      style={height ? { height: typeof height === 'number' ? `${height}px` : height } : undefined}
    />
  );
}
