"use client";

import { useRouter } from 'next/navigation';

interface ConnectWalletButtonProps {
  className?: string;
}

export default function ConnectWalletButton({ className = "" }: ConnectWalletButtonProps) {
  const router = useRouter();
  
  return (
    <button 
      className={`py-1 px-4 rounded-full bg-primary text-white font-medium hover:bg-opacity-90 transition-colors duration-200 ${className}`}
      onClick={() => router.push('/connect')}
    >
      Connect
    </button>
  );
}
