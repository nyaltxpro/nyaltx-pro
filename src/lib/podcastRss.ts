import { JSDOM } from 'jsdom';

export interface PodcastRssEpisode {
  title: string | null;
  description: string | null;
  publishedAt: string | null;
  link: string | null;
  audioUrl: string | null;
  duration: string | null;
  image: string | null;
}

export interface PodcastRssResult {
  episodes: PodcastRssEpisode[];
  podcastImage: string | null;
}

const BUZZSPROUT_FEED_URL = 'https://feeds.buzzsprout.com/2298456.rss';

export const fetchBuzzsproutEpisodes = async (): Promise<PodcastRssResult> => {
  const response = await fetch(BUZZSPROUT_FEED_URL, {
    headers: {
      'User-Agent': 'NYALTX-Podcast-Fetcher/1.0',
      Accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
    },
    next: {
      revalidate: 1800,
    },
  });

  if (!response.ok) {
    throw new Error(`Buzzsprout RSS request failed with status ${response.status}`);
  }

  const xml = await response.text();
  const dom = new JSDOM(xml, { contentType: 'text/xml' });
  const document = dom.window.document;

  const channelImage = document.querySelector('channel > image > url')?.textContent?.trim() ?? null;
  const itunesImage = document.querySelector('itunes\\:image')?.getAttribute('href')?.trim() ?? null;
  const podcastImage = channelImage || itunesImage || null;

  const items = Array.from(document.querySelectorAll('item')) as Element[];

  const episodes: PodcastRssEpisode[] = items.map(item => {
    const enclosure = item.querySelector('enclosure');
    const mediaContent = item.querySelector('media\\:content');

    return {
      title: item.querySelector('title')?.textContent?.trim() ?? null,
      description: item.querySelector('description')?.textContent?.trim() ?? null,
      publishedAt: item.querySelector('pubDate')?.textContent?.trim() ?? null,
      link: item.querySelector('link')?.textContent?.trim() ?? enclosure?.getAttribute('url')?.trim() ?? null,
      audioUrl: enclosure?.getAttribute('url')?.trim() ?? mediaContent?.getAttribute('url')?.trim() ?? null,
      duration: item.querySelector('itunes\\:duration')?.textContent?.trim() ?? null,
      image:
        item.querySelector('itunes\\:image')?.getAttribute('href')?.trim() ??
        item.querySelector('media\\:thumbnail')?.getAttribute('url')?.trim() ??
        podcastImage,
    };
  });

  return {
    episodes,
    podcastImage,
  };
};
