'use client';

import React, { useState, useEffect } from 'react';
import { FaWallet, FaExternalLinkAlt } from 'react-icons/fa';

interface SolanaWallet {
  publicKey: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export default function SolanaWalletButton() {
  const [wallet, setWallet] = useState<SolanaWallet>({
    publicKey: null,
    connected: false,
    connect: async () => {},
    disconnect: async () => {}
  });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if Phantom wallet is available
    const checkWallet = () => {
      if (typeof window !== 'undefined' && (window as any).solana) {
        const solana = (window as any).solana;
        if (solana.isPhantom) {
          setWallet({
            publicKey: solana.publicKey?.toString() || null,
            connected: solana.isConnected || false,
            connect: async () => {
              setIsConnecting(true);
              try {
                const response = await solana.connect();
                setWallet(prev => ({
                  ...prev,
                  publicKey: response.publicKey.toString(),
                  connected: true
                }));
              } catch (error) {
                console.error('Failed to connect wallet:', error);
              } finally {
                setIsConnecting(false);
              }
            },
            disconnect: async () => {
              try {
                await solana.disconnect();
                setWallet(prev => ({
                  ...prev,
                  publicKey: null,
                  connected: false
                }));
              } catch (error) {
                console.error('Failed to disconnect wallet:', error);
              }
            }
          });
        }
      }
    };

    checkWallet();

    // Listen for wallet events
    if (typeof window !== 'undefined' && (window as any).solana) {
      const solana = (window as any).solana;
      
      const handleConnect = () => {
        setWallet(prev => ({
          ...prev,
          publicKey: solana.publicKey?.toString() || null,
          connected: true
        }));
      };

      const handleDisconnect = () => {
        setWallet(prev => ({
          ...prev,
          publicKey: null,
          connected: false
        }));
      };

      solana.on('connect', handleConnect);
      solana.on('disconnect', handleDisconnect);

      return () => {
        solana.off('connect', handleConnect);
        solana.off('disconnect', handleDisconnect);
      };
    }
  }, []);

  const handleConnect = async () => {
    if (!wallet.connect) {
      // Redirect to Phantom wallet download
      window.open('https://phantom.app/', '_blank');
      return;
    }
    
    await wallet.connect();
  };

  const handleDisconnect = async () => {
    if (wallet.disconnect) {
      await wallet.disconnect();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!wallet.connected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={`flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors ${
          isConnecting ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <FaWallet />
        <span>{isConnecting ? 'Connecting...' : 'Connect Solana Wallet'}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 px-3 py-2 bg-purple-900/30 border border-purple-700 rounded-lg">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="text-sm text-white">{formatAddress(wallet.publicKey!)}</span>
        <button
          onClick={() => navigator.clipboard.writeText(wallet.publicKey!)}
          className="text-purple-400 hover:text-purple-300 text-xs"
          title="Copy address"
        >
          📋
        </button>
      </div>
      <button
        onClick={handleDisconnect}
        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}

// Hook to use Solana wallet in other components
export function useSolanaWallet() {
  const [wallet, setWallet] = useState<SolanaWallet>({
    publicKey: null,
    connected: false,
    connect: async () => {},
    disconnect: async () => {}
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).solana) {
      const solana = (window as any).solana;
      setWallet({
        publicKey: solana.publicKey?.toString() || null,
        connected: solana.isConnected || false,
        connect: () => solana.connect(),
        disconnect: () => solana.disconnect()
      });
    }
  }, []);

  return wallet;
}
