'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaExchangeAlt, FaChevronDown, FaInfoCircle, FaCog, FaSync } from 'react-icons/fa';
import ConnectWalletButton from '../components/ConnectWalletButton';
import Banner from '../components/Banner';

export default function SwapPage() {
  const [darkMode] = useState(true);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);

  // Token selection state
  const [fromToken, setFromToken] = useState({
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '0.0',
    logo: '/ethereum.svg'
  });
  
  const [toToken, setToToken] = useState({
    symbol: 'Select a token',
    name: '',
    balance: '0.0',
    logo: ''
  });

  // Mock token list
  const tokenList = [
    { symbol: 'ETH', name: 'Ethereum', balance: '0.0', logo: '/ethereum.svg' },
    { symbol: 'USDT', name: 'Tether', balance: '0.0', logo: '/tether.svg' },
    { symbol: 'USDC', name: 'USD Coin', balance: '0.0', logo: '/usdc.svg' },
    { symbol: 'BTC', name: 'Bitcoin', balance: '0.0', logo: '/bitcoin.svg' },
    { symbol: 'DAI', name: 'Dai', balance: '0.0', logo: '/dai.svg' },
    { symbol: 'LINK', name: 'Chainlink', balance: '0.0', logo: '/chainlink.svg' },
    { symbol: 'UNI', name: 'Uniswap', balance: '0.0', logo: '/uniswap.svg' },
    { symbol: 'AAVE', name: 'Aave', balance: '0.0', logo: '/aave.svg' },
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Banner */}
      <Banner />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Swap</h1>
          <ConnectWalletButton />
        </div>
        
        {/* Swap Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-[#0f1923] rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Swap</h2>
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
                  <button className="flex items-center bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors">
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
                  <button className="flex items-center bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors">
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
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
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
                      src="/arbitrum.svg" 
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
              
              <div className="mt-4 flex justify-center">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
                  <span>Buy Crypto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
