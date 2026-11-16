import { NextResponse } from 'next/server';
import { findUsablePromoCode } from '@/lib/newsPromoCodes';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const promoCode = typeof body.promoCode === 'string' ? body.promoCode.trim() : '';
    const plan = body.plan;

    if (!promoCode) {
      return NextResponse.json({ valid: false, message: 'Enter a promo code.' }, { status: 400 });
    }
    if (plan !== 'feed' && plan !== 'slider' && plan !== 'prem') {
      return NextResponse.json({ valid: false, message: 'Choose a valid news publishing package.' }, { status: 400 });
    }

    const packageId = plan === 'feed' ? 'news:feed' : 'news:slider';
    const { promo, message } = await findUsablePromoCode(promoCode, packageId);
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
