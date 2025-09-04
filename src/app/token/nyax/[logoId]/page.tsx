'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaEthereum, FaExternalLinkAlt, FaTelegram, FaTwitter, FaGlobe, FaDiscord, FaYoutube, FaEnvelope, FaFilePdf } from 'react-icons/fa';
import { SiBinance } from 'react-icons/si';
import { BiArrowBack, BiCopy } from 'react-icons/bi';
import nyaxTokensData from '../../../../../nyax-tokens-data.json';

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

const TokenDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const logoId = params?.logoId as string;

  const token: NyaxToken | undefined = nyaxTokensData.tokens.find(
    (t: NyaxToken) => t.logoId === logoId
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0b1217] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Token Not Found</h1>
          <p className="text-gray-400 mb-6">The requested token could not be found.</p>
          <button 
            onClick={() => router.back()}
            className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getNetworkIcon = (network: string) => {
    switch (network.toLowerCase()) {
      case 'ethereum':
        return <FaEthereum className="text-blue-400" size={24} />;
      case 'bsc':
        return <SiBinance className="text-yellow-400" size={24} />;
      default:
        return <div className="w-6 h-6 rounded-full bg-gray-400" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'telegram': return <FaTelegram className="text-blue-400" />;
      case 'twitter': return <FaTwitter className="text-blue-400" />;
      case 'discord': return <FaDiscord className="text-indigo-400" />;
      case 'website': return <FaGlobe className="text-green-400" />;
      case 'whitepaper': return <FaFilePdf className="text-red-400" />;
      case 'email': return <FaEnvelope className="text-gray-400" />;
      case 'video': return <FaYoutube className="text-red-500" />;
      case 'etherscan': return <FaExternalLinkAlt className="text-blue-300" />;
      default: return <FaExternalLinkAlt className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1217] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 py-8">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-cyan-200 mb-6 transition-colors"
          >
            <BiArrowBack size={20} />
            Back
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-6"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
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
              <div className={`w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold ${token.logo ? 'hidden' : ''}`}>
                {token.symbol?.[0] || '?'}
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {token.symbol || 'Unknown Token'}
              </h1>
              <p className="text-xl text-cyan-100 mb-3">
                {token.name || 'Unknown Token Name'}
              </p>
              <div className="flex items-center gap-3">
                {getNetworkIcon(token.network)}
                <span className="text-lg">{token.network}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {token.aboutUs && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#1a2932] rounded-lg p-6"
              >
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">About</h2>
                <p className="text-gray-300 leading-relaxed">{token.aboutUs}</p>
              </motion.div>
            )}

            {/* Contract Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1a2932] rounded-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">Contract Details</h2>
              <div className="space-y-4">
                {token.contractAddress && (
                  <div className="flex items-center justify-between p-3 bg-[#0f1923] rounded-lg">
                    <div>
                      <span className="text-gray-400 text-sm">Contract Address</span>
                      <p className="font-mono text-cyan-300">{token.contractAddress}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(token.contractAddress!)}
                      className="text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <BiCopy size={20} />
                    </button>
                  </div>
                )}
                
                {token.totalSupply && (
                  <div className="p-3 bg-[#0f1923] rounded-lg">
                    <span className="text-gray-400 text-sm">Total Supply</span>
                    <p className="text-white font-semibold">{token.totalSupply}</p>
                  </div>
                )}
                
                {token.circulatingSupply && (
                  <div className="p-3 bg-[#0f1923] rounded-lg">
                    <span className="text-gray-400 text-sm">Circulating Supply</span>
                    <p className="text-white font-semibold">{token.circulatingSupply}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1a2932] rounded-lg p-6"
            >
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Links</h2>
              <div className="space-y-3">
                {token.website && (
                  <a
                    href={token.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#0f1923] rounded-lg hover:bg-[#243540] transition-colors"
                  >
                    {getSocialIcon('website')}
                    <span>Website</span>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" size={14} />
                  </a>
                )}
                
                {token.telegram && (
                  <a
                    href={token.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#0f1923] rounded-lg hover:bg-[#243540] transition-colors"
                  >
                    {getSocialIcon('telegram')}
                    <span>Telegram</span>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" size={14} />
                  </a>
                )}
                
                {token.twitter && token.twitter !== "https://www.nyaltx.com/privacy-policy/" && (
                  <a
                    href={token.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#0f1923] rounded-lg hover:bg-[#243540] transition-colors"
                  >
                    {getSocialIcon('twitter')}
                    <span>Twitter</span>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" size={14} />
                  </a>
                )}
                
                {token.discord && (
                  <a
                    href={token.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#0f1923] rounded-lg hover:bg-[#243540] transition-colors"
                  >
                    {getSocialIcon('discord')}
                    <span>Discord</span>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" size={14} />
                  </a>
                )}
                
                {token.whitepaper && (
                  <a
                    href={token.whitepaper}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#0f1923] rounded-lg hover:bg-[#243540] transition-colors"
                  >
                    {getSocialIcon('whitepaper')}
                    <span>Whitepaper</span>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" size={14} />
                  </a>
                )}
                
                {token.video && (
                  <a
                    href={token.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#0f1923] rounded-lg hover:bg-[#243540] transition-colors"
                  >
                    {getSocialIcon('video')}
                    <span>Video</span>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" size={14} />
                  </a>
                )}
                
                {token.etherscan && (
                  <a
                    href={token.etherscan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#0f1923] rounded-lg hover:bg-[#243540] transition-colors"
                  >
                    {getSocialIcon('etherscan')}
                    <span>{token.network === 'BSC' ? 'BSCScan' : 'Etherscan'}</span>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" size={14} />
                  </a>
                )}
                
                {token.email && (
                  <a
                    href={`mailto:${token.email}`}
                    className="flex items-center gap-3 p-3 bg-[#0f1923] rounded-lg hover:bg-[#243540] transition-colors"
                  >
                    {getSocialIcon('email')}
                    <span>Email</span>
                    <FaExternalLinkAlt className="ml-auto text-gray-400" size={14} />
                  </a>
                )}
              </div>
            </motion.div>

            {/* Token Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#1a2932] rounded-lg p-6"
            >
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Token Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Logo ID</span>
                  <span className="text-white">{token.logoId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network</span>
                  <span className="text-white">{token.network}</span>
                </div>
                {token.price && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price</span>
                    <span className="text-white">{token.price}</span>
                  </div>
                )}
                {token.marketCap && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Market Cap</span>
                    <span className="text-white">{token.marketCap}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetailPage;
