import { fetchBuzzsproutEpisodes, type PodcastRssEpisode } from '@/lib/podcastRss';
import { asTinaPageProps, loadJson } from '@/lib/loadTinaContent';
import PodcastPage from '@/page-components/PodcastPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: { absolute: 'NYALTX Podcast: Crypto, DeFi and Capital Markets' },
  description:
    'Listen to conversations on tokenization, digital assets, and the future of markets with NYALTX guests and founders.',
  alternates: {
    canonical: 'https://www.nyaltx.pro/podcast',
  },
  openGraph: {
    title: 'NYALTX Podcast: Crypto, DeFi and Capital Markets',
    description:
      'Listen to conversations on tokenization, digital assets, and the future of markets with NYALTX guests and founders.',
    url: 'https://www.nyaltx.pro/podcast',
    siteName: 'NYALTX',
    type: 'website',
  },
};

const Podcast = async () => {
  let tinaData: any;
  try {
    const data = await loadJson('src/content/podcast/podcast.json');
    tinaData = asTinaPageProps('podcast', data);
  } catch {
    tinaData = asTinaPageProps('podcast', { episodes: [], cta: {} });
  }

  let rssEpisodes: PodcastRssEpisode[] = [];
  let rssPodcastImage: string | null = null;

  try {
    const rssResult = await fetchBuzzsproutEpisodes();
    rssEpisodes = rssResult.episodes;
    rssPodcastImage = rssResult.podcastImage;
  } catch (error) {
    console.error('Failed to fetch Buzzsprout RSS feed:', error);
  }

  return (
    <PodcastPage
      tinaData={tinaData as any}
      rssEpisodes={rssEpisodes}
      rssPodcastImage={rssPodcastImage}
    />
  );
};

export default Podcast;
