'use client';

import React, { useState, useRef } from 'react';
import { FaInfoCircle, FaChevronDown, FaChevronUp, FaUpload, FaRocket } from 'react-icons/fa';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import SolanaWalletButton from '@/components/SolanaWalletButton';
import TransactionMonitor, { useTransactionMonitor } from '@/components/TransactionMonitor';

interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

export default function CreateTokenPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [blockchain, setBlockchain] = useState('solana');
  const [platform, setPlatform] = useState('pump');
  const [totalSupply, setTotalSupply] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [devBuyAmount, setDevBuyAmount] = useState('1');
  const [slippage, setSlippage] = useState('10');
  const [priorityFee, setPriorityFee] = useState('0.0005');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentTransaction, startMonitoring, setStatus } = useTransactionMonitor();
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: 'What is Pump.fun token creation?',
      answer: 'Pump.fun is a popular Solana token launchpad that allows you to create meme tokens with automatic liquidity and trading. No additional fees for creation - only standard trading fees apply.',
      isOpen: false
    },
    {
      question: 'What do I need to create a token?',
      answer: 'You need a Solana wallet with SOL for the dev buy (minimum 0.1 SOL recommended), token metadata (name, symbol, description), and an image for your token logo.',
      isOpen: false
    },
    {
      question: 'What is a dev buy?',
      answer: 'A dev buy is an initial purchase of your own token that happens during creation. This provides initial liquidity and shows confidence in your project.',
      isOpen: false
    },
    {
      question: 'How long does token creation take?',
      answer: 'Token creation is usually instant once the transaction is confirmed on Solana. The token will immediately be available for trading on Pump.fun.',
      isOpen: false
    },
    {
      question: 'Can I create tokens on other platforms?',
      answer: 'Yes! We support Pump.fun, Bonk.fun, and Moonshot platforms. Each has different features and requirements.',
      isOpen: false
    }
  ]);

  const toggleFAQ = (index: number) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index].isOpen = !updatedFaqs[index].isOpen;
    setFaqs(updatedFaqs);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image file must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      if (!tokenName || !tokenSymbol || !description) {
        throw new Error('Please fill in all required fields');
      }

      if (!imageFile) {
        throw new Error('Please upload a token image');
      }

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('name', tokenName);
      formData.append('symbol', tokenSymbol);
      formData.append('description', description);
      formData.append('website', website);
      formData.append('twitter', twitter);
      formData.append('telegram', telegram);
      formData.append('platform', platform);
      formData.append('devBuyAmount', devBuyAmount);
      formData.append('slippage', slippage);
      formData.append('priorityFee', priorityFee);

      const response = await fetch('/api/tokens/create-pump', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create token');
      }

      setSuccess(`Token created successfully! Transaction: ${data.signature}`);
      
      // Start monitoring the transaction
      if (data.signature) {
        startMonitoring(data.signature);
      }
      
      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setDescription('');
      setWebsite('');
      setTwitter('');
      setTelegram('');
      setImageFile(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err: any) {
      setError(err.message || 'Failed to create token');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Create Token</h1>
        <div className="flex items-center space-x-4">
          <SolanaWalletButton />
          <ConnectWalletButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f1923] rounded-lg shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'basic' 
                    ? 'text-[#00b8d8] border-b-2 border-[#00b8d8]' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('basic')}
              >
                BASIC
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'advanced' 
                    ? 'text-[#00b8d8] border-b-2 border-[#00b8d8]' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('advanced')}
              >
                ADVANCED
              </button>
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#00b8d8] flex items-center justify-center text-white text-sm">
                    1
                  </div>
                  <span className="text-xs mt-2 text-[#00b8d8]">TOKEN INFO</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-700 mx-2">
                  <div className="h-full bg-[#00b8d8] w-0"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                    2
                  </div>
                  <span className="text-xs mt-2 text-gray-400">DISTRIBUTION</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-700 mx-2">
                  <div className="h-full bg-[#00b8d8] w-0"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                    3
                  </div>
                  <span className="text-xs mt-2 text-gray-400">DEPLOY</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Name*
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                    placeholder="Ethereum"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Choose a name for your token</p>
                </div>

                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Symbol*
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                      placeholder="ETH"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value)}
                      required
                      maxLength={5}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <FaInfoCircle className="text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">You need to connect your wallet</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description*
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                    placeholder="Describe your token..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Brief description of your token</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Platform*
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    required
                  >
                    <option value="pump">Pump.fun</option>
                    <option value="bonk">Bonk.fun</option>
                    <option value="moonshot">Moonshot</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Choose your token launch platform</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Token Image*
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white hover:bg-[#243441] focus:outline-none focus:ring-1 focus:ring-[#00b8d8] flex items-center justify-center space-x-2"
                      >
                        <FaUpload />
                        <span>{imageFile ? imageFile.name : 'Upload Image'}</span>
                      </button>
                    </div>
                    {imagePreview && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-700">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, or GIF (max 5MB)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                      placeholder="https://example.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Twitter</label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                      placeholder="https://twitter.com/handle"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Telegram</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                    placeholder="https://t.me/channel"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Dev Buy (SOL)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                      placeholder="1"
                      value={devBuyAmount}
                      onChange={(e) => setDevBuyAmount(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Initial buy amount</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Slippage (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                      placeholder="10"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Priority Fee</label>
                    <input
                      type="number"
                      step="0.00001"
                      min="0.00001"
                      className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                      placeholder="0.0005"
                      value={priorityFee}
                      onChange={(e) => setPriorityFee(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-300 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-md text-green-300 text-sm">
                    {success}
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className={`bg-[#00b8d8] hover:bg-[#00a6c4] text-white font-medium py-3 px-8 rounded-md transition duration-200 flex items-center justify-center space-x-2 mx-auto ${isCreating ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <FaRocket />
                    <span>{isCreating ? 'Creating Token...' : 'Create Token'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - FAQ & Transaction Monitor */}
        <div className="lg:col-span-1 space-y-6">
          {/* Transaction Monitor */}
          {currentTransaction && (
            <TransactionMonitor 
              signature={currentTransaction}
              onStatusChange={(status) => setStatus(status)}
            />
          )}

          {/* FAQ Section */}
          <div className="bg-[#0f1923] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">🚀 Pump.fun Token Creator</h2>
            
            <p className="text-gray-300 mb-4">
              Create meme tokens instantly on Solana with automatic liquidity and trading. 
              No coding required - just upload your image and launch!
            </p>

            <div className="space-y-4 mt-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-800 pb-3">
                  <button
                    className="flex justify-between items-center w-full text-left text-gray-300 hover:text-white"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    {faq.isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  {faq.isOpen && (
                    <p className="mt-2 text-gray-400 text-sm">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
