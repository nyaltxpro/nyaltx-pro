"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Wallet types
type WalletType = {
  id: string;
  name: string;
  icon: string;
};

// Mock wallet data
const wallets: WalletType[] = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '🔗' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '🪙' },
  { id: 'trustwallet', name: 'Trust Wallet', icon: '🛡️' },
  { id: 'phantom', name: 'Phantom', icon: '👻' },
];

export default function WalletConnectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showWalletList, setShowWalletList] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen bg-[#0b1217] text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-xl font-medium">Wallet Connect</h1>
        <nav className="hidden md:flex space-x-4">
          <Link href="/" className="text-gray-400 hover:text-primary">Home</Link>
          <Link href="/pairs" className="text-gray-400 hover:text-primary">Live New Pairs</Link>
          <Link href="/multichart" className="text-gray-400 hover:text-primary">Multichart</Link>
          <Link href="/airdrops" className="text-gray-400 hover:text-primary">Airdrops</Link>
        </nav>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex">
        {/* Step indicator */}
        <div className="w-full max-w-3xl mx-auto mt-8 px-4">
          <div className="flex items-center justify-center mb-12">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[#00b8d8]' : 'bg-gray-700'}`}>
              <span className="text-sm">1</span>
            </div>
            <div className={`h-0.5 w-24 ${currentStep >= 2 ? 'bg-[#00b8d8]' : 'bg-gray-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[#00b8d8]' : 'bg-gray-700'}`}>
              <span className="text-sm">2</span>
            </div>
            <div className={`h-0.5 w-24 ${currentStep >= 3 ? 'bg-[#00b8d8]' : 'bg-gray-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-[#00b8d8]' : 'bg-gray-700'}`}>
              <span className="text-sm">3</span>
            </div>
          </div>
          
          {/* Connection steps */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Step 1 */}
            <div className="flex-1 bg-[#142028] rounded-lg p-6 border border-gray-800">
              <div className="text-center mb-4">
                <h2 className="text-lg font-medium">STEP 1</h2>
                <p className="text-sm text-gray-400">CONNECT TO A WALLET</p>
              </div>
              <p className="text-sm text-center text-gray-400 mb-6">
                To use our DEX tools, connect to your wallet by clicking the button below.
              </p>
              <div className="flex justify-center">
                <button 
                  className="bg-[#00b8d8] hover:bg-[#00a2c0] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  onClick={() => setShowWalletList(!showWalletList)}
                >
                  CONNECT WALLET
                </button>
              </div>
              
              {/* Wallet selection dropdown */}
              {showWalletList && (
                <div className="mt-4 bg-[#1a2932] border border-gray-700 rounded-md overflow-hidden animate-fadeIn">
                  {wallets.map(wallet => (
                    <button
                      key={wallet.id}
                      className="w-full text-left px-4 py-3 hover:bg-[#263440] flex items-center transition-colors duration-150"
                      onClick={() => {
                        setSelectedWallet(wallet.id);
                        setShowWalletList(false);
                        setCurrentStep(2);
                      }}
                    >
                      <span className="mr-3 text-xl">{wallet.icon}</span>
                      <span>{wallet.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Step 2 */}
            <div className="flex-1 bg-[#142028] rounded-lg p-6 border border-gray-800">
              <div className="text-center mb-4">
                <h2 className="text-lg font-medium">STEP 2</h2>
                <p className="text-sm text-gray-400">VERIFY YOUR WALLET IS CONNECTED</p>
              </div>
              <p className="text-sm text-center text-gray-400 mb-6">
                By connecting, you&apos;ll be able to use the features that require wallet access.
              </p>
              
              {selectedWallet && (
                <div className="text-center">
                  <div className="inline-block bg-[#1a2932] px-4 py-2 rounded-md mb-4">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">
                        {wallets.find(w => w.id === selectedWallet)?.icon}
                      </span>
                      <span className="font-medium">
                        {wallets.find(w => w.id === selectedWallet)?.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Wallet Connected</div>
                  </div>
                  
                  <button 
                    className="bg-[#00b8d8] hover:bg-[#00a2c0] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    onClick={() => router.push('/')}
                  >
                    CONTINUE TO DEXTOOLS
                  </button>
                </div>
              )}
            </div>
            
            {/* Step 3 */}
            {currentStep >= 2 && (
              <div className="flex-1 bg-[#142028] rounded-lg p-6 border border-gray-800">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-medium">STEP 3</h2>
                  <p className="text-sm text-gray-400">VERIFY YOUR WALLET IS REGISTERED</p>
                </div>
                <p className="text-sm text-center text-gray-400 mb-6">
                  By registering, you&apos;ll be able to access all features of our platform.
                </p>
                
                {selectedWallet && (
                  <div className="text-center">
                    <button 
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 opacity-50 cursor-not-allowed"
                      disabled
                    >
                      REGISTRATION PENDING
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
