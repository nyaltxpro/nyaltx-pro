'use client';

import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Separator from '@radix-ui/react-separator';
import * as Tabs from '@radix-ui/react-tabs';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ArrowRight, ChevronDown, Clock, DollarSign, ExternalLink, Filter, Globe, Loader, MessageCircle, RefreshCw, Search, SortAsc, SortDesc, TrendingUp, Twitter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';



interface Token {
    id: string;
    address: string;
    name: string;
    symbol: string;
    logo?: string;
    chain: string;
    price?: number;
    marketCap?: number;
    liquidity?: number;
    createdAt?: string;
    source: 'local' | 'solana';
    status?: string;
    // Additional fields
    volume?: number;
    volume24h?: number;
    holders?: number;
    transactions?: number;
    socials?: {
        twitter?: string;
        website?: string;
        telegram?: string;
    };
    pools?: any[];
}

interface SearchResponse {
    tokens: Token[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasMore: boolean;
    };
    meta?: {
        source: string;
        chain?: string;
        status?: string;
        query?: string;
    };
}

// Skeleton Loader Component
const TokenSkeleton = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10 animate-pulse">
        <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full"></div>
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-6 bg-white/20 rounded w-32"></div>
                    <div className="h-5 bg-white/20 rounded w-16"></div>
                    <div className="h-5 bg-white/20 rounded w-20"></div>
                </div>
                <div className="h-4 bg-white/20 rounded w-full"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-black/20 rounded-lg p-3">
                            <div className="h-4 bg-white/20 rounded w-16 mb-2"></div>
                            <div className="h-5 bg-white/20 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// Table Header Component
const TableHeader = ({ children, sortable = false, onSort, sortDirection }: {
    children: React.ReactNode;
    sortable?: boolean;
    onSort?: () => void;
    sortDirection?: 'asc' | 'desc' | null;
}) => (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20 last:border-r-0" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
        {sortable ? (
            <button
                onClick={onSort}
                className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
            >
                {children}
                {sortDirection === 'asc' && <SortAsc size={12} />}
                {sortDirection === 'desc' && <SortDesc size={12} />}
                {!sortDirection && <Filter size={12} className="opacity-40" />}
            </button>
        ) : (
            children
        )}
    </th>
);

export default function TokensPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [source, setSource] = useState<'all' | 'local' | 'solana'>('all');
    const [sortField, setSortField] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const router = useRouter();

    const searchTokens = async (page?: number) => {
        if (!query.trim()) {
            setError('Please enter a search term');
            return;
        }

        setLoading(true);
        setError(null);

        const searchPage = page || currentPage;

        try {
            // Use the unified tokens API that handles both local and Solana tokens
            const response = await fetch(`/api/tokens?query=${encodeURIComponent(query)}&source=${source}&limit=20&page=${searchPage}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch data');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            searchTokens(1);
        }
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // Sort tokens based on current sort settings
    const sortedTokens = useMemo(() => {
        if (!results?.tokens) return [];

        const tokens = [...results.tokens];
        return tokens.sort((a, b) => {
            let aValue: any = a[sortField as keyof Token];
            let bValue: any = b[sortField as keyof Token];

            // Handle different data types
            if (typeof aValue === 'string') {
                aValue = aValue?.toLowerCase() || '';
                bValue = bValue?.toLowerCase() || '';
            }

            if (typeof aValue === 'number') {
                aValue = aValue || 0;
                bValue = bValue || 0;
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [results?.tokens, sortField, sortDirection]);

    const formatNumber = (num?: number) => {
        if (!num) return 'N/A';
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    const navigateToTrade = (token: Token) => {
        // Build trade URL with available parameters
        const params = new URLSearchParams();

        // Add base symbol parameter
        if (token.symbol) {
            params.set('base', token.symbol);
        }

        // Add token name for display
        if (token.name) {
            params.set('name', token.name);
        }

        // Add chain parameter
        if (token.chain) {
            params.set('chain', token.chain);
        }

        // Add contract address if available
        if (token.address && token.address !== 'N/A') {
            params.set('address', token.address);
        }

        // Add image URI for fallback display on trade page
        if (token.logo) {
            params.set('imageUri', token.logo);
        }

        // Add source information for context
        if (token.source) {
            params.set('source', token.source);
        }

        // Navigate to trade page with parameters
        const tradeUrl = `/dashboard/trade?${params.toString()}`;
        router.push(tradeUrl);
    };

    return (
        <Tooltip.Provider>
            <div className="min-h-screen p-6">
                <div className=" mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">


                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="backdrop-blur-lg rounded-md  mb-6  ">
                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Search for tokens (e.g., SOL, USDC, or token address)"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-800/40 border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                />
                            </div>
                            <button
                                // variant="classic"
                                onClick={() => searchTokens()}
                                disabled={loading}
                                className="shadow-2xl px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white  font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-xs"
                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin" size={16} />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search size={16} />
                                        Search
                                    </>
                                )}
                            </button>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={() => {
                                            setQuery('');
                                            setResults(null);
                                            setError(null);
                                        }}
                                        className="px-3 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors border border-gray-600/30"
                                    >
                                        <RefreshCw size={16} className="text-gray-300" />
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                        Clear Search
                                        <Tooltip.Arrow className="fill-black/90" />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </div>

                        {/* Enhanced Filters with Radix Tabs */}
                        <Tabs.Root value={source} onValueChange={(value) => {
                            setSource(value as 'all' | 'local' | 'solana');
                            setCurrentPage(1);
                            if (query.trim()) {
                                searchTokens(1);
                            }
                        }}>
                            <div className="flex items-center justify-between">


                                {/* Sort Controls */}
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger asChild>
                                        <button className="flex items-center text-xs gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20 text-white">
                                            <Filter size={16} />
                                            Sort by {sortField}
                                            <ChevronDown size={16} />
                                        </button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Portal>
                                        <DropdownMenu.Content className="bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-2 min-w-[200px]">
                                            {[
                                                { field: 'name', label: 'Name' },
                                                { field: 'symbol', label: 'Symbol' },
                                                { field: 'price', label: 'Price' },
                                                { field: 'marketCap', label: 'Market Cap' },
                                                { field: 'createdAt', label: 'Created Date' }
                                            ].map((option) => (
                                                <DropdownMenu.Item
                                                    key={option.field}
                                                    onClick={() => handleSort(option.field)}
                                                    className="flex items-center justify-between px-3 py-2 text-white hover:bg-white/10 rounded cursor-pointer"
                                                >
                                                    {option.label}
                                                    {sortField === option.field && (
                                                        sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                                                    )}
                                                </DropdownMenu.Item>
                                            ))}
                                        </DropdownMenu.Content>
                                    </DropdownMenu.Portal>
                                </DropdownMenu.Root>
                            </div>
                        </Tabs.Root>
                    </div>

                    {error && (
                        <div className="my-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-3">
                                <Loader className="animate-spin text-blue-400" size={24} />
                                <span className="text-white text-lg">Searching tokens...</span>
                            </div>
                        </div>
                        {[...Array(5)].map((_, i) => (
                            <TokenSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Results */}
                {!loading && results && results.tokens && results.tokens.length > 0 && (
                    <div className="space-y-6">
                        {/* Results Header */}
                        <div className=" backdrop-blur-lg rounded-xl  ">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-white font-poppins  text-base font-extralight" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }} >
                                        Search Results {results.pagination.total.toLocaleString()} token{results.pagination.total !== 1 ? 's' : ''}
                                    </div>

                                </div>

                            </div>
                        </div>

                        {/* Professional Table View */}
                        {viewMode === 'table' ? (
                            <div className="bg-gray-800/40 backdrop-blur-lg  border border-gray-700/20 overflow-hidden shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full  overflow-hidden">
                                        <thead className="bg-gray-700/30 border-b border-gray-600/20">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Token
                                                </th>
                                                <TableHeader
                                                    sortable
                                                    onSort={() => handleSort('price')}
                                                    sortDirection={sortField === 'price' ? sortDirection : null}
                                                >
                                                    Price
                                                </TableHeader>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Age
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Volume
                                                </th>
                                                <TableHeader
                                                    sortable
                                                    onSort={() => handleSort('marketCap')}
                                                    sortDirection={sortField === 'marketCap' ? sortDirection : null}
                                                >
                                                    Mcap
                                                </TableHeader>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    5M
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    1H
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    6H
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    24H
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gray-800/20">
                                            {sortedTokens.map((token, index) => (
                                                <tr key={token.id} className="hover:bg-gray-700/20 transition-all duration-150 border-b border-gray-700/15 last:border-b-0">
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar.Root className="w-8 h-8">
                                                                    <Avatar.Image
                                                                        src={token.logo}
                                                                        alt={token.name}
                                                                        className="w-full h-full object-cover rounded-full"
                                                                    />
                                                                    <Avatar.Fallback className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs rounded-full">
                                                                        {token.symbol?.slice(0, 2) || token.name?.slice(0, 2) || '??'}
                                                                    </Avatar.Fallback>
                                                                </Avatar.Root>
                                                                {/* <Avatar.Root className="w-6 h-6 -ml-2">
                                                                    <Avatar.Fallback className={`w-full h-full flex items-center justify-center text-white font-bold text-xs rounded-full border border-gray-600 ${token.chain === 'solana' ? 'bg-purple-600' :
                                                                        token.chain === 'ethereum' ? 'bg-blue-600' :
                                                                            'bg-gray-600'
                                                                        }`}>
                                                                        {token.chain?.slice(0, 1).toUpperCase() || 'C'}
                                                                    </Avatar.Fallback>
                                                                </Avatar.Root> */}
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-medium text-sm" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{token.name || 'Unknown'}</div>
                                                                <div className="text-gray-400 text-xs" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{token.symbol || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className="text-gray-300 font-mono text-sm" style={{ fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace' }}>
                                                            {token.price ?
                                                                token.price < 0.01 ?
                                                                    `$${parseFloat(token.price.toString()).toFixed(8)}` :
                                                                    `$${parseFloat(token.price.toString()).toFixed(4)}`
                                                                : '$0.00'
                                                            }
                                                        </div>
                                                    </td>
                                                    {/* Age Column */}
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                            {token.createdAt ?
                                                                (() => {
                                                                    const now = new Date();
                                                                    const created = new Date(token.createdAt);
                                                                    const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
                                                                    const diffDays = Math.floor(diffHours / 24);

                                                                    if (diffDays > 0) return `${diffDays}d`;
                                                                    if (diffHours > 0) return `${diffHours}h`;
                                                                    return '<1h';
                                                                })()
                                                                : 'N/A'
                                                            }
                                                        </div>
                                                    </td>
                                                    {/* Volume Column */}
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                            {token.volume24h ? formatNumber(token.volume24h) : '$0'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                            {formatNumber(token.marketCap)}
                                                        </div>
                                                    </td>
                                                    {/* 5M Change */}
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className="text-green-400 text-sm font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                            {Math.random() > 0.5 ? '+' : ''}{(Math.random() * 10 - 5).toFixed(2)}%
                                                        </div>
                                                    </td>
                                                    {/* 1H Change */}
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className={`text-sm font-medium ${Math.random() > 0.5 ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                            {Math.random() > 0.5 ? '+' : ''}{(Math.random() * 20 - 10).toFixed(2)}%
                                                        </div>
                                                    </td>
                                                    {/* 6H Change */}
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className={`text-sm font-medium ${Math.random() > 0.5 ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                            {Math.random() > 0.5 ? '+' : ''}{(Math.random() * 30 - 15).toFixed(2)}%
                                                        </div>
                                                    </td>
                                                    {/* 24H Change */}
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className={`text-sm font-medium ${Math.random() > 0.5 ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                            {Math.random() > 0.5 ? '+' : ''}{(Math.random() * 50 - 25).toFixed(2)}%
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => navigateToTrade(token)}
                                                                className="px-3 py-1.5 bg-green-600/90 hover:bg-green-600 text-white text-xs font-medium rounded-md transition-all duration-200 hover:shadow-md"
                                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                            >
                                                                Trade
                                                            </button>

                                                            <Tooltip.Root>
                                                                <Tooltip.Trigger asChild>
                                                                    <a
                                                                        href={
                                                                            token.chain === 'solana' ? `https://solscan.io/token/${token.address}` :
                                                                                token.chain === 'ethereum' ? `https://etherscan.io/token/${token.address}` :
                                                                                    token.chain === 'binance' ? `https://bscscan.com/token/${token.address}` :
                                                                                        `https://etherscan.io/token/${token.address}`
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-all duration-200"
                                                                    >
                                                                        <ExternalLink size={14} className="text-gray-300" />
                                                                    </a>
                                                                </Tooltip.Trigger>
                                                                <Tooltip.Portal>
                                                                    <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                                        View on Explorer
                                                                        <Tooltip.Arrow className="fill-black/90" />
                                                                    </Tooltip.Content>
                                                                </Tooltip.Portal>
                                                            </Tooltip.Root>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            /* Cards View */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedTokens.map((token) => (
                                    <div
                                        key={token.id}
                                        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all shadow-xl border border-white/10 hover:border-white/30 group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <Avatar.Root className="w-16 h-16">
                                                <Avatar.Image
                                                    src={token.logo}
                                                    alt={token.name}
                                                    className="w-full h-full object-cover rounded-full border-2 border-white/20"
                                                />
                                                <Avatar.Fallback className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg rounded-full border-2 border-white/20">
                                                    {token.symbol?.slice(0, 2) || token.name?.slice(0, 2) || '??'}
                                                </Avatar.Fallback>
                                            </Avatar.Root>

                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white mb-1">
                                                            {token.name || 'Unknown Token'}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-3 py-1 bg-blue-500/30 rounded-full text-blue-200 text-sm font-bold">
                                                                {token.symbol || 'N/A'}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${token.chain === 'solana' ? 'bg-purple-500/30 text-purple-200' :
                                                                token.chain === 'ethereum' ? 'bg-blue-500/30 text-blue-200' :
                                                                    token.chain === 'binance' ? 'bg-yellow-500/30 text-yellow-200' :
                                                                        'bg-gray-500/30 text-gray-200'
                                                                }`}>
                                                                {token.chain?.toUpperCase() || 'UNKNOWN'}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${token.source === 'local' ? 'bg-green-500/30 text-green-200' : 'bg-orange-500/30 text-orange-200'
                                                                }`}>
                                                                {token.source === 'local' ? 'REG' : 'LIVE'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <Tooltip.Root>
                                                        <Tooltip.Trigger asChild>
                                                            <button
                                                                onClick={() => navigateToTrade(token)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl group-hover:scale-105"
                                                            >
                                                                <ArrowRight size={16} />
                                                                Trade
                                                            </button>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Portal>
                                                            <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                                Trade {token.symbol}
                                                                <Tooltip.Arrow className="fill-black/90" />
                                                            </Tooltip.Content>
                                                        </Tooltip.Portal>
                                                    </Tooltip.Root>
                                                </div>

                                                <div className="flex items-center gap-2 mb-4">
                                                    <p className="text-gray-300 text-sm font-mono break-all bg-black/20 px-3 py-1.5 rounded-lg flex-1">
                                                        {token.address}
                                                    </p>
                                                    <Tooltip.Root>
                                                        <Tooltip.Trigger asChild>
                                                            <a
                                                                href={
                                                                    token.chain === 'solana' ? `https://solscan.io/token/${token.address}` :
                                                                        token.chain === 'ethereum' ? `https://etherscan.io/token/${token.address}` :
                                                                            token.chain === 'binance' ? `https://bscscan.com/token/${token.address}` :
                                                                                token.chain === 'polygon' ? `https://polygonscan.com/token/${token.address}` :
                                                                                    `https://etherscan.io/token/${token.address}`
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                                            >
                                                                <ExternalLink size={16} className="text-blue-300" />
                                                            </a>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Portal>
                                                            <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                                View on {token.chain === 'solana' ? 'Solscan' : token.chain === 'ethereum' ? 'Etherscan' : token.chain === 'binance' ? 'BSCScan' : token.chain === 'polygon' ? 'PolygonScan' : 'Etherscan'}
                                                                <Tooltip.Arrow className="fill-black/90" />
                                                            </Tooltip.Content>
                                                        </Tooltip.Portal>
                                                    </Tooltip.Root>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="bg-black/20 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <DollarSign className="text-green-400" size={18} />
                                                            <div className="text-gray-400 text-xs">Price</div>
                                                        </div>
                                                        <div className="text-white font-bold text-lg">
                                                            {token.price ? `$${parseFloat(token.price.toString()).toFixed(6)}` : 'N/A'}
                                                        </div>
                                                    </div>

                                                    <div className="bg-black/20 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <TrendingUp className="text-blue-400" size={18} />
                                                            <div className="text-gray-400 text-xs">Market Cap</div>
                                                        </div>
                                                        <div className="text-white font-bold text-lg">
                                                            {formatNumber(token.marketCap)}
                                                        </div>
                                                    </div>

                                                    <div className="bg-black/20 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <TrendingUp className="text-purple-400" size={18} />
                                                            <div className="text-gray-400 text-xs">Liquidity</div>
                                                        </div>
                                                        <div className="text-white font-bold text-lg">
                                                            {formatNumber(token.liquidity)}
                                                        </div>
                                                    </div>

                                                    <div className="bg-black/20 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Clock className="text-yellow-400" size={18} />
                                                            <div className="text-gray-400 text-xs">Created</div>
                                                        </div>
                                                        <div className="text-white font-bold text-lg">
                                                            {token.createdAt ? new Date(token.createdAt).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Social Links */}
                                                {token.socials && (token.socials.website || token.socials.twitter || token.socials.telegram) && (
                                                    <div className="mt-4 pt-4 border-t border-white/20">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-gray-400 text-sm">Links:</span>
                                                            {token.socials.website && (
                                                                <a
                                                                    href={token.socials.website}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-300 hover:text-blue-200 text-sm"
                                                                >
                                                                    🌐 Website
                                                                </a>
                                                            )}
                                                            {token.socials.twitter && (
                                                                <a
                                                                    href={token.socials.twitter}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-300 hover:text-blue-200 text-sm"
                                                                >
                                                                    🐦 Twitter
                                                                </a>
                                                            )}
                                                            {token.socials.telegram && (
                                                                <a
                                                                    href={token.socials.telegram}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-300 hover:text-blue-200 text-sm"
                                                                >
                                                                    💬 Telegram
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Liquidity Pools */}
                                                {token.pools && token.pools.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-white/20">
                                                        <div className="text-gray-300 text-sm">
                                                            💧 {token.pools.length} Liquidity Pool{token.pools.length !== 1 ? 's' : ''} Available
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Social Links */}
                                                {token.socials && (token.socials.website || token.socials.twitter || token.socials.telegram) && (
                                                    <Separator.Root className="my-4 bg-white/20 h-px" />
                                                )}
                                                {token.socials && (token.socials.website || token.socials.twitter || token.socials.telegram) && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-gray-400 text-sm">Links:</span>
                                                        {token.socials.website && (
                                                            <Tooltip.Root>
                                                                <Tooltip.Trigger asChild>
                                                                    <a
                                                                        href={token.socials.website}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                                                    >
                                                                        <Globe size={16} className="text-blue-300" />
                                                                    </a>
                                                                </Tooltip.Trigger>
                                                                <Tooltip.Portal>
                                                                    <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                                        Website
                                                                        <Tooltip.Arrow className="fill-black/90" />
                                                                    </Tooltip.Content>
                                                                </Tooltip.Portal>
                                                            </Tooltip.Root>
                                                        )}
                                                        {token.socials.twitter && (
                                                            <Tooltip.Root>
                                                                <Tooltip.Trigger asChild>
                                                                    <a
                                                                        href={token.socials.twitter}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                                                    >
                                                                        <Twitter size={16} className="text-blue-300" />
                                                                    </a>
                                                                </Tooltip.Trigger>
                                                                <Tooltip.Portal>
                                                                    <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                                        Twitter
                                                                        <Tooltip.Arrow className="fill-black/90" />
                                                                    </Tooltip.Content>
                                                                </Tooltip.Portal>
                                                            </Tooltip.Root>
                                                        )}
                                                        {token.socials.telegram && (
                                                            <Tooltip.Root>
                                                                <Tooltip.Trigger asChild>
                                                                    <a
                                                                        href={token.socials.telegram}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                                                    >
                                                                        <MessageCircle size={16} className="text-blue-300" />
                                                                    </a>
                                                                </Tooltip.Trigger>
                                                                <Tooltip.Portal>
                                                                    <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                                        Telegram
                                                                        <Tooltip.Arrow className="fill-black/90" />
                                                                    </Tooltip.Content>
                                                                </Tooltip.Portal>
                                                            </Tooltip.Root>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Professional Pagination */}
                        {results.pagination.pages > 1 && (
                            <div className=" backdrop-blur-lg rounded-lg p-4 ">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <Tooltip.Root>
                                            <Tooltip.Trigger asChild>
                                                <button
                                                    onClick={() => {
                                                        const newPage = Math.max(1, currentPage - 1);
                                                        setCurrentPage(newPage);
                                                        searchTokens(newPage);
                                                    }}
                                                    disabled={currentPage <= 1 || loading}
                                                    className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 disabled:bg-gray-800/50 text-gray-300 hover:text-white disabled:text-gray-500 rounded-md disabled:cursor-not-allowed transition-all text-sm"
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                >
                                                    <ArrowRight size={14} className="rotate-180" />
                                                    Previous
                                                </button>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                    Go to page {Math.max(1, currentPage - 1)}
                                                    <Tooltip.Arrow className="fill-black/90" />
                                                </Tooltip.Content>
                                            </Tooltip.Portal>
                                        </Tooltip.Root>

                                        <div className="flex items-center gap-1 mx-4">
                                            {Array.from({ length: Math.min(5, results.pagination.pages) }, (_, i) => {
                                                const pageNum = Math.max(1, Math.min(
                                                    results.pagination.pages - 4,
                                                    Math.max(1, currentPage - 2)
                                                )) + i;

                                                if (pageNum > results.pagination.pages) return null;

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => {
                                                            setCurrentPage(pageNum);
                                                            searchTokens(pageNum);
                                                        }}
                                                        disabled={loading}
                                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${currentPage === pageNum
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                                            }`}
                                                        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <Tooltip.Root>
                                            <Tooltip.Trigger asChild>
                                                <button
                                                    onClick={() => {
                                                        const newPage = Math.min(results.pagination.pages, currentPage + 1);
                                                        setCurrentPage(newPage);
                                                        searchTokens(newPage);
                                                    }}
                                                    disabled={currentPage >= results.pagination.pages || loading}
                                                    className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 disabled:bg-gray-800/50 text-gray-300 hover:text-white disabled:text-gray-500 rounded-md disabled:cursor-not-allowed transition-all text-sm"
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                >
                                                    Next
                                                    <ArrowRight size={14} />
                                                </button>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                    Go to page {Math.min(results.pagination.pages, currentPage + 1)}
                                                    <Tooltip.Arrow className="fill-black/90" />
                                                </Tooltip.Content>
                                            </Tooltip.Portal>
                                        </Tooltip.Root>
                                    </div>

                                    <div className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Showing {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, results.pagination.total)} of {results.pagination.total} tokens
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Enhanced Empty State */}
                {!loading && results && results.tokens && results.tokens.length === 0 && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
                        <div className="mb-6">
                            <Search size={64} className="text-gray-400 mx-auto mb-4" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No tokens found</h3>
                        <p className="text-gray-300 text-lg mb-4">No results for "{query}"</p>
                        <div className="space-y-2 text-gray-400">
                            <p>Try searching for:</p>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {['SOL', 'USDC', 'BTC', 'ETH'].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => {
                                            setQuery(suggestion);
                                            setCurrentPage(1);
                                            searchTokens(1);
                                        }}
                                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Welcome State - Show when no search has been performed */}
                {!loading && !results && (
                    <div className=" backdrop-blur-lg  rounded-xl p-12 text-center border border-white/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }} >
                        <div className="mb-6">
                            <TrendingUp size={64} className="text-blue-400 mx-auto mb-4" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-2">Discover Tokens</h3>
                        <p className="text-gray-300 text-lg mb-6">Search for registered tokens and live Solana data</p>

                    </div>
                )}
            </div>
        </Tooltip.Provider>
    );
}