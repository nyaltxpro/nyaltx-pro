import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FiChevronDown } from 'react-icons/fi';
import Image from 'next/image';

// Define the blockchain networks with their respective image paths
const blockchainNetworks = [
  { id: 'ethereum', name: 'Ethereum', imagePath: '/ethereum.svg' },
  { id: 'bsc', name: 'Binance Smart Chain', imagePath: '/bsc.svg' },
  { id: 'polygon', name: 'Polygon', imagePath: '/polygon.svg' },
  { id: 'arbitrum', name: 'Arbitrum', imagePath: '/arbitrum.svg' },
  { id: 'avalanche', name: 'Avalanche', imagePath: '/avalanche.svg' },
  { id: 'solana', name: 'Solana', imagePath: '/solana.svg' },
  { id: 'optimism', name: 'Optimism', imagePath: '/optimism.svg' },
  { id: 'base', name: 'Base', imagePath: '/base.svg' },
  { id: 'zksync', name: 'zkSync', imagePath: '/zksync.svg' },
  { id: 'fantom', name: 'Fantom', imagePath: '/fantom.svg' },
  { id: 'cronos', name: 'Cronos', imagePath: '/cronos.svg' },
  { id: 'celo', name: 'Celo', imagePath: '/celo.svg' },
  { id: 'kava', name: 'Kava', imagePath: '/kava.svg' },
  { id: 'linea', name: 'Linea', imagePath: '/linea.svg' },
  { id: 'mantle', name: 'Mantle', imagePath: '/mantle.svg' },
  { id: 'metis', name: 'Metis', imagePath: '/metis.svg' },
  { id: 'moonbeam', name: 'Moonbeam', imagePath: '/moonbeam.svg' },
  { id: 'scroll', name: 'Scroll', imagePath: '/scroll.svg' },
];

interface AllChainsDropdownProps {
  onSelectChain?: (chainId: string) => void;
  className?: string;
}

const AllChainsDropdown: React.FC<AllChainsDropdownProps> = ({
  onSelectChain,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectChain = (chainId: string) => {
    if (onSelectChain) {
      onSelectChain(chainId);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center justify-between bg-gray-800 text-white rounded-lg px-4 py-2 w-full hover:bg-gray-700 transition-colors">
            <span className="font-medium">All Chains</span>
            <FiChevronDown className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content 
            className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-2 w-64 max-h-96 overflow-y-auto z-50" 
            sideOffset={5}
            align="center"
          >
            <div className="grid grid-cols-1 gap-1">
              {blockchainNetworks.map((network) => (
                <DropdownMenu.Item 
                  key={network.id}
                  className="flex items-center px-3 py-2 rounded hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleSelectChain(network.id)}
                >
                  <div className="w-6 h-6 relative mr-3">
                    <Image
                      src={network.imagePath}
                      alt={network.name}
                      width={24}
                      height={24}
                      className="object-contain"
                      onError={(e) => {
                        // Fallback for missing images
                        (e.target as HTMLImageElement).src = '/globe.svg';
                      }}
                    />
                  </div>
                  <span className="text-sm text-white">{network.name}</span>
                </DropdownMenu.Item>
              ))}
            </div>
            <DropdownMenu.Separator className="h-px bg-gray-700 my-2" />
            <DropdownMenu.Item 
              className="flex items-center justify-center px-3 py-2 rounded hover:bg-gray-800 cursor-pointer"
            >
              <span className="text-sm text-blue-400">View All Networks</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};

export default AllChainsDropdown;
