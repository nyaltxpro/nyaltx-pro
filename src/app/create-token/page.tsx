'use client';

import React, { useState } from 'react';
import { FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ConnectWalletButton from '../../components/ConnectWalletButton';

interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

export default function CreateTokenPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [blockchain, setBlockchain] = useState('ethereum');
  const [totalSupply, setTotalSupply] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: 'What are the benefits of using our platform?',
      answer: 'Our platform is easy to use, has low fees, and is trusted by thousands of projects. It makes creating a token simple and accessible to everyone.',
      isOpen: false
    },
    {
      question: 'How does token creation cost?',
      answer: 'Token creation costs vary by network. Ethereum has higher gas fees compared to other networks like BSC or Polygon. We charge a small platform fee in addition to network gas fees.',
      isOpen: false
    },
    {
      question: 'What is chain/network selection?',
      answer: 'Chain selection refers to choosing which blockchain your token will be deployed on. Different chains have different features, costs, and user bases.',
      isOpen: false
    },
    {
      question: "What should I do once I've created a token?",
      answer: "After creating your token, you can add liquidity to a DEX, create a website, build a community, and start marketing your project.",
      isOpen: false
    },
    {
      question: 'How can I get help?',
      answer: 'You can reach out to our support team via Discord or Telegram. We also have extensive documentation and guides available.',
      isOpen: false
    }
  ]);

  const toggleFAQ = (index: number) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index].isOpen = !updatedFaqs[index].isOpen;
    setFaqs(updatedFaqs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would connect to a blockchain and create the token
    console.log({
      tokenName,
      tokenSymbol,
      blockchain,
      totalSupply
    });
    alert('Token creation initiated! This would connect to the blockchain in a real app.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Create Token</h1>
        <ConnectWalletButton />
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
                    Blockchain*
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                    value={blockchain}
                    onChange={(e) => setBlockchain(e.target.value)}
                    required
                  >
                    <option value="ethereum">Ethereum</option>
                    <option value="bsc">BSC</option>
                    <option value="polygon">Polygon</option>
                    <option value="avalanche">Avalanche</option>
                    <option value="arbitrum">Arbitrum</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Total Supply*
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                    placeholder="1000000"
                    value={totalSupply}
                    onChange={(e) => setTotalSupply(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum amount of tokens available</p>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-[#00b8d8] hover:bg-[#00a6c4] text-white font-medium py-2 px-6 rounded-md transition duration-200"
                  >
                    Next
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - FAQ */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f1923] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">What are the benefits of using our platform?</h2>
            
            <p className="text-gray-300 mb-4">
              Our platform is easy to use, has low fees, and is trusted by thousands of projects. 
              It makes creating a token simple and accessible to everyone.
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
