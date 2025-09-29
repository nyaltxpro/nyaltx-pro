'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiExternalLink, FiCalendar, FiTag } from 'react-icons/fi';
import { BannerItem } from '@/components/Ads';

// Banner items data (same as in Ads component)
const bannerItems: BannerItem[] = [
  { 
    id: 1, 
    title: "NYALTX x Nibiru Chain AMA", 
    subtitle: "Join Us Here!",
    image: "/banner/1.png",
    description: "Exclusive AMA session with Nibiru Chain discussing the future of DeFi and cross-chain interoperability.",
    fullDescription: "Join us for an exclusive Ask Me Anything session with the Nibiru Chain team. We'll be discussing the latest developments in DeFi, cross-chain interoperability, and how NYALTX is partnering with Nibiru to bring innovative solutions to the crypto space. This is your chance to ask questions directly to the team and learn about upcoming features, partnerships, and the roadmap ahead. Don't miss this opportunity to be part of the conversation shaping the future of decentralized finance.",
    category: "AMA",
    date: "2024-01-15",
    link: "https://twitter.com/spaces/nyaltx-nibiru-ama",
    tags: ["AMA", "Nibiru Chain", "DeFi", "Partnership"]
  },
  { 
    id: 2, 
    title: "NYALTX API V2", 
    subtitle: "Powering The Future Of DeFi",
    image: "/banner/2.png",
    description: "Revolutionary API V2 launch with enhanced performance, new endpoints, and advanced trading features.",
    fullDescription: "NYALTX API V2 represents a major leap forward in DeFi infrastructure. Our new API offers lightning-fast response times, comprehensive market data, advanced trading algorithms, and seamless integration capabilities. With over 50 new endpoints, real-time WebSocket connections, and enterprise-grade security, API V2 is designed to power the next generation of DeFi applications. Whether you're building trading bots, portfolio trackers, or DeFi protocols, our API provides the robust foundation you need.",
    category: "Product Launch",
    date: "2024-01-10",
    link: "https://docs.nyaltx.com/api/v2",
    tags: ["API", "V2", "DeFi", "Infrastructure", "Trading"]
  },
  { 
    id: 3, 
    title: "NYALTX Meme Board", 
    subtitle: "Discover Hottest Meme Tokens",
    image: "/banner/3.png",
    description: "Interactive meme token discovery platform with real-time trending analysis and community voting.",
    fullDescription: "The NYALTX Meme Board is your ultimate destination for discovering the hottest meme tokens in the crypto space. Our platform features real-time trending analysis, community-driven voting, and advanced filtering options to help you find the next big meme coin before it explodes. With integrated social sentiment analysis, price alerts, and direct trading capabilities, the Meme Board combines entertainment with serious trading tools. Join thousands of users who are already using our platform to stay ahead of meme token trends.",
    category: "Platform Feature",
    date: "2024-01-08",
    link: "/meme-board",
    tags: ["Meme Tokens", "Community", "Trending", "Discovery"]
  },
  { 
    id: 4, 
    title: "Follow Us On TikTok!", 
    subtitle: "Official NYALTX Account",
    image: "/banner/4.png",
    description: "Get the latest crypto insights, market analysis, and NYALTX updates through engaging TikTok content.",
    fullDescription: "Stay connected with NYALTX on TikTok for the most engaging crypto content! Our official TikTok account brings you daily market insights, quick trading tips, platform tutorials, and behind-the-scenes content from the NYALTX team. We break down complex DeFi concepts into easy-to-understand videos, share market analysis in bite-sized formats, and keep you updated on all the latest features and partnerships. Follow us for a fresh take on crypto education and entertainment.",
    category: "Social Media",
    date: "2024-01-05",
    link: "https://tiktok.com/@nyaltx",
    tags: ["TikTok", "Social Media", "Education", "Updates"]
  },
  { 
    id: 5, 
    title: "Follow Us On X!", 
    subtitle: "Official NYALTX Account",
    image: "/banner/5.png",
    description: "Real-time updates, market insights, and community discussions on our official X (Twitter) account.",
    fullDescription: "Connect with the NYALTX community on X (formerly Twitter) for real-time updates, market insights, and engaging discussions about the future of DeFi. Our X account is your go-to source for breaking news, feature announcements, market analysis, and direct communication with our team. We share daily insights, respond to community questions, and provide exclusive previews of upcoming features. Join our growing community of DeFi enthusiasts and stay at the forefront of the crypto revolution.",
    category: "Social Media",
    date: "2024-01-03",
    link: "https://x.com/nyaltx",
    tags: ["Twitter", "X", "Social Media", "Community", "Updates"]
  },
];

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const adId = parseInt(params?.id as string);
  
  const ad = bannerItems.find(item => item.id === adId);
  
  if (!ad) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ad Not Found</h1>
          <p className="text-gray-400 mb-6">The advertisement you're looking for doesn't exist.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleExternalLink = () => {
    if (ad.link) {
      if (ad.link.startsWith('http')) {
        window.open(ad.link, '_blank', 'noopener noreferrer');
      } else {
        router.push(ad.link);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-white">
      {/* Header */}
      {/* <div className="sticky top-0 z-10 bg-[var(--card-bg)] border-b border-[var(--border-color)] backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            {ad.link && (
              <button 
                onClick={handleExternalLink}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] rounded-lg transition-colors"
              >
                <span>Visit Link</span>
                <FiExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Image */}
          <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8">
            <Image 
              src={ad.image}
              alt={ad.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="inline-block px-3 py-1 bg-[var(--primary-color)] text-white text-sm font-medium rounded-full">
                {ad.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{ad.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{ad.subtitle}</p>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-gray-200 mb-6">
                  {ad.description}
                </p>
                
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">Full Details</h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {ad.fullDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Details</h3>
                
                {/* Date */}
                <div className="flex items-center gap-3 mb-4">
                  <FiCalendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="font-medium">{formatDate(ad.date)}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-center gap-3 mb-6">
                  <FiTag className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Category</p>
                    <p className="font-medium">{ad.category}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {ad.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-[var(--hover-bg)] text-sm rounded-full border border-[var(--border-color)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                {ad.link && (
                  <button 
                    onClick={handleExternalLink}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] rounded-lg transition-colors font-medium"
                  >
                    <span>
                      {ad.link.startsWith('http') ? 'Visit External Link' : 'View on Platform'}
                    </span>
                    <FiExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
