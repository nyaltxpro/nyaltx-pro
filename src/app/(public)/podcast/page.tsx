import { fetchBuzzsproutEpisodes, type PodcastRssEpisode } from '@/lib/podcastRss';
import { tinaClient } from '@/lib/tinaClient';
import { tinaQueryOrJson } from '@/lib/tinaQuery';
import PodcastPage from '@/page-components/PodcastPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NYALTX Podcast – Conversations with Builders & Community Voices',
  description:
    'Tune into candid conversations about project visibility, governance, marketing, and community growth across Web3. Fresh episodes from founders, marketers, and the NYALTX team.',
  openGraph: {
    title: 'NYALTX Podcast – Conversations with Builders & Community Voices',
    description:
      'Discover interviews and updates about project visibility, governance, marketing, and community growth across Web3 with NYALTX.pro.',
    type: 'website',
  },
};

const Podcast = async () => {
  const tinaData = await tinaQueryOrJson(
    () => tinaClient.queries.podcast({ relativePath: 'podcast.json' }),
    'podcast',
    ['src/content/podcast/podcast.json'],
  );

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
