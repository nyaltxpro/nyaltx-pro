'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaBars, FaChevronDown, FaTimes } from 'react-icons/fa';
import { motion } from 'motion/react';
import { usePublicNavigation } from '../hooks/useTinaContent';
import SimpleUnifiedWalletButton from './SimpleUnifiedWalletButton';

export default function PublicHeader() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [announcement, setAnnouncement] = useState<{ enabled: boolean; message: string } | null>(
    null
  );
  const { content } = usePublicNavigation();

  const fallbackPrimaryLinks = [
    { label: 'Dashboard', href: '/dashboard', enabled: true },
    { label: 'News Hub', href: '/newshub', enabled: true },
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
    link => link.enabled !== false
  );

  const dropdownMenus = (content?.dropdownMenus ?? fallbackDropdownMenus)
    .filter(menu => menu.enabled !== false)
    .map(menu => ({
      ...menu,
      links: (menu.links ?? []).filter(link => link.enabled !== false),
    }))
    .filter(menu => (menu.links?.length ?? 0) > 0);

  const brandLabel = content?.brand?.label ?? 'NYALTX';
  const brandHref = content?.brand?.href ?? '/';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDropdown = Object.values(dropdownRefs.current).some(ref =>
        ref?.contains(target)
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
    let active = true;
    fetch('/api/announcement', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok)
          throw new Error(`Announcement request failed with status ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (active) {
          setAnnouncement({
            enabled:
              data.enabled === true &&
              typeof data.message === 'string' &&
              data.message.trim().length > 0,
            message: typeof data.message === 'string' ? data.message.trim() : '',
          });
        }
      })
      .catch(error => {
        console.error('Failed to load announcement banner:', error);
        if (active) setAnnouncement({ enabled: false, message: '' });
      });

    return () => {
      active = false;
    };
  }, []);

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
    const isNewsHub = label === 'News Hub';
    const classes =
      variant === 'desktop'
        ? `group relative overflow-hidden rounded-lg px-4 py-2 text-sm transition-all active:scale-95 ${
            active || isNewsHub ? 'text-white' : 'text-white/75 hover:text-white'
          }`
        : `block w-full rounded-lg px-4 py-3 text-sm transition-colors ${
            active
              ? 'bg-white/10 font-medium text-white'
              : 'text-white/75 hover:bg-white/5 hover:text-white'
          }`;
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {variant === 'desktop' && (
          <span
            className={`absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 transition-opacity ${
              active || isNewsHub ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          />
        )}
        <span className="relative z-10">{label}</span>
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
            ? 'mx-1 block rounded-lg bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-200'
            : 'mx-1 block rounded-lg px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white'
        }
        onClick={() => setOpenDropdown(null)}
      >
        {label}
      </Link>
    );
  };

  return (
    <header
      className={`relative z-[100] bg-transparent transition-[height] duration-200 ${
        announcement?.enabled ? 'h-[116px] md:h-[140px]' : 'h-20'
      }`}
    >
      {announcement?.enabled && (
        <div
          role="status"
          className="fixed left-0 right-0 top-0 z-[102] flex h-9 items-center justify-center overflow-hidden bg-gradient-to-r from-[#0c3140] via-[#12314b] to-[#14264a] px-4 text-center text-xs font-medium text-white shadow-md sm:text-sm"
        >
          <span className="max-w-5xl truncate">{announcement.message}</span>
        </div>
      )}
      <nav
        className={`fixed left-3 right-3 z-[100] mx-auto max-w-6xl overflow-visible rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.035] text-white shadow-[0_12px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:left-6 md:right-6 ${
          announcement?.enabled ? 'top-11 md:top-14' : 'top-3 md:top-6'
        }`}
      >
        <div className="relative z-10 flex min-h-[68px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-5">
          <div className="hidden w-1/2 items-center justify-start gap-0 md:flex">
            {primaryLinks.map(link => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
            {dropdownMenus.map(menu => {
              const isOpen = openDropdown === menu.label;
              return (
                <div
                  key={menu.label}
                  className="relative"
                  ref={element => {
                    dropdownRefs.current[menu.label] = element;
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : menu.label)}
                    className={`group relative flex items-center gap-2 overflow-hidden rounded-lg px-3 py-2 text-sm transition-colors ${
                      isOpen ? 'text-white' : 'text-white/75 hover:text-white'
                    }`}
                  >
                    <span
                      className={`absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    />
                    <span className="relative z-10">{menu.label}</span>
                    <FaChevronDown
                      className={`relative z-10 h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="absolute left-0 top-full z-[110] mt-3 w-56 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#172334]/95 to-[#0b111b]/95 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                      {menu.links?.map(link => (
                        <DropdownLink key={link.href} href={link.href} label={link.label} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Link
            href={brandHref}
            aria-label="NYALTX Pro home"
            className="absolute left-1/2 top-1/2 z-20 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap text-xl font-black tracking-[0.12em] text-white md:text-2xl"
          >
            {brandLabel.replace(/\s+pro$/i, '')}
            <span className="rounded border border-cyan-300/40 bg-cyan-300/10 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.14em] text-cyan-200 md:text-[10px]">
              PRO
            </span>
          </Link>

          <div className="ml-auto hidden shrink-0 md:block">
            <SimpleUnifiedWalletButton />
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(open => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/90 transition hover:bg-white/10 md:hidden"
          >
            {mobileMenuOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
          </button>
        </div>

        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          aria-hidden={!mobileMenuOpen}
          className="overflow-hidden md:hidden"
        >
          <div className="border-t border-white/10 px-4 pb-4 pt-3">
            <div className="space-y-1">
              {primaryLinks.map(link => (
                <NavLink
                  key={`mobile-${link.href}`}
                  href={link.href}
                  label={link.label}
                  onClick={() => setMobileMenuOpen(false)}
                  variant="mobile"
                />
              ))}
            </div>
            {dropdownMenus.map(menu => (
              <div key={`mobile-${menu.label}`} className="mt-5">
                <p className="mb-2 px-4 text-xs uppercase tracking-[0.18em] text-white/40">
                  {menu.label}
                </p>
                <div className="space-y-1">
                  {menu.links?.map(link => (
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
            <div className="mt-4 border-t border-white/10 pt-4">
              <SimpleUnifiedWalletButton className="w-full justify-center" />
            </div>
          </div>
        </motion.div>
      </nav>
    </header>
  );
}
