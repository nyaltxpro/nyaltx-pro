import { tinaClient } from '@/lib/tinaClient';
import PodcastPage from '@/page-components/PodcastPage';

const Podcast = async () => {
  const tinaData = await tinaClient.queries.podcast({
    relativePath: 'podcast.json',
  });

  return <PodcastPage tinaData={tinaData} />;
};

export default Podcast;
