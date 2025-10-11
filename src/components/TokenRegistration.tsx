'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { RegisteredToken } from '@/types/token';
import toast from 'react-hot-toast';
import { usePhantomWallet } from '@/hooks/usePhantomWallet';

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
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const { 
    publicKey: phantomAddress, 
    isConnected: isPhantomConnected, 
    connect: connectPhantom, 
    disconnect: disconnectPhantom,
    connecting: phantomConnecting,
    isPhantomInstalled,
    error: phantomError 
  } = usePhantomWallet();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedWalletType, setSelectedWalletType] = useState<'evm' | 'solana'>('evm');

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

  // Helper functions to determine current wallet state
  const getCurrentWalletAddress = () => {
    if (selectedWalletType === 'solana') {
      return phantomAddress;
    }
    return evmAddress;
  };

  const isCurrentWalletConnected = () => {
    if (selectedWalletType === 'solana') {
      return isPhantomConnected;
    }
    return isEvmConnected;
  };

  // Auto-switch to Solana wallet type when Solana chain is selected
  useEffect(() => {
    if (formData.chain === 'solana') {
      setSelectedWalletType('solana');
    } else {
      setSelectedWalletType('evm');
    }
  }, [formData.chain]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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

    const currentAddress = getCurrentWalletAddress();
    const isWalletConnected = isCurrentWalletConnected();

    if (!isWalletConnected || !currentAddress) {
      const errorMsg = `Please connect your ${selectedWalletType === 'solana' ? 'Phantom' : 'EVM'} wallet first`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Show initial loading toast
    const loadingToast = toast.loading('🔄 Preparing token registration...');

    try {
      const selectedCategory = TOKEN_CATEGORIES.find(cat => cat.id === formData.category);
      const boostMultiplier = selectedCategory?.baseMultiplier || 1.0;

      // Update loading message for validation
      toast.dismiss(loadingToast);
      const validationToast = toast.loading('✅ Validating token data...');

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
        userId: currentAddress,
        walletAddress: currentAddress,
        status: 'pending',
        boostMultiplier,
        submittedAt: Date.now(),
      };

      // Update loading message for saving
      toast.dismiss(validationToast);
      const savingToast = toast.loading('💾 Saving token registration...');

      // Save to localStorage for now (in production, this would be an API call)
      const existingTokens = JSON.parse(localStorage.getItem('registeredTokens') || '[]');
      const updatedTokens = [...existingTokens, tokenData];
      localStorage.setItem('registeredTokens', JSON.stringify(updatedTokens));

      toast.dismiss(savingToast);
      
      const successMsg = `Token "${formData.name}" registered successfully! It's now pending admin approval.`;
      setSuccess(successMsg);
      toast.success('🎉 Token registered successfully!');

      // Show additional info toast
      toast.success('📋 Token submitted for admin approval', {
        duration: 4000,
        style: {
          background: '#065f46',
          color: '#d1fae5',
          border: '1px solid #10b981',
        }
      });

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
      const errorMsg = 'Failed to register token. Please try again.';
      setError(errorMsg);
      toast.error('❌ Token registration failed');
      console.error('Token registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Wallet connection UI
  const renderWalletConnection = () => {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Register Your Token</h3>
        <p className="text-gray-400 mb-6">
          Connect your wallet to register tokens for Race to Liberty boosts.
        </p>

        <div className="space-y-4">
          {/* EVM Wallet Connection */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-2">EVM Chains (Ethereum, BSC, Polygon, etc.)</h4>
            <p className="text-gray-400 text-sm mb-3">
              For tokens on Ethereum, BSC, Polygon, Arbitrum, and Optimism
            </p>
            {isEvmConnected ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm">✅ EVM Wallet Connected</p>
                  <p className="text-gray-400 text-xs font-mono">{evmAddress}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Connect via wallet button in header</p>
            )}
          </div>

          {/* Phantom Wallet Connection */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-2">Solana Network</h4>
            <p className="text-gray-400 text-sm mb-3">
              For Solana tokens using Phantom wallet
            </p>
            {!isPhantomInstalled ? (
              <div>
                <p className="text-yellow-400 text-sm mb-2">⚠️ Phantom wallet not detected</p>
                <a
                  href="https://phantom.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Install Phantom Wallet
                </a>
              </div>
            ) : isPhantomConnected ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm">✅ Phantom Wallet Connected</p>
                  <p className="text-gray-400 text-xs font-mono">{phantomAddress}</p>
                </div>
                <button
                  onClick={disconnectPhantom}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={connectPhantom}
                  disabled={phantomConnecting}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {phantomConnecting ? 'Connecting...' : 'Connect Phantom Wallet'}
                </button>
                {phantomError && (
                  <p className="text-red-400 text-sm mt-2">{phantomError}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm">
            Connect the appropriate wallet for your token's blockchain
          </p>
        </div>
      </div>
    );
  };

  // Show wallet connection UI if no wallet is connected
  if (!isEvmConnected && !isPhantomConnected) {
    return renderWalletConnection();
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Register Your Token</h3>
      <p className="text-gray-400 mb-4">
        Submit your token for admin approval to unlock boost multipliers in Race to Liberty.
      </p>

      {/* Current Wallet Status */}
      <div className="bg-gray-800 rounded-lg p-3 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">
              Connected Wallet: {selectedWalletType === 'solana' ? 'Phantom (Solana)' : 'EVM Wallet'}
            </p>
            <p className="text-xs text-gray-400 font-mono">
              {getCurrentWalletAddress()}
            </p>
          </div>
          {selectedWalletType === 'solana' && isPhantomConnected && (
            <button
              onClick={disconnectPhantom}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

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
            <label className="block text-sm font-medium text-gray-300 mb-2">Token Name *</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Token Symbol *</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Blockchain *</label>
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
            {formData.chain === 'solana' && !isPhantomConnected && (
              <div className="mt-2 p-2 bg-purple-900/20 border border-purple-500/50 rounded">
                <p className="text-purple-400 text-xs">
                  ⚠️ Solana selected but Phantom wallet not connected. 
                  {!isPhantomInstalled ? (
                    <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                      Install Phantom
                    </a>
                  ) : (
                    <button onClick={connectPhantom} className="underline ml-1">
                      Connect Phantom
                    </button>
                  )}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">Contract Address *</label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Logo URL</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Twitter</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Telegram</label>
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
