'use client';

import React, { useState, useEffect } from 'react';
import { FaExternalLinkAlt, FaCheck, FaClock, FaTimes } from 'react-icons/fa';

interface Transaction {
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  type: 'token_creation';
  tokenName?: string;
  tokenSymbol?: string;
  mint?: string;
}

interface TransactionMonitorProps {
  signature?: string;
  onStatusChange?: (status: 'pending' | 'confirmed' | 'failed') => void;
}

export default function TransactionMonitor({ signature, onStatusChange }: TransactionMonitorProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (signature) {
      addTransaction({
        signature,
        status: 'pending',
        timestamp: Date.now(),
        type: 'token_creation'
      });
    }
  }, [signature]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev.slice(0, 9)]); // Keep last 10 transactions
    monitorTransaction(transaction.signature);
  };

  const monitorTransaction = async (txSignature: string) => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    let attempts = 0;
    const maxAttempts = 30; // Monitor for ~2 minutes (30 * 4s intervals)

    const checkStatus = async () => {
      try {
        // In production, you would check the actual Solana transaction status
        // For demo purposes, we'll simulate the status check
        const response = await fetch(`/api/transactions/status?signature=${txSignature}`);
        
        if (response.ok) {
          const data = await response.json();
          updateTransactionStatus(txSignature, data.status);
          
          if (data.status === 'confirmed' || data.status === 'failed') {
            setIsMonitoring(false);
            onStatusChange?.(data.status);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 4000); // Check every 4 seconds
      } else {
        // Timeout - assume failed
        updateTransactionStatus(txSignature, 'failed');
        setIsMonitoring(false);
        onStatusChange?.('failed');
      }
    };

    // Start monitoring after a short delay
    setTimeout(checkStatus, 2000);
  };

  const updateTransactionStatus = (signature: string, status: 'pending' | 'confirmed' | 'failed') => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.signature === signature 
          ? { ...tx, status }
          : tx
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <FaCheck className="text-green-400" />;
      case 'failed':
        return <FaTimes className="text-red-400" />;
      default:
        return <FaClock className="text-yellow-400 animate-pulse" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const truncateSignature = (sig: string) => {
    return `${sig.slice(0, 8)}...${sig.slice(-8)}`;
  };

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
        <FaClock />
        <span>Transaction Monitor</span>
      </h3>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {transactions.map((tx) => (
          <div
            key={tx.signature}
            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-600"
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(tx.status)}
              <div>
                <div className="text-sm font-medium text-white">
                  {tx.tokenName ? `${tx.tokenName} (${tx.tokenSymbol})` : 'Token Creation'}
                </div>
                <div className="text-xs text-gray-400">
                  {truncateSignature(tx.signature)} • {formatTime(tx.timestamp)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded ${
                tx.status === 'confirmed' ? 'bg-green-900 text-green-300' :
                tx.status === 'failed' ? 'bg-red-900 text-red-300' :
                'bg-yellow-900 text-yellow-300'
              }`}>
                {getStatusText(tx.status)}
              </span>
              
              <a
                href={`https://solscan.io/tx/${tx.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
                title="View on Solscan"
              >
                <FaExternalLinkAlt />
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {isMonitoring && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span>Monitoring transaction...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook to use transaction monitoring
export function useTransactionMonitor() {
  const [currentTransaction, setCurrentTransaction] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed' | null>(null);

  const startMonitoring = (signature: string) => {
    setCurrentTransaction(signature);
    setStatus('pending');
  };

  const stopMonitoring = () => {
    setCurrentTransaction(null);
    setStatus(null);
  };

  return {
    currentTransaction,
    status,
    startMonitoring,
    stopMonitoring,
    setStatus
  };
}
