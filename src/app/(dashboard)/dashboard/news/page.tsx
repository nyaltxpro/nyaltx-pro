import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const NewsGrid = dynamic(() => import('@/components/NewsGrid'), {
  loading: () => (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="h-64 rounded-2xl border border-gray-800/50 bg-black/40 animate-pulse"
        />
      ))}
    </div>
  ),
  ssr: false,
});

export default function NewsPage() {
  return (
    <div className="min-h-screen px-4 py-6 md:px-6 lg:px-8">
      {/* Header Section */}
      <div className="relative mb-8">
        <div className="absolute inset-0  rounded-2xl blur-xl"></div>
        <div className="relative   rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-white bg-clip-text text-transparent">
                DeFi News Hub
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-gray-400 text-sm">
                  Live updates • Sourced from The Defiant and Decrypt DeFi
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}

        </div>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16 text-gray-400">
            Loading the latest news…
          </div>
        }
      >
        <NewsGrid />
      </Suspense>
    </div>
  );
}
