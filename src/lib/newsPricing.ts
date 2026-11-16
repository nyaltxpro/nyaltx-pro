export const NEWS_NYAX_DISCOUNT = 0.2;

export function calculateNewsPrice(
  basePrice: number,
  promoDiscountPercent = 0,
  payWithNyax = false
) {
  const promoPrice = basePrice * (1 - promoDiscountPercent / 100);
  const discountedPrice = payWithNyax
    ? promoPrice * (1 - NEWS_NYAX_DISCOUNT)
    : promoPrice;

  return Math.round((discountedPrice + Number.EPSILON) * 100) / 100;
}
