import { fetchBuzzsproutEpisodes, type PodcastRssEpisode } from '@/lib/podcastRss';
import { tinaClient } from '@/lib/tinaClient';
import PodcastPage from '@/page-components/PodcastPage';

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
