'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  FaCalculator, 
  FaExchangeAlt, 
  FaChartLine, 
  FaSearch, 
  FaWallet, 
  FaLock, 
  FaGasPump, 
  FaCoins, 
  FaNetworkWired, 
  FaCode, 
  FaFileContract, 
  FaRegCopy,
  FaCheck,
  FaInfoCircle
} from 'react-icons/fa';
import Banner from '../../components/Banner';
import ConnectWalletButton from '../../components/ConnectWalletButton';
import { getCryptoIconUrl } from '../utils/cryptoIcons';

// Tool category type
type ToolCategory = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

// Tool item type
type Tool = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  url: string;
  isNew?: boolean;
  isPopular?: boolean;
};

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);

  // Tool categories
  const categories: ToolCategory[] = [
    { id: 'all', name: 'All Tools', icon: <FaSearch /> },
    { id: 'calculator', name: 'Calculators', icon: <FaCalculator /> },
    { id: 'swap', name: 'Swap Tools', icon: <FaExchangeAlt /> },
    { id: 'analytics', name: 'Analytics', icon: <FaChartLine /> },
    { id: 'wallet', name: 'Wallet Tools', icon: <FaWallet /> },
    { id: 'security', name: 'Security', icon: <FaLock /> },
    { id: 'gas', name: 'Gas Tools', icon: <FaGasPump /> },
    { id: 'token', name: 'Token Tools', icon: <FaCoins /> },
    { id: 'network', name: 'Network Tools', icon: <FaNetworkWired /> },
    { id: 'developer', name: 'Developer', icon: <FaCode /> },
  ];

  // Tools list
  const tools: Tool[] = [
    {
      id: 'profit-calculator',
      name: 'Profit Calculator',
      description: 'Calculate potential profits and losses for your crypto trades',
      icon: <FaCalculator />,
      category: 'calculator',
      url: '/tools/profit-calculator',
      isPopular: true
    },
    {
      id: 'impermanent-loss',
      name: 'Impermanent Loss Calculator',
      description: 'Calculate potential impermanent loss for liquidity provision',
      icon: <FaCalculator />,
      category: 'calculator',
      url: '/tools/impermanent-loss'
    },
    {
      id: 'gas-calculator',
      name: 'Gas Fee Calculator',
      description: 'Estimate transaction costs across different networks',
      icon: <FaGasPump />,
      category: 'gas',
      url: '/tools/gas-calculator'
    },
    {
      id: 'token-generator',
      name: 'Token Generator',
      description: 'Create your own ERC-20 or BEP-20 token in minutes',
      icon: <FaCoins />,
      category: 'token',
      url: '/tools/token-generator',
      isNew: true,
      isPopular: true
    },
    {
      id: 'liquidity-locker',
      name: 'Liquidity Locker',
      description: 'Lock your liquidity tokens for added security and trust',
      icon: <FaLock />,
      category: 'security',
      url: '/tools/liquidity-locker'
    },
    {
      id: 'contract-verifier',
      name: 'Contract Verification',
      description: 'Verify smart contract source code on blockchain explorers',
      icon: <FaFileContract />,
      category: 'developer',
      url: '/tools/contract-verifier'
    },
    {
      id: 'wallet-tracker',
      name: 'Wallet Tracker',
      description: 'Track wallet activities and token balances',
      icon: <FaWallet />,
      category: 'wallet',
      url: '/tools/wallet-tracker',
      isPopular: true
    },
    {
      id: 'dex-aggregator',
      name: 'DEX Aggregator',
      description: 'Find the best swap rates across multiple decentralized exchanges',
      icon: <FaExchangeAlt />,
      category: 'swap',
      url: '/tools/dex-aggregator'
    },
    {
      id: 'network-stats',
      name: 'Network Statistics',
      description: 'View real-time statistics for various blockchain networks',
      icon: <FaNetworkWired />,
      category: 'network',
      url: '/tools/network-stats'
    },
    {
      id: 'token-approvals',
      name: 'Token Approvals',
      description: 'Manage and revoke token approvals for better security',
      icon: <FaLock />,
      category: 'security',
      url: '/tools/token-approvals',
      isNew: true
    },
    {
      id: 'price-alerts',
      name: 'Price Alerts',
      description: 'Set up alerts for price movements of your favorite tokens',
      icon: <FaChartLine />,
      category: 'analytics',
      url: '/tools/price-alerts'
    },
    {
      id: 'contract-analyzer',
      name: 'Contract Analyzer',
      description: 'Analyze smart contracts for potential security issues',
      icon: <FaCode />,
      category: 'developer',
      url: '/tools/contract-analyzer',
      isNew: true
    },
    {
      id: 'airdrop-checker',
      name: 'Airdrop Checker',
      description: 'Check if your wallet is eligible for ongoing airdrops',
      icon: <FaCoins />,
      category: 'token',
      url: '/tools/airdrop-checker'
    },
    {
      id: 'gas-tracker',
      name: 'Gas Tracker',
      description: 'Track gas prices across different networks in real-time',
      icon: <FaGasPump />,
      category: 'gas',
      url: '/tools/gas-tracker',
      isPopular: true
    },
    {
      id: 'portfolio-tracker',
      name: 'Portfolio Tracker',
      description: 'Track your crypto portfolio performance over time',
      icon: <FaChartLine />,
      category: 'analytics',
      url: '/tools/portfolio-tracker'
    },
    {
      id: 'token-explorer',
      name: 'Token Explorer',
      description: 'Explore detailed information about any token',
      icon: <FaSearch />,
      category: 'token',
      url: '/tools/token-explorer'
    }
  ];

  // Filter tools based on active category and search term
  const filteredTools = tools.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  // Popular tools
  const popularTools = tools.filter(tool => tool.isPopular);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Banner */}
      <Banner />
      
      {/* Header with search and wallet */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Crypto Tools</h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tools..."
                className="bg-gray-800 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
            <ConnectWalletButton />
          </div>
        </div>
        
        {/* Popular Tools Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Popular Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularTools.map((tool) => (
              <div 
                key={tool.id}
                className="bg-[#0f1923] rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer flex flex-col"
                onClick={() => console.log(`Navigate to ${tool.url}`)}
              >
                <div className="flex items-center mb-2">
                  <div className="text-blue-500 text-xl mr-3">{tool.icon}</div>
                  <h3 className="font-medium">{tool.name}</h3>
                  {tool.isNew && (
                    <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">NEW</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-3">{tool.description}</p>
                <div className="flex items-center justify-center mt-1 mb-3">
                  {tool.id === 'token-generator' && (
                    <div className="flex space-x-2">
                      <Image src={getCryptoIconUrl('btc')} width={24} height={24} alt="Bitcoin" />
                      <Image src={getCryptoIconUrl('eth')} width={24} height={24} alt="Ethereum" />
                      <Image src={getCryptoIconUrl('bnb')} width={24} height={24} alt="BNB" />
                    </div>
                  )}
                  {tool.id === 'wallet-tracker' && (
                    <div className="flex space-x-2">
                      <Image src={getCryptoIconUrl('btc')} width={24} height={24} alt="Bitcoin" />
                      <Image src={getCryptoIconUrl('eth')} width={24} height={24} alt="Ethereum" />
                      <Image src={getCryptoIconUrl('usdt')} width={24} height={24} alt="USDT" />
                    </div>
                  )}
                  {tool.id === 'gas-tracker' && (
                    <div className="flex space-x-2">
                      <Image src={getCryptoIconUrl('eth')} width={24} height={24} alt="Ethereum" />
                      <Image src={getCryptoIconUrl('matic')} width={24} height={24} alt="Polygon" />
                      <Image src={getCryptoIconUrl('avax')} width={24} height={24} alt="Avalanche" />
                    </div>
                  )}
                  {tool.id === 'profit-calculator' && (
                    <div className="flex space-x-2">
                      <Image src={getCryptoIconUrl('btc')} width={24} height={24} alt="Bitcoin" />
                      <Image src={getCryptoIconUrl('eth')} width={24} height={24} alt="Ethereum" />
                      <Image src={getCryptoIconUrl('sol')} width={24} height={24} alt="Solana" />
                    </div>
                  )}
                </div>
                <button className="mt-auto bg-[#00b8d8] hover:bg-[#00b8d8] text-white py-2 rounded-md transition-colors">
                  Launch Tool
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 min-w-max pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  activeCategory === category.id ? 'bg-[#00b8d8]' : 'bg-gray-800'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* All Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredTools.map((tool) => (
            <div 
              key={tool.id}
              className="bg-[#0f1923] rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => console.log(`Navigate to ${tool.url}`)}
            >
              <div className="flex items-center mb-2">
                <div className="text-blue-500 text-xl mr-3">{tool.icon}</div>
                <h3 className="font-medium">{tool.name}</h3>
                {tool.isNew && (
                  <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">NEW</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-3">{tool.description}</p>
              {/* Add crypto icons for relevant tools */}
              {(tool.category === 'token' || tool.category === 'wallet' || tool.category === 'analytics') && (
                <div className="flex items-center mb-3">
                  <div className="flex space-x-1">
                    {tool.category === 'token' && (
                      <>
                        <Image src={getCryptoIconUrl('eth')} width={20} height={20} alt="Ethereum" />
                        <Image src={getCryptoIconUrl('bnb')} width={20} height={20} alt="BNB" />
                      </>
                    )}
                    {tool.category === 'wallet' && (
                      <>
                        <Image src={getCryptoIconUrl('btc')} width={20} height={20} alt="Bitcoin" />
                        <Image src={getCryptoIconUrl('eth')} width={20} height={20} alt="Ethereum" />
                      </>
                    )}
                    {tool.category === 'analytics' && (
                      <>
                        <Image src={getCryptoIconUrl('btc')} width={20} height={20} alt="Bitcoin" />
                        <Image src={getCryptoIconUrl('eth')} width={20} height={20} alt="Ethereum" />
                        <Image src={getCryptoIconUrl('usdt')} width={20} height={20} alt="USDT" />
                      </>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 ml-2">Supported tokens</span>
                </div>
              )}
              <button className="w-full bg-[#00b8d8] hover:bg-blue-700 text-white py-2 rounded-md transition-colors">
                Launch Tool
              </button>
            </div>
          ))}
        </div>
        
        {/* API Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Developer APIs</h2>
          <div className="bg-[#0f1923] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Cryptic API Access</h3>
              <span className="px-3 py-1 bg-blue-900 text-blue-300 text-xs rounded-full">BETA</span>
            </div>
            <p className="text-gray-400 mb-4">
              Access our comprehensive crypto data API for your applications. Get market data, token information, and more.
            </p>
            
            <div className="flex items-center mb-4 overflow-x-auto">
              <Image src={getCryptoIconUrl('btc')} width={24} height={24} alt="Bitcoin" className="mr-1" />
              <Image src={getCryptoIconUrl('eth')} width={24} height={24} alt="Ethereum" className="mr-1" />
              <Image src={getCryptoIconUrl('usdt')} width={24} height={24} alt="USDT" className="mr-1" />
              <Image src={getCryptoIconUrl('bnb')} width={24} height={24} alt="BNB" className="mr-1" />
              <Image src={getCryptoIconUrl('sol')} width={24} height={24} alt="Solana" className="mr-1" />
              <Image src={getCryptoIconUrl('ada')} width={24} height={24} alt="Cardano" className="mr-1" />
              <Image src={getCryptoIconUrl('xrp')} width={24} height={24} alt="XRP" className="mr-1" />
              <span className="text-xs text-gray-400 ml-1">+1000 more tokens</span>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-md mb-4 relative">
              <code className="text-sm text-gray-300 font-mono">
                https://api.cryptic.io/v1/tokens?apikey=YOUR_API_KEY
              </code>
              <button 
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
                onClick={() => handleCopy("https://api.cryptic.io/v1/tokens?apikey=YOUR_API_KEY")}
              >
                {copied === "https://api.cryptic.io/v1/tokens?apikey=YOUR_API_KEY" ? <FaCheck /> : <FaRegCopy />}
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-[#00b8d8] hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
                Get API Key
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
        
        {/* Request Tool Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Request a Tool</h2>
          <div className="bg-[#0f1923] rounded-lg p-6">
            <p className="text-gray-400 mb-4">
              Don&apos;t see the tool you need? Let us know what would help you in your crypto journey.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Tool Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tool name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea 
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Describe what the tool should do"
              ></textarea>
            </div>
            
            <button className="bg-[#00b8d8] hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
              Submit Request
            </button>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="bg-gray-800 p-4 rounded-lg mb-8 flex items-start">
          <FaInfoCircle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
          <p className="text-sm text-gray-300">
            The tools provided are for informational purposes only and should not be considered financial advice. 
            Always do your own research before making investment decisions. Some tools may require connecting 
            your wallet, please review permissions carefully.
          </p>
        </div>
      </div>
    </div>
  );
}
