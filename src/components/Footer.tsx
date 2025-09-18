'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaTwitter, FaTelegram, FaTiktok, FaYoutube } from 'react-icons/fa';
import { SiMedium } from 'react-icons/si';
import { BsInstagram, BsMedium } from 'react-icons/bs';
import { FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="relative text-white border-t border-white/10 py-10 px-4 mt-8 font-poppins md:ml-16">
      {/* subtle aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 left-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_95%,rgba(255,255,255,0.04)_95%,rgba(255,255,255,0.04)_100%),linear-gradient(to_bottom,transparent_0,transparent_95%,rgba(255,255,255,0.04)_95%,rgba(255,255,255,0.04)_100%)] bg-[length:22px_22px] opacity-10" />
      </div>
      <div className="container mx-auto max-w-7xl px-4">
        {/* Top section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Left column */}
          <div className='xl:col-span-2'>
            <div className='p-5'>
            <h2 className="text-xl font-medium mb-4">Get news about cryptocurrencies every day!</h2>
            <h3 className="text-lg font-medium mb-4">Be part of Nyaltx Force community! The premium community of Nyaltx</h3>
            <p className="text-sm text-justify mb-4">
              A group of elite traders and investors focused on DEFI. You can join now our exclusive Telegram and get all community benefits including
              contests, investing tips and advanced market info. There are 3 tiers:
            </p>
            </div>
          </div>

          {/* Right column */}
          <div className='xl:col-span-1'>
            <h3 className="text-lg font-medium mb-4">Follow us on social media!</h3>
            <p className="text-sm mb-6">
              Follow us on social media and find all you need to know about crypto world!
            </p>

            {/* Social media icons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <Link href="https://x.com/nyaltx" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/20 transition-colors">
                <FaXTwitter className="text-xl mb-1 opacity-90" />
                <span className="text-xs text-gray-300/90">Twitter</span>
              </Link>
              <Link href="https://www.instagram.com/Nyaltx.io/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/20 transition-colors">
                <BsInstagram className="text-xl mb-1 opacity-90" />
                <span className="text-xs text-gray-300/90">Instagram</span>
              </Link>
              <Link href="https://www.youtube.com/c/Nyaltx" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/20 transition-colors">
                <FaYoutube className="text-xl mb-1 opacity-90" />
                <span className="text-xs text-gray-300/90">Youtube</span>
              </Link>
              <Link href="https://t.me/NyaltxCommunity" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/20 transition-colors">
                <FaTelegram className="text-xl mb-1 opacity-90" />
                <span className="text-xs text-gray-300/90">Telegram</span>
              </Link>
              <Link href="https://www.tiktok.com/@Nyaltx.io" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/20 transition-colors">
                <FaTiktok className="text-xl mb-1 opacity-90" />
                <span className="text-xs text-gray-300/90">TikTok</span>
              </Link>
              <Link href="https://medium.com/@NyaltxOfficial" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/20 transition-colors">
                <BsMedium  className="text-xl mb-1 opacity-90" />
                <span className="text-xs text-gray-300/90">Medium</span>
              </Link>
            </div>
          </div>
        </div>

        <div className='flex w-full flex-col backdrop-blur'>
          {/* Disclaimer */}
          <div className="text-xs text-justify text-gray-400/90 mb-6 max-w-full mx-auto px-2 sm:px-4 leading-relaxed">
            All content available on our website, on hyperlinked websites, and on applications, forums, blogs, social media accounts and other platforms associated with Nyaltxools is intended solely to provide you with general information. We make no warranties of any kind with respect to our content, including, but not limited to, the accuracy and currency of the information. None of the content we provide should be construed as financial, legal or any other type of advice on which you may rely. Nothing on our Site should be considered an invitation or offer to take any action.
          </div>

          {/* Bottom section with links and app store badges */}
          <div className="flex flex-col items-center pt-4 w-full">
            {/* Social icons */}
            {/* <div className="flex flex-wrap justify-center items-center gap-4 mb-4 md:mb-0">
              <Link href="https://x.com/nyaltx" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><FaXTwitter /></Link>
              <Link href="https://t.me/nyaltx" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><FaTelegram /></Link>
              <Link href="https://medium.com/@Nyaltx" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><BsMedium /></Link>
              <Link href="https://www.instagram.com/Nyaltx" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><BsInstagram /></Link>
              <Link href="https://www.youtube.com/c/Nyaltx" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><FaYoutube /></Link>
            </div> */}

            {/* App store badges */}
            {/* <div className="flex w-full md:w-auto justify-center gap-4 my-4 md:my-0">
              <Link href="https://apps.apple.com/app/Nyaltx" target="_blank" rel="noopener noreferrer">
                <Image src="/app-store-badge.svg" alt="App Store" width={120} height={40} />
              </Link>
              <Link href="https://play.google.com/store/apps/details?id=com.Nyaltx" target="_blank" rel="noopener noreferrer">
                <Image src="/google-play-badge.svg" alt="Google Play" width={135} height={40} />
              </Link>
            </div> */}

            <div className="flex flex-col w-full items-center justify-center mt-6 text-sm space-y-4 px-2">
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 max-w-4xl">
                <Link href="/general-statement" className="text-gray-300 hover:text-white text-xs sm:text-sm">General Statement</Link>
                <Link href="/legal-advice" className="text-gray-300 hover:text-white text-xs sm:text-sm">Legal Advice</Link>
                <Link href="/about-us" className="text-gray-300 hover:text-white text-xs sm:text-sm">About us</Link>
                <Link href="/pro-signup" className="text-gray-300 hover:text-white text-xs sm:text-sm">Nyaltx Pro</Link>
                <Link href="/team" className="text-gray-300 hover:text-white text-xs sm:text-sm">Team</Link>
                <Link href="/contact" className="text-gray-300 hover:text-white text-xs sm:text-sm">Contact</Link>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white text-xs sm:text-sm">Privacy policy</Link>
                <Link href="/cookies-settings" className="text-gray-300 hover:text-white text-xs sm:text-sm">Cookie Settings</Link>
              </div>

              <div className="text-xs text-gray-400/90 text-center px-2 max-w-full break-words">
                © Nyaltx.io 2025 - 2149.0 - info@Nyaltx.io | Ads & Marketing: marketing@Nyaltx.io
              </div>
            </div>
          </div>
        </div>
        {/* Footer links */}

      </div>
    </footer>
  );
};

export default Footer;
