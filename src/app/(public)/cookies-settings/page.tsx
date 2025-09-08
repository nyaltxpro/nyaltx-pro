'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    <div className="min-h-screen bg-[#0f1923] text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Cookie Settings</h1>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
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
          
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Manage Cookie Preferences</h2>
            
            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">Necessary Cookies</h3>
                  <p className="text-gray-300 text-sm">
                    These cookies are essential for the website to function properly and cannot be disabled.
                  </p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={cookieConsent.necessary} 
                    disabled={true}
                    className="w-5 h-5 accent-blue-500"
                  />
                </div>
              </div>
              
              {/* Functional Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">Functional Cookies</h3>
                  <p className="text-gray-300 text-sm">
                    These cookies enable personalized features and functionality.
                  </p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={cookieConsent.functional} 
                    onChange={(e) => setCookieConsent({...cookieConsent, functional: e.target.checked})}
                    className="w-5 h-5 accent-blue-500"
                  />
                </div>
              </div>
              
              {/* Analytics Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">Analytics Cookies</h3>
                  <p className="text-gray-300 text-sm">
                    These cookies help us understand how visitors interact with our website.
                  </p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={cookieConsent.analytics} 
                    onChange={(e) => setCookieConsent({...cookieConsent, analytics: e.target.checked})}
                    className="w-5 h-5 accent-blue-500"
                  />
                </div>
              </div>
              
              {/* Marketing Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">Marketing Cookies</h3>
                  <p className="text-gray-300 text-sm">
                    These cookies are used to track visitors across websites to display relevant advertisements.
                  </p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={cookieConsent.marketing} 
                    onChange={(e) => setCookieConsent({...cookieConsent, marketing: e.target.checked})}
                    className="w-5 h-5 accent-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <button 
                onClick={savePreferences}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Save Preferences
              </button>
              
              <button 
                onClick={acceptAllCookies}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Accept All
              </button>
              
              <button 
                onClick={rejectNonEssentialCookies}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Reject Non-Essential
              </button>
            </div>
            
            {/* Success Message */}
            {showSuccess && (
              <div className="mt-4 p-3 bg-green-800 bg-opacity-30 text-green-300 rounded-lg">
                Your cookie preferences have been saved successfully!
              </div>
            )}
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Cookie Policy</h2>
            <p className="mb-4">
              Our Cookie Policy explains what cookies are, how we use them, how third parties we may partner with may use cookies on our website,
              your choices regarding cookies, and further information about cookies.
            </p>
            <p>
              For more information, please read our full <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
