import { fetchBuzzsproutEpisodes, type PodcastRssEpisode } from '@/lib/podcastRss';
import { tinaClient } from '@/lib/tinaClient';
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
  const tinaData = await tinaClient.queries.podcast({
    relativePath: 'podcast.json',
  });

  let rssEpisodes: PodcastRssEpisode[] = [];
  let rssPodcastImage: string | null = null;

  try {
    const rssResult = await fetchBuzzsproutEpisodes();
    rssEpisodes = rssResult.episodes;
    rssPodcastImage = rssResult.podcastImage;
    console.log('RSS Episodes:', rssEpisodes);

  } catch (error) {
    console.error('Failed to fetch Buzzsprout RSS feed:', error);
  }

  return <PodcastPage tinaData={tinaData} rssEpisodes={rssEpisodes} rssPodcastImage={rssPodcastImage} />;
};

export default Podcast;
