import { getCollection } from '@/lib/mongodb';
import type { PromoPackageId } from '@/lib/promoPackages';

export { PROMO_PACKAGE_OPTIONS, type PromoPackageId } from '@/lib/promoPackages';

export interface NewsPromoCode {
  code: string;
  discountPercent: number;
  packageIds?: PromoPackageId[];
  active: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const LEGACY_NEWS_PACKAGE_IDS: PromoPackageId[] = ['news:feed', 'news:slider'];

export async function findUsablePromoCode(code: string, packageId: PromoPackageId) {
  const normalizedCode = code.trim().toUpperCase();
  const promoCodes = await getCollection<NewsPromoCode>('news_promo_codes');
  const promo = await promoCodes.findOne({ code: normalizedCode });

  if (!promo) {
    return { promo: null, message: 'Invalid promo code.', found: false };
  }
  if (!promo.active) {
    return { promo: null, message: 'This promo code is inactive.', found: true };
  }
  if (promo.expiresAt && promo.expiresAt.getTime() <= Date.now()) {
    return { promo: null, message: 'This promo code has expired.', found: true };
  }
  const packageIds = promo.packageIds ?? LEGACY_NEWS_PACKAGE_IDS;
  if (!packageIds.includes(packageId)) {
    return { promo: null, message: 'This promo code is not valid for this package.', found: true };
  }

  return { promo, message: null, found: true };
}
