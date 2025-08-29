"use client";

import { useRouter } from 'next/navigation';
// Import web3modal initialization first
import '../lib/web3modal';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

import { useAppKit } from "@reown/appkit/react";

interface ConnectWalletButtonProps {
  className?: string;
  onConnect?: () => void;
}

export default function ConnectWalletButton({ className = "", onConnect }: ConnectWalletButtonProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { open, close } = useAppKit();
  const [displayAddress, setDisplayAddress] = useState<string>('');
  
  useEffect(() => {
    if (address) {
      setDisplayAddress(`${address.slice(0, 6)}...${address.slice(-4)}`);
    }
  }, [address]);

  const handleClick = () => {
    if (onConnect) {
      onConnect();
    } else if (isConnected) {
      open({ view: 'Account' });
    } else {
      open();
    }
  };

  return (
    <button 
      className={`py-1 px-4 rounded-full bg-primary bg-[#00b8d8] text-white font-bold hover:bg-opacity-90 transition-colors duration-200  text-sm tracking-wide ${className}`}
      onClick={handleClick}
    >
      {isConnected ? displayAddress : 'Connect'}
    </button>
  );
}
