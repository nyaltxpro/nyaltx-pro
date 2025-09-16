"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Token {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  imageUri?: string;
  points: number;
  inRace: boolean;
  blockchain: string;
}

export default function TokenPointsManager() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/admin/tokens/points');
      const result = await response.json();
      if (result.success) {
        setTokens(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePoints = async (tokenId: string, points: number) => {
    setUpdating(tokenId);
    try {
      const response = await fetch('/api/admin/tokens/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId, points }),
      });

      const result = await response.json();
      if (result.success) {
        // Update local state
        setTokens(prev => prev.map(token => 
          token.id === tokenId ? { ...token, points } : token
        ));
      } else {
        alert('Failed to update points: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to update points:', error);
      alert('Failed to update points');
    } finally {
      setUpdating(null);
    }
  };

  const filteredTokens = tokens.filter(token =>
    token.tokenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4 w-48"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Token Points Manager</h2>
        <p className="text-gray-400 mb-4">
          Manage points for tokens to control their ranking in the Token Race
        </p>
        
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-[#00c3ff]"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Blockchain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Current Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Race Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredTokens.map((token) => (
                <TokenRow
                  key={token.id}
                  token={token}
                  updating={updating === token.id}
                  onUpdatePoints={updatePoints}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTokens.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No tokens found matching your search.
        </div>
      )}
    </div>
  );
}

interface TokenRowProps {
  token: Token;
  updating: boolean;
  onUpdatePoints: (tokenId: string, points: number) => void;
}

function TokenRow({ token, updating, onUpdatePoints }: TokenRowProps) {
  const [points, setPoints] = useState(token.points || 0);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdatePoints(token.id, points);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPoints(token.points || 0);
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {token.imageUri ? (
              <Image
                src={token.imageUri}
                alt={token.tokenSymbol}
                width={40}
                height={40}
                className="rounded-full"
                unoptimized
              />
            ) : (
              <div className="h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">
                  {token.tokenSymbol.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-white">
              {token.tokenName}
            </div>
            <div className="text-sm text-gray-400">
              {token.tokenSymbol}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {token.blockchain}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-[#00c3ff]"
            min="0"
          />
        ) : (
          <span className="text-lg font-bold text-[#00c3ff]">
            {token.points || 0}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          token.inRace 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {token.inRace ? 'In Race' : 'Not in Race'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={updating}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#00c3ff] hover:bg-[#00a8cc] text-black px-3 py-1 rounded text-xs font-medium"
          >
            Edit Points
          </button>
        )}
      </td>
    </tr>
  );
}
