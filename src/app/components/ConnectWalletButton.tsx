"use client";

import { useRouter } from 'next/navigation';

interface ConnectWalletButtonProps {
  className?: string;
  onConnect?: () => void;
}

export default function ConnectWalletButton({ className = "", onConnect }: ConnectWalletButtonProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (onConnect) {
      onConnect();
    } else {
      router.push('/connect');
    }
  };

  return (
    <button 
      className={`py-1 px-4 rounded-full bg-primary text-white font-medium hover:bg-opacity-90 transition-colors duration-200 ${className}`}
      onClick={handleClick}
    >
      Connect
    </button>
  );
}
