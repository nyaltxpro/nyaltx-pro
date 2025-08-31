'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTrendingNFTs, getNFTsByPlatform, loadNFTsFromCache, saveNFTsToCache } from '../../api/coingecko/nft';
import { FiExternalLink } from 'react-icons/fi';
import { BiTrendingUp } from 'react-icons/bi';
import { FaEthereum } from 'react-icons/fa';
import { SiSolana } from 'react-icons/si';

interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  floor_price: {
    native_currency: number;
    usd: number;
  };
  volume_24h: {
    native_currency: number;
    usd: number;
  };
  market_cap: {
    native_currency: number;
    usd: number;
  };
  floor_price_in_usd_24h_percentage_change: number;
  number_of_unique_addresses: number;
  number_of_unique_addresses_24h_percentage_change: number;
  asset_platform_id: string;
}

export default function NFTPage() {
  const [trendingNFTs, setTrendingNFTs] = useState<NFTCollection[]>([]);
  const [ethereumNFTs, setEthereumNFTs] = useState<NFTCollection[]>([]);
  const [solanaNFTs, setSolanaNFTs] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        setLoading(true);
        
        // Try to load from cache first
        const cachedData = loadNFTsFromCache();
        if (cachedData) {
          setTrendingNFTs(cachedData.trending || []);
          setEthereumNFTs(cachedData.ethereum || []);
          setSolanaNFTs(cachedData.solana || []);
          setLoading(false);
          return;
        }
        
        // Fetch trending NFTs
        const trending = await getTrendingNFTs(10);
        setTrendingNFTs(trending);
        
        // Fetch Ethereum NFTs
        const ethereum = await getNFTsByPlatform('ethereum', 10);
        setEthereumNFTs(ethereum);
        
        // Fetch Solana NFTs
        const solana = await getNFTsByPlatform('solana', 10);
        setSolanaNFTs(solana);
        
        // Save to cache
        saveNFTsToCache({
          trending,
          ethereum,
          solana,
        });
        
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching NFT data:', err);
        setError('Failed to load NFT collections');
        setLoading(false);
      }
    };

    fetchNFTData();
    
    // Refresh data every 10 minutes
    const intervalId = setInterval(fetchNFTData, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num ? num.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0';
  };

  // Format price change with color and sign
  const formatPriceChange = (change: number) => {
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

  // Get active NFT list based on tab
  const getActiveNFTs = () => {
    switch (activeTab) {
      case 'ethereum':
        return ethereumNFTs;
      case 'solana':
        return solanaNFTs;
      case 'trending':
      default:
        return trendingNFTs;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-white">NFT Collections</h1>
      
      {/* Tabs */}
      <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
        <button 
          className={`flex items-center px-4 py-2 rounded-md ${activeTab === 'trending' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('trending')}
        >
          <BiTrendingUp className="mr-2" /> Trending
        </button>
        <button 
          className={`flex items-center px-4 py-2 rounded-md ${activeTab === 'ethereum' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('ethereum')}
        >
          <FaEthereum className="mr-2" /> Ethereum
        </button>
        <button 
          className={`flex items-center px-4 py-2 rounded-md ${activeTab === 'solana' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('solana')}
        >
          <SiSolana className="mr-2" /> Solana
        </button>
      </div>
      
      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && !loading && (
        <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* NFT Collections Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getActiveNFTs().map((nft) => (
            <Link href={`/nft/${nft.id}`} key={nft.id}>
              <div className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 border border-gray-700 hover:border-blue-500/50">
                <div className="relative h-48 w-full">
                  {nft.thumb ? (
                    <Image 
                      src={nft.thumb} 
                      alt={nft.name} 
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-gray-900/80 p-1 rounded-md">
                    {getPlatformIcon(nft.asset_platform_id)}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">{nft.name}</h3>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{nft.symbol}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Floor Price</p>
                      <p className="text-sm font-medium text-white">
                        ${formatNumber(nft.floor_price?.usd || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">24h Change</p>
                      <p className="text-sm font-medium">
                        {formatPriceChange(nft.floor_price_in_usd_24h_percentage_change || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">24h Volume</p>
                      <p className="text-sm font-medium text-white">
                        ${formatNumber(nft.volume_24h?.usd || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Holders</p>
                      <p className="text-sm font-medium text-white">
                        {formatNumber(nft.number_of_unique_addresses || 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <span className="text-xs text-blue-400 flex items-center">
                      View Details <FiExternalLink className="ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {!loading && !error && getActiveNFTs().length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p className="text-xl mb-2">No NFT collections found</p>
          <p className="text-sm">Try switching to a different category</p>
        </div>
      )}
    </div>
  );
}
