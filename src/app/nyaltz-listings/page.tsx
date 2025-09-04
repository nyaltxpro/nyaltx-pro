'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BiSearch, BiFilter } from 'react-icons/bi';
import { FaEthereum, FaExternalLinkAlt, FaTelegram, FaTwitter, FaGlobe } from 'react-icons/fa';
import { SiBinance } from 'react-icons/si';
import nyaxTokensData from '../../../nyax-tokens-data.json';

interface NyaxToken {
  logoId: string;
  name: string | null;
  symbol: string | null;
  contractAddress: string | null;
  network: string;
  logo: string;
  aboutUs: string | null;
  url: string;
  description?: string | null;
  totalSupply?: string | null;
  circulatingSupply?: string | null;
  marketCap?: string | null;
  price?: string | null;
  website?: string | null;
  telegram?: string | null;
  twitter?: string | null;
  discord?: string | null;
  whitepaper?: string | null;
  email?: string | null;
  etherscan?: string | null;
  video?: string | null;
  additionalInfo?: any;
}

const NyaltzListingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  
  const tokens: NyaxToken[] = nyaxTokensData.tokens || [];

  // Get unique networks for filter
  const networks = useMemo(() => {
    const uniqueNetworks = [...new Set(tokens.map(token => token.network))];
    return uniqueNetworks.filter(Boolean);
  }, [tokens]);

  // Filter and sort tokens
  const filteredTokens = useMemo(() => {
    let filtered = tokens.filter(token => {
      const matchesSearch = !searchTerm || 
        (token.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (token.symbol?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (token.contractAddress?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesNetwork = selectedNetwork === 'all' || token.network === selectedNetwork;
      
      return matchesSearch && matchesNetwork;
    });

    // Sort tokens
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'symbol':
          return (a.symbol || '').localeCompare(b.symbol || '');
        case 'network':
          return a.network.localeCompare(b.network);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tokens, searchTerm, selectedNetwork, sortBy]);

  const getNetworkIcon = (network: string) => {
    switch (network.toLowerCase()) {
      case 'ethereum':
        return <FaEthereum className="text-blue-400" />;
      case 'bsc':
        return <SiBinance className="text-yellow-400" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const handleTokenClick = (token: NyaxToken) => {
    window.open(token.url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0b1217] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              NYAX LISTINGS
            </h1>
            <p className="text-xl text-cyan-100 mb-6">
              Discover all {tokens.length} tokens listed on the NYAX exchange
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span className="font-semibold">{tokens.filter(t => t.network === 'Ethereum').length}</span> Ethereum
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span className="font-semibold">{tokens.filter(t => t.network === 'BSC').length}</span> BSC
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1a2932] rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, symbol, or contract address..."
                className="w-full pl-10 pr-4 py-3 bg-[#0f1923] border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Network Filter */}
            <div className="flex items-center gap-2">
              <BiFilter className="text-gray-400" size={20} />
              <select
                className="bg-[#0f1923] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none"
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
              >
                <option value="all">All Networks</option>
                {networks.map(network => (
                  <option key={network} value={network}>{network}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              className="bg-[#0f1923] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="symbol">Sort by Symbol</option>
              <option value="network">Sort by Network</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredTokens.length} of {tokens.length} tokens
          </p>
        </div>

        {/* Token Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTokens.map((token, index) => (
            <motion.div
              key={token.logoId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-[#1a2932] rounded-lg p-6 hover:bg-[#243540] transition-all duration-300 cursor-pointer border border-gray-700 hover:border-cyan-500"
              onClick={() => handleTokenClick(token)}
            >
              {/* Token Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                    {token.logo ? (
                      <img
                        src={token.logo}
                        alt={token.symbol || 'Token'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold ${token.logo ? 'hidden' : ''}`}>
                      {token.symbol?.[0] || '?'}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white truncate">
                      {token.symbol || 'Unknown'}
                    </h3>
                    <div className="flex items-center gap-2">
                      {getNetworkIcon(token.network)}
                      <span className="text-sm text-gray-400">{token.network}</span>
                    </div>
                  </div>
                </div>
                <FaExternalLinkAlt className="text-gray-400 hover:text-cyan-400 transition-colors" size={16} />
              </div>

              {/* Token Name */}
              <div className="mb-4">
                <p className="text-gray-300 text-sm line-clamp-2">
                  {token.name || 'Unknown Token'}
                </p>
              </div>

              {/* Token Details */}
              <div className="space-y-2 mb-4">
                {token.contractAddress && (
                  <div className="text-xs">
                    <span className="text-gray-400">Contract: </span>
                    <span className="text-cyan-400 font-mono">
                      {token.contractAddress.slice(0, 8)}...{token.contractAddress.slice(-6)}
                    </span>
                  </div>
                )}
                {token.totalSupply && (
                  <div className="text-xs">
                    <span className="text-gray-400">Supply: </span>
                    <span className="text-white">{token.totalSupply}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                {token.telegram && (
                  <a
                    href={token.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaTelegram size={16} />
                  </a>
                )}
                {token.twitter && token.twitter !== "https://www.nyaltx.com/privacy-policy/" && (
                  <a
                    href={token.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaTwitter size={16} />
                  </a>
                )}
                {token.website && (
                  <a
                    href={token.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaGlobe size={16} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredTokens.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No tokens found</div>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NyaltzListingsPage;
