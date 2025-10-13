'use client';

import React from 'react';
import Image from 'next/image';
import { TokenMetadata } from '@/hooks/useMoralisTokenMetadata';
import { 
  FaCopy, 
  FaExternalLinkAlt, 
  FaCoins, 
  FaChartLine, 
  FaInfoCircle,
  FaGlobe,
  FaTwitter,
  FaTelegram,
  FaDiscord
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface TokenInfoWidgetProps {
  metadata: TokenMetadata | null;
  loading: boolean;
  error: string | null;
  tokenAddress: string;
  className?: string;
}

const TokenInfoWidget: React.FC<TokenInfoWidgetProps> = ({
  metadata,
  loading,
  error,
  tokenAddress,
  className = '',
}) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatNumber = (value: string | number | undefined) => {
    if (!value) return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';
    
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(2)}K`;
    }
    return num.toLocaleString();
  };

  const formatPrice = (value: string | undefined) => {
    if (!value) return 'N/A';
    const num = parseFloat(value);
    if (isNaN(num)) return 'N/A';
    
    if (num < 0.01) {
      return `$${num.toFixed(6)}`;
    } else if (num < 1) {
      return `$${num.toFixed(4)}`;
    } else {
      return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-red-500/20 p-6 ${className}`}>
        <div className="text-center">
          <FaInfoCircle className="text-red-400 text-3xl mx-auto mb-3" />
          <h3 className="text-red-400 text-lg font-semibold mb-2">Failed to Load Token Info</h3>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Token Address:</div>
            <div className="text-gray-300 font-mono text-sm break-all">
              {tokenAddress}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-700 p-6 ${className}`}>
        <div className="text-center text-gray-400">
          <FaInfoCircle className="text-3xl mx-auto mb-3" />
          <p>No token metadata available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          {metadata.logo ? (
            <Image
              src={metadata.logo}
              alt={metadata.name}
              width={64}
              height={64}
              className="rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {metadata.symbol?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">{metadata.name}</h2>
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-semibold">${metadata.symbol}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400 text-sm">{metadata.standard?.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {metadata.description && (
        <div className="mb-6">
          <h3 className="text-gray-300 font-semibold mb-2">Description</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{metadata.description}</p>
        </div>
      )}

      {/* Token Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FaCoins className="text-cyan-400" />
            <span className="text-gray-300 font-semibold">Total Supply</span>
          </div>
          <div className="text-white text-lg font-bold">
            {formatNumber(metadata.totalSupplyFormatted || metadata.totalSupply)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FaChartLine className="text-green-400" />
            <span className="text-gray-300 font-semibold">Market Cap</span>
          </div>
          <div className="text-white text-lg font-bold">
            {formatPrice(metadata.fullyDilutedValue)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FaInfoCircle className="text-blue-400" />
            <span className="text-gray-300 font-semibold">Decimals</span>
          </div>
          <div className="text-white text-lg font-bold">{metadata.decimals}</div>
        </div>

        {metadata.metaplex && (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FaInfoCircle className="text-purple-400" />
              <span className="text-gray-300 font-semibold">Mutable</span>
            </div>
            <div className="text-white text-lg font-bold">
              {metadata.metaplex.isMutable ? 'Yes' : 'No'}
            </div>
          </div>
        )}
      </div>

      {/* Contract Address */}
      <div className="mb-6">
        <h3 className="text-gray-300 font-semibold mb-2">Contract Address</h3>
        <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
          <span className="text-gray-300 font-mono text-sm break-all mr-2">
            {tokenAddress}
          </span>
          <button
            onClick={() => copyToClipboard(tokenAddress, 'Contract address')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors p-1"
            title="Copy address"
          >
            <FaCopy />
          </button>
        </div>
      </div>

      {/* Metaplex Info */}
      {metadata.metaplex && (
        <div className="mb-6">
          <h3 className="text-gray-300 font-semibold mb-3">Metaplex Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Update Authority:</span>
              <span className="text-gray-300 font-mono">
                {metadata.metaplex.updateAuthority.slice(0, 8)}...{metadata.metaplex.updateAuthority.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Seller Fee:</span>
              <span className="text-gray-300">{metadata.metaplex.sellerFeeBasisPoints / 100}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Primary Sale:</span>
              <span className="text-gray-300">
                {metadata.metaplex.primarySaleHappened ? 'Completed' : 'Pending'}
              </span>
            </div>
            {metadata.metaplex.metadataUri && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Metadata URI:</span>
                <a
                  href={metadata.metaplex.metadataUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <FaExternalLinkAlt />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Links */}
      {metadata.links && Object.keys(metadata.links).length > 0 && (
        <div>
          <h3 className="text-gray-300 font-semibold mb-3">Links</h3>
          <div className="flex flex-wrap gap-2">
            {metadata.links.homepage && (
              <a
                href={metadata.links.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
              >
                <FaGlobe className="text-blue-400" />
                <span className="text-gray-300 text-sm">Website</span>
              </a>
            )}
            {metadata.links.twitter && (
              <a
                href={metadata.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
              >
                <FaTwitter className="text-blue-400" />
                <span className="text-gray-300 text-sm">Twitter</span>
              </a>
            )}
            {metadata.links.telegram && (
              <a
                href={metadata.links.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
              >
                <FaTelegram className="text-blue-400" />
                <span className="text-gray-300 text-sm">Telegram</span>
              </a>
            )}
            {metadata.links.discord && (
              <a
                href={metadata.links.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
              >
                <FaDiscord className="text-purple-400" />
                <span className="text-gray-300 text-sm">Discord</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenInfoWidget;
