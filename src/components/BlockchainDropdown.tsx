import React, { useState, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Image from 'next/image';
// import { blockchainNetworks } from '../lib/blockchain/blockchainUtils';
import { isTopBlockchain } from '../lib/blockchain/topBlockchains';
import { getBlockchainLogoUrl } from '../lib/blockchain/blockchainLogos';
import { getCryptoIconUrl } from '../utils/cryptoIcons';
import chainsData from '@/data/chains.json';

// Blockchain logo component with fallbacks
const BlockchainLogo: React.FC<{
  blockchainId: string;
  blockchainName: string;
  size: number;
}> = ({ blockchainId, blockchainName, size }) => {
  // Default fallback icon
  const defaultIcon = '/globe.svg';
  
  // Direct mapping from blockchain IDs to logo files in /cc directory
  const ccLogoMap: Record<string, string> = {
    'arbitrum-one': '/cc/arbitrum.png',
    'base': '/cc/base.png',
    'fantom': '/cc/fantom.png',
    'optimistic-ethereum': '/cc/optimism.png',
    'ronin': '/cc/ronin.png',
    'sei-v2': '/cc/sei.png',
    'sui': '/cc/sui.png',
    'xai': '/cc/xai.png',
    'near-protocol': '/cc/near.png',
    'celestia': '/cc/celestia.png'
  };
  
  // Map blockchain ID to a cryptocurrency symbol for icon lookup
  const symbolMap: Record<string, string> = {
    'ethereum': 'ETH',
    'bitcoin': 'BTC',
    'binance-smart-chain': 'BNB',
    'solana': 'SOL',
    'polygon-pos': 'MATIC',
    'avalanche': 'AVAX',
    'tron': 'TRX',
    'cardano': 'ADA',
    'cosmos': 'ATOM',
    'polkadot': 'DOT',
    'near-protocol': 'NEAR',
    'internet-computer': 'ICP',
    'celestia': 'TIA'
  };
  
  // Get the symbol for this blockchain
  const symbol = symbolMap[blockchainId] || blockchainId.toUpperCase();
  
  // First check if we have a direct PNG in /public/cc directory
  const directPngPath = ccLogoMap[blockchainId];
  
  // Then try cryptocurrency icons
  const cryptoIconPath = `/crypto-icons/color/${symbol.toLowerCase()}.svg`;
  
  // Try blockchain-specific PNG first, then crypto icon, then default
  const iconSrc = directPngPath || cryptoIconPath || defaultIcon;
  
  const [imgError, setImgError] = useState(false);
  
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {!imgError ? (
        <Image
          src={iconSrc}
          alt={blockchainName}
          width={size}
          height={size}
          className="object-contain"
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        // Fallback to text if image fails to load
        <div 
          className="flex items-center justify-center bg-gray-700 rounded-full w-full h-full text-white font-bold"
          style={{ fontSize: size / 2 }}
        >
          {symbol.substring(0, 2)}
        </div>
      )}
    </div>
  );
};

interface BlockchainNetwork {
  id: string;
  name: string;
  symbol: string;
  logoPath: string;
  image?: {
    thumb: string | null;
    small: string | null;
    large: string | null;
  };
}

// Convert chains data to BlockchainNetwork objects and filter for top 20 blockchains
const blockchainNetworks: BlockchainNetwork[] = chainsData
  .filter(chain => isTopBlockchain(chain.id))
  .map(chain => ({
    id: chain.id,
    name: chain.name || chain.id.charAt(0).toUpperCase() + chain.id.slice(1),
    symbol: chain.shortname || (chain.name ? chain.name.substring(0, 3).toUpperCase() : chain.id.substring(0, 3).toUpperCase()),
    logoPath: chain.image?.large || chain.image?.small || chain.image?.thumb || `/${chain.id}.svg`,
    image: chain.image
  }));

interface BlockchainDropdownProps {
  onSelectNetwork?: (networkId: string) => void;
  className?: string;
}

const BlockchainDropdown: React.FC<BlockchainDropdownProps> = ({
  onSelectNetwork,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>(blockchainNetworks[0]);
  const [isOpen, setIsOpen] = useState(false);

  // Filter networks based on search term
  const filteredNetworks = blockchainNetworks.filter(network => 
    network.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort networks alphabetically
  filteredNetworks.sort((a, b) => a.name.localeCompare(b.name));

  const handleNetworkSelect = (network: BlockchainNetwork) => {
    setSelectedNetwork(network);
    if (onSelectNetwork) {
      onSelectNetwork(network.id);
    }
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={`flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full transition-colors border border-gray-700 shadow-sm ${isOpen ? 'ring-2 ring-blue-500' : ''} ${className}`}
        >
          <div className="w-6 h-6 relative">
            <BlockchainLogo
              blockchainId={selectedNetwork.id}
              blockchainName={selectedNetwork.name}
              size={24}
            />
          </div>
          <span>{selectedNetwork.name}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[350px] max-w-[600px] bg-[#1c2531] rounded-lg shadow-lg z-50 p-4 animate-scaleIn border border-gray-800"
          sideOffset={5}
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="mb-5">
            <input
              type="text"
              placeholder="Search"
              className="w-full p-3 bg-[#1a2330] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600 border border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Grid layout of blockchains with scrollable container */}
          <div 
            className="max-h-[400px] overflow-y-auto pr-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 #1F2937'
            }}
          >
            <div className="grid grid-cols-3 gap-x-4 gap-y-8">
              {filteredNetworks.map((network) => (
              <DropdownMenu.Item
                key={network.id}
                className="flex flex-col items-center justify-center cursor-pointer outline-none transition-colors"
                onSelect={() => handleNetworkSelect(network)}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 ">
                  <BlockchainLogo
                    blockchainId={network.id}
                    blockchainName={network.name}
                    size={36}
                  />
                </div>
                <span className="text-sm text-white text-center uppercase font-medium">{network.name}</span>
              </DropdownMenu.Item>
            ))}
            </div>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default BlockchainDropdown;
