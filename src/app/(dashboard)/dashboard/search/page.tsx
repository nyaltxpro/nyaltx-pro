'use client';

import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ChevronDown, ExternalLink, Filter, Loader, RefreshCw, Search, SortAsc, SortDesc, TrendingUp } from 'lucide-react';
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
    volume24h?: number;
    priceChange?: {
        m5?: number;
        h1?: number;
        h6?: number;
        h24?: number;
    };
    socials?: {
        twitter?: string;
        website?: string;
        telegram?: string;
    };
    dexId?: string;
    pairAddress?: string;
    url?: string;
}

const TokenSkeleton = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10 animate-pulse">
        <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full"></div>
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-6 bg-white/20 rounded w-32"></div>
                    <div className="h-5 bg-white/20 rounded w-16"></div>
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
            >
                {children}
                {sortDirection === 'asc' && <SortAsc size={12} />}
                {sortDirection === 'desc' && <SortDesc size={12} />}
                {!sortDirection && <Filter size={12} className="opacity-40" />}
            </button>
        ) : children}
    </th>
);

export default function TokensPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Token[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<string>('volume24h');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const searchTokens = async () => {
        if (!query.trim()) {
            setError('Please enter a search term');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error('Failed to fetch data from DexScreener');
            }

            const data = await response.json();

            if (!data.pairs || data.pairs.length === 0) {
                setResults([]);
                setError('No tokens found');
                return;
            }

            const tokens: Token[] = data.pairs.map((pair: any) => ({
                id: pair.pairAddress || `${pair.chainId}-${pair.baseToken.address}`,
                address: pair.baseToken.address,
                name: pair.baseToken.name,
                symbol: pair.baseToken.symbol,
                logo: pair.info?.imageUrl,
                chain: pair.chainId,
                price: parseFloat(pair.priceUsd) || 0,
                marketCap: pair.marketCap,
                liquidity: pair.liquidity?.usd,
                createdAt: pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toISOString() : undefined,
                volume24h: pair.volume?.h24,
                priceChange: {
                    m5: pair.priceChange?.m5,
                    h1: pair.priceChange?.h1,
                    h6: pair.priceChange?.h6,
                    h24: pair.priceChange?.h24,
                },
                socials: {
                    twitter: pair.info?.socials?.find((s: any) => s.type === 'twitter')?.url,
                    website: pair.info?.websites?.[0]?.url,
                    telegram: pair.info?.socials?.find((s: any) => s.type === 'telegram')?.url,
                },
                dexId: pair.dexId,
                pairAddress: pair.pairAddress,
                url: pair.url,
            }));

            setResults(tokens);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            searchTokens();
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

    const sortedTokens = useMemo(() => {
        if (!results) return [];

        const tokens = [...results];
        return tokens.sort((a, b) => {
            let aValue: any = a[sortField as keyof Token];
            let bValue: any = b[sortField as keyof Token];

            if (sortField.startsWith('priceChange.')) {
                const changeField = sortField.split('.')[1] as 'm5' | 'h1' | 'h6' | 'h24';
                aValue = a.priceChange?.[changeField] || 0;
                bValue = b.priceChange?.[changeField] || 0;
            }

            if (typeof aValue === 'string') {
                aValue = aValue?.toLowerCase() || '';
                bValue = bValue?.toLowerCase() || '';
            }

            if (typeof aValue === 'number') {
                aValue = aValue || 0;
                bValue = bValue || 0;
            }

            return sortDirection === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        });
    }, [results, sortField, sortDirection]);

    const formatNumber = (num?: number) => {
        if (!num) return 'N/A';
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    const formatPercent = (num?: number) => {
        if (num === undefined || num === null) return 'N/A';
        const sign = num >= 0 ? '+' : '';
        return `${sign}${num.toFixed(2)}%`;
    };

    const getExplorerUrl = (chain: string, address: string) => {
        const explorers: Record<string, string> = {
            ethereum: 'https://etherscan.io/token/',
            bsc: 'https://bscscan.com/token/',
            polygon: 'https://polygonscan.com/token/',
            arbitrum: 'https://arbiscan.io/token/',
            optimism: 'https://optimistic.etherscan.io/token/',
            avalanche: 'https://snowtrace.io/token/',
            base: 'https://basescan.org/token/',
            solana: 'https://solscan.io/token/',
            scroll: 'https://scrollscan.com/token/',
            linea: 'https://lineascan.build/token/',
        };

        return (explorers[chain] || 'https://etherscan.io/token/') + address;
    };

    return (
        <Tooltip.Provider>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="backdrop-blur-lg rounded-md mb-6">
                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Search for tokens (e.g., WETH/USDC, SOL, BTC)"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-800/40 border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                />
                            </div>
                            <button
                                onClick={() => searchTokens()}
                                disabled={loading}
                                className="shadow-2xl px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-xs"
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

                        <div className="flex items-center justify-between">
                            <div className="text-gray-400 text-sm">
                                Powered by DexScreener API
                            </div>
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button className="flex items-center text-xs gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20 text-white">
                                        <Filter size={16} />
                                        Sort by {sortField}
                                        <ChevronDown size={16} />
                                    </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content className="bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-2 min-w-[200px] z-50">
                                        {[
                                            { field: 'name', label: 'Name' },
                                            { field: 'symbol', label: 'Symbol' },
                                            { field: 'price', label: 'Price' },
                                            { field: 'volume24h', label: '24h Volume' },
                                            { field: 'marketCap', label: 'Market Cap' },
                                            { field: 'liquidity', label: 'Liquidity' },
                                            { field: 'priceChange.h24', label: '24h Change' }
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
                    </div>

                    {error && (
                        <div className="my-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

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

                    {!loading && results && results.length > 0 && (
                        <div className="space-y-6">
                            <div className="backdrop-blur-lg rounded-xl">
                                <div className="text-white font-poppins text-base font-extralight" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    Found {results.length} token pair{results.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 overflow-hidden shadow-xl rounded-lg">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-700/30 border-b border-gray-600/20">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Token
                                                </th>
                                                <TableHeader sortable onSort={() => handleSort('price')} sortDirection={sortField === 'price' ? sortDirection : null}>
                                                    Price
                                                </TableHeader>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20">DEX</th>
                                                <TableHeader sortable onSort={() => handleSort('volume24h')} sortDirection={sortField === 'volume24h' ? sortDirection : null}>
                                                    24h Volume
                                                </TableHeader>
                                                <TableHeader sortable onSort={() => handleSort('liquidity')} sortDirection={sortField === 'liquidity' ? sortDirection : null}>
                                                    Liquidity
                                                </TableHeader>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20">5M</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20">1H</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20">6H</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20">24H</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gray-800/20">
                                            {sortedTokens.map((token) => (
                                                <tr key={token.id} className="hover:bg-gray-700/20 transition-all duration-150 border-b border-gray-700/15 last:border-b-0">
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar.Root className="w-8 h-8">
                                                                <Avatar.Image src={token.logo} alt={token.name} className="w-full h-full object-cover rounded-full" />
                                                                <Avatar.Fallback className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs rounded-full">
                                                                    {token.symbol?.slice(0, 2) || '??'}
                                                                </Avatar.Fallback>
                                                            </Avatar.Root>
                                                            <div>
                                                                <div className="text-white font-medium text-sm">{token.name || 'Unknown'}</div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-gray-400 text-xs">{token.symbol || 'N/A'}</span>
                                                                    <span className="px-1.5 py-0.5 rounded text-xs bg-gray-500/30 text-gray-200">{token.chain?.toUpperCase()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className="text-gray-300 font-mono text-sm">
                                                            {token.price ? (token.price < 0.01 ? `$${token.price.toFixed(8)}` : `$${token.price.toFixed(4)}`) : '$0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className="text-gray-400 text-xs uppercase">{token.dexId || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className="text-gray-300 text-sm">{formatNumber(token.volume24h)}</div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className="text-gray-300 text-sm">{formatNumber(token.liquidity)}</div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className={`text-sm font-medium ${!token.priceChange?.m5 ? 'text-gray-400' : token.priceChange.m5 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {formatPercent(token.priceChange?.m5)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className={`text-sm font-medium ${!token.priceChange?.h1 ? 'text-gray-400' : token.priceChange.h1 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {formatPercent(token.priceChange?.h1)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className={`text-sm font-medium ${!token.priceChange?.h6 ? 'text-gray-400' : token.priceChange.h6 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {formatPercent(token.priceChange?.h6)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-gray-700/20">
                                                        <div className={`text-sm font-medium ${!token.priceChange?.h24 ? 'text-gray-400' : token.priceChange.h24 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {formatPercent(token.priceChange?.h24)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <a href={token.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-medium rounded-md transition-all">
                                                                View
                                                            </a>
                                                            <a href={getExplorerUrl(token.chain, token.address)} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-all">
                                                                <ExternalLink size={14} />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && results && results.length === 0 && (
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
                            <Search size={64} className="text-gray-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">No tokens found</h3>
                            <p className="text-gray-300 text-lg mb-4">No results for "{query}"</p>
                        </div>
                    )}

                    {!loading && !results && (
                        <div className="backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
                            <TrendingUp size={64} className="text-blue-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold text-white mb-2">Discover Tokens</h3>
                            <p className="text-gray-300 text-lg mb-6">Search for token pairs across multiple DEXs</p>
                        </div>
                    )}
                </div>
            </div>
        </Tooltip.Provider>
    );
}