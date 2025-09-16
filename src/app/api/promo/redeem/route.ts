import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { promoCode, tier, email, walletAddress } = await req.json();
    
    if (!promoCode || !tier) {
      return NextResponse.json({ 
        success: false, 
        message: "Promo code and tier are required" 
      }, { status: 400 });
    }

    // Validate promo code first - use direct validation instead of fetch to avoid URL issues
    const PROMO_CODES = {
      'FREEPRO': {
        type: 'free_subscription',
        description: 'Free NyaltxPro Membership',
        discount: 100,
        validFor: ['nyaltxpro'],
        maxUses: null,
        active: true
      },
      'FREERACE': {
        type: 'free_subscription', 
        description: 'Free Race to Liberty Access',
        discount: 100,
        validFor: ['paddle', 'motor', 'helicopter'],
        maxUses: null,
        active: true
      },
      'ADMIN2024': {
        type: 'free_subscription',
        description: 'Admin Free Access',
        discount: 100,
        validFor: ['nyaltxpro', 'paddle', 'motor', 'helicopter'],
        maxUses: null,
        active: true
      },
      'NYAX10': {
        type: 'percentage_discount',
        description: '10% Discount',
        discount: 10,
        validFor: ['nyaltxpro', 'paddle', 'motor', 'helicopter'],
        maxUses: null,
        active: true
      },
      'NYAX50': {
        type: 'percentage_discount',
        description: '50% Discount',
        discount: 50,
        validFor: ['nyaltxpro', 'paddle', 'motor', 'helicopter'],
        maxUses: null,
        active: true
      }
    };

    const code = promoCode.trim().toUpperCase();
    const promo = PROMO_CODES[code as keyof typeof PROMO_CODES];

    let validation;
    if (!promo) {
      validation = { valid: false, message: "Invalid promo code" };
    } else if (!promo.active) {
      validation = { valid: false, message: "This promo code has expired" };
    } else if (!promo.validFor.includes(tier.toLowerCase())) {
      validation = { valid: false, message: `This promo code is not valid for ${tier}` };
    } else {
      validation = { 
        valid: true,
        type: promo.type,
        discount: promo.discount,
        description: promo.description,
        isFree: promo.discount === 100
      };
    }
    
    if (!validation.valid || !validation.isFree) {
      return NextResponse.json({ 
        success: false, 
        message: validation.message || "Invalid promo code for free subscription" 
      });
    }

    // Create free subscription order
    const subscriptions = await getCollection<any>('subscription_orders');
    
    const freeSubscription = {
      id: `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'pro_subscription',
      userId: walletAddress || undefined,
      email: email || undefined,
      plan: 'pro',
      status: 'active',
      paymentMethod: 'promo',
      amount: '0.00',
      currency: 'USD',
      promoCode: promoCode.toUpperCase(),
      tier: tier.toLowerCase(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
    };

    await subscriptions.insertOne(freeSubscription);

    // If it's a race tier, also create onchain order record
    if (['paddle', 'motor', 'helicopter'].includes(tier.toLowerCase())) {
      const onchainOrders = await getCollection<any>('onchain_orders');
      
      const raceOrder = {
        id: `race_promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        method: 'PROMO' as const,
        tierId: tier.toLowerCase() as 'paddle' | 'motor' | 'helicopter',
        wallet: walletAddress || 'promo_user',
        txHash: `promo_${promoCode.toUpperCase()}_${Date.now()}`,
        amount: '0.00',
        chainId: 0, // Promo code, no actual chain
        promoCode: promoCode.toUpperCase(),
        createdAt: new Date().toISOString()
      };

      await onchainOrders.insertOne(raceOrder);
    }

    return NextResponse.json({ 
      success: true,
      message: `Free ${tier} subscription activated successfully!`,
      subscription: freeSubscription
    });

  } catch (error) {
    console.error("Promo redemption error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to redeem promo code" 
    }, { status: 500 });
  }
}
