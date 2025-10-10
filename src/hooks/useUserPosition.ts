'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

interface UserPosition {
  position?: number;
  points?: number;
  tokenId?: string;
  tokenSymbol?: string;
  previousPosition?: number;
  hasImproved?: boolean;
  hasDeclined?: boolean;
}

export const useUserPosition = (refreshInterval: number = 30000) => {
  const { address, isConnected } = useAccount();
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPosition = useCallback(async () => {
    if (!isConnected || !address) {
      setUserPosition(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user tokens
      const userTokensResponse = await fetch(`/api/tokens/by-wallet?address=${address}`);
      const userTokensData = await userTokensResponse.json();

      if (!userTokensData.success) {
        setUserPosition(null);
        return;
      }

      const userTokenIds = userTokensData.tokens
        .filter((token: any) => token.status === 'approved')
        .map((token: any) => token.id);

      if (userTokenIds.length === 0) {
        setUserPosition(null);
        return;
      }

      // Get leaderboard
      const leaderboardResponse = await fetch('/api/gamification/leaderboard?limit=100');
      const leaderboardData = await leaderboardResponse.json();

      if (!leaderboardData.success) {
        throw new Error('Failed to fetch leaderboard');
      }

      // Find user's best position
      const userEntries = leaderboardData.leaderboard?.filter((entry: any) =>
        userTokenIds.includes(entry.tokenId)
      ) || [];

      if (userEntries.length === 0) {
        setUserPosition(null);
        return;
      }

      // Get the best position (lowest number)
      const bestEntry = userEntries.reduce((best: any, current: any) => 
        current.position < best.position ? current : best
      );

      const newPosition: UserPosition = {
        position: bestEntry.position,
        points: bestEntry.currentPoints,
        tokenId: bestEntry.tokenId,
        tokenSymbol: bestEntry.tokenSymbol,
        previousPosition: userPosition?.position,
      };

      // Check for position changes
      if (userPosition?.position && newPosition.position) {
        if (newPosition.position < userPosition.position) {
          newPosition.hasImproved = true;
          const improvement = userPosition.position - newPosition.position;
          toast.success(`🚀 You climbed ${improvement} position${improvement > 1 ? 's' : ''}! Now #${newPosition.position}`);
        } else if (newPosition.position > userPosition.position) {
          newPosition.hasDeclined = true;
          const decline = newPosition.position - userPosition.position;
          toast(`📉 You dropped ${decline} position${decline > 1 ? 's' : ''} to #${newPosition.position}`, {
            icon: '⚠️',
            duration: 3000,
          });
        }
      }

      setUserPosition(newPosition);

    } catch (err: any) {
      console.error('Error fetching user position:', err);
      setError(err.message || 'Failed to fetch user position');
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, userPosition?.position]);

  useEffect(() => {
    fetchUserPosition();

    // Set up interval for automatic updates
    const interval = setInterval(fetchUserPosition, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchUserPosition, refreshInterval]);

  const refreshPosition = useCallback(() => {
    fetchUserPosition();
  }, [fetchUserPosition]);

  return {
    userPosition,
    loading,
    error,
    refreshPosition,
  };
};
