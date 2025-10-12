import { ArchiveIcon, GearIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Banner from './Banner';
import BlockchainDropdown from './BlockchainDropdown';
import UnifiedWalletButton from './UnifiedWalletButton';
import LivePriceTicker from './LivePriceTicker';
import SearchModal from './SearchModal';
import './animations.css';

// Define token pair type
interface TokenPair {
  baseToken: string;
  quoteToken: string;
  baseName?: string;
  quoteName?: string;
}

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
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

  return (
    <Tooltip.Provider>
      <div className="flex flex-col w-full items-center justify-center">
        <Banner />

        {/* Redesigned Modern Header */}
        <div className="relative w-full bg-black/95 backdrop-blur-xl border-b border-gray-800/50" style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(15, 15, 15, 0.95) 50%, rgba(0, 0, 0, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Animated background accent */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00d4aa] to-transparent opacity-60"></div>

          <div className="grid grid-cols-12 gap-4 items-center px-6 py-4">
            {/* Left Section - Blockchain Dropdown */}
            <div className="col-span-3 flex items-center">
              <BlockchainDropdown />
            </div>

            {/* Center Section - Enhanced Search Input */}
            <div className="col-span-6 flex items-center justify-center">
              <div className="w-full max-w-lg relative" ref={searchRef}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="relative cursor-pointer group" onClick={openSearchModal}>
                      {/* Animated background glow */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00d4aa]/20 via-[#3b82f6]/20 to-[#00d4aa]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
                      
                      {/* Main search container */}
                      <div className="relative bg-black/40 backdrop-blur-xl border border-gray-800/60 rounded-2xl overflow-hidden group-hover:border-[#00d4aa]/40 transition-all duration-500 shadow-2xl">
                        {/* Inner glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa]/5 via-transparent to-[#3b82f6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Search icon */}
                        <div className="absolute left-5 top-1/2 transform -translate-y-1/2 z-10">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#00d4aa]/20 to-[#3b82f6]/20 rounded-lg flex items-center justify-center group-hover:from-[#00d4aa]/30 group-hover:to-[#3b82f6]/30 transition-all duration-300">
                            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 group-hover:text-[#00d4aa] transition-colors duration-300" />
                          </div>
                        </div>

                        {/* Search input */}
                        <input
                          type="text"
                          placeholder="Search tokens, contracts, pairs..."
                          className="relative w-full h-16 py-5 pl-16 pr-20 bg-transparent text-white placeholder-gray-500 focus:outline-none cursor-pointer transition-all duration-300 group-hover:placeholder-gray-400"
                          style={{ 
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                            fontSize: '15px',
                            fontWeight: '400'
                          }}
                          readOnly
                          onClick={openSearchModal}
                        />

                        {/* Keyboard shortcut hint */}
                        <div className="absolute right-5 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded-lg border border-gray-700/50 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-xs text-gray-400 font-medium">⌘</span>
                            <span className="text-xs text-gray-400 font-medium">K</span>
                          </div>
                        </div>

                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] group-hover:w-full transition-all duration-500"></div>
                      </div>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-black/95 backdrop-blur-xl text-white px-4 py-3 rounded-xl text-sm border border-gray-700/50 shadow-2xl">
                      <div className="flex items-center gap-2">
                        <MagnifyingGlassIcon className="w-4 h-4 text-[#00d4aa]" />
                        <span>Search tokens, contracts & trading pairs</span>
                      </div>
                      <Tooltip.Arrow className="fill-black/95" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="col-span-3 flex items-center justify-end gap-3">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Link
                    href="/nyaltz-listings"
                    className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 ${pathname?.startsWith('/nyaltz-listings')
                        ? 'bg-gradient-to-br from-[#00d4aa]/30 to-[#3b82f6]/30 text-[#00d4aa] shadow-lg shadow-[#00d4aa]/20 border border-[#00d4aa]/40'
                        : 'text-gray-400 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5 hover:text-white hover:shadow-lg hover:shadow-black/20 border border-transparent hover:border-white/20'
                      }`}
                  >
                    <ArchiveIcon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-black/90 text  -white px-3 py-2 rounded-xl text-sm border border-gray-700/50">
                    NYAX Listings
                    <Tooltip.Arrow className="fill-black/90" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Link
                    href="/dashboard/settings"
                    className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 ${pathname?.startsWith('/settings')
                        ? 'bg-gradient-to-br from-[#00d4aa]/30 to-[#3b82f6]/30 text-[#00d4aa] shadow-lg shadow-[#00d4aa]/20 border border-[#00d4aa]/40'
                        : 'text-gray-400 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5 hover:text-white hover:shadow-lg hover:shadow-black/20 border border-transparent hover:border-white/20'
                      }`}
                  >
                    <GearIcon className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-xl text-sm border border-gray-700/50">
                    Settings
                    <Tooltip.Arrow className="fill-black/90" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              <div className="ml-2">
                <UnifiedWalletButton />
              </div>
            </div>
          </div>
        </div>

        <LivePriceTicker />

        {/* Search Modal */}
        <SearchModal isOpen={isSearchModalOpen} onClose={closeSearchModal} />
      </div>
    </Tooltip.Provider>
  );
};

export default Header;
