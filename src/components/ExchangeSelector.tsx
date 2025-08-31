import React, { useState } from 'react';
import Image from 'next/image';
import { FaChevronDown } from 'react-icons/fa';
import { DexInterface } from '@/lib/dex/types';

interface ExchangeSelectorProps {
  exchanges: DexInterface[];
  selectedExchange: DexInterface | null;
  onSelectExchange: (exchange: DexInterface) => void;
  chainId: number;
}

const ExchangeSelector: React.FC<ExchangeSelectorProps> = ({
  exchanges,
  selectedExchange,
  onSelectExchange,
  chainId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Filter exchanges by chain support
  const compatibleExchanges = exchanges.filter(exchange => 
    exchange.isChainSupported(chainId)
  );
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center">
          {selectedExchange && (
            <>
              <div className="p-1 mr-2 relative bg-white rounded-full flex items-center">
                <Image
                  src={selectedExchange.config.logoURI}
                  alt={selectedExchange.config.name}
                  width={20}
                  height={20}
                />
              </div>
              <span>{selectedExchange.config.name}</span>
            </>
          )}
          {!selectedExchange && <span>Select Exchange</span>}
        </div>
        <FaChevronDown className={`ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {compatibleExchanges.length > 0 ? (
            compatibleExchanges.map((exchange) => (
              <div
                key={exchange.config.id}
                className="flex items-center p-3 hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  onSelectExchange(exchange);
                  setIsOpen(false);
                }}
              >
                <div className="p-1 mr-2 relative bg-white rounded-full ">
                  <Image
                    src={exchange.config.logoURI}
                    alt={exchange.config.name}
                    width={20}
                    height={20}
                  />
                </div>
                <div>
                  <div className="font-medium">{exchange.config.name}</div>
                  <div className="text-xs text-gray-400">
                    {exchange.config.version ? `v${exchange.config.version}` : ''}
                  </div>
                </div>
                {selectedExchange?.config.id === exchange.config.id && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-gray-400">
              No compatible exchanges for the current network
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExchangeSelector;
