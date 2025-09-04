'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaEthereum, FaExternalLinkAlt, FaTelegram, FaTwitter, FaGlobe, FaDiscord, FaYoutube, FaEnvelope, FaFilePdf, FaCopy, FaCheck } from 'react-icons/fa';
import { SiBinance } from 'react-icons/si';
import { BiArrowBack, BiCopy } from 'react-icons/bi';
import { MdContentCopy } from 'react-icons/md';
import nyaxTokensData from '../../../../nyax-tokens-data.json';
import SwapCard from '../../../components/SwapCard';

interface NyaxToken {
  logoId: string;
  name: string | null;
  symbol: string | null;
  contractAddress: string | null;
  network: string;
  logo: string;
  aboutUs: string | null;
  url: string;
  description?: string | null;
  totalSupply?: string | null;
  circulatingSupply?: string | null;
  marketCap?: string | null;
  price?: string | null;
  website?: string | null;
  telegram?: string | null;
  twitter?: string | null;
  discord?: string | null;
  whitepaper?: string | null;
  email?: string | null;
  etherscan?: string | null;
  video?: string | null;
  additionalInfo?: any;
}

const NYAXTokenDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const logoId = params?.logoId as string;
  const [copiedAddress, setCopiedAddress] = useState(false);

  const token: NyaxToken | undefined = nyaxTokensData.tokens.find(
    (t: NyaxToken) => t.logoId === logoId
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0b1217] text-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-4 text-red-400">Token Not Found</h1>
          <p className="text-gray-400 mb-8">The requested NYAX token could not be found.</p>
          <button 
            onClick={() => router.back()}
            className="bg-cyan-600 hover:bg-cyan-700 px-8 py-3 rounded-lg transition-colors font-semibold"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const getNetworkIcon = (network: string) => {
    switch (network.toLowerCase()) {
      case 'ethereum':
        return <FaEthereum className="text-blue-400" size={28} />;
      case 'bsc':
        return <SiBinance className="text-yellow-400" size={28} />;
      default:
        return <div className="w-7 h-7 rounded-full bg-gray-400" />;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getSocialIcon = (type: string, size: number = 18) => {
    const iconProps = { size };
    switch (type) {
      case 'telegram': return <FaTelegram className="text-blue-400" {...iconProps} />;
      case 'twitter': return <FaTwitter className="text-blue-400" {...iconProps} />;
      case 'discord': return <FaDiscord className="text-indigo-400" {...iconProps} />;
      case 'website': return <FaGlobe className="text-green-400" {...iconProps} />;
      case 'whitepaper': return <FaFilePdf className="text-red-400" {...iconProps} />;
      case 'email': return <FaEnvelope className="text-gray-400" {...iconProps} />;
      case 'video': return <FaYoutube className="text-red-500" {...iconProps} />;
      case 'etherscan': return <FaExternalLinkAlt className="text-blue-300" {...iconProps} />;
      default: return <FaExternalLinkAlt className="text-gray-400" {...iconProps} />;
    }
  };

  const socialLinks = [
    { key: 'website', label: 'Website', url: token.website, type: 'website' },
    { key: 'telegram', label: 'Telegram', url: token.telegram, type: 'telegram' },
    { key: 'twitter', label: 'Twitter', url: token.twitter !== "https://www.nyaltx.com/privacy-policy/" ? token.twitter : null, type: 'twitter' },
    { key: 'discord', label: 'Discord', url: token.discord, type: 'discord' },
    { key: 'whitepaper', label: 'Whitepaper', url: token.whitepaper, type: 'whitepaper' },
    { key: 'video', label: 'Video', url: token.video, type: 'video' },
    { key: 'etherscan', label: token.network === 'BSC' ? 'BSCScan' : 'Etherscan', url: token.etherscan, type: 'etherscan' },
    { key: 'email', label: 'Email', url: token.email ? `mailto:${token.email}` : null, type: 'email' },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-[#0b1217] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 py-12">
        <div className="container mx-auto px-4">
          <motion.button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-cyan-200 mb-8 transition-colors group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
          >
            <BiArrowBack size={24} />
            <span className="font-semibold">Back to Search</span>
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-8"
          >
            {/* Token Logo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border-4 border-white/20 shadow-2xl">
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
                <div className={`w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold ${token.logo ? 'hidden' : ''}`}>
                  {token.symbol?.[0] || '?'}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#0b1217] rounded-full p-2 border-2 border-white/20">
                {getNetworkIcon(token.network)}
              </div>
            </div>
            
            {/* Token Info */}
            <div className="flex-1">
              <motion.h1 
                className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {token.symbol || 'Unknown Token'}
              </motion.h1>
              <motion.p 
                className="text-2xl text-cyan-100 mb-4 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {token.name || 'Unknown Token Name'}
              </motion.p>
              <motion.div 
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  {getNetworkIcon(token.network)}
                  <span className="text-lg font-semibold">{token.network}</span>
                </div>
                <div className="bg-cyan-500/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <span className="text-cyan-200 font-semibold">NYAX Listed</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Swap Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#1a2932] to-[#243540] rounded-2xl p-8 border border-gray-700/50 shadow-xl"
            >
              <h2 className="text-3xl font-bold mb-6 text-cyan-400 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                Trade {token.symbol}
              </h2>
              <div className="max-w-md mx-auto">
                <SwapCard 
                  inTradeView={true} 
                  baseToken={token.symbol || undefined}
                  quoteToken="USDT"
                />
              </div>
            </motion.div>
            {/* About Section */}
            {token.aboutUs && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#1a2932] to-[#243540] rounded-2xl p-8 border border-gray-700/50 shadow-xl"
              >
                <h2 className="text-3xl font-bold mb-6 text-cyan-400 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                  About {token.symbol}
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-lg">{token.aboutUs}</p>
                </div>
              </motion.div>
            )}

            {/* Contract & Token Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-[#1a2932] to-[#243540] rounded-2xl p-8 border border-gray-700/50 shadow-xl"
            >
              <h2 className="text-3xl font-bold mb-6 text-cyan-400 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                Contract Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {token.contractAddress && (
                  <div className="col-span-full">
                    <div className="bg-[#0f1923] rounded-xl p-6 border border-gray-600/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm font-medium">Contract Address</span>
                        <button
                          onClick={() => copyToClipboard(token.contractAddress!)}
                          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          {copiedAddress ? <FaCheck size={16} /> : <MdContentCopy size={16} />}
                          <span className="text-sm">{copiedAddress ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="font-mono text-cyan-300 text-lg break-all">{token.contractAddress}</p>
                    </div>
                  </div>
                )}
                
                {[
                  { label: 'Total Supply', value: token.totalSupply },
                  { label: 'Circulating Supply', value: token.circulatingSupply },
                  { label: 'Market Cap', value: token.marketCap },
                  { label: 'Price', value: token.price },
                ].filter(item => item.value).map((item, index) => (
                  <div key={index} className="bg-[#0f1923] rounded-xl p-6 border border-gray-600/30">
                    <span className="text-gray-400 text-sm font-medium block mb-2">{item.label}</span>
                    <p className="text-white font-bold text-xl">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-[#1a2932] to-[#243540] rounded-2xl p-8 border border-gray-700/50 shadow-xl"
              >
                <h2 className="text-2xl font-bold mb-6 text-cyan-400 flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                  Links & Resources
                </h2>
                <div className="space-y-3">
                  {socialLinks.map((link, index) => (
                    <motion.a
                      key={link.key}
                      href={link.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-[#0f1923] rounded-xl hover:bg-[#243540] transition-all duration-300 border border-gray-600/30 hover:border-cyan-500/50 group"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex-shrink-0">
                        {getSocialIcon(link.type, 20)}
                      </div>
                      <span className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                        {link.label}
                      </span>
                      <FaExternalLinkAlt className="ml-auto text-gray-400 group-hover:text-cyan-400 transition-colors" size={14} />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Token Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-[#1a2932] to-[#243540] rounded-2xl p-8 border border-gray-700/50 shadow-xl"
            >
              <h2 className="text-2xl font-bold mb-6 text-cyan-400 flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                Token Information
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Logo ID', value: token.logoId },
                  { label: 'Network', value: token.network },
                  { label: 'Symbol', value: token.symbol },
                  { label: 'Name', value: token.name },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-600/30 last:border-b-0">
                    <span className="text-gray-400 font-medium">{item.label}</span>
                    <span className="text-white font-semibold">{item.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NYAXTokenDetailsPage;
