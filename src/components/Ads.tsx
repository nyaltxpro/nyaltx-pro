import React from 'react';
import { useRouter } from 'next/navigation';

export interface BannerItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  fullDescription: string;
  category: string;
  date: string;
  link?: string;
  tags: string[];
}

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

const Ads = () => {
  const router = useRouter();
  
  // Triple the items for seamless infinite scroll
  const infiniteItems = [...bannerItems, ...bannerItems, ...bannerItems];

  const handleAdClick = (item: BannerItem) => {
    router.push(`/ad/${item.id}`);
  };

  return (
    <div className="w-full py-4 overflow-hidden">
      <div className="mx-auto px-4">
        <div className="relative">
          <div className="flex animate-scroll gap-4">
            {infiniteItems.map((item, index) => (
              <div 
                key={`${item.id}-${index}`} 
                className="rounded-lg overflow-hidden shadow-lg flex-shrink-0 w-80 flex flex-col hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => handleAdClick(item)}
              >
                <div className="h-48 w-full relative">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {item.category}
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{item.subtitle}</p>
                  {/* <p className="text-gray-500 text-xs line-clamp-2">{item.description}</p> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-320px * ${bannerItems.length} - ${bannerItems.length * 16}px));
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default Ads;
