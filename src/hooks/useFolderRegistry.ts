import { FolderAllocationScheduleInput, FolderInfo, FolderMemberInfo, FolderTemplate } from '@/services/contracts/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDAOService } from './useDAOService';

export type CreateFolderInput = {
  name: string;
  permissions: number;
  template: FolderTemplate;
};

type UpdateFolderOptions = {
  permissions?: number;
  template?: FolderTemplate;
};

type AllocationInput = {
  folderId: number;
  account: string;
  amount: string;
  schedule: FolderAllocationScheduleInput;
  permissions?: number;
};

export function useFolderRegistry() {
  const { daoService, isLoading: serviceLoading, error: serviceError } = useDAOService();
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [membersByFolder, setMembersByFolder] = useState<Record<number, FolderMemberInfo[]>>({});
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFolders = useCallback(async () => {
    if (!daoService) return;
    setLoading(true);
    setError(null);
    try {
      const list = await daoService.folders.getFolders();
      setFolders(list);
    } catch (err) {
      console.error('Failed to fetch folders', err);
      setError(err instanceof Error ? err.message : 'Failed to load folders');
    } finally {
      setLoading(false);
    }
  }, [daoService]);

  const fetchMembers = useCallback(async (folderId: number) => {
    if (!daoService) return;
    try {
      const entries = await daoService.folders.getFolderMembers(folderId);
      setMembersByFolder(prev => ({ ...prev, [folderId]: entries }));
    } catch (err) {
      console.error('Failed to load folder members', err);
    }
  }, [daoService]);

  const createFolder = useCallback(async ({ name, permissions, template }: CreateFolderInput) => {
    if (!daoService) throw new Error('DAO service not initialized');
    setActionPending(true);
    setError(null);
    try {
      await daoService.folders.createFolder(name, permissions, template);
      await fetchFolders();
    } catch (err) {
      console.error('Failed to create folder', err);
      setError(err instanceof Error ? err.message : 'Failed to create folder');
      throw err;
    } finally {
      setActionPending(false);
    }
  }, [daoService, fetchFolders]);

  const refresh = useCallback(async () => {
    await fetchFolders();
  }, [fetchFolders]);

  const updateFolder = useCallback(
    async (folderId: number, updates: UpdateFolderOptions) => {
      if (!daoService) throw new Error('DAO service not initialized');
      setActionPending(true);
      setError(null);
      try {
        const folder = folders.find(item => item.id === folderId) ?? (await daoService.folders.getFolder(folderId));
        if (!folder) throw new Error('Folder not found');
        const permissions = updates.permissions ?? folder.defaultPermissions;
        const template = updates.template ?? folder.template;
        await daoService.folders.updateFolder(folderId, permissions, template);
        await fetchFolders();
      } catch (err) {
        console.error('Failed to update folder', err);
        setError(err instanceof Error ? err.message : 'Failed to update folder');
        throw err;
      } finally {
        setActionPending(false);
      }
    },
    [daoService, folders, fetchFolders]
  );

  const setFolderAllocation = useCallback(
    async ({ folderId, account, amount, schedule, permissions }: AllocationInput) => {
      if (!daoService) throw new Error('DAO service not initialized');
      setActionPending(true);
      setError(null);
      try {
        await daoService.folders.setAllocation(folderId, account, amount, schedule, permissions);
        await Promise.all([fetchFolders(), fetchMembers(folderId)]);
      } catch (err) {
        console.error('Failed to set allocation', err);
        setError(err instanceof Error ? err.message : 'Failed to set allocation');
        throw err;
      } finally {
        setActionPending(false);
      }
    },
    [daoService, fetchFolders, fetchMembers]
  );

  const revokeAllocation = useCallback(
    async (folderId: number, account: string) => {
      if (!daoService) throw new Error('DAO service not initialized');
      setActionPending(true);
      setError(null);
      try {
        await daoService.folders.revokeAllocation(folderId, account);
        await Promise.all([fetchFolders(), fetchMembers(folderId)]);
      } catch (err) {
        console.error('Failed to revoke allocation', err);
        setError(err instanceof Error ? err.message : 'Failed to revoke allocation');
        throw err;
      } finally {
        setActionPending(false);
      }
    },
    [daoService, fetchFolders, fetchMembers]
  );

  const setFolderLockState = useCallback(
    async (folderId: number, locked: boolean) => {
      if (!daoService) throw new Error('DAO service not initialized');
      setActionPending(true);
      setError(null);
      try {
        await daoService.folders.setFolderLocked(folderId, locked);
        await fetchFolders();
      } catch (err) {
        console.error('Failed to update folder lock state', err);
        setError(err instanceof Error ? err.message : 'Failed to update lock state');
        throw err;
      } finally {
        setActionPending(false);
      }
    },
    [daoService, fetchFolders]
  );

  useEffect(() => {
    if (!serviceLoading && daoService) {
      fetchFolders();
    }
  }, [serviceLoading, daoService, fetchFolders]);

  const summary = useMemo(() => {
    const totalAllocated = folders.reduce((sum, folder) => sum + Number(folder.totalAllocated || '0'), 0);
    const totalMembers = folders.reduce((sum, folder) => sum + folder.members.length, 0);
    return {
      totalAllocated,
      totalMembers,
      folderCount: folders.length,
    };
  }, [folders]);

  return {
    folders,
    membersByFolder,
    loading,
    actionPending,
    error: error || serviceError,
    summary,
    refresh,
    fetchMembers,
    createFolder,
    updateFolder,
    setFolderAllocation,
    revokeAllocation,
    setFolderLockState,
  };
}
