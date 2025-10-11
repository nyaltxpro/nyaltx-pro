'use client';

import React, { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import Image from 'next/image';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface SolanaPaymentButtonProps {
  amount: number; // Amount in USD
  onSuccess: (txHash: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

// Solana receiver address (replace with your actual Solana wallet)
const SOLANA_RECEIVER = process.env.NEXT_PUBLIC_SOLANA_RECEIVER_ADDRESS || 
  'YourSolanaWalletAddressHere'; // Replace with actual Solana address

export const SolanaPaymentButton: React.FC<SolanaPaymentButtonProps> = ({
  amount,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, connecting } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [solPrice, setSolPrice] = useState<number | null>(null);

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
      const fallbackPrice = 150; // Approximate SOL price
      setSolPrice(fallbackPrice);
      return fallbackPrice;
    }
  }, []);

  // Calculate SOL amount needed
  const calculateSolAmount = useCallback(async () => {
    const price = solPrice || await fetchSolPrice();
    return amount / price;
  }, [amount, solPrice, fetchSolPrice]);

  const handlePayment = useCallback(async () => {
    if (!connected || !publicKey) {
      const errorMsg = 'Please connect your Phantom wallet first';
      toast.error('❌ ' + errorMsg);
      onError(errorMsg);
      return;
    }

    if (!SOLANA_RECEIVER || SOLANA_RECEIVER === 'YourSolanaWalletAddressHere') {
      const errorMsg = 'Solana receiver address not configured';
      toast.error('❌ ' + errorMsg);
      onError(errorMsg);
      return;
    }

    setIsProcessing(true);

    // Show initial loading toast
    const loadingToast = toast.loading('🔄 Preparing Solana payment...');

    try {
      // Update toast for price fetching
      toast.dismiss(loadingToast);
      const priceToast = toast.loading('💰 Fetching SOL price...');

      // Calculate SOL amount
      const solAmount = await calculateSolAmount();
      const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

      console.log(`💰 Payment Details:`);
      console.log(`   USD Amount: $${amount}`);
      console.log(`   SOL Price: $${solPrice}`);
      console.log(`   SOL Amount: ${solAmount.toFixed(6)} SOL`);
      console.log(`   Lamports: ${lamports}`);

      // Validate amount
      if (lamports <= 0) {
        throw new Error('Invalid payment amount');
      }

      toast.dismiss(priceToast);
      toast.success(`💰 Payment: ${solAmount.toFixed(6)} SOL ($${amount})`);

      // Update toast for transaction preparation
      const txToast = toast.loading('📝 Creating Solana transaction...');

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      // Create transaction
      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      });

      // Add transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(SOLANA_RECEIVER),
        lamports,
      });

      transaction.add(transferInstruction);

      toast.dismiss(txToast);

      // Send transaction
      const sendToast = toast.loading('📤 Sending Solana transaction...');
      console.log('📤 Sending Solana transaction...');
      
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      toast.dismiss(sendToast);

      // Wait for confirmation
      const confirmToast = toast.loading('⏳ Confirming transaction on Solana...');
      console.log('⏳ Confirming transaction...');
      
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      toast.dismiss(confirmToast);

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      console.log('✅ Solana payment successful!');
      console.log(`   Transaction: ${signature}`);
      console.log(`   Explorer: https://solscan.io/tx/${signature}`);

      toast.success('🎉 Solana payment successful!');
      toast.success(`🔗 Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}`, {
        duration: 4000,
        style: {
          background: '#065f46',
          color: '#d1fae5',
          border: '1px solid #10b981',
        }
      });

      onSuccess(signature);

    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('❌ Solana payment failed:', error);
      
      let errorMessage = 'Payment failed';
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Payment cancelled by user';
        toast.error('⚠️ Payment cancelled by user');
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL balance';
        toast.error('❌ Insufficient SOL balance');
      } else if (error.message) {
        errorMessage = error.message;
        toast.error('❌ ' + errorMessage);
      } else {
        toast.error('❌ Solana payment failed');
      }
      
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [
    connected,
    publicKey,
    connection,
    sendTransaction,
    amount,
    calculateSolAmount,
    solPrice,
    onSuccess,
    onError
  ]);

  // Load SOL price on mount
  React.useEffect(() => {
    fetchSolPrice();
  }, [fetchSolPrice]);

  if (!connected) {
    return (
      <div className={`${className}`}>
        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-500 !rounded-xl !h-auto !py-3 !px-4 !text-white !font-medium" />
        <p className="text-sm text-gray-400 mt-2 text-center">
          Connect Phantom wallet to pay with SOL
        </p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={handlePayment}
        disabled={disabled || isProcessing || connecting}
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

      {connected && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          Connected: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
        </div>
      )}
    </div>
  );
};
