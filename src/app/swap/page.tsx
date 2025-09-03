'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaExchangeAlt, FaChevronDown, FaCog, FaSync, FaSearch, FaTimes, FaInfoCircle } from 'react-icons/fa';
import ConnectWalletButton from '../../components/ConnectWalletButton';
import Banner from '../../components/Banner';
import { getCryptoIconUrl } from '../utils/cryptoIcons';
import Header from '@/components/Header';
import ExchangeSelector from '@/components/ExchangeSelector';
import NetworkSelector from '@/components/NetworkSelector';
import { dexManager } from '@/lib/dex/dexManager';
import { DexInterface, PriceQuote, Token, CHAIN_IDS, DEX_PROTOCOL } from '@/lib/dex/types';

// Network definitions for UI display
const networks = [
  { id: CHAIN_IDS.ETHEREUM, name: 'Ethereum', icon: '/ethereum.svg', color: '#627EEA' },
  { id: CHAIN_IDS.POLYGON, name: 'Polygon', icon: '/polygon.svg', color: '#8247E5' },
  { id: CHAIN_IDS.ARBITRUM, name: 'Arbitrum', icon: '/arbitrum.svg', color: '#28A0F0' },
  { id: CHAIN_IDS.OPTIMISM, name: 'Optimism', icon: '/optimism.svg', color: '#FF0420' },
  { id: CHAIN_IDS.BSC, name: 'BNB Chain', icon: '/bnb.svg', color: '#F0B90B' },
  { id: CHAIN_IDS.AVALANCHE, name: 'Avalanche', icon: '/avalanche.svg', color: '#E84142' },
  { id: CHAIN_IDS.SOLANA, name: 'Solana', icon: '/solana.svg', color: '#14F195' },
];

export default function SwapPage() {
  const [darkMode] = useState(true);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectingToken, setSelectingToken] = useState<'from' | 'to'>('from');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExchange, setSelectedExchange] = useState<DexInterface | null>(null);
  const [availableExchanges, setAvailableExchanges] = useState<DexInterface[]>([]);
  const [chainId, setChainId] = useState<number>(CHAIN_IDS.ETHEREUM);
  const [quotes, setQuotes] = useState<PriceQuote[]>([]);
  const [bestQuote, setBestQuote] = useState<PriceQuote | null>(null);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

  // Token selection state
  const [fromToken, setFromToken] = useState<Token>({
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    chainId: CHAIN_IDS.ETHEREUM,
    logoURI: getCryptoIconUrl('eth')
  });
  
  const [toToken, setToToken] = useState<Token>({
    address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    symbol: 'BNB',
    name: 'BNB',
    decimals: 18,
    chainId: CHAIN_IDS.ETHEREUM,
    logoURI: getCryptoIconUrl('bnb')
  });

  // Token list with proper Token interface
  const tokenList: Token[] = [
    { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', symbol: 'ETH', name: 'Ethereum', decimals: 18, chainId: chainId, logoURI: getCryptoIconUrl('eth') },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether', decimals: 6, chainId: chainId, logoURI: getCryptoIconUrl('usdt') },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6, chainId: chainId, logoURI: getCryptoIconUrl('usdc') },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, chainId: chainId, logoURI: getCryptoIconUrl('btc') },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai', decimals: 18, chainId: chainId, logoURI: getCryptoIconUrl('dai') },
    { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink', decimals: 18, chainId: chainId, logoURI: getCryptoIconUrl('link') },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18, chainId: chainId, logoURI: getCryptoIconUrl('uni') },
    { address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', symbol: 'AAVE', name: 'Aave', decimals: 18, chainId: chainId, logoURI: getCryptoIconUrl('aave') },
  ];

  // Initialize available exchanges and select default exchange
  useEffect(() => {
    const exchanges = dexManager.getDexList();
    setAvailableExchanges(exchanges);
    
    // Set default exchange to Uniswap V3 if available
    const defaultExchange = exchanges.find(ex => ex.config.name === DEX_PROTOCOL.UNISWAP_V3);
    if (defaultExchange) {
      setSelectedExchange(defaultExchange);
    } else if (exchanges.length > 0) {
      setSelectedExchange(exchanges[0]);
    }
  }, []);

  // Get quotes when inputs change
  useEffect(() => {
    const getQuotes = async () => {
      if (!fromAmount || parseFloat(fromAmount) <= 0 || !fromToken || !toToken || !selectedExchange) {
        setQuotes([]);
        setBestQuote(null);
        return;
      }
      
      setIsLoadingQuotes(true);
      
      try {
        const allQuotes = await dexManager.getAllQuotes({
          tokenIn: fromToken,
          tokenOut: toToken,
          amountIn: fromAmount,
          slippageTolerance: slippage,
          chainId: chainId
        });
        
        setQuotes(allQuotes);
        
        // Find best quote
        const best = allQuotes.reduce((best, current) => {
          if (!best || parseFloat(current.outputAmount) > parseFloat(best.outputAmount)) {
            return current;
          }
          return best;
        }, null as PriceQuote | null);
        
        setBestQuote(best);
        
        // Update to amount based on selected exchange
        if (selectedExchange) {
          const selectedQuote = allQuotes.find(q => q.protocol === selectedExchange.config.name);
          if (selectedQuote) {
            setToAmount(selectedQuote.outputAmount);
          }
        }
      } catch (error) {
        console.error('Error getting quotes:', error);
      } finally {
        setIsLoadingQuotes(false);
      }
    };
    
    getQuotes();
  }, [fromAmount, fromToken, toToken, selectedExchange, slippage, chainId]);

  // Handle input changes
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);
    // To amount will be updated by the useEffect that fetches quotes
  };

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToAmount(value);
    // This is just for UI feedback, actual swaps are always based on exact input
  };

  // Swap tokens
  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };
  
  // Handle exchange selection
  const handleExchangeSelect = (exchange: DexInterface) => {
    setSelectedExchange(exchange);
    
    // Update the to amount based on the selected exchange's quote
    const selectedQuote = quotes.find(q => q.protocol === exchange.config.name);
    if (selectedQuote) {
      setToAmount(selectedQuote.outputAmount);
    }
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
      {/* <Header/> */}
      
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
                <span>Balance: 0.0</span>
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
                    {fromToken.logoURI && (
                      <div className="w-6 h-6 mr-2 relative">
                        <Image 
                          src={fromToken.logoURI} 
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
                <span>Balance: 0.0</span>
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
                    {toToken.logoURI ? (
                      <div className="w-6 h-6 mr-2 relative">
                        <Image 
                          src={toToken.logoURI} 
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
            
            {/* Network Selector */}
            <div className="mb-4">
              <div className="text-sm mb-2">Select Network</div>
              <NetworkSelector
                selectedChainId={chainId}
                onSelectNetwork={(newChainId) => {
                  setChainId(newChainId);
                  // Update token chainIds
                  setFromToken(prev => ({ ...prev, chainId: newChainId }));
                  setToToken(prev => ({ ...prev, chainId: newChainId }));
                }}
              />
            </div>
            
            {/* Connect Wallet Button */}
            <button className="w-full bg-[#00b8d8] hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              Connect wallet
            </button>
            
            {/* Exchange Selector */}
            <div className="mt-4 mb-4">
              <div className="text-sm mb-2">Select Exchange</div>
              <ExchangeSelector
                exchanges={availableExchanges}
                selectedExchange={selectedExchange}
                onSelectExchange={handleExchangeSelect}
                chainId={chainId}
              />
            </div>
            
            {/* Available Quotes */}
            {quotes.length > 0 && (
              <div className="mt-4 mb-4 bg-gray-800 rounded-lg p-3">
                <div className="text-sm font-medium mb-2">Available Routes</div>
                {quotes.map((quote, index) => {
                  const exchange = availableExchanges.find(ex => ex.config.name === quote.protocol);
                  const isSelected = selectedExchange?.config.name === quote.protocol;
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex justify-between items-center p-2 rounded-lg mb-1 cursor-pointer ${isSelected ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                      onClick={() => {
                        if (exchange) {
                          handleExchangeSelect(exchange);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-5 h-5 mr-2">
                          <Image 
                            src={exchange?.config.logoURI || '/placeholder.svg'} 
                            alt={quote.protocol} 
                            width={20} 
                            height={20} 
                          />
                        </div>
                        <div>
                          <span>{quote.protocol}</span>
                          <div className="flex mt-1">
                            {exchange?.config.supportedChains.map(supportedChain => (
                              <div 
                                key={supportedChain}
                                className={`w-2 h-2 rounded-full mr-1 ${supportedChain === chainId ? 'bg-green-500' : 'bg-gray-500'}`} 
                                title={`${networks.find(n => n.id === supportedChain)?.name || 'Unknown'} ${supportedChain === chainId ? '(active)' : ''}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{parseFloat(quote.outputAmount).toFixed(6)}</div>
                        <div className="text-xs text-gray-400">Fee: {quote.fee}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Provider Info */}
            <div className="mt-4">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Slippage Tolerance</span>
                <span>{slippage}%</span>
              </div>
              
              {selectedExchange && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-400">Provider</span>
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-1">
                      <Image 
                        src={selectedExchange.config.logoURI} 
                        alt={selectedExchange.config.name} 
                        width={20} 
                        height={20} 
                      />
                    </div>
                    <span className="text-sm">{selectedExchange.config.name}</span>
                  </div>
                </div>
              )}
              
              {bestQuote && selectedExchange && bestQuote.protocol !== selectedExchange.config.name && (
                <div className="flex items-center mt-2 p-2 bg-yellow-800 bg-opacity-30 rounded-lg text-xs">
                  <FaInfoCircle className="text-yellow-500 mr-2" />
                  <span>Better rate available on {bestQuote.protocol}</span>
                </div>
              )}
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
                      src={token.logoURI || '/placeholder.svg'} 
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
                    <div>0.0</div>
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
