'use client';

import RaceToLibertyCheckout from '@/components/RaceToLibertyCheckout';
import { useRouter } from 'next/navigation';
import { use } from 'react';

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
  const router = useRouter();

  const handleBack = () => {
    router.push('/pricing');
  };

  return (
    <RaceToLibertyCheckout 
      tier={tier} 
      amount={amount}
      onBack={handleBack}
    />
  );
}
