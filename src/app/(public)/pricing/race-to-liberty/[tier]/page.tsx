'use client';

import RaceToLibertyCheckout from '@/components/RaceToLibertyCheckout';
import { use, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { RegisteredToken } from '@/types/token';

const TIER_PRICES = {
  paddle: 300,
  motor: 500,
  helicopter: 700,
};

export default function RaceToLibertyPage({ 
  params 
}: { 
  params: Promise<{ tier: 'paddle' | 'motor' | 'helicopter' }>;
}) {
  const { tier } = use(params);
  const amount = TIER_PRICES[tier] || 300;
  const { address, isConnected } = useAccount();
  const [userTokens, setUserTokens] = useState<RegisteredToken[]>([]);

  // Load user's registered tokens
  useEffect(() => {
    const loadUserTokens = async () => {
      if (!isConnected || !address) {
        setUserTokens([]);
        return;
      }

      try {
        console.log('Loading user tokens for address:', address);
        
        const response = await fetch(`/api/tokens/by-wallet?address=${encodeURIComponent(address)}`);
        const data = await response.json();
        
        if (data.success) {
          const approvedTokens = data.tokens.filter((token: RegisteredToken) => token.status === 'approved');
          console.log('Loaded approved tokens:', approvedTokens);
          setUserTokens(approvedTokens);
        } else {
          console.error('Failed to load tokens:', data.error);
          setUserTokens([]);
        }
      } catch (error) {
        console.error('Error loading user tokens:', error);
        setUserTokens([]);
      }
    };

    loadUserTokens();
  }, [address, isConnected]);

  return (
    <RaceToLibertyCheckout 
      tier={tier} 
      amount={amount}
      userTokens={userTokens}
    />
  );
}
