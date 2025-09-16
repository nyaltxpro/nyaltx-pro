"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

  const fallbackImages = useMemo(() => [
    "/banner.jpg",
    "/banner3.jpg",
  ], []);

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
        setIndex((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(id);
    }
  }, [images.length]);

  const goTo = (i: number) => setIndex(i % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="relative w-[98%] md:w-[70%] py-3 select-none">
      <div className="relative overflow-hidden rounded-md border border-gray-800">
        <Link href={index === 1 ? "/pricing" : "/"} aria-label={index === 1 ? "Go to Pricing" : "Go to Home"}>
          <Image
            key={images[index]}
            src={images[index]}
            alt="Banner"
            width={1600}
            height={200}
            className="w-full h-[100px] md:h-[140px] object-cover transition-opacity duration-500"
            priority
            unoptimized={uploadedBanners.length > 0}
            onError={(e) => {
              console.error('Banner image failed to load:', images[index]);
              // Fallback to next image or default
              if (uploadedBanners.length > 0 && index < fallbackImages.length) {
                setIndex(0); // Reset to first fallback image
                setUploadedBanners([]); // Clear uploaded banners to use fallback
              }
            }}
          />
        </Link>

        {/* Controls */}
        <button aria-label="Previous" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white text-xs px-2 py-1 rounded">‹</button>
        <button aria-label="Next" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white text-xs px-2 py-1 rounded">›</button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-2">
        {images.map((_, i) => (
          <button
            aria-label={`Slide ${i + 1}`}
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 w-2 rounded-full ${i === index ? 'bg-cyan-400' : 'bg-gray-600'} hover:bg-cyan-300`}
          />
        ))}
      </div>
    </div>
  );
}
