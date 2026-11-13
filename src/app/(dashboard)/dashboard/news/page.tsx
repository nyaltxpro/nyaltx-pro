import DashboardSubmitNewsButton from '@/components/NewsHub/DashboardSubmitNewsButton';
import { getNews } from '@/lib/rss';
import Link from 'next/link';

export const revalidate = 600; // Refresh news every 10 minutes

function formatDate(d?: Date | string): string {
  if (!d) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(d));
  } catch {
    return String(d);
  }
}

// Convert third-party RSS HTML into plain text
function toPlainText(html?: string): string {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function NewsPage() {
  let items = [] as Awaited<ReturnType<typeof getNews>>;
  let error: string | null = null;

  try {
    items = await getNews();
  } catch (e) {
    console.error('Error fetching news:', e);

    error =
      e instanceof Error
        ? e.message
        : 'Failed to fetch news';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4 py-6 md:px-6 lg:px-8">

      {/* ================= HEADER ================= */}
      <div className="relative mb-8">

        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00c3ff]/20 via-[#7c3aed]/20 to-[#f59e0b]/20 blur-xl"
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 rounded-2xl border border-gray-800/50 bg-black/40 backdrop-blur-md"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              NYALTX News Hub
            </h1>

            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

              <span className="text-sm text-gray-400">
                Latest blockchain, crypto and NYALTX news
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <DashboardSubmitNewsButton />
          </div>

        </div>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/50 bg-red-900/20 p-4">

          <div className="flex items-center gap-3">

            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <div>
              <h3 className="font-semibold text-red-400">
                Error Loading News
              </h3>

              <p className="text-sm text-red-300/80">
                {error}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ================= EMPTY STATE ================= */}
      {items.length === 0 && !error ? (
        <div className="py-16 text-center">

          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900">

            <svg
              className="h-8 w-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>

          </div>

          <h3 className="mb-2 text-xl font-semibold text-gray-300">
            No News Available
          </h3>

          <p className="text-gray-500">
            Please try again later. Our feeds are being updated.
          </p>

        </div>
      ) : (

        /* ================= NEWS GRID ================= */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">

          {items.map((item, index) => (

            <article
              key={item.id}
              className="group relative"
            >

              <div className="relative h-full overflow-hidden rounded-2xl border border-gray-800/50 bg-black/60 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-gray-700/50">

                {/* IMAGE */}
                {item.image ? (

                  <div className="relative h-48 overflow-hidden">

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* TRENDING */}
                    {index < 3 && (
                      <div className="absolute left-3 top-3">

                        <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#f97316] px-3 py-1 text-xs font-bold text-white">

                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                            />
                          </svg>

                          TRENDING

                        </div>
                      </div>
                    )}

                  </div>

                ) : (

                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">

                    <svg
                      className="h-12 w-12 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>

                  </div>
                )}

                {/* CONTENT */}
                <div className="flex h-[260px] flex-col p-6">

                  {/* SOURCE + DATE */}
                  <div className="mb-3 flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-2">

                      <div className="h-2 w-2 shrink-0 rounded-full bg-[#00c3ff]" />

                      <span className="truncate text-xs font-bold uppercase tracking-wider text-[#00c3ff]">
                        {item.source}
                      </span>

                    </div>

                    <span className="shrink-0 rounded-full bg-gray-800/50 px-2 py-1 text-xs text-gray-500">
                      {formatDate(item.pubDate)}
                    </span>

                  </div>

                  {/* TITLE */}
                  <Link
                    href={`/dashboard/news/${item.id}`}
                    className="mb-3 block line-clamp-2 text-lg font-bold text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-[#00c3ff] hover:to-[#7c3aed] hover:bg-clip-text hover:text-transparent"
                  >
                    {item.title}
                  </Link>

                  {/* DESCRIPTION */}
                  {item.description && (
                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-400">
                      {toPlainText(item.description)}
                    </p>
                  )}

                  {/* READ MORE */}
                  <div className="mt-auto flex items-center justify-between border-t border-gray-800/50 pt-4">

                    <Link
                      href={`/dashboard/news/${item.id}`}
                      className="flex items-center gap-2 text-xs text-gray-500 transition-colors hover:text-[#00c3ff]"
                    >

                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>

                      Read full article

                    </Link>

                    <svg
                      className="h-4 w-4 text-[#00c3ff] transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>

                  </div>

                </div>

              </div>

            </article>

          ))}

        </div>
      )}

    </div>
  );
}