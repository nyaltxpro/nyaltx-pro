"use client";

import React, { useEffect, useState } from "react";

export default function AdminHomePage() {
  const [membershipsCount, setMembershipsCount] = useState<number | null>(null);
  const [tokensRegisteredCount, setTokensRegisteredCount] = useState<number | null>(null);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [listingsCount, setListingsCount] = useState<number | null>(null);
  const [pendingTokens, setPendingTokens] = useState<TokenRegistration[] | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

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
    createdAt: string;
    updatedAt: string;
  };

  useEffect(() => {
    fetch("/api/admin/dashboard-stats")
      .then(async (r) => (r.ok ? r.json() : { data: {} }))
      .then((d) => {
        setMembershipsCount(d?.data?.membershipsCount ?? 0);
        setTokensRegisteredCount(d?.data?.tokensRegisteredCount ?? 0);
        setUsersCount(d?.data?.usersCount ?? 0);
        setListingsCount(d?.data?.listingsCount ?? 0);
      })
      .catch(() => {
        setMembershipsCount(0);
        setTokensRegisteredCount(0);
        setUsersCount(0);
        setListingsCount(0);
      });

  }, []);

  // Load paginated pending tokens whenever page/limit changes
  useEffect(() => {
    setPendingError(null);
    setPendingTokens(null);
    fetch(`/api/admin/tokens?status=pending&page=${page}&limit=${limit}`)
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
      .then((d) => {
        setPendingTokens(d?.data || []);
        setTotal(d?.total || 0);
      })
      .catch(() => {
        setPendingTokens([]);
        setTotal(0);
      });
  }, [page, limit]);

  async function updateStatus(id: string, status: Status) {
    try {
      setBusyId(id);
      setPendingError(null);
      const r = await fetch('/api/admin/tokens', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || 'Update failed');
      // After update, refetch current page
      fetch(`/api/admin/tokens?status=pending&page=${page}&limit=${limit}`)
        .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
        .then((dd) => {
          setPendingTokens(dd?.data || []);
          setTotal(dd?.total || 0);
        })
        .catch(() => setPendingTokens([]));
    } catch (e: any) {
      setPendingError(e?.message || 'Error updating status');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    try {
      setBusyId(id);
      setPendingError(null);
      const r = await fetch(`/api/admin/tokens?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || 'Delete failed');
      // After delete, if current page becomes empty, move back a page
      const nextTotal = Math.max(0, total - 1);
      const maxPage = Math.max(1, Math.ceil(nextTotal / limit));
      const nextPage = Math.min(page, maxPage);
      setPage(nextPage);
      // Refetch list
      fetch(`/api/admin/tokens?status=pending&page=${nextPage}&limit=${limit}`)
        .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
        .then((dd) => {
          setPendingTokens(dd?.data || []);
          setTotal(dd?.total || 0);
        })
        .catch(() => setPendingTokens([]));
    } catch (e: any) {
      setPendingError(e?.message || 'Error deleting');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">Total Memberships</div>
          <div className="text-3xl font-bold">{membershipsCount ?? '—'}</div>
        </div>
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">Total Registered Tokens</div>
          <div className="text-3xl font-bold">{tokensRegisteredCount ?? '—'}</div>
        </div>
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">Total Users</div>
          <div className="text-3xl font-bold">{usersCount ?? '—'}</div>
        </div>
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">Listings</div>
          <div className="text-3xl font-bold">{listingsCount ?? '—'}</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Pending Token Approvals</h3>
          <a href="/admin/tokens" className="text-sm underline text-gray-300">View all</a>
        </div>
        {pendingError && <div className="text-sm text-red-400 mb-2">{pendingError}</div>}
        {!pendingTokens ? (
          <div className="text-gray-400">Loading…</div>
        ) : pendingTokens.length === 0 ? (
          <div className="text-gray-400">No pending registrations.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-300">
                <tr>
                  <th className="px-2 py-1">Created</th>
                  <th className="px-2 py-1">Token</th>
                  <th className="px-2 py-1">Chain</th>
                  <th className="px-2 py-1">Contract</th>
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTokens.map((t) => (
                  <tr key={t.id} className="border-t border-gray-800">
                    <td className="px-2 py-1 whitespace-nowrap">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="px-2 py-1">
                      <div className="flex items-center gap-2">
                        {t.imageUri && <img src={t.imageUri} alt="logo" className="w-6 h-6 rounded" />}
                        <div className="min-w-0">
                          <div className="font-medium">{t.tokenName} <span className="text-gray-400">({t.tokenSymbol})</span></div>
                          <div className="text-xs text-gray-400 truncate max-w-[280px]">{t.website || t.twitter || t.github || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-1">{t.blockchain}</td>
                    <td className="px-2 py-1"><code className="text-xs">{t.contractAddress}</code></td>
                    <td className="px-2 py-1">
                      <div className="flex gap-2">
                        <button disabled={busyId === t.id} onClick={() => updateStatus(t.id, 'approved')} className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs">Approve</button>
                        <button disabled={busyId === t.id} onClick={() => updateStatus(t.id, 'rejected')} className="rounded bg-rose-600 hover:bg-rose-500 px-3 py-1 text-xs">Reject</button>
                        <button disabled={busyId === t.id} onClick={() => remove(t.id)} className="rounded border border-gray-700 px-3 py-1 text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-3 text-sm text-gray-300">
              <div>
                Page {page} of {Math.max(1, Math.ceil(total / limit))} • Total {total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded border border-gray-700 px-3 py-1 disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <button
                  className="rounded border border-gray-700 px-3 py-1 disabled:opacity-50"
                  disabled={page >= Math.max(1, Math.ceil(total / limit))}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-800 p-6">
        <h3 className="font-semibold mb-2">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a 
            href="/admin/tokens" 
            className="block p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
          >
            <h4 className="font-medium mb-2">Manage Tokens</h4>
            <p className="text-sm text-gray-400">View and manage all token registrations</p>
          </a>
          <a 
            href="/admin/points" 
            className="block p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
          >
            <h4 className="font-medium mb-2">Token Points</h4>
            <p className="text-sm text-gray-400">Manage points for token race ranking</p>
          </a>
          <a 
            href="/admin/orders" 
            className="block p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
          >
            <h4 className="font-medium mb-2">Orders</h4>
            <p className="text-sm text-gray-400">View and manage user orders</p>
          </a>
          <a 
            href="/admin/banners" 
            className="block p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
          >
            <h4 className="font-medium mb-2">Banner Management</h4>
            <p className="text-sm text-gray-400">Upload and manage banner images</p>
          </a>
        </div>
      </div>
    </div>
  );
}
