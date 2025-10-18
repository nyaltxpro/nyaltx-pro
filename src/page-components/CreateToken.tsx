'use client';

import TransactionMonitor, { useTransactionMonitor } from '@/components/TransactionMonitor';
import React, { useRef, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaInfoCircle, FaRocket, FaUpload, FaCloud, FaCheckCircle } from 'react-icons/fa';

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
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [devBuyAmount, setDevBuyAmount] = useState('1');
    const [slippage, setSlippage] = useState('10');
    const [priorityFee, setPriorityFee] = useState('0.0005');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [ipfsProvider, setIpfsProvider] = useState<'platform' | 'pinata' | 'nftstorage' | 'web3storage'>('platform');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { currentTransaction, startMonitoring, setStatus } = useTransactionMonitor();
    const [faqs, setFaqs] = useState<FAQ[]>([
        {
            question: 'What is Pump.fun token creation?',
            answer:
                'Pump.fun is a popular Solana token launchpad that allows you to create meme tokens with automatic liquidity and trading. No additional fees for creation - only standard trading fees apply.',
            isOpen: false,
        },
        {
            question: 'What do I need to create a token?',
            answer:
                'You need a Solana wallet with SOL for the dev buy (minimum 0.1 SOL recommended), token metadata (name, symbol, description), and an image for your token logo.',
            isOpen: false,
        },
        {
            question: 'What is a dev buy?',
            answer:
                'A dev buy is an initial purchase of your own token that happens during creation. This provides initial liquidity and shows confidence in your project.',
            isOpen: false,
        },
        {
            question: 'How long does token creation take?',
            answer:
                'Token creation is usually instant once the transaction is confirmed on Solana. The token will immediately be available for trading on Pump.fun.',
            isOpen: false,
        },
        {
            question: 'Can I create tokens on other platforms?',
            answer:
                'Yes! We support Pump.fun, Bonk.fun, and Moonshot platforms. Each has different features and requirements.',
            isOpen: false,
        },
    ]);

    // Email validation function
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Check email validity and set error
    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (!value.trim()) {
            setEmailError('Email is required');
        } else if (!validateEmail(value)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const toggleFAQ = (index: number) => {
        const updatedFaqs = [...faqs];
        updatedFaqs[index].isOpen = !updatedFaqs[index].isOpen;
        setFaqs(updatedFaqs);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                setError('Image file must be less than 5MB');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = e => {
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
            // Validate email first
            if (!email.trim()) {
                setEmailError('Email is required');
                throw new Error('Please enter your email address');
            }
            if (!validateEmail(email)) {
                setEmailError('Please enter a valid email address');
                throw new Error('Please enter a valid email address');
            }

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
            formData.append('email', email);
            formData.append('website', website);
            formData.append('twitter', twitter);
            formData.append('telegram', telegram);
            formData.append('platform', platform);
            formData.append('devBuyAmount', devBuyAmount);
            formData.append('slippage', slippage);
            formData.append('priorityFee', priorityFee);
            formData.append('ipfsProvider', ipfsProvider);

            setUploadProgress('Uploading to IPFS...');

            setUploadProgress('Creating token transaction...');

            const response = await fetch('/api/tokens/create-pump', {
                method: 'POST',
                body: formData,
            });

            setUploadProgress('');

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create token');
            }

            // Build success message
            let successMessage = `${data.message || 'Token created successfully!'}\n\n`;
            successMessage += `📝 Transaction: ${data.signature}\n`;
            if (data.mint) successMessage += `🪙 Mint Address: ${data.mint}\n`;
            if (data.metadataUri) successMessage += `📄 Metadata URI: ${data.metadataUri}\n`;
            if (data.imageUrl) successMessage += `🖼️ Image URL: ${data.imageUrl}\n`;
            if (data.ipfsHash) successMessage += `🔗 IPFS Hash: ${data.ipfsHash}\n`;
            successMessage += `\nView on Solscan: https://solscan.io/tx/${data.signature}`;
            
            setSuccess(successMessage);

            // Start monitoring the transaction
            if (data.signature) {
                startMonitoring(data.signature);
            }

            // Reset form
            setTokenName('');
            setTokenSymbol('');
            setDescription('');
            setEmail('');
            setEmailError('');
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
            setUploadProgress('');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Enhanced Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div>
                            <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                Create Token
                            </h1>
                            <p className="text-xl text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                Launch your token on Pump.fun, Bonk.fun, or Moonshot platforms
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/60 rounded-3xl shadow-2xl overflow-hidden">
                            {/* Enhanced Tabs */}
                            <div className="flex border-b border-gray-800/50 bg-gray-900/30">
                                <button
                                    className={`px-8 py-4 text-sm font-bold transition-all duration-300 ${activeTab === 'basic'
                                        ? 'text-[#00d4aa] border-b-3 border-[#00d4aa] bg-[#00d4aa]/10'
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                                        }`}
                                    onClick={() => setActiveTab('basic')}
                                    style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    <FaInfoCircle className="inline mr-2" />
                                    BASIC INFO
                                </button>
                                <button
                                    className={`px-8 py-4 text-sm font-bold transition-all duration-300 ${activeTab === 'advanced'
                                        ? 'text-[#3b82f6] border-b-3 border-[#3b82f6] bg-[#3b82f6]/10'
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                                        }`}
                                    onClick={() => setActiveTab('advanced')}
                                    style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    ADVANCED
                                </button>
                            </div>

                            {/* Enhanced Progress Steps */}
                            <div className="px-8 py-6 bg-gray-900/20">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b8d8] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                            <FaInfoCircle />
                                        </div>
                                        <span className="text-xs mt-3 text-[#00d4aa] font-semibold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            TOKEN INFO
                                        </span>
                                    </div>
                                    <div className="flex-1 h-1 bg-gray-700/50 mx-4 rounded-full">
                                        <div className="h-full bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] w-1/3 rounded-full"></div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400 text-sm border-2 border-gray-600">
                                            <FaCheckCircle />
                                        </div>
                                        <span className="text-xs mt-3 text-gray-400 font-semibold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            VERIFY
                                        </span>
                                    </div>
                                    <div className="flex-1 h-1 bg-gray-700/50 mx-4 rounded-full">
                                        <div className="h-full bg-gray-600 w-0 rounded-full"></div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400 text-sm border-2 border-gray-600">
                                            <FaRocket />
                                        </div>
                                        <span className="text-xs mt-3 text-gray-400 font-semibold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            DEPLOY
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Form */}
                            <div className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Token Name */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <span className="w-2 h-2 bg-[#00d4aa] rounded-full"></span>
                                            Token Name *
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa]/60 focus:ring-2 focus:ring-[#00d4aa]/20 transition-all duration-300 backdrop-blur-sm"
                                            placeholder="e.g., Ethereum"
                                            value={tokenName}
                                            onChange={e => setTokenName(e.target.value)}
                                            style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                            required
                                        />
                                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Choose a name for your token
                                        </p>
                                    </div>

                                    {/* Token Symbol */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <span className="w-2 h-2 bg-[#3b82f6] rounded-full"></span>
                                            Token Symbol *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/60 focus:ring-2 focus:ring-[#3b82f6]/20 transition-all duration-300 backdrop-blur-sm uppercase"
                                                placeholder="e.g., ETH"
                                                value={tokenSymbol}
                                                onChange={e => setTokenSymbol(e.target.value)}
                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                required
                                                maxLength={8}
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                <FaInfoCircle className="text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Ticker symbol for your token
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                            Description *
                                        </label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                                            placeholder="Describe your token..."
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                            required
                                            rows={3}
                                        />
                                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Brief description of your token
                                        </p>
                                    </div>

                                    {/* Email Address */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => handleEmailChange(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                                                emailError 
                                                    ? 'border-red-500/60 focus:ring-red-500/20 focus:border-red-500' 
                                                    : 'border-gray-700/50 focus:ring-cyan-400/20 focus:border-cyan-400/60'
                                            }`}
                                            style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                        />
                                        {emailError && (
                                            <p className="text-xs text-red-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                {emailError}
                                            </p>
                                        )}
                                        {!emailError && (
                                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                Required for token creation notifications
                                            </p>
                                        )}
                                    </div>

                                    {/* Platform & IPFS Provider */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                                Platform *
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 backdrop-blur-sm"
                                                value={platform}
                                                onChange={e => setPlatform(e.target.value)}
                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                required
                                            >
                                                <option value="pump" className="bg-gray-800">Pump.fun</option>
                                                <option value="bonk" className="bg-gray-800">Bonk.fun</option>
                                                <option value="moonshot" className="bg-gray-800">Moonshot</option>
                                            </select>
                                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                Token launch platform
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                                                <FaCloud className="inline" />
                                                IPFS Provider *
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-pink-400/60 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 backdrop-blur-sm"
                                                value={ipfsProvider}
                                                onChange={e => setIpfsProvider(e.target.value as any)}
                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                required
                                            >
                                                <option value="platform" className="bg-gray-800">🎯 Platform Default (Recommended - Uses {platform === 'pump' ? 'Pump.fun' : platform === 'bonk' ? 'Bonk.fun' : 'Moonshot'} IPFS)</option>
                                                <option value="pinata" className="bg-gray-800">📌 Pinata (Requires API Key)</option>
                                                <option value="nftstorage" className="bg-gray-800">🖼️ NFT.Storage (Requires API Key)</option>
                                                <option value="web3storage" className="bg-gray-800">🌐 Web3.Storage (Requires API Key)</option>
                                            </select>
                                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                {ipfsProvider === 'platform' 
                                                    ? `✅ Using official ${platform === 'pump' ? 'Pump.fun' : platform === 'bonk' ? 'Bonk.fun' : 'Moonshot'} IPFS API (free, no configuration needed)`
                                                    : '⚠️ Requires API keys configured in environment variables'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Token Image */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                            Token Image *
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
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white hover:bg-gray-800/70 focus:outline-none focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 transition-all duration-300 backdrop-blur-sm flex items-center justify-center space-x-2"
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                >
                                                    <FaUpload />
                                                    <span>{imageFile ? imageFile.name : 'Upload Image'}</span>
                                                </button>
                                            </div>
                                            {imagePreview && (
                                                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-700/50 shadow-lg backdrop-blur-sm bg-gray-900/30">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            PNG, JPG, or GIF (max 5MB)
                                        </p>
                                    </div>

                                    {/* Social Links */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Social Links (Optional)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                                    Website
                                                </label>
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="https://example.com"
                                                    value={website}
                                                    onChange={e => setWebsite(e.target.value)}
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                                                    Twitter
                                                </label>
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="https://twitter.com/handle"
                                                    value={twitter}
                                                    onChange={e => setTwitter(e.target.value)}
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                                                Telegram
                                            </label>
                                            <input
                                                type="url"
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-300 backdrop-blur-sm"
                                                placeholder="https://t.me/channel"
                                                value={telegram}
                                                onChange={e => setTelegram(e.target.value)}
                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Advanced Options */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Advanced Options
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                                    Dev Buy (SOL)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0.1"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="1"
                                                    value={devBuyAmount}
                                                    onChange={e => setDevBuyAmount(e.target.value)}
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                                <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Initial buy amount
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                                    Slippage (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="50"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="10"
                                                    value={slippage}
                                                    onChange={e => setSlippage(e.target.value)}
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
                                                    Priority Fee
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.00001"
                                                    min="0.00001"
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-rose-400/60 focus:ring-2 focus:ring-rose-400/20 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="0.0005"
                                                    value={priorityFee}
                                                    onChange={e => setPriorityFee(e.target.value)}
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Messages */}
                                    {uploadProgress && (
                                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                                                <p className="text-blue-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    {uploadProgress}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <FaInfoCircle className="text-red-400 text-lg" />
                                                <div>
                                                    <div className="font-semibold text-red-300 mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        Error:
                                                    </div>
                                                    <p className="text-red-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {error}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {success && (
                                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <FaCheckCircle className="text-green-400 text-lg" />
                                                <div>
                                                    <div className="font-semibold text-green-300 mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        Success!
                                                    </div>
                                                    <pre className="whitespace-pre-wrap text-xs text-green-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {success}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* API Key Warning & Submit Button */}
                                    <div className="space-y-4">
                                        {ipfsProvider !== 'platform' && (
                                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl backdrop-blur-sm">
                                                <div className="flex items-center gap-3">
                                                    <FaInfoCircle className="text-yellow-400 text-lg flex-shrink-0" />
                                                    <div>
                                                        <div className="font-semibold text-yellow-300 mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                            ⚠️ API Key Required
                                                        </div>
                                                        <p className="text-xs text-yellow-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                            You've selected {ipfsProvider}. Make sure your API keys are configured in environment variables.
                                                            {ipfsProvider === 'pinata' && ' (NEXT_PUBLIC_PINATA_API_KEY, NEXT_PUBLIC_PINATA_SECRET_KEY)'}
                                                            {ipfsProvider === 'nftstorage' && ' (NEXT_PUBLIC_NFT_STORAGE_TOKEN)'}
                                                            {ipfsProvider === 'web3storage' && ' (NEXT_PUBLIC_WEB3_STORAGE_TOKEN)'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-col items-center gap-3 pt-4">
                                            <button
                                                type="submit"
                                                disabled={isCreating || !imageFile}
                                                className={`bg-gradient-to-r from-[#00d4aa] to-[#00b8d8] hover:from-[#00c299] hover:to-[#00a6c4] text-white font-bold py-4 px-12 rounded-full transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl ${isCreating || !imageFile ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(0,212,170,0.5)] hover:scale-105'}`}
                                                style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                            >
                                                <FaRocket className="text-xl" />
                                                <span className="text-lg">{isCreating ? 'Creating Token...' : 'Create Token'}</span>
                                            </button>
                                            {!imageFile && (
                                                <p className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Please upload a token image to continue
                                                </p>
                                            )}
                                        </div>
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
                            onStatusChange={status => setStatus(status)}
                        />
                    )}

                    {/* FAQ Section */}
                    <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            🚀 Pump.fun Token Creator
                        </h2>

                        <p className="text-gray-300 mb-4" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            Create meme tokens instantly on Solana with automatic liquidity and trading. No coding
                            required - just upload your image and launch!
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
                                    {faq.isOpen && <p className="mt-2 text-gray-400 text-sm">{faq.answer}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
