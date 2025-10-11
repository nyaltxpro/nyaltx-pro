import { useState, useEffect, useCallback } from 'react';

interface PhantomWallet {
  isPhantom: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  publicKey: { toString: () => string } | null;
  isConnected: boolean;
}

interface PhantomProvider {
  solana?: PhantomWallet;
}

declare global {
  interface Window {
    phantom?: PhantomProvider;
    solana?: PhantomWallet;
  }
}

export interface UsePhantomWalletReturn {
  phantom: PhantomWallet | null;
  isPhantomInstalled: boolean;
  isConnected: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  connecting: boolean;
  error: string | null;
}

export const usePhantomWallet = (): UsePhantomWalletReturn => {
  const [phantom, setPhantom] = useState<PhantomWallet | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Phantom is installed
  const isPhantomInstalled = phantom !== null;

  // Initialize Phantom wallet
  useEffect(() => {
    const getPhantom = () => {
      if (typeof window !== 'undefined') {
        // Check for Phantom in window.phantom.solana or window.solana
        const phantomWallet = window.phantom?.solana || window.solana;
        
        if (phantomWallet?.isPhantom) {
          setPhantom(phantomWallet);
          
          // Check if already connected
          if (phantomWallet.isConnected && phantomWallet.publicKey) {
            setIsConnected(true);
            setPublicKey(phantomWallet.publicKey.toString());
          }
        }
      }
    };

    // Try to get Phantom immediately
    getPhantom();

    // If not found, wait a bit for the extension to load
    const timer = setTimeout(getPhantom, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Connect to Phantom wallet
  const connect = useCallback(async () => {
    if (!phantom) {
      setError('Phantom wallet not found. Please install Phantom extension.');
      return;
    }

    try {
      setConnecting(true);
      setError(null);

      const response = await phantom.connect();
      
      if (response.publicKey) {
        const pubKey = response.publicKey.toString();
        setPublicKey(pubKey);
        setIsConnected(true);
        console.log('🟣 Phantom wallet connected:', pubKey);
      }
    } catch (err: any) {
      console.error('❌ Phantom connection error:', err);
      
      if (err.code === 4001) {
        setError('Connection rejected by user');
      } else if (err.code === -32002) {
        setError('Connection request already pending');
      } else {
        setError('Failed to connect to Phantom wallet');
      }
    } finally {
      setConnecting(false);
    }
  }, [phantom]);

  // Disconnect from Phantom wallet
  const disconnect = useCallback(async () => {
    if (!phantom) return;

    try {
      await phantom.disconnect();
      setIsConnected(false);
      setPublicKey(null);
      setError(null);
      console.log('🟣 Phantom wallet disconnected');
    } catch (err) {
      console.error('❌ Phantom disconnect error:', err);
      setError('Failed to disconnect from Phantom wallet');
    }
  }, [phantom]);

  // Listen for account changes
  useEffect(() => {
    if (!phantom) return;

    const handleAccountChange = (publicKey: { toString: () => string } | null) => {
      if (publicKey) {
        setPublicKey(publicKey.toString());
        setIsConnected(true);
      } else {
        setPublicKey(null);
        setIsConnected(false);
      }
    };

    // Note: Phantom doesn't have a standard event listener like MetaMask
    // We'll check connection status periodically
    const checkConnection = () => {
      if (phantom.isConnected && phantom.publicKey) {
        const currentKey = phantom.publicKey.toString();
        if (currentKey !== publicKey) {
          setPublicKey(currentKey);
          setIsConnected(true);
        }
      } else if (isConnected) {
        setPublicKey(null);
        setIsConnected(false);
      }
    };

    const interval = setInterval(checkConnection, 2000);
    return () => clearInterval(interval);
  }, [phantom, publicKey, isConnected]);

  return {
    phantom,
    isPhantomInstalled,
    isConnected,
    publicKey,
    connect,
    disconnect,
    connecting,
    error,
  };
};
