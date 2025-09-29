'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getNFTCollectionById } from '../../../../../api/coingecko/nft';
import { FaEthereum, FaTwitter, FaDiscord, FaGlobe } from 'react-icons/fa';
import { SiSolana } from 'react-icons/si';
import { BiArrowBack } from 'react-icons/bi';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface NFTCollectionDetail {
  id: string;
  name: string;
  symbol: string;
  asset_platform_id: string;
  contract_address: string;
  image: {
    small: string;
    large: string;
  };
  description: string;
  native_currency: string;
  floor_price: {
    native_currency: number;
    usd: number;
  };
  market_cap: {
    native_currency: number;
    usd: number;
  };
  volume_24h: {
    native_currency: number;
    usd: number;
  };
  floor_price_in_usd_24h_percentage_change: number;
  number_of_unique_addresses: number;
  number_of_unique_addresses_24h_percentage_change: number;
  total_supply: number;
  links: {
    homepage: string;
    twitter: string;
    discord: string;
  };
  floor_price_7d_percentage_change: {
    usd: number;
  };
  floor_price_14d_percentage_change: {
    usd: number;
  };
  floor_price_30d_percentage_change: {
    usd: number;
  };
  floor_price_60d_percentage_change: {
    usd: number;
  };
  floor_price_1y_percentage_change: {
    usd: number;
  };
}

export default function NFTCollectionDetail() {
  const params = useParams();
  const id = params?.id as string;
  
  const [collection, setCollection] = useState<NFTCollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchNFTCollection = async () => {
      try {
        setLoading(true);
        const data = await getNFTCollectionById(id);
        setCollection(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching NFT collection:', err);
        setError('Failed to load NFT collection details');
        setLoading(false);
      }
    };

    if (id) {
      fetchNFTCollection();
    }
  }, [id]);

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num ? num.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0';
  };

  // Format price change with color and sign
  const formatPriceChange = (change: number | undefined) => {
    if (!change) return <span>0%</span>;
    
    const formattedChange = change.toFixed(2);
    if (change > 0) {
      return <span className="text-green-500">+{formattedChange}%</span>;
    } else {
      return <span className="text-red-500">{formattedChange}%</span>;
    }
  };

  // Get platform icon
  const getPlatformIcon = (platformId: string) => {
    switch (platformId) {
      case 'ethereum':
        return <FaEthereum className="text-blue-400" />;
      case 'solana':
        return <SiSolana className="text-purple-500" />;
      default:
        return null;
    }
  };

  // Get price change based on selected time range
  const getPriceChangeForTimeRange = () => {
    if (!collection) return 0;
    
    switch (timeRange) {
      case '7d':
        return collection.floor_price_7d_percentage_change?.usd || 0;
      case '14d':
        return collection.floor_price_14d_percentage_change?.usd || 0;
      case '30d':
        return collection.floor_price_30d_percentage_change?.usd || 0;
      case '60d':
        return collection.floor_price_60d_percentage_change?.usd || 0;
      case '1y':
        return collection.floor_price_1y_percentage_change?.usd || 0;
      default:
        return collection.floor_price_in_usd_24h_percentage_change || 0;
    }
  };

  // Generate mock chart data based on price changes
  const generateChartData = () => {
    if (!collection) return [];
    
    const priceChange = getPriceChangeForTimeRange();
    const currentPrice = collection.floor_price?.usd || 0;
    const dataPoints = 30;
    const data = [];
    
    // Generate mock data based on current price and trend
    let basePrice = currentPrice / (1 + priceChange / 100);
    
    for (let i = 0; i < dataPoints; i++) {
      // Add some randomness to make the chart look natural
      const randomFactor = 0.98 + Math.random() * 0.04;
      const progress = i / (dataPoints - 1);
      const price = basePrice * (1 + (priceChange / 100) * progress) * randomFactor;
      
      data.push(price);
    }
    
    return data;
  };

  // Chart options
  const chartOptions = {
    chart: {
      type: 'area' as const,
      height: 160,
      sparkline: {
        enabled: true
      },
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: getPriceChangeForTimeRange() >= 0 ? '#10B981' : '#EF4444',
            opacity: 0.2
          },
          {
            offset: 100,
            color: getPriceChangeForTimeRange() >= 0 ? '#10B981' : '#EF4444',
            opacity: 0
          }
        ]
      }
    },
    colors: [getPriceChangeForTimeRange() >= 0 ? '#10B981' : '#EF4444'],
    tooltip: {
      theme: 'dark'
    },
    grid: {
      padding: {
        top: 10,
        right: 0,
        bottom: 0,
        left: 0
      }
    }
  };

  const chartSeries = [
    {
      name: 'Floor Price',
      data: generateChartData()
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back button */}
      <Link href="/nft" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
        <BiArrowBack className="mr-2" /> Back to Collections
      </Link>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* NFT Collection Detail */}
      {!loading && !error && collection && (
        <div>
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Collection Image */}
            <div className="w-full md:w-1/4">
              <div className="relative h-64 w-full rounded-xl overflow-hidden border border-gray-700">
                {collection.image?.large ? (
                  <Image 
                    src={collection.image.large} 
                    alt={collection.name} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Collection Info */}
            <div className="w-full md:w-3/4">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
                <span className="text-sm bg-gray-700 px-2 py-1 rounded text-gray-300">{collection.symbol}</span>
                <div className="text-xl">
                  {getPlatformIcon(collection.asset_platform_id)}
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex gap-3 mb-4">
                {collection.links?.homepage && (
                  <a href={collection.links.homepage} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <FaGlobe />
                  </a>
                )}
                {collection.links?.twitter && (
                  <a href={`https://twitter.com/${collection.links.twitter}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                    <FaTwitter />
                  </a>
                )}
                {collection.links?.discord && (
                  <a href={collection.links.discord} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400">
                    <FaDiscord />
                  </a>
                )}
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Floor Price</p>
                  <p className="text-xl font-semibold text-white">${formatNumber(collection.floor_price?.usd || 0)}</p>
                  <p className="text-sm">{formatPriceChange(collection.floor_price_in_usd_24h_percentage_change)}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Market Cap</p>
                  <p className="text-xl font-semibold text-white">${formatNumber(collection.market_cap?.usd || 0)}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">24h Volume</p>
                  <p className="text-xl font-semibold text-white">${formatNumber(collection.volume_24h?.usd || 0)}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Holders</p>
                  <p className="text-xl font-semibold text-white">{formatNumber(collection.number_of_unique_addresses || 0)}</p>
                  <p className="text-sm">{formatPriceChange(collection.number_of_unique_addresses_24h_percentage_change)}</p>
                </div>
              </div>
              
              {/* Description */}
              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                <p className="text-gray-300 text-sm">
                  {collection.description || 'No description available for this collection.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Price Chart */}
          <div className="bg-gray-800 p-6 rounded-xl mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Floor Price History</h2>
              
              {/* Time Range Selector */}
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button 
                  className={`px-3 py-1 text-xs rounded-md ${timeRange === '24h' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                  onClick={() => setTimeRange('24h')}
                >
                  24H
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded-md ${timeRange === '7d' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                  onClick={() => setTimeRange('7d')}
                >
                  7D
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded-md ${timeRange === '14d' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                  onClick={() => setTimeRange('14d')}
                >
                  14D
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded-md ${timeRange === '30d' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                  onClick={() => setTimeRange('30d')}
                >
                  30D
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded-md ${timeRange === '60d' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                  onClick={() => setTimeRange('60d')}
                >
                  60D
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded-md ${timeRange === '1y' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                  onClick={() => setTimeRange('1y')}
                >
                  1Y
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-white">${formatNumber(collection.floor_price?.usd || 0)}</p>
                <p className="text-sm">{formatPriceChange(getPriceChangeForTimeRange())}</p>
              </div>
            </div>
            
            <div className="h-64">
              {typeof window !== 'undefined' && (
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="area"
                  height={256}
                />
              )}
            </div>
          </div>
          
          {/* Collection Details */}
          <div className="bg-gray-800 p-6 rounded-xl mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Collection Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-b border-gray-700 py-3">
                <p className="text-sm text-gray-400">Contract Address</p>
                <p className="text-sm text-gray-300 font-mono truncate">{collection.contract_address || 'N/A'}</p>
              </div>
              <div className="border-b border-gray-700 py-3">
                <p className="text-sm text-gray-400">Platform</p>
                <p className="text-sm text-gray-300 capitalize">{collection.asset_platform_id || 'N/A'}</p>
              </div>
              <div className="border-b border-gray-700 py-3">
                <p className="text-sm text-gray-400">Total Supply</p>
                <p className="text-sm text-gray-300">{formatNumber(collection.total_supply || 0)}</p>
              </div>
              <div className="border-b border-gray-700 py-3">
                <p className="text-sm text-gray-400">Native Currency</p>
                <p className="text-sm text-gray-300">{collection.native_currency || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
