'use client';

import { useAppKit } from '@reown/appkit/react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ChevronDownIcon, PersonIcon } from '@radix-ui/react-icons';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleConnectEvm = async () => {
    console.log('Opening EVM modal...');
    setIsModalOpening(true);
    setShowDropdown(false);

    try {
      await openEvmModal();
    } catch (error) {
      console.log('Modal was closed or cancelled');
    } finally {
      // Reset modal opening state after a short delay
      setTimeout(() => {
        setIsModalOpening(false);
      }, 1000);
    }
  };

  const handleAccountClick = () => {
    if (walletType === 'evm') {
      openEvmModal({ view: 'Account' });
    } else if (walletType === 'solana') {
      // For Solana, show dropdown with disconnect option
      setShowDropdown(!showDropdown);
    }
  };

  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setDropdownPosition({
        top: rect.bottom + scrollTop + 8, // 8px margin
        right: window.innerWidth - rect.right - scrollLeft
      });
    }
  };

  const handleMainButtonClick = () => {
    if (isConnected) {
      handleAccountClick();
    } else {
      calculateDropdownPosition();
      setShowDropdown(!showDropdown);
    }
  };

  if (isConnecting || isModalOpening) {
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
      <div className="relative">
        <button
          className={`py-2 px-4 rounded-xl bg-gradient-to-r from-[#00b8d8] to-[#3b82f6] text-white font-medium hover:from-[#00b8d8]/90 hover:to-[#3b82f6]/90 transition-all duration-200 text-sm tracking-wide flex items-center gap-2 shadow-lg shadow-[#00b8d8]/20 ${className}`}
          onClick={handleMainButtonClick}
        >
          <PersonIcon className="w-4 h-4" />
          <div className="flex flex-col items-start">
            <span className="text-xs opacity-75">{chainName}</span>
            <span>{formatAddress(address || '')}</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative wallet-dropdown-container">
        <button
          ref={buttonRef}
          className={`py-2 px-4 rounded-xl bg-gradient-to-r from-[#00b8d8] to-[#3b82f6] text-white font-medium hover:from-[#00b8d8]/90 hover:to-[#3b82f6]/90 transition-all duration-200 text-sm tracking-wide flex items-center gap-2 shadow-lg shadow-[#00b8d8]/20 ${className}`}
          onClick={handleMainButtonClick}
          data-wallet-button
        >
          <PersonIcon className="w-4 h-4" />
          Connect Wallet
          <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Portal Dropdown Menu */}
      {showDropdown && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0" 
            style={{ zIndex: 9999998 }}
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div 
            className="fixed w-80 bg-black/95 backdrop-blur-xl border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden wallet-dropdown-portal"
            style={{ 
              zIndex: 9999999,
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`
            }}
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
                        setShowDropdown(false);
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
                    <div className="w-full rounded-lg bg-gradient-to-r from-[#9945ff]/20 to-[#14f195]/20 border border-[#9945ff]/30 overflow-hidden relative">
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
                    <div className="w-full rounded-lg bg-gradient-to-r from-[#9945ff]/20 to-[#14f195]/20 border border-[#9945ff]/30 overflow-hidden relative">
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
                      {isSolanaConnected && (
                        <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
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
