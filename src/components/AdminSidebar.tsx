'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FaChartPie,
  FaCoins,
  FaEnvelope,
  FaGift,
  FaHome,
  FaImage,
  FaNewspaper,
  FaPlusCircle,
  FaShoppingCart,
  FaSignOutAlt,
  FaUserFriends,
  FaYoutube,
} from 'react-icons/fa';

interface AdminSidebarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  isActive: any;
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
        className={`group flex items-center py-3 px-3 mb-2 rounded-lg transition-all duration-200 ${isActive
          ? 'bg-linear-to-r from-[#00b8d8]/20 to-[#00b8d8]/10 text-[#00b8d8] border border-[#00b8d8]/30 shadow-lg backdrop-blur-sm'
          : 'text-gray-300 hover:bg-gray-700/30 hover:text-white hover:border hover:border-gray-600/30 hover:shadow-md hover:backdrop-blur-sm'
          }`}
        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
      >
        <motion.div
          className={`text-xl ${isActive ? 'text-[#00b8d8]' : 'text-gray-400 group-hover:text-white'} transition-colors duration-200`}
          animate={{ rotate: isActive ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              className={`ml-3 whitespace-nowrap font-medium ${isActive ? 'text-[#00b8d8]' : 'text-gray-300 group-hover:text-white'} transition-colors duration-200`}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{
                duration: 0.2,
                ease: 'easeInOut',
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

const LogoutButton = ({ isExpanded }: { isExpanded: boolean }) => {
  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('🚪 Attempting admin logout...');

      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ Logout successful');
        // Check if it's a redirect response
        if (response.redirected) {
          window.location.href = response.url;
        } else {
          // Fallback: manually redirect to login page
          window.location.href = '/adminpanel/login';
        }
      } else {
        console.error('❌ Logout failed:', response.status, response.statusText);
        // Force redirect even if API fails
        window.location.href = '/adminpanel/login';
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force redirect on any error
      window.location.href = '/adminpanel/login';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <form onSubmit={handleLogout} className="w-full">
        <button
          type="submit"
          className="group flex items-center py-3 px-3 mb-2 rounded-lg transition-all duration-200 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border hover:border-red-500/30 hover:shadow-md hover:backdrop-blur-sm w-full"
          style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
        >
          <motion.div
            className="text-xl text-red-400 group-hover:text-red-300 transition-colors duration-200"
            whileHover={{ rotate: 15 }}
            transition={{ duration: 0.3 }}
          >
            <FaSignOutAlt />
          </motion.div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                className="ml-3 whitespace-nowrap font-medium text-red-400 group-hover:text-red-300 transition-colors duration-200"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{
                  duration: 0.2,
                  ease: 'easeInOut',
                }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </form>
    </motion.div>
  );
};

export default function AdminSidebar({ isMobileMenuOpen, toggleMobileMenu }: AdminSidebarProps) {
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
    { icon: <FaCoins />, text: 'Tokens', href: '/adminpanel/tokens' },
    { icon: <FaPlusCircle />, text: 'Register Token', href: '/adminpanel/tokens/register' },
    { icon: <FaShoppingCart />, text: 'Orders', href: '/adminpanel/orders' },
    { icon: <FaUserFriends />, text: 'Users', href: '/adminpanel/users' },
    // { icon: <FaUsers />, text: 'Profiles', href: '/admin/profiles' },
    { icon: <FaChartPie />, text: 'Analytics', href: '/adminpanel/statistics' },
    // { icon: <FaChartLine />, text: 'Stats', href: '/admin/stats' },
    { icon: <FaGift />, text: 'Token Points', href: '/adminpanel/points' },
    { icon: <FaEnvelope />, text: 'Email Management', href: '/adminpanel/email-management' },
    { icon: <FaHome />, text: 'Dashboard', href: '/adminpanel' },
    { icon: <FaCoins />, text: 'Tokens', href: '/adminpanel/tokens' },
    { icon: <FaPlusCircle />, text: 'Register Token', href: '/adminpanel/tokens/register' },
    { icon: <FaShoppingCart />, text: 'Orders', href: '/adminpanel/orders' },
    { icon: <FaUserFriends />, text: 'Users', href: '/adminpanel/users' },
    // { icon: <FaUsers />, text: 'Profiles', href: '/admin/profiles' },
    { icon: <FaChartPie />, text: 'Analytics', href: '/adminpanel/statistics' },
    // { icon: <FaChartLine />, text: 'Stats', href: '/admin/stats' },
    { icon: <FaGift />, text: 'Token Points', href: '/adminpanel/points' },
    { icon: <FaEnvelope />, text: 'Email Management', href: '/adminpanel/email-management' },
    { icon: <FaNewspaper />, text: 'Blog Posts', href: '/adminpanel/blog' },
    { icon: <FaNewspaper />, text: 'Corporate News', href: '/adminpanel/news' },
    { icon: <FaImage />, text: 'Banners', href: '/adminpanel/banners' },
    { icon: <FaYoutube />, text: 'Trade Videos', href: '/adminpanel/trade-videos' },
    // { icon: <FaRocket />, text: 'Campaigns', href: '/admin/campaigns' },
    // { icon: <FaFootballBall />, text: 'Footer Settings', href: '/admin/footer-settings' },
  ];

  const sidebarExpanded = isDesktop ? isExpanded : isMobileMenuOpen;

  return (
    <>
      {!isDesktop && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileMenu} />
      )}
      <motion.div
        className={`fixed left-0 top-0 h-full bg-linear-to-b from-[#0f1923] via-[#1a2932] to-[#0f1923] backdrop-blur-xl border-r border-gray-700/20 shadow-2xl z-50 flex flex-col ${!isDesktop && (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full')
          }`}
        initial={false}
        animate={{
          width: isDesktop ? (isExpanded ? 224 : 64) : 224, // 224px = 14rem, 64px = 4rem
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
        <div className="flex items-center h-16 border-b border-gray-700/30 px-4 bg-gray-800/20 backdrop-blur-sm">
          <div className="flex items-center">
            <motion.div
              animate={{ rotate: isExpanded ? 360 : 0 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-linear-to-br from-[#00b8d8] to-[#0099b8] rounded-lg flex items-center justify-center shadow-lg"
            >
              <Image src="/logo.png" alt="Logo" width={20} height={20} className="brightness-0 invert" />
            </motion.div>
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.div
                  className="ml-3 flex flex-col"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <span className="font-bold text-white whitespace-nowrap" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    NYALTX
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Admin Panel
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-3 flex-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="mb-6">
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.div
                  className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700/20 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                >
                  Overview
                </motion.div>
              )}
            </AnimatePresence>
            {navItems.slice(0, 7).map(item => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                text={item.text}
                href={item.href}
                isActive={
                  pathname === item.href ||
                  (item.href !== '/adminpanel' && pathname?.startsWith(item.href))
                }
                isExpanded={sidebarExpanded}
              />
            ))}
          </div>

          {/* Operations Section */}
          <div className="mb-6">
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.div
                  className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700/20 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                >
                  Operations
                </motion.div>
              )}
            </AnimatePresence>
            {navItems.slice(7).map(item => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                text={item.text}
                href={item.href}
                isActive={
                  pathname === item.href ||
                  (item.href !== '/adminpanel' && pathname?.startsWith(item.href))
                }
                isExpanded={sidebarExpanded}
              />
            ))}
          </div>
        </div>

        {/* Logout Button at Bottom */}
        <div className="p-2 mt-auto">
          <LogoutButton isExpanded={sidebarExpanded} />
        </div>
      </motion.div>
    </>
  );
}
