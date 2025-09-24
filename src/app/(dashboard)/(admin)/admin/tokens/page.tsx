"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Status = "pending" | "approved" | "rejected";

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

export default function AdminTokensPage() {
  const [statusFilter, setStatusFilter] = useState<Status | "all">("pending");
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"createdAt" | "tokenName" | "tokenSymbol" | "blockchain">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
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
    if (statusFilter !== "all") parts.push(`status=${statusFilter}`);
    parts.push(`page=${page}`);
    parts.push(`limit=${limit}`);
    return parts.length ? `?${parts.join("&")}` : "";
  }, [statusFilter, page, limit]);

  useEffect(() => {
    setError(null);
    setTokens(null);
    fetch(`/api/admin/tokens${query}`)
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
      .then((d) => {
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
        .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
        .then((dd) => {
          setTokens(dd?.data || []);
          setTotal(dd?.total || 0);
          showToast('success', `Status updated to ${status}`);
        })
        .catch(() => { setTokens([]); });
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
      setTokens((prev) => (prev || []).map(t => t.id === id ? { ...t, ...(d.record || {}) } : t));
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
        .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
        .then((dd) => {
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
      setTokens((prev) => (prev || []).map(t => 
        t.id === id ? { ...t, inRace: promote, racePromotedAt: promote ? new Date().toISOString() : undefined } : t
      ));
      
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
    return ["all", ...Array.from(set)];
  }, [tokens]);

  // Client-side search, chain filter and sorting (within current page)
  const viewRows = useMemo(() => {
    const rows = (tokens || []).filter(t => {
      const chainOk = chainFilter === 'all' || t.blockchain === chainFilter;
      const q = search.trim().toLowerCase();
      const searchOk = !q ||
        t.tokenName?.toLowerCase().includes(q) ||
        t.tokenSymbol?.toLowerCase().includes(q) ||
        t.contractAddress?.toLowerCase().includes(q);
      return chainOk && searchOk;
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      if (sortKey === 'createdAt') return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      const av = (a[sortKey] || '').toString().toLowerCase();
      const bv = (b[sortKey] || '').toString().toLowerCase();
      return av.localeCompare(bv) * dir;
    });
    return rows;
  }, [tokens, chainFilter, search, sortKey, sortDir]);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg border text-sm ${toast.type === 'success' ? 'bg-emerald-900/70 border-emerald-700 text-emerald-200' : 'bg-rose-900/70 border-rose-700 text-rose-200'}`}
             role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Token Approvals</h2>
          <p className="text-sm text-gray-400">Review and manage submitted token listings.</p>
        </div>
        <Link href="/admin" className="text-sm underline text-gray-300">Back to Dashboard</Link>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Status:
            </label>
            <select 
              id="status-filter"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>

          {/* Chain Filter */}
          <div className="flex items-center gap-3">
            <label htmlFor="chain-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Chain:
            </label>
            <select 
              id="chain-filter"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
              value={chainFilter} 
              onChange={(e) => setChainFilter(e.target.value)}
            >
              {chains.map(c => <option key={c} value={c}>{c === 'all' ? 'All Chains' : c}</option>)}
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <label htmlFor="table-search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input 
                type="text" 
                id="table-search" 
                className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                placeholder="Search by name, symbol, or contract..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Items Per Page */}
          <div className="flex items-center gap-3">
            <label htmlFor="per-page" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Show:
            </label>
            <select 
              id="per-page"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
              value={limit} 
              onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
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
        <div className="text-gray-400">Loading…</div>
      ) : viewRows.length === 0 ? (
        <div className="text-gray-400">No records found.</div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <Th onClick={() => toggleSort('createdAt')} active={sortKey==='createdAt'} dir={sortDir}>Created</Th>
                <Th onClick={() => toggleSort('tokenName')} active={sortKey==='tokenName'} dir={sortDir}>Token</Th>
                <Th onClick={() => toggleSort('blockchain')} active={sortKey==='blockchain'} dir={sortDir}>Chain</Th>
                <th scope="col" className="px-6 py-3">Contract</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Race</th>
                <th scope="col" className="px-6 py-3">Paused</th>
                <th scope="col" className="px-6 py-3">Socials</th>
                <th scope="col" className="px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {viewRows.map((t) => (
                <tr key={t.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(t.createdAt).toLocaleString()}</td>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <div className="flex items-center gap-2">
                      {t.imageUri && <img src={t.imageUri} alt="logo" className="w-6 h-6 rounded" />}
                      <div className="min-w-0">
                        <div className="font-medium">{t.tokenName} <span className="text-gray-400">({t.tokenSymbol})</span></div>
                        <div className="text-xs text-gray-400 truncate max-w-[320px]">{t.website || t.twitter || t.github || '—'}</div>
                      </div>
                    </div>
                  </th>
                  <td className="px-6 py-4">{t.blockchain}</td>
                  <td className="px-6 py-4"><code className="text-xs">{t.contractAddress}</code></td>
                  <td className="px-6 py-4 capitalize">{t.status}</td>
                  <td className="px-6 py-4">
                    {t.status === 'approved' ? (
                      <div className="flex flex-col gap-1">
                        <div className={`text-xs px-2 py-1 rounded ${t.inRace ? 'bg-yellow-900/50 text-yellow-300' : 'bg-gray-800 text-gray-400'}`}>
                          {t.inRace ? '🏁 In Race' : 'Not in Race'}
                        </div>
                        <button
                          disabled={busyId === t.id}
                          onClick={() => toggleRaceStatus(t.id, !t.inRace)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            t.inRace 
                              ? 'bg-red-600 hover:bg-red-500 text-white' 
                              : 'bg-yellow-600 hover:bg-yellow-500 text-black font-medium'
                          }`}
                        >
                          {t.inRace ? 'Remove' : 'Add to Race'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Approve first</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-cyan-600"
                        checked={Boolean(t.paused)}
                        disabled={busyId === t.id}
                        onChange={(e) => patchToken(t.id, { paused: e.target.checked })}
                      />
                      <span className="text-xs text-gray-400">{t.paused ? 'Paused' : 'Active'}</span>
                    </label>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <SocialSwitch label="Website" checked={t.showWebsite ?? true} disabled={busyId === t.id} onChange={(val) => patchToken(t.id, { socials: { website: val } })} />
                      <SocialSwitch label="Twitter" checked={t.showTwitter ?? true} disabled={busyId === t.id} onChange={(val) => patchToken(t.id, { socials: { twitter: val } })} />
                      <SocialSwitch label="Telegram" checked={t.showTelegram ?? true} disabled={busyId === t.id} onChange={(val) => patchToken(t.id, { socials: { telegram: val } })} />
                      <SocialSwitch label="Discord" checked={t.showDiscord ?? true} disabled={busyId === t.id} onChange={(val) => patchToken(t.id, { socials: { discord: val } })} />
                      <SocialSwitch label="Github" checked={t.showGithub ?? true} disabled={busyId === t.id} onChange={(val) => patchToken(t.id, { socials: { github: val } })} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2">
                      <button
                        disabled={busyId === t.id || t.status === 'approved'}
                        onClick={() => updateStatus(t.id, 'approved')}
                        className={`rounded px-3 py-1 text-xs ${t.status === 'approved' ? 'bg-emerald-700/50 text-emerald-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                      >
                        {t.status === 'approved' ? 'Approved' : 'Approve'}
                      </button>
                      <button disabled={busyId === t.id} onClick={() => updateStatus(t.id, 'rejected')} className="rounded bg-rose-600 hover:bg-rose-500 px-3 py-1 text-xs">Reject</button>
                      <button disabled={busyId === t.id} onClick={() => remove(t.id)} className="rounded border border-gray-700 px-3 py-1 text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer pagination */}
      <div className="flex items-center justify-between text-sm text-gray-300">
        <div>
          Page {page} of {Math.max(1, Math.ceil(total / limit))} • Total {total}
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded border border-gray-700 px-3 py-1 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</button>
          <button className="rounded border border-gray-700 px-3 py-1 disabled:opacity-50" disabled={page >= Math.max(1, Math.ceil(total / limit))} onClick={() => setPage(p => p+1)}>Next</button>
        </div>
      </div>
    </div>
  );
}

function Th({ children, onClick, active, dir }: { children: React.ReactNode; onClick: () => void; active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <th scope="col" className={`px-6 py-3 select-none cursor-pointer ${active ? 'text-cyan-300' : ''}`} onClick={onClick}>
      <span className="inline-flex items-center gap-1">
        {children}
        <span className="text-xs opacity-70">{active ? (dir === 'asc' ? '▲' : '▼') : ''}</span>
      </span>
    </th>
  );
}

function SocialSwitch({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs">
      <span className="text-gray-300">{label}</span>
      <input
        type="checkbox"
        className="accent-cyan-600"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
