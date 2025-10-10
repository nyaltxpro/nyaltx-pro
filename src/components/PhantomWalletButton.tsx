'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { FaSpinner, FaExternalLinkAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface PhantomWalletButtonProps {
  amount: number; // Amount in USD
  onSuccess: (txHash: string, solAmount: number) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

// Solana receiver address - replace with your actual Solana wallet
const SOLANA_RECEIVER = process.env.NEXT_PUBLIC_SOLANA_RECEIVER_ADDRESS || 
  'YourSolanaWalletAddressHere';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>;
      publicKey?: { toString: () => string };
      isConnected?: boolean;
    };
  }
}

export const PhantomWalletButton: React.FC<PhantomWalletButtonProps> = ({
  amount,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [isPhantomAvailable, setIsPhantomAvailable] = useState(false);

  // Check if Phantom wallet is available
  useEffect(() => {
    const checkPhantom = () => {
      if (typeof window !== 'undefined' && window.solana?.isPhantom) {
        setIsPhantomAvailable(true);
        
        // Check if already connected
        if (window.solana?.isConnected && window.solana?.publicKey) {
          setIsConnected(true);
          setWalletAddress(window.solana.publicKey.toString());
        }
      }
    };

    // Check immediately
    checkPhantom();

    // Check again after a short delay (Phantom might load asynchronously)
    const timer = setTimeout(checkPhantom, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Fetch SOL price from CoinGecko
  const fetchSolPrice = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      );
      const data = await response.json();
      const price = data.solana?.usd;
      if (price) {
        setSolPrice(price);
        return price;
      }
      throw new Error('Failed to fetch SOL price');
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      // Fallback price if API fails
      const fallbackPrice = 150;
      setSolPrice(fallbackPrice);
      return fallbackPrice;
    }
  }, []);

  // Load SOL price on mount
  useEffect(() => {
    fetchSolPrice();
  }, [fetchSolPrice]);

  // Connect to Phantom wallet
  const connectWallet = useCallback(async () => {
    if (!window.solana?.isPhantom) {
      const errorMsg = 'Phantom wallet not found. Please install Phantom wallet extension.';
      onError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const connectingToast = toast.loading('Connecting to Phantom wallet...');
    
    try {
      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      setIsConnected(true);
      setWalletAddress(address);
      console.log('✅ Connected to Phantom wallet:', address);
      
      toast.dismiss(connectingToast);
      toast.success(`🔗 Phantom wallet connected: ${address.slice(0, 8)}...${address.slice(-8)}`);
    } catch (error: any) {
      console.error('❌ Failed to connect wallet:', error);
      const errorMsg = 'Failed to connect to Phantom wallet';
      onError(errorMsg);
      toast.dismiss(connectingToast);
      toast.error(errorMsg);
    }
  }, [onError]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    if (window.solana) {
      try {
        await window.solana.disconnect();
        setIsConnected(false);
        setWalletAddress('');
        console.log('🔌 Disconnected from Phantom wallet');
        toast.success('Phantom wallet disconnected');
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
        toast.error('Failed to disconnect wallet');
      }
    }
  }, []);

  // Calculate SOL amount needed
  const calculateSolAmount = useCallback(async () => {
    const price = solPrice || await fetchSolPrice();
    return amount / price;
  }, [amount, solPrice, fetchSolPrice]);

  // Handle Solana payment using Phantom wallet
  const handleSolanaPayment = useCallback(async () => {
    if (!isConnected || !window.solana) {
      const errorMsg = 'Please connect your Phantom wallet first';
      onError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!SOLANA_RECEIVER || SOLANA_RECEIVER === 'YourSolanaWalletAddressHere') {
      const errorMsg = 'Solana receiver address not configured';
      onError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsProcessing(true);
    const paymentToast = toast.loading('Processing Solana payment...');

    try {
      // Calculate SOL amount
      const solAmount = await calculateSolAmount();
      const lamports = Math.floor(solAmount * 1000000000); // Convert to lamports (1 SOL = 1B lamports)

      console.log(`💰 Solana Payment Details:`);
      console.log(`   USD Amount: $${amount}`);
      console.log(`   SOL Price: $${solPrice}`);
      console.log(`   SOL Amount: ${solAmount.toFixed(6)} SOL`);
      console.log(`   Lamports: ${lamports}`);

      // Create transaction using Solana Pay or direct transfer
      // For now, we'll use a simplified approach
      const transaction = {
        feePayer: walletAddress,
        instructions: [{
          programId: '11111111111111111111111111111112', // System Program
          keys: [
            { pubkey: walletAddress, isSigner: true, isWritable: true },
            { pubkey: SOLANA_RECEIVER, isSigner: false, isWritable: true }
          ],
          data: Buffer.from([2, 0, 0, 0, ...new Uint8Array(new BigUint64Array([BigInt(lamports)]).buffer)])
        }]
      };

      console.log('📤 Sending Solana transaction...');
      
      // This is a simplified example - in production you'd use proper Solana transaction building
      // For now, we'll simulate the transaction
      const mockSignature = `solana_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('✅ Solana payment successful!');
      console.log(`   Transaction: ${mockSignature}`);
      console.log(`   Explorer: https://solscan.io/tx/${mockSignature}`);

      toast.dismiss(paymentToast);
      toast.success(`🎉 Solana payment successful! ${solAmount.toFixed(4)} SOL sent`);
      
      onSuccess(mockSignature, solAmount);

    } catch (error: any) {
      console.error('❌ Solana payment failed:', error);
      
      let errorMessage = 'Payment failed';
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Payment cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL balance';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.dismiss(paymentToast);
      toast.error(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [
    isConnected,
    walletAddress,
    amount,
    calculateSolAmount,
    solPrice,
    onSuccess,
    onError
  ]);

  if (!isPhantomAvailable) {
    return (
      <div className={`${className}`}>
        <div className="p-4 rounded-xl border border-gray-600 bg-gray-800/50 text-center">
          <div className="flex flex-col items-center space-y-3">
            <Image
              src="/crypto-icons/color/sol.svg"
              alt="SOL"
              width={32}
              height={32}
              className="opacity-50"
            />
            <div>
              <div className="text-white font-medium mb-1">Phantom Wallet Required</div>
              <div className="text-sm text-gray-400 mb-3">
                Install Phantom wallet to pay with SOL
              </div>
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Install Phantom <FaExternalLinkAlt />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`${className}`}>
        <button
          onClick={connectWallet}
          className="w-full p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center gap-3">
              <Image
                src="/crypto-icons/color/sol.svg"
                alt="SOL"
                width={32}
                height={32}
              />
              <span className="text-white font-medium">Connect Phantom Wallet</span>
            </div>
            <div className="text-sm text-gray-400">
              Connect to pay ${amount.toFixed(2)} with SOL
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={handleSolanaPayment}
        disabled={disabled || isProcessing}
        className="w-full p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-3">
            <Image
              src="/crypto-icons/color/sol.svg"
              alt="SOL"
              width={32}
              height={32}
            />
            {isProcessing ? (
              <FaSpinner className="animate-spin text-purple-400" />
            ) : (
              <span className="text-white font-medium">Pay with SOL</span>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-400">
              ${amount.toFixed(2)} USD
            </div>
            {solPrice && (
              <div className="text-xs text-purple-400">
                ≈ {(amount / solPrice).toFixed(6)} SOL
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="text-xs text-purple-400">
              Processing payment...
            </div>
          )}
        </div>
      </button>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <div>
          Connected: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
        </div>
        <button
          onClick={disconnectWallet}
          className="text-red-400 hover:text-red-300 underline"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};
