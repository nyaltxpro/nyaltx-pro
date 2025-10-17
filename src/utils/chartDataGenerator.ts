import { CandlestickData, HistogramData, UTCTimestamp } from 'lightweight-charts';

export interface ChartDataPoint {
  candlestick: CandlestickData<UTCTimestamp>;
  volume: HistogramData<UTCTimestamp>;
}

/**
 * Generate realistic OHLCV (Open, High, Low, Close, Volume) data for charts
 * Simulates realistic market behavior with trends, volatility, and volume patterns
 */
export const generateRealisticChartData = (
  days: number = 90,
  basePrice: number = 100,
  basePriceRandom: boolean = true
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = Math.floor(Date.now() / 1000);
  const dayInSeconds = 86400;
  
  // Randomize base price if requested
  let price = basePriceRandom ? 0.001 + Math.random() * 10 : basePrice;
  let trend = Math.random() > 0.5 ? 1 : -1; // Random initial trend
  let trendStrength = 0.3 + Math.random() * 0.4; // Trend strength 0.3-0.7
  
  for (let i = days; i >= 0; i--) {
    const timestamp = (now - (i * dayInSeconds)) as UTCTimestamp;
    
    // Occasionally change trend (5% chance per day)
    if (Math.random() > 0.95) {
      trend *= -1;
      trendStrength = 0.3 + Math.random() * 0.4;
    }
    
    // Occasional volatility spikes (10% chance)
    const volatilitySpike = Math.random() > 0.9 ? 2 : 1;
    
    // Calculate daily volatility
    const baseVolatility = price * 0.03; // 3% base daily volatility
    const volatility = baseVolatility * volatilitySpike;
    const trendForce = trend * volatility * trendStrength;
    const randomChange = (Math.random() - 0.5) * volatility * 2;
    
    // Generate OHLC values
    const open = price;
    const change = trendForce + randomChange;
    
    // Generate intraday high and low with realistic wicks
    const wickRange = Math.abs(change) * (0.5 + Math.random() * 1.5);
    const high = open + Math.abs(change) * 0.5 + wickRange * (Math.random() * 0.7);
    const low = open - Math.abs(change) * 0.5 - wickRange * (Math.random() * 0.7);
    const close = open + change;
    
    // Ensure high is highest and low is lowest
    const actualHigh = Math.max(open, close, high);
    const actualLow = Math.min(open, close, low);
    
    // Generate volume (inversely correlated with price, with random spikes)
    const priceRange = actualHigh - actualLow;
    const baseVolume = 1000000 + Math.random() * 5000000;
    const volatilityFactor = (priceRange / price) * 10; // Higher volatility = higher volume
    const volumeSpike = Math.random() > 0.9 ? 2 + Math.random() * 3 : 1; // 10% chance of 2-5x volume
    const volume = baseVolume * (1 + volatilityFactor) * volumeSpike;
    
    // Determine volume bar color based on price movement - DexScreener colors
    const volumeColor = close >= open ? '#26a69a66' : '#ef535066'; // Green or red with transparency
    
    data.push({
      candlestick: {
        time: timestamp,
        open: parseFloat(open.toFixed(8)),
        high: parseFloat(actualHigh.toFixed(8)),
        low: parseFloat(actualLow.toFixed(8)),
        close: parseFloat(close.toFixed(8)),
      },
      volume: {
        time: timestamp,
        value: parseFloat(volume.toFixed(2)),
        color: volumeColor,
      },
    });
    
    price = close;
    
    // Prevent price from going negative or too low
    if (price < 0.000001) price = 0.000001;
  }
  
  return data;
};

/**
 * Calculate Simple Moving Average (SMA)
 */
export const calculateSMA = (
  data: CandlestickData<UTCTimestamp>[],
  period: number
): Array<{ time: UTCTimestamp; value: number }> => {
  const sma: Array<{ time: UTCTimestamp; value: number }> = [];
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const average = sum / period;
    sma.push({
      time: data[i].time as UTCTimestamp,
      value: parseFloat(average.toFixed(8)),
    });
  }
  
  return sma;
};

/**
 * Calculate Exponential Moving Average (EMA)
 */
export const calculateEMA = (
  data: CandlestickData<UTCTimestamp>[],
  period: number
): Array<{ time: UTCTimestamp; value: number }> => {
  const ema: Array<{ time: UTCTimestamp; value: number }> = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for the first period
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let emaValue = sum / period;
  ema.push({
    time: data[period - 1].time as UTCTimestamp,
    value: parseFloat(emaValue.toFixed(8)),
  });
  
  // Calculate EMA for remaining data points
  for (let i = period; i < data.length; i++) {
    emaValue = (data[i].close - emaValue) * multiplier + emaValue;
    ema.push({
      time: data[i].time as UTCTimestamp,
      value: parseFloat(emaValue.toFixed(8)),
    });
  }
  
  return ema;
};

/**
 * Get price statistics from chart data
 */
export const getChartStats = (data: ChartDataPoint[]) => {
  if (data.length === 0) {
    return {
      currentPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
      high24h: 0,
      low24h: 0,
      volume24h: 0,
    };
  }
  
  const candlesticks = data.map(d => d.candlestick);
  const volumes = data.map(d => d.volume);
  
  const currentPrice = candlesticks[candlesticks.length - 1].close;
  const openPrice = candlesticks[0].open;
  const priceChange = currentPrice - openPrice;
  const priceChangePercent = (priceChange / openPrice) * 100;
  
  // Get 24h stats (last 24 data points represent last 24 hours if daily data)
  const last24h = candlesticks.slice(-Math.min(24, candlesticks.length));
  const high24h = Math.max(...last24h.map(c => c.high));
  const low24h = Math.min(...last24h.map(c => c.low));
  const volume24h = volumes.slice(-Math.min(24, volumes.length))
    .reduce((sum, v) => sum + v.value, 0);
  
  return {
    currentPrice,
    priceChange,
    priceChangePercent,
    high24h,
    low24h,
    volume24h,
  };
};
