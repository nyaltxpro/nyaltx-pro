'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaPlus, FaCheck, FaTimes, FaCoins, FaExternalLinkAlt, FaInfoCircle, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import React from 'react';
import Image from 'next/image';
import ConnectWalletButton from '@/components/ConnectWalletButton';

interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

export default function RegisterTokenPage() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Redirect parameters
  const redirectPath = searchParams.get('redirect');
  const paymentMethod = searchParams.get('method');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [blockchain, setBlockchain] = useState('ethereum');
  const [contractAddress, setContractAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [discord, setDiscord] = useState('');
  const [github, setGithub] = useState('');
  const [youtube, setYoutube] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Check for payment success from URL params
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus === 'success' || paymentStatus === 'free') {
      setPaymentSuccess(true);
      setSuccess('🎉 Payment successful! You can now register your token with NyaltxPro benefits.');
    }
  }, []);

  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: 'What is token registration?',
      answer: 'Registering a token lets users discover your asset in search, charts, and analytics across supported chains.',
      isOpen: false
    },
    {
      question: 'What information is required?',
      answer: 'Provide your token name, symbol, the blockchain, and the contract address. Make sure the address is correct and verified.',
      isOpen: false
    },
    {
      question: 'How long does it take to appear?',
      answer: 'Tokens typically appear instantly after successful submission, but indexing and analytics may take a few minutes to populate.',
      isOpen: false
    },
  ]);

  const toggleFAQ = (index: number) => {
    const updated = [...faqs];
    updated[index].isOpen = !updated[index].isOpen;
    setFaqs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store in localStorage (replace with API call)
      const registeredTokens = JSON.parse(localStorage.getItem('registeredTokens') || '[]');
      const newToken = {
        id: Date.now().toString(),
        name: tokenName,
        symbol: tokenSymbol,
        blockchain,
        contractAddress,
        website,
        twitter,
        telegram,
        discord,
        github,
        youtube,
        submittedBy: address,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      registeredTokens.push(newToken);
      localStorage.setItem('registeredTokens', JSON.stringify(registeredTokens));
      
      setSubmitted(true);
      
      // Handle redirect after successful registration
      if (redirectPath && paymentMethod) {
        setTimeout(() => {
          router.push(`/${redirectPath}?method=${paymentMethod}`);
        }, 3000); // 3 second delay to show success message
      }
      
      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setContractAddress('');
      setWebsite('');
      setTwitter('');
      setTelegram('');
      setDiscord('');
      setGithub('');
      setYoutube('');
      
    } catch (err) {
      setError('Failed to submit token registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Register Token</h1>
        <ConnectWalletButton />
      </div>

      {/* Payment Success Banner */}
      {paymentSuccess && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <div>
              <h3 className="text-green-400 font-semibold">NyaltxPro Activated!</h3>
              <p className="text-green-300 text-sm">Your payment was successful. You now have access to premium token registration features.</p>
            </div>
          </div>
        </div>
      )}

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
                  <span className="text-xs mt-2 text-gray-400">VERIFY</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-700 mx-2">
                  <div className="h-full bg-[#00b8d8] w-0"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                    3
                  </div>
                  <span className="text-xs mt-2 text-gray-400">SUBMIT</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {!isConnected && (
                  <div className="mb-4 text-amber-300 text-sm bg-amber-900/30 border border-amber-700 rounded p-3">
                    Please connect your wallet to submit a token registration.
                  </div>
                )}
                {error && (
                  <div className="mb-4 text-red-400 text-sm bg-red-950/30 border border-red-700 rounded p-2">{error}</div>
                )}
                {success && (
                  <div className="mb-4 text-emerald-300 text-sm bg-emerald-950/30 border border-emerald-700 rounded p-2">{success}</div>
                )}
                {submitted && (
                  <div className="mb-4 p-4 bg-green-950/30 border border-green-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FaCheck className="text-green-400 text-xl" />
                      <div>
                        <h3 className="text-green-400 font-semibold">Token Registered Successfully!</h3>
                        <p className="text-green-300 text-sm">Your token has been submitted for admin approval.</p>
                        {redirectPath && paymentMethod && (
                          <p className="text-cyan-400 text-sm mt-2">
                            Redirecting to Pro subscription checkout in 3 seconds...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                  <p className="text-xs text-gray-500 mt-1">Official token name</p>
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
                      maxLength={8}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <FaInfoCircle className="text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Same as used on-chain</p>
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
                    <option value="binance">BSC</option>
                    <option value="polygon">Polygon</option>
                    <option value="avalanche">Avalanche</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="optimism">Optimism</option>
                    <option value="base">Base</option>
                    <option value="fantom">Fantom</option>
                    <option value="solana">Solana</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Contract Address*
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                    placeholder="0x... or Solana address"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Paste the verified contract address</p>
                </div>

                {/* Image URI */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Image URI (Logo)
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                    placeholder="https://.../logo.png"
                    value={imageUri}
                    onChange={(e) => setImageUri(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Direct URL to your token logo (PNG/SVG recommended)</p>
                </div>

                {/* Social Links (Optional) */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Social Links (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                        placeholder="https://example.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Twitter</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                        placeholder="https://twitter.com/yourhandle"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Telegram</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                        placeholder="https://t.me/yourchannel"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Discord</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                        placeholder="https://discord.gg/yourinvite"
                        value={discord}
                        onChange={(e) => setDiscord(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">GitHub</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                        placeholder="https://github.com/org/repo"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">YouTube</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                        placeholder="https://youtube.com/channel/..."
                        value={youtube}
                        onChange={(e) => setYoutube(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Video Link</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                        placeholder="https://youtube.com/watch?v=... or other video URL"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Demo video, tutorial, or promotional content</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={submitting || !isConnected}
                    className={`bg-[#00b8d8] hover:bg-[#00a6c4] text-white font-medium py-2 px-6 rounded-md transition duration-200 ${(submitting || !isConnected) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {submitting ? 'Submitting…' : (isConnected ? 'Submit' : 'Connect wallet to submit')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - FAQ */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f1923] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Helpful tips</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-800 pb-3">
                  <button
                    className="flex justify-between items-center w-full text-left text-gray-300 hover:text-white"
                    onClick={() => toggleFAQ(idx)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    {faq.isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  {faq.isOpen && (
                    <p className="mt-2 text-gray-400 text-sm">{faq.answer}</p>
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
