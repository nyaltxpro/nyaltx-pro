"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaChartBar, 
  FaUsers, 
  FaCoins, 
  FaBullhorn,
  FaChartLine,
  FaGift,
  FaCog,
  FaShoppingCart,
  FaImage,
  FaRocket,
  FaSignOutAlt
} from 'react-icons/fa';
import Image from 'next/image';

interface AdminSidebarProps {
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

const LogoutButton = ({ isExpanded }: { isExpanded: boolean }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <form action="/api/admin/logout" method="post" className="w-full">
        <button 
          type="submit"
          className="flex items-center py-3 px-3 mb-1 rounded-md transition-all duration-200 text-red-400 hover:bg-red-900/20 hover:text-red-300 w-full"
        >
          <motion.div 
            className="text-xl"
            whileHover={{ rotate: 15 }}
            transition={{ duration: 0.3 }}
          >
            <FaSignOutAlt />
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
    { icon: <FaHome />, text: 'Dashboard', href: '/admin' },
    { icon: <FaCoins />, text: 'Tokens', href: '/admin/tokens' },
    { icon: <FaShoppingCart />, text: 'Orders', href: '/admin/orders' },
    { icon: <FaUsers />, text: 'Profiles', href: '/admin/profiles' },
    { icon: <FaChartLine />, text: 'Stats', href: '/admin/stats' },
    { icon: <FaGift />, text: 'Token Points', href: '/admin/points' },
    { icon: <FaImage />, text: 'Banners', href: '/admin/banners' },
    { icon: <FaRocket />, text: 'Campaigns', href: '/admin/campaigns' },
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
          width: isDesktop ? (isExpanded ? 224 : 64) : 224, // 224px = 14rem, 64px = 4rem
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
                  NYAX Admin
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-2">
          {/* Main Navigation */}
          <div className="mb-4">
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.div 
                  className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Overview
                </motion.div>
              )}
            </AnimatePresence>
            {navItems.slice(0, 5).map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                text={item.text}
                href={item.href}
                isActive={pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))}
                isExpanded={sidebarExpanded}
              />
            ))}
          </div>

          {/* Operations Section */}
          <div className="mb-4">
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.div 
                  className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Operations
                </motion.div>
              )}
            </AnimatePresence>
            {navItems.slice(5).map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                text={item.text}
                href={item.href}
                isActive={pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))}
                isExpanded={sidebarExpanded}
              />
            ))}
          </div>
        </div>

        {/* Logout Button at Bottom */}
        <div className="absolute bottom-4 left-0 right-0 p-2">
          <LogoutButton isExpanded={sidebarExpanded} />
        </div>
      </motion.div>
    </>
  );
}
