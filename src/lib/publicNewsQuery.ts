export const PUBLIC_NEWS_FILTER = {
  status: 'published',
  isPendingReview: { $ne: true },
  plan: { $ne: 'test' },
};
