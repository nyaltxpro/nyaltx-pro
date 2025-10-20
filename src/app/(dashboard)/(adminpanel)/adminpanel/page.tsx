'use client';

import { useEffect, useState } from 'react';
import { FaChartBar, FaCheck, FaChevronLeft, FaChevronRight, FaCog, FaCoins, FaCrown, FaEye, FaImage, FaListUl, FaTimes, FaTrash, FaUsers } from 'react-icons/fa';

export default function AdminDashboardComponent() {
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
    createdAt: string;
    updatedAt: string;
  };

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then(async r => (r.ok ? r.json() : { data: {} }))
      .then(d => {
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
      .then(async r => (r.ok ? r.json() : Promise.reject(await r.json())))
      .then(d => {
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
        .then(async r => (r.ok ? r.json() : Promise.reject(await r.json())))
        .then(dd => {
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
        .then(async r => (r.ok ? r.json() : Promise.reject(await r.json())))
        .then(dd => {
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
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-3xl flex items-center justify-center shadow-2xl">
              <FaChartBar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Admin Dashboard
              </h1>
              <p className="text-xl text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Manage your NYALTX platform
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-black/40 backdrop-blur-xl border border-gray-800/60 rounded-3xl p-6 shadow-2xl hover:shadow-[#00d4aa]/20 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <FaCrown className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-gray-400 text-sm font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  Total Memberships
                </div>
                <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {membershipsCount ?? '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-gray-800/60 rounded-3xl p-6 shadow-2xl hover:shadow-[#3b82f6]/20 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-2xl flex items-center justify-center">
                <FaCoins className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-gray-400 text-sm font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  Registered Tokens
                </div>
                <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {tokensRegisteredCount ?? '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-gray-800/60 rounded-3xl p-6 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <FaUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-gray-400 text-sm font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  Total Users
                </div>
                <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {usersCount ?? '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-gray-800/60 rounded-3xl p-6 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <FaListUl className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-gray-400 text-sm font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  Active Listings
                </div>
                <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {listingsCount ?? '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Pending Tokens Section */}
        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/60 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <FaCoins className="w-4 h-4 text-white" />
              </div>
              Pending Token Approvals
            </h3>
            <a
              href="/adminpanel/tokens"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-gray-300 hover:text-white transition-all duration-200 backdrop-blur-sm"
              style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
            >
              <FaEye className="w-4 h-4" />
              View All
            </a>
          </div>

          {pendingError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm mb-6">
              <div className="flex items-center gap-3">
                <FaTimes className="text-red-400 text-lg" />
                <p className="text-red-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {pendingError}
                </p>
              </div>
            </div>
          )}

          {!pendingTokens ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCoins className="w-8 h-8 text-gray-400 animate-pulse" />
              </div>
              <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Loading tokens...
              </p>
            </div>
          ) : pendingTokens.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                No pending registrations
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="bg-gray-900/30 rounded-2xl border border-gray-700/30 backdrop-blur-sm overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Token
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Chain
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Contract
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {pendingTokens.map(t => (
                      <tr key={t.id} className="hover:bg-gray-800/20 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {t.imageUri ? (
                              <img src={t.imageUri} alt="logo" className="w-10 h-10 rounded-xl border border-gray-600/30" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-700/50 rounded-xl flex items-center justify-center">
                                <FaCoins className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                {t.tokenName}
                              </div>
                              <div className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                {t.tokenSymbol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {t.blockchain}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded font-mono">
                            {t.contractAddress.slice(0, 10)}...{t.contractAddress.slice(-8)}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              disabled={busyId === t.id}
                              onClick={() => updateStatus(t.id, 'approved')}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-xl transition-all duration-200 disabled:opacity-50 border border-green-500/30"
                              style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                            >
                              <FaCheck className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              disabled={busyId === t.id}
                              onClick={() => updateStatus(t.id, 'rejected')}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all duration-200 disabled:opacity-50 border border-red-500/30"
                              style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                            >
                              <FaTimes className="w-3 h-3" />
                              Reject
                            </button>
                            <button
                              disabled={busyId === t.id}
                              onClick={() => remove(t.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-xl transition-all duration-200 disabled:opacity-50 border border-gray-500/30"
                              style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                            >
                              <FaTrash className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              <div className="flex items-center justify-between mt-6 p-4 bg-gray-900/30 rounded-2xl border border-gray-700/30 backdrop-blur-sm">
                <div className="text-sm text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  Page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{Math.max(1, Math.ceil(total / limit))}</span> •
                  Total <span className="font-semibold text-white">{total}</span> tokens
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                  >
                    <FaChevronLeft className="w-3 h-3" />
                    Previous
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={page >= Math.max(1, Math.ceil(total / limit))}
                    onClick={() => setPage(p => p + 1)}
                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                  >
                    Next
                    <FaChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Quick Actions Section */}
        <div className="bg-black/40 backdrop-blur-xl border border-gray-800/60 rounded-3xl shadow-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <FaCog className="w-4 h-4 text-white" />
            </div>
            Quick Actions
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/adminpanel/tokens"
              className="group block p-6 bg-gray-900/30 hover:bg-gray-800/40 rounded-2xl border border-gray-700/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#00d4aa]/10 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaCoins className="w-6 h-6 text-white" />
                </div>
              </div>
              <h4 className="font-bold text-white mb-2 text-lg" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Manage Tokens
              </h4>
              <p className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                View and manage all token registrations
              </p>
            </a>

            <a
              href="/adminpanel/points"
              className="group block p-6 bg-gray-900/30 hover:bg-gray-800/40 rounded-2xl border border-gray-700/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaCrown className="w-6 h-6 text-white" />
                </div>
              </div>
              <h4 className="font-bold text-white mb-2 text-lg" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Token Points
              </h4>
              <p className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Manage points for token race ranking
              </p>
            </a>

            <a
              href="/adminpanel/orders"
              className="group block p-6 bg-gray-900/30 hover:bg-gray-800/40 rounded-2xl border border-gray-700/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaListUl className="w-6 h-6 text-white" />
                </div>
              </div>
              <h4 className="font-bold text-white mb-2 text-lg" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Orders
              </h4>
              <p className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                View and manage user orders
              </p>
            </a>

            <a
              href="/adminpanel/banners"
              className="group block p-6 bg-gray-900/30 hover:bg-gray-800/40 rounded-2xl border border-gray-700/30 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaImage className="w-6 h-6 text-white" />
                </div>
              </div>
              <h4 className="font-bold text-white mb-2 text-lg" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Banner Management
              </h4>
              <p className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Upload and manage banner images
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
