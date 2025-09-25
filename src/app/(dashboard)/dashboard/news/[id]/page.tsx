import React from "react";
import Link from "next/link";
import { getNews, parseItemId } from "@/lib/rss";

export const revalidate = 600;

function formatDate(d?: Date): string {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return d.toISOString();
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let items: Awaited<ReturnType<typeof getNews>> = [];
  try {
    items = await getNews(revalidate);
  } catch {}

  const item = items.find((it) => it.id === id);
  const decoded = !item ? parseItemId(id) : null;

  if (!item && !decoded) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="text-gray-300">News item not found.</div>
        <div className="mt-4">
          <Link href="/dashboard/news" className="text-[#00b8d8] hover:underline">← Back to News</Link>
        </div>
      </div>
    );
  }

  // Fallback rendering when item missing but ID decodes (link/title available)
  const title = item?.title || decoded?.title || "News";
  const link = item?.link || decoded?.link || "";
  const src = item?.source || (decoded?.source as any) || "";
  const date = item?.pubDate;

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-4">
        <Link href="/dashboard/news" className="text-[#00b8d8] hover:underline">← Back to News</Link>
      </div>

      <div className="mb-2 flex items-center gap-3">
        {src ? <span className="text-xs uppercase tracking-wide text-[#00b8d8] font-semibold">{src}</span> : null}
        {date ? <span className="text-xs text-gray-500">{formatDate(date)}</span> : null}
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{title}</h1>

      {item?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt="" className="w-full max-h-[380px] object-cover rounded-lg border border-gray-800 mb-4" />
      ) : null}

      {item?.description ? (
        <div className="prose prose-invert max-w-none text-gray-200" dangerouslySetInnerHTML={{ __html: item.description }} />
      ) : (
        <p className="text-gray-300">Open the original article below to read more.</p>
      )}

      {link ? (
        <div className="mt-6">
          <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 rounded-md border border-gray-700 text-white hover:bg-[#1a2932]">
            Read on original site
          </a>
        </div>
      ) : null}
    </div>
  );
}
