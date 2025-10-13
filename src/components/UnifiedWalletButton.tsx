'use client';

import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { ChevronDownIcon, ExitIcon, PersonIcon } from '@radix-ui/react-icons';
import { useAppKit } from '@reown/appkit/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDisconnect } from 'wagmi';

interface UnifiedWalletButtonProps {
  className?: string;
  onConnect?: () => void;
}

export default function UnifiedWalletButton({
  className = '',
  onConnect,
}: UnifiedWalletButtonProps) {
  const {
    isConnected,
    isConnecting,
    address,
    walletType,
    walletName,
    chainName,
    formatAddress,
    isEvmConnected,
    isSolanaConnected
  } = useUnifiedWallet();

  const { open: openEvmModal } = useAppKit();
  const { setVisible: setSolanaModalVisible } = useWalletModal();
  const { disconnect: disconnectEvm } = useDisconnect();
  const { disconnect: disconnectSolana } = useWallet();

  const [showDropdown, setShowDropdown] = useState(false);
  const [displayAddress, setDisplayAddress] = useState<string>('');

  useEffect(() => {
    if (isConnected && address) {
      setDisplayAddress(formatAddress(address));
      const walletTypeText = walletType === 'evm' ? 'EVM' : 'Solana';
      toast.success(`🔗 ${walletTypeText} wallet connected: ${formatAddress(address)}`);
      if (onConnect) {
        onConnect();
      }
    } else {
      setDisplayAddress('');
    }
  }, [isConnected, address, walletType, formatAddress, onConnect]);

  const handleConnectEvm = () => {
    console.log('Attempting to open EVM wallet modal...');
    try {
      openEvmModal();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error opening EVM modal:', error);
    }
  };

  const handleConnectSolana = () => {
    console.log('Attempting to open Solana wallet modal...');
    try {
      setSolanaModalVisible(true);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error opening Solana modal:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (walletType === 'evm') {
        await disconnectEvm();
        toast.success('🔌 EVM wallet disconnected');
      } else if (walletType === 'solana') {
        await disconnectSolana();
        toast.success('🔌 Solana wallet disconnected');
      }
      setShowDropdown(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleAccountClick = () => {
    if (walletType === 'evm') {
      openEvmModal({ view: 'Account' });
    } else if (walletType === 'solana') {
      setSolanaModalVisible(true);
    }
    setShowDropdown(false);
  };

  const handleMainButtonClick = () => {
    if (isConnected) {
      setShowDropdown(!showDropdown);
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  if (isConnecting) {
    return (
      <button
        className={`py-2 px-4 rounded-xl bg-gradient-to-r from-[#00b8d8]/20 to-[#3b82f6]/20 text-white font-medium border border-[#00b8d8]/30 transition-all duration-200 text-sm tracking-wide flex items-center gap-2 ${className}`}
        disabled
      >
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        Connecting...
      </button>
    );
  }

  if (isConnected) {
    return (
      <div className="relative unified-wallet-dropdown">
        <button
          className={`py-2 px-4 rounded-xl bg-gradient-to-r from-[#00b8d8] to-[#3b82f6] text-white font-medium hover:from-[#00b8d8]/90 hover:to-[#3b82f6]/90 transition-all duration-200 text-sm tracking-wide flex items-center gap-2 shadow-lg shadow-[#00b8d8]/20 ${className}`}
          onClick={handleMainButtonClick}
        >
          <PersonIcon className="w-4 h-4" />
          <div className="flex flex-col items-start">
            <span className="text-xs opacity-75">{chainName}</span>
            <span>{displayAddress}</span>
          </div>
          <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Connected Wallet Dropdown */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 unified-wallet-backdrop"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown Content */}
            <div className="absolute top-full right-0 mt-2 w-64 bg-black/95 backdrop-blur-xl border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden" style={{ zIndex: 10002 }}>
              <div className="p-2">
                <div className="text-xs text-gray-400 px-3 py-2 font-medium">
                  Connected as {walletName}
                </div>

                {/* Account Details Option */}
                <button
                  onClick={handleAccountClick}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors duration-200 text-left group"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-[#00b8d8] to-[#3b82f6] rounded-lg flex items-center justify-center">
                    <PersonIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium group-hover:text-[#00b8d8] transition-colors">
                      Account Details
                    </div>
                    <div className="text-xs text-gray-400">
                      View wallet information
                    </div>
                  </div>
                </button>

                {/* Disconnect Option */}
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-500/10 transition-colors duration-200 text-left group"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <ExitIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium group-hover:text-red-400 transition-colors">
                      Disconnect Wallet
                    </div>
                    <div className="text-xs text-gray-400">
                      Disconnect from {chainName}
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-800/50 px-3 py-2">
                <div className="text-xs text-gray-500 text-center">
                  {address}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative unified-wallet-dropdown">
      <button
        className={`py-2 px-4 rounded-xl bg-gradient-to-r from-[#00b8d8] to-[#3b82f6] text-white font-medium hover:from-[#00b8d8]/90 hover:to-[#3b82f6]/90 transition-all duration-200 text-sm tracking-wide flex items-center gap-2 shadow-lg shadow-[#00b8d8]/20 ${className}`}
        onClick={handleMainButtonClick}
      >
        <PersonIcon className="w-4 h-4" />
        Connect Wallet
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 unified-wallet-backdrop"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-black/95 backdrop-blur-xl border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden" style={{ zIndex: 10002 }}>
            <div className="p-2">
              <div className="text-xs text-gray-400 px-3 py-2 font-medium">
                Choose Wallet Type
              </div>

              {/* EVM Wallet Option */}
              <button
                onClick={handleConnectEvm}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors duration-200 text-left group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-[#627eea] to-[#8b5cf6] rounded-lg flex items-center justify-center">
                  <PersonIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium group-hover:text-[#00b8d8] transition-colors">
                    EVM Wallets
                  </div>
                  <div className="text-xs text-gray-400">
                    MetaMask, Coinbase, WalletConnect
                  </div>
                </div>
                {isEvmConnected && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </button>

              {/* Solana Wallet Option */}
              <button
                onClick={handleConnectSolana}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors duration-200 text-left group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-[#9945ff] to-[#14f195] rounded-lg flex items-center justify-center">
                  <PersonIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium group-hover:text-[#00b8d8] transition-colors">
                    Solana Wallets
                  </div>
                  <div className="text-xs text-gray-400">
                    Phantom, Solflare, Backpack
                  </div>
                </div>
                {isSolanaConnected && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-800/50 px-3 py-2">
              <div className="text-xs text-gray-500 text-center">
                Connect to trade across multiple chains
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
