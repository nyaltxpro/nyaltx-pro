import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { FiMenu } from 'react-icons/fi'; // Import hamburger menu icon
import { SlStar } from 'react-icons/sl';
import { commonCryptoSymbols } from '../utils/cryptoIcons';
import { getCryptoName } from '../utils/cryptoNames';
import Banner from './Banner';
import BlockchainDropdown from './BlockchainDropdown';
import LivePriceTicker from './LivePriceTicker';
import SearchModal from './SearchModal';
import SimpleUnifiedWalletButton from './SimpleUnifiedWalletButton';
import './animations.css';

// Define token pair type
interface TokenPair {
  baseToken: string;
  quoteToken: string;
  baseName?: string;
  quoteName?: string;
}

interface HeaderProps {
  toggleMobileMenu: () => void;
}

const Header = ({ toggleMobileMenu }: HeaderProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<TokenPair[]>([]);
  const [showResults, setShowResults] = useState(false);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Open search modal
  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  // Close search modal
  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
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
          quoteName: getCryptoName(quoteToken),
        });
      }
    }

    // Then search for individual tokens and create pairs with common quote currencies
    const upperSearch = value.toUpperCase();
    const matchingTokens = commonCryptoSymbols.filter(
      symbol =>
        symbol.includes(upperSearch) ||
        getCryptoName(symbol).toLowerCase().includes(value.toLowerCase())
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
            quoteName: getCryptoName(quote),
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
    <div className="flex flex-col w-full items-center justify-center">
      <Banner />

      {/* Enhanced Modern Header */}
      <div className="relative w-full bg-black/95 backdrop-blur-xl border-b border-gray-800/50" style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(15, 15, 15, 0.95) 50%, rgba(0, 0, 0, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Animated background accent */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00d4aa] to-transparent opacity-60"></div>

        <div className="grid grid-cols-12 gap-2 sm:gap-3 lg:gap-4 items-center px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          {/* Left Section - Mobile Menu + Blockchain Dropdown */}
          <div className="col-span-2 sm:col-span-3 flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-300 border border-transparent hover:border-white/20"
              >
                <FiMenu size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>

            {/* Blockchain Dropdown - Hidden on mobile */}
            <div className="hidden md:block">
              <BlockchainDropdown
                onSelectNetwork={networkId => console.log(`Selected network: ${networkId}`)}
              />
            </div>
          </div>

          {/* Center Section - Enhanced Search Input */}
          <div className="col-span-7 sm:col-span-6 flex items-center justify-center">
            <div className="w-full max-w-lg relative" ref={searchRef}>
              <div className="relative cursor-pointer group" onClick={openSearchModal}>
                {/* Animated background glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00d4aa]/20 via-[#3b82f6]/20 to-[#00d4aa]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>

                {/* Main search container */}
                <div className="relative bg-black/40 backdrop-blur-xl border border-gray-800/60 rounded-2xl overflow-hidden group-hover:border-[#00d4aa]/40 transition-all duration-500 shadow-2xl">
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa]/5 via-transparent to-[#3b82f6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Search icon */}
                  <div className="absolute left-3 sm:left-5 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00d4aa]/20 to-[#3b82f6]/20 rounded-lg flex items-center justify-center group-hover:from-[#00d4aa]/30 group-hover:to-[#3b82f6]/30 transition-all duration-300">
                      <BiSearch className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-[#00d4aa] transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Search input */}
                  <input
                    type="text"
                    placeholder="Search tokens..."
                    className="relative w-full h-12 sm:h-14 py-3 sm:py-4 pl-12 sm:pl-16 pr-16 sm:pr-20 bg-transparent text-white placeholder-gray-500 focus:outline-none cursor-pointer transition-all duration-300 group-hover:placeholder-gray-400"
                    style={{
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                      fontSize: '15px',
                      fontWeight: '400'
                    }}
                    readOnly
                    onClick={openSearchModal}
                  />

                  {/* Keyboard shortcut hint */}
                  <div className="absolute right-3 sm:right-5 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded-lg border border-gray-700/50 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs text-gray-400 font-medium">⌘</span>
                      <span className="text-xs text-gray-400 font-medium">K</span>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Enhanced Action Buttons */}
          <div className="col-span-3 flex items-center justify-end gap-1 sm:gap-2">
            {/* Settings Button */}
            {/* <div className="hidden md:block">
              <Link
                href="/dashboard/settings"
                className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl transition-all duration-300 text-gray-400 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5 hover:text-white hover:shadow-lg hover:shadow-black/20 border border-transparent hover:border-white/20"
              >
                <FiSettings className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:rotate-90" />
              </Link>
            </div> */}

            {/* Favorites Button */}
            <div className="hidden md:block">
              <Link
                href="/dashboard/favorites"
                className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl transition-all duration-300 text-gray-400 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5 hover:text-white hover:shadow-lg hover:shadow-black/20 border border-transparent hover:border-white/20"
              >
                <SlStar className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110" />
              </Link>
            </div>

            {/* Connect Wallet Button */}
            <div className="ml-1 sm:ml-2">
              <SimpleUnifiedWalletButton />
            </div>
          </div>
        </div>
      </div>

      <LivePriceTicker />
      <SearchModal isOpen={isSearchModalOpen} onClose={closeSearchModal} />
    </div>
  );
};

export default Header;
