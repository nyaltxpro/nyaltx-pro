'use client';

import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { ChevronDownIcon, ExitIcon, PersonIcon } from '@radix-ui/react-icons';
import { useAppKit } from '@reown/appkit/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Image from 'next/image';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { CiWallet } from "react-icons/ci";
import { useDisconnect } from 'wagmi';
interface SimpleUnifiedWalletButtonProps {
  className?: string;
  onConnect?: () => void;
}

export default function SimpleUnifiedWalletButton({
  className = '',
  onConnect,
}: SimpleUnifiedWalletButtonProps) {
  const {
    isConnected,
    isConnecting,
    address,
    walletType,
    chainName,
    formatAddress,
    isEvmConnected,
    isSolanaConnected
  } = useUnifiedWallet();

  const { open: openEvmModal } = useAppKit();
  const { disconnect: disconnectSolana } = useWallet();
  const { disconnect: disconnectEvm } = useDisconnect();
  const [showModal, setShowModal] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);

  // const { buttonState, onConnect, onDisconnect, publicKey, walletIcon, walletName } = useWalletMultiButton({
  //   onSelectWallet() {
  //     setModalVisible(true);
  //   },
  // });

  const handleConnectEvm = async () => {
    console.log('Opening EVM modal...');
    setIsModalOpening(true);
    setShowModal(false);

    try {
      await openEvmModal();
    } catch (error) {
      console.log('Modal was closed or cancelled');
    } finally {
      setIsModalOpening(false);
    }
  };

  const handleConnectSolana = async () => {
    console.log('Opening Solana modal...');
    setIsModalOpening(true);
    setShowModal(false);

    try {
      setIsModalOpening(false);
    } catch (error) {
      console.log('Modal was closed or cancelled');
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
      setShowModal(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleAccountClick = () => {
    if (walletType === 'evm') {
      openEvmModal({ view: 'Account' });
    } else if (walletType === 'solana') {
      // For Solana, show modal with disconnect option
      setShowModal(true);
    }
  };

  const handleMainButtonClick = () => {
    if (isConnected) {
      // Directly disconnect when connected
      handleDisconnect();
    } else {
      setShowModal(true);
    }
  };

  if (isConnecting || isModalOpening) {
    return (
      <button
        className={`py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#00b8d8]/20 to-[#3b82f6]/20 text-white font-medium border border-[#00b8d8]/30 transition-all duration-200 text-xs sm:text-sm tracking-wide flex items-center gap-1 sm:gap-2 ${className}`}
        disabled
      >
        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span className="hidden sm:inline">Connecting...</span>
        <span className="sm:hidden">...</span>
      </button>
    );
  }

  if (isConnected) {
    return (
      <div className="relative">
        <button
          className={`py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-500/90 hover:to-red-600/90 transition-all duration-200 text-xs sm:text-sm tracking-wide flex items-center gap-1 sm:gap-2 shadow-lg shadow-red-500/20 ${className}`}
          onClick={handleMainButtonClick}
          title={`Disconnect from ${chainName}`}
        >
          <ExitIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          <div className="flex flex-col items-start">
            <span className="text-xs opacity-75 hidden sm:block">Disconnect</span>
            <span className="text-xs sm:text-sm">{formatAddress(address || '')}</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative wallet-dropdown-container">
        <button
          className={`py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#00b8d8] to-[#3b82f6] text-white font-medium hover:from-[#00b8d8]/90 hover:to-[#3b82f6]/90 transition-all duration-200 text-xs sm:text-sm tracking-wide flex items-center gap-1 sm:gap-2 shadow-lg shadow-[#00b8d8]/20 ${className}`}
          onClick={handleMainButtonClick}
          data-wallet-button
        >
          {/* <PersonIcon /> */}
          <CiWallet className="w-3 h-3 sm:w-4 sm:h-4" fill='#ffffff' />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
          <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Modal */}
      {showModal && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 9999998 }}
            onClick={() => setShowModal(false)}
          />

          {/* Modal Content */}
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-black/95 backdrop-blur-xl border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden"
            style={{ zIndex: 9999999 }}
          >
            <div className="p-4">
              {isConnected ? (
                // Connected state - show account management
                <>
                  <div className="text-sm text-gray-300 mb-4 font-medium">
                    Wallet Account
                  </div>

                  {/* Current Wallet Info */}
                  <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-[#00b8d8]/10 to-[#3b82f6]/10 border border-[#00b8d8]/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#00b8d8] to-[#3b82f6] rounded-lg flex items-center justify-center">
                        <PersonIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{chainName}</div>
                        <div className="text-xs text-gray-400">{formatAddress(address || '')}</div>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Account Actions */}
                  {walletType === 'evm' && (
                    <button
                      onClick={() => {
                        openEvmModal({ view: 'Account' });
                        setShowModal(false);
                      }}
                      className="w-full mb-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#627eea]/20 to-[#8b5cf6]/20 hover:from-[#627eea]/30 hover:to-[#8b5cf6]/30 transition-colors duration-200 text-left border border-[#627eea]/30 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-[#627eea] to-[#8b5cf6] rounded-lg flex items-center justify-center">
                        <Image
                          src="/ethereum.svg"
                          alt="Ethereum"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">Manage EVM Account</div>
                        <div className="text-xs text-gray-400">View balance, transactions, settings</div>
                      </div>
                    </button>
                  )}

                  {walletType === 'solana' && (
                    <div className="w-full mb-3 rounded-lg bg-gradient-to-r from-[#9945ff]/20 to-[#14f195]/20 border border-[#9945ff]/30 overflow-hidden relative" onClick={() => {
                      setShowModal(false);
                    }} >
                      {/* Solana Icon */}
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-[#9945ff] to-[#14f195] rounded-lg flex items-center justify-center z-10">
                        <Image
                          src="/solana.svg"
                          alt="Solana"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                      </div>
                      <WalletMultiButton
                        style={{
                          background: 'transparent',
                          border: 'none',
                          width: '100%',
                          justifyContent: 'flex-start',
                          padding: '12px 16px 12px 48px', // Add left padding for icon
                          fontSize: '14px',
                          fontWeight: '500',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  )}

                  {/* Disconnect Button */}
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 transition-colors duration-200 text-left group border border-red-500/30"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <ExitIcon className="w-4 h-4 text-white" />
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
                </>
              ) : (
                // Not connected state - show connection options
                <>
                  <div className="text-sm text-gray-300 mb-4 font-medium">
                    Choose Wallet Type
                  </div>

                  {/* EVM Wallet Option */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">EVM Wallets (Ethereum, Polygon, etc.)</div>
                    <button
                      onClick={handleConnectEvm}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#627eea]/20 to-[#8b5cf6]/20 hover:from-[#627eea]/30 hover:to-[#8b5cf6]/30 transition-colors duration-200 text-left group border border-[#627eea]/30"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-[#627eea] to-[#8b5cf6] rounded-lg flex items-center justify-center">
                        <Image
                          src="/ethereum.svg"
                          alt="Ethereum"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium group-hover:text-[#00b8d8] transition-colors">
                          Connect EVM Wallet
                        </div>
                        <div className="text-xs text-gray-400">
                          MetaMask, Coinbase, WalletConnect
                        </div>
                      </div>
                      {isEvmConnected && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </button>
                  </div>

                  {/* Solana Wallet Option */}
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Solana Wallets</div>

                    <WalletMultiButton
                      onClick={handleConnectSolana}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        width: '100%',
                        justifyContent: 'flex-start',
                        padding: '12px 16px 12px 48px', // Add left padding for icon
                        fontSize: '14px',
                        fontWeight: '500',
                        borderRadius: '8px'
                      }}
                    />
                    {isSolanaConnected && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}

                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-800/50 px-4 py-3">
              <div className="text-xs text-gray-500 text-center">
                Connect to trade across multiple chains
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
