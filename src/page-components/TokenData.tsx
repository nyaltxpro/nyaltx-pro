'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// Types based on Portals API documentation
interface TokenMetrics {
    apy?: string;
    volumeUsd1d?: string;
    volumeUsd7d?: string;
}

interface TokenMetadata {
    tags?: string[];
}

interface PortalsToken {
    key: string;
    name: string;
    decimals: number;
    symbol: string;
    price: number;
    address: string;
    addresses: { [network: string]: string };
    platform: string;
    network: string;
    image?: string;
    images?: string[];
    updatedAt: string;
    createdAt: string;
    tokens?: string[];
    liquidity: number;
    metrics?: TokenMetrics;
    metadata?: TokenMetadata;
    tokenId: string;
    totalSupply?: string;
    reserves?: string[];
    pricePerShare?: number;
    isClaimed?: boolean;
}

interface PortalsResponse {
    pageItems: number;
    totalItems: number;
    page: number;
    more: boolean;
    tokens: PortalsToken[];
}

interface FilterState {
    search: string;
    platforms: string;
    networks: string;
    minLiquidity: string;
    maxLiquidity: string;
    minApy: string;
    maxApy: string;
    tags: string;
}

interface SortState {
    sortBy: 'name' | 'symbol' | 'price' | 'liquidity' | 'platform' | 'network' | 'apy' | 'volumeUsd1d' | 'volumeUsd7d';
    sortDirection: 'asc' | 'desc';
}

const NETWORKS = [
    'ethereum', 'arbitrum', 'base', 'polygon', 'optimism', 'avalanche', 'fantom', 'bsc', 'solana'
];

const PLATFORMS = [
    'yearn-v3', 'yearn', 'morpho', 'uniswap-v3', 'curve', 'balancer', 'euler', 'aave-v3', 'compound'
];

const SORT_OPTIONS = [
    { value: 'name', label: 'Name' },
    { value: 'symbol', label: 'Symbol' },
    { value: 'price', label: 'Price' },
    { value: 'liquidity', label: 'Liquidity' },
    { value: 'platform', label: 'Platform' },
    { value: 'network', label: 'Network' },
    { value: 'apy', label: 'APY' },
    { value: 'volumeUsd1d', label: '24h Volume' },
    { value: 'volumeUsd7d', label: '7d Volume' },
];

export default function TokenData() {
    const router = useRouter();
    const [tokens, setTokens] = useState<PortalsToken[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [limit] = useState(25);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPageTokens, setCurrentPageTokens] = useState<PortalsToken[]>([]);

    const [filters, setFilters] = useState<FilterState>({
        search: '',
        platforms: '',
        networks: '',
        minLiquidity: '',
        maxLiquidity: '',
        minApy: '',
        maxApy: '',
        tags: '',
    });

    const [sort, setSort] = useState<SortState>({
        sortBy: 'liquidity',
        sortDirection: 'desc',
    });

    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'defi' | 'yield' | 'lending' | 'dex'>('all');
    const [activeFilterTab, setActiveFilterTab] = useState<'basic' | 'advanced' | 'networks'>('basic');

    // Format numbers with appropriate suffixes
    const formatNumber = (num: number) => {
        if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
        if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    const formatPrice = (price: number) => {
        if (price < 0.000001) return `$${price.toFixed(8)}`;
        if (price < 0.0001) return `$${price.toFixed(6)}`;
        if (price < 0.01) return `$${price.toFixed(4)}`;
        if (price < 1) return `$${price.toFixed(3)}`;
        return `$${price.toFixed(2)}`;
    };

    const formatApy = (apy: string | undefined) => {
        if (!apy) return 'N/A';
        const numApy = parseFloat(apy);
        return `${numApy.toFixed(2)}%`;
    };

    // Fetch tokens from Portals API
    const fetchTokens = useCallback(async (resetPage = false) => {
        try {
            setLoading(true);
            setError(null);

            const currentPage = resetPage ? 0 : page;
            const params = new URLSearchParams({
                limit: limit.toString(),
                page: currentPage.toString(),
                sortBy: sort.sortBy,
                sortDirection: sort.sortDirection,
            });

            // Add filters
            if (filters.search) params.set('search', filters.search);
            if (filters.platforms) params.set('platforms', filters.platforms);
            if (filters.networks) params.set('networks', filters.networks);
            if (filters.minLiquidity) params.set('minLiquidity', filters.minLiquidity);
            if (filters.maxLiquidity) params.set('maxLiquidity', filters.maxLiquidity);
            if (filters.minApy) params.set('minApy', filters.minApy);
            if (filters.maxApy) params.set('maxApy', filters.maxApy);
            if (filters.tags) params.set('tags', filters.tags);

            console.log('Fetching tokens with params:', params.toString());

            // Note: You'll need to add your Portals API key here
            const response = await fetch(`https://api.portals.fi/v2/tokens?${params.toString()}`, {
                headers: {
                    'Authorization': 'Bearer 22e93a4a-2dd9-4514-a3de-96b0eed6688c', // Replace with actual API key
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: PortalsResponse = await response.json();

            if (resetPage) {
                setTokens(data.tokens);
                setPage(0);
            } else {
                setTokens(prev => currentPage === 0 ? data.tokens : [...prev, ...data.tokens]);
            }

            setTotalItems(data.totalItems);
            setHasMore(data.more);
            setTotalPages(Math.ceil(data.totalItems / limit));

        } catch (err) {
            console.error('Error fetching tokens:', err);
            setError('Failed to fetch tokens. Please check your API key and try again.');
        } finally {
            setLoading(false);
        }
    }, [filters, sort, page, limit]);

    // Initial fetch
    useEffect(() => {
        fetchTokens(true);
    }, [filters, sort]);

    // Handle filter changes
    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Handle sort changes
    const handleSortChange = (newSortBy: SortState['sortBy']) => {
        setSort(prev => ({
            sortBy: newSortBy,
            sortDirection: prev.sortBy === newSortBy && prev.sortDirection === 'asc' ? 'desc' : 'asc',
        }));
    };

    // Load more tokens
    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
            fetchTokens();
        }
    };

    // Navigate to trade page
    const handleTokenClick = (token: PortalsToken) => {
        const params = new URLSearchParams({
            base: token.symbol,
            chain: token.network,
            address: token.address,
            name: token.name,
        });

        if (token.images && token.images.length > 0) {
            params.set('imageUri', token.images[0]);
        }

        params.set('portals_key', token.key);
        router.push(`/dashboard/trade?${params.toString()}`);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            search: '',
            platforms: '',
            networks: '',
            minLiquidity: '',
            maxLiquidity: '',
            minApy: '',
            maxApy: '',
            tags: '',
        });
    };

    // Filter tokens based on active tab
    const getFilteredTokens = () => {
        let filtered = tokens;

        switch (activeTab) {
            case 'defi':
                filtered = tokens.filter(token =>
                    token.metadata?.tags?.some(tag =>
                        tag.includes('defi') || tag.includes('yield') || tag.includes('lending')
                    ) || ['yearn', 'curve', 'balancer', 'uniswap'].some(platform =>
                        token.platform.includes(platform)
                    )
                );
                break;
            case 'yield':
                filtered = tokens.filter(token =>
                    token.metadata?.tags?.some(tag => tag.includes('yield')) ||
                    ['yearn', 'morpho'].some(platform => token.platform.includes(platform)) ||
                    (token.metrics?.apy && parseFloat(token.metrics.apy) > 0)
                );
                break;
            case 'lending':
                filtered = tokens.filter(token =>
                    token.metadata?.tags?.some(tag => tag.includes('lending')) ||
                    ['aave', 'compound', 'euler', 'morpho'].some(platform => token.platform.includes(platform))
                );
                break;
            case 'dex':
                filtered = tokens.filter(token =>
                    ['uniswap', 'curve', 'balancer', 'sushiswap'].some(platform =>
                        token.platform.includes(platform)
                    )
                );
                break;
            default:
                filtered = tokens;
        }

        return filtered;
    };

    const filteredTokens = getFilteredTokens();

    // Pagination for filtered tokens
    const paginateTokens = (tokens: PortalsToken[], currentPage: number, pageSize: number) => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return tokens.slice(startIndex, endIndex);
    };

    const paginatedTokens = paginateTokens(filteredTokens, page, limit);
    const filteredTotalPages = Math.ceil(filteredTokens.length / limit);

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        // Scroll to top of table
        document.querySelector('.tokens-table')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen  text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">🔍 DeFi Token Explorer</h1>
                    <p className="text-gray-400">
                        Comprehensive token data across 290+ DeFi platforms and 10+ networks
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'all', label: 'All Tokens', icon: '🔍' },
                                { id: 'defi', label: 'DeFi', icon: '🏦' },
                                { id: 'yield', label: 'Yield Farming', icon: '🌾' },
                                { id: 'lending', label: 'Lending', icon: '💰' },
                                { id: 'dex', label: 'DEX', icon: '🔄' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Search and Controls */}
                <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 mb-6 shadow-xl">
                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search tokens by name, symbol, or platform..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="flex gap-3">
                            <select
                                value={sort.sortBy}
                                onChange={(e) => handleSortChange(e.target.value as SortState['sortBy'])}
                                className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                {SORT_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => setSort(prev => ({ ...prev, sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc' }))}
                                className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl hover:bg-gray-600/50 transition-all flex items-center justify-center min-w-[48px]"
                            >
                                {sort.sortDirection === 'asc' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                            </svg>
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="border-t border-gray-700/50 pt-6 mt-4">
                            {/* Filter Tabs */}
                            <div className="flex space-x-1 mb-6 bg-gray-700/30 p-1 rounded-xl">
                                {[
                                    { id: 'basic', label: 'Basic Filters', icon: '⚙️' },
                                    { id: 'advanced', label: 'Advanced', icon: '🔧' },
                                    { id: 'networks', label: 'Networks & Platforms', icon: '🌐' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveFilterTab(tab.id as any)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium text-sm transition-all ${activeFilterTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-gray-300 hover:bg-gray-600/30'
                                            }`}
                                    >
                                        <span>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Filter Content */}
                            <div className="min-h-[200px]">
                                {activeFilterTab === 'basic' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Liquidity Range */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-300">💰 Liquidity Range (USD)</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="number"
                                                    placeholder="Min Liquidity"
                                                    value={filters.minLiquidity}
                                                    onChange={(e) => handleFilterChange('minLiquidity', e.target.value)}
                                                    className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Max Liquidity"
                                                    value={filters.maxLiquidity}
                                                    onChange={(e) => handleFilterChange('maxLiquidity', e.target.value)}
                                                    className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* APY Range */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-300">📈 APY Range (%)</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="number"
                                                    placeholder="Min APY"
                                                    value={filters.minApy}
                                                    onChange={(e) => handleFilterChange('minApy', e.target.value)}
                                                    className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Max APY"
                                                    value={filters.maxApy}
                                                    onChange={(e) => handleFilterChange('maxApy', e.target.value)}
                                                    className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeFilterTab === 'advanced' && (
                                    <div className="space-y-6">
                                        {/* Tags */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-3">🏷️ Tags (comma-separated)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., yield-aggregator, lending, defi"
                                                value={filters.tags}
                                                onChange={(e) => handleFilterChange('tags', e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            />
                                            <p className="text-xs text-gray-400 mt-2">Separate multiple tags with commas</p>
                                        </div>
                                    </div>
                                )}

                                {activeFilterTab === 'networks' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Networks */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-300">🌐 Networks</label>
                                            <select
                                                multiple
                                                value={filters.networks.split(',').filter(Boolean)}
                                                onChange={(e) => {
                                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                                    handleFilterChange('networks', selected.join(','));
                                                }}
                                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                                                size={6}
                                            >
                                                {NETWORKS.map(network => (
                                                    <option key={network} value={network}>
                                                        {network.charAt(0).toUpperCase() + network.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-400">Hold Ctrl/Cmd to select multiple</p>
                                        </div>

                                        {/* Platforms */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-300">🏛️ Platforms</label>
                                            <select
                                                multiple
                                                value={filters.platforms.split(',').filter(Boolean)}
                                                onChange={(e) => {
                                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                                    handleFilterChange('platforms', selected.join(','));
                                                }}
                                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                                                size={6}
                                            >
                                                {PLATFORMS.map(platform => (
                                                    <option key={platform} value={platform}>
                                                        {platform.replace('-', ' ').toUpperCase()}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-400">Hold Ctrl/Cmd to select multiple</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Clear Filters Button */}
                            <div className="flex justify-end pt-4 border-t border-gray-700/50">
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Clear All Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Summary */}
                <div className="mb-4 text-gray-400">
                    {loading && tokens.length === 0 ? (
                        'Loading tokens...'
                    ) : (
                        `Showing ${filteredTokens.length} of ${totalItems} tokens in ${activeTab === 'all' ? 'All Categories' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
                    )}
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
                        <div className="text-red-400 mb-2">⚠️ Error</div>
                        <p className="text-gray-300">{error}</p>
                        <button
                            onClick={() => fetchTokens(true)}
                            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors text-sm"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Tokens Table */}
                <div className="tokens-table bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 overflow-hidden shadow-xl rounded-xl mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full overflow-hidden">
                            <thead className="bg-gray-700/30 border-b border-gray-600/20">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Token
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Price
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Liquidity
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        APY
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        24h Volume
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Network
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Platform
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Updated
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/20">
                                {paginatedTokens.map((token) => (
                                    <tr
                                        key={token.key}
                                        onClick={() => handleTokenClick(token)}
                                        className="hover:bg-gray-700/30 cursor-pointer transition-all duration-200 border-b border-gray-700/10"
                                    >
                                        {/* Token Info */}
                                        <td className="px-4 py-3 whitespace-nowrap border-r border-gray-700/20">
                                            <div className="flex items-center">
                                                <div className="relative w-8 h-8 mr-3 flex-shrink-0">
                                                    {token.image && token.image !== 'https://images.portals.fi/unknown-token.png' ? (
                                                        <Image
                                                            src={token.image}
                                                            alt={token.name}
                                                            width={32}
                                                            height={32}
                                                            className="rounded-full object-cover"
                                                            unoptimized
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                target.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${token.image && token.image !== 'https://images.portals.fi/unknown-token.png' ? 'hidden' : ''}`}>
                                                        <span className="text-white font-bold text-xs">
                                                            {token.symbol.charAt(0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-medium text-white truncate max-w-[200px]" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {token.name}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-mono">
                                                        {token.symbol}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <span className="font-medium">{formatPrice(token.price)}</span>
                                        </td>

                                        {/* Liquidity */}
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            <span className="font-medium">{formatNumber(token.liquidity)}</span>
                                        </td>

                                        {/* APY */}
                                        <td className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            {token.metrics?.apy ? (
                                                <span className="text-green-400 font-medium">
                                                    {formatApy(token.metrics.apy)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>

                                        {/* 24h Volume */}
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            {token.metrics?.volumeUsd1d ? (
                                                <span className="font-medium">{formatNumber(parseFloat(token.metrics.volumeUsd1d))}</span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>

                                        {/* Network */}
                                        <td className="px-4 py-3 whitespace-nowrap border-r border-gray-700/20">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                {token.network.toUpperCase()}
                                            </span>
                                        </td>

                                        {/* Platform */}
                                        <td className="px-4 py-3 whitespace-nowrap border-r border-gray-700/20">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                                                {token.platform.replace('-', ' ').toUpperCase()}
                                            </span>
                                        </td>

                                        {/* Updated */}
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            {new Date(token.updatedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {filteredTotalPages > 1 && (
                    <div className="flex items-center justify-between bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Page {page + 1} of {filteredTotalPages}</span>
                            <span>•</span>
                            <span>{filteredTokens.length} total tokens</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* First Page */}
                            <button
                                onClick={() => handlePageChange(0)}
                                disabled={page === 0}
                                className="px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:text-gray-500 rounded-lg transition-all flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                                First
                            </button>

                            {/* Previous Page */}
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 0}
                                className="px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:text-gray-500 rounded-lg transition-all flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, filteredTotalPages) }, (_, i) => {
                                    let pageNum;
                                    if (filteredTotalPages <= 5) {
                                        pageNum = i;
                                    } else if (page < 3) {
                                        pageNum = i;
                                    } else if (page >= filteredTotalPages - 3) {
                                        pageNum = filteredTotalPages - 5 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 text-sm rounded-lg transition-all ${page === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
                                                }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Page */}
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= filteredTotalPages - 1}
                                className="px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:text-gray-500 rounded-lg transition-all flex items-center gap-1"
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Last Page */}
                            <button
                                onClick={() => handlePageChange(filteredTotalPages - 1)}
                                disabled={page >= filteredTotalPages - 1}
                                className="px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:text-gray-500 rounded-lg transition-all flex items-center gap-1"
                            >
                                Last
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && filteredTokens.length === 0 && !error && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <div className="text-4xl mb-2">🔍</div>
                            <p>No tokens found in {activeTab === 'all' ? 'any category' : activeTab} matching your criteria</p>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                View All Categories
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
