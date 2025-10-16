'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaCheck, FaCoins, FaTimes } from 'react-icons/fa';

interface TokenFormData {
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  contractAddress: string;
  imageUri: string;
  website: string;
  twitter: string;
  telegram: string;
  discord: string;
  github: string;
  userEmail: string;
  autoApprove: boolean;
  addToRace: boolean;
}

export default function AdminTokenRegister() {
  const [formData, setFormData] = useState<TokenFormData>({
    tokenName: '',
    tokenSymbol: '',
    blockchain: 'ethereum',
    contractAddress: '',
    imageUri: '',
    website: '',
    twitter: '',
    telegram: '',
    discord: '',
    github: '',
    userEmail: '',
    autoApprove: true,
    addToRace: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const blockchains = [
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'binance', label: 'Binance Smart Chain' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'arbitrum', label: 'Arbitrum' },
    { value: 'optimism', label: 'Optimism' },
    { value: 'solana', label: 'Solana' },
    { value: 'base', label: 'Base' },
    { value: 'avalanche', label: 'Avalanche' },
  ];

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.tokenName.trim()) {
      showToast('error', 'Token name is required');
      return;
    }
    if (!formData.tokenSymbol.trim()) {
      showToast('error', 'Token symbol is required');
      return;
    }
    if (!formData.contractAddress.trim()) {
      showToast('error', 'Contract address is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Register the token
      const registerResponse = await fetch('/api/tokens/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenName: formData.tokenName.trim(),
          tokenSymbol: formData.tokenSymbol.trim().toUpperCase(),
          blockchain: formData.blockchain,
          contractAddress: formData.contractAddress.trim(),
          imageUri: formData.imageUri.trim() || undefined,
          website: formData.website.trim() || undefined,
          twitter: formData.twitter.trim() || undefined,
          telegram: formData.telegram.trim() || undefined,
          discord: formData.discord.trim() || undefined,
          github: formData.github.trim() || undefined,
          userEmail: formData.userEmail.trim() || undefined,
          paymentMethod: 'admin',
          tier: 'admin_free',
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.error || 'Failed to register token');
      }

      const tokenId = registerData.record?.id;

      // Step 2: Auto-approve if enabled
      if (formData.autoApprove && tokenId) {
        const approveResponse = await fetch('/api/admin/tokens', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: tokenId, status: 'approved' }),
        });

        if (!approveResponse.ok) {
          console.error('Failed to auto-approve token');
        }
      }

      // Step 3: Add to race if enabled
      if (formData.addToRace && tokenId && formData.autoApprove) {
        const raceResponse = await fetch('/api/admin/tokens/race', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenId, action: 'promote' }),
        });

        if (!raceResponse.ok) {
          console.error('Failed to add token to race');
        }
      }

      showToast('success', `Token ${formData.tokenSymbol} registered successfully!`);

      // Reset form
      setFormData({
        tokenName: '',
        tokenSymbol: '',
        blockchain: 'ethereum',
        contractAddress: '',
        imageUri: '',
        website: '',
        twitter: '',
        telegram: '',
        discord: '',
        github: '',
        userEmail: '',
        autoApprove: true,
        addToRace: false,
      });

    } catch (error: any) {
      console.error('Token registration error:', error);
      showToast('error', error.message || 'Failed to register token');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg border ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 border-emerald-700 text-emerald-200'
              : 'bg-rose-900/90 border-rose-700 text-rose-200'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <FaCheck className="w-5 h-5" />
            ) : (
              <FaTimes className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
            <FaCoins className="text-[#00b8d8]" />
            Admin Token Registration
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Register tokens directly without payment or checkout
          </p>
        </div>
        <Link
          href="/admin/tokens"
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <FaArrowLeft />
          Back to Tokens
        </Link>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800/40 backdrop-blur-lg rounded-lg shadow-xl border border-gray-700/20 p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700/50 pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tokenName" className="block text-sm font-medium text-gray-300 mb-2">
                  Token Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="tokenName"
                  name="tokenName"
                  value={formData.tokenName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-transparent"
                  placeholder="Bitcoin"
                  required
                />
              </div>

              <div>
                <label htmlFor="tokenSymbol" className="block text-sm font-medium text-gray-300 mb-2">
                  Token Symbol <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="tokenSymbol"
                  name="tokenSymbol"
                  value={formData.tokenSymbol}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-transparent uppercase"
                  placeholder="BTC"
                  required
                />
              </div>

              <div>
                <label htmlFor="blockchain" className="block text-sm font-medium text-gray-300 mb-2">
                  Blockchain <span className="text-red-400">*</span>
                </label>
                <select
                  id="blockchain"
                  name="blockchain"
                  value={formData.blockchain}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-transparent"
                  required
                >
                  {blockchains.map(chain => (
                    <option key={chain.value} value={chain.value}>
                      {chain.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-300 mb-2">
                  Contract Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="contractAddress"
                  name="contractAddress"
                  value={formData.contractAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-transparent font-mono text-sm"
                  placeholder="0x..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Media & Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700/50 pb-2">
              Media & Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="imageUri" className="block text-sm font-medium text-gray-300 mb-2">
                  Image URI
                </label>
                <input
                  type="text"
                  id="imageUri"
                  name="imageUri"
                  value={formData.imageUri}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-transparent"
                  placeholder="https://... or ipfs://..."
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter/X
                </label>
                <input
                  type="text"
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-transparent"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div>
                <label htmlFor="telegram" className="block text-sm font-medium text-gray-300 mb-2">
                  Telegram
                </label>
                <input
                  type="text"
                  id="telegram"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-transparent"
                  placeholder="https://t.me/..."
                />
              </div>

              <div>
                <label htmlFor="discord" className="block text-sm font-medium text-gray-300 mb-2">
                  Discord
                </label>
                <input
                  type="text"
                  id="discord"
                  name="discord"
                  value={formData.discord}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-transparent"
                  placeholder="https://discord.gg/..."
                />
              </div>

              <div>
                <label htmlFor="github" className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub
                </label>
                <input
                  type="text"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-transparent"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </div>

          {/* Contact & Options */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700/50 pb-2">
              Contact & Options
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="userEmail" className="block text-sm font-medium text-gray-300 mb-2">
                  User Email (Optional)
                </label>
                <input
                  type="email"
                  id="userEmail"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-transparent"
                  placeholder="user@example.com"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Email for sending confirmation (optional)
                </p>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoApprove"
                    name="autoApprove"
                    checked={formData.autoApprove}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#00b8d8] bg-gray-700 border-gray-600 rounded focus:ring-[#00b8d8] focus:ring-2"
                  />
                  <label htmlFor="autoApprove" className="ml-2 text-sm font-medium text-gray-300">
                    Auto-approve token
                  </label>
                </div>
                <p className="text-xs text-gray-400">
                  Automatically set status to approved (recommended for admin registrations)
                </p>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="addToRace"
                    name="addToRace"
                    checked={formData.addToRace}
                    onChange={handleInputChange}
                    disabled={!formData.autoApprove}
                    className="w-4 h-4 text-[#00b8d8] bg-gray-700 border-gray-600 rounded focus:ring-[#00b8d8] focus:ring-2 disabled:opacity-50"
                  />
                  <label htmlFor="addToRace" className="ml-2 text-sm font-medium text-gray-300">
                    Add to Race to Liberty
                  </label>
                </div>
                <p className="text-xs text-gray-400">
                  Automatically promote token to Race to Liberty (requires auto-approve)
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-700/50">
            <Link
              href="/admin/tokens"
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#00b8d8] to-[#0099b8] hover:from-[#0099b8] hover:to-[#007a98] text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering...
                </>
              ) : (
                <>
                  <FaCheck />
                  Register Token
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Info Card */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">Admin Registration Benefits</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• No payment or checkout required</li>
          <li>• Instant registration without approval queue</li>
          <li>• Option to auto-approve and add to Race to Liberty</li>
          <li>• All social links and metadata can be configured</li>
          <li>• Email notifications still sent if provided</li>
        </ul>
      </div>
    </div>
  );
}
