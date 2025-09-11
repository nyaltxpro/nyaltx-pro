import PublicHeader from '@/components/PublicHeader';

export default function CheckoutPage({ params }: { params: { tier: string } }) {
  const { tier } = params;

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <PublicHeader />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          Checkout
        </h1>
        <p className="text-white/70">
          Selected plan: <span className="font-semibold">{tier}</span>
        </p>
      </main>
    </div>
  );
}