import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaChevronDown } from 'react-icons/fa';
import { CHAIN_IDS } from '@/lib/dex/types';
import { getCryptoIconUrl } from '@/app/utils/cryptoIcons';

interface Network {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface NetworkSelectorProps {
  selectedChainId: number;
  onSelectNetwork: (chainId: number) => void;
}

const networks: Network[] = [
  { id: CHAIN_IDS.ETHEREUM, name: 'Ethereum', icon: getCryptoIconUrl('eth'), color: '#627EEA' },
  { id: CHAIN_IDS.POLYGON, name: 'Polygon', icon: getCryptoIconUrl('matic'), color: '#8247E5' },
  { id: CHAIN_IDS.ARBITRUM, name: 'Arbitrum', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', color: '#28A0F0' },
  { id: CHAIN_IDS.OPTIMISM, name: 'Optimism', icon: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png', color: '#FF0420' },
  { id: CHAIN_IDS.BSC, name: 'BNB Chain', icon: getCryptoIconUrl('bnb'), color: '#F0B90B' },
  { id: CHAIN_IDS.AVALANCHE, name: 'Avalanche', icon: getCryptoIconUrl('avax'), color: '#E84142' },
  { id: CHAIN_IDS.SOLANA, name: 'Solana', icon: getCryptoIconUrl('sol'), color: '#14F195' },
];

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedChainId,
  onSelectNetwork
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Fix hydration mismatch by only rendering on client-side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const selectedNetwork = networks.find(network => network.id === selectedChainId) || networks[0];
  
  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return <div className="w-full px-4 py-2 bg-gray-800 rounded-lg">Loading...</div>;
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center">
          <div className="w-6 h-6 mr-2 relative">
            <Image
              src={selectedNetwork.icon}
              alt={selectedNetwork.name}
              width={24}
              height={24}
            />
          </div>
          <span>{selectedNetwork.name}</span>
        </div>
        <FaChevronDown className={`ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {networks.map((network) => (
            <div
              key={network.id}
              className={`flex items-center p-3 hover:bg-gray-700 cursor-pointer ${
                selectedChainId === network.id ? 'bg-gray-700' : ''
              }`}
              onClick={() => {
                onSelectNetwork(network.id);
                setIsOpen(false);
              }}
            >
              <div className="w-6 h-6 mr-2 relative">
                <Image
                  src={network.icon}
                  alt={network.name}
                  width={24}
                  height={24}
                />
              </div>
              <div className="font-medium">{network.name}</div>
              {selectedChainId === network.id && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
