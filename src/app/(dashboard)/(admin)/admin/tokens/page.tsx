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

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-gray-300">Status</label>
          <select className="bg-black border border-gray-800 rounded px-2 py-2 flex-1" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-300">Chain</label>
          <select className="bg-black border border-gray-800 rounded px-2 py-2 flex-1" value={chainFilter} onChange={(e) => setChainFilter(e.target.value)}>
            {chains.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <input
            className="w-full bg-black border border-gray-800 rounded px-3 py-2"
            placeholder="Search by name, symbol, or contract..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <label className="text-gray-300">Per page</label>
          <select className="bg-black border border-gray-800 rounded px-2 py-2" value={limit} onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      {!tokens ? (
        <div className="text-gray-400">Loading…</div>
      ) : viewRows.length === 0 ? (
        <div className="text-gray-400">No records found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-black/60 backdrop-blur text-left text-gray-300">
              <tr>
                <Th onClick={() => toggleSort('createdAt')} active={sortKey==='createdAt'} dir={sortDir}>Created</Th>
                <Th onClick={() => toggleSort('tokenName')} active={sortKey==='tokenName'} dir={sortDir}>Token</Th>
                <Th onClick={() => toggleSort('blockchain')} active={sortKey==='blockchain'} dir={sortDir}>Chain</Th>
                <th className="px-3 py-2">Contract</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Paused</th>
                <th className="px-3 py-2">Socials</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {viewRows.map((t) => (
                <tr key={t.id} className="border-t border-gray-800 hover:bg-gray-900/40">
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {t.imageUri && <img src={t.imageUri} alt="logo" className="w-6 h-6 rounded" />}
                      <div className="min-w-0">
                        <div className="font-medium">{t.tokenName} <span className="text-gray-400">({t.tokenSymbol})</span></div>
                        <div className="text-xs text-gray-400 truncate max-w-[320px]">{t.website || t.twitter || t.github || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">{t.blockchain}</td>
                  <td className="px-3 py-2"><code className="text-xs">{t.contractAddress}</code></td>
                  <td className="px-3 py-2 capitalize">{t.status}</td>
                  <td className="px-3 py-2">
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
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <SocialSwitch label="Website" checked={t.showWebsite ?? true} disabled={busyId === t.id} onChange={(val) => patchToken(t.id, { socials: { website: val } })} />
                      <SocialSwitch label="Twitter" checked={t.showTwitter ?? true} disabled={busyId === t.id} onChange={(val) => patchToken(t.id, { socials: { twitter: val } })} />
                      <SocialSwitch label="Telegram" checked={t.showTelegram ?? true} disabled={busyId === t.id} onChange={(val) => patchToken(t.id, { socials: { telegram: val } })} />
                      <SocialSwitch label="Discord" checked={t.showDiscord ?? true} disabled={busyId === t.id} onChange={(val) => patchToken(t.id, { socials: { discord: val } })} />
                      <SocialSwitch label="Github" checked={t.showGithub ?? true} disabled={busyId === t.id} onChange={(val) => patchToken(t.id, { socials: { github: val } })} />
                    </div>
                  </td>
                  <td className="px-3 py-2">
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
    <th className={`px-3 py-2 select-none cursor-pointer ${active ? 'text-cyan-300' : ''}`} onClick={onClick}>
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
