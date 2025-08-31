import React, { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Banner from './Banner'
import ConnectWalletButton from './ConnectWalletButton';
import BlockchainDropdown from './BlockchainDropdown';
import './animations.css';
import { SlStar } from 'react-icons/sl';
import { BiSearch } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';
import { MdOutlineCollections } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import LivePriceTicker from './LivePriceTicker';
import { commonCryptoSymbols, getCryptoIconUrl } from '../app/utils/cryptoIcons';
import { getCryptoName } from '../app/utils/cryptoNames';
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
    <div className='flex flex-col w-full items-center justify-center'>
       <Banner />
      
            {/* Hot pairs ticker */}
  
            
            {/* Header */}
            <div className="flex w-full items-center justify-between p-4 border-b border-gray-800">
              <div className="flex w-[20%] items-center space-x-4">
                <BlockchainDropdown 
                  onSelectNetwork={(networkId) => console.log(`Selected network: ${networkId}`)} 
                />
              
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
                {/* <Link href="/profile" className="p-2 rounded-full hover:bg-gray-700">
                  <CgProfile className={pathname?.startsWith('/profile') ? 'text-blue-400' : ''} />
                </Link> */}
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
            
            {/* Search Modal */}
            <SearchModal 
              isOpen={isSearchModalOpen} 
              onClose={closeSearchModal} 
            />
    </div>
  )
}

export default Header
