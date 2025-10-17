'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FaCoins, FaSearch, FaCheck, FaTimes, FaTrash, FaChevronLeft, FaChevronRight, FaArrowLeft, FaCrown, FaPause, FaPlay, FaEye, FaEyeSlash, FaSort, FaSortUp, FaSortDown, FaPlusCircle, FaExternalLinkAlt } from 'react-icons/fa';

const AdminTokensClient = dynamic(() => Promise.resolve(AdminTokensComponent), {
    ssr: false,
    loading: () => <div className="text-gray-400 py-8 text-center">Loading tokens...</div>
});

type Status = 'pending' | 'approved' | 'rejected';

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
    // Toast notifications
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    function showToast(type: 'success' | 'error', message: string) {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2500);
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
    }, [query]);

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
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg border text-sm ${toast.type === 'success' ? 'bg-emerald-900/70 border-emerald-700 text-emerald-200' : 'bg-rose-900/70 border-rose-700 text-rose-200'}`}
                    role="status"
                    aria-live="polite"
                >
                    {toast.message}
                </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Token Approvals</h2>
                    <p className="text-sm text-gray-400">Review and manage submitted token listings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/tokens/register"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00b8d8] to-[#0099b8] hover:from-[#0099b8] hover:to-[#007a98] text-white rounded-lg transition-all font-medium text-sm"
                    >
                        <FaPlusCircle />
                        Register Token
                    </Link>
                    <Link href="/admin" className="text-sm underline text-gray-300">
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className=" bg-gray-800 rounded-lg shadow-md p-4 border  border-gray-700">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Status Filter */}
                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="status-filter"
                            className="text-sm font-medium text-gray-300 whitespace-nowrap"
                        >
                            Status:
                        </label>
                        <select
                            id="status-filter"
                            className=" border border-gray-300  text-sm rounded-lg  block p-2.5 bg-gray-700 border-gray-600placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                            value={statusFilter}
                            onChange={e => {
                                setStatusFilter(e.target.value as any);
                                setPage(1);
                            }}
                        >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="all">All</option>
                        </select>
                    </div>

                    {/* Chain Filter */}
                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="chain-filter"
                            className="text-sm font-medium text-gray-300 whitespace-nowrap"
                        >
                            Chain:
                        </label>
                        <select
                            id="chain-filter"
                            className=" border  text-sm rounded-lg block p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                            value={chainFilter}
                            onChange={e => setChainFilter(e.target.value)}
                        >
                            {chains.map(c => (
                                <option key={c} value={c}>
                                    {c === 'all' ? 'All Chains' : c}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search Input */}
                    <div className="flex-1 max-w-md">
                        <label htmlFor="table-search" className="sr-only">
                            Search
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg
                                    className="w-4 h-4 text-gray-400"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="table-search"
                                className="block p-2 pl-10 text-sm  border  rounded-lg w-full   bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
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
                        <select
                            id="per-page"
                            className=" border  text-sm rounded-lg  block p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                            value={limit}
                            onChange={e => {
                                setLimit(parseInt(e.target.value, 10));
                                setPage(1);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            {!tokens ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Loading tokens...
                    </p>
                </div>
            ) : viewRows.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        No tokens found
                    </p>
                </div>
            ) : (
                <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full overflow-hidden">
                            <thead className="bg-gray-700/30 border-b border-gray-600/20">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        <button
                                            onClick={() => toggleSort('createdAt')}
                                            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                                        >
                                            Created
                                            {sortKey === 'createdAt' && sortDir === 'asc' && <FaSortUp className="w-3 h-3" />}
                                            {sortKey === 'createdAt' && sortDir === 'desc' && <FaSortDown className="w-3 h-3" />}
                                            {sortKey !== 'createdAt' && <FaSort className="w-3 h-3 opacity-40" />}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        <button
                                            onClick={() => toggleSort('tokenName')}
                                            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                                        >
                                            Token
                                            {sortKey === 'tokenName' && sortDir === 'asc' && <FaSortUp className="w-3 h-3" />}
                                            {sortKey === 'tokenName' && sortDir === 'desc' && <FaSortDown className="w-3 h-3" />}
                                            {sortKey !== 'tokenName' && <FaSort className="w-3 h-3 opacity-40" />}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        <button
                                            onClick={() => toggleSort('blockchain')}
                                            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                                        >
                                            Chain
                                            {sortKey === 'blockchain' && sortDir === 'asc' && <FaSortUp className="w-3 h-3" />}
                                            {sortKey === 'blockchain' && sortDir === 'desc' && <FaSortDown className="w-3 h-3" />}
                                            {sortKey !== 'blockchain' && <FaSort className="w-3 h-3 opacity-40" />}
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
                                                {t.imageUri && (
                                                    <img 
                                                        src={t.imageUri.replace('gateway.pinata.cloud', 'ipfs.io')} 
                                                        alt="Token logo" 
                                                        className="w-8 h-8 rounded-full object-cover border border-gray-600/30"
                                                    />
                                                )}
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
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                                {t.blockchain}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300 border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <code className="text-xs bg-gray-700/30 px-2 py-1 rounded border border-gray-600/30">
                                                {t.contractAddress.slice(0, 6)}...{t.contractAddress.slice(-4)}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                t.status === 'approved' 
                                                    ? 'bg-green-500/10 text-green-300 border border-green-500/20'
                                                    : t.status === 'rejected'
                                                    ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                                            }`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                                            {t.status === 'approved' ? (
                                                <div className="flex flex-col gap-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        t.inRace 
                                                            ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                                                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                    }`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {t.inRace ? '🏁 In Race' : 'Not in Race'}
                                                    </span>
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
                                                <span className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Approve first
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                                            <label className="inline-flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    checked={Boolean(t.paused)}
                                                    disabled={busyId === t.id}
                                                    onChange={e => patchToken(t.id, { paused: e.target.checked })}
                                                />
                                                <span className={`text-xs font-medium ${t.paused ? 'text-red-300' : 'text-green-300'}`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    {t.paused ? 'Paused' : 'Active'}
                                                </span>
                                            </label>
                                        </td>
                                        <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                                            <div className="flex flex-col gap-2">
                                                <SocialSwitch
                                                    label="Website"
                                                    checked={t.showWebsite ?? true}
                                                    disabled={busyId === t.id}
                                                    onChange={(val: boolean) => patchToken(t.id, { socials: { website: val } })}
                                                />
                                                <SocialSwitch
                                                    label="Twitter"
                                                    checked={t.showTwitter ?? true}
                                                    disabled={busyId === t.id}
                                                    onChange={(val: boolean) => patchToken(t.id, { socials: { twitter: val } })}
                                                />
                                                <SocialSwitch
                                                    label="Telegram"
                                                    checked={t.showTelegram ?? true}
                                                    disabled={busyId === t.id}
                                                    onChange={(val: boolean) => patchToken(t.id, { socials: { telegram: val } })}
                                                />
                                                <SocialSwitch
                                                    label="Discord"
                                                    checked={t.showDiscord ?? true}
                                                    disabled={busyId === t.id}
                                                    onChange={(val: boolean) => patchToken(t.id, { socials: { discord: val } })}
                                                />
                                                <SocialSwitch
                                                    label="Github"
                                                    checked={t.showGithub ?? true}
                                                    disabled={busyId === t.id}
                                                    onChange={(val: boolean) => patchToken(t.id, { socials: { github: val } })}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex flex-col gap-2">
                                                {/* Preview on Trade Page Link */}
                                                <Link
                                                    href={`/dashboard/trade?base=${encodeURIComponent(t.tokenSymbol)}&name=${encodeURIComponent(t.tokenName)}&chain=${encodeURIComponent(t.blockchain)}&address=${encodeURIComponent(t.contractAddress)}${t.imageUri ? `&imageUri=${encodeURIComponent(t.imageUri)}` : ''}&source=local`}
                                                    target="_blank"
                                                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-center"
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                >
                                                    <FaExternalLinkAlt className="w-3 h-3 inline mr-1" />
                                                    Preview Trade
                                                </Link>
                                                
                                                {/* Action Buttons */}
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        disabled={busyId === t.id || t.status === 'approved'}
                                                        onClick={() => updateStatus(t.id, 'approved')}
                                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                                                            t.status === 'approved' 
                                                                ? 'bg-green-500/20 text-green-300 border border-green-500/30 cursor-not-allowed' 
                                                                : 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30'
                                                        }`}
                                                        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                    >
                                                        <FaCheck className="w-3 h-3 inline mr-1" />
                                                        {t.status === 'approved' ? 'Approved' : 'Approve'}
                                                    </button>
                                                    <button
                                                        disabled={busyId === t.id}
                                                        onClick={() => updateStatus(t.id, 'rejected')}
                                                        className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                                                        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                    >
                                                        <FaTimes className="w-3 h-3 inline mr-1" />
                                                        Reject
                                                    </button>
                                                    <button
                                                        disabled={busyId === t.id}
                                                        onClick={() => remove(t.id)}
                                                        className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30"
                                                        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                    >
                                                        <FaTrash className="w-3 h-3 inline mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
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
    checked,
    disabled,
    onChange,
}: {
    label: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <label className="flex items-center justify-between gap-3 text-xs">
            <span className="text-gray-300">{label}</span>
            <input
                type="checkbox"
                className="accent-cyan-600"
                checked={checked}
                disabled={disabled}
                onChange={e => onChange(e.target.checked)}
            />
        </label>
    );
}

export default function AdminTokensPage() {
    return <AdminTokensClient />;
}
