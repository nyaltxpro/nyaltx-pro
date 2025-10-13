import { Metadata } from 'next';
import PublicHeader from '@/components/PublicHeader';
import NewsGrid from '../../../components/NewsGrid';

export const metadata: Metadata = {
  title: 'NYALTX News - Latest Updates & Announcements',
  description: 'Stay updated with the latest news, announcements, and developments from NYALTX. Get insights into our platform updates, partnerships, and industry trends.',
  keywords: 'NYALTX news, crypto news, blockchain updates, platform announcements, partnerships',
  openGraph: {
    title: 'NYALTX News - Latest Updates & Announcements',
    description: 'Stay updated with the latest news and announcements from NYALTX',
    type: 'website',
  },
};

export const revalidate = 300; // Revalidate every 5 minutes

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute top-40 right-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_95%,rgba(255,255,255,0.04)_95%,rgba(255,255,255,0.04)_100%),linear-gradient(to_bottom,transparent_0,transparent_95%,rgba(255,255,255,0.04)_95%,rgba(255,255,255,0.04)_100%)] bg-[length:22px_22px] opacity-30" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 mb-6">
              NYALTX News
            </h1>
            <p className="text-xl text-gray-300/90 max-w-3xl mx-auto mb-8">
              Stay informed with the latest updates, announcements, and insights from the NYALTX ecosystem. 
              Discover new features, partnerships, and industry developments.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center items-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Latest Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Platform News</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Industry Insights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Content */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <NewsGrid />
      </section>

      {/* Newsletter Signup */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Get the latest NYALTX news and updates delivered directly to your inbox. 
            Be the first to know about new features, partnerships, and opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
