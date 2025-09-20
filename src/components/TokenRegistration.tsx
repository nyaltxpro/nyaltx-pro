'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { RegisteredToken } from '@/types/token';

interface TokenRegistrationProps {
  onTokenRegistered?: (token: RegisteredToken) => void;
}

const SUPPORTED_CHAINS = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'bsc', name: 'Binance Smart Chain', symbol: 'BNB' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB' },
  { id: 'optimism', name: 'Optimism', symbol: 'OP' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
];

const TOKEN_CATEGORIES = [
  { id: 'community', name: 'Community Token', baseMultiplier: 1.2 },
  { id: 'utility', name: 'Utility Token', baseMultiplier: 1.3 },
  { id: 'defi', name: 'DeFi Token', baseMultiplier: 1.4 },
  { id: 'gaming', name: 'Gaming Token', baseMultiplier: 1.5 },
  { id: 'meme', name: 'Meme Token', baseMultiplier: 1.1 },
];

export default function TokenRegistration({ onTokenRegistered }: TokenRegistrationProps) {
  const { address, isConnected } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    contractAddress: '',
    chain: 'ethereum',
    logo: '',
    description: '',
    website: '',
    twitter: '',
    telegram: '',
    category: 'community',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Token name is required';
    if (!formData.symbol.trim()) return 'Token symbol is required';
    if (!formData.contractAddress.trim()) return 'Contract address is required';
    if (!formData.description.trim()) return 'Token description is required';
    
    // Basic contract address validation
    if (formData.chain === 'solana') {
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(formData.contractAddress)) {
        return 'Invalid Solana contract address';
      }
    } else {
      if (!/^0x[a-fA-F0-9]{40}$/.test(formData.contractAddress)) {
        return 'Invalid EVM contract address';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedCategory = TOKEN_CATEGORIES.find(cat => cat.id === formData.category);
      const boostMultiplier = selectedCategory?.baseMultiplier || 1.0;

      const tokenData: RegisteredToken = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name.trim(),
        symbol: formData.symbol.trim().toUpperCase(),
        contractAddress: formData.contractAddress.trim(),
        chain: formData.chain,
        logo: formData.logo.trim() || undefined,
        description: formData.description.trim(),
        website: formData.website.trim() || undefined,
        twitter: formData.twitter.trim() || undefined,
        telegram: formData.telegram.trim() || undefined,
        userId: address,
        walletAddress: address,
        status: 'pending',
        boostMultiplier,
        submittedAt: Date.now(),
      };

      // Save to localStorage for now (in production, this would be an API call)
      const existingTokens = JSON.parse(localStorage.getItem('registeredTokens') || '[]');
      const updatedTokens = [...existingTokens, tokenData];
      localStorage.setItem('registeredTokens', JSON.stringify(updatedTokens));

      setSuccess(`Token "${formData.name}" registered successfully! It's now pending admin approval.`);
      
      // Reset form
      setFormData({
        name: '',
        symbol: '',
        contractAddress: '',
        chain: 'ethereum',
        logo: '',
        description: '',
        website: '',
        twitter: '',
        telegram: '',
        category: 'community',
      });

      onTokenRegistered?.(tokenData);

    } catch (err) {
      setError('Failed to register token. Please try again.');
      console.error('Token registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Register Your Token</h3>
        <p className="text-gray-400 mb-4">
          Connect your wallet to register tokens for Race to Liberty boosts.
        </p>
        <div className="text-center">
          <p className="text-gray-500">Please connect your wallet to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Register Your Token</h3>
      <p className="text-gray-400 mb-6">
        Submit your token for admin approval to unlock boost multipliers in Race to Liberty.
      </p>

      {success && (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., MyAwesome Token"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Symbol *
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., MAT"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Blockchain *
            </label>
            <select
              name="chain"
              value={formData.chain}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            >
              {SUPPORTED_CHAINS.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.name} ({chain.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            >
              {TOKEN_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.baseMultiplier}x boost)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contract Address *
          </label>
          <input
            type="text"
            name="contractAddress"
            value={formData.contractAddress}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder={formData.chain === 'solana' ? 'Solana token mint address' : '0x...'}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="Describe your token's purpose and utility..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              name="logo"
              value={formData.logo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Twitter
            </label>
            <input
              type="text"
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="@username or https://twitter.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Telegram
            </label>
            <input
              type="text"
              name="telegram"
              value={formData.telegram}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="@username or https://t.me/..."
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Registering Token...' : 'Register Token'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">How it works:</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Submit your token for review by our admin team</li>
          <li>• Approved tokens get boost multipliers based on category</li>
          <li>• Use approved tokens in Race to Liberty for enhanced points</li>
          <li>• Higher category tokens provide better boost multipliers</li>
        </ul>
      </div>
    </div>
  );
}
