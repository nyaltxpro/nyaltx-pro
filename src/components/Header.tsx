import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Banner from './Banner'
import ConnectWalletButton from './ConnectWalletButton';
import BlockchainDropdown from './BlockchainDropdown';
import './animations.css';
import { SlStar } from 'react-icons/sl';
import { BiSearch } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';
import LivePriceTicker from './LivePriceTicker';
import { commonCryptoSymbols, getCryptoIconUrl } from '../app/utils/cryptoIcons';
import { getCryptoName } from '../app/utils/cryptoNames';


// Define token pair type
interface TokenPair {
  baseToken: string;
  quoteToken: string;
  baseName?: string;
  quoteName?: string;
}

const Header = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<TokenPair[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Popular token pairs for quick suggestions
  const popularPairs: TokenPair[] = [
    { baseToken: 'BTC', quoteToken: 'USDT', baseName: getCryptoName('BTC'), quoteName: getCryptoName('USDT') },
    { baseToken: 'ETH', quoteToken: 'USDT', baseName: getCryptoName('ETH'), quoteName: getCryptoName('USDT') },
    { baseToken: 'BTC', quoteToken: 'USDC', baseName: getCryptoName('BTC'), quoteName: getCryptoName('USDC') },
    { baseToken: 'ETH', quoteToken: 'USDC', baseName: getCryptoName('ETH'), quoteName: getCryptoName('USDC') },
    { baseToken: 'SOL', quoteToken: 'USDT', baseName: getCryptoName('SOL'), quoteName: getCryptoName('USDT') },
    { baseToken: 'BNB', quoteToken: 'USDT', baseName: getCryptoName('BNB'), quoteName: getCryptoName('USDT') },
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
    setShowResults(true);
  };

  // Handle clicking on a search result
  const handleResultClick = (pair: TokenPair) => {
    router.push(`/trade?base=${pair.baseToken}&quote=${pair.quoteToken}`);
    setSearchTerm('');
    setShowResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchResults.length > 0) {
      handleResultClick(searchResults[0]);
    }
  };
  
  return (
    <div className='flex flex-col w-full items-center justify-center'>
       <Banner />
      
            {/* Hot pairs ticker */}
  
            
            {/* Header */}
            <div className="flex  w-full items-center  justify-between p-4 border-b border-gray-800">
              <div className="flex w-[25%] items-center space-x-4">
              <BlockchainDropdown 
                  onSelectNetwork={(networkId) => console.log(`Selected network: ${networkId}`)} 
                />
              </div>
              
              <div className="flex w-[60%] mx-4">
                <div className="w-[80%] relative" ref={searchRef}>
                  <form onSubmit={handleSearchSubmit}>
                  <span className="absolute left-3  top-1/2 transform bg-gray-600 p-1 rounded-full -translate-y-1/2 text-secondary">
                      <BiSearch/>
                    </span>
                    <input
                      type="text"
                      placeholder="Search pair by symbol, name, contract or token"
                      className="w-full py-2  ml-1 px-8 rounded-full bg-opacity-10 bg-gray-800 border border-gray-700 focus:outline-none focus:border-primary"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => searchResults.length > 0 && setShowResults(true)}
                    />
                   
                  </form>
                  
                  {/* Search results dropdown */}
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                      {searchResults.map((pair, index) => (
                        <div 
                          key={index}
                          className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                          onClick={() => handleResultClick(pair)}
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
                      ))}
                    </div>
                  )}
                  
                  {/* Show popular pairs when search is empty */}
                  {showResults && searchTerm.trim() === '' && (
                    <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                      <div className="p-3 border-b border-gray-700">
                        <h3 className="text-sm text-gray-400">Popular Pairs</h3>
                      </div>
                      {popularPairs.map((pair, index) => (
                        <div 
                          key={index}
                          className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                          onClick={() => handleResultClick(pair)}
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
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex w-[15%] items-center justify-between space-x-3">
            
                <button className="p-2 rounded-full hover:bg-gray-700">
                  <FiSettings/>
                </button>
                <button className="p-2 rounded-full hover:bg-gray-700">
                  <SlStar/>
                </button>
                <ConnectWalletButton />
              </div>
            </div>
            <LivePriceTicker />
    </div>
  )
}

export default Header
