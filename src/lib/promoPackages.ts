export const PROMO_PACKAGE_OPTIONS = [
  { id: 'news:feed', category: 'News Publishing', label: 'News Publishing ($99)' },
  { id: 'news:slider', category: 'News Publishing', label: 'News Publishing & Distribution ($199)' },
  { id: 'pricing:nyaltxpro', category: 'Pricing', label: 'NyaltxPro Membership' },
  { id: 'pricing:nyaltxpro1', category: 'Pricing', label: 'NyaltxPro Starter ($1)' },
  { id: 'pricing:paddle', category: 'Pricing', label: 'Race to Liberty — Paddle Boat' },
  { id: 'pricing:motor', category: 'Pricing', label: 'Race to Liberty — Motor Boat' },
  { id: 'pricing:helicopter', category: 'Pricing', label: 'Race to Liberty — Helicopter' },
] as const;

export type PromoPackageId = (typeof PROMO_PACKAGE_OPTIONS)[number]['id'];
