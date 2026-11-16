import { NextResponse } from 'next/server';
import { findUsableNewsPromoCode } from '@/lib/newsPromoCodes';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const promoCode = typeof body.promoCode === 'string' ? body.promoCode.trim() : '';

    if (!promoCode) {
      return NextResponse.json({ valid: false, message: 'Enter a promo code.' }, { status: 400 });
    }

    const { promo, message } = await findUsableNewsPromoCode(promoCode);
    if (!promo) {
      return NextResponse.json({ valid: false, message }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
      message: `${promo.discountPercent}% promo discount applied.`,
    });
  } catch (error) {
    console.error('News promo validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'Unable to validate this promo code right now.' },
      { status: 500 }
    );
  }
}
