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

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
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
                                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
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
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        {/* Search */}
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search tokens by name, symbol, or platform..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Sort */}
                        <div className="flex gap-2">
                            <select
                                value={sort.sortBy}
                                onChange={(e) => handleSortChange(e.target.value as SortState['sortBy'])}
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                                {SORT_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => setSort(prev => ({ ...prev, sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc' }))}
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                {sort.sortDirection === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="border-t border-gray-700 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                {/* Networks */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Networks</label>
                                    <select
                                        multiple
                                        value={filters.networks.split(',').filter(Boolean)}
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            handleFilterChange('networks', selected.join(','));
                                        }}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-sm"
                                        size={4}
                                    >
                                        {NETWORKS.map(network => (
                                            <option key={network} value={network}>
                                                {network.charAt(0).toUpperCase() + network.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Platforms */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Platforms</label>
                                    <select
                                        multiple
                                        value={filters.platforms.split(',').filter(Boolean)}
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            handleFilterChange('platforms', selected.join(','));
                                        }}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-sm"
                                        size={4}
                                    >
                                        {PLATFORMS.map(platform => (
                                            <option key={platform} value={platform}>
                                                {platform.replace('-', ' ').toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Liquidity Range */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Liquidity Range (USD)</label>
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            placeholder="Min Liquidity"
                                            value={filters.minLiquidity}
                                            onChange={(e) => handleFilterChange('minLiquidity', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max Liquidity"
                                            value={filters.maxLiquidity}
                                            onChange={(e) => handleFilterChange('maxLiquidity', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* APY Range */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">APY Range (%)</label>
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            placeholder="Min APY"
                                            value={filters.minApy}
                                            onChange={(e) => handleFilterChange('minApy', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max APY"
                                            value={filters.maxApy}
                                            onChange={(e) => handleFilterChange('maxApy', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., yield-aggregator, lending"
                                    value={filters.tags}
                                    onChange={(e) => handleFilterChange('tags', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-sm"
                                />
                            </div>

                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                            >
                                Clear All Filters
                            </button>
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
                <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Token
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Liquidity
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        APY
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        24h Volume
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Network
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Platform
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Updated
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredTokens.map((token) => (
                                    <tr
                                        key={token.key}
                                        onClick={() => handleTokenClick(token)}
                                        className="hover:bg-gray-700 cursor-pointer transition-colors"
                                    >
                                        {/* Token Info */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="relative w-10 h-10 mr-3">
                                                    {token.images && token.images.length > 0 ? (
                                                        <Image
                                                            src={token.images[0]}
                                                            alt={token.name}
                                                            fill
                                                            className="rounded-full object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-bold text-sm">
                                                                {token.symbol.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white truncate max-w-48">
                                                        {token.name}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {token.symbol}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {formatPrice(token.price)}
                                        </td>

                                        {/* Liquidity */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {formatNumber(token.liquidity)}
                                        </td>

                                        {/* APY */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {token.metrics?.apy ? (
                                                <span className="text-green-400 font-medium">
                                                    {formatApy(token.metrics.apy)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>

                                        {/* 24h Volume */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {token.metrics?.volumeUsd1d ? (
                                                formatNumber(parseFloat(token.metrics.volumeUsd1d))
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>

                                        {/* Network */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                                                {token.network.toUpperCase()}
                                            </span>
                                        </td>

                                        {/* Platform */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                                                {token.platform.replace('-', ' ').toUpperCase()}
                                            </span>
                                        </td>

                                        {/* Updated */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {new Date(token.updatedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Load More */}
                {hasMore && (
                    <div className="text-center">
                        <button
                            onClick={loadMore}
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
                        >
                            {loading ? 'Loading...' : 'Load More Tokens'}
                        </button>
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
