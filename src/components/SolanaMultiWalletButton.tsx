'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { FaWallet, FaCopy, FaExternalLinkAlt, FaChevronDown } from 'react-icons/fa';
import Image from 'next/image';

interface SolanaMultiWalletButtonProps {
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
  showBalance?: boolean;
}

export default function SolanaMultiWalletButton({ 
  className = '',
  variant = 'default',
  showBalance = false
}: SolanaMultiWalletButtonProps) {
  const { wallet, publicKey, connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleWalletSelect = () => {
    setVisible(true);
  };

  if (connecting) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 bg-purple-600/50 text-white rounded-xl transition-all duration-300 cursor-not-allowed ${className}`}
      >
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span className="font-medium">Connecting...</span>
      </button>
    );
  }

  if (!connected || !publicKey) {
    return (
      <div className="relative">
        <button
          onClick={handleWalletSelect}
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${className}`}
        >
          <FaWallet className="w-4 h-4" />
          <span className="font-medium">Connect Solana Wallet</span>
        </button>
      </div>
    );
  }

  if (variant === 'icon-only') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center justify-center w-10 h-10 bg-purple-600/20 border border-purple-500/30 rounded-full hover:bg-purple-600/30 transition-all duration-300 ${className}`}
        >
          {wallet?.adapter.icon ? (
            <Image
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <FaWallet className="w-4 h-4 text-purple-400" />
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-12 bg-gray-800/95 backdrop-blur-lg border border-gray-700/50 rounded-xl p-4 min-w-[280px] shadow-2xl z-50">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {wallet?.adapter.icon && (
                  <Image
                    src={wallet.adapter.icon}
                    alt={wallet.adapter.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div>
                  <div className="text-white font-medium">{wallet?.adapter.name}</div>
                  <div className="text-gray-400 text-sm">{formatAddress(publicKey.toString())}</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(publicKey.toString())}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaCopy className="w-3 h-3" />
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => disconnect()}
                  className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded-xl">
          {wallet?.adapter.icon && (
            <Image
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              width={20}
              height={20}
              className="rounded-full"
            />
          )}
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-white font-medium">{formatAddress(publicKey.toString())}</span>
        </div>
        <button
          onClick={() => copyToClipboard(publicKey.toString())}
          className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
          title="Copy address"
        >
          <FaCopy className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Default variant
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-3 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-xl hover:bg-purple-600/30 transition-all duration-300 ${className}`}
      >
        <div className="flex items-center gap-2">
          {wallet?.adapter.icon && (
            <Image
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              width={24}
              height={24}
              className="rounded-full"
            />
          )}
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
        
        <div className="flex flex-col items-start">
          <span className="text-white font-medium text-sm">{wallet?.adapter.name}</span>
          <span className="text-gray-400 text-xs">{formatAddress(publicKey.toString())}</span>
        </div>
        
        <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-12 bg-gray-800/95 backdrop-blur-lg border border-gray-700/50 rounded-xl p-4 min-w-[320px] shadow-2xl z-50">
          <div className="space-y-4">
            {/* Wallet Info */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-700/50">
              {wallet?.adapter.icon && (
                <Image
                  src={wallet.adapter.icon}
                  alt={wallet.adapter.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="text-white font-semibold">{wallet?.adapter.name}</div>
                <div className="text-gray-400 text-sm">Connected</div>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <div className="text-gray-400 text-xs uppercase tracking-wider">Wallet Address</div>
              <div className="flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg">
                <span className="text-white text-sm font-mono flex-1">{formatAddress(publicKey.toString())}</span>
                <button
                  onClick={() => copyToClipboard(publicKey.toString())}
                  className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                  title="Copy full address"
                >
                  <FaCopy className="w-3 h-3" />
                </button>
              </div>
              {copied && (
                <div className="text-green-400 text-xs">Address copied to clipboard!</div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.open(`https://explorer.solana.com/address/${publicKey.toString()}`, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaExternalLinkAlt className="w-3 h-3" />
                <span className="text-sm">View on Explorer</span>
              </button>
              <button
                onClick={handleWalletSelect}
                className="flex-1 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors text-sm"
              >
                Change Wallet
              </button>
            </div>

            <button
              onClick={() => disconnect()}
              className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

// Export the standard wallet adapter components as well
export { WalletMultiButton, WalletDisconnectButton };
