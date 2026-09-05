'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface ConnectWalletButtonProps {
  className?: string;
  onConnect?: () => void;
}

export default function ConnectWalletButton({
  className = '',
  onConnect,
}: ConnectWalletButtonProps) {
  const { address: appKitAddress, isConnected: isAppKitConnected } = useAppKitAccount();
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { open } = useAppKit();

  const address = wagmiAddress || appKitAddress || '';
  const isConnected = Boolean((isWagmiConnected || isAppKitConnected) && address);
  const [displayAddress, setDisplayAddress] = useState('');
  const didToastRef = useRef<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
      setDisplayAddress(short);

      if (didToastRef.current !== address) {
        didToastRef.current = address;
        toast.success(`🔗 Wallet connected: ${short}`);
        onConnect?.();
      }
    } else {
      setDisplayAddress('');
      didToastRef.current = null;
    }
  }, [isConnected, address, onConnect]);

  const handleClick = () => {
    if (isConnected) {
      open({ view: 'Account' });
      return;
    }
    open({ view: 'Connect' });
  };

  return (
    <button
      className={`py-1 px-4 rounded-full bg-primary bg-[#00b8d8] text-white font-medium hover:bg-opacity-90 transition-colors duration-200 text-sm tracking-wide ${className}`}
      onClick={handleClick}
      type="button"
    >
      {isConnected ? displayAddress || 'Connected' : 'Connect'}
    </button>
  );
}
