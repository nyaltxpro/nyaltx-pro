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
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <div className="text-[#00b8d8] text-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
          </svg>
        </div>
        {isExpanded && (
          <span className="ml-2 font-bold text-white">DexTools</span>
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
        <div className="flex items-center py-3 px-3 mb-1 rounded-md text-gray-400 hover:bg-[#1a2932] hover:text-white cursor-pointer">
          <div className="text-xl"><FaPlus /></div>
          {isExpanded && (
            <span className="ml-3">Add New</span>
          )}
        </div>
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
