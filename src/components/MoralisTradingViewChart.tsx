'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MoralisTradingViewChartProps {
  tokenAddress: string;
  chainId?: string;
  width?: string;
  height?: string;
  defaultInterval?: string;
  theme?: 'light' | 'dark' | 'moralis';
  backgroundColor?: string;
  gridColor?: string;
  textColor?: string;
  candleUpColor?: string;
  candleDownColor?: string;
  hideLeftToolbar?: boolean;
  hideTopToolbar?: boolean;
  hideBottomToolbar?: boolean;
  className?: string;
}

declare global {
  interface Window {
    createMyWidget?: (containerId: string, config: any) => void;
  }
}

const MoralisTradingViewChart: React.FC<MoralisTradingViewChartProps> = ({
  tokenAddress,
  chainId = 'solana',
  width = '100%',
  height = '620px',
  defaultInterval = '1D',
  theme = 'moralis',
  backgroundColor = '#071321',
  gridColor = '#0d2035',
  textColor = '#68738D',
  candleUpColor = '#4CE666',
  candleDownColor = '#E64C4C',
  hideLeftToolbar = false,
  hideTopToolbar = false,
  hideBottomToolbar = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const widgetIdRef = useRef<string>('');

  useEffect(() => {
    if (!tokenAddress) {
      setError('Token address is required');
      setIsLoading(false);
      return;
    }

    // Generate unique container ID
    const containerId = `price-chart-widget-${Math.random().toString(36).substr(2, 9)}`;
    widgetIdRef.current = containerId;

    // Set container ID
    if (containerRef.current) {
      containerRef.current.id = containerId;
    }

    const loadWidget = () => {
      if (typeof window.createMyWidget === 'function') {
        try {
          window.createMyWidget(containerId, {
            width: width,
            height: height,
            chainId: chainId,
            tokenAddress: tokenAddress,
            defaultInterval: defaultInterval,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Etc/UTC',
            theme: theme,
            locale: 'en',
            backgroundColor: backgroundColor,
            gridColor: gridColor,
            textColor: textColor,
            candleUpColor: candleUpColor,
            candleDownColor: candleDownColor,
            hideLeftToolbar: hideLeftToolbar,
            hideTopToolbar: hideTopToolbar,
            hideBottomToolbar: hideBottomToolbar,
          });
          setIsLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error creating Moralis chart widget:', err);
          setError('Failed to load chart widget');
          setIsLoading(false);
        }
      } else {
        console.error('createMyWidget function is not defined.');
        setError('Chart widget library not loaded');
        setIsLoading(false);
      }
    };

    // Check if script already exists
    const existingScript = document.getElementById('moralis-chart-widget');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'moralis-chart-widget';
      script.src = 'https://moralis.com/static/embed/chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = loadWidget;
      script.onerror = () => {
        setError('Failed to load chart library');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    } else {
      // Script already exists, just load the widget
      loadWidget();
    }

    // Cleanup function
    return () => {
      // Clear the container content
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [
    tokenAddress,
    chainId,
    width,
    height,
    defaultInterval,
    theme,
    backgroundColor,
    gridColor,
    textColor,
    candleUpColor,
    candleDownColor,
    hideLeftToolbar,
    hideTopToolbar,
    hideBottomToolbar,
  ]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 ${className}`}
        style={{ 
          width: typeof width === 'string' ? width : `${width}px`,
          height: typeof height === 'string' ? height : `${height}px`,
          minHeight: '400px'
        }}
      >
        <div className="text-center p-6">
          <div className="text-red-400 text-lg font-semibold mb-2">Chart Error</div>
          <div className="text-red-300 text-sm">{error}</div>
          <div className="text-gray-400 text-xs mt-2">
            Token: {tokenAddress.slice(0, 8)}...{tokenAddress.slice(-8)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10"
          style={{ 
            width: typeof width === 'string' ? width : `${width}px`,
            height: typeof height === 'string' ? height : `${height}px`,
            minHeight: '400px'
          }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <div className="text-white text-lg font-semibold">Loading Chart...</div>
            <div className="text-gray-400 text-sm mt-1">
              {tokenAddress.slice(0, 8)}...{tokenAddress.slice(-8)}
            </div>
          </div>
        </div>
      )}
      
      <div
        ref={containerRef}
        className="moralis-chart-container"
        style={{
          width: typeof width === 'string' ? width : `${width}px`,
          height: typeof height === 'string' ? height : `${height}px`,
          minHeight: '400px',
          backgroundColor: backgroundColor,
          borderRadius: '8px',
        }}
      />
    </div>
  );
};

export default MoralisTradingViewChart;
