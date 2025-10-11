import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface TokenAvatarProps {
  src?: string | null;
  symbol: string;
  name?: string;
  size?: number;
  className?: string;
  fallbackToIcon?: boolean;
}

// Generate a consistent color based on the token symbol
const generateAvatarColor = (symbol: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE',
    '#FD79A8', '#E17055', '#00B894', '#00CEC9', '#6C5CE7'
  ];
  
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Generate initials from token symbol or name
const generateInitials = (symbol: string, name?: string): string => {
  if (symbol.length >= 2) {
    return symbol.substring(0, 2).toUpperCase();
  }
  
  if (name) {
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    if (words.length === 1 && words[0].length >= 2) {
      return words[0].substring(0, 2).toUpperCase();
    }
  }
  
  return symbol.substring(0, 1).toUpperCase() + '?';
};

const TokenAvatar: React.FC<TokenAvatarProps> = ({
  src,
  symbol,
  name,
  size = 40,
  className = '',
  fallbackToIcon = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [iconError, setIconError] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!src);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageLoading(false);
  };

  const handleIconError = () => {
    setIconError(true);
  };

  // Reset states when src changes
  useEffect(() => {
    if (src) {
      setImageError(false);
      setImageLoading(true);
      setImageLoaded(false);
    } else {
      setImageLoading(false);
      setImageLoaded(false);
    }
    setIconError(false);
  }, [src]);

  // Generate avatar with initials and color for skeleton/fallback
  const backgroundColor = generateAvatarColor(symbol);
  const initials = generateInitials(symbol, name);
  const fontSize = Math.max(size * 0.35, 12);

  // If we have a valid image source and no error, show the image with skeleton
  if (src && !imageError) {
    return (
      <div className={`relative overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
        {/* Show skeleton/avatar while loading */}
        {imageLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center text-white font-bold"
            style={{
              backgroundColor: backgroundColor + 'CC', // More opaque for better visibility
              fontSize: `${fontSize}px`,
            }}
          >
            <div className="animate-pulse">{initials}</div>
          </div>
        )}
        
        {/* Actual image */}
        <Image
          src={src}
          alt={symbol}
          width={size}
          height={size}
          className={`object-cover w-full h-full transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          unoptimized
        />
      </div>
    );
  }

  // Try fallback to crypto icon if enabled and no icon error yet
  if (fallbackToIcon && !iconError) {
    const iconPath = `/crypto-icons/color/${symbol.toLowerCase()}.svg`;
    return (
      <div className={`relative overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
        {/* Show avatar skeleton while icon loads */}
        <div
          className="absolute inset-0 flex items-center justify-center text-white font-bold"
          style={{
            backgroundColor,
            fontSize: `${fontSize}px`,
          }}
        >
          {initials}
        </div>
        
        {/* Crypto icon overlay */}
        <Image
          src={iconPath}
          alt={symbol}
          width={size}
          height={size}
          className="absolute inset-0 object-cover w-full h-full transition-opacity duration-300"
          onError={handleIconError}
          onLoad={() => {}} // Icon loaded successfully
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-bold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor,
        fontSize: `${fontSize}px`,
      }}
      title={name || symbol}
    >
      {initials}
    </div>
  );
};

export default TokenAvatar;
