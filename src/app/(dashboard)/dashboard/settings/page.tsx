"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useDisconnect } from 'wagmi';
import toast from 'react-hot-toast';
import { 
  FaMoon, 
  FaSun, 
  FaBell, 
  FaGlobe, 
  FaLock, 
  FaUser, 
  FaWallet, 
  FaChartLine,
  FaSave,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaCog,
  FaPalette,
  FaVolumeUp,
  FaDatabase,
  FaCheck,
  FaTimes
} from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

// Settings interface
interface UserSettings {
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  
  // Notifications
  priceAlerts: boolean;
  newListings: boolean;
  airdrops: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  
  // Privacy
  cookies: boolean;
  analytics: boolean;
  publicProfile: boolean;
  
  // Trading
  defaultSlippage: number;
  gasPreference: 'standard' | 'fast' | 'instant';
  showTradeHistory: boolean;
  autoApprove: boolean;
  
  // Language & Region
  language: string;
  currency: string;
  timezone: string;
  
  // Profile
  username: string;
  email: string;
  bio: string;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  accentColor: '#06b6d4',
  fontSize: 'medium',
  priceAlerts: true,
  newListings: false,
  airdrops: true,
  emailNotifications: true,
  pushNotifications: false,
  cookies: true,
  analytics: true,
  publicProfile: false,
  defaultSlippage: 1.0,
  gasPreference: 'fast',
  showTradeHistory: true,
  autoApprove: false,
  language: 'en',
  currency: 'USD',
  timezone: 'UTC',
  username: '',
  email: '',
  bio: ''
};

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  const [activeTab, setActiveTab] = useState("appearance");
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nyaltx_settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    
    // Apply accent color
    root.style.setProperty('--accent-color', settings.accentColor);
  }, [settings.theme, settings.accentColor]);

  // Update settings
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Save settings
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('nyaltx_settings', JSON.stringify(settings));
      setHasChanges(false);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset settings
  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      setSettings(defaultSettings);
      setHasChanges(true);
      toast.success('Settings reset to default');
    }
  };

  // Clear all data
  const clearAllData = () => {
    if (confirm('This will clear all your data including settings, favorites, and cache. Are you sure?')) {
      localStorage.clear();
      sessionStorage.clear();
      setSettings(defaultSettings);
      setHasChanges(false);
      toast.success('All data cleared');
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'privacy', label: 'Privacy & Security', icon: FaLock },
    { id: 'account', label: 'Account', icon: FaUser },
    { id: 'wallet', label: 'Wallet', icon: FaWallet },
    { id: 'trading', label: 'Trading', icon: FaChartLine },
    { id: 'language', label: 'Language & Region', icon: FaGlobe },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-400 mt-1">Customize your NYALTX experience</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={saveSettings}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
                  >
                    <FaSave className="w-4 h-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </motion.div>
              )}
              
              <button
                onClick={resetSettings}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <FaTrash className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-80">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 sticky top-32">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30'
                          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="ml-auto w-2 h-2 bg-cyan-400 rounded-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>
              
              {/* Wallet Status */}
              {isConnected && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <FaWallet className="w-4 h-4" />
                    <span className="font-medium">Wallet Connected</span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">{address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8"
              >
                {activeTab === 'appearance' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Appearance</h2>
                      <p className="text-gray-400">Customize the look and feel of your interface</p>
                    </div>

                    {/* Theme Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'light', label: 'Light', icon: FaSun },
                          { value: 'dark', label: 'Dark', icon: FaMoon },
                          { value: 'auto', label: 'Auto', icon: FaCog },
                        ].map((theme) => {
                          const Icon = theme.icon;
                          return (
                            <motion.button
                              key={theme.value}
                              onClick={() => updateSetting('theme', theme.value as any)}
                              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                settings.theme === theme.value
                                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                  : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Icon className="w-6 h-6 mx-auto mb-2" />
                              <span className="block font-medium">{theme.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Accent Color</h3>
                      <div className="grid grid-cols-6 gap-3">
                        {[
                          '#06b6d4', '#3b82f6', '#8b5cf6', '#ef4444', 
                          '#f59e0b', '#10b981', '#f97316', '#ec4899'
                        ].map((color) => (
                          <motion.button
                            key={color}
                            onClick={() => updateSetting('accentColor', color)}
                            className={`w-12 h-12 rounded-lg border-2 ${
                              settings.accentColor === color
                                ? 'border-white scale-110'
                                : 'border-gray-600 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {settings.accentColor === color && (
                              <FaCheck className="w-4 h-4 text-white mx-auto" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Font Size</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'small', label: 'Small', size: 'text-sm' },
                          { value: 'medium', label: 'Medium', size: 'text-base' },
                          { value: 'large', label: 'Large', size: 'text-lg' },
                        ].map((size) => (
                          <button
                            key={size.value}
                            onClick={() => updateSetting('fontSize', size.value as any)}
                            className={`p-4 rounded-lg border transition-all duration-200 ${
                              settings.fontSize === size.value
                                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                            }`}
                          >
                            <span className={`block font-medium ${size.size}`}>{size.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Notifications</h2>
                      <p className="text-gray-400">Configure your notification preferences</p>
                    </div>

                    <div className="space-y-6">
                      {[
                        { key: 'priceAlerts', label: 'Price Alerts', desc: 'Get notified when token prices change significantly' },
                        { key: 'newListings', label: 'New Token Listings', desc: 'Get notified when new tokens are listed' },
                        { key: 'airdrops', label: 'Airdrops', desc: 'Get notified about new airdrops and rewards' },
                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive browser push notifications' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                          <div>
                            <h3 className="font-semibold text-white">{item.label}</h3>
                            <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={settings[item.key as keyof UserSettings] as boolean}
                              onChange={(e) => updateSetting(item.key as keyof UserSettings, e.target.checked as any)}
                            />
                            <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-600 peer-checked:to-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Privacy & Security</h2>
                      <p className="text-gray-400">Manage your privacy and security settings</p>
                    </div>

                    <div className="space-y-6">
                      {[
                        { key: 'cookies', label: 'Cookies', desc: 'Allow cookies to enhance your browsing experience' },
                        { key: 'analytics', label: 'Analytics', desc: 'Allow us to collect anonymous usage data to improve the platform' },
                        { key: 'publicProfile', label: 'Public Profile', desc: 'Make your profile visible to other users' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                          <div>
                            <h3 className="font-semibold text-white">{item.label}</h3>
                            <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={settings[item.key as keyof UserSettings] as boolean}
                              onChange={(e) => updateSetting(item.key as keyof UserSettings, e.target.checked as any)}
                            />
                            <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-600 peer-checked:to-blue-600"></div>
                          </label>
                        </div>
                      ))}

                      <div className="mt-8 p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                        <div className="space-y-4">
                          <button
                            onClick={clearAllData}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <FaDatabase className="w-4 h-4" />
                            Clear All Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Account</h2>
                      <p className="text-gray-400">Manage your account information</p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                          <input
                            type="text"
                            value={settings.username}
                            onChange={(e) => updateSetting('username', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                            placeholder="Enter your username"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                          <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => updateSetting('email', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                        <textarea
                          value={settings.bio}
                          onChange={(e) => updateSetting('bio', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'wallet' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Wallet</h2>
                      <p className="text-gray-400">Manage your wallet connections and preferences</p>
                    </div>

                    {isConnected ? (
                      <div className="space-y-6">
                        <div className="p-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-green-400 mb-2">Wallet Connected</h3>
                              <p className="text-gray-300 font-mono text-sm">{address}</p>
                            </div>
                            <button
                              onClick={() => disconnect()}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FaWallet className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Wallet Connected</h3>
                        <p className="text-gray-500 mb-6">Connect your wallet to access trading features</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'trading' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Trading</h2>
                      <p className="text-gray-400">Configure your trading preferences</p>
                    </div>

                    <div className="space-y-6">
                      {/* Slippage */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Default Slippage</h3>
                        <div className="flex items-center gap-3">
                          {[0.5, 1.0, 2.0, 5.0].map((slippage) => (
                            <button
                              key={slippage}
                              onClick={() => updateSetting('defaultSlippage', slippage)}
                              className={`px-4 py-2 rounded-lg transition-all ${
                                settings.defaultSlippage === slippage
                                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              {slippage}%
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Gas Preference */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Gas Preference</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { value: 'standard', label: 'Standard', desc: 'Lower cost, slower' },
                            { value: 'fast', label: 'Fast', desc: 'Balanced cost and speed' },
                            { value: 'instant', label: 'Instant', desc: 'Higher cost, faster' },
                          ].map((gas) => (
                            <button
                              key={gas.value}
                              onClick={() => updateSetting('gasPreference', gas.value as any)}
                              className={`p-4 rounded-lg border text-left transition-all ${
                                settings.gasPreference === gas.value
                                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                  : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                              }`}
                            >
                              <div className="font-semibold">{gas.label}</div>
                              <div className="text-sm opacity-75">{gas.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Trading Options */}
                      <div className="space-y-4">
                        {[
                          { key: 'showTradeHistory', label: 'Show Trade History', desc: 'Display your trade history on charts' },
                          { key: 'autoApprove', label: 'Auto Approve Transactions', desc: 'Automatically approve known transactions' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                            <div>
                              <h3 className="font-semibold text-white">{item.label}</h3>
                              <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings[item.key as keyof UserSettings] as boolean}
                                onChange={(e) => updateSetting(item.key as keyof UserSettings, e.target.checked as any)}
                              />
                              <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-600 peer-checked:to-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'language' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Language & Region</h2>
                      <p className="text-gray-400">Configure your language and regional preferences</p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                          <select
                            value={settings.language}
                            onChange={(e) => updateSetting('language', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                          >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="zh">中文</option>
                            <option value="ja">日本語</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                          <select
                            value={settings.currency}
                            onChange={(e) => updateSetting('currency', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="JPY">JPY (¥)</option>
                            <option value="BTC">BTC (₿)</option>
                            <option value="ETH">ETH (Ξ)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                        <select
                          value={settings.timezone}
                          onChange={(e) => updateSetting('timezone', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                          <option value="Asia/Tokyo">Tokyo</option>
                          <option value="Asia/Shanghai">Shanghai</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
