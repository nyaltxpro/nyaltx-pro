import React, { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Banner from './Banner'
import ConnectWalletButton from './ConnectWalletButton';
import BlockchainDropdown from './BlockchainDropdown';
import './animations.css';
import { SlStar } from 'react-icons/sl';
import { AiFillStar } from 'react-icons/ai';
import { BiSearch } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';
import { MdOutlineCollections } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import LivePriceTicker from './LivePriceTicker';
import { commonCryptoSymbols, getCryptoIconUrl } from '../utils/cryptoIcons';
import { getCryptoName } from '../utils/cryptoNames';
import SearchModal from './SearchModal';


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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Open search modal
  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  // Close search modal
  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  // Trigger native browser bookmark functionality
  // const addToBookmarks = () => {
  //   if (typeof window !== 'undefined') {
  //     // Use keyboard shortcut to trigger native bookmark dialog
  //     const event = new KeyboardEvent('keydown', {
  //       key: 'd',
  //       code: 'KeyD',
  //       ctrlKey: true,
  //       metaKey: navigator.platform.includes('Mac'), // Use Cmd on Mac, Ctrl on others
  //       bubbles: true
  //     });
      
  //     document.dispatchEvent(event);
      
  //     // Fallback: Try to use the deprecated but still working method
  //     if ('addToHomescreen' in window || 'sidebar' in window) {
  //       try {
  //         // For older browsers or specific cases
  //         if (window.sidebar && window.sidebar.addPanel) {
  //           window.sidebar.addPanel(document.title, window.location.href, '');
  //         } else if (window.external && window.external.AddFavorite) {
  //           window.external.AddFavorite(window.location.href, document.title);
  //         }
  //       } catch (e) {
  //         // If all else fails, show instructions
  //         alert('Please use Ctrl+D (or Cmd+D on Mac) to bookmark this page');
  //       }
  //     }
  //   }
  // };
  
  return (
    <div className='flex flex-col w-full items-center justify-center'>
       <Banner />
      
            {/* Hot pairs ticker */}
  
            
            {/* Header */}
            <div className="flex w-full items-center justify-between p-4 border-b border-gray-800">
              <div className="flex w-[20%] items-center space-x-4">
                <BlockchainDropdown />
              </div>
              
              <div className="flex w-[60%] items-center justify-center mx-4">
                <div className="w-[80%] relative" ref={searchRef}>
                  <div 
                    className="relative cursor-pointer"
                    onClick={openSearchModal}
                  >
                    <span className="absolute left-3 top-1/2 transform bg-gray-600 p-1 rounded-full -translate-y-1/2 text-secondary">
                      <BiSearch/>
                    </span>
                    <input
                      type="text"
                      placeholder="Search pair by symbol, name, contract or token"
                      className="w-full py-2 ml-1 px-8 rounded-full bg-opacity-10 bg-gray-800 border border-gray-700 focus:outline-none focus:border-primary cursor-pointer"
                      readOnly
                      onClick={openSearchModal}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex w-[15%] items-center justify-between space-x-3">
                {/* <Link href="/pricing" className="p-2 rounded-full hover:bg-gray-700 text-sm font-medium">
                  <span className={pathname?.startsWith('/pricing') ? 'text-cyan-400' : ''}>Pricing</span>
                </Link> */}
                <Link href="/nyaltz-listings" className="p-2 rounded-full hover:bg-gray-700" title="NYAX Listings">
                  <MdOutlineCollections className={pathname?.startsWith('/nyaltz-listings') ? 'text-cyan-400' : ''} />
                </Link>
                {/* <Link href="/profile" className="p-2 rounded-full hover:bg-gray-700">
                  <CgProfile className={pathname?.startsWith('/profile') ? 'text-blue-400' : ''} />
                </Link> */}
                <Link href="/dashboard/settings" className="p-2 cursor-pointer rounded-full hover:bg-gray-700">
                  <FiSettings className={pathname?.startsWith('/settings') ? 'text-blue-400' : ''} />
                </Link>
                {/* <button 
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  onClick={addToBookmarks}
                  title="Bookmark this page"
                >
                  <SlStar className="text-gray-400 hover:text-yellow-400" />
                </button> */}
                <ConnectWalletButton />
              </div>
            </div>
            <LivePriceTicker />
            
            {/* Search Modal */}
            <SearchModal 
              isOpen={isSearchModalOpen} 
              onClose={closeSearchModal} 
            />
    </div>
  )
}

export default Header
