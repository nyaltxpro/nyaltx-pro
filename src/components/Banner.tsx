'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface BannerFile {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  url: string;
}

interface BannerMetadata {
  bannerName: string;
  hyperlink: string;
  title: string;
  description: string;
}

export default function Banner() {
  const router = useRouter();
  const [uploadedBanners, setUploadedBanners] = useState<BannerFile[]>([]);
  const [bannerMetadata, setBannerMetadata] = useState<BannerMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackImages = useMemo(() => ['/banner.jpg', '/banner3.jpg'], []);

  // Use uploaded banners if available, otherwise use fallback images
  const images = useMemo(() => {
    if (uploadedBanners.length > 0) {
      return uploadedBanners.map(banner => banner.url);
    }
    return fallbackImages;
  }, [uploadedBanners, fallbackImages]);

  const [index, setIndex] = useState(0);

  // Load banners and metadata from admin panel
  useEffect(() => {
    const loadBannersAndMetadata = async () => {
      try {
        // Load banners
        const bannersResponse = await fetch('/api/admin/banners');
        if (bannersResponse.ok) {
          const bannersData = await bannersResponse.json();
          setUploadedBanners(bannersData.banners || []);
        }

        // Load banner metadata
        const metadataResponse = await fetch('/api/admin/banners/metadata');
        if (metadataResponse.ok) {
          const metadataData = await metadataResponse.json();
          setBannerMetadata(metadataData.bannerMetadata || []);
        }
      } catch (error) {
        console.error('Failed to load banners or metadata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBannersAndMetadata();
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      const id = setInterval(() => {
        setIndex(prev => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(id);
    }
  }, [images.length]);

  const goTo = (i: number) => setIndex(i % images.length);
  const prev = () => setIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setIndex(i => (i + 1) % images.length);

  // Handle banner click
  const handleBannerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const href = getCurrentHyperlink();
    console.log('Banner clicked! Navigating to:', href);
    console.log('Current banner metadata:', getCurrentBannerMetadata());

    if (href) {
      // Use router.push for navigation
      router.push(href);
    }
  };

  // Get current banner metadata
  const getCurrentBannerMetadata = () => {
    if (uploadedBanners.length > 0 && uploadedBanners[index]) {
      const currentBanner = uploadedBanners[index];
      return bannerMetadata.find(meta => meta.bannerName === currentBanner.name);
    }
    return null;
  };

  // Get hyperlink for current banner
  const getCurrentHyperlink = () => {
    const metadata = getCurrentBannerMetadata();
    if (metadata?.hyperlink && metadata.hyperlink.trim() !== '') {
      console.log('Using metadata hyperlink:', metadata.hyperlink);
      return metadata.hyperlink;
    }
    // Fallback to existing logic
    const fallbackLink = index === 1 ? '/pricing' : '/';
    console.log('Using fallback hyperlink:', fallbackLink, 'metadata:', metadata);
    return fallbackLink;
  };

  // Get title and description for current banner
  const getCurrentBannerInfo = () => {
    const metadata = getCurrentBannerMetadata();
    if (metadata) {
      return {
        title: metadata.title || (index === 1 ? 'Explore Pricing Plans' : 'Welcome to NYALTX'),
        description: metadata.description || (index === 1 ? 'Discover our premium features' : 'Your crypto trading platform')
      };
    }
    return {
      title: index === 1 ? 'Explore Pricing Plans' : 'Welcome to NYALTX',
      description: index === 1 ? 'Discover our premium features' : 'Your crypto trading platform'
    };
  };

  return (
    <div className="relative w-full hover:cursor-pointer max-w-5xl mx-auto py-4 px-4 select-none"
      onClick={handleBannerClick}
    >
      {/* Enhanced Banner Container */}
      <div className="relative group hover:cursor-pointer">
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm opacity-0 group-hover:opacity-100"
              aria-label="Previous banner"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            {/* Right Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute  cursor-pointer right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm opacity-0 group-hover:opacity-100"
              aria-label="Next banner"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Animated background glow */}

        {/* Main banner container */}
        <div className="relative overflow-hidden rounded-2xl  bg-black/20 backdrop-blur-xl shadow-2xl group-hover:border-[#00d4aa]/40 transition-all duration-500 hover:cursor-pointer">
          {/* Inner glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa]/5 via-transparent to-[#3b82f6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>

          {/* Banner Link */}
          <div
            className="block relative overflow-hidden hover:cursor-pointer"
            onClick={handleBannerClick}
            role="button"
            tabIndex={0}
            aria-label={getCurrentBannerInfo().title}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleBannerClick(e as any);
              }
            }}
          >
            <Image
              key={images[index]}
              src={images[index]}
              alt="NYALTX Banner"
              width={1600}
              height={200}
              className="w-full h-[120px] md:h-[160px] cursor-pointer lg:h-[180px] object-contain transition-all duration-700 group-hover:scale-105"
              priority
              unoptimized={uploadedBanners.length > 0}
              style={{ objectFit: 'contain' }}
              onError={e => {
                console.error('Banner image failed to load:', images[index]);
                if (uploadedBanners.length > 0 && index < fallbackImages.length) {
                  setIndex(0);
                  setUploadedBanners([]);
                }
              }}
            />

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none"></div>
          </div>


          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30">
              <div className="w-8 h-8 border-2 border-[#00d4aa]/30 border-t-[#00d4aa] rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Enhanced Pagination Dots */}
        {images.length > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4">
            {images.map((_, i) => (
              <button
                aria-label={`Go to slide ${i + 1}`}
                key={i}
                onClick={() => goTo(i)}
                className={`relative transition-all duration-300 ${i === index
                  ? 'w-8 h-3 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-full shadow-lg shadow-[#00d4aa]/30'
                  : 'w-3 h-3 bg-gray-600 hover:bg-gray-500 rounded-full'
                  }`}
              >
                {i === index && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-full animate-pulse opacity-50"></div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Banner Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50">
            <p className="text-white text-sm font-medium">
              {getCurrentBannerInfo().title}
            </p>
            <p className="text-gray-300 text-xs">
              {getCurrentBannerInfo().description}
            </p>
          </div>

          {images.length > 1 && (
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50">
              <p className="text-gray-300 text-xs">
                {index + 1} / {images.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
