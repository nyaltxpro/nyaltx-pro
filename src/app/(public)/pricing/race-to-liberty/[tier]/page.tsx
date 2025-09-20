import RaceToLibertyCheckout from '@/components/RaceToLibertyCheckout';

const TIER_PRICES = {
  paddle: 300,
  motor: 500,
  helicopter: 700,
};

export default function RaceToLibertyPage({ 
  params 
}: { 
  params: { tier: 'paddle' | 'motor' | 'helicopter' };
}) {
  const { tier } = params;
  const amount = TIER_PRICES[tier] || 300;

  return (
    <RaceToLibertyCheckout 
      tier={tier} 
      amount={amount}
      onBack={() => window.history.back()}
    />
  );
}
