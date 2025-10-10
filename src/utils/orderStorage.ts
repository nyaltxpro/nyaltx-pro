// Utility function to store orders after successful payments

export interface OrderData {
  type: 'race_to_liberty' | 'boost_pack' | 'pro_subscription' | 'token_registration';
  paymentMethod: 'eth' | 'usdt' | 'nyax' | 'paypal' | 'stripe' | 'free_promo';
  amount: string;
  currency: 'USD' | 'ETH' | 'USDT' | 'NYAX';
  txHash?: string;
  paymentId?: string;
  chainId?: number;
  walletAddress?: string;
  email?: string;
  productName?: string;
  tier?: string;
  tokenSymbol?: string;
  tokenName?: string;
  promoCode?: string;
  promoDiscount?: number;
  originalAmount?: string;
  metadata?: Record<string, any>;
}

export const storeOrder = async (orderData: OrderData): Promise<any> => {
  try {
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderData,
        status: 'completed'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to store order');
    }

    const result = await response.json();
    console.log('✅ Order stored successfully:', result.data.id);
    return result.data;
  } catch (error) {
    console.error('❌ Failed to store order:', error);
    // Don't throw error as payment was successful
    return null;
  }
};

// Helper function for Race to Liberty orders
export const storeRaceToLibertyOrder = async (params: {
  paymentMethod: 'eth' | 'usdt' | 'nyax' | 'paypal' | 'free_promo';
  txHash?: string;
  paymentId?: string;
  amount: string;
  currency: 'USD' | 'ETH' | 'USDT' | 'NYAX';
  chainId?: number;
  walletAddress?: string;
  email?: string;
  tier: string;
  tierInfo: { name: string; multiplier: number; duration: string };
  selectedCoin?: string;
  coinName?: string;
  totalPoints: number;
  promoCode?: string;
  promoDiscount?: number;
  finalAmount: number;
  boostMultiplier?: number;
}) => {
  return storeOrder({
    type: 'race_to_liberty',
    paymentMethod: params.paymentMethod,
    amount: params.amount,
    currency: params.currency,
    txHash: params.txHash,
    paymentId: params.paymentId,
    chainId: params.chainId,
    walletAddress: params.walletAddress,
    email: params.email,
    productName: `Race to Liberty - ${params.tierInfo.name}`,
    tier: params.tier,
    tokenSymbol: params.selectedCoin,
    tokenName: params.coinName,
    promoCode: params.promoCode,
    promoDiscount: params.promoDiscount,
    originalAmount: params.promoDiscount ? (params.finalAmount / (1 - params.promoDiscount)).toFixed(2) : undefined,
    metadata: {
      tierMultiplier: params.tierInfo.multiplier,
      duration: params.tierInfo.duration,
      boostPoints: params.totalPoints,
      tokenBoostMultiplier: params.boostMultiplier
    }
  });
};
