"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, 
  FaChartBar, 
  FaExchangeAlt, 
  FaRocket, 
  FaGift, 
  FaLayerGroup, 
  FaSyncAlt, 
  FaLightbulb,
  FaWallet,
  FaUser,
  FaPlus,
  FaImage,
  FaGlobe,
  FaShoppingCart,
  FaFire,
  FaCoins,
  FaChartLine
} from 'react-icons/fa';
import Image from 'next/image';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  isActive: boolean;
  isExpanded: boolean;
}

const SidebarItem = ({ icon, text, href, isActive, isExpanded }: SidebarItemProps) => {
  return (
    <Link 
      href={href}
      className={`flex items-center py-3 px-3 mb-1 rounded-md transition-all duration-200 ${
        isActive 
          ? 'bg-[#1a2932] text-[#00b8d8]' 
          : 'text-gray-400 hover:bg-[#1a2932] hover:text-white'
      }`}
    >
      <div className="text-xl">{icon}</div>
      {isExpanded && (
        <span className={`ml-3 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          {text}
        </span>
      )}
    </Link>
  );
};

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  
  const navItems = [
    { icon: <FaHome />, text: 'Home', href: '/' },
    { icon: <FaChartBar />, text: 'Multichart', href: '/multichart' },
    { icon: <FaChartLine />, text: 'Trading', href: '/trading' },
    { icon: <FaExchangeAlt />, text: 'Pairs', href: '/pairs' },
    { icon: <FaFire />, text: 'New Pairs', href: '/new-pairs' },
    { icon: <FaGift />, text: 'Airdrops', href: '/airdrops' },
    { icon: <FaRocket />, text: 'Trending', href: '/trending' },
    { icon: <FaCoins />, text: 'Create Token', href: '/create-token' },
    { icon: <FaWallet />, text: 'Connect', href: '/connect' },
    { icon: <FaLayerGroup />, text: 'Pool Explorer', href: '/pools' },
    { icon: <FaSyncAlt />, text: 'Swap', href: '/swap' },
    { icon: <FaLightbulb />, text: 'Tools', href: '/tools' },
  ];

  const extraItems = [
    { icon: <FaImage />, text: 'NFTs', href: '/nfts' },
    { icon: <FaGlobe />, text: 'Network', href: '/network' },
    { icon: <FaShoppingCart />, text: 'Market', href: '/market' },
  ];

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-[#0f1923] transition-all duration-300 ease-in-out z-50 ${
        isExpanded ? 'w-56' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="flex items-center w-full justify-center h-16 border-b border-gray-800">
        <div className="flex items-center justify-start">
          <Image
            src="/logo.png" 
            alt="DexTools Logo" 
            // className="w-8 h-8" 
            width={30}
            height={30}
          />
        </div>
        {isExpanded && (
          <span className="ml-2 font-bold text-white">NYALTX</span>
        )}
      </div>

      {/* Navigation Items */}
      <div className="p-2">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            text={item.text}
            href={item.href}
            isActive={pathname === item.href}
            isExpanded={isExpanded}
          />
        ))}
        
        {/* Add button */}
        <Link 
          href="/add-new"
          className={`flex items-center py-3 px-3 mb-1 rounded-md transition-all duration-200 ${pathname === '/add-new' ? 'bg-[#1a2932] text-[#00b8d8]' : 'text-gray-400 hover:bg-[#1a2932] hover:text-white'}`}
        >
          <div className="text-xl"><FaPlus /></div>
          {isExpanded && (
            <span className="ml-3">Add New</span>
          )}
        </Link>
      </div>

      {/* Extra section */}
      <div className="mt-4 p-2">
        <div className="px-3 py-1">
          {isExpanded ? (
            <span className="text-xs font-semibold text-gray-500">EXTRA</span>
          ) : (
            <div className="text-xs font-semibold text-gray-500 transform -rotate-90">EXTRA</div>
          )}
        </div>
        
        {extraItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            text={item.text}
            href={item.href}
            isActive={pathname === item.href}
            isExpanded={isExpanded}
          />
        ))}
        
        {/* User profile */}
        <div className="flex items-center py-3 px-3 mt-4 rounded-md text-gray-400 hover:bg-[#1a2932] hover:text-white cursor-pointer">
          <div className="text-xl"><FaUser /></div>
          {isExpanded && (
            <span className="ml-3">Profile</span>
          )}
        </div>
      </div>
    </div>
  );
}
