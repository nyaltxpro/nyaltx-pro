import PublicHeader from '@/components/PublicHeader';
import Web3Checkout from '@/components/Web3Checkout';

export default function CheckoutPage({ 
  params, 
  searchParams 
}: { 
  params: { tier: string };
  searchParams: { method?: string };
}) {
  const { tier } = params;
  const { method } = searchParams;

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <PublicHeader />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Checkout</h1>
          <p className="text-white/70 mt-1">Selected plan: <span className="font-semibold">{tier}</span></p>
          {method && <p className="text-white/50 text-sm mt-1">Payment method: <span className="font-medium uppercase">{method}</span></p>}
        </div>

        <Web3Checkout selectedTier={tier} paymentMethod={method} />
      </main>
    </div>
  );
}