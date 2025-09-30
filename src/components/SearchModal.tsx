'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BiSearch } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store';
import { 
  selectCoinGeckoSearchResults, 
  selectTrendingCoins,
  selectSearchLoading,
  selectTrendingLoading 
} from '@/store/slices/searchCacheSlice';
import { useCoinGeckoSearch } from '@/hooks/useCoinGeckoSearch';
import { commonCryptoSymbols, getCryptoIconUrl } from '../utils/cryptoIcons';
import { getCryptoName } from '../utils/cryptoNames';
import { usePumpFunTokens } from '../hooks/usePumpFunTokens';
import { TokenPair, PumpFunToken, SearchResult } from '../types/token';
import catalog from '@/data/tokens.json';
import nyaxTokensData from '../../nyax-tokens-data.json';
import nyaxLogoMappings from '../../nyax-logo-mappings.json';
import { 
  fetchContractAddresses, 
  generateTradeUrl, 
  logContractAddressInfo,
  ContractAddressResult 
} from '@/utils/contractAddressUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
  score: number;
  price_btc: number;
  contractAddresses?: { [key: string]: string };
  primaryChain?: string | null;
  primaryAddress?: string | null;
}

interface CoinGeckoCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
  api_symbol: string;
  contractAddresses: { [key: string]: string };
  primaryChain: string | null;
  primaryAddress: string | null;
}

interface NyaxToken {
  logoId: string;
  name: string | null;
  symbol: string | null;
  contractAddress: string | null;
  network: string;
  logo: string;
  aboutUs: string | null;
  url: string;
  description?: string | null;
  totalSupply?: string | null;
  circulatingSupply?: string | null;
  marketCap?: string | null;
  price?: string | null;
  website?: string | null;
  telegram?: string | null;
  twitter?: string | null;
  discord?: string | null;
  whitepaper?: string | null;
  email?: string | null;
  etherscan?: string | null;
  video?: string | null;
  additionalInfo?: any;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { tokens: pumpFunTokens } = usePumpFunTokens();
  const [nyaxTokens] = useState<NyaxToken[]>(nyaxTokensData.tokens || []);

  // Redux selectors for cached data
  const cachedTrendingCoins = useAppSelector(selectTrendingCoins);
  const cachedCoinGeckoResults = useAppSelector((state) => 
    selectCoinGeckoSearchResults(searchTerm)(state)
  );
  const isSearchingCoinGecko = useAppSelector(selectSearchLoading);
  const isTrendingLoading = useAppSelector(selectTrendingLoading);

  // CoinGecko search hook
  const { 
    searchCoinGecko, 
    getTrendingCoinsWithCache, 
    getCacheKey,
    cancelSearch 
  } = useCoinGeckoSearch();

  // Map NYAX network labels to our chain slugs
  const mapNetworkToChain = (network: string | null | undefined): string | undefined => {
    if (!network) return undefined;
    const key = network.toLowerCase();
    const mapping: Record<string, string> = {
      'ethereum': 'ethereum',
      'eth': 'ethereum',
      'bsc': 'binance',
      'binance': 'binance',
      'binance smart chain': 'binance',
      'polygon': 'polygon',
      'matic': 'polygon',
      'avalanche': 'avalanche',
      'avax': 'avalanche',
      'arbitrum': 'arbitrum',
      'arbitrum one': 'arbitrum',
      'optimism': 'optimism',
      'base': 'base',
      'fantom': 'fantom',
      'solana': 'solana',
    };
    return mapping[key];
  };

  // Function to get logo URL from mappings
  const getNyaxLogoUrl = (logoId: string): string | null => {
    return nyaxLogoMappings[logoId as keyof typeof nyaxLogoMappings] || null;
  };

  // Search CoinGecko with caching - wrapper function
  const searchCoinGeckoWithCache = async (query: string) => {
    if (!query || query.trim().length < 2) {
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey(query);
    const cached = cachedCoinGeckoResults;
    
    if (cached && cached.length > 0) {
      console.log(`💰 Using cached CoinGecko results for "${query}" (${cached.length} coins)`);
      return;
    }

    // If not cached, fetch from API
    await searchCoinGecko(query);
  };

  // Popular token pairs for quick suggestions
  const popularPairs: TokenPair[] = [
    { baseToken: 'BTC', quoteToken: 'USDT', baseName: getCryptoName('BTC'), quoteName: getCryptoName('USDT') },
    { baseToken: 'ETH', quoteToken: 'USDT', baseName: getCryptoName('ETH'), quoteName: getCryptoName('USDT') },
    { baseToken: 'BTC', quoteToken: 'USDC', baseName: getCryptoName('BTC'), quoteName: getCryptoName('USDC') },
    { baseToken: 'ETH', quoteToken: 'USDC', baseName: getCryptoName('ETH'), quoteName: getCryptoName('USDC') },
    { baseToken: 'SOL', quoteToken: 'USDT', baseName: getCryptoName('SOL'), quoteName: getCryptoName('USDT') },
    { baseToken: 'BNB', quoteToken: 'USDT', baseName: getCryptoName('BNB'), quoteName: getCryptoName('USDT') },
  ];

  // Popular tokens with USDT as base token
  const popularTokens = [
    { symbol: 'BTC', name: 'Bitcoin', image: '/crypto-icons/color/btc.svg' },
    { symbol: 'ETH', name: 'Ethereum', image: '/crypto-icons/color/eth.svg' },
    { symbol: 'SOL', name: 'Solana', image: '/crypto-icons/color/sol.svg' },
    { symbol: 'USDC', name: 'USD Coin', image: '/crypto-icons/color/usdc.svg' },
    { symbol: 'USDT', name: 'Tether', image: '/crypto-icons/color/usdt.svg' },
    { symbol: 'BNB', name: 'Binance Coin', image: '/crypto-icons/color/bnb.svg' },
  ];

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Cancel previous search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Search using cached CoinGecko API with debounce
    searchTimeoutRef.current = setTimeout(() => {
      searchCoinGeckoWithCache(value);
    }, 300);

    const results: SearchResult[] = [];
    const upperSearch = value.toUpperCase();

    // Search PumpFun tokens first
    const matchingPumpFunTokens = pumpFunTokens.filter(token =>
      (token.name && token.name.toLowerCase().includes(value.toLowerCase())) ||
      (token.symbol && token.symbol.toLowerCase().includes(value.toLowerCase())) ||
      (token.mint && token.mint.toLowerCase().includes(value.toLowerCase()))
    );

    matchingPumpFunTokens.forEach(token => {
      results.push({
        type: 'pumpfun',
        data: token
      });
    });

    // Search NYAX tokens
    const matchingNyaxTokens = nyaxTokens.filter(token =>
      (token.name && token.name.toLowerCase().includes(value.toLowerCase())) ||
      (token.symbol && token.symbol.toLowerCase().includes(value.toLowerCase())) ||
      (token.contractAddress && token.contractAddress.toLowerCase().includes(value.toLowerCase())) ||
      (token.logoId && token.logoId.includes(value))
    );

    matchingNyaxTokens.forEach(token => {
      results.push({
        type: 'nyax',
        data: token
      });
    });

    // Search top token catalog (by symbol/name/address)
    try {
      const list = (catalog as Array<{ symbol: string; name: string; chain: string; address: string }>);
      // Exact address match first
      const isAddr = /^0x[a-fA-F0-9]{40}$/.test(value.trim());
      if (isAddr) {
        const exact = list.find(t => t.address && t.address.toLowerCase() === value.trim().toLowerCase());
        if (exact) {
          results.push({ type: 'catalog', data: exact });
        }
      }
      // Exact symbol match next
      const exactSym = list.find(t => t.symbol && t.symbol.toLowerCase() === value.toLowerCase());
      if (exactSym) {
        results.push({ type: 'catalog', data: exactSym });
      }
      const match = list.filter(t =>
        (t.symbol && t.symbol.toLowerCase().includes(value.toLowerCase())) ||
        (t.name && t.name.toLowerCase().includes(value.toLowerCase())) ||
        (t.address && t.address.toLowerCase().includes(value.toLowerCase()))
      );
      match.forEach(item => {
        // avoid duplicating exact pushes above
        if (!results.find(r => r.type === 'catalog' && r.data.address === item.address)) {
          results.push({ type: 'catalog', data: item });
        }
      });
    } catch {}

    // Search for traditional token pairs
    const pairMatch = value.match(/([A-Za-z0-9]+)[/\\-]([A-Za-z0-9]+)/);
    if (pairMatch) {
      const baseToken = pairMatch[1].toUpperCase();
      const quoteToken = pairMatch[2].toUpperCase();

      if (commonCryptoSymbols.includes(baseToken) && commonCryptoSymbols.includes(quoteToken)) {
        results.push({
          type: 'pair',
          data: {
            baseToken,
            quoteToken,
            baseName: getCryptoName(baseToken),
            quoteName: getCryptoName(quoteToken)
          }
        });
      }
    }

    // Search for individual tokens and create pairs
    const matchingTokens = commonCryptoSymbols.filter(symbol =>
      symbol.includes(upperSearch)
    );

    const quoteCurrencies = ['USDT', 'USDC', 'ETH', 'BTC'];
    matchingTokens.forEach(token => {
      quoteCurrencies.forEach(quote => {
        if (token !== quote) {
          results.push({
            type: 'pair',
            data: {
              baseToken: token,
              quoteToken: quote,
              baseName: getCryptoName(token),
              quoteName: getCryptoName(quote)
            }
          });
        }
      });
    });

    // Limit results to avoid overwhelming the UI
    setSearchResults(results.slice(0, 15));
  };

  // Handle clicking on a search result
  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'pair') {
      const pair = result.data as TokenPair;
      const params = new URLSearchParams();
      params.set('base', pair.baseToken);
      router.push(`/dashboard/trade?${params.toString()}`);
    } else if (result.type === 'nyax') {
      const token = result.data as NyaxToken;
      const params = new URLSearchParams();
      if (token.symbol) params.set('base', token.symbol.toUpperCase());
      const chain = mapNetworkToChain(token.network);
      if (chain) params.set('chain', chain);
      if (token.contractAddress) params.set('address', token.contractAddress);
      router.push(`/dashboard/trade?${params.toString()}`);
    } else if (result.type === 'pumpfun') {
      // Handle PumpFun token clicks - you can customize this as needed
      const token = result.data as PumpFunToken;
      const params = new URLSearchParams();
      params.set('base', (token.symbol || 'UNKNOWN').toUpperCase());
      router.push(`/dashboard/trade?${params.toString()}`);
    } else if (result.type === 'catalog') {
      const item = result.data as any;
      const sym = (item.symbol || '').toUpperCase();
      const chain = (item.chain || '').toLowerCase();
      const address = (item.address || '').toLowerCase();
      const qs = new URLSearchParams();
      if (sym) qs.set('base', sym);
      if (chain) qs.set('chain', chain);
      if (address) qs.set('address', address);
      router.push(`/dashboard/trade?${qs.toString()}`);
    }
    setSearchTerm('');
    onClose();
  };

  // Handle clicking on a trending coin with utility-based fallback
  const handleTrendingClick = async (coin: any) => {
    let contractResult: ContractAddressResult = {
      contractAddresses: coin.contractAddresses || {},
      primaryChain: coin.primaryChain,
      primaryAddress: coin.primaryAddress
    };
    
    // If no contract address available, try fallback for trending coins
    if (!contractResult.primaryAddress || !contractResult.primaryChain) {
      console.log(`⚠️ Trending ${coin.symbol} missing contract data, attempting fallback...`);
      
      try {
        const fallbackResult = await fetchContractAddresses(coin.id);
        if (fallbackResult.primaryAddress) {
          contractResult = fallbackResult;
          console.log(`✅ Trending fallback success for ${coin.symbol}`);
        }
      } catch (error) {
        console.log(`❌ Trending fallback failed for ${coin.symbol}:`, error);
      }
    }
    
    // Log contract address information
    logContractAddressInfo(coin.symbol, contractResult);
    
    // Generate trade URL and navigate
    const tradeUrl = generateTradeUrl(coin.symbol, contractResult, coin.id);
    console.log(`🚀 Trending navigation: ${tradeUrl}`);
    
    router.push(tradeUrl);
    onClose();
  };

  // Handle clicking on a popular token
  const handlePopularTokenClick = (token: { symbol: string }) => {
    router.push(`/dashboard/trade?base=${token.symbol.toUpperCase()}`);
    onClose();
  };

  // Enhanced CoinGecko coin click handler with utility-based fallback
  const handleCoinGeckoClick = async (coin: CoinGeckoCoin) => {
    let contractResult: ContractAddressResult = {
      contractAddresses: coin.contractAddresses || {},
      primaryChain: coin.primaryChain,
      primaryAddress: coin.primaryAddress
    };
    
    // If no contract address available, try fallback fetch
    if (!contractResult.primaryAddress || !contractResult.primaryChain) {
      console.log(`⚠️ ${coin.symbol} missing contract data, attempting fallback fetch...`);
      
      try {
        const fallbackResult = await fetchContractAddresses(coin.id);
        if (fallbackResult.primaryAddress) {
          contractResult = fallbackResult;
          console.log(`✅ Fallback success for ${coin.symbol}`);
        }
      } catch (error) {
        console.log(`❌ Fallback fetch failed for ${coin.symbol}:`, error);
      }
    }
    
    // Log contract address information
    logContractAddressInfo(coin.symbol, contractResult);
    
    // Generate trade URL and navigate
    const tradeUrl = generateTradeUrl(coin.symbol, contractResult, coin.id);
    console.log(`🚀 Navigating to: ${tradeUrl}`);
    
    router.push(tradeUrl);
    onClose();
  };

  // Handle clicking on a NYAX token
  const handleNyaxTokenClick = (token: NyaxToken) => {
    const params = new URLSearchParams();
    if (token.symbol) params.set('base', token.symbol.toUpperCase());
    const chain = mapNetworkToChain(token.network);
    if (chain) params.set('chain', chain);
    if (token.contractAddress) params.set('address', token.contractAddress);
    router.push(`/dashboard/trade?${params.toString()}`);
    onClose();
  };

  // Handle clicking on a catalog token (from tokens.json)
  const handleCatalogItemClick = (item: { symbol: string; chain?: string; address?: string }) => {
    const qs = new URLSearchParams();
    if (item.symbol) qs.set('base', item.symbol.toUpperCase());
    if (item.chain) qs.set('chain', (item.chain as string).toLowerCase());
    if ((item as any).address) qs.set('address', ((item as any).address as string).toLowerCase());
    router.push(`/dashboard/trade?${qs.toString()}`);
    onClose();
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchResults.length > 0) {
      handleResultClick(searchResults[0]);
    }
  };

  // Render search result item
  const renderSearchResult = (result: SearchResult, index: number) => {
    if (result.type === 'pumpfun') {
      const token = result.data as PumpFunToken;
      return (
        <div
          key={`pumpfun-${token.mint}-${index}`}
          className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
          onClick={() => handleResultClick(result)}
        >
          <div className="flex items-center mr-3">
            {token.image ? (
              <img
                src={token.image}
                alt={token.symbol || 'Token'}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                {token.symbol?.[0] || '?'}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{token.name || 'Unknown Token'}</span>
              <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">PumpFun</span>
            </div>
            <div className="text-sm text-gray-400">
              {token.symbol && <span className="mr-2">${token.symbol}</span>}
              {token.mint && <span className="text-xs font-mono">{token.mint.slice(0, 8)}...</span>}
            </div>
          </div>
        </div>
      );
    } else if (result.type === 'nyax') {
      const token = result.data as NyaxToken;
      return (
        <div
          key={`nyax-${token.logoId}-${index}`}
          className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
          onClick={() => handleResultClick(result)}
        >
          <div className="flex items-center mr-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {token.logo ? (
                <img
                  src={token.logo}
                  alt={token.symbol || token.name || 'Token'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold"
                style={{ display: token.logo ? 'none' : 'flex' }}
              >
                {(token.symbol || token.name || '?')[0].toUpperCase()}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{token.name || 'Unknown Token'}</span>
              <span className="text-xs bg-cyan-600 text-white px-2 py-0.5 rounded-full">NYAX</span>
            </div>
            <div className="text-sm text-gray-400">
              {token.symbol && <span className="mr-2">${token.symbol}</span>}
              <span className="text-xs text-cyan-400">{token.network}</span>
              {token.contractAddress && <span className="text-xs font-mono ml-2">{token.contractAddress.slice(0, 8)}...</span>}
            </div>
          </div>
        </div>
      );
    } else if (result.type === 'catalog') {
      const item = result.data as any;
      return (
        <div
          key={`catalog-${item.symbol}-${item.chain}-${index}`}
          className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
          onClick={() => handleResultClick(result)}
        >
          <div className="flex items-center mr-3">
            <div className="relative h-6 w-6 mr-1">
              <Image src={getCryptoIconUrl(item.symbol)} alt={item.symbol} width={24} height={24} className="rounded-full" unoptimized />
            </div>
          </div>
          <div>
            <span className="font-medium">{item.symbol}</span>
            <div className="text-xs text-gray-400">{item.name} • {item.chain}</div>
            <div className="text-[10px] text-gray-500 font-mono">{item.address.slice(0, 8)}...{item.address.slice(-6)}</div>
          </div>
        </div>
      );
    } else {
      const pair = result.data as TokenPair;
      return (
        <div
          key={`pair-${pair.baseToken}-${pair.quoteToken}-${index}`}
          className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
          onClick={() => handleResultClick(result)}
        >
          <div className="flex items-center mr-3">
            <div className="relative h-6 w-6 mr-1">
              <Image
                src={getCryptoIconUrl(pair.baseToken)}
                alt={pair.baseToken}
                width={24}
                height={24}
                className="rounded-full"
                unoptimized
              />
            </div>
            <div className="relative h-6 w-6">
              <Image
                src={getCryptoIconUrl(pair.quoteToken)}
                alt={pair.quoteToken}
                width={24}
                height={24}
                className="rounded-full"
                unoptimized
              />
            </div>
          </div>
          <div>
            <span className="font-medium">{pair.baseToken}/{pair.quoteToken}</span>
            <div className="text-xs text-gray-400">{pair.baseName || getCryptoName(pair.baseToken)} / {pair.quoteName || getCryptoName(pair.quoteToken)}</div>
          </div>
        </div>
      );
    }
  };

  // Fetch trending coins when modal opens using Redux cache
  useEffect(() => {
    if (isOpen) {

      // Use Redux-based trending fetch instead
      if (!cachedTrendingCoins && !isTrendingLoading) {
        getTrendingCoinsWithCache();
      }

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen, cachedTrendingCoins, isTrendingLoading, getTrendingCoinsWithCache]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      // Reset states when modal closes
      setSearchTerm('');
      setSearchResults([]);
      
      // Cancel any pending searches
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      
      // Cancel any ongoing CoinGecko searches
      cancelSearch();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-[#152028] bg-opacity-70 z-50 flex items-start justify-center pt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            ref={modalRef}
            className="w-full max-w-5xl rounded-lg p-3 overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.25
            }}
            style={{ transformOrigin: "center center" }}
          >
            {/* Search input */}
            <div className="p-2 border rounded-full border-gray-500">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <BiSearch size={20} />
                </span>
                <form onSubmit={handleSearchSubmit}>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search pair by symbol, name, contract or token"
                    className="w-full py-2 px-10 focus:ring-0 rounded-md outline-none  focus:outline-none "
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </form>
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={onClose}
                >
                  <IoMdClose size={20} />
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchTerm && searchResults.length > 0 && (
              <div className="border-b border-gray-800">
                <div className="p-4">
                  <h3 className="text-blue-400 font-bold mb-3">SEARCH RESULTS</h3>
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => renderSearchResult(result, index))}
                  </div>
                </div>
              </div>
            )}

            {/* CoinGecko Cryptocurrency Results */}
            {searchTerm && searchTerm.length >= 2 && ((cachedCoinGeckoResults && cachedCoinGeckoResults.length > 0) || isSearchingCoinGecko) && (
              <div className="border-b border-gray-800">
                <div className="p-4">
                  <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                    <span>🦎 CRYPTOCURRENCIES</span>
                    {isSearchingCoinGecko && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-400"></div>
                    )}
                  </h3>
                  <div className="max-h-60 overflow-y-auto">
                    {isSearchingCoinGecko ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
                      </div>
                    ) : (cachedCoinGeckoResults && cachedCoinGeckoResults.length > 0) ? (
                      cachedCoinGeckoResults.map((coin: any, index: number) => (
                        <div
                          key={`coingecko-${coin.id}-${index}`}
                          className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                          onClick={() => handleCoinGeckoClick(coin)}
                        >
                          <div className="flex items-center mr-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img
                                src={coin.thumb}
                                alt={coin.symbol}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{coin.name}</span>
                              <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">CoinGecko</span>
                              {coin.market_cap_rank && (
                                <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">
                                  #{coin.market_cap_rank}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400">
                              <span className="mr-2 font-mono">${coin.symbol.toUpperCase()}</span>
                              {coin.primaryChain && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full mr-2">
                                  {coin.primaryChain.toUpperCase()}
                                </span>
                              )}
                              {/* Show additional chains if available */}
                              {coin.contractAddresses && Object.keys(coin.contractAddresses).length > 1 && (
                                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full mr-2">
                                  +{Object.keys(coin.contractAddresses).length - 1} chains
                                </span>
                              )}
                              <span className="text-xs text-orange-400">ID: {coin.id}</span>
                            </div>
                            {coin.primaryAddress && (
                              <div className="text-xs text-gray-500 font-mono mt-1">
                                {coin.primaryAddress.slice(0, 8)}...{coin.primaryAddress.slice(-6)}
                              </div>
                            )}
                            {/* Show all available chains */}
                            {coin.contractAddresses && Object.keys(coin.contractAddresses).length > 0 && (
                              <div className="text-xs text-gray-400 mt-1">
                                Available on: {Object.keys(coin.contractAddresses).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : searchTerm.length >= 2 ? (
                      <div className="text-center text-gray-400 py-6">
                        <div className="text-orange-400 mb-2 text-2xl">🦎</div>
                        <div className="font-medium">No cryptocurrencies found for "{searchTerm}"</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Try searching with different keywords or check the spelling
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {/* Featured content */}
            <div className="p-4">
              
              {/* {!searchTerm && pumpFunTokens.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-purple-400 font-bold">PUMPFUN TOKENS</h3>
                    <div className="flex space-x-2">
                      <button className="bg-purple-600 text-xs px-3 py-1 rounded">LATEST</button>
                      <button className="border border-purple-600 text-purple-400 text-xs px-3 py-1 rounded">ALL</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-60 overflow-y-auto">
                    {pumpFunTokens.map((token, index) => (
                      <div
                        key={token.mint || index}
                        className="relative bg-gray-800 bg-opacity-30 rounded-lg p-3 overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleResultClick({ type: 'pumpfun', data: token })}
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 mr-2 rounded-full overflow-hidden">
                            {token.image ? (
                              <img
                                src={token.image}
                                alt={token.symbol || 'Token'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                {token.symbol?.[0] || '?'}
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-bold truncate">{token.symbol || 'Unknown'}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-400 truncate max-w-[80px]">{token.name || 'Unknown Token'}</div>
                          <div className="text-xs text-purple-400 font-bold">NEW</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Trending Coins */}
              {!searchTerm && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-orange-400 font-bold flex items-center gap-2">
                      🔥 TRENDING COINS
                      {isTrendingLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-400"></div>
                      )}
                    </h3>
                    <div className="flex space-x-2">
                      <span className="text-xs text-gray-400">Live from CoinGecko</span>
                    </div>
                  </div>
                  <motion.div 
                    className="flex space-x-3 overflow-x-auto pb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    {isTrendingLoading ? (
                      <div className="flex justify-center items-center w-full py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
                      </div>
                    ) : (cachedTrendingCoins && cachedTrendingCoins.length > 0) ? (
                      cachedTrendingCoins.map((coin: any, index: number) => (
                        <div 
                          key={coin.id} 
                          className="relative min-w-[140px] bg-gray-800 bg-opacity-30 rounded-lg p-3 overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors group"
                          onClick={() => handleTrendingClick(coin)}
                        >
                          <div className={`absolute top-1 right-1 px-2 py-1 text-xs font-bold rounded-full ${
                            index === 0 ? 'bg-yellow-500 text-black' : 
                            index === 1 ? 'bg-gray-400 text-black' : 
                            index === 2 ? 'bg-amber-600 text-white' : 
                            'bg-purple-500 text-white'
                          }`}>
                            #{index + 1}
                          </div>
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 mr-2 rounded-full overflow-hidden">
                              <img 
                                src={coin.thumb} 
                                alt={coin.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="text-sm font-bold text-white">{coin.symbol.toUpperCase()}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-400 truncate max-w-[80px]" title={coin.name}>{coin.name}</div>
                            {coin.primaryChain && (
                              <div className="text-xs text-orange-400 font-bold">{coin.primaryChain.toUpperCase()}</div>
                            )}
                          </div>
                          {coin.market_cap_rank && (
                            <div className="text-xs text-gray-500 mt-1">Rank #{coin.market_cap_rank}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 w-full py-8">
                        <div className="text-orange-400 mb-2">🔥</div>
                        <div>Unable to load trending coins</div>
                        <div className="text-xs text-gray-500 mt-1">Try refreshing or search manually</div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}


              {/* All Tokens (from catalog) */}
              {!searchTerm && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-emerald-400 font-bold">
                      ALL TOKENS ({(catalog as Array<{ symbol: string; name: string; chain: string; address: string }>).length})
                    </h3>
                    <div className="flex space-x-2">
                      <span className="text-xs text-gray-400">From local catalog</span>
                    </div>
                  </div>
                  <motion.div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-80 overflow-y-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    {(catalog as Array<{ symbol: string; name: string; chain: string; address: string }>).map((item, index) => (
                      <div
                        key={`${item.symbol}-${item.chain}-${index}`}
                        className="relative bg-gray-800 bg-opacity-30 rounded-lg p-3 overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors group"
                        onClick={() => handleCatalogItemClick(item)}
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 mr-2 rounded-full overflow-hidden">
                            <Image src={getCryptoIconUrl(item.symbol)} alt={item.symbol} width={24} height={24} className="rounded-full" unoptimized />
                          </div>
                          <div className="text-sm font-bold">{item.symbol}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-400 truncate max-w-[80px]" title={item.name}>{item.name}</div>
                          <div className="text-xs text-emerald-400 font-bold">{item.chain.toUpperCase()}</div>
                        </div>
                        <div className="mt-1 text-[10px] text-gray-500 font-mono truncate" title={item.address}>{item.address}</div>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Popular Tokens */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-blue-400 font-bold">POPULAR TOKENS</h3>
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 text-xs px-3 py-1 rounded">TOP</button>
                    <button className="border border-blue-600 text-blue-400 text-xs px-3 py-1 rounded">ALL</button>
                  </div>
                </div>
                <motion.div
                  className="flex space-x-3 overflow-x-auto pb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  {popularTokens.map((token, index) => (
                    <div
                      key={index}
                      className="relative min-w-[120px] bg-gray-800 bg-opacity-30 rounded-lg p-3 overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => router.push(`/dashboard/trade?token=${token.symbol}`)}
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 mr-2 rounded-full overflow-hidden">
                          <Image
                            src={token.image}
                            alt={token.symbol}
                            width={24}
                            height={24}
                          />
                        </div>
                        <div className="text-sm font-bold">{token.symbol}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400 truncate max-w-[80px]">{token.name}</div>
                        <div className="text-xs text-cyan-400 font-bold">USDT</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
