'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Crown,
  Eye,
  Image as ImageIcon,
  List,
  Trash2,
  Users,
  X,
  Search,
} from 'lucide-react';
import { Card } from '@/components/reui/card';
import { Button } from '@/components/reui/button';
import { IconTile } from '@/components/reui/icon-tile';
import { Badge } from '@/components/reui/badge';
import { Filters } from '@/components/reui/filters';
import { Alert } from '@/components/reui/alert';
import { EventCalendar } from '@/components/reui/event-calendar';
import type { CalendarEvent } from '@/components/reui/event-calendar';

function TokenAvatar({ imageUri, tokenName }: { imageUri?: string; tokenName: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="size-10 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
      {imageUri && !imageFailed ? (
        <img
          src={imageUri}
          alt={`${tokenName} logo`}
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <Coins className="size-5 text-slate-400" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardComponent() {
  const router = useRouter();
  const [membershipsCount, setMembershipsCount] = useState<number | null>(null);
  const [tokensRegisteredCount, setTokensRegisteredCount] = useState<number | null>(null);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [listingsCount, setListingsCount] = useState<number | null>(null);
  const [pendingTokens, setPendingTokens] = useState<TokenRegistration[] | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [scheduledEvents, setScheduledEvents] = useState<CalendarEvent[] | null>(null);
  const [publishingCalendarError, setPublishingCalendarError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pendingSearch, setPendingSearch] = useState('');

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

  useEffect(() => {
    let active = true;

    fetch('/api/admin/blog?status=all&limit=100', { credentials: 'include' })
      .then(async response => {
        if (!response.ok) throw new Error('Failed to load scheduled blog posts');
        const data = (await response.json()) as {
          posts?: Array<{
            _id?: string;
            title?: string;
            publishedAt?: string;
            status?: string;
          }>;
        };
        return (data.posts ?? []).flatMap(post => {
          if (!post._id || !post.title || !post.publishedAt) return [];
          const startsAt = new Date(post.publishedAt);
          if (!Number.isFinite(startsAt.getTime())) return [];
          return [{
            id: post._id,
            title: post.title,
            startsAt: startsAt.toISOString(),
            status: post.status,
          }];
        });
      })
      .then(events => {
        if (active) setScheduledEvents(events);
      })
      .catch(error => {
        console.error('Failed to load dashboard publishing calendar', error);
        if (active) setPublishingCalendarError('Unable to load the publishing calendar.');
      });

    return () => {
      active = false;
    };
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

  const filteredPendingTokens = (pendingTokens || []).filter(token => {
    const query = pendingSearch.trim().toLowerCase();
    return (
      !query ||
      [token.tokenName, token.tokenSymbol, token.blockchain, token.contractAddress].some(value =>
        value.toLowerCase().includes(query)
      )
    );
  });

  return (
    <div className="admin-panel-form mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your NYALTX platform</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Memberships', value: membershipsCount ?? '—', description: 'Live membership count', icon: Crown },
          { label: 'Registered Tokens', value: tokensRegisteredCount ?? '—', description: 'Tokens in the registry', icon: Coins },
          { label: 'Total Users', value: usersCount ?? '—', description: 'Registered platform users', icon: Users },
          { label: 'Active Listings', value: listingsCount ?? '—', description: 'Current active listings', icon: List },
        ].map(stat => (
          <Card key={stat.label} className="flex items-center gap-3 p-4">
            <IconTile icon={<stat.icon className="size-5" aria-hidden="true" />} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-300">{stat.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.description}</p>
            </div>
          </Card>
        ))}
      </div>

        {/* Enhanced Pending Tokens Section */}
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold text-white flex items-center gap-3"
              style={{
                fontFamily:
                  'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Coins className="size-4" />
              </div>
              Pending Token Approvals
            </h2>
            <a
              href="/adminpanel/tokens"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-gray-300 hover:text-white transition-all duration-200 backdrop-blur-sm"
              style={{
                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
            >
              <Eye className="size-4" />
              View All
            </a>
          </div>

          {pendingError && <Alert variant="destructive" className="mb-6">{pendingError}</Alert>}

          {pendingTokens && pendingTokens.length > 0 && (
            <Filters
              className="mb-4"
              activeFilters={pendingSearch.trim()
                ? [{ id: 'pending-token-search', label: `Search: ${pendingSearch}`, onRemove: () => setPendingSearch('') }]
                : []}
            >
              <div className="relative min-w-[220px] flex-1">
                <Search className="admin-panel-input-icon" aria-hidden="true" />
                <input
                  type="search"
                  value={pendingSearch}
                  onChange={event => setPendingSearch(event.target.value)}
                  placeholder="Search this page by token, chain, or address..."
                  aria-label="Search current page of pending tokens"
                  className="w-full px-3 py-2"
                />
              </div>
            </Filters>
          )}

          {!pendingTokens ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="size-7 text-slate-400 animate-pulse" />
              </div>
              <p
                className="text-gray-400 font-medium"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                Loading tokens...
              </p>
            </div>
          ) : pendingTokens.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="size-7 text-slate-300" />
              </div>
              <p
                className="text-gray-400 font-medium"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                No pending registrations
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="min-w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-300"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        Created
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-300"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        Token
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-300"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        Chain
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-300"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        Contract
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-300"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {filteredPendingTokens.length > 0 ? (
                      filteredPendingTokens.map(t => (
                        <tr
                          key={t.id}
                          className="hover:bg-gray-800/20 transition-colors duration-200"
                        >
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                            style={{
                              fontFamily:
                                'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                            }}
                          >
                            {new Date(t.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <TokenAvatar imageUri={t.imageUri} tokenName={t.tokenName} />
                              <div className="min-w-0">
                                <div
                                  className="font-semibold text-white"
                                  style={{
                                    fontFamily:
                                      'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                                  }}
                                >
                                  {t.tokenName}
                                </div>
                                <div
                                  className="text-sm text-gray-400"
                                  style={{
                                    fontFamily:
                                      'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                                  }}
                                >
                                  {t.tokenSymbol}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="secondary"
                              size="sm"
                              radius="full"
                              className="text-slate-300"
                            >
                              {t.blockchain}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded font-mono">
                              {t.contractAddress.slice(0, 10)}...{t.contractAddress.slice(-8)}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                disabled={busyId === t.id}
                                onClick={() => updateStatus(t.id, 'approved')}
                                style={{
                                  fontFamily:
                                    'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                                }}
                              >
                                <Check className="size-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={busyId === t.id}
                                onClick={() => updateStatus(t.id, 'rejected')}
                                style={{
                                  fontFamily:
                                    'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                                }}
                              >
                                <X className="size-3" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={busyId === t.id}
                                onClick={() => remove(t.id)}
                                style={{
                                  fontFamily:
                                    'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                                }}
                              >
                                <Trash2 className="size-3" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="h-24 text-center text-gray-400">
                          No pending tokens match this search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              <div className="flex items-center justify-between mt-6 p-4 bg-gray-900/30 rounded-2xl border border-gray-700/30 backdrop-blur-sm">
                <div
                  className="text-sm text-gray-300"
                  style={{
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  Page <span className="font-semibold text-white">{page}</span> of{' '}
                  <span className="font-semibold text-white">
                    {Math.max(1, Math.ceil(total / limit))}
                  </span>{' '}
                  • Total <span className="font-semibold text-white">{total}</span> tokens
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    <ChevronLeft className="size-3" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.max(1, Math.ceil(total / limit))}
                    onClick={() => setPage(p => p + 1)}
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    Next
                    <ChevronRight className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        <section aria-labelledby="quick-actions-heading" className="space-y-4">
          <div>
            <h2 id="quick-actions-heading" className="text-lg font-semibold text-white">
              Quick Actions
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link href="/adminpanel/tokens" className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50">
              <Card className="h-full p-4 transition-colors group-hover:border-cyan-400/30">
                <IconTile icon={<Coins aria-hidden="true" className="size-5" />} />
                <h3 className="mt-4 font-medium text-white">Manage Tokens</h3>
                <p className="mt-1 text-sm text-slate-400">View and manage all token registrations</p>
              </Card>
            </Link>
            <Link href="/adminpanel/points" className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50">
              <Card className="h-full p-4 transition-colors group-hover:border-cyan-400/30">
                <IconTile icon={<Crown aria-hidden="true" className="size-5" />} />
                <h3 className="mt-4 font-medium text-white">Token Points</h3>
                <p className="mt-1 text-sm text-slate-400">Manage points for token race ranking</p>
              </Card>
            </Link>
            <Link href="/adminpanel/orders" className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50">
              <Card className="h-full p-4 transition-colors group-hover:border-cyan-400/30">
                <IconTile icon={<List aria-hidden="true" className="size-5" />} />
                <h3 className="mt-4 font-medium text-white">Orders</h3>
                <p className="mt-1 text-sm text-slate-400">View and manage user orders</p>
              </Card>
            </Link>
            <Link href="/adminpanel/banners" className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50">
              <Card className="h-full p-4 transition-colors group-hover:border-cyan-400/30">
                <IconTile icon={<ImageIcon aria-hidden="true" className="size-5" />} />
                <h3 className="mt-4 font-medium text-white">Banner Management</h3>
                <p className="mt-1 text-sm text-slate-400">Upload and manage banner images</p>
              </Card>
            </Link>
          </div>
        </section>

        {publishingCalendarError ? (
          <Card className="p-5">
            <p className="text-sm text-red-300">{publishingCalendarError}</p>
          </Card>
        ) : scheduledEvents ? (
          <EventCalendar
            title="Publishing calendar"
            events={scheduledEvents}
            onEventSelect={() => router.push('/adminpanel/blog')}
          />
        ) : (
          <Card className="p-5">
            <p className="text-sm text-slate-400">Loading publishing calendar...</p>
          </Card>
        )}
    </div>
  );
}
