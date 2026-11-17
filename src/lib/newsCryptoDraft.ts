export const NEWS_PAYPAL_CRYPTO_DRAFT_KEY = 'nyaltx_news_paypal_crypto_draft';

export interface NewsPayPalCryptoDraft {
  subType: 'news' | 'pr';
  plan: string;
  headline: string;
  category: string;
  sourceLink: string;
  summary: string;
  storyBody: string;
  userEmail: string;
  uploadedImg: string | null;
  promoCode: string | null;
  promoDiscountPercent: number;
  paymentId?: string;
}
