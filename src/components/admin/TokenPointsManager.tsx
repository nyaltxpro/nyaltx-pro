'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Badge } from '@/components/reui/badge';
import { Button } from '@/components/reui/button';
import { Card } from '@/components/reui/card';
import { Filters } from '@/components/reui/filters';
import { paginateItems, TablePagination } from '@/components/reui/table-pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [page, setPage] = useState(1);

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
        setTokens(prev => prev.map(token => (token.id === tokenId ? { ...token, points } : token)));
      } else {
        toast.error(`Failed to update points: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to update points:', error);
      toast.error('Failed to update points');
    } finally {
      setUpdating(null);
    }
  };

  const filteredTokens = tokens.filter(
    token =>
      token.tokenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedTokens = paginateItems(filteredTokens, page, 10);

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
        <p className="admin-points-description text-xs text-gray-400 mb-3">
          Manage points for tokens to control their ranking in the Token Race
        </p>

        {/* Search */}
        <Filters
          className="admin-points-filters mb-4"
          activeFilters={searchTerm.trim()
            ? [{ id: 'points-search', label: `Search: ${searchTerm}`, onRemove: () => setSearchTerm('') }]
            : []}
        >
          <div className="max-w-xs flex-1">
            <input
              type="search"
              placeholder="Search tokens..."
              aria-label="Search token points"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="admin-points-search w-full px-3 py-2"
            />
          </div>
        </Filters>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
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
              {paginatedTokens.map(token => (
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
        <TablePagination
          page={page}
          pageSize={10}
          total={filteredTokens.length}
          onPageChange={setPage}
        />
      </Card>

      {filteredTokens.length === 0 && (
        <div className="text-center py-8 text-gray-400">No tokens found matching your search.</div>
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
          <Avatar size="default" className="border border-white/10 bg-slate-800">
            <AvatarImage src={token.imageUri} alt={token.tokenSymbol} />
            <AvatarFallback>{token.tokenSymbol.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <div className="text-sm font-medium text-white">{token.tokenName}</div>
            <div className="text-sm text-gray-400">{token.tokenSymbol}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="info-light">
          {token.blockchain}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="number"
            value={points}
            onChange={e => setPoints(Number(e.target.value))}
            className="w-24"
            min="0"
          />
        ) : (
          <span className="text-sm font-semibold text-cyan-300">{token.points || 0}</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={token.inRace ? 'success-light' : 'secondary'}>
          {token.inRace ? 'In Race' : 'Not in Race'}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {isEditing ? (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updating}
            >
              {updating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={updating}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit Points
          </Button>
        )}
      </td>
    </tr>
  );
}
