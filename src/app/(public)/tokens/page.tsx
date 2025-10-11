'use client';

import { Clock, DollarSign, ExternalLink, Loader2, Search, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Token {
    address: string;
    name?: string;
    symbol?: string;
    logo?: string;
    price?: number;
    marketCap?: number;
    liquidity?: number;
    createdAt?: string;
    pools?: any[];
}

interface SearchResponse {
    tokens: Token[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
    };
}

export default function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchTokens = async () => {
        if (!query.trim()) {
            setError('Please enter a search term');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/solanatokens?query=${encodeURIComponent(query)}`);

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
            searchTokens();
        }
    };

    const formatNumber = (num?: number) => {
        if (!num) return 'N/A';
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-3">
                        Solana Token Search
                    </h1>
                    <p className="text-blue-200 text-lg">
                        Search tokens by name, symbol, or address on Solana
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-2xl border border-white/20">
                    <div className="flex gap-3">
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
                            onClick={searchTokens}
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
                                Found {results.tokens.length} token{results.tokens.length !== 1 ? 's' : ''}
                            </span>
                            {results.pagination && (
                                <span className="text-sm text-blue-200">
                                    Page {results.pagination.page} of {Math.ceil(results.pagination.total / results.pagination.limit)}
                                </span>
                            )}
                        </div>

                        {results.tokens.map((token, index) => (
                            <div
                                key={index}
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
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-2xl font-bold text-white">
                                                {token.name || 'Unknown Token'}
                                            </h3>
                                            <span className="px-4 py-1.5 bg-blue-500/30 rounded-full text-blue-200 text-sm font-bold">
                                                {token.symbol || 'N/A'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <p className="text-gray-300 text-sm font-mono break-all bg-black/20 px-3 py-1.5 rounded-lg">
                                                {token.address}
                                            </p>
                                            <a
                                                href={`https://solscan.io/token/${token.address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-300 hover:text-blue-200 transition-colors"
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

                                        {token.pools && token.pools.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-white/20">
                                                <div className="text-gray-300 text-sm">
                                                    💧 {token.pools.length} Liquidity Pool{token.pools.length !== 1 ? 's' : ''} Available
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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