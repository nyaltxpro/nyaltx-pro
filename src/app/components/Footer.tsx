'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaTwitter, FaDiscord, FaTelegram, FaReddit, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#0a0e17] text-white text-xs border-t border-gray-800 py-2 px-4">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="text-gray-400 hover:text-white transition-colors" />
          </Link>
          <Link href="https://discord.com" target="_blank" rel="noopener noreferrer">
            <FaDiscord className="text-gray-400 hover:text-white transition-colors" />
          </Link>
          <Link href="https://telegram.org" target="_blank" rel="noopener noreferrer">
            <FaTelegram className="text-gray-400 hover:text-white transition-colors" />
          </Link>
          <Link href="https://reddit.com" target="_blank" rel="noopener noreferrer">
            <FaReddit className="text-gray-400 hover:text-white transition-colors" />
          </Link>
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
            <FaGithub className="text-gray-400 hover:text-white transition-colors" />
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/general-disclaimer" className="text-gray-400 hover:text-white transition-colors">
            General Disclaimer
          </Link>
          <Link href="/legal-notice" className="text-gray-400 hover:text-white transition-colors">
            Legal Notice
          </Link>
          <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/faqs" className="text-gray-400 hover:text-white transition-colors">
            FAQs
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
            Contact
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">©2023-2025 DexTools</span>
          <span className="text-gray-400 px-1">|</span>
          <span className="text-gray-400">support@dextools.io</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href="https://apps.apple.com/app/dextools" target="_blank" rel="noopener noreferrer">
            <Image src="/app-store-badge.svg" alt="App Store" width={80} height={24} />
          </Link>
          <Link href="https://play.google.com/store/apps/details?id=com.dextools" target="_blank" rel="noopener noreferrer">
            <Image src="/google-play-badge.svg" alt="Google Play" width={80} height={24} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
