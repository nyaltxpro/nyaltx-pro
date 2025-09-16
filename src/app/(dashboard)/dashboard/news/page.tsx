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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#1a1f2e] px-4 py-6 md:px-6 lg:px-8">
      {/* Header Section */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00c3ff]/10 via-[#7c3aed]/10 to-[#f59e0b]/10 rounded-2xl blur-xl"></div>
        <div className="relative bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00c3ff] to-[#7c3aed] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-[#00c3ff] to-[#7c3aed] bg-clip-text text-transparent">
                DeFi News Hub
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-gray-400 text-sm">Live updates • Sourced from The Defiant and Decrypt DeFi</p>
              </div>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#00c3ff] rounded-full"></div>
              <span className="text-gray-300">Updated every 10 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#7c3aed] rounded-full"></div>
              <span className="text-gray-300">{items.length} articles</span>
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No News Available</h3>
          <p className="text-gray-500">Please try again later. Our feeds are being updated.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.id} className="group relative">
              {/* Glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00c3ff]/20 via-[#7c3aed]/20 to-[#f59e0b]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              
              <div className="relative bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden hover:border-gray-700/50 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                {item.image ? (
                  <div className="relative h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.image} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Trending badge for first few items */}
                    {index < 3 && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                          TRENDING
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00c3ff] rounded-full"></div>
                      <span className="text-xs uppercase tracking-wider text-[#00c3ff] font-bold">{item.source}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
                      {formatDate(item.pubDate)}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/dashboard/news/${item.id}`} 
                    className="block text-lg font-bold text-white hover:text-transparent hover:bg-gradient-to-r hover:from-[#00c3ff] hover:to-[#7c3aed] hover:bg-clip-text transition-all duration-300 mb-3 line-clamp-2"
                  >
                    {item.title}
                  </Link>
                  
                  {item.description ? (
                    <p 
                      className="text-sm text-gray-400 line-clamp-3 leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: item.description }} 
                    />
                  ) : null}
                  
                  {/* Read more indicator */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800/50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Read full article
                    </div>
                    <svg className="w-4 h-4 text-[#00c3ff] transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
