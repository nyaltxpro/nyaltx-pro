'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaExchangeAlt, FaChevronDown, FaCog, FaSync, FaSearch, FaTimes } from 'react-icons/fa';
import ConnectWalletButton from '../components/ConnectWalletButton';
import Banner from '../components/Banner';
import { getCryptoIconUrl } from '../utils/cryptoIcons';

export default function SwapPage() {
  const [darkMode] = useState(true);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectingToken, setSelectingToken] = useState<'from' | 'to'>('from');
  const [searchTerm, setSearchTerm] = useState('');

  // Token selection state
  const [fromToken, setFromToken] = useState({
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '0.0',
    logo: getCryptoIconUrl('eth')
  });
  
  const [toToken, setToToken] = useState({
    symbol: 'BNB',
    name: 'BNB',
    balance: '0.0',
    logo: getCryptoIconUrl('bnb')
  });

  // Mock token list
  const tokenList = [
    { symbol: 'ETH', name: 'Ethereum', balance: '0.0', logo: getCryptoIconUrl('eth') },
    { symbol: 'USDT', name: 'Tether', balance: '0.0', logo: getCryptoIconUrl('usdt') },
    { symbol: 'USDC', name: 'USD Coin', balance: '0.0', logo: getCryptoIconUrl('usdc') },
    { symbol: 'BTC', name: 'Bitcoin', balance: '0.0', logo: getCryptoIconUrl('btc') },
    { symbol: 'DAI', name: 'Dai', balance: '0.0', logo: getCryptoIconUrl('dai') },
    { symbol: 'LINK', name: 'Chainlink', balance: '0.0', logo: getCryptoIconUrl('link') },
    { symbol: 'UNI', name: 'Uniswap', balance: '0.0', logo: getCryptoIconUrl('uni') },
    { symbol: 'AAVE', name: 'Aave', balance: '0.0', logo: getCryptoIconUrl('aave') },
  ];

  // Handle input changes
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);
    // In a real app, this would calculate the equivalent amount based on exchange rates
    setToAmount(value ? (parseFloat(value) * 1950).toString() : '');
  };

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToAmount(value);
    // In a real app, this would calculate the equivalent amount based on exchange rates
    setFromAmount(value ? (parseFloat(value) / 1950).toString() : '');
  };

  // Swap tokens
  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Toggle settings
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Handle slippage change
  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlippage(e.target.value);
  };

  // Dark mode effect
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-[#0b1217] text-white">
      {/* Banner */}
      <Banner />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
       
        
        {/* Swap Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-[#0f1923] rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
          
              <div className="flex space-x-2">
                <button 
                  onClick={toggleSettings}
                  className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <FaCog className="text-gray-400" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                  <FaSync className="text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Settings Panel */}
            {showSettings && (
              <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Transaction Settings</h3>
                <div className="mb-3">
                  <label className="flex justify-between text-sm mb-1">
                    <span>Slippage Tolerance</span>
                    <span>{slippage}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={slippage}
                    onChange={handleSlippageChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0.1%</span>
                    <span>5%</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm mb-1 block">Transaction Deadline</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      className="bg-gray-700 rounded-lg p-2 w-20 text-sm"
                      defaultValue={20}
                      min={1}
                    />
                    <span className="ml-2 text-sm text-gray-400">minutes</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* From Token */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>From</span>
                <span>Balance: {fromToken.balance}</span>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between">
                  <input
                    type="text"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={handleFromAmountChange}
                    className="bg-transparent text-2xl w-full focus:outline-none"
                  />
                  <button 
                    className="flex items-center bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors"
                    onClick={() => {
                      setSelectingToken('from');
                      setShowTokenModal(true);
                    }}
                  >
                    {fromToken.logo && (
                      <div className="w-6 h-6 mr-2 relative">
                        <Image 
                          src={fromToken.logo} 
                          alt={fromToken.symbol} 
                          width={24} 
                          height={24} 
                        />
                      </div>
                    )}
                    <span>{fromToken.symbol}</span>
                    <FaChevronDown className="ml-2 text-sm" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Swap Button */}
            <div className="flex justify-center -my-3 z-10 relative">
              <button 
                onClick={swapTokens}
                className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 border border-gray-700"
              >
                <FaExchangeAlt className="text-blue-400" />
              </button>
            </div>
            
            {/* To Token */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>To</span>
                <span>Balance: {toToken.balance}</span>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between">
                  <input
                    type="text"
                    placeholder="0.0"
                    value={toAmount}
                    onChange={handleToAmountChange}
                    className="bg-transparent text-2xl w-full focus:outline-none"
                  />
                  <button 
                    className="flex items-center bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors"
                    onClick={() => {
                      setSelectingToken('to');
                      setShowTokenModal(true);
                    }}
                  >
                    {toToken.logo ? (
                      <div className="w-6 h-6 mr-2 relative">
                        <Image 
                          src={toToken.logo} 
                          alt={toToken.symbol} 
                          width={24} 
                          height={24} 
                        />
                      </div>
                    ) : null}
                    <span>{toToken.symbol}</span>
                    <FaChevronDown className="ml-2 text-sm" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Price Info */}
            {fromAmount && toAmount && (
              <div className="bg-gray-800 rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price</span>
                  <span>1 {fromToken.symbol} = 1950 {toToken.symbol || '...'}</span>
                </div>
              </div>
            )}
            
            {/* Connect Wallet Button */}
            <button className="w-full bg-[#00b8d8] hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              Connect wallet
            </button>
            
            {/* Provider Info */}
            <div className="mt-4">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Slippage Tolerance</span>
                <span>{slippage}%</span>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-400">Provider</span>
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-1">
                    <Image 
                      src={getCryptoIconUrl('arb')} 
                      alt="0x" 
                      width={20} 
                      height={20} 
                    />
                  </div>
                  <span className="text-sm">0x</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-400">By</span>
                <div className="flex items-center">
                  <span className="text-sm">0xBase</span>
                </div>
              </div>
              
           
            </div>
          </div>
        </div>
      </div>

      {/* Token Selection Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1923] rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-medium">Select a token</h3>
              <button 
                onClick={() => setShowTokenModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search token name or symbol"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[50vh]">
              {tokenList.filter(token => 
                token.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((token) => (
                <div 
                  key={token.symbol}
                  className="flex items-center p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800"
                  onClick={() => {
                    if (selectingToken === 'from') {
                      setFromToken(token);
                    } else {
                      setToToken(token);
                    }
                    setShowTokenModal(false);
                  }}
                >
                  <div className="w-8 h-8 mr-3 relative">
                    <Image 
                      src={token.logo} 
                      alt={token.symbol} 
                      width={32} 
                      height={32} 
                    />
                  </div>
                  <div>
                    <div className="font-medium">{token.name}</div>
                    <div className="text-sm text-gray-400">{token.symbol}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div>{token.balance}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
