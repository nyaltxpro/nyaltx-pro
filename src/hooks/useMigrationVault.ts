import { LegacyDepositEvent, LegacyDepositResult, MigrationVaultStats } from '@/services/contracts/types';
import { useCallback, useEffect, useState } from 'react';
import { useDAOService } from './useDAOService';

export function useMigrationVault() {
  const { daoService, isLoading: serviceLoading, error: serviceError } = useDAOService();

  const [stats, setStats] = useState<MigrationVaultStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDeposit, setLastDeposit] = useState<LegacyDepositResult | null>(null);
  const [recentDeposits, setRecentDeposits] = useState<LegacyDepositEvent[]>([]);

  const refresh = useCallback(async () => {
    if (!daoService) return;
    setLoading(true);
    setError(null);
    try {
      const vaultStats = await daoService.migrationVault.getStats();
      const deposits = await daoService.migrationVault.getRecentDeposits();
      setStats(vaultStats);
      setRecentDeposits(deposits);
    } catch (err) {
      console.error('Failed to load migration stats', err);
      setError(err instanceof Error ? err.message : 'Failed to load migration stats');
    } finally {
      setLoading(false);
    }
  }, [daoService]);

  useEffect(() => {
    if (!serviceLoading && daoService) {
      refresh();
    }
  }, [serviceLoading, daoService, refresh]);

  const depositLegacy = useCallback(async (amount: string, beneficiary?: string) => {
    if (!daoService) throw new Error('DAO service not initialized');
    setActionPending(true);
    setError(null);
    try {
      const result = await daoService.migrationVault.depositLegacy(amount, beneficiary);
      setLastDeposit(result);
      await refresh();
      return result;
    } catch (err) {
      console.error('Failed to deposit legacy tokens', err);
      setError(err instanceof Error ? err.message : 'Failed to deposit legacy tokens');
      throw err;
    } finally {
      setActionPending(false);
    }
  }, [daoService, refresh]);

  return {
    stats,
    loading: loading || serviceLoading,
    actionPending,
    error: error || serviceError,
    lastDeposit,
    recentDeposits,
    refresh,
    depositLegacy,
  };
}
