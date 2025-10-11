'use client';

import { Clock, DollarSign, ExternalLink, Loader2, Search, TrendingUp, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [source, setSource] = useState<'all' | 'local' | 'solana'>('all');
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
        <div className="min-h-screen  p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">


                </div>

                {/* Search Bar */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-2xl border border-white/20">
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Search for tokens (e.g., SOL, USDC, or token address)"
                                className="w-full pl-12 pr-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg"
                            />
                        </div>
                        <button
                            onClick={() => searchTokens()}
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Searching...
                                </>
                            ) : (
                                'Search'
                            )}
                        </button>
                    </div>

                    {/* Source Filter */}
                    <div className="flex items-center gap-3">
                        <span className="text-white text-sm font-medium">Source:</span>
                        <div className="flex gap-2">
                            {(['all', 'local', 'solana'] as const).map((sourceOption) => (
                                <button
                                    key={sourceOption}
                                    onClick={() => {
                                        setSource(sourceOption);
                                        setCurrentPage(1);
                                        if (query.trim()) {
                                            searchTokens(1);
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${source === sourceOption
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                >
                                    {sourceOption === 'all' ? 'All Tokens' :
                                        sourceOption === 'local' ? 'Registered' : 'Solana Live'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </div>

                {/* Results */}
                {results && results.tokens && results.tokens.length > 0 && (
                    <div className="space-y-4">
                        <div className="text-white text-xl font-semibold mb-4 flex items-center justify-between">
                            <span>
                                Found {results.pagination.total.toLocaleString()} token{results.pagination.total !== 1 ? 's' : ''}
                                {results.tokens.length < results.pagination.total && ` (showing ${results.tokens.length})`}
                            </span>
                            <div className="flex items-center gap-4 text-sm text-blue-200">
                                {results.meta?.source && (
                                    <span className="px-2 py-1 bg-blue-500/20 rounded">
                                        Source: {results.meta.source.toUpperCase()}
                                    </span>
                                )}
                                <span>
                                    Page {results.pagination.page} of {results.pagination.pages}
                                </span>
                            </div>
                        </div>

                        {results.tokens.map((token) => (
                            <div
                                key={token.id}
                                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all shadow-xl border border-white/10 hover:border-white/30"
                            >
                                <div className="flex items-start gap-4">
                                    {token.logo && (
                                        <img
                                            src={token.logo}
                                            alt={token.name}
                                            className="w-16 h-16 rounded-full border-2 border-white/20"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    )}

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-bold text-white">
                                                    {token.name || 'Unknown Token'}
                                                </h3>
                                                <span className="px-4 py-1.5 bg-blue-500/30 rounded-full text-blue-200 text-sm font-bold">
                                                    {token.symbol || 'N/A'}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${token.chain === 'solana' ? 'bg-purple-500/30 text-purple-200' :
                                                    token.chain === 'ethereum' ? 'bg-blue-500/30 text-blue-200' :
                                                        token.chain === 'binance' ? 'bg-yellow-500/30 text-yellow-200' :
                                                            'bg-gray-500/30 text-gray-200'
                                                    }`}>
                                                    {token.chain.toUpperCase()}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${token.source === 'local' ? 'bg-green-500/30 text-green-200' : 'bg-orange-500/30 text-orange-200'
                                                    }`}>
                                                    {token.source === 'local' ? 'REGISTERED' : 'LIVE'}
                                                </span>
                                            </div>
                                            
                                            {/* Trade Button */}
                                            <button
                                                onClick={() => navigateToTrade(token)}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                                            >
                                                <span>Trade</span>
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <p className="text-gray-300 text-sm font-mono break-all bg-black/20 px-3 py-1.5 rounded-lg">
                                                {token.address}
                                            </p>
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
                                                className="text-blue-300 hover:text-blue-200 transition-colors"
                                                title={`View on ${token.chain === 'solana' ? 'Solscan' : token.chain === 'ethereum' ? 'Etherscan' : token.chain === 'binance' ? 'BSCScan' : token.chain === 'polygon' ? 'PolygonScan' : 'Etherscan'}`}
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                                        {/* Additional Stats for Solana tokens */}
                                        {token.source === 'solana' && (token.holders || token.transactions || token.volume24h) && (
                                            <div className="mt-4 pt-4 border-t border-white/20">
                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    {token.holders && (
                                                        <div>
                                                            <div className="text-white font-bold">{token.holders}</div>
                                                            <div className="text-gray-400 text-xs">Holders</div>
                                                        </div>
                                                    )}
                                                    {token.transactions && (
                                                        <div>
                                                            <div className="text-white font-bold">{token.transactions}</div>
                                                            <div className="text-gray-400 text-xs">Transactions</div>
                                                        </div>
                                                    )}
                                                    {token.volume24h && (
                                                        <div>
                                                            <div className="text-white font-bold">{formatNumber(token.volume24h)}</div>
                                                            <div className="text-gray-400 text-xs">24h Volume</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination Controls */}
                        {results.pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-white/20">
                                <button
                                    onClick={() => {
                                        const newPage = Math.max(1, currentPage - 1);
                                        setCurrentPage(newPage);
                                        searchTokens(newPage);
                                    }}
                                    disabled={currentPage <= 1 || loading}
                                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    {/* Show page numbers */}
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
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => {
                                        const newPage = Math.min(results.pagination.pages, currentPage + 1);
                                        setCurrentPage(newPage);
                                        searchTokens(newPage);
                                    }}
                                    disabled={currentPage >= results.pagination.pages || loading}
                                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {results && results.tokens && results.tokens.length === 0 && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
                        <p className="text-gray-300 text-xl">No tokens found for "{query}"</p>
                        <p className="text-gray-400 mt-2">Try searching for a different term</p>
                    </div>
                )}
            </div>
        </div>
    );
}