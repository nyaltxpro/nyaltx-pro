'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import SimpleUnifiedWalletButton from './SimpleUnifiedWalletButton';
import { usePublicNavigation } from '../hooks/useTinaContent';

export default function PublicHeader() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { content } = usePublicNavigation();

  const fallbackPrimaryLinks = [
    { label: 'Dashboard', href: '/dashboard', enabled: true },
    { label: 'Pricing', href: '/pricing', enabled: true },
    { label: 'Contact us', href: '/contact', enabled: true },
  ];

  const fallbackDropdownMenus = [
    {
      label: 'More',
      enabled: true,
      links: [
        { label: 'About Us', href: '/about-us', enabled: true },
        { label: 'Venture Group', href: '/venture-group', enabled: true },
        { label: 'Podcast', href: '/podcast', enabled: true },
        { label: 'Team', href: '/team', enabled: true },
        { label: 'Whitepaper', href: '/whitepaper', enabled: true },
        { label: 'Help & Support', href: '/contact', enabled: true },
        { label: 'Our News', href: '/news', enabled: true },
      ],
    },
  ];

  const primaryLinks = (content?.primaryLinks ?? fallbackPrimaryLinks).filter(
    (link) => link.enabled !== false,
  );

  const dropdownMenus = (content?.dropdownMenus ?? fallbackDropdownMenus)
    .filter((menu) => menu.enabled !== false)
    .map((menu) => ({
      ...menu,
      links: (menu.links ?? []).filter((link) => link.enabled !== false),
    }))
    .filter((menu) => (menu.links?.length ?? 0) > 0);

  const brandLabel = content?.brand?.label ?? 'NYALTX';
  const brandHref = content?.brand?.href ?? '/';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDropdown = Object.values(dropdownRefs.current).some(
        (ref) => ref?.contains(target),
      );

      if (!isInsideDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const NavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => {
    const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
    return (
      <Link
        href={href}
        className={
          active
            ? 'px-3 py-2 text-sm text-cyan-300'
            : 'px-3 py-2 text-sm text-gray-300 hover:text-white'
        }
        onClick={onClick}
      >
        {label}
      </Link>
    );
  };

  const DropdownLink = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
    return (
      <Link
        href={href}
        className={
          active
            ? 'block px-4 py-2 text-sm text-cyan-300 hover:bg-gray-800'
            : 'block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800'
        }
        onClick={() => setOpenDropdown(null)}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="z-40 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 h-20 py-4 flex items-center justify-between gap-4">
        {/* Logo - Left */}
        <div className="flex items-center shrink-0">
          <Link href={brandHref} className="flex items-center gap-2">
            <span className="text-base md:text-lg font-semibold tracking-tight">{brandLabel}</span>
          </Link>
        </div>

        {/* Navigation - Center */}
        <nav className="hidden md:flex items-center justify-center flex-1 gap-1 text-sm">
          {primaryLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
          {dropdownMenus.map((menu) => {
            const isOpen = openDropdown === menu.label;
            return (
              <div
                key={menu.label}
                className="relative"
                ref={(el) => {
                  dropdownRefs.current[menu.label] = el;
                }}
              >
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : menu.label)}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {menu.label}
                  <FaChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[#101010] border border-gray-700 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      {menu.links?.map((link) => (
                        <DropdownLink key={link.href} href={link.href} label={link.label} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Connect Wallet - Right */}
        <div className="shrink-0 flex items-center gap-2">
          {/* <ConnectWalletButton /> */}
          <SimpleUnifiedWalletButton />
        </div>
      </div>
    </header>
  );
}
