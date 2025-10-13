import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import { FaTags, FaArrowLeft } from 'react-icons/fa';

export default function NewsNotFound() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />
      
      <div className="relative">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute top-40 right-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-6 py-20">
          {/* Back to News */}
          <div className="mb-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to News
            </Link>
          </div>

          {/* 404 Content */}
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTags className="w-12 h-12 text-gray-400" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 mb-4">
              Article Not Found
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              The news article you're looking for doesn't exist or may have been moved.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-200"
              >
                <FaTags className="w-4 h-4" />
                Browse All News
              </Link>
              
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 font-medium rounded-lg transition-all duration-200"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
