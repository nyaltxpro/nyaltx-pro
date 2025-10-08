'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChevronDown } from 'react-icons/fa';
import ConnectWalletButton from './ConnectWalletButton';

export default function PublicHeader() {
  const pathname = usePathname();
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAboutDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
    return (
      <Link
        href={href}
        className={
          active
            ? 'px-3 py-2 text-sm text-cyan-300'
            : 'px-3 py-2 text-sm text-gray-300 hover:text-white'
        }
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
        onClick={() => setIsAboutDropdownOpen(false)}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="z-40 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-4">
        {/* Logo - Left */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-base md:text-lg font-semibold tracking-tight">NYALTX</span>
          </Link>
        </div>

        {/* Navigation - Center */}
        <nav className="hidden md:flex items-center justify-center flex-1 gap-1 text-sm">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/pricing" label="Pricing" />
          <NavLink href="/contact" label="Contact us" />
          {/* About Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              More
              <FaChevronDown
                className={`w-3 h-3 transition-transform ${isAboutDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isAboutDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50">
                <div className="py-1">
                  <DropdownLink href="/about-us" label="About Us" />
                  <DropdownLink href="/contact" label="Contact" />
                  <DropdownLink href="/team" label="Team" />
                  <DropdownLink href="/careers" label="Careers" />
                  <DropdownLink href="/blog" label="Blog" />
                  <DropdownLink href="/help" label="Help & Support" />
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Connect Wallet - Right */}
        <div className="shrink-0 flex items-center gap-2">
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
