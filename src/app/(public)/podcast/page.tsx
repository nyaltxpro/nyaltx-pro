import { fetchBuzzsproutEpisodes, type PodcastRssEpisode } from '@/lib/podcastRss';
import PodcastPage from '@/page-components/PodcastPage';
import { tinaClient } from '@/lib/tinaClient';

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
  } catch (error) {
    console.error('Failed to fetch Buzzsprout RSS feed:', error);
  }

  return <PodcastPage tinaData={tinaData} rssEpisodes={rssEpisodes} rssPodcastImage={rssPodcastImage} />;
};

export default Podcast;
