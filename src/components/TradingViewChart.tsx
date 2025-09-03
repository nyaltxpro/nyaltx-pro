'use client';

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewChartProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
  interval?: string;
  timezone?: string;
  style?: string;
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = 'SOLUSDT',
  theme = 'dark',
  width = '100%',
  height = 500,
  interval = '1D',
  timezone = 'Etc/UTC',
  style = '1',
  locale = 'en',
  toolbar_bg = '#f1f3f6',
  enable_publishing = false,
  allow_symbol_change = true,
  container_id
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const containerId = container_id || `tradingview_${Math.random().toString(36).substr(2, 9)}`;
    
    // Clean up previous widget
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (e) {
        console.log('Error removing previous widget:', e);
      }
    }

    // Clean up previous script
    if (scriptRef.current && document.head.contains(scriptRef.current)) {
      document.head.removeChild(scriptRef.current);
    }

    // Create new script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        try {
          widgetRef.current = new window.TradingView.widget({
            autosize: width === '100%',
            width: width,
            height: height,
            symbol: symbol,
            interval: interval,
            timezone: timezone,
            theme: theme,
            style: style,
            locale: locale,
            toolbar_bg: toolbar_bg,
            enable_publishing: enable_publishing,
            allow_symbol_change: allow_symbol_change,
            container_id: containerId,
            // Additional configurations for better appearance
            hide_side_toolbar: false,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            studies: [
              'Volume@tv-basicstudies',
              'MACD@tv-basicstudies'
            ],
            overrides: {
              'paneProperties.background': theme === 'dark' ? '#1a1a1a' : '#ffffff',
              'paneProperties.vertGridProperties.color': theme === 'dark' ? '#2a2a2a' : '#e1e1e1',
              'paneProperties.horzGridProperties.color': theme === 'dark' ? '#2a2a2a' : '#e1e1e1',
              'symbolWatermarkProperties.transparency': 90,
              'scalesProperties.textColor': theme === 'dark' ? '#b2b5be' : '#363c4e',
              'scalesProperties.backgroundColor': theme === 'dark' ? '#1a1a1a' : '#ffffff',
            }
          });
        } catch (error) {
          console.error('Error creating TradingView widget:', error);
        }
      }
    };

    scriptRef.current = script;
    document.head.appendChild(script);

    // Set container ID
    if (containerRef.current) {
      containerRef.current.id = containerId;
    }

    return () => {
      // Cleanup
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          console.log('Error during cleanup:', e);
        }
        widgetRef.current = null;
      }
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        try {
          document.head.removeChild(scriptRef.current);
        } catch (e) {
          console.log('Error removing script during cleanup:', e);
        }
        scriptRef.current = null;
      }
    };
  }, [symbol, theme, width, height, interval, timezone, style, locale, toolbar_bg, enable_publishing, allow_symbol_change, container_id]);

  return (
    <div className="tradingview-widget-container">
      <div 
        ref={containerRef}
        className="tradingview-widget"
        style={{ 
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

export default memo(TradingViewChart);
