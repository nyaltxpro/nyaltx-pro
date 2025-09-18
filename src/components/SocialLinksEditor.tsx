'use client';

import React, { useState } from 'react';
import { FaGlobe, FaTwitter, FaTelegram, FaDiscord, FaGithub, FaYoutube, FaVideo, FaSave, FaTimes, FaEdit } from 'react-icons/fa';

interface SocialLinks {
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  youtube?: string;
  videoLink?: string;
}

interface Token {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  blockchain?: string;
  contractAddress?: string;
  mint?: string;
  platform?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  youtube?: string;
  videoLink?: string;
  status?: string;
  createdAt: string;
}

interface SocialLinksEditorProps {
  token: Token;
  tokenType: 'registered' | 'created';
  userAddress: string;
  onUpdate: (tokenId: string, updatedToken: Token) => void;
}

export default function SocialLinksEditor({ token, tokenType, userAddress, onUpdate }: SocialLinksEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    website: token.website || '',
    twitter: token.twitter || '',
    telegram: token.telegram || '',
    discord: token.discord || '',
    github: token.github || '',
    youtube: token.youtube || '',
    videoLink: token.videoLink || '',
  });

  const socialFields = [
    { key: 'website', label: 'Website', icon: FaGlobe, placeholder: 'https://example.com' },
    { key: 'twitter', label: 'Twitter', icon: FaTwitter, placeholder: 'https://twitter.com/yourhandle' },
    { key: 'telegram', label: 'Telegram', icon: FaTelegram, placeholder: 'https://t.me/yourchannel' },
    { key: 'discord', label: 'Discord', icon: FaDiscord, placeholder: 'https://discord.gg/yourinvite' },
    { key: 'github', label: 'GitHub', icon: FaGithub, placeholder: 'https://github.com/org/repo' },
    { key: 'youtube', label: 'YouTube', icon: FaYoutube, placeholder: 'https://youtube.com/channel/...' },
    { key: 'videoLink', label: 'Video Link', icon: FaVideo, placeholder: 'https://youtube.com/watch?v=... or other video URL' },
  ];

  const handleInputChange = (key: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tokens/update-social-links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: token.id,
          tokenType,
          userAddress,
          socialLinks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update social links');
      }

      // Update the token with new social links
      const updatedToken = {
        ...token,
        ...socialLinks,
      };

      onUpdate(token.id, updatedToken);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update social links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setSocialLinks({
      website: token.website || '',
      twitter: token.twitter || '',
      telegram: token.telegram || '',
      discord: token.discord || '',
      github: token.github || '',
      youtube: token.youtube || '',
      videoLink: token.videoLink || '',
    });
    setIsEditing(false);
    setError(null);
  };

  const hasAnyLinks = socialFields.some(field => token[field.key as keyof Token]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{token.tokenName}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>{token.tokenSymbol}</span>
            {token.blockchain && <span>• {token.blockchain}</span>}
            {token.platform && <span>• {token.platform}</span>}
            {token.status && (
              <span className={`px-2 py-1 rounded-full text-xs ${
                token.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                token.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {token.status}
              </span>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <FaEdit className="mr-2" />
            Edit Links
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm">
          {error}
        </div>
      )}

      {isEditing ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {socialFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    <Icon className="inline mr-2" />
                    {field.label}
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                    placeholder={field.placeholder}
                    value={socialLinks[field.key as keyof SocialLinks] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-md transition-colors"
            >
              <FaSave className="mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {hasAnyLinks ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {socialFields.map((field) => {
                const value = token[field.key as keyof Token] as string;
                if (!value) return null;
                
                const Icon = field.icon;
                return (
                  <div key={field.key} className="flex items-center">
                    <Icon className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400 mr-2">{field.label}:</span>
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm truncate"
                    >
                      {value}
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              No social links added yet. Click "Edit Links" to add social media links and promotional content.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
