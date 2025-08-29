'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaTwitter, FaTelegram, FaTiktok, FaYoutube } from 'react-icons/fa';
import { SiMedium } from 'react-icons/si';
import { BsInstagram } from 'react-icons/bs';

const Footer = () => {
  return (
    <footer className="bg-inherit text-white border-t border-gray-800 py-8 px-4 mt-8 font-poppins">
      <div className="container mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Left column */}
          <div className='col-span-2'>
            <h2 className="text-xl font-medium mb-4">Get news about cryptocurrencies every day!</h2>
            <h3 className="text-lg font-medium mb-4">Be part of DEXT Force community! The premium community of DEXTools</h3>
            <p className="text-sm mb-4">
              A group of elite traders and investors focused on DEFI. You can join now our exclusive Telegram and get all community benefits including
              contests, investing tips and advanced market info. There are 3 tiers:
            </p>
            
            {/* Tiers */}
            <div className="grid grid-cols-3 gap-8 mb-8">
              {/* Free Tier */}
              <div className="bg-[#1a2632] rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="mr-2">🐠</div>
                  <h4 className="font-semibold">Free</h4>
                </div>
                <p className="text-xs">
                  Get a taste of our community, get support and join the discussions.
                </p>
              </div>
              
              {/* DEXT Force Tier */}
              <div className="bg-[#1a2632] rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="mr-2">🐬</div>
                  <h4 className="font-semibold">DEXT Force</h4>
                </div>
                <p className="text-xs">
                  You can access holding 1000 DEXT and verifying your wallet.
                </p>
              </div>
              
              {/* DEXT Force Ventures Tier */}
              <div className="bg-[#1a2632] rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="mr-2">🐳</div>
                  <h4 className="font-semibold">DEXT Force Ventures</h4>
                </div>
                <p className="text-xs">
                  You can access holding 10k DEXT, it includes exclusive access to our ventures and all the community deals.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className='col-span-1'>
            <h3 className="text-lg font-medium mb-4">Follow us on social media!</h3>
            <p className="text-sm mb-6">
              Follow us on social media and find all you need to know about crypto world!
            </p>
            
            {/* Social media icons */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <Link href="https://twitter.com/DEXToolsApp" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <FaTwitter className="text-2xl mb-1" />
                <span className="text-xs">Twitter</span>
              </Link>
              <Link href="https://www.instagram.com/dextools.io/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <BsInstagram className="text-2xl mb-1" />
                <span className="text-xs">Instagram</span>
              </Link>
              <Link href="https://www.youtube.com/c/DEXToolsOfficial" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <FaYoutube className="text-2xl mb-1" />
                <span className="text-xs">Youtube</span>
              </Link>
              <Link href="https://t.me/DEXToolsCommunity" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <FaTelegram className="text-2xl mb-1" />
                <span className="text-xs">Telegram</span>
              </Link>
              <Link href="https://www.tiktok.com/@dextools.io" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <FaTiktok className="text-2xl mb-1" />
                <span className="text-xs">TikTok</span>
              </Link>
              <Link href="https://medium.com/@DEXToolsOfficial" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <SiMedium className="text-2xl mb-1" />
                <span className="text-xs">Medium</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="text-xs text-center text-gray-400 mb-6">
          All content available on our website, on hyperlinked websites, and on applications, forums, blogs, social media accounts and other platforms associated with DEXTools is intended solely to provide you with general information. We make no warranties of any kind with respect to our content, including, but not limited to, the accuracy and currency of the information. None of the content we provide should be construed as financial, legal or any other type of advice on which you may rely. Nothing on our Site should be considered an invitation or offer to take any action.
        </div>
        
        {/* Bottom section with links and app store badges */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-800 pt-4">
          {/* Social icons */}
          <div className="flex w-[15%] space-x-4 mb-4 md:mb-0">
            <Link href="https://twitter.com/DEXToolsApp" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="text-gray-400 hover:text-white" />
            </Link>
            <Link href="https://t.me/DEXToolsCommunity" target="_blank" rel="noopener noreferrer">
              <FaTelegram className="text-gray-400 hover:text-white" />
            </Link>
            <Link href="https://medium.com/@DEXToolsOfficial" target="_blank" rel="noopener noreferrer">
              <SiMedium className="text-gray-400 hover:text-white" />
            </Link>
            <Link href="https://www.instagram.com/dextools.io/" target="_blank" rel="noopener noreferrer">
              <BsInstagram className="text-gray-400 hover:text-white" />
            </Link>
            <Link href="https://www.youtube.com/c/DEXToolsOfficial" target="_blank" rel="noopener noreferrer">
              <FaYoutube className="text-gray-400 hover:text-white" />
            </Link>
          </div>
          
          {/* App store badges */}
          <div className="flex w-[20%] mx-2  space-x-4">
            <Link href="https://apps.apple.com/app/dextools" target="_blank" rel="noopener noreferrer">
              <Image src="/app-store-badge.svg" alt="App Store" width={120} height={40} />
            </Link>
            <Link href="https://play.google.com/store/apps/details?id=com.dextools" target="_blank" rel="noopener noreferrer">
              <Image src="/google-play-badge.svg" alt="Google Play" width={135} height={40} />
            </Link>
          </div>

          <div className="flex w-[60%]  flex-wrap justify-center md:justify-between mt-6 text-sm">
          <div className="flex flex-wrap justify-center space-x-4 mb-4 md:mb-0">
            <Link href="/general-statement" className="text-blue-400 hover:text-blue-300">General Statement</Link>
            <Link href="/legal-advice" className="text-blue-400 hover:text-blue-300">Legal Advice</Link>
            <Link href="/about-us" className="text-blue-400 hover:text-blue-300">About us</Link>
            <Link href="/dext-token" className="text-blue-400 hover:text-blue-300">DEXT Token</Link>
            <Link href="/team" className="text-blue-400 hover:text-blue-300">Team</Link>
            <Link href="/contact" className="text-blue-400 hover:text-blue-300">Contact</Link>
            <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300">Privacy policy</Link>
            <Link href="/cookie-settings" className="text-blue-400 hover:text-blue-300">Cookie Settings</Link>
          </div>
          
          <div className="text-xs text-gray-400 text-center md:text-right">
            © DEXTools.io 2025 - 2149.0 - info@dextools.io | Ads & Marketing: marketing@dextools.io
          </div>
        </div>
        </div>
        
        {/* Footer links */}
       
      </div>
    </footer>
  );
};

export default Footer;
