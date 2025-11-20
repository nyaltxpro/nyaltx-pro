'use client';

import {
  BarChartIcon,
  CalendarIcon,
  GearIcon,
  HomeIcon,
  ImageIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PersonIcon,
  PlayIcon,
  PlusIcon,
  ReaderIcon,
  RocketIcon,
  StarIcon,
  TargetIcon
} from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Link
        href={href}
        className={`group flex items-center py-3 px-3 mb-1 rounded-xl transition-all duration-300 ${isActive
          ? 'bg-gradient-to-r from-[#00d4aa]/20 to-[#3b82f6]/20 text-[#00d4aa] border border-[#00d4aa]/30 shadow-lg shadow-[#00d4aa]/10'
          : 'text-gray-300 hover:bg-white/5 hover:text-white hover:border hover:border-white/10'
          }`}
      >
        <motion.div
          className={`text-2xl transition-colors duration-300 ${isActive ? 'text-[#00d4aa]' : 'text-gray-400 group-hover:text-white'}`}
          animate={{ rotate: isActive ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              className="ml-3 whitespace-nowrap  font-extralight"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
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
    { icon: <HomeIcon />, text: 'Home', href: '/dashboard' },
    { icon: <PersonIcon />, text: 'Profile', href: '/dashboard/profile' },
    {
      icon: <BarChartIcon />,
      text: 'NYAX Dashboard',
      href: '/dashboard/nyax',
    },
    // {
    //   icon: <PlusIcon />,
    //   text: 'NYAX Sale',
    //   href: '/dashboard/nyax-sale',
    // },
    {
      icon: <TargetIcon />,
      text: 'Governance',
      href: '/dashboard/governance',
    },
    // { icon: <TokensIcon />, text: 'Create Token', href: '/dashboard/create-token' },
    { icon: <PlusIcon />, text: 'Register Token', href: '/pricing' },

    { icon: <StarIcon />, text: 'Favorites', href: '/dashboard/favorites' },
    { icon: <PlayIcon />, text: 'Live Stream', href: '/dashboard/live-stream' },
    { icon: <RocketIcon />, text: 'Trending', href: '/dashboard/trending' },
    { icon: <ReaderIcon />, text: 'News', href: '/dashboard/news' },
    { icon: <CalendarIcon />, text: 'Events', href: '/dashboard/events' },
    { icon: <MagnifyingGlassIcon />, text: 'Search Token', href: '/dashboard/search' },
    { icon: <TargetIcon />, text: 'Gamification', href: '/dashboard/gamification' },
    { icon: <ListBulletIcon />, text: 'Leaderboard', href: '/dashboard/leaderboard' },
    // { icon: <LockClosedIcon />, text: 'Connect', href: '/dashboard/connect' },
    // { icon: <UpdateIcon />, text: 'Swap', href: '/dashboard/swap' },
  ];

  const extraItems = [
    { icon: <ImageIcon />, text: 'NFTs', href: '/dashboard/nfts' },
    { icon: <GearIcon />, text: 'Settings', href: '/dashboard/settings' },
  ];

  const sidebarExpanded = isDesktop ? isExpanded : isMobileMenuOpen;

  return (
    <>
      {!isDesktop && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999998] sidebar-mobile-backdrop"
          onClick={toggleMobileMenu}
        />
      )}
      <motion.div
        className={`fixed left-0 top-0 h-full bg-black/95 backdrop-blur-xl border-r border-gray-800/50 z-[999999] sidebar-container sidebar-desktop ${!isDesktop && (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full')
          }`}
        style={{
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(10, 10, 10, 0.95) 50%, rgba(0, 0, 0, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        initial={false}
        animate={{
          width: isDesktop ? (isExpanded ? 224 : 64) : 224, // 56 = 14rem, 16 = 4rem in pixels
          x: !isDesktop && !isMobileMenuOpen ? -224 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          duration: 0.3,
        }}
        onMouseEnter={() => isDesktop && setIsExpanded(true)}
        onMouseLeave={() => isDesktop && setIsExpanded(false)}
      >
        <div className="flex items-center h-16 border-b border-gray-800/30 px-4 bg-gradient-to-r from-transparent via-gray-900/20 to-transparent">
          <Link href="/" className="flex items-center group cursor-pointer">
            <motion.div
              animate={{ rotate: isExpanded ? 360 : 0 }}
              transition={{ duration: 0.5 }}
              className="relative group-hover:scale-110 transition-transform duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <Image src="/nyaltxpro.png" alt="NYALTX Logo - Go to Home" width={30} height={30} className="relative z-10" />
            </motion.div>
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.span
                  className="ml-3 whitespace-nowrap font-bold bg-gradient-to-r from-white via-[#00d4aa] to-[#3b82f6] bg-clip-text text-transparent group-hover:from-[#00d4aa] group-hover:via-white group-hover:to-[#3b82f6] transition-all duration-300"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                >
                  NYALTX
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <div className="p-2">
          {navItems.map(item => (
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
          {/* <div className="px-3 py-1">
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
          </div> */}

          {/* {extraItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              text={item.text}
              href={item.href}
              isActive={pathname === item.href}
              isExpanded={sidebarExpanded}
            />
          ))} */}

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
