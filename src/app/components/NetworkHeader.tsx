'use client';

import React, { useState } from 'react';
import Image from 'next/image';

type Blockchain = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

const blockchains: Blockchain[] = [
  { id: 'ethereum', name: 'Ethereum', icon: '/ethereum.svg', color: '#627EEA' },
  { id: 'bsc', name: 'BSC', icon: '/bsc.svg', color: '#F0B90B' },
  { id: 'polygon', name: 'Polygon', icon: '/polygon.svg', color: '#8247E5' },
  { id: 'avalanche', name: 'Avalanche', icon: '/avalanche.svg', color: '#E84142' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '/arbitrum.svg', color: '#2D374B' },
  { id: 'optimism', name: 'Optimism', icon: '/optimism.svg', color: '#FF0420' },
  { id: 'base', name: 'Base', icon: '/base.svg', color: '#0052FF' },
  { id: 'fantom', name: 'Fantom', icon: '/fantom.svg', color: '#1969FF' },
  { id: 'cronos', name: 'Cronos', icon: '/cronos.svg', color: '#002D74' },
  { id: 'solana', name: 'Solana', icon: '/solana.svg', color: '#9945FF' },
  { id: 'kava', name: 'Kava', icon: '/kava.svg', color: '#FF564F' },
  { id: 'metis', name: 'Metis', icon: '/metis.svg', color: '#2CBFC9' },
  { id: 'celo', name: 'Celo', icon: '/celo.svg', color: '#FCFF52' },
  { id: 'moonbeam', name: 'Moonbeam', icon: '/moonbeam.svg', color: '#53CBC9' },
  { id: 'linea', name: 'Linea', icon: '/linea.svg', color: '#000000' },
  { id: 'zksync', name: 'zkSync', icon: '/zksync.svg', color: '#4E529A' },
  { id: 'mantle', name: 'Mantle', icon: '/mantle.svg', color: '#000000' },
  { id: 'scroll', name: 'Scroll', icon: '/scroll.svg', color: '#FFEDE5' },
];

const NetworkHeader = () => {
  const [selectedChain, setSelectedChain] = useState(blockchains[0]);
  const [showChainSelector, setShowChainSelector] = useState(false);

  const handleChainSelect = (chain: Blockchain) => {
    setSelectedChain(chain);
    setShowChainSelector(false);
  };

  return (
    <div className="bg-[#0a0e17] border-b border-gray-800 py-1 px-2 flex items-center overflow-x-auto">
      <div className="flex items-center space-x-1">
        {/* Chain Selector */}
        <div className="relative">
          <button 
            className="flex items-center space-x-1 bg-[#1a2932] hover:bg-[#253742] px-2 py-1 rounded text-xs text-white"
            onClick={() => setShowChainSelector(!showChainSelector)}
          >
            <div className="w-4 h-4 relative">
              {selectedChain.icon && (
                <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: selectedChain.color }}>
                  <Image 
                    src={selectedChain.icon} 
                    alt={selectedChain.name} 
                    width={16} 
                    height={16} 
                  />
                </div>
              )}
            </div>
            <span>{selectedChain.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showChainSelector && (
            <div className="absolute top-full left-0 mt-1 bg-[#1a2932] border border-gray-700 rounded shadow-lg z-50 w-64 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-3 gap-1 p-2">
                {blockchains.map((chain) => (
                  <button
                    key={chain.id}
                    className={`flex flex-col items-center justify-center p-2 rounded hover:bg-[#253742] ${selectedChain.id === chain.id ? 'bg-[#253742]' : ''}`}
                    onClick={() => handleChainSelect(chain)}
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center mb-1" style={{ backgroundColor: chain.color }}>
                      <Image 
                        src={chain.icon} 
                        alt={chain.name} 
                        width={20} 
                        height={20} 
                      />
                    </div>
                    <span className="text-xs text-white">{chain.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Network Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto hide-scrollbar">
          {blockchains.slice(0, 12).map((chain) => (
            <button
              key={chain.id}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${selectedChain.id === chain.id ? 'bg-[#1a2932] text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => handleChainSelect(chain)}
            >
              <div className="w-3 h-3 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: chain.color }}>
                <Image 
                  src={chain.icon} 
                  alt={chain.name} 
                  width={12} 
                  height={12} 
                />
              </div>
              <span>{chain.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkHeader;
