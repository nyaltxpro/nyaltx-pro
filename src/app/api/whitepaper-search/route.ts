import { whitepaperSource } from '@/lib/whitepaper-source';
import { createFromSource } from 'fumadocs-core/search/server';

export const { GET } = createFromSource(whitepaperSource, {
  language: 'english',
});
