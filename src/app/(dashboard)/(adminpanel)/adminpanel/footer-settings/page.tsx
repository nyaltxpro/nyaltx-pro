'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface FooterSettings {
  title: string;
  subtitle: string;
  description: string;
  newsletterTitle: string;
  newsletterDescription: string;
  socialTitle: string;
  socialDescription: string;
  disclaimer: string;
  copyright: string;
  socialLinks: {
    twitter: string;
    discord: string;
    youtube: string;
    telegram: string;
  };
  footerLinks: Array<{
    name: string;
    url: string;
    enabled: boolean;
  }>;
}

interface FooterLink {
  name: string;
  url: string;
  enabled: boolean;
}

export default function FooterSettingsPage() {
  const [settings, setSettings] = useState<FooterSettings>({
    title: '',
    subtitle: '',
    description: '',
    newsletterTitle: '',
    newsletterDescription: '',
    socialTitle: '',
    socialDescription: '',
    disclaimer: '',
    copyright: '',
    socialLinks: {
      twitter: '',
      discord: '',
      youtube: '',
      telegram: ''
    },
    footerLinks: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/footer-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        setMessage({ type: 'error', text: 'Failed to load footer settings' });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Error loading footer settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/footer-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Footer settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error saving footer settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof FooterSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform: keyof FooterSettings['socialLinks'], value: string) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleFooterLinkChange = (index: number, field: keyof FooterLink, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      footerLinks: prev.footerLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const addFooterLink = () => {
    setSettings(prev => ({
      ...prev,
      footerLinks: [...prev.footerLinks, { name: '', url: '', enabled: true }]
    }));
  };

  const removeFooterLink = (index: number) => {
    setSettings(prev => ({
      ...prev,
      footerLinks: prev.footerLinks.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00b8d8]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Footer Settings</h1>
        <p className="text-gray-400">Manage footer content, social links, and navigation</p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Main Content Section */}
        <div className="space-y-6">
          <div className="bg-[#1a2332] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Main Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                  placeholder="NYALTX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={settings.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                  placeholder="Get news about cryptocurrencies every day!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={settings.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                  placeholder="Stay Ahead in Crypto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Copyright Text</label>
                <textarea
                  value={settings.copyright}
                  onChange={(e) => handleInputChange('copyright', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                  placeholder="© Nyaltx.io 2025..."
                />
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="bg-[#1a2332] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Newsletter Section</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Newsletter Title</label>
                <input
                  type="text"
                  value={settings.newsletterTitle}
                  onChange={(e) => handleInputChange('newsletterTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                  placeholder="Join Our Community"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Newsletter Description</label>
                <textarea
                  value={settings.newsletterDescription}
                  onChange={(e) => handleInputChange('newsletterDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                  placeholder="Get exclusive crypto insights..."
                />
              </div>
            </div>
          </div>

          {/* Disclaimer Section */}
          <div className="bg-[#1a2332] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Disclaimer</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Disclaimer Text</label>
              <textarea
                value={settings.disclaimer}
                onChange={(e) => handleInputChange('disclaimer', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                placeholder="All content available on our website..."
              />
            </div>
          </div>
        </div>

        {/* Social Links & Footer Links Section */}
        <div className="space-y-6">
          {/* Social Media Section */}
          <div className="bg-[#1a2332] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Social Media</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Social Title</label>
                <input
                  type="text"
                  value={settings.socialTitle}
                  onChange={(e) => handleInputChange('socialTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                  placeholder="Follow us on social media!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Social Description</label>
                <textarea
                  value={settings.socialDescription}
                  onChange={(e) => handleInputChange('socialDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                  placeholder="Follow us on social media..."
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Twitter URL</label>
                  <input
                    type="url"
                    value={settings.socialLinks.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                    placeholder="https://x.com/nyaltx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Discord URL</label>
                  <input
                    type="url"
                    value={settings.socialLinks.discord}
                    onChange={(e) => handleSocialLinkChange('discord', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                    placeholder="https://discord.gg/tFMJ7eHj"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={settings.socialLinks.youtube}
                    onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                    placeholder="https://www.youtube.com/c/Nyaltx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Telegram URL</label>
                  <input
                    type="url"
                    value={settings.socialLinks.telegram}
                    onChange={(e) => handleSocialLinkChange('telegram', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f1923] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                    placeholder="https://t.me/nyaltx"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links Section */}
          <div className="bg-[#1a2332] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Footer Links</h2>
              <button
                onClick={addFooterLink}
                className="flex items-center px-3 py-2 bg-[#00b8d8] text-white rounded-md hover:bg-[#00a0c0] transition-colors"
              >
                <FaPlus className="mr-2" />
                Add Link
              </button>
            </div>
            
            <div className="space-y-3">
              {settings.footerLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-[#0f1923] rounded-md">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={link.name}
                      onChange={(e) => handleFooterLinkChange(index, 'name', e.target.value)}
                      placeholder="Link Name"
                      className="px-3 py-2 bg-[#1a2332] border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => handleFooterLinkChange(index, 'url', e.target.value)}
                      placeholder="/page-url"
                      className="px-3 py-2 bg-[#1a2332] border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8]"
                    />
                  </div>
                  
                  <button
                    onClick={() => handleFooterLinkChange(index, 'enabled', !link.enabled)}
                    className={`p-2 rounded ${link.enabled ? 'text-green-400' : 'text-gray-500'}`}
                    title={link.enabled ? 'Enabled' : 'Disabled'}
                  >
                    {link.enabled ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  
                  <button
                    onClick={() => removeFooterLink(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                    title="Remove Link"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 bg-[#00b8d8] text-white rounded-lg hover:bg-[#00a0c0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaSave className="mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
