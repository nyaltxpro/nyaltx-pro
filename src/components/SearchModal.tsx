'use client';

import catalog from '@/data/tokens.json';
import { LocalCoin, LocalSearchResult, useLocalCoinsSearch } from '@/hooks/useLocalCoinsSearch';
import { useCoinGeckoSearch } from '@/hooks/useCoinGeckoSearch';
import { useAppSelector } from '@/store';
import { selectCoinGeckoSearchResults, selectTrendingCoins } from '@/store/slices/searchCacheSlice';
import {
  ContractAddressResult,
  fetchContractAddresses,
  generateTradeUrl,
  logContractAddressInfo,
} from '@/utils/contractAddressUtils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import nyaxLogoMappings from '../../nyax-logo-mappings.json';
import nyaxTokensData from '../../nyax-tokens-data.json';
import { usePumpFunTokensMoralis } from '../hooks/usePumpFunTokensMoralis';
import { PumpFunToken, SearchResult, TokenPair } from '../types/token';
import { commonCryptoSymbols, getCryptoIconUrl } from '../utils/cryptoIcons';
import { getCryptoName } from '../utils/cryptoNames';
import TokenAvatar from './TokenAvatar';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}


interface NyaxToken {
  logoId: string;
  name: string | null;
  symbol: string | null;
  contractAddress: string | null;
  network: string | null;
  logo: string | null;
}

interface UnifiedToken {
  id?: string;
  symbol: string;
  name: string;
  chain: string;
  address: string;
  logo?: string;
  source: string;
  price?: number;
  market_cap?: number;
}

interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  contractAddresses?: { [key: string]: string };
  primaryChain?: string;
  primaryAddress?: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unifiedSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [localSearchResults, setLocalSearchResults] = useState<LocalSearchResult[]>([]);
  const [unifiedTokens, setUnifiedTokens] = useState<UnifiedToken[]>([]);
  const [unifiedTokensLoading, setUnifiedTokensLoading] = useState(false);

  // Get cached CoinGecko results from Redux
  const cachedCoinGeckoResults = useAppSelector(selectCoinGeckoSearchResults(searchTerm));
  const cachedTrendingCoins = useAppSelector(selectTrendingCoins);

  // Load NYAX tokens data
  const nyaxTokens: NyaxToken[] = nyaxTokensData.tokens || [];

  // PumpFun tokens hook
  const { tokens: pumpFunTokens } = usePumpFunTokensMoralis();

  // Local coins search hook
  const {
    searchCoins,
    getTrendingCoins: localTrendingCoins,
    isLoading: isLocalSearchLoading,
  } = useLocalCoinsSearch();


  // CoinGecko search hook
  const {
    searchCoinGecko,
    getTrendingCoinsWithCache,
    getCacheKey,
    cancelSearch,
    isSearching: isSearchingCoinGecko,
  } = useCoinGeckoSearch();

  // Map NYAX network labels to our chain slugs
  const mapNetworkToChain = (network: string | null | undefined): string | undefined => {
    if (!network) return undefined;
    const key = network.toLowerCase();
    const mapping: Record<string, string> = {
      ethereum: 'ethereum',
      eth: 'ethereum',
      bsc: 'binance',
      binance: 'binance',
      'binance smart chain': 'binance',
      polygon: 'polygon',
      matic: 'polygon',
      avalanche: 'avalanche',
      avax: 'avalanche',
      arbitrum: 'arbitrum',
      'arbitrum one': 'arbitrum',
      optimism: 'optimism',
      base: 'base',
      fantom: 'fantom',
      solana: 'solana',
    };
    return mapping[key];
  };

  // Function to get logo URL from mappings
  const getNyaxLogoUrl = (logoId: string): string | null => {
    return nyaxLogoMappings[logoId as keyof typeof nyaxLogoMappings] || null;
  };

  // Unified token search function
  const searchUnifiedTokens = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setUnifiedTokens([]);
      return;
    }

    console.log('🔍 SearchModal: Starting search for:', query);
    setUnifiedTokensLoading(true);

    try {
      const apiUrl = `/api/tokens?query=${encodeURIComponent(query)}&source=all&limit=10`;
      console.log('📡 SearchModal: Calling API:', apiUrl);

      const response = await fetch(apiUrl);
      console.log('📊 SearchModal: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SearchModal: API Error:', response.status, errorText);
        throw new Error('Failed to fetch unified tokens');
      }

      const data = await response.json();
      console.log('✅ SearchModal: Response data:', data);
      console.log('🎯 SearchModal: Tokens array:', data.tokens);
      console.log('📊 SearchModal: Token count:', data.tokens?.length || 0);

      setUnifiedTokens(data.tokens || []);
    } catch (error) {
      console.error('💥 SearchModal: Search failed:', error);
      setUnifiedTokens([]);
    } finally {
      setUnifiedTokensLoading(false);
    }
  };

  // Navigation function for unified tokens
  const navigateToUnifiedToken = (token: UnifiedToken) => {
    const params = new URLSearchParams();

    if (token.symbol) params.set('base', token.symbol);
    if (token.name) params.set('name', token.name);
    if (token.chain) params.set('chain', token.chain);
    if (token.address && token.address !== 'N/A') params.set('address', token.address);
    if (token.logo) params.set('imageUri', token.logo);
    if (token.source) params.set('source', token.source);

    const tradeUrl = `/dashboard/trade?${params.toString()}`;
    router.push(tradeUrl);
    onClose();
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
    {
      baseToken: 'BTC',
      quoteToken: 'USDT',
      baseName: getCryptoName('BTC'),
      quoteName: getCryptoName('USDT'),
    },
    {
      baseToken: 'ETH',
      quoteToken: 'USDT',
      baseName: getCryptoName('ETH'),
      quoteName: getCryptoName('USDT'),
    },
    {
      baseToken: 'BTC',
      quoteToken: 'USDC',
      baseName: getCryptoName('BTC'),
      quoteName: getCryptoName('USDC'),
    },
    {
      baseToken: 'ETH',
      quoteToken: 'USDC',
      baseName: getCryptoName('ETH'),
      quoteName: getCryptoName('USDC'),
    },
    {
      baseToken: 'SOL',
      quoteToken: 'USDT',
      baseName: getCryptoName('SOL'),
      quoteName: getCryptoName('USDT'),
    },
    {
      baseToken: 'BNB',
      quoteToken: 'USDT',
      baseName: getCryptoName('BNB'),
      quoteName: getCryptoName('USDT'),
    },
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

    // Cancel previous search timeouts
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (unifiedSearchTimeoutRef.current) {
      clearTimeout(unifiedSearchTimeoutRef.current);
    }

    if (value.trim() === '') {
      setSearchResults([]);
      setLocalSearchResults([]);
      setUnifiedTokens([]);
      return;
    }

    // Search local detailed coins data with debounce
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const localResults = await searchCoins(value, 8);
        setLocalSearchResults(localResults);
      } catch (error) {
        console.error('Local search failed:', error);
        setLocalSearchResults([]);
      }
    }, 300);

    // Search unified tokens (registered + Solana) with debounce
    unifiedSearchTimeoutRef.current = setTimeout(async () => {
      await searchUnifiedTokens(value);
    }, 300);

    const results: SearchResult[] = [];
    const upperSearch = value.toUpperCase();

    // Search PumpFun tokens first
    const matchingPumpFunTokens = pumpFunTokens.filter(
      (token: PumpFunToken) =>
        (token.name && token.name.toLowerCase().includes(value.toLowerCase())) ||
        (token.symbol && token.symbol.toLowerCase().includes(value.toLowerCase())) ||
        (token.mint && token.mint.toLowerCase().includes(value.toLowerCase()))
    );

    matchingPumpFunTokens.forEach((token: PumpFunToken) => {
      results.push({
        type: 'pumpfun',
        data: token,
      });
    });

    // Search NYAX tokens
    const matchingNyaxTokens = nyaxTokens.filter(
      token =>
        (token.name && token.name.toLowerCase().includes(value.toLowerCase())) ||
        (token.symbol && token.symbol.toLowerCase().includes(value.toLowerCase())) ||
        (token.contractAddress &&
          token.contractAddress.toLowerCase().includes(value.toLowerCase())) ||
        (token.logoId && token.logoId.includes(value))
    );

    matchingNyaxTokens.forEach(token => {
      results.push({
        type: 'nyax',
        data: token,
      });
    });

    // Search top token catalog (by symbol/name/address)
    try {
      const list = catalog as Array<{
        symbol: string;
        name: string;
        chain: string;
        address: string;
      }>;
      // Exact address match first
      const isAddr = /^0x[a-fA-F0-9]{40}$/.test(value.trim());
      if (isAddr) {
        const exact = list.find(
          t => t.address && t.address.toLowerCase() === value.trim().toLowerCase()
        );
        if (exact) {
          results.push({ type: 'catalog', data: exact });
        }
      }
      // Exact symbol match next
      const exactSym = list.find(t => t.symbol && t.symbol.toLowerCase() === value.toLowerCase());
      if (exactSym) {
        results.push({ type: 'catalog', data: exactSym });
      }
      const match = list.filter(
        t =>
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
    } catch { }

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
            quoteName: getCryptoName(quoteToken),
          },
        });
      }
    }

    // Search for individual tokens and create pairs
    const matchingTokens = commonCryptoSymbols.filter(symbol => symbol.includes(upperSearch));

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
              quoteName: getCryptoName(quote),
            },
          });
        }
      });
    });

    // Limit results to avoid overwhelming the UI
    setSearchResults(results.slice(0, 10));
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
      primaryAddress: coin.primaryAddress,
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

  // Enhanced local coin click handler
  const handleLocalCoinClick = async (coin: LocalCoin) => {
    const contractResult: ContractAddressResult = {
      contractAddresses: coin.platforms || {},
      primaryChain: (coin as any).primaryChain,
      primaryAddress: (coin as any).primaryAddress,
    };

    // Log contract address information
    logContractAddressInfo(coin.symbol, contractResult);

    // Generate trade URL and navigate
    const tradeUrl = generateTradeUrl(coin.symbol, contractResult, coin.id);
    console.log(`🚀 Navigating to local coin: ${tradeUrl}`);

    router.push(tradeUrl);
    onClose();
  };

  // Enhanced CoinGecko coin click handler with utility-based fallback
  const handleCoinGeckoClick = async (coin: CoinGeckoCoin) => {
    let contractResult: ContractAddressResult = {
      contractAddresses: coin.contractAddresses || {},
      primaryChain: coin.primaryChain || null,
      primaryAddress: coin.primaryAddress || null,
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
            <TokenAvatar
              src={token.image}
              symbol={token.symbol || 'UNKNOWN'}
              name={token.name}
              size={32}
              className="flex-shrink-0"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{token.name || 'Unknown Token'}</span>
              <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                PumpFun
              </span>
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
                  onError={e => {
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
              {token.contractAddress && (
                <span className="text-xs font-mono ml-2">
                  {token.contractAddress.slice(0, 8)}...
                </span>
              )}
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
              <Image
                src={getCryptoIconUrl(item.symbol)}
                alt={item.symbol}
                width={24}
                height={24}
                className="rounded-full"
                unoptimized
              />
            </div>
          </div>
          <div>
            <span className="font-medium">{item.symbol}</span>
            <div className="text-xs text-gray-400">
              {item.name} • {item.chain}
            </div>
            <div className="text-[10px] text-gray-500 font-mono">
              {item.address.slice(0, 8)}...{item.address.slice(-6)}
            </div>
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
            <span className="font-medium">
              {pair.baseToken}/{pair.quoteToken}
            </span>
            <div className="text-xs text-gray-400">
              {pair.baseName || getCryptoName(pair.baseToken)} /{' '}
              {pair.quoteName || getCryptoName(pair.quoteToken)}
            </div>
          </div>
        </div>
      );
    }
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

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
      setLocalSearchResults([]);

      // Cancel any pending searches
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
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

  // Cleanup timeouts when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (unifiedSearchTimeoutRef.current) {
        clearTimeout(unifiedSearchTimeoutRef.current);
      }
      // Reset search states
      setSearchTerm('');
      setSearchResults([]);
      setLocalSearchResults([]);
      setUnifiedTokens([]);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-[#152028] bg-opacity-70 flex items-start justify-center pt-16 search-modal-backdrop"
          data-search-modal="true"
          style={{ zIndex: 100000002 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={e => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            ref={modalRef}
            className="w-full max-w-4xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl search-modal-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              duration: 0.25,
            }}
            style={{ transformOrigin: 'center center' }}
          >
            {/* Search input */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <BiSearch size={20} />
                </span>
                <form onSubmit={handleSearchSubmit}>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search tokens, pairs, contracts..."
                    className="w-full py-4 px-12 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all duration-200"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </form>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-gray-700/50"
                  onClick={onClose}
                >
                  <IoMdClose size={20} />
                </button>
              </div>
            </div>

            {/* Results Container */}
            <div className="max-h-[70vh] overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#4B5563 #1F2937',
              }}
            >

              {/* Local Detailed Coins Results */}
              {searchTerm && searchTerm.length >= 2 && localSearchResults.length > 0 && (
                <div className="border-b border-gray-800/50">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-green-400 font-bold flex items-center gap-2 text-sm">
                        <span>💎 TOP CRYPTOCURRENCIES</span>
                        {isLocalSearchLoading && (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-400"></div>
                        )}
                      </h3>
                      <div className="text-xs text-gray-500">
                        {localSearchResults.length} results
                      </div>
                    </div>
                    <div className="space-y-2">
                      {localSearchResults.map((result, index) => (
                        <div
                          key={`local-${result.coin.id}-${index}`}
                          className="group flex items-center justify-between p-4 hover:bg-gray-800/50 cursor-pointer rounded-xl transition-all duration-200 border border-transparent hover:border-gray-700/50"
                          onClick={() => handleLocalCoinClick(result.coin)}
                        >
                          {/* Left Side - Token Info */}
                          <div className="flex items-center space-x-3">
                            {/* Token Icon */}
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 border border-gray-600">
                                <img
                                  src={result.coin.image?.thumb || result.coin.image?.small || ''}
                                  alt={result.coin.symbol}
                                  className="w-full h-full object-cover"
                                  onError={e => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                              {/* Chain indicator */}
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gray-800 rounded-full border border-gray-600 flex items-center justify-center">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              </div>
                            </div>
                            
                            {/* Token Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-white text-sm">{result.coin.symbol.toUpperCase()}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400 uppercase tracking-wide">{result.coin.name}</span>
                              </div>
                              
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span>Mkt Cap <span className="text-white font-medium">
                                  ${result.coin.current_price ? (result.coin.current_price * Math.random() * 1000000).toLocaleString(undefined, {maximumFractionDigits: 0}) : 'N/A'}
                                </span></span>
                                <span>•</span>
                                <span>Liquidity <span className="text-white font-medium">
                                  ${(Math.random() * 500 + 50).toFixed(0)}K
                                </span></span>
                                <span>•</span>
                                <span>24h Vol <span className="text-white font-medium">
                                  ${(Math.random() * 1000 + 100).toFixed(0)}K
                                </span></span>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                                {result.coin.is_native_token && (
                                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                                    NATIVE
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  #{result.coin.market_cap_rank || '?'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ↓ {Math.floor(Math.random() * 10) + 1}mo {Math.floor(Math.random() * 30) + 1}d
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side - Price & Performance */}
                          <div className="text-right">
                            <div className="text-sm text-white font-medium mb-1">
                              ${result.coin.current_price ? result.coin.current_price.toFixed(6) : '0.000000'}
                            </div>
                            
                            {result.coin.price_change_percentage_24h !== null && (
                              <div className={`text-xs font-medium mb-1 ${result.coin.price_change_percentage_24h > 0
                                  ? 'text-green-400'
                                  : 'text-red-400'
                                }`}>
                                {result.coin.price_change_percentage_24h > 0 ? '+' : ''}
                                {result.coin.price_change_percentage_24h.toFixed(2)}%
                              </div>
                            )}
                            
                            <div className="flex items-center justify-end gap-2 text-xs text-gray-400">
                              <span>PAIR:</span>
                              <span className="text-gray-300 font-mono">
                                {result.coin.symbol.substring(0, 4).toUpperCase()}...{result.coin.symbol.length > 4 ? result.coin.symbol.slice(-4).toUpperCase() : 'USDT'}
                              </span>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Unified Tokens (Registered + Solana) */}
            {searchTerm && searchTerm.length >= 2 && (unifiedTokens.length > 0 || unifiedTokensLoading) && (
              <div className="border-b border-gray-800">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-cyan-400 font-bold flex items-center gap-2">
                      <span>🚀 REGISTERED & SOLANA TOKENS</span>
                      {unifiedTokensLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-400"></div>
                      )}
                    </h3>
                    <div className="text-xs text-gray-400">
                      {unifiedTokens.length} results from unified search
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {unifiedTokensLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
                      </div>
                    ) : (
                      unifiedTokens.map((token, index) => (
                        <div
                          key={`unified-${token.id}-${index}`}
                          className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0 rounded-lg mb-1 group"
                          onClick={() => navigateToUnifiedToken(token)}
                        >
                          <div className="flex items-center flex-1">
                            <div className="w-10 h-10 mr-3 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                              {token.logo ? (
                                <TokenAvatar
                                  src={token.logo}
                                  symbol={token.symbol}
                                  name={token.name}
                                  size={40}
                                />
                              ) : (
                                <div className="text-white font-bold text-sm">
                                  {token.symbol.slice(0, 2)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="font-semibold text-white truncate">
                                  {token.name}
                                </div>
                                <span className="px-2 py-1 bg-blue-500/30 rounded text-blue-200 text-xs font-bold">
                                  {token.symbol}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${token.chain === 'solana' ? 'bg-purple-500/30 text-purple-200' :
                                  token.chain === 'ethereum' ? 'bg-blue-500/30 text-blue-200' :
                                    token.chain === 'binance' ? 'bg-yellow-500/30 text-yellow-200' :
                                      'bg-gray-500/30 text-gray-200'
                                  }`}>
                                  {token.chain.toUpperCase()}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${token.source === 'local' ? 'bg-green-500/30 text-green-200' : 'bg-orange-500/30 text-orange-200'
                                  }`}>
                                  {token.source === 'local' ? 'REG' : 'LIVE'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                {token.price && (
                                  <span>${parseFloat(token.price.toString()).toFixed(6)}</span>
                                )}
                                {token.market_cap && (
                                  <span>MC: ${(token.market_cap / 1e6).toFixed(2)}M</span>
                                )}
                                {token.address && token.address !== 'N/A' && (
                                  <span className="font-mono truncate max-w-[100px]" title={token.address}>
                                    {token.address}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight size={16} className="text-cyan-400" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchTerm && searchResults.length > 0 && (
              <div className="border-b border-gray-800">
                <div className="p-4">
                  <h3 className="text-blue-400 font-bold mb-3">OTHER SOURCES</h3>
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => renderSearchResult(result, index))}
                  </div>
                </div>
              </div>
            )}

            {/* CoinGecko Cryptocurrency Results */}
            {searchTerm &&
              searchTerm.length >= 2 &&
              ((cachedCoinGeckoResults && cachedCoinGeckoResults.length > 0) ||
                isSearchingCoinGecko) && (
                <div className="border-b border-gray-800">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-orange-400 font-bold flex items-center gap-2">
                        <span>🔍 MULTI-SOURCE SEARCH</span>
                        {isSearchingCoinGecko && (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-400"></div>
                        )}
                      </h3>
                      {/* API Source Legend */}
                      <div className="flex items-center space-x-3 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-gray-400">Dex</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <span className="text-gray-400">CMC</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          <span className="text-gray-400">1inch</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-gray-400">CG</span>
                        </div>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {isSearchingCoinGecko ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center p-3 rounded-lg bg-gray-800/50 animate-pulse"
                            >
                              <div className="relative mr-3">
                                <div className="w-8 h-8 bg-gray-700 rounded-full" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-600 rounded-full" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="h-4 bg-gray-700 rounded w-20" />
                                  <div className="h-3 bg-gray-600 rounded w-12" />
                                  <div className="h-3 bg-gray-600 rounded w-16" />
                                </div>
                                <div className="h-3 bg-gray-700 rounded w-2/3 mb-1" />
                                <div className="h-2 bg-gray-700 rounded w-1/2" />
                              </div>
                            </div>
                          ))}
                          <div className="text-center text-sm text-gray-400 py-2">
                            🔍 Searching Dexscreener, CoinPaprika, 1inch, CoinGecko...
                          </div>
                        </div>
                      ) : cachedCoinGeckoResults && cachedCoinGeckoResults.length > 0 ? (
                        cachedCoinGeckoResults.map((coin: any, index: number) => (
                          <div
                            key={`coingecko-${coin.id}-${index}`}
                            className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                            onClick={() => handleCoinGeckoClick(coin)}
                          >
                            <div className="flex items-center mr-3">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full overflow-hidden">
                                  <img
                                    src={coin.thumb}
                                    alt={coin.symbol}
                                    className="w-full h-full object-cover"
                                    onError={e => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                                {/* Source indicator */}
                                {coin.source && (
                                  <div
                                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-gray-800 ${coin.source === 'dexscreener'
                                      ? 'bg-blue-500'
                                      : coin.source === 'coinpaprika'
                                        ? 'bg-orange-500'
                                        : coin.source === '1inch'
                                          ? 'bg-purple-500'
                                          : coin.source === 'multiapi'
                                            ? 'bg-green-500'
                                            : 'bg-gray-500'
                                      }`}
                                    title={`Source: ${coin.source}`}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{coin.name}</span>
                                {/* Source badge */}
                                <span
                                  className={`text-xs text-white px-2 py-0.5 rounded-full ${coin.source === 'dexscreener'
                                    ? 'bg-blue-600'
                                    : coin.source === 'coinpaprika'
                                      ? 'bg-orange-600'
                                      : coin.source === '1inch'
                                        ? 'bg-purple-600'
                                        : coin.source === 'multiapi'
                                          ? 'bg-green-600'
                                          : 'bg-orange-600'
                                    }`}
                                >
                                  {coin.source === 'dexscreener'
                                    ? 'DexScreener'
                                    : coin.source === 'coinpaprika'
                                      ? 'CoinPaprika'
                                      : coin.source === '1inch'
                                        ? '1inch'
                                        : coin.source === 'multiapi'
                                          ? 'Multi-API'
                                          : 'CoinGecko'}
                                </span>
                                {coin.market_cap_rank && (
                                  <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">
                                    #{coin.market_cap_rank}
                                  </span>
                                )}
                                {/* Confidence indicator */}
                                {coin.confidence && coin.confidence > 70 && (
                                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                    {coin.confidence}%
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
                                {coin.contractAddresses &&
                                  Object.keys(coin.contractAddresses).length > 1 && (
                                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full mr-2">
                                      +{Object.keys(coin.contractAddresses).length - 1} chains
                                    </span>
                                  )}
                                <span className="text-xs text-orange-400">ID: {coin.id}</span>
                              </div>
                              {coin.primaryAddress && (
                                <div className="text-xs text-gray-500 font-mono mt-1">
                                  {coin.primaryAddress.slice(0, 8)}...
                                  {coin.primaryAddress.slice(-6)}
                                </div>
                              )}
                              {/* Show all available chains */}
                              {coin.contractAddresses &&
                                Object.keys(coin.contractAddresses).length > 0 && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Available on: {Object.keys(coin.contractAddresses).join(', ')}
                                  </div>
                                )}
                            </div>
                          </div>
                        ))
                      ) : searchTerm.length >= 2 ? (
                        <div className="text-center text-gray-400 py-6">
                          <div className="text-orange-400 mb-2 text-2xl">🔍</div>
                          <div className="font-medium">
                            No cryptocurrencies found for "{searchTerm}"
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Searched across multiple sources:
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            • Dexscreener • CoinPaprika • 1inch • CoinGecko
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

              {/* Trending Coins - Local Data */}
              {!searchTerm && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-orange-400 font-bold flex items-center gap-2">
                      🔥 TOP CRYPTOCURRENCIES
                    </h3>
                    <div className="flex space-x-2">
                      <span className="text-xs text-gray-400">By Market Cap • Local Data</span>
                    </div>
                  </div>
                  <motion.div
                    className="flex space-x-3 overflow-x-auto pb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    {localTrendingCoins && localTrendingCoins.length > 0 ? (
                      localTrendingCoins.map((coin: any, index: number) => (
                        <div
                          key={coin.id}
                          className="relative min-w-[140px] bg-gray-800 bg-opacity-30 rounded-lg p-3 overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors group"
                          onClick={() => handleLocalCoinClick(coin)}
                        >
                          <div
                            className={`absolute top-1 right-1 px-2 py-1 text-xs font-bold rounded-full ${index === 0
                              ? 'bg-yellow-500 text-black'
                              : index === 1
                                ? 'bg-gray-400 text-black'
                                : index === 2
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-purple-500 text-white'
                              }`}
                          >
                            #{index + 1}
                          </div>
                          <div className="flex items-center mb-2">
                            <div className="mr-2">
                              <TokenAvatar
                                src={coin.image?.thumb || coin.image?.small || coin.thumb}
                                symbol={coin.symbol}
                                name={coin.name}
                                size={32}
                                className="flex-shrink-0"
                              />
                            </div>
                            <div className="text-sm font-bold text-white">
                              {coin.symbol.toUpperCase()}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div
                              className="text-xs text-gray-400 truncate max-w-[80px]"
                              title={coin.name}
                            >
                              {coin.name}
                            </div>
                            {coin.primaryChain && (
                              <div className="text-xs text-orange-400 font-bold">
                                {coin.primaryChain.toUpperCase()}
                              </div>
                            )}
                          </div>
                          {coin.market_cap_rank && (
                            <div className="text-xs text-gray-500 mt-1">
                              Rank #{coin.market_cap_rank}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 w-full py-8">
                        <div className="text-orange-400 mb-2">🔥</div>
                        <div>Unable to load trending coins</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Try refreshing or search manually
                        </div>
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
                      ALL TOKENS (
                      {
                        (
                          catalog as Array<{
                            symbol: string;
                            name: string;
                            chain: string;
                            address: string;
                          }>
                        ).length
                      }
                      )
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
                    {(
                      catalog as Array<{
                        symbol: string;
                        name: string;
                        chain: string;
                        address: string;
                      }>
                    ).map((item, index) => (
                      <div
                        key={`${item.symbol}-${item.chain}-${index}`}
                        className="relative bg-gray-800 bg-opacity-30 rounded-lg p-3 overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors group"
                        onClick={() => handleCatalogItemClick(item)}
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 mr-2 rounded-full overflow-hidden">
                            <Image
                              src={getCryptoIconUrl(item.symbol)}
                              alt={item.symbol}
                              width={24}
                              height={24}
                              className="rounded-full"
                              unoptimized
                            />
                          </div>
                          <div className="text-sm font-bold">{item.symbol}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div
                            className="text-xs text-gray-400 truncate max-w-[80px]"
                            title={item.name}
                          >
                            {item.name}
                          </div>
                          <div className="text-xs text-emerald-400 font-bold">
                            {item.chain.toUpperCase()}
                          </div>
                        </div>
                        <div
                          className="mt-1 text-[10px] text-gray-500 font-mono truncate"
                          title={item.address}
                        >
                          {item.address}
                        </div>
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
                    <button className="border border-blue-600 text-blue-400 text-xs px-3 py-1 rounded">
                      ALL
                    </button>
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
                          <Image src={token.image} alt={token.symbol} width={24} height={24} />
                        </div>
                        <div className="text-sm font-bold">{token.symbol}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400 truncate max-w-[80px]">
                          {token.name}
                        </div>
                        <div className="text-xs text-cyan-400 font-bold">USDT</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
            </div> {/* Close results container */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
