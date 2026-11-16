import { getCollection } from '@/lib/mongodb';

export interface NewsPromoCode {
  code: string;
  discountPercent: number;
  active: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function findUsableNewsPromoCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();
  const promoCodes = await getCollection<NewsPromoCode>('news_promo_codes');
  const promo = await promoCodes.findOne({ code: normalizedCode });

  if (!promo) {
    return { promo: null, message: 'Invalid promo code.' };
  }
  if (!promo.active) {
    return { promo: null, message: 'This promo code is inactive.' };
  }
  if (promo.expiresAt && promo.expiresAt.getTime() <= Date.now()) {
    return { promo: null, message: 'This promo code has expired.' };
  }

  return { promo, message: null };
}
