"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { FaMoon, FaSun, FaBell, FaGlobe, FaLock, FaUser, FaWallet, FaChartLine } from "react-icons/fa";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("appearance");

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const storedDarkMode = localStorage.getItem('darkMode');
      if (storedDarkMode !== null) {
        setDarkMode(storedDarkMode === 'true');
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
  }, []);

  // Save settings to localStorage
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header /> */}

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-gray-800 rounded-lg p-4">
              <ul>
                <li 
                  className={`flex items-center p-3 rounded-md cursor-pointer mb-2 ${activeTab === 'appearance' ? 'bg-primary bg-opacity-20 text-primary' : 'hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('appearance')}
                >
                  <FaMoon className="mr-3" />
                  <span>Appearance</span>
                </li>
                <li 
                  className={`flex items-center p-3 rounded-md cursor-pointer mb-2 ${activeTab === 'notifications' ? 'bg-primary bg-opacity-20 text-primary' : 'hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <FaBell className="mr-3" />
                  <span>Notifications</span>
                </li>
                <li 
                  className={`flex items-center p-3 rounded-md cursor-pointer mb-2 ${activeTab === 'language' ? 'bg-primary bg-opacity-20 text-primary' : 'hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('language')}
                >
                  <FaGlobe className="mr-3" />
                  <span>Language</span>
                </li>
                <li 
                  className={`flex items-center p-3 rounded-md cursor-pointer mb-2 ${activeTab === 'privacy' ? 'bg-primary bg-opacity-20 text-primary' : 'hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('privacy')}
                >
                  <FaLock className="mr-3" />
                  <span>Privacy</span>
                </li>
                <li 
                  className={`flex items-center p-3 rounded-md cursor-pointer mb-2 ${activeTab === 'account' ? 'bg-primary bg-opacity-20 text-primary' : 'hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('account')}
                >
                  <FaUser className="mr-3" />
                  <span>Account</span>
                </li>
                <li 
                  className={`flex items-center p-3 rounded-md cursor-pointer mb-2 ${activeTab === 'wallet' ? 'bg-primary bg-opacity-20 text-primary' : 'hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('wallet')}
                >
                  <FaWallet className="mr-3" />
                  <span>Wallet</span>
                </li>
                <li 
                  className={`flex items-center p-3 rounded-md cursor-pointer mb-2 ${activeTab === 'trading' ? 'bg-primary bg-opacity-20 text-primary' : 'hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('trading')}
                >
                  <FaChartLine className="mr-3" />
                  <span>Trading</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Content */}
          <div className="w-full md:w-3/4">
            <div className="bg-gray-800 rounded-lg p-6">
              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Appearance</h2>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Theme</h3>
                    <div className="flex items-center space-x-4">
                      <button 
                        className={`flex items-center justify-center p-4 rounded-lg border ${darkMode ? 'border-gray-600' : 'border-primary'}`}
                        onClick={() => setDarkMode(false)}
                      >
                        <div className="flex flex-col items-center">
                          <FaSun className={`text-2xl mb-2 ${!darkMode ? 'text-primary' : 'text-gray-400'}`} />
                          <span className={!darkMode ? 'text-primary' : 'text-gray-400'}>Light</span>
                        </div>
                      </button>
                      
                      <button 
                        className={`flex items-center justify-center p-4 rounded-lg border ${darkMode ? 'border-primary' : 'border-gray-600'}`}
                        onClick={() => setDarkMode(true)}
                      >
                        <div className="flex flex-col items-center">
                          <FaMoon className={`text-2xl mb-2 ${darkMode ? 'text-primary' : 'text-gray-400'}`} />
                          <span className={darkMode ? 'text-primary' : 'text-gray-400'}>Dark</span>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Dark Mode</h3>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={darkMode}
                          onChange={handleDarkModeToggle}
                        />
                        <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        <span className="ms-3 text-sm font-medium">{darkMode ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Notifications</h2>
                  <p className="text-gray-400">Configure your notification preferences.</p>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <h3 className="font-medium">Price Alerts</h3>
                        <p className="text-sm text-gray-400">Get notified when token prices change significantly</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <h3 className="font-medium">New Token Listings</h3>
                        <p className="text-sm text-gray-400">Get notified when new tokens are listed</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <h3 className="font-medium">Airdrops</h3>
                        <p className="text-sm text-gray-400">Get notified about new airdrops</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'language' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Language</h2>
                  <p className="text-gray-400 mb-6">Select your preferred language.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer bg-primary bg-opacity-10">
                      <input type="radio" name="language" id="english" className="mr-3" defaultChecked />
                      <label htmlFor="english" className="cursor-pointer flex-1">English</label>
                    </div>
                    <div className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700">
                      <input type="radio" name="language" id="spanish" className="mr-3" />
                      <label htmlFor="spanish" className="cursor-pointer flex-1">Español</label>
                    </div>
                    <div className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700">
                      <input type="radio" name="language" id="french" className="mr-3" />
                      <label htmlFor="french" className="cursor-pointer flex-1">Français</label>
                    </div>
                    <div className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700">
                      <input type="radio" name="language" id="german" className="mr-3" />
                      <label htmlFor="german" className="cursor-pointer flex-1">Deutsch</label>
                    </div>
                    <div className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700">
                      <input type="radio" name="language" id="chinese" className="mr-3" />
                      <label htmlFor="chinese" className="cursor-pointer flex-1">中文</label>
                    </div>
                    <div className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700">
                      <input type="radio" name="language" id="japanese" className="mr-3" />
                      <label htmlFor="japanese" className="cursor-pointer flex-1">日本語</label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Privacy</h2>
                  <p className="text-gray-400 mb-6">Manage your privacy settings.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <h3 className="font-medium">Cookies</h3>
                        <p className="text-sm text-gray-400">Allow cookies to enhance your browsing experience</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <h3 className="font-medium">Data Collection</h3>
                        <p className="text-sm text-gray-400">Allow us to collect anonymous usage data</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    <div className="mt-6">
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md">
                        Clear All Data
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Account</h2>
                  <p className="text-gray-400 mb-6">Manage your account settings.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Profile Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Username</label>
                          <input 
                            type="text" 
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                            placeholder="Your username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email</label>
                          <input 
                            type="email" 
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Password</h3>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
                        Change Password
                      </button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Danger Zone</h3>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'wallet' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Wallet</h2>
                  <p className="text-gray-400 mb-6">Manage your wallet connections and preferences.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Connected Wallets</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                              <FaWallet />
                            </div>
                            <div>
                              <h4 className="font-medium">MetaMask</h4>
                              <p className="text-sm text-gray-400">0x1a2...3b4c</p>
                            </div>
                          </div>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm">
                            Disconnect
                          </button>
                        </div>
                      </div>
                      
                      <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
                        Connect New Wallet
                      </button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Default Networks</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="radio" name="network" id="ethereum" className="mr-3" defaultChecked />
                          <label htmlFor="ethereum" className="cursor-pointer">Ethereum Mainnet</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" name="network" id="bsc" className="mr-3" />
                          <label htmlFor="bsc" className="cursor-pointer">Binance Smart Chain</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" name="network" id="polygon" className="mr-3" />
                          <label htmlFor="polygon" className="cursor-pointer">Polygon</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trading' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Trading</h2>
                  <p className="text-gray-400 mb-6">Configure your trading preferences.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Default Slippage</h3>
                      <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">0.5%</button>
                        <button className="px-4 py-2 bg-primary bg-opacity-20 text-primary rounded-md">1.0%</button>
                        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">2.0%</button>
                        <div className="relative">
                          <input 
                            type="text" 
                            className="w-24 p-2 bg-gray-700 border border-gray-600 rounded-md"
                            placeholder="Custom"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2">%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Default Gas Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input type="radio" name="gas" id="standard" className="mr-3" />
                          <label htmlFor="standard" className="cursor-pointer">Standard</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" name="gas" id="fast" className="mr-3" defaultChecked />
                          <label htmlFor="fast" className="cursor-pointer">Fast</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" name="gas" id="instant" className="mr-3" />
                          <label htmlFor="instant" className="cursor-pointer">Instant</label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Chart Preferences</h3>
                      <div className="flex items-center justify-between py-3 border-b border-gray-700">
                        <div>
                          <h4 className="font-medium">Show Trade History</h4>
                          <p className="text-sm text-gray-400">Display your trade history on charts</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
