"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface BannerFile {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  url: string;
}

export default function DashboardBanners() {
  const [banners, setBanners] = useState<BannerFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000); // Change banner every 5 seconds

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(data.banners || []);
      }
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative w-full h-48 md:h-64 lg:h-80 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading banners...</div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-48 md:h-64 lg:h-80 bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h3 className="text-xl font-bold mb-2">Welcome to NYALTX</h3>
            <p className="text-gray-300">No custom banners uploaded yet</p>
          </div>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentBannerIndex];

  return (
    <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden group">
      {/* Main Banner Image */}
      <div className="relative w-full h-full">
        <Image
          src={currentBanner.url}
          alt={`Banner ${currentBanner.name}`}
          fill
          className="object-cover transition-opacity duration-1000"
          priority
          onError={(e) => {
            console.error('Banner load error:', e);
          }}
        />
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Banner Navigation Dots (if multiple banners) */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentBannerIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Banner Counter (if multiple banners) */}
      {banners.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentBannerIndex + 1} / {banners.length}
        </div>
      )}

      {/* Navigation Arrows (on hover, if multiple banners) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
