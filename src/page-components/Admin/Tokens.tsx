'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Drawer } from '@/components/reui/drawer';
import { Checkbox } from '@/components/reui/checkbox';
import { Badge } from '@/components/reui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Filters } from '@/components/reui/filters';
import { Alert } from '@/components/reui/alert';
import { DropdownSelect } from '@/components/reui/dropdown-select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/reui/tooltip';
import toast from 'react-hot-toast';
import {
  AtSign,
  ArrowLeft,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Crown,
  ExternalLink,
  Eye,
  EyeOff,
  Github,
  Globe,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';

const AdminTokensClient = dynamic(() => Promise.resolve(AdminTokensComponent), {
    ssr: false,
    loading: () => <div className="text-gray-400 py-8 text-center">Loading tokens...</div>
});

const AdminTokenRegisterDrawer = dynamic(
    () => import('@/page-components/Admin/AdminTokenRegister'),
    { ssr: false }
);

type Status = 'pending' | 'approved' | 'rejected';

function getTokenInitials(name?: string) {
    const initials = name
        ?.trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase();

    return initials || '?';
}

type TokenRegistration = {
    id: string;
    tokenName: string;
    tokenSymbol: string;
    blockchain: string;
    contractAddress: string;
    imageUri?: string;
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    github?: string;
    status: Status;
    paused?: boolean;
    showWebsite?: boolean;
    showTwitter?: boolean;
    showTelegram?: boolean;
    showDiscord?: boolean;
    showGithub?: boolean;
    inRace?: boolean;
    racePromotedAt?: string;
    raceRank?: number;
    createdAt: string;
    updatedAt: string;
};

function AdminTokensComponent() {
    const [statusFilter, setStatusFilter] = useState<Status | 'all'>('pending');
    const [chainFilter, setChainFilter] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'createdAt' | 'tokenName' | 'tokenSymbol' | 'blockchain'>(
        'createdAt'
    );
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [tokens, setTokens] = useState<TokenRegistration[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isRegistrationBusy, setIsRegistrationBusy] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    function showToast(type: 'success' | 'error', message: string) {
        if (type === 'success') toast.success(message);
        else toast.error(message);
    }

    const query = useMemo(() => {
        const parts: string[] = [];
        if (statusFilter !== 'all') parts.push(`status=${statusFilter}`);
        parts.push(`page=${page}`);
        parts.push(`limit=${limit}`);
        return parts.length ? `?${parts.join('&')}` : '';
    }, [statusFilter, page, limit]);

    useEffect(() => {
        setError(null);
        setTokens(null);
        fetch(`/api/admin/tokens${query}`)
            .then(async r => (r.ok ? r.json() : Promise.reject(await r.json())))
            .then(d => {
                setTokens(d?.data || []);
                setTotal(d?.total || 0);
            })
            .catch(() => {
                setTokens([]);
                setTotal(0);
            });
    }, [query, refreshKey]);

    async function updateStatus(id: string, status: Status) {
        try {
            setBusyId(id);
            setError(null);
            const r = await fetch('/api/admin/tokens', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d?.error || 'Update failed');
            // refresh current page
            fetch(`/api/admin/tokens${query}`)
                .then(async r => (r.ok ? r.json() : Promise.reject(await r.json())))
                .then(dd => {
                    setTokens(dd?.data || []);
                    setTotal(dd?.total || 0);
                    showToast('success', `Status updated to ${status}`);
                })
                .catch(() => {
                    setTokens([]);
                });
        } catch (e: any) {
            setError(e?.message || 'Error updating status');
            showToast('error', e?.message || 'Error updating status');
        } finally {
            setBusyId(null);
        }
    }

    async function patchToken(id: string, payload: Record<string, unknown>) {
        try {
            setBusyId(id);
            setError(null);
            const r = await fetch('/api/admin/tokens', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...payload }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d?.error || 'Update failed');
            // optimistically update local state without refetch
            setTokens(prev => (prev || []).map(t => (t.id === id ? { ...t, ...(d.record || {}) } : t)));
            const isPauseToggle = Object.prototype.hasOwnProperty.call(payload, 'paused');
            if (isPauseToggle) {
                showToast('success', d.record?.paused ? 'Token paused' : 'Token unpaused');
            } else if (payload.socials) {
                showToast('success', 'Social visibility updated');
            } else {
                showToast('success', 'Updated');
            }
        } catch (e: any) {
            setError(e?.message || 'Error updating');
            showToast('error', e?.message || 'Error updating');
        } finally {
            setBusyId(null);
        }
    }

    async function remove(id: string) {
        try {
            setBusyId(id);
            setError(null);
            const r = await fetch(`/api/admin/tokens?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            const d = await r.json();
            if (!r.ok) throw new Error(d?.error || 'Delete failed');
            // After delete, refetch (and move page back if empty)
            const nextTotal = Math.max(0, total - 1);
            const maxPage = Math.max(1, Math.ceil(nextTotal / limit));
            const nextPage = Math.min(page, maxPage);
            setPage(nextPage);
            fetch(`/api/admin/tokens${query.replace(/page=\d+/, `page=${nextPage}`)}`)
                .then(async r => (r.ok ? r.json() : Promise.reject(await r.json())))
                .then(dd => {
                    setTokens(dd?.data || []);
                    setTotal(dd?.total || 0);
                    showToast('success', 'Token deleted');
                })
                .catch(() => setTokens([]));
        } catch (e: any) {
            setError(e?.message || 'Error deleting');
            showToast('error', e?.message || 'Error deleting');
        } finally {
            setBusyId(null);
        }
    }

    async function toggleRaceStatus(id: string, promote: boolean) {
        try {
            setBusyId(id);
            setError(null);
            const r = await fetch('/api/admin/tokens/race', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokenId: id, action: promote ? 'promote' : 'remove' }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d?.message || 'Race update failed');

            // Update local state
            setTokens(prev =>
                (prev || []).map(t =>
                    t.id === id
                        ? {
                            ...t,
                            inRace: promote,
                            racePromotedAt: promote ? new Date().toISOString() : undefined,
                        }
                        : t
                )
            );

            showToast('success', promote ? 'Token promoted to race!' : 'Token removed from race');
        } catch (e: any) {
            setError(e?.message || 'Error updating race status');
            showToast('error', e?.message || 'Error updating race status');
        } finally {
            setBusyId(null);
        }
    }

    // Unique chains from current page (for quick filter)
    const chains = useMemo(() => {
        const set = new Set<string>();
        (tokens || []).forEach(t => t.blockchain && set.add(t.blockchain));
        return ['all', ...Array.from(set)];
    }, [tokens]);

    // Client-side search, chain filter and sorting (within current page)
    const viewRows = useMemo(() => {
        const rows = (tokens || []).filter(t => {
            const chainOk = chainFilter === 'all' || t.blockchain === chainFilter;
            const q = search.trim().toLowerCase();
            const searchOk =
                !q ||
                t.tokenName?.toLowerCase().includes(q) ||
                t.tokenSymbol?.toLowerCase().includes(q) ||
                t.contractAddress?.toLowerCase().includes(q);
            return chainOk && searchOk;
        });
        const dir = sortDir === 'asc' ? 1 : -1;
        rows.sort((a, b) => {
            if (sortKey === 'createdAt')
                return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
            const av = (a[sortKey] || '').toString().toLowerCase();
            const bv = (b[sortKey] || '').toString().toLowerCase();
            return av.localeCompare(bv) * dir;
        });
        return rows;
    }, [tokens, chainFilter, search, sortKey, sortDir]);

    function toggleSort(key: typeof sortKey) {
        if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir('asc');
        }
    }

    return (
        <div className="admin-panel-form space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Token Approvals</h1>
                    <p className="text-sm text-gray-400">Review and manage submitted token listings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsRegistering(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
                    >
                        <Plus size={16} aria-hidden="true" />
                        Register Token
                    </button>
                </div>
            </div>

            {/* Filters & Controls */}
            <Filters
                className="admin-token-filters"
                activeFilters={[
                    ...(statusFilter !== 'pending'
                        ? [{ id: 'token-status', label: `Status: ${statusFilter}`, onRemove: () => setStatusFilter('pending') }]
                        : []),
                    ...(chainFilter !== 'all'
                        ? [{ id: 'token-chain', label: `Chain: ${chainFilter}`, onRemove: () => setChainFilter('all') }]
                        : []),
                    ...(search.trim()
                        ? [{ id: 'token-search', label: `Search: ${search}`, onRemove: () => setSearch('') }]
                        : []),
                ]}
            >
                <div className="grid grid-cols-2 items-center gap-4 lg:grid-cols-4">
                    {/* Status Filter */}
                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="status-filter"
                            className="text-sm font-medium text-gray-300 whitespace-nowrap"
                        >
                            Status:
                        </label>
                        <DropdownSelect
                            id="status-filter"
                            className="!w-[102px] px-2.5"
                            value={statusFilter}
                            onValueChange={value => {
                                setStatusFilter(value as Status | 'all');
                                setPage(1);
                            }}
                            options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'approved', label: 'Approved' },
                                { value: 'rejected', label: 'Rejected' },
                                { value: 'all', label: 'All' },
                            ]}
                        />
                    </div>

                    {/* Chain Filter */}
                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="chain-filter"
                            className="text-sm font-medium text-gray-300 whitespace-nowrap"
                        >
                            Chain:
                        </label>
                        <DropdownSelect
                            id="chain-filter"
                            className="!w-[103px] px-2.5"
                            value={chainFilter}
                            onValueChange={setChainFilter}
                            options={chains.map(chain => ({
                                value: chain,
                                label: chain === 'all' ? 'All Chains' : chain,
                            }))}
                        />
                    </div>

                    {/* Search Input */}
                    <div className="flex-1 max-w-md">
                        <label htmlFor="table-search" className="sr-only">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="admin-panel-input-icon" aria-hidden="true" />
                            <input
                                type="text"
                                id="table-search"
                                className="block w-full rounded-lg border border-white/15 bg-transparent p-2 pl-10 text-sm text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                                placeholder="Search by name, symbol, or contract..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Items Per Page */}
                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="per-page"
                            className="text-sm font-medium text-gray-300 whitespace-nowrap"
                        >
                            Show:
                        </label>
                        <DropdownSelect
                            id="per-page"
                            className="!w-[51px] px-2.5"
                            value={String(limit)}
                            onValueChange={value => {
                                setLimit(Number(value));
                                setPage(1);
                            }}
                            options={[
                                { value: '10', label: '10' },
                                { value: '25', label: '25' },
                                { value: '50', label: '50' },
                            ]}
                        />
                    </div>
                </div>
            </Filters>

            {error && <Alert variant="destructive">{error}</Alert>}

            {!tokens ? (
                <div className="text-center py-12">
                    <Coins className="mx-auto mb-4 h-8 w-8 animate-pulse text-gray-500" aria-hidden="true" />
                    <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Loading tokens...
                    </p>
                </div>
            ) : viewRows.length === 0 ? (
                <div className="text-center py-12">
                    <Search className="mx-auto mb-4 h-8 w-8 text-gray-500" aria-hidden="true" />
                    <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        No tokens found
                    </p>
                </div>
            ) : (
                <TooltipProvider>
                    <div className="admin-panel-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1280px] overflow-hidden">
                            <thead className="bg-gray-700/30 border-b border-gray-600/20">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        <button
                                            onClick={() => toggleSort('createdAt')}
                                            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                                        >
                                            Created
                                            {sortKey === 'createdAt' && sortDir === 'asc' && <ArrowUpAZ className="w-3 h-3" />}
                                            {sortKey === 'createdAt' && sortDir === 'desc' && <ArrowDownAZ className="w-3 h-3" />}
                                            {sortKey !== 'createdAt' && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        <button
                                            onClick={() => toggleSort('tokenName')}
                                            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                                        >
                                            Token
                                            {sortKey === 'tokenName' && sortDir === 'asc' && <ArrowUpAZ className="w-3 h-3" />}
                                            {sortKey === 'tokenName' && sortDir === 'desc' && <ArrowDownAZ className="w-3 h-3" />}
                                            {sortKey !== 'tokenName' && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        <button
                                            onClick={() => toggleSort('blockchain')}
                                            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                                        >
                                            Chain
                                            {sortKey === 'blockchain' && sortDir === 'asc' && <ArrowUpAZ className="w-3 h-3" />}
                                            {sortKey === 'blockchain' && sortDir === 'desc' && <ArrowDownAZ className="w-3 h-3" />}
                                            {sortKey !== 'blockchain' && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Contract
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Race
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Paused
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Socials
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Actions
                                    </th>
                                </tr>
                        </thead>
                            <tbody className="divide-y divide-gray-700/20">
                                {viewRows.map((t: any) => (
                                    <tr
                                        key={t.id}
                                        className="hover:bg-gray-700/20 transition-colors duration-200"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-300 border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            {new Date(t.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 border-r border-gray-700/20">
                                            <div className="flex items-center gap-3">
                                                <Avatar size="sm" className="border border-gray-600/30 bg-slate-800">
                                                    {t.imageUri && (
                                                        <AvatarImage
                                                            src={t.imageUri.replace('gateway.pinata.cloud', 'ipfs.io')}
                                                            alt={`${t.tokenName} logo`}
                                                        />
                                                    )}
                                                    <AvatarFallback className="text-xs">
                                                        {getTokenInitials(t.tokenName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-white text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {t.tokenName}
                                                    </div>
                                                    <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {t.tokenSymbol}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300 border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <Badge variant="info-light" size="default" radius="default">
                                                {t.blockchain}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300 border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <code className="text-xs bg-gray-700/30 px-2 py-1 rounded border border-gray-600/30">
                                                {t.contractAddress.slice(0, 6)}...{t.contractAddress.slice(-4)}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                                            <Badge
                                                variant={
                                                    t.status === 'approved'
                                                        ? 'success-light'
                                                        : t.status === 'rejected'
                                                          ? 'destructive-light'
                                                          : 'warning-light'
                                                }
                                                size="default"
                                                radius="default"
                                            >
                                                {t.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                                            {t.status === 'approved' ? (
                                                <div className="flex flex-col gap-2">
                                                    <Badge
                                                        variant={t.inRace ? 'warning-light' : 'secondary'}
                                                        size="default"
                                                        radius="default"
                                                    >
                                                        {t.inRace ? '🏁 In Race' : 'Not in Race'}
                                                    </Badge>
                                                    <button
                                                        disabled={busyId === t.id}
                                                        onClick={() => toggleRaceStatus(t.id, !t.inRace)}
                                                        className={`text-xs px-3 py-1 rounded-lg transition-all duration-200 font-medium ${
                                                            t.inRace
                                                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                                                                : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30'
                                                        }`}
                                                        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                    >
                                                        {t.inRace ? 'Remove' : 'Add to Race'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <Badge variant="warning-light" size="default" radius="default">
                                                    Approve first
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                                            <label className="inline-flex items-center gap-2 cursor-pointer">
                                                <Checkbox
                                                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    checked={Boolean(t.paused)}
                                                    disabled={busyId === t.id}
                                                    onChange={e => patchToken(t.id, { paused: e.target.checked })}
                                                />
                                                <Badge
                                                    variant={t.paused ? 'destructive-light' : 'success-light'}
                                                    size="default"
                                                    radius="default"
                                                >
                                                    {t.paused ? 'Paused' : 'Active'}
                                                </Badge>
                                            </label>
                                        </td>
                                        <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                                            <div className="flex w-max min-w-max flex-nowrap items-center gap-1.5">
                                                <SocialSwitch
                                                    label="Website"
                                                    icon={Globe}
                                                    checked={t.showWebsite ?? true}
                                                    disabled={busyId === t.id}
                                                    onChange={(val: boolean) => patchToken(t.id, { socials: { website: val } })}
                                                />
                                                <SocialSwitch
                                                    label="Twitter"
                                                    icon={AtSign}
                                                    checked={t.showTwitter ?? true}
                                                    disabled={busyId === t.id}
                                                    onChange={(val: boolean) => patchToken(t.id, { socials: { twitter: val } })}
                                                />
                                                <SocialSwitch
                                                    label="Telegram"
                                                    icon={Send}
                                                    checked={t.showTelegram ?? true}
                                                    disabled={busyId === t.id}
                                                    onChange={(val: boolean) => patchToken(t.id, { socials: { telegram: val } })}
                                                />
                                                <SocialSwitch
                                                    label="Discord"
                                                    icon={MessageCircle}
                                                    checked={t.showDiscord ?? true}
                                                    disabled={busyId === t.id}
                                                    onChange={(val: boolean) => patchToken(t.id, { socials: { discord: val } })}
                                                />
                                                <SocialSwitch
                                                    label="Github"
                                                    icon={Github}
                                                    checked={t.showGithub ?? true}
                                                    disabled={busyId === t.id}
                                                    onChange={(val: boolean) => patchToken(t.id, { socials: { github: val } })}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={`/dashboard/trade?base=${encodeURIComponent(t.tokenSymbol)}&name=${encodeURIComponent(t.tokenName)}&chain=${encodeURIComponent(t.blockchain)}&address=${encodeURIComponent(t.contractAddress)}${t.imageUri ? `&imageUri=${encodeURIComponent(t.imageUri)}` : ''}&source=local`}
                                                            target="_blank"
                                                            aria-label="Preview Trade"
                                                            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-500/15 text-cyan-300 transition-colors hover:bg-cyan-500/25"
                                                        >
                                                            <ExternalLink className="size-4" aria-hidden="true" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Preview Trade</TooltipContent>
                                                </Tooltip>
                                                <TokenActionButton
                                                    label={t.status === 'approved' ? 'Approved' : 'Approve'}
                                                    icon={Check}
                                                    disabled={busyId === t.id || t.status === 'approved'}
                                                    onClick={() => updateStatus(t.id, 'approved')}
                                                    className="border-green-500/30 bg-green-500/15 text-green-300 hover:bg-green-500/25"
                                                />
                                                <TokenActionButton
                                                    label="Reject"
                                                    icon={X}
                                                    disabled={busyId === t.id}
                                                    onClick={() => updateStatus(t.id, 'rejected')}
                                                    className="border-red-500/30 bg-red-500/15 text-red-300 hover:bg-red-500/25"
                                                />
                                                <TokenActionButton
                                                    label="Delete"
                                                    icon={Trash2}
                                                    disabled={busyId === t.id}
                                                    onClick={() => remove(t.id)}
                                                    className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    </div>
                </TooltipProvider>
            )}
            {/* Footer pagination */}
            <div className="flex items-center justify-between text-sm text-gray-300">
                <div>
                    Page {page} of {Math.max(1, Math.ceil(total / limit))} • Total {total}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="rounded border border-gray-700 px-3 py-1 disabled:opacity-50"
                        disabled={page <= 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        Prev
                    </button>
                    <button
                        className="rounded border border-gray-700 px-3 py-1 disabled:opacity-50"
                        disabled={page >= Math.max(1, Math.ceil(total / limit))}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
            <Drawer
                open={isRegistering}
                onClose={() => {
                    if (!isRegistrationBusy) setIsRegistering(false);
                }}
                title="Register Token"
                maxWidth="max-w-3xl"
            >
                <div className="admin-panel-form flex h-full min-h-full w-full flex-col overflow-y-auto border-l border-white/10 bg-[#0d0d0d]">
                    <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                            <Coins className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                            Register Token
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsRegistering(false)}
                            disabled={isRegistrationBusy}
                            aria-label="Close token registration"
                            className="text-gray-400 transition-colors hover:text-white disabled:opacity-50"
                        >
                            <X size={20} aria-hidden="true" />
                        </button>
                    </header>
                    <div className="p-6">
                        <AdminTokenRegisterDrawer
                            isDrawer
                            onClose={() => setIsRegistering(false)}
                            onBusyChange={setIsRegistrationBusy}
                            onSubmitted={symbol => {
                                setIsRegistering(false);
                                setRefreshKey(value => value + 1);
                                showToast('success', `Token ${symbol} registered successfully.`);
                            }}
                        />
                    </div>
                </div>
            </Drawer>
        </div>
    );
}

function Th({
    children,
    onClick,
    active,
    dir,
}: {
    children: React.ReactNode;
    onClick: () => void;
    active: boolean;
    dir: 'asc' | 'desc';
}) {
    return (
        <th
            scope="col"
            className={`px-6 py-3 select-none cursor-pointer ${active ? 'text-cyan-300' : ''}`}
            onClick={onClick}
        >
            <span className="inline-flex items-center gap-1">
                {children}
                <span className="text-xs opacity-70">{active ? (dir === 'asc' ? '▲' : '▼') : ''}</span>
            </span>
        </th>
    );
}

function SocialSwitch({
    label,
    icon: Icon,
    checked,
    disabled,
    onChange,
}: {
    label: string;
    icon: LucideIcon;
    checked: boolean;
    disabled?: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    aria-label={`${label}: ${checked ? 'visible' : 'hidden'}`}
                    aria-pressed={checked}
                    disabled={disabled}
                    onClick={() => onChange(!checked)}
                    className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        checked
                            ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20'
                            : 'border-white/10 bg-white/5 text-slate-500 hover:bg-white/10'
                    }`}
                >
                    <Icon className="size-3.5" aria-hidden="true" />
                </button>
            </TooltipTrigger>
            <TooltipContent>{`${label}: ${checked ? 'visible' : 'hidden'}`}</TooltipContent>
        </Tooltip>
    );
}

function TokenActionButton({
    label,
    icon: Icon,
    disabled,
    onClick,
    className,
}: {
    label: string;
    icon: LucideIcon;
    disabled?: boolean;
    onClick: () => void;
    className: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    aria-label={label}
                    disabled={disabled}
                    onClick={onClick}
                    className={`inline-flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                >
                    <Icon className="size-4" aria-hidden="true" />
                </button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

export default function AdminTokensPage() {
    return <AdminTokensClient />;
}
