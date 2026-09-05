'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaEye, FaSearch, FaWallet, FaEnvelope, FaUser, FaCoins, FaStar, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface UserRecord {
  id: string;
  email?: string;
  walletAddress?: string;
  name?: string;
  registeredAt: string;
  lastActive?: string;
  totalOrders: number;
  totalSpent: number;
  favoriteTokens: number;
  registeredTokens: number;
  source: string;
  metadata?: Record<string, any>;
}

interface UserStats {
  totalUsers: number;
  usersWithEmails: number;
  usersWithWallets: number;
  activeUsers: number;
  totalRevenue: number;
}

const AdminUsersComponent = () => {
  const [users, setUsers] = useState<UserRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '200');

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.status === 401) {
        window.location.href = `/adminpanel/login?from=${encodeURIComponent('/adminpanel/users')}`;
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Failed to fetch users (${response.status})`);
      }

      const result = await response.json();
      setUsers(result.data || []);
      setStats(result.stats || null);
      
      if (searchTerm) {
        toast.success(`Found ${result.data?.length || 0} users matching "${searchTerm}"`);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch users';
      setError(errorMsg);
      setUsers([]);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users?.filter(user => {
    if (sourceFilter && !user.source.includes(sourceFilter)) return false;
    return true;
  }) || [];

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getSourceBadge = (source: string) => {
    const sources = source.split(', ');
    return sources.map((s, index) => {
      const colors = {
        orders: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
        onchain_orders: 'bg-purple-500/10 text-purple-300 border border-purple-500/20',
        favorites: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20',
        token_registrations: 'bg-green-500/10 text-green-300 border border-green-500/20',
        newsletter: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
      };
      const color = colors[s as keyof typeof colors] || 'bg-gray-500/10 text-gray-300 border border-gray-500/20';
      return (
        <span key={index} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color} mr-1`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          {s.replace('_', ' ')}
        </span>
      );
    });
  };

  const openUserModal = (user: UserRecord) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            User Records
          </h2>
          <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            Comprehensive user management and email collection tracking
          </p>
        </div>
        <Link href="/admin" className="text-sm text-gray-300 hover:text-white transition-colors" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          Back to Dashboard
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                <FaUser className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {stats.totalUsers}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Total Users
              </div>
              <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                All registered users
              </div>
            </div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <FaEnvelope className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {stats.usersWithEmails}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                With Emails
              </div>
              <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Email collection rate: {stats.totalUsers > 0 ? Math.round((stats.usersWithEmails / stats.totalUsers) * 100) : 0}%
              </div>
            </div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                <FaWallet className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {stats.usersWithWallets}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                With Wallets
              </div>
              <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Wallet connection rate
              </div>
            </div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                <FaCoins className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {stats.activeUsers}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Active Users
              </div>
              <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Recent activity
              </div>
            </div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <FaCoins className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Total Revenue
              </div>
              <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                All user payments
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Email, wallet address..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 pl-10 text-white text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            >
              <option value="">All Sources</option>
              <option value="orders">Orders</option>
              <option value="onchain_orders">Onchain Orders</option>
              <option value="favorites">Favorites</option>
              <option value="token_registrations">Token Registrations</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchUsers}
              className="w-full bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded text-white font-medium flex items-center justify-center gap-2"
            >
              <FaFilter />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="w-8 h-8 text-gray-400 animate-pulse" />
          </div>
          <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            Loading users...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            Error: {error}
          </p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            No users found
          </p>
        </div>
      ) : (
        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full overflow-hidden">
              <thead className="bg-gray-700/30 border-b border-gray-600/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Activity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Spending
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Engagement
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Registered
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/20">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/20 transition-colors duration-200">
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-600/30 rounded-full flex items-center justify-center border border-gray-600/30">
                          <FaUser className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-white text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {user.name || user.email || formatWalletAddress(user.walletAddress || '')}
                          </div>
                          <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            ID: {user.id.slice(-8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="space-y-2">
                        {user.email && (
                          <div className="flex items-center gap-2 text-xs">
                            <FaEnvelope className="w-3 h-3 text-green-400" />
                            <span className="text-gray-300 truncate max-w-[200px]" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                              {user.email}
                            </span>
                          </div>
                        )}
                        {user.walletAddress && (
                          <div className="flex items-center gap-2 text-xs">
                            <FaWallet className="w-3 h-3 text-purple-400" />
                            <code className="text-gray-300 bg-gray-700/30 px-2 py-1 rounded border border-gray-600/30">
                              {formatWalletAddress(user.walletAddress)}
                            </code>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {user.totalOrders} orders
                          </span>
                        </div>
                        {user.lastActive && (
                          <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            Last: {formatDate(user.lastActive)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-300 border border-green-500/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {formatCurrency(user.totalSpent)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="space-y-1">
                        {user.favoriteTokens > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <FaStar className="w-3 h-3 text-yellow-400" />
                            <span className="text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                              {user.favoriteTokens} favorites
                            </span>
                          </div>
                        )}
                        {user.registeredTokens > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <FaCoins className="w-3 h-3 text-green-400" />
                            <span className="text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                              {user.registeredTokens} tokens
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="flex flex-wrap gap-1">
                        {getSourceBadge(user.source)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <span className="text-gray-300 text-xs" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {formatDate(user.registeredAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => openUserModal(user)}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
                        title="View Details"
                        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                      >
                        <FaEye className="w-3 h-3 inline mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">User Details</h3>
                <button
                  onClick={closeUserModal}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">User ID</label>
                    <div className="text-sm text-white font-mono bg-gray-700 p-2 rounded">
                      {selectedUser.id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Sources</label>
                    <div className="flex flex-wrap gap-1">
                      {getSourceBadge(selectedUser.source)}
                    </div>
                  </div>
                </div>

                {selectedUser.email && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Email</label>
                    <div className="text-sm text-white">{selectedUser.email}</div>
                  </div>
                )}

                {selectedUser.walletAddress && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Wallet Address</label>
                    <div className="text-sm text-white font-mono bg-gray-700 p-2 rounded">
                      {selectedUser.walletAddress}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Total Orders</label>
                    <div className="text-sm text-cyan-400 font-medium">{selectedUser.totalOrders}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Total Spent</label>
                    <div className="text-sm text-green-400 font-medium">
                      {formatCurrency(selectedUser.totalSpent)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Favorite Tokens</label>
                    <div className="text-sm text-yellow-400 font-medium">{selectedUser.favoriteTokens}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Registered Tokens</label>
                    <div className="text-sm text-green-400 font-medium">{selectedUser.registeredTokens}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Registered</label>
                    <div className="text-sm text-white">
                      {new Date(selectedUser.registeredAt).toLocaleString()}
                    </div>
                  </div>
                  {selectedUser.lastActive && (
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Last Active</label>
                      <div className="text-sm text-white">
                        {new Date(selectedUser.lastActive).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {selectedUser.metadata && Object.keys(selectedUser.metadata).length > 0 && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Metadata</label>
                    <div className="text-sm text-white bg-gray-700 p-3 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedUser.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeUserModal}
                  className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="text-center text-sm text-gray-400">
        Showing {filteredUsers.length} users from multiple data sources
      </div>
    </div>
  );
};

export default AdminUsersComponent;
