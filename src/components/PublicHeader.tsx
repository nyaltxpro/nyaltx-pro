'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaBars, FaChevronDown, FaTimes } from 'react-icons/fa';
import { usePublicNavigation } from '../hooks/useTinaContent';
import SimpleUnifiedWalletButton from './SimpleUnifiedWalletButton';

export default function PublicHeader() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        { label: 'Blog', href: '/blog', enabled: true },
        { label: 'About Us', href: '/about-us', enabled: true },
        { label: 'Governa', href: 'https://nyaltx-governance.vercel.app/', enabled: true },
        { label: 'Venture Group', href: '/venture-group', enabled: true },
        { label: 'Podcast', href: '/podcast', enabled: true },
        { label: 'Team', href: '/team', enabled: true },
        { label: 'Our News', href: '/news', enabled: true },
        { label: 'Whitepaper', href: '/whitepaper', enabled: true },

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

  useEffect(() => {
    if (mobileMenuOpen) {
      setOpenDropdown(null);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      const existingOverflow = document.body.style.overflow;
      document.body.dataset.prevOverflow = existingOverflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        const previous = document.body.dataset.prevOverflow ?? '';
        if (previous) {
          document.body.style.overflow = previous;
        } else {
          document.body.style.removeProperty('overflow');
        }
        delete document.body.dataset.prevOverflow;
      };
    }

    const previous = document.body.dataset.prevOverflow ?? '';
    if (previous) {
      document.body.style.overflow = previous;
    } else {
      document.body.style.removeProperty('overflow');
    }
    delete document.body.dataset.prevOverflow;
    return undefined;
  }, [mobileMenuOpen]);

  const NavLink = ({
    href,
    label,
    onClick,
    variant = 'desktop',
  }: {
    href: string;
    label: string;
    onClick?: () => void;
    variant?: 'desktop' | 'mobile';
  }) => {
    const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
    const classes =
      variant === 'desktop'
        ? active
          ? 'px-3 py-2 text-sm text-cyan-300'
          : 'px-3 py-2 text-sm text-gray-300 hover:text-white'
        : active
          ? 'block w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white'
          : 'block w-full rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white';
    return (
      <Link
        href={href}
        className={classes}
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
    <header className="relative z-40 bg-transparent">
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
        <div className="shrink-0 hidden md:flex  items-center gap-2">
          {/* <ConnectWalletButton /> */}
          <SimpleUnifiedWalletButton />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-md border border-gray-800 p-2 text-gray-300 hover:bg-gray-900 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          onClick={() => setMobileMenuOpen(false)}
        ></div>
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[80vw] flex-col border-r border-gray-800 bg-[#050505] shadow-2xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
            }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
            <Link
              href={brandHref}
              className="flex items-center gap-2 text-lg font-semibold tracking-tight"
              onClick={() => setMobileMenuOpen(false)}
            >
              {brandLabel}
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md border border-gray-800 p-2 text-gray-300 hover:bg-gray-900 hover:text-white transition-colors"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            <div className="space-y-2">
              {primaryLinks.map((link) => (
                <NavLink
                  key={`mobile-${link.href}`}
                  href={link.href}
                  label={link.label}
                  onClick={() => setMobileMenuOpen(false)}
                  variant="mobile"
                />
              ))}
            </div>

            {dropdownMenus.length > 0 && (
              <div className="space-y-5">
                {dropdownMenus.map((menu) => (
                  <div key={`mobile-${menu.label}`} className="space-y-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">{menu.label}</p>
                    <div className="space-y-2">
                      {menu.links?.map((link) => (
                        <NavLink
                          key={`mobile-${menu.label}-${link.href}`}
                          href={link.href}
                          label={link.label}
                          onClick={() => setMobileMenuOpen(false)}
                          variant="mobile"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-800 px-4 py-4">
            <SimpleUnifiedWalletButton className="w-full justify-center" />
          </div>
        </aside>
      </div>
    </header>
  );
}
