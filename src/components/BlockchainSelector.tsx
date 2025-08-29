import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FiChevronDown } from 'react-icons/fi';
import { Blockchain } from '../lib/types/blockchain';
import { supportedBlockchains } from '../lib/blockchain/blockchainUtils';
import Image from 'next/image';

interface BlockchainSelectorProps {
  selectedBlockchain: Blockchain | null;
  onSelectBlockchain: (blockchain: Blockchain) => void;
  label?: string;
  className?: string;
}

const BlockchainSelector: React.FC<BlockchainSelectorProps> = ({
  selectedBlockchain,
  onSelectBlockchain,
  label = 'Select Blockchain',
  className = '',
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={`flex items-center text-sm text-gray-300 px-3 py-1.5 rounded hover:bg-gray-800 focus:outline-none ${className}`}>
          {selectedBlockchain ? (
            <>
              <div className="flex items-center">
                {selectedBlockchain.logoURI && (
                  <div className="w-5 h-5 mr-2 relative">
                    <Image 
                      src={selectedBlockchain.logoURI} 
                      alt={selectedBlockchain.name}
                      width={20}
                      height={20}
                    />
                  </div>
                )}
                {selectedBlockchain.name}
              </div>
            </>
          ) : (
            label
          )}
          <FiChevronDown className="ml-1" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-[320px] max-h-[400px] overflow-y-auto bg-gray-900 rounded-md p-3 shadow-lg border border-gray-800" sideOffset={5}>
          <div className="grid grid-cols-3 gap-2">
            {supportedBlockchains.map((blockchain) => (
              <DropdownMenu.Item 
                key={blockchain.id}
                className="flex flex-col items-center text-center text-sm text-gray-300 rounded p-2 cursor-pointer hover:bg-gray-800 focus:outline-none"
                onClick={() => onSelectBlockchain(blockchain)}
              >
                <div className="w-8 h-8 mb-1 relative">
                  {blockchain.logoURI && (
                    <Image 
                      src={blockchain.logoURI} 
                      alt={blockchain.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  )}
                </div>
                <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                  {blockchain.name}
                </span>
              </DropdownMenu.Item>
            ))}
          </div>
          <DropdownMenu.Separator className="h-px bg-gray-800 my-1" />
          <DropdownMenu.Item className="px-2 py-2 text-sm text-blue-500 rounded hover:bg-gray-800 focus:bg-gray-800 outline-none cursor-pointer">
            View All Blockchains
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default BlockchainSelector;
