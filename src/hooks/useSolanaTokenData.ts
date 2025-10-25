import { TokenData } from '@/components/InfoWidget';
import { CandlestickData, UTCTimestamp } from 'lightweight-charts';
import { useEffect, useState } from 'react';

interface SolanaChartData {
  oclhv: Array<{
    time: number;
    open: number;
    close: number;
    low: number;
    high: number;
    volume: number;
  }>;
}

interface SolanaTokenInfo {
  name: string;
  symbol: string;
  image: string;
  price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  total_supply: number;
  circulating_supply: number;
  liquidity: number;
  fdv: number;
  txns_24h: {
    buys: number;
    sells: number;
  };
  volume_24h_breakdown: {
    buy_volume: number;
    sell_volume: number;
  };
  makers_24h: {
    buyers: number;
    sellers: number;
  };
}

export const useSolanaTokenData = (address: string | null, timeframe: string = '24h') => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [chartData, setChartData] = useState<CandlestickData<UTCTimestamp>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setTokenData(null);
      setChartData([]);
      return;
    }

    const fetchSolanaData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [tokenResponse, chartResponse] = await Promise.all([
          fetch(`/api/solanatracker/tokens/${address}`),
          fetch(`/api/solanatracker/chart/${address}?timeframe=${timeframe}`)
        ]);


        if (!tokenResponse.ok || !chartResponse.ok) {
          const tokenError = !tokenResponse.ok ? `Token API: ${tokenResponse.status}` : '';
          const chartError = !chartResponse.ok ? `Chart API: ${chartResponse.status}` : '';
          throw new Error(`Failed to fetch Solana token data - ${tokenError} ${chartError}`.trim());
        }

        const tokenInfo: SolanaTokenInfo = await tokenResponse.json();
        const chartInfo: SolanaChartData = await chartResponse.json();

        console.log(tokenInfo);
        console.log(chartInfo);
        const formattedTokenData: TokenData = {
          name: tokenInfo.name || 'Unknown Token',
          symbol: tokenInfo.symbol || 'UNKNOWN',
          baseToken: tokenInfo.symbol || 'UNKNOWN',
          chain: 'solana',
          dex: 'Solana',
          logoUri: tokenInfo.image,
          
          priceUsd: tokenInfo.price?.toFixed(tokenInfo.price < 0.01 ? 8 : 4) || '0',
          priceNative: tokenInfo.price?.toFixed(tokenInfo.price < 0.01 ? 8 : 4) || '0',
          priceChange: tokenInfo.price_change_percentage_24h?.toFixed(2) || '0',
          high24h: tokenInfo.high_24h?.toFixed(tokenInfo.high_24h < 0.01 ? 8 : 4) || '0',
          low24h: tokenInfo.low_24h?.toFixed(tokenInfo.low_24h < 0.01 ? 8 : 4) || '0',
          
          liquidity: (tokenInfo.liquidity || 0).toLocaleString(),
          fdv: (tokenInfo.fdv || 0).toLocaleString(),
          marketCap: (tokenInfo.market_cap || 0).toLocaleString(),
          totalSupply: (tokenInfo.total_supply || 0).toLocaleString(),
          circulatingSupply: (tokenInfo.circulating_supply || 0).toLocaleString(),
          
          change24h: tokenInfo.price_change_percentage_24h?.toFixed(2) || '0',
          
          txns: (tokenInfo.txns_24h?.buys || 0) + (tokenInfo.txns_24h?.sells || 0),
          buys: tokenInfo.txns_24h?.buys || 0,
          sells: tokenInfo.txns_24h?.sells || 0,
          volume: (tokenInfo.volume_24h || 0).toLocaleString(),
          volume24h: (tokenInfo.volume_24h || 0).toLocaleString(),
          buyVolume: (tokenInfo.volume_24h_breakdown?.buy_volume || 0).toLocaleString(),
          sellVolume: (tokenInfo.volume_24h_breakdown?.sell_volume || 0).toLocaleString(),
          
          makers: (tokenInfo.makers_24h?.buyers || 0) + (tokenInfo.makers_24h?.sellers || 0),
          buyers: tokenInfo.makers_24h?.buyers || 0,
          sellers: tokenInfo.makers_24h?.sellers || 0,
          
          website: '',
          twitter: '',
          telegram: '',
          discord: '',
          github: '',
          
          pairAddress: address,
          tokenAddress: address,
          
          isVerified: false,
          
          holders: '0',
          
          pooledToken: tokenInfo.symbol || 'UNKNOWN',
          pooledTokenAmount: '0',
          pooledTokenValue: '$0',
          pooledBase: 'SOL',
          pooledBaseAmount: '0',
          pooledBaseValue: '$0'
        };

        setTokenData(formattedTokenData);

        if (chartInfo.oclhv && Array.isArray(chartInfo.oclhv)) {
          const formattedChartData: CandlestickData<UTCTimestamp>[] = chartInfo.oclhv.map(point => ({
            time: (point.time / 1000) as UTCTimestamp,
            open: point.open,
            high: point.high,
            low: point.low,
            close: point.close
          }));
          
          setChartData(formattedChartData);
        } else {
          setChartData([]);
        }

      } catch (err) {
        console.error('Error fetching Solana token data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch token data');
        setTokenData(null);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSolanaData();
  }, [address, timeframe]);

  return {
    tokenData,
    chartData,
    loading,
    error,
    refetch: () => {
      if (address) {
        const fetchData = async () => {
          setLoading(true);
          setError(null);
          try {
            const [tokenResponse, chartResponse] = await Promise.all([
              fetch(`/api/solanatracker/tokens/${address}`),
              fetch(`/api/solanatracker/chart/${address}?timeframe=${timeframe}`)
            ]);
            
            if (!tokenResponse.ok || !chartResponse.ok) {
              throw new Error('Failed to fetch Solana token data');
            }
            
            const tokenInfo: SolanaTokenInfo = await tokenResponse.json();
            const chartInfo: SolanaChartData = await chartResponse.json();
            
            const formattedTokenData: TokenData = {
              name: tokenInfo.name || 'Unknown Token',
              symbol: tokenInfo.symbol || 'UNKNOWN',
              baseToken: tokenInfo.symbol || 'UNKNOWN',
              chain: 'solana',
              dex: 'Solana',
              logoUri: tokenInfo.image,
              
              priceUsd: tokenInfo.price?.toFixed(tokenInfo.price < 0.01 ? 8 : 4) || '0',
              priceNative: tokenInfo.price?.toFixed(tokenInfo.price < 0.01 ? 8 : 4) || '0',
              priceChange: tokenInfo.price_change_percentage_24h?.toFixed(2) || '0',
              high24h: tokenInfo.high_24h?.toFixed(tokenInfo.high_24h < 0.01 ? 8 : 4) || '0',
              low24h: tokenInfo.low_24h?.toFixed(tokenInfo.low_24h < 0.01 ? 8 : 4) || '0',
              
              liquidity: (tokenInfo.liquidity || 0).toLocaleString(),
              fdv: (tokenInfo.fdv || 0).toLocaleString(),
              marketCap: (tokenInfo.market_cap || 0).toLocaleString(),
              totalSupply: (tokenInfo.total_supply || 0).toLocaleString(),
              circulatingSupply: (tokenInfo.circulating_supply || 0).toLocaleString(),
              
              change24h: tokenInfo.price_change_percentage_24h?.toFixed(2) || '0',
              
              txns: (tokenInfo.txns_24h?.buys || 0) + (tokenInfo.txns_24h?.sells || 0),
              buys: tokenInfo.txns_24h?.buys || 0,
              sells: tokenInfo.txns_24h?.sells || 0,
              volume: (tokenInfo.volume_24h || 0).toLocaleString(),
              volume24h: (tokenInfo.volume_24h || 0).toLocaleString(),
              buyVolume: (tokenInfo.volume_24h_breakdown?.buy_volume || 0).toLocaleString(),
              sellVolume: (tokenInfo.volume_24h_breakdown?.sell_volume || 0).toLocaleString(),
              
              makers: (tokenInfo.makers_24h?.buyers || 0) + (tokenInfo.makers_24h?.sellers || 0),
              buyers: tokenInfo.makers_24h?.buyers || 0,
              sellers: tokenInfo.makers_24h?.sellers || 0,
              
              website: '',
              twitter: '',
              telegram: '',
              discord: '',
              github: '',
              
              pairAddress: address,
              tokenAddress: address,
              
              isVerified: false,
              
              holders: '0',
              
              pooledToken: tokenInfo.symbol || 'UNKNOWN',
              pooledTokenAmount: '0',
              pooledTokenValue: '$0',
              pooledBase: 'SOL',
              pooledBaseAmount: '0',
              pooledBaseValue: '$0'
            };
            
            setTokenData(formattedTokenData);
            
            if (chartInfo.oclhv && Array.isArray(chartInfo.oclhv)) {
              const formattedChartData: CandlestickData<UTCTimestamp>[] = chartInfo.oclhv.map(point => ({
                time: (point.time / 1000) as UTCTimestamp,
                open: point.open,
                high: point.high,
                low: point.low,
                close: point.close
              }));
              
              setChartData(formattedChartData);
            } else {
              setChartData([]);
            }
            
          } catch (err) {
            console.error('Error refetching Solana token data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch token data');
          } finally {
            setLoading(false);
          }
        };
        
        fetchData();
      }
    }
  };
};
