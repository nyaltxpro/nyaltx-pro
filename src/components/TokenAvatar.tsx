import React, { useState } from 'react';
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

  const handleImageError = () => {
    setImageError(true);
  };

  const handleIconError = () => {
    setIconError(true);
  };

  // If we have a valid image source and no error, show the image
  if (src && !imageError) {
    return (
      <div className={`relative overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
        <Image
          src={src}
          alt={symbol}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          onError={handleImageError}
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
        <Image
          src={iconPath}
          alt={symbol}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          onError={handleIconError}
          unoptimized
        />
      </div>
    );
  }

  // Generate avatar with initials and color
  const backgroundColor = generateAvatarColor(symbol);
  const initials = generateInitials(symbol, name);
  const fontSize = Math.max(size * 0.35, 12);

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
