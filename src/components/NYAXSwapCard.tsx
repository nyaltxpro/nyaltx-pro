'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaExchangeAlt, FaChevronDown, FaCog, FaInfoCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { SiBinance } from 'react-icons/si';
import { FaEthereum } from 'react-icons/fa';

interface NYAXSwapCardProps {
  token: {
    symbol: string | null;
    name: string | null;
    contractAddress: string | null;
    network: string;
    logo: string;
  };
  isAvailable?: boolean;
}

const NYAXSwapCard: React.FC<NYAXSwapCardProps> = ({ token }) => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);

  const getNetworkIcon = (network: string) => {
    switch (network.toLowerCase()) {
      case 'ethereum':
        return <FaEthereum className="text-blue-400" size={20} />;
      case 'bsc':
        return <SiBinance className="text-yellow-400" size={20} />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-400" />;
    }
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);
    // Simulate price calculation
    if (value && !isNaN(parseFloat(value))) {
      setToAmount((parseFloat(value) * 1950).toString());
    } else {
      setToAmount('');
    }
  };

  const swapTokens = () => {
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  // if (!isAvailable) {
  //   return (
  //     <div className="bg-gradient-to-br from-[#1a2932] to-[#243540] rounded-2xl p-6 border border-gray-700/50 shadow-xl">
  //       <div className="text-center py-6">
  //         <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
  //           <FaExchangeAlt className="text-gray-500 text-2xl" />
  //         </div>
  //         <h3 className="text-xl font-bold text-gray-400 mb-2">Trading Not Available</h3>
  //         <p className="text-gray-500 text-sm mb-4">
  //           This token is not currently available for trading on decentralized exchanges.
  //         </p>
  //         <div className="text-xs text-gray-600">
  //           Trading is only available for tokens listed on major DEXs like Uniswap and PancakeSwap.
  //         </div>
  //         {token.contractAddress && (
  //           <div className="mt-4 p-3 bg-[#0f1923] rounded-lg">
  //             <div className="text-xs text-gray-500 mb-1">Contract Address:</div>
  //             <div className="font-mono text-gray-400 text-xs break-all">{token.contractAddress}</div>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-gradient-to-br from-[#1a2932] to-[#243540] rounded-2xl p-6 border border-gray-700/50 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
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
            <div className={`w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold ${token.logo ? 'hidden' : ''}`}>
              {token.symbol?.[0] || '?'}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Swap {token.symbol}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {getNetworkIcon(token.network)}
              <span>{token.network}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <FaCog className="text-gray-400" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-[#0f1923] rounded-lg border border-gray-600/30"
        >
          <h4 className="text-sm font-medium mb-3 text-cyan-400">Transaction Settings</h4>
          <div className="mb-3">
            <label className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Slippage Tolerance</span>
              <span className="text-white">{slippage}%</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1%</span>
              <span>5%</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Swap Interface */}
      <div className="space-y-4">
        {/* From Token */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">From</span>
            <span className="text-gray-500">Balance: 0.0</span>
          </div>
          <div className="bg-[#0f1923] rounded-lg p-4 border border-gray-600/30">
            <div className="flex justify-between items-center">
              <input
                type="text"
                placeholder="0.0"
                value={fromAmount}
                onChange={handleFromAmountChange}
                className="bg-transparent text-xl font-semibold w-full focus:outline-none text-white"
              />
              <div className="flex items-center bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors ml-4">
                <div className="w-5 h-5 mr-2 rounded-full overflow-hidden">
                  {token.logo ? (
                    <img
                      src={token.logo}
                      alt={token.symbol || 'Token'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {token.symbol?.[0] || '?'}
                    </div>
                  )}
                </div>
                <span className="font-medium text-white">{token.symbol}</span>
                <FaChevronDown className="ml-2 text-sm text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapTokens}
            className="bg-gray-700 hover:bg-gray-600 rounded-full p-3 border border-gray-600 transition-colors"
          >
            <FaExchangeAlt className="text-cyan-400" />
          </button>
        </div>

        {/* To Token */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">To</span>
            <span className="text-gray-500">Balance: 0.0</span>
          </div>
          <div className="bg-[#0f1923] rounded-lg p-4 border border-gray-600/30">
            <div className="flex justify-between items-center">
              <input
                type="text"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="bg-transparent text-xl font-semibold w-full focus:outline-none text-white"
              />
              <div className="flex items-center bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors ml-4">
                <div className="w-5 h-5 mr-2 rounded-full overflow-hidden">
                  <img
                    src="https://cryptologos.cc/logos/tether-usdt-logo.png"
                    alt="USDT"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium text-white">USDT</span>
                <FaChevronDown className="ml-2 text-sm text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Price Info */}
        {fromAmount && toAmount && (
          <div className="bg-[#0f1923] rounded-lg p-3 border border-gray-600/30">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Exchange Rate</span>
              <span className="text-white">1 {token.symbol} ≈ 1,950 USDT</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-400">Price Impact</span>
              <span className="text-green-400">{'<'}0.01%</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-400">Network Fee</span>
              <span className="text-white">~$2.50</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02]">
          Connect Wallet to Swap
        </button>

        {/* DEX Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
          <div className="flex items-center gap-2">
            <FaInfoCircle />
            <span>Powered by Uniswap V3</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Slippage: {slippage}%</span>
          </div>
        </div>

        {/* External Links */}
        <div className="flex gap-2 pt-2">
          <a
            href={`https://app.uniswap.org/#/swap?inputCurrency=${token.contractAddress}&outputCurrency=0xdAC17F958D2ee523a2206206994597C13D831ec7`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#0f1923] hover:bg-gray-700 text-center py-2 px-3 rounded-lg text-sm text-gray-400 hover:text-white transition-colors border border-gray-600/30"
          >
            <div className="flex items-center justify-center gap-2">
              <span>Trade on Uniswap</span>
              <FaExternalLinkAlt size={12} />
            </div>
          </a>
          {token.network === 'BSC' && (
            <a
              href={`https://pancakeswap.finance/swap?inputCurrency=${token.contractAddress}&outputCurrency=0x55d398326f99059fF775485246999027B3197955`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#0f1923] hover:bg-gray-700 text-center py-2 px-3 rounded-lg text-sm text-gray-400 hover:text-white transition-colors border border-gray-600/30"
            >
              <div className="flex items-center justify-center gap-2">
                <span>Trade on PancakeSwap</span>
                <FaExternalLinkAlt size={12} />
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default NYAXSwapCard;
