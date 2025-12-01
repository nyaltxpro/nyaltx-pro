import { StakingPosition, StakingStats } from '@/services/contracts/types';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useDAOService } from './useDAOService';

export function useStaking() {
  const { address } = useAccount();
  const { daoService, isLoading: serviceLoading, error: serviceError } = useDAOService();

  const [stats, setStats] = useState<StakingStats | null>(null);
  const [positions, setPositions] = useState<StakingPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!daoService) return;
    setLoading(true);
    setError(null);

    try {
      const [statsData, positionsData] = await Promise.all([
        daoService.staking.getStats(),
        address ? daoService.staking.getPositions(address) : Promise.resolve([]),
      ]);
      setStats(statsData);
      setPositions(positionsData);
    } catch (err) {
      console.error('Failed to load staking data', err);
      setError(err instanceof Error ? err.message : 'Failed to load staking data');
    } finally {
      setLoading(false);
    }
  }, [daoService, address]);

  useEffect(() => {
    if (!serviceLoading && daoService) {
      refresh();
    }
  }, [serviceLoading, daoService, refresh]);

  const stake = useCallback(async (amount: string, lockDurationSeconds: number, delegatee?: string) => {
    if (!daoService) throw new Error('DAO service not initialized');
    setActionPending(true);
    setError(null);
    try {
      await daoService.staking.stake(amount, lockDurationSeconds, delegatee);
      await refresh();
    } catch (err) {
      console.error('Failed to stake tokens', err);
      setError(err instanceof Error ? err.message : 'Failed to stake tokens');
      throw err;
    } finally {
      setActionPending(false);
    }
  }, [daoService, refresh]);

  const extendLock = useCallback(async (stakeId: number, additionalDurationSeconds: number) => {
    if (!daoService) throw new Error('DAO service not initialized');
    setActionPending(true);
    setError(null);
    try {
      await daoService.staking.extendLock(stakeId, additionalDurationSeconds);
      await refresh();
    } catch (err) {
      console.error('Failed to extend lock', err);
      setError(err instanceof Error ? err.message : 'Failed to extend lock');
      throw err;
    } finally {
      setActionPending(false);
    }
  }, [daoService, refresh]);

  const unstake = useCallback(async (stakeId: number, recipient?: string) => {
    if (!daoService) throw new Error('DAO service not initialized');
    setActionPending(true);
    setError(null);
    try {
      await daoService.staking.unstake(stakeId, recipient);
      await refresh();
    } catch (err) {
      console.error('Failed to unstake', err);
      setError(err instanceof Error ? err.message : 'Failed to unstake');
      throw err;
    } finally {
      setActionPending(false);
    }
  }, [daoService, refresh]);

  return {
    stats,
    positions,
    loading: loading || serviceLoading,
    actionPending,
    error: error || serviceError,
    refresh,
    stake,
    extendLock,
    unstake,
  };
}
