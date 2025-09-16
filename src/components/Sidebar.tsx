"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaChartLine,
  FaCog,
  FaNewspaper
} from 'react-icons/fa';
import Image from 'next/image';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  isActive: boolean;
  isExpanded: boolean;
}

const SidebarItem = ({ icon, text, href, isActive, isExpanded }: SidebarItemProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link 
        href={href}
        className={`flex items-center py-3 px-3 mb-1 rounded-md transition-all duration-200 ${
          isActive 
            ? 'bg-[#1a2932] text-[#00b8d8]' 
            : 'text-gray-400 hover:bg-[#1a2932] hover:text-white'
        }`}
      >
        <motion.div 
          className="text-xl"
          animate={{ rotate: isActive ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        <AnimatePresence>
          {isExpanded && (
            <motion.span 
              className="ml-3 whitespace-nowrap"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ 
                duration: 0.2,
                ease: "easeInOut"
              }}
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
};

export default function Sidebar({ isMobileMenuOpen, toggleMobileMenu }: SidebarProps) {
  const [isDesktop, setIsDesktop] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768); // md breakpoint
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const navItems = [
    { icon: <FaHome />, text: 'Home', href: '/dashboard' },
    { icon: <FaChartLine />, text: 'Trading', href: '/dashboard/trading' },
    // { icon: <FaExchangeAlt />, text: 'Pairs', href: '/pairs' },
    { icon: <FaGift />, text: 'Airdrops', href: '/dashboard/airdrops' },
    { icon: <FaRocket />, text: 'Trending', href: '/dashboard/trending' },
    { icon: <FaNewspaper />, text: 'News', href: '/dashboard/news' },
    { icon: <FaCoins />, text: 'Create Token', href: '/dashboard/create-token' },
    { icon: <FaPlus />, text: 'Register Token', href: '/dashboard/register-token' },
    { icon: <FaShoppingCart />, text: 'Checkout', href: '/dashboard/checkout' },
    { icon: <FaWallet />, text: 'Connect', href: '/dashboard/connect' },
    { icon: <FaSyncAlt />, text: 'Swap', href: '/dashboard/swap' },
  ];

  const extraItems = [
    { icon: <FaImage />, text: 'NFTs', href: '/dashboard/nfts' },
    { icon: <FaCog />, text: 'Settings', href: '/dashboard/settings' },
  ];

  const sidebarExpanded = isDesktop ? isExpanded : isMobileMenuOpen;

  return (
    <>
      {!isDesktop && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}
      <motion.div 
        className={`fixed left-0 top-0 h-full bg-[#0f1923] z-50 ${
          !isDesktop && (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full')
        }`}
        initial={false}
        animate={{
          width: isDesktop ? (isExpanded ? 224 : 64) : 224, // 56 = 14rem, 16 = 4rem in pixels
          x: !isDesktop && !isMobileMenuOpen ? -224 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.3
        }}
        onMouseEnter={() => isDesktop && setIsExpanded(true)}
        onMouseLeave={() => isDesktop && setIsExpanded(false)}
      >
        <div className="flex items-center h-16 border-b border-gray-800 px-4">
          <div className="flex items-center">
            <motion.div
              animate={{ rotate: isExpanded ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/logo.png" 
                alt="Logo" 
                width={30}
                height={30}
              />
            </motion.div>
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.span 
                  className="ml-2 font-bold text-white whitespace-nowrap"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  NYALTX
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-2">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              text={item.text}
              href={item.href}
              isActive={pathname === item.href}
              isExpanded={sidebarExpanded}
            />
          ))}
        </div>

        <div className="mt-4 p-2">
          <div className="px-3 py-1">
            <AnimatePresence>
              {sidebarExpanded ? (
                <motion.span 
                  className="text-xs font-semibold text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  EXTRA
                </motion.span>
              ) : (
                isDesktop && (
                  <motion.div 
                    className="text-xs font-semibold text-gray-500 transform -rotate-90"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    EXTRA
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
          
          {extraItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              text={item.text}
              href={item.href}
              isActive={pathname === item.href}
              isExpanded={sidebarExpanded}
            />
          ))}
          
          {/* <Link href="/profile" className="flex items-center py-3 px-3 mt-4 rounded-md text-gray-400 hover:bg-[#1a2932] hover:text-white cursor-pointer">
            <div className="text-xl"><FaUser /></div>
            {sidebarExpanded && (
              <span className="ml-3">Profile</span>
            )}
          </Link> */}
        </div>
      </motion.div>
    </>
  );
}
