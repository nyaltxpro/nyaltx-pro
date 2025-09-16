import React from "react";
import Link from "next/link";
import { getNews } from "@/lib/rss";

export const revalidate = 600; // Revalidate every 10 minutes

function formatDate(d?: Date): string {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

export default async function NewsPage() {
  let items = [] as Awaited<ReturnType<typeof getNews>>;
  try {
    items = await getNews(revalidate);
  } catch (e) {
    // Leave items empty
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Latest DeFi News</h1>
      <p className="text-gray-400 mb-6">Sourced from The Defiant and Decrypt DeFi. Updated every 10 minutes.</p>

      {items.length === 0 ? (
        <div className="text-gray-400">No news available right now. Please try again later.</div>
      ) : (
        <ul className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="bg-[#0f1923] border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className="w-full h-48 object-cover" />
              ) : null}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-[#00b8d8] font-semibold">{item.source}</span>
                  <span className="text-xs text-gray-500">{formatDate(item.pubDate)}</span>
                </div>
                <Link href={`/dashboard/news/${item.id}`} className="block text-lg font-semibold text-white hover:text-[#00b8d8] transition-colors">
                  {item.title}
                </Link>
                {item.description ? (
                  <p className="mt-2 text-sm text-gray-300 line-clamp-3" dangerouslySetInnerHTML={{ __html: item.description }} />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
