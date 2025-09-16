import { JSDOM } from "jsdom";

export type NewsSource = "The Defiant" | "Decrypt DeFi";

export interface RssItem {
  id: string;
  title: string;
  link: string;
  pubDate?: Date;
  description?: string;
  image?: string;
  source: NewsSource;
}

export const FEEDS: { name: NewsSource; url: string }[] = [
  { name: "The Defiant", url: "https://thedefiant.io/feed/" },
  { name: "Decrypt DeFi", url: "https://decrypt.co/feed/category/defi" },
];

export async function fetchRss(url: string, revalidate?: number): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "NYALTXBot/1.0 (+https://nyaltx.pro)",
      Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    next: revalidate ? { revalidate } : undefined,
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch RSS: ${url} ${res.status}`);
  }
  return await res.text();
}

function textContent(node: Element | null): string | undefined {
  if (!node) return undefined;
  return node.textContent?.trim() || undefined;
}

function getAttr(el: Element | null, name: string): string | undefined {
  if (!el) return undefined;
  const val = el.getAttribute(name);
  return val ?? undefined;
}

function parseDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d;
}

export function makeItemId(source: NewsSource, title: string, link: string, pubDate?: Date | number): string {
  const base = `${source}\u0001${title}\u0001${link}\u0001${pubDate ? (pubDate instanceof Date ? pubDate.toISOString() : String(pubDate)) : ''}`;
  const b64 = Buffer.from(base).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function parseItemId(id: string): { source: string; title: string; link: string; dateIso: string } | null {
  try {
    const pad = id.length % 4 === 0 ? '' : '='.repeat(4 - (id.length % 4));
    const b64 = id.replace(/-/g, '+').replace(/_/g, '/') + pad;
    const raw = Buffer.from(b64, 'base64').toString('utf8');
    const [source, title, link, dateIso] = raw.split('\u0001');
    return { source, title, link, dateIso };
  } catch {
    return null;
  }
}

export function parseRss(xml: string, source: NewsSource): RssItem[] {
  const dom = new JSDOM(xml, { contentType: "text/xml" });
  const doc = dom.window.document;

  const items = Array.from(doc.querySelectorAll("channel > item")) as Element[];
  const entries = items.length ? [] : (Array.from(doc.querySelectorAll("feed > entry")) as Element[]);

  const list: Element[] = items.length ? items : entries;
  const results: RssItem[] = list.map((el: Element, idx: number) => {
    const title = textContent(el.querySelector("title")) || "Untitled";
    const link =
      getAttr(el.querySelector("link"), "href") ||
      textContent(el.querySelector("link")) ||
      "";
    const pubDateText =
      textContent(el.querySelector("pubDate")) ||
      textContent(el.querySelector("updated")) ||
      textContent(el.querySelector("published"));

    const description =
      textContent(el.querySelector("content\\:encoded")) ||
      textContent(el.querySelector("description")) ||
      textContent(el.querySelector("summary"));

    let image: string | undefined =
      getAttr(el.querySelector("media\\:content"), "url") ||
      getAttr(el.querySelector("enclosure"), "url");

    if (!image && description) {
      try {
        const frag = JSDOM.fragment(description);
        const img = frag.querySelector("img");
        image = img?.getAttribute("src") || undefined;
      } catch {}
    }

    const pubDate = parseDate(pubDateText);
    const id = makeItemId(source, title, link || String(idx), pubDate || idx);

    return { id, title, link, pubDate, description, image, source };
  });

  return results;
}

export async function getNews(revalidate?: number): Promise<RssItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const xml = await fetchRss(f.url, revalidate);
      return parseRss(xml, f.name);
    })
  );

  const items: RssItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
  }

  items.sort((a, b) => {
    const at = a.pubDate?.getTime() || 0;
    const bt = b.pubDate?.getTime() || 0;
    return bt - at;
  });

  return items.slice(0, 100);
}
