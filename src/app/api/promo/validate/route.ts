import { NextResponse } from "next/server";

// Define promo codes and their benefits
const PROMO_CODES = {
  'FREEPRO': {
    type: 'free_subscription',
    description: 'Free NyaltxPro Membership',
    discount: 100, // 100% discount
    validFor: ['nyaltxpro'],
    maxUses: null, // unlimited uses
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

export async function POST(req: Request) {
  try {
    const { promoCode, tier } = await req.json();
    
    if (!promoCode || !tier) {
      return NextResponse.json({ 
        valid: false, 
        message: "Promo code and tier are required" 
      }, { status: 400 });
    }

    const code = promoCode.trim().toUpperCase();
    const promo = PROMO_CODES[code as keyof typeof PROMO_CODES];

    if (!promo) {
      return NextResponse.json({ 
        valid: false, 
        message: "Invalid promo code" 
      });
    }

    if (!promo.active) {
      return NextResponse.json({ 
        valid: false, 
        message: "This promo code has expired" 
      });
    }

    if (!promo.validFor.includes(tier.toLowerCase())) {
      return NextResponse.json({ 
        valid: false, 
        message: `This promo code is not valid for ${tier}` 
      });
    }

    return NextResponse.json({ 
      valid: true,
      type: promo.type,
      discount: promo.discount,
      description: promo.description,
      isFree: promo.discount === 100
    });

  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json({ 
      valid: false, 
      message: "Failed to validate promo code" 
    }, { status: 500 });
  }
}
