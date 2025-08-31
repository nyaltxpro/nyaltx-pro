'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BiSearch } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { commonCryptoSymbols, getCryptoIconUrl } from '../app/utils/cryptoIcons';
import { getCryptoName } from '../app/utils/cryptoNames';
import { getTrendingCoins } from '../api/coingecko/client';

// Define token pair type
interface TokenPair {
  baseToken: string;
  quoteToken: string;
  baseName?: string;
  quoteName?: string;
}

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
  score: number;
  price_btc: number;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<TokenPair[]>([]);
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    
    if (value.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Search for token pairs
    const results: TokenPair[] = [];
    
    // First check if the search term contains a trading pair format (e.g., BTC/USDT)
    const pairMatch = value.match(/([A-Za-z0-9]+)[/\\-]([A-Za-z0-9]+)/);
    if (pairMatch) {
      const baseToken = pairMatch[1].toUpperCase();
      const quoteToken = pairMatch[2].toUpperCase();
      
      if (commonCryptoSymbols.includes(baseToken) && commonCryptoSymbols.includes(quoteToken)) {
        results.push({ 
          baseToken, 
          quoteToken, 
          baseName: getCryptoName(baseToken),
          quoteName: getCryptoName(quoteToken)
        });
      }
    }
    
    // Then search for individual tokens and create pairs with common quote currencies
    const upperSearch = value.toUpperCase();
    const matchingTokens = commonCryptoSymbols.filter(symbol => 
      symbol.includes(upperSearch)
    );
    
    // For each matching token, create pairs with common quote currencies
    const quoteCurrencies = ['USDT', 'USDC', 'ETH', 'BTC'];
    matchingTokens.forEach(token => {
      // Don't create pairs where base = quote
      quoteCurrencies.forEach(quote => {
        if (token !== quote) {
          results.push({ 
            baseToken: token, 
            quoteToken: quote,
            baseName: getCryptoName(token),
            quoteName: getCryptoName(quote)
          });
        }
      });
    });
    
    // Limit results to avoid overwhelming the UI
    setSearchResults(results.slice(0, 10));
  };

  // Handle clicking on a search result
  const handleResultClick = (pair: TokenPair) => {
    router.push(`/trade?base=${pair.baseToken}&quote=${pair.quoteToken}`);
    setSearchTerm('');
    onClose();
  };
  
  // Handle clicking on a trending coin
  const handleTrendingClick = (coin: TrendingCoin) => {
    router.push(`/trade?base=${coin.symbol.toUpperCase()}&quote=USDT`);
    onClose();
  };
  
  // Handle clicking on a popular token
  const handlePopularTokenClick = (token: { symbol: string }) => {
    router.push(`/trade?base=${token.symbol}&quote=USDT`);
    onClose();
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchResults.length > 0) {
      handleResultClick(searchResults[0]);
    }
  };

  // Fetch trending coins when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchTrending = async () => {
        try {
          setTrendingLoading(true);
          const data = await getTrendingCoins();
          
          // CoinGecko returns trending coins in a nested structure
          if (data && data.coins) {
            const formattedCoins = data.coins.map((item: any) => ({
              id: item.item.id,
              name: item.item.name,
              symbol: item.item.symbol,
              market_cap_rank: item.item.market_cap_rank,
              thumb: item.item.thumb,
              score: item.item.score,
              price_btc: item.item.price_btc
            }));
            
            setTrendingCoins(formattedCoins);
          }
          
          setTrendingLoading(false);
        } catch (err) {
          console.error('Error fetching trending coins:', err);
          setTrendingLoading(false);
        }
      };
      
      fetchTrending();
      
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-start justify-center pt-16">
      <div 
        ref={modalRef}
        className="bg-[#0f1923] w-full max-w-3xl rounded-lg shadow-xl overflow-hidden"
      >
        {/* Search input */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <BiSearch size={20} />
            </span>
            <form onSubmit={handleSearchSubmit}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pair by symbol, name, contract or token"
                className="w-full py-2 px-10 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
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

        {/* Featured content */}
        <div className="p-4">
          {/* Featured swap */}
          <div className="mb-6 bg-gray-800 bg-opacity-30 rounded-lg p-3">
            <div className="flex items-center">
              <div className="w-8 h-8 mr-2 rounded-full overflow-hidden">
                <Image 
                  src="/crypto-icons/color/sol.svg" 
                  alt="1inch" 
                  width={32} 
                  height={32} 
                  className="rounded-full"
                />
              </div>
              <div className="text-sm">
                <span className="text-blue-400">1inch</span> - Swap Solana tokens on 6 off EVM chains. <span className="text-blue-400">Swap now!</span>
              </div>
            </div>
          </div>

          {/* Trending Coins */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-blue-400 font-bold">TRENDING COINS</h3>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-xs px-3 py-1 rounded">TOP</button>
                <button className="border border-blue-600 text-blue-400 text-xs px-3 py-1 rounded">RANKING</button>
              </div>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {trendingLoading ? (
                <div className="flex justify-center items-center w-full py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : trendingCoins.length > 0 ? (
                trendingCoins.map((coin, index) => (
                  <div 
                    key={coin.id} 
                    className="relative min-w-[120px] bg-gray-800 bg-opacity-30 rounded-lg p-3 overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleTrendingClick(coin)}
                  >
                    <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-blue-500' : 
                      index === 2 ? 'bg-green-500' : 
                      'bg-purple-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 mr-2 rounded-full overflow-hidden">
                        <Image 
                          src={coin.thumb} 
                          alt={coin.name} 
                          width={24} 
                          height={24} 
                          unoptimized
                        />
                      </div>
                      <div className="text-sm font-bold">{coin.symbol.toUpperCase()}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400 truncate max-w-[80px]">{coin.name}</div>
                      <div className="text-xs text-cyan-400 font-bold">USDT</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 w-full py-4">
                  No trending coins found
                </div>
              )}
            </div>
          </div>
          
          {/* Popular Tokens */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-blue-400 font-bold">POPULAR TOKENS</h3>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-xs px-3 py-1 rounded">TOP</button>
                <button className="border border-blue-600 text-blue-400 text-xs px-3 py-1 rounded">ALL</button>
              </div>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {popularTokens.map((token, index) => (
                <div 
                  key={index} 
                  className="relative min-w-[120px] bg-gray-800 bg-opacity-30 rounded-lg p-3 overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => router.push(`/trade?base=${token.symbol}&quote=USDT`)}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
