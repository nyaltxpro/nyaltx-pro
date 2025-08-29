import React from 'react';
import Image from 'next/image';
import { Token, Blockchain } from '../lib/types/blockchain';

interface MemeTokenDisplayProps {
  tokens: Token[];
  blockchain: Blockchain | null;
  isLoading?: boolean;
}

const MemeTokenDisplay: React.FC<MemeTokenDisplayProps> = ({ 
  tokens, 
  blockchain,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index} 
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!blockchain) {
    return (
      <div className="text-center py-8 text-gray-400">
        Please select a blockchain to view meme tokens
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No meme tokens found for {blockchain.name}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {tokens.map((token) => (
        <div 
          key={token.address} 
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 relative mr-3">
              <Image 
                src={token.logoURI} 
                alt={token.name}
                width={40}
                height={40}
                className="rounded-full"
                onError={(e) => {
                  // Fallback image on error
                  (e.target as HTMLImageElement).src = '/placeholder-token.svg';
                }}
              />
            </div>
            <div>
              <h3 className="font-medium text-white">{token.name}</h3>
              <p className="text-sm text-gray-400">{token.symbol}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <p className="text-gray-400">Market Cap</p>
              <p className="text-white">{token.marketCap ? `$${token.marketCap.toLocaleString()}` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Volume</p>
              <p className="text-white">{token.volume ? `$${token.volume.toLocaleString()}` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Holders</p>
              <p className="text-white">{token.holders?.toLocaleString() || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Change</p>
              <p className={token.percentChange && token.percentChange > 0 ? 'text-green-500' : 'text-red-500'}>
                {token.percentChange ? `${token.percentChange > 0 ? '+' : ''}${token.percentChange.toFixed(2)}%` : 'N/A'}
              </p>
            </div>
          </div>
          
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors">
            TRADE
          </button>
        </div>
      ))}
    </div>
  );
};

export default MemeTokenDisplay;
