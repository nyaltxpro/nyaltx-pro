'use client';

import React, { useState, useEffect } from 'react';
import PublicHeader from '@/components/PublicHeader';
import { motion } from 'framer-motion';
import { FaCookie } from 'react-icons/fa';

export default function CookiesSettings() {
  // Cookie consent state
  const [cookieConsent, setCookieConsent] = useState({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false
  });

  // Load saved preferences on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('cookieConsent');
    if (savedPreferences) {
      setCookieConsent(JSON.parse(savedPreferences));
    }
  }, []);

  // Save preferences
  const savePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(cookieConsent));
    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Accept all cookies
  const acceptAllCookies = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    setCookieConsent(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Reject non-essential cookies
  const rejectNonEssentialCookies = () => {
    const essentialOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    setCookieConsent(essentialOnly);
    localStorage.setItem('cookieConsent', JSON.stringify(essentialOnly));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Success message state
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <PublicHeader />

      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_-100px,rgba(56,189,248,0.12),rgba(67,56,202,0)_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_80%_10%,rgba(99,102,241,0.18),rgba(14,165,233,0)_60%)]" />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start gap-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
            <FaCookie className="h-4 w-4 text-cyan-300" />
            <span>Privacy & Preferences</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">Cookie Settings</span>
          </h1>
          <p className="max-w-3xl text-white/70">Control how we use cookies to improve your experience. You can update these at any time.</p>
        </motion.div>
      </section>

      <main className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* About Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 blur-[10px]" />
            <div className="relative p-6 md:p-10">
              <h2 className="text-2xl font-semibold mb-4">About Cookies</h2>
              <p className="mb-4">
                Cookies are small text files that are placed on your device to help the site provide a better user experience.
                In general, cookies are used to retain user preferences, store information for things like shopping carts,
                and provide anonymized tracking data to third-party applications like Google Analytics.
              </p>
              <p>
                As a rule, cookies will make your browsing experience better. However, you may prefer to disable cookies on this site and on others.
                The most effective way to do this is to disable cookies in your browser. We suggest consulting the Help section of your browser.
              </p>
            </div>
          </motion.div>

          {/* Manage Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 blur-[10px]" />
            <div className="relative p-6 md:p-10">
              <h2 className="text-2xl font-semibold mb-4">Manage Cookie Preferences</h2>
              <div className="space-y-6">
                {/* Necessary Cookies */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                <div>
                  <h3 className="font-semibold text-lg">Necessary Cookies</h3>
                  <p className="text-white/70 text-sm">
                    These cookies are essential for the website to function properly and cannot be disabled.
                  </p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={cookieConsent.necessary} 
                    disabled={true}
                    className="w-5 h-5 accent-sky-400"
                  />
                </div>
              </div>
              
              {/* Functional Cookies */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                <div>
                  <h3 className="font-semibold text-lg">Functional Cookies</h3>
                  <p className="text-white/70 text-sm">
                    These cookies enable personalized features and functionality.
                  </p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={cookieConsent.functional} 
                    onChange={(e) => setCookieConsent({...cookieConsent, functional: e.target.checked})}
                    className="w-5 h-5 accent-sky-400"
                  />
                </div>
              </div>
              
              {/* Analytics Cookies */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                <div>
                  <h3 className="font-semibold text-lg">Analytics Cookies</h3>
                  <p className="text-white/70 text-sm">
                    These cookies help us understand how visitors interact with our website.
                  </p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={cookieConsent.analytics} 
                    onChange={(e) => setCookieConsent({...cookieConsent, analytics: e.target.checked})}
                    className="w-5 h-5 accent-sky-400"
                  />
                </div>
              </div>
              
              {/* Marketing Cookies */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                <div>
                  <h3 className="font-semibold text-lg">Marketing Cookies</h3>
                  <p className="text-white/70 text-sm">
                    These cookies are used to track visitors across websites to display relevant advertisements.
                  </p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={cookieConsent.marketing} 
                    onChange={(e) => setCookieConsent({...cookieConsent, marketing: e.target.checked})}
                    className="w-5 h-5 accent-sky-400"
                  />
                </div>
              </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button 
                  onClick={savePreferences}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Save Preferences
                </button>
                
                <button 
                  onClick={acceptAllCookies}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Accept All
                </button>
                
                <button 
                  onClick={rejectNonEssentialCookies}
                  className="bg-white/10 hover:bg-white/15 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Reject Non-Essential
                </button>
              </div>

              {/* Success Message */}
              {showSuccess && (
                <div className="mt-4 p-3 bg-emerald-900/30 text-emerald-300 rounded-lg">
                  Your cookie preferences have been saved successfully!
                </div>
              )}
            </div>
          </motion.div>

          {/* Policy */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 blur-[10px]" />
            <div className="relative p-6 md:p-10">
              <h2 className="text-2xl font-semibold mb-4">Cookie Policy</h2>
              <p className="mb-4">
                Our Cookie Policy explains what cookies are, how we use them, how third parties we may partner with may use cookies on our website,
                your choices regarding cookies, and further information about cookies.
              </p>
              <p>
                For more information, please read our full <a href="#" className="text-sky-300 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

