'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaPlus, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import ConnectWalletButton from '../components/ConnectWalletButton';
import Banner from '../components/Banner';
import { getCryptoIconUrl } from '../utils/cryptoIcons';

// Define types
type AddOption = 'token' | 'pool' | 'farm' | 'nft';
type Network = {
  id: number;
  name: string;
  icon: string;
};

// Mock networks data
const networks: Network[] = [
  { id: 1, name: 'Ethereum', icon: getCryptoIconUrl('eth') },
  { id: 2, name: 'Binance Smart Chain', icon: getCryptoIconUrl('bnb') },
  { id: 3, name: 'Polygon', icon: getCryptoIconUrl('matic') },
  { id: 4, name: 'Avalanche', icon: getCryptoIconUrl('avax') },
  { id: 5, name: 'Solana', icon: getCryptoIconUrl('sol') },
  { id: 6, name: 'Arbitrum', icon: getCryptoIconUrl('arb') },
  { id: 7, name: 'Optimism', icon: getCryptoIconUrl('op') },
];

export default function AddNewPage() {
  const [selectedOption, setSelectedOption] = useState<AddOption>('token');
  const [selectedNetwork, setSelectedNetwork] = useState<number | null>(null);
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (!selectedNetwork) {
      setError('Please select a network');
      return;
    }
    
    if (!tokenAddress) {
      setError('Please enter a token address');
      return;
    }
    
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(`Successfully added ${selectedOption}!`);
      
      // Reset form
      setTokenAddress('');
      setTokenSymbol('');
      setTokenName('');
    }, 1500);
  };

  // Handle option change
  const handleOptionChange = (option: AddOption) => {
    setSelectedOption(option);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Banner */}
      <Banner />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Add New</h1>
          <ConnectWalletButton onConnect={() => setIsWalletConnected(true)} />
        </div>
        
        {/* Options Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <button
            className={`px-4 py-2 rounded-lg flex items-center ${
              selectedOption === 'token' ? 'bg-blue-600' : 'bg-gray-800'
            }`}
            onClick={() => handleOptionChange('token')}
          >
            <FaPlus className="mr-2" /> Add Token
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center ${
              selectedOption === 'pool' ? 'bg-blue-600' : 'bg-gray-800'
            }`}
            onClick={() => handleOptionChange('pool')}
          >
            <FaPlus className="mr-2" /> Add Liquidity Pool
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center ${
              selectedOption === 'farm' ? 'bg-blue-600' : 'bg-gray-800'
            }`}
            onClick={() => handleOptionChange('farm')}
          >
            <FaPlus className="mr-2" /> Add Farm
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center ${
              selectedOption === 'nft' ? 'bg-blue-600' : 'bg-gray-800'
            }`}
            onClick={() => handleOptionChange('nft')}
          >
            <FaPlus className="mr-2" /> Add NFT Collection
          </button>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedOption === 'token' && 'Add New Token'}
                {selectedOption === 'pool' && 'Add New Liquidity Pool'}
                {selectedOption === 'farm' && 'Add New Farm'}
                {selectedOption === 'nft' && 'Add New NFT Collection'}
              </h2>
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  {error}
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="bg-green-900/30 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-4">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {/* Network Selection */}
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Select Network</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {networks.map((network) => (
                      <button
                        key={network.id}
                        type="button"
                        className={`flex items-center p-3 rounded-lg border ${
                          selectedNetwork === network.id
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-gray-700 bg-gray-700/50 hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedNetwork(network.id)}
                      >
                        <Image 
                          src={network.icon} 
                          alt={network.name} 
                          width={20}
                          height={20}
                          className="mr-2" 
                        />
                        <span className="text-sm">{network.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Token Form Fields */}
                {selectedOption === 'token' && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="tokenAddress" className="block text-gray-300 mb-2">
                        Token Contract Address
                      </label>
                      <input
                        type="text"
                        id="tokenAddress"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0x..."
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="tokenSymbol" className="block text-gray-300 mb-2">
                          Token Symbol
                        </label>
                        <input
                          type="text"
                          id="tokenSymbol"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. ETH"
                          value={tokenSymbol}
                          onChange={(e) => setTokenSymbol(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="tokenName" className="block text-gray-300 mb-2">
                          Token Name
                        </label>
                        <input
                          type="text"
                          id="tokenName"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. Ethereum"
                          value={tokenName}
                          onChange={(e) => setTokenName(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {/* Pool Form Fields */}
                {selectedOption === 'pool' && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="poolAddress" className="block text-gray-300 mb-2">
                        Pool Contract Address
                      </label>
                      <input
                        type="text"
                        id="poolAddress"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0x..."
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="token0" className="block text-gray-300 mb-2">
                          Token 1 Address
                        </label>
                        <input
                          type="text"
                          id="token0"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0x..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="token1" className="block text-gray-300 mb-2">
                          Token 2 Address
                        </label>
                        <input
                          type="text"
                          id="token1"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0x..."
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {/* Farm Form Fields */}
                {selectedOption === 'farm' && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="farmAddress" className="block text-gray-300 mb-2">
                        Farm Contract Address
                      </label>
                      <input
                        type="text"
                        id="farmAddress"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0x..."
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="rewardToken" className="block text-gray-300 mb-2">
                        Reward Token Address
                      </label>
                      <input
                        type="text"
                        id="rewardToken"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0x..."
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="apr" className="block text-gray-300 mb-2">
                        Estimated APR (%)
                      </label>
                      <input
                        type="text"
                        id="apr"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 12.5"
                      />
                    </div>
                  </>
                )}
                
                {/* NFT Form Fields */}
                {selectedOption === 'nft' && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="nftAddress" className="block text-gray-300 mb-2">
                        NFT Collection Address
                      </label>
                      <input
                        type="text"
                        id="nftAddress"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0x..."
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="collectionName" className="block text-gray-300 mb-2">
                        Collection Name
                      </label>
                      <input
                        type="text"
                        id="collectionName"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Bored Ape Yacht Club"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="collectionSymbol" className="block text-gray-300 mb-2">
                        Collection Symbol
                      </label>
                      <input
                        type="text"
                        id="collectionSymbol"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. BAYC"
                      />
                    </div>
                  </>
                )}
                
                <div className="mt-6">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center w-full"
                    disabled={isLoading || !isWalletConnected}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Submit <FaArrowRight className="ml-2" />
                      </span>
                    )}
                  </button>
                  
                  {!isWalletConnected && (
                    <p className="text-yellow-500 text-sm mt-2 text-center">
                      Please connect your wallet to submit
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          {/* Info Section */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Information</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-400 mb-1">Why add a {selectedOption}?</h4>
                  <p className="text-sm text-gray-300">
                    {selectedOption === 'token' && 'Adding your token increases visibility and allows users to easily find and trade it.'}
                    {selectedOption === 'pool' && 'Adding your liquidity pool helps users find trading opportunities and contribute liquidity.'}
                    {selectedOption === 'farm' && 'Adding your farm allows users to discover yield farming opportunities on your platform.'}
                    {selectedOption === 'nft' && 'Adding your NFT collection increases visibility and helps collectors discover your digital assets.'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-400 mb-1">Requirements</h4>
                  <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
                    <li>Valid contract address on the selected network</li>
                    <li>Contract must be verified on the blockchain explorer</li>
                    {selectedOption === 'token' && <li>Token must implement ERC-20/BEP-20 standard</li>}
                    {selectedOption === 'pool' && <li>Pool must have sufficient liquidity</li>}
                    {selectedOption === 'farm' && <li>Farm must be active and paying rewards</li>}
                    {selectedOption === 'nft' && <li>Collection must implement ERC-721 or ERC-1155 standard</li>}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-400 mb-1">Verification Process</h4>
                  <p className="text-sm text-gray-300">
                    All submissions are reviewed by our team before being listed. This process typically takes 24-48 hours.
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="font-medium text-blue-400 mb-1">Need Help?</h4>
                  <p className="text-sm text-gray-300">
                    If you have any questions or need assistance, please contact our support team at support@example.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
