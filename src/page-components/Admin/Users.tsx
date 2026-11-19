'use client';

import Link from 'next/link';
import { Dialog } from '@/components/reui/dialog';
import { Button } from '@/components/reui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/reui/dropdown-menu';
import { Filters } from '@/components/reui/filters';
import { Alert } from '@/components/reui/alert';
import { Input } from '@/components/reui/input';
import { NativeSelect } from '@/components/reui/native-select';
import { Badge } from '@/components/reui/badge';
import { paginateItems, TablePagination } from '@/components/reui/table-pagination';
import React, { useEffect, useState } from 'react';
import {
  Coins,
  Mail,
  Eye,
  Filter,
  Search,
  Star,
  User,
  Wallet,
  MoreHorizontal,
} from 'lucide-react';
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
  const [page, setPage] = useState(1);

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

  const filteredUsers =
    users?.filter(user => {
      if (sourceFilter && !user.source.includes(sourceFilter)) return false;
      return true;
    }) || [];
  const paginatedUsers = paginateItems(filteredUsers, page, 10);

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
      const variants: Record<
        string,
        'secondary' | 'info-light' | 'warning-light' | 'success-light' | 'primary-light'
      > = {
        orders: 'info-light',
        onchain_orders: 'secondary',
        favorites: 'warning-light',
        token_registrations: 'success-light',
        newsletter: 'primary-light',
      };
      return (
        <Badge
          key={index}
          variant={variants[s] || 'secondary'}
          size="sm"
          radius="full"
          className="mr-1"
        >
          {s.replace('_', ' ')}
        </Badge>
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
          <h1
            className="text-2xl font-semibold text-white"
            style={{
              fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            }}
          >
            User Records
          </h1>
          <p
            className="text-gray-400 text-sm mt-1"
            style={{
              fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            }}
          >
            Comprehensive user management and email collection tracking
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-gray-300 hover:text-white transition-colors"
          style={{
            fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          }}
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="min-w-0 rounded-lg border border-white/10 bg-transparent p-4 shadow-none transition-colors hover:border-white/20">
            <div className="flex items-center justify-between mb-4">
              <User className="size-5 text-slate-400" aria-hidden="true" />
              <div className="text-right">
                <div
                  className="text-2xl font-bold text-cyan-400"
                  style={{
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {stats.totalUsers}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div
                className="text-sm font-medium text-gray-300"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                Total Users
              </div>
              <div
                className="text-xs text-gray-400"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                All registered users
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-white/10 bg-transparent p-4 shadow-none transition-colors hover:border-white/20">
            <div className="flex items-center justify-between mb-4">
              <Mail className="size-5 text-slate-400" aria-hidden="true" />
              <div className="text-right">
                <div
                  className="text-2xl font-bold text-green-400"
                  style={{
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {stats.usersWithEmails}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div
                className="text-sm font-medium text-gray-300"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                With Emails
              </div>
              <div
                className="text-xs text-gray-400"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                Email collection rate:{' '}
                {stats.totalUsers > 0
                  ? Math.round((stats.usersWithEmails / stats.totalUsers) * 100)
                  : 0}
                %
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-white/10 bg-transparent p-4 shadow-none transition-colors hover:border-white/20">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="size-5 text-slate-400" aria-hidden="true" />
              <div className="text-right">
                <div
                  className="text-2xl font-bold text-purple-400"
                  style={{
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {stats.usersWithWallets}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div
                className="text-sm font-medium text-gray-300"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                With Wallets
              </div>
              <div
                className="text-xs text-gray-400"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                Wallet connection rate
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-white/10 bg-transparent p-4 shadow-none transition-colors hover:border-white/20">
            <div className="flex items-center justify-between mb-4">
              <Coins className="size-5 text-slate-400" aria-hidden="true" />
              <div className="text-right">
                <div
                  className="text-2xl font-bold text-yellow-400"
                  style={{
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {stats.activeUsers}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div
                className="text-sm font-medium text-gray-300"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                Active Users
              </div>
              <div
                className="text-xs text-gray-400"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                Recent activity
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-white/10 bg-transparent p-4 shadow-none transition-colors hover:border-white/20">
            <div className="flex items-center justify-between mb-4">
              <Coins className="size-5 text-slate-400" aria-hidden="true" />
              <div className="text-right">
                <div
                  className="text-2xl font-bold text-green-400"
                  style={{
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div
                className="text-sm font-medium text-gray-300"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                Total Revenue
              </div>
              <div
                className="text-xs text-gray-400"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                All user payments
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Filters
        className="admin-users-filters"
        activeFilters={[
          ...(searchTerm
            ? [{ id: 'search', label: `Search: ${searchTerm}`, onRemove: () => setSearchTerm('') }]
            : []),
          ...(sourceFilter
            ? [
                {
                  id: 'source',
                  label: `Source: ${sourceFilter}`,
                  onRemove: () => setSourceFilter(''),
                },
              ]
            : []),
        ]}
      >
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-500 text-sm" />
            <Input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Email, wallet address..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400">Source</label>
          <NativeSelect
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
          >
            <option value="">All Sources</option>
            <option value="orders">Orders</option>
            <option value="onchain_orders">Onchain Orders</option>
            <option value="favorites">Favorites</option>
            <option value="token_registrations">Token Registrations</option>
            <option value="newsletter">Newsletter</option>
          </NativeSelect>
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchUsers}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-medium text-white transition hover:bg-cyan-500"
          >
            <Filter />
            Apply Filters
          </button>
        </div>
      </Filters>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-slate-400 animate-pulse" />
          </div>
          <p
            className="text-gray-400 font-medium"
            style={{
              fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            }}
          >
            Loading users...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <Alert variant="destructive" className="mx-auto max-w-xl">Error: {error}</Alert>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p
            className="text-gray-400 font-medium"
            style={{
              fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            }}
          >
            No users found
          </p>
        </div>
      ) : (
        <div className="admin-panel-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] overflow-hidden">
              <thead className="bg-gray-700/30 border-b border-gray-600/20">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    User
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    Contact
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    Activity
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    Spending
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    Engagement
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    Source
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    Registered
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/20">
                {paginatedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-700/20 transition-colors duration-200">
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-600/30 rounded-full flex items-center justify-center border border-gray-600/30">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="font-medium text-white text-sm"
                            style={{
                              fontFamily:
                                'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                            }}
                          >
                            {user.name ||
                              user.email ||
                              formatWalletAddress(user.walletAddress || '')}
                          </div>
                          <div
                            className="text-xs text-gray-400"
                            style={{
                              fontFamily:
                                'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                            }}
                          >
                            ID: {user.id.slice(-8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="space-y-2">
                        {user.email && (
                          <div className="flex items-center gap-2 text-xs">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span
                              className="text-gray-300 truncate max-w-[200px]"
                              style={{
                                fontFamily:
                                  'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                              }}
                            >
                              {user.email}
                            </span>
                          </div>
                        )}
                        {user.walletAddress && (
                          <div className="flex items-center gap-2 text-xs">
                            <Wallet className="w-3 h-3 text-slate-500" />
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
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            style={{
                              fontFamily:
                                'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                            }}
                          >
                            {user.totalOrders} orders
                          </span>
                        </div>
                        {user.lastActive && (
                          <div
                            className="text-xs text-gray-400"
                            style={{
                              fontFamily:
                                'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                            }}
                          >
                            Last: {formatDate(user.lastActive)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-300 border border-green-500/20"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        {formatCurrency(user.totalSpent)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="space-y-1">
                        {user.favoriteTokens > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <Star className="w-3 h-3 text-slate-500" />
                            <span
                              className="text-gray-300"
                              style={{
                                fontFamily:
                                  'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                              }}
                            >
                              {user.favoriteTokens} favorites
                            </span>
                          </div>
                        )}
                        {user.registeredTokens > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <Coins className="w-3 h-3 text-slate-500" />
                            <span
                              className="text-gray-300"
                              style={{
                                fontFamily:
                                  'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                              }}
                            >
                              {user.registeredTokens} tokens
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="flex flex-wrap gap-1">{getSourceBadge(user.source)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <span
                        className="text-gray-300 text-xs"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        {formatDate(user.registeredAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Actions for ${user.name || user.email || user.id}`}
                          >
                            <MoreHorizontal className="size-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => openUserModal(user)}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 outline-none focus:bg-white/10"
                          >
                            <Eye className="size-3.5" aria-hidden="true" />
                            View details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination
            page={page}
            pageSize={10}
            total={filteredUsers.length}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <Dialog open={showModal} onClose={closeUserModal} title="User Details" maxWidth="max-w-3xl">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">User Details</h3>
                <button onClick={closeUserModal} className="text-gray-400 hover:text-white text-xl">
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
                    <div className="text-sm text-cyan-400 font-medium">
                      {selectedUser.totalOrders}
                    </div>
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
                    <div className="text-sm text-yellow-400 font-medium">
                      {selectedUser.favoriteTokens}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Registered Tokens</label>
                    <div className="text-sm text-green-400 font-medium">
                      {selectedUser.registeredTokens}
                    </div>
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
        </Dialog>
      )}

      {/* Summary */}
      <div className="text-center text-sm text-gray-400">
        Showing {filteredUsers.length} users from multiple data sources
      </div>
    </div>
  );
};

export default AdminUsersComponent;
