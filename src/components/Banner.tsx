'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface BannerFile {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  url: string;
}

export default function Banner() {
  const [uploadedBanners, setUploadedBanners] = useState<BannerFile[]>([]);
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

  // Load banners from admin panel
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response = await fetch('/api/admin/banners');
        if (response.ok) {
          const data = await response.json();
          setUploadedBanners(data.banners || []);
        }
      } catch (error) {
        console.error('Failed to load banners:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
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

  return (
    <div className="relative w-full max-w-5xl mx-auto py-4 px-4 select-none">
      {/* Enhanced Banner Container */}
      <div className="relative group">
        {/* Animated background glow */}

        {/* Main banner container */}
        <div className="relative overflow-hidden rounded-2xl  bg-black/20 backdrop-blur-xl shadow-2xl group-hover:border-[#00d4aa]/40 transition-all duration-500">
          {/* Inner glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa]/5 via-transparent to-[#3b82f6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

          {/* Banner Link */}
          <Link
            href={index === 1 ? '/pricing' : '/'}
            aria-label={index === 1 ? 'Go to Pricing' : 'Go to Home'}
            className="block relative overflow-hidden"
          >
            <Image
              key={images[index]}
              src={images[index]}
              alt="NYALTX Banner"
              width={1600}
              height={200}
              className="w-full h-[120px] md:h-[160px] lg:h-[180px] object-contain transition-all duration-700 group-hover:scale-105"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"></div>
          </Link>


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
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50">
            <p className="text-white text-sm font-medium">
              {index === 1 ? 'Explore Pricing Plans' : 'Welcome to NYALTX'}
            </p>
            <p className="text-gray-300 text-xs">
              {index === 1 ? 'Discover our premium features' : 'Your crypto trading platform'}
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
