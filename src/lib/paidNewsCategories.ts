export const PAID_NEWS_CATEGORIES = [
  'NYAX',
  'Solana',
  'Ethereum',
  'DeFi',
  'Blockchain',
  'Other',
] as const;

export type PaidNewsCategory = (typeof PAID_NEWS_CATEGORIES)[number];

export function isPaidNewsCategory(value: unknown): value is PaidNewsCategory {
  return (
    typeof value === 'string' &&
    PAID_NEWS_CATEGORIES.includes(value as PaidNewsCategory)
  );
}
