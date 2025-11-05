'use client';


import catalog from '@/data/tokens.json';
import { useTrendingCoins } from '@/hooks/useTrendingCoins';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Loader, RefreshCw, Search, Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
    FaCaretDown,
    FaCaretUp
} from 'react-icons/fa';

// Define types
type TrendingToken = {
    id: string;
    name: string;
    symbol: string;
    logo: string;
    price: number;
    priceUsd: string;
    change24h: number;
    change24hFormatted: string;
    marketCap: number;
    marketCapFormatted: string;
    volume24h: number;
    volume24hFormatted: string;
    rank: number;
    favorite: boolean;
    sparkline: number[];
};

type GlobalMarketData = {
    totalMarketCap: string;
    totalVolume: string;
    btcDominance: string;
    marketCapChange24h: number;
    volumeChange24h: number;
};

// Convert CoinGecko data to TrendingToken format
const convertToTrendingToken = (
    coin: CoinGeckoMarketData,
    favorites: Set<string>
): TrendingToken => {
    return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        logo: coin.image,
        price: coin.current_price,
        priceUsd: `$${coinGeckoService.formatPrice(coin.current_price)}`,
        change24h: coin.price_change_percentage_24h || 0,
        change24hFormatted: coinGeckoService.formatPercentageChange(
            coin.price_change_percentage_24h || 0
        ),
        marketCap: coin.market_cap,
        marketCapFormatted: coinGeckoService.formatMarketCap(coin.market_cap),
        volume24h: coin.total_volume,
        volume24hFormatted: coinGeckoService.formatVolume(coin.total_volume),
        rank: coin.market_cap_rank,
        favorite: favorites.has(coin.id),
        sparkline: coin.sparkline_in_7d?.price?.slice(-15) || [],
    };
};

// Sparkline chart component
const SparklineChart = ({ data, change }: { data: number[]; change: number }) => {
    const isPositive = change >= 0;
    const color = isPositive ? '#26a69a' : '#ef5350';

    // Calculate the path for the sparkline
    const width = 100;
    const height = 30;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data
        .map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default function TrendingPage() {
    const router = useRouter();
    const [darkMode] = useState(true);

    // Redux-based trending coins data
    const {
        trendingCoins: reduxTrendingCoins,
        loading: trendingLoading,
        error: trendingError,
        refreshTrendingCoins,
        hasCachedData,
    } = useTrendingCoins();

    // Local state for UI and additional market data
    const [tokens, setTokens] = useState<TrendingToken[]>([]);
    const [globalData, setGlobalData] = useState<GlobalMarketData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{
        key: keyof TrendingToken;
        direction: 'ascending' | 'descending';
    } | null>(null);
    const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
    const [activeFilter, setActiveFilter] = useState<'all' | 'gainers' | 'losers' | 'favorites'>(
        'all'
    );
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [marketDataLoading, setMarketDataLoading] = useState(false);
    const [marketDataError, setMarketDataError] = useState<string | null>(null);

    // Resolve local mapping for chain/address from catalog by symbol
    const resolveCatalogBySymbol = (symbol: string): { chain?: string; address?: string } => {
        try {
            const list = catalog as Array<{ symbol: string; chain: string; address: string }>;
            const matches = list.filter(t => t.symbol.toUpperCase() === symbol.toUpperCase());
            if (!matches.length) return {};
            // Prefer ethereum when multiple chains exist
            const eth = matches.find(t => t.chain.toLowerCase() === 'ethereum');
            const picked = eth || matches[0];
            return { chain: picked.chain.toLowerCase(), address: picked.address.toLowerCase() };
        } catch {
            return {};
        }
    };

    const navigateToTrade = async (symbol: string) => {
        let { chain, address } = resolveCatalogBySymbol(symbol);

        // Fallback: use DexScreener search to find a matching pair if not in catalog
        if (!chain || !address) {
            try {
                const res = await fetch(
                    `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(symbol)}`
                );
                if (res.ok) {
                    const data = await res.json();
                    const pairs: any[] = data?.pairs || [];
                    // Prefer pairs where the baseToken.symbol matches exactly
                    const exact = pairs.find(
                        p => (p?.baseToken?.symbol || '').toUpperCase() === symbol.toUpperCase()
                    );
                    const pick = exact || pairs[0];
                    if (pick?.chainId && pick?.baseToken?.address) {
                        chain = pick.chainId.toLowerCase();
                        address = (pick.baseToken.address as string).toLowerCase();
                    }
                }
            } catch (e) {
                // ignore network errors
            }
        }

        const qs = new URLSearchParams();
        qs.set('base', symbol.toUpperCase());
        if (chain) qs.set('chain', chain);
        if (address) qs.set('address', address);
        router.push(`/dashboard/trade?${qs.toString()}`);
    };

    // Load additional market data from CoinGecko (for full market view)
    const loadMarketData = async () => {
        try {
            setMarketDataLoading(true);
            setMarketDataError(null);

            // Get top 20 cryptocurrencies and global data in parallel
            const [marketData, globalResponse] = await Promise.all([
                coinGeckoService.getTopCryptocurrencies(20),
                coinGeckoService.getGlobalMarketData().catch(err => {
                    console.warn('Global data failed, using fallback:', err);
                    return {
                        data: {
                            total_market_cap: { usd: 0 },
                            total_volume: { usd: 0 },
                            market_cap_percentage: { btc: 0 },
                            market_cap_change_percentage_24h_usd: 0,
                        },
                    };
                }),
            ]);

            // Convert to TrendingToken format
            const trendingTokens = marketData.map(coin => convertToTrendingToken(coin, favorites));

            // Set global market data with fallback
            const global = globalResponse.data;
            setGlobalData({
                totalMarketCap: global.total_market_cap?.usd
                    ? coinGeckoService.formatMarketCap(global.total_market_cap.usd)
                    : 'N/A',
                totalVolume: global.total_volume?.usd
                    ? coinGeckoService.formatVolume(global.total_volume.usd)
                    : 'N/A',
                btcDominance: global.market_cap_percentage?.btc
                    ? `${global.market_cap_percentage.btc.toFixed(1)}%`
                    : 'N/A',
                marketCapChange24h: global.market_cap_change_percentage_24h_usd || 0,
                volumeChange24h: 0, // CoinGecko doesn't provide volume change in global endpoint
            });

            setTokens(trendingTokens);
        } catch (err) {
            console.error('Error loading market data:', err);
            setMarketDataError('Failed to load market data. Using cached data if available.');

            // Try to show cached data if available
            if (tokens.length === 0) {
                setMarketDataError(
                    'Failed to load market data. Please check your connection and try again.'
                );
            }
        } finally {
            setMarketDataLoading(false);
        }
    };

    // Convert Redux trending coins to TrendingToken format for display
    const convertReduxTrendingToTokens = () => {
        if (!reduxTrendingCoins || reduxTrendingCoins.length === 0) return;

        // Only use Redux data as fallback when market data is not loading and not available
        if (marketDataLoading || tokens.length > 0) return;

        const convertedTokens = reduxTrendingCoins.map((coin, index) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            logo: coin.thumb,
            price: 0,
            priceUsd: 'N/A',
            change24h: 0,
            change24hFormatted: 'N/A',
            marketCap: 0,
            marketCapFormatted: `Rank #${coin.market_cap_rank || index + 1}`,
            volume24h: 0,
            volume24hFormatted: 'N/A',
            rank: coin.market_cap_rank || index + 1,
            favorite: favorites.has(coin.id),
            sparkline: [],
        }));

        setTokens(convertedTokens);
    };

    // Toggle favorite status for a token
    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newFavorites = new Set(favorites);
        if (newFavorites.has(id)) {
            newFavorites.delete(id);
        } else {
            newFavorites.add(id);
        }
        setFavorites(newFavorites);

        // Update tokens with new favorite status
        setTokens(
            tokens.map(token => (token.id === id ? { ...token, favorite: newFavorites.has(id) } : token))
        );
    };

    // Convert Redux trending coins when they change
    useEffect(() => {
        convertReduxTrendingToTokens();
    }, [reduxTrendingCoins, marketDataLoading, tokens.length]);

    // Load additional market data on component mount and set up refresh interval
    useEffect(() => {
        loadMarketData();

        // Refresh data every 10 minutes to reduce API calls
        const interval = setInterval(() => {
            if (!marketDataLoading) {
                loadMarketData();
            }
        }, 10 * 60 * 1000);

        return () => clearInterval(interval);
    }, []); // Remove marketDataLoading dependency to prevent infinite loops

    // Update favorites when tokens change
    useEffect(() => {
        setTokens(prevTokens =>
            prevTokens.map(token => ({
                ...token,
                favorite: favorites.has(token.id),
            }))
        );
    }, [favorites]);

    // Dark mode effect
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Handle search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Sort tokens
    const requestSort = (key: keyof TrendingToken) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Apply sorting
    const sortedTokens = React.useMemo(() => {
        const sortableTokens = [...tokens];
        if (sortConfig !== null) {
            sortableTokens.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableTokens;
    }, [tokens, sortConfig]);

    // Filter tokens
    const filteredTokens = React.useMemo(() => {
        return sortedTokens.filter(token => {
            const matchesSearch =
                token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                token.name.toLowerCase().includes(searchTerm.toLowerCase());

            if (activeFilter === 'gainers') {
                return matchesSearch && token.change24h > 0;
            } else if (activeFilter === 'losers') {
                return matchesSearch && token.change24h < 0;
            } else if (activeFilter === 'favorites') {
                return matchesSearch && token.favorite;
            } else {
                return matchesSearch;
            }
        });
    }, [sortedTokens, searchTerm, activeFilter]);

    // Get sort direction indicator
    const getSortDirectionIndicator = (key: keyof TrendingToken) => {
        if (!sortConfig || sortConfig.key !== key) {
            return null;
        }
        return sortConfig.direction === 'ascending' ? (
            <FaCaretUp className="ml-1" />
        ) : (
            <FaCaretDown className="ml-1" />
        );
    };

    return (
        <Tooltip.Provider>
            <div className="min-h-screen p-6">
                <div className=" mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Trending Cryptocurrencies</h1>
                                <p className="text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Top performing cryptocurrencies with real-time market data</p>
                            </div>
                            <div className="flex items-center gap-4">

                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="backdrop-blur-lg rounded-md mb-6">
                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    placeholder="Search for cryptocurrencies (e.g., BTC, ETH, or token name)"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-800/40 border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                />
                            </div>
                            <button
                                onClick={loadMarketData}
                                disabled={marketDataLoading}
                                className="shadow-2xl px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-xs"
                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                            >
                                {marketDataLoading ? (
                                    <>
                                        <Loader className="animate-spin" size={16} />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={16} />
                                        Refresh
                                    </>
                                )}
                            </button>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={refreshTrendingCoins}
                                        disabled={trendingLoading}
                                        className="flex items-center text-xs gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20 text-white"
                                        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                    >
                                        <TrendingUp size={16} />
                                        Trending
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Refresh trending data
                                        <Tooltip.Arrow className="fill-black/90" />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex gap-2">
                                <button
                                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeFilter === 'all'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    onClick={() => setActiveFilter('all')}
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    All Tokens
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeFilter === 'gainers'
                                        ? 'bg-green-600 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    onClick={() => setActiveFilter('gainers')}
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    Gainers
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeFilter === 'losers'
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    onClick={() => setActiveFilter('losers')}
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    Losers
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeFilter === 'favorites'
                                        ? 'bg-yellow-600 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    onClick={() => setActiveFilter('favorites')}
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    {/* <Star size={14} className="mr-1" /> */}
                                    Favorites
                                </button>
                            </div>

                            {/* <div className="flex gap-2 ml-auto">
                                <button
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${timeframe === '1h'
                                        ? 'bg-cyan-600 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    onClick={() => setTimeframe('1h')}
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    1H
                                </button>
                                <button
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${timeframe === '24h'
                                        ? 'bg-cyan-600 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    onClick={() => setTimeframe('24h')}
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    24H
                                </button>
                                <button
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${timeframe === '7d'
                                        ? 'bg-cyan-600 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    onClick={() => setTimeframe('7d')}
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    7D
                                </button>
                                <button
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${timeframe === '30d'
                                        ? 'bg-cyan-600 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    onClick={() => setTimeframe('30d')}
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    30D
                                </button>
                            </div> */}
                        </div>
                    </div>

                    {/* Enhanced Skeleton Loading State */}
                    {(trendingLoading || marketDataLoading || tokens.length === 0) && (
                        <div className="animate-pulse">
                            {/* Skeleton Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {[1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50"
                                    >
                                        <div className="h-4 bg-gray-700/60 rounded mb-2 w-24"></div>
                                        <div className="h-6 bg-gray-700/60 rounded mb-1 w-32"></div>
                                        <div className="h-4 bg-gray-700/60 rounded w-20"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Skeleton Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50">
                                    <thead className="bg-gray-900/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                                                Rank
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                24h Change
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                Chart (7d)
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                Market Cap
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                Volume (24h)
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {[...Array(10)].map((_, index) => (
                                            <tr key={`skeleton-${index}`} className="bg-gray-800/30">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="h-4 bg-gray-700/60 rounded w-6"></div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 bg-gray-700/60 rounded-full mr-3"></div>
                                                        <div>
                                                            <div className="h-4 bg-gray-700/60 rounded w-16 mb-1"></div>
                                                            <div className="h-3 bg-gray-700/60 rounded w-12"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="h-4 bg-gray-700/60 rounded w-20"></div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="h-4 bg-gray-700/60 rounded w-16"></div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="h-8 bg-gray-700/60 rounded w-20"></div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="h-4 bg-gray-700/60 rounded w-24"></div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="h-4 bg-gray-700/60 rounded w-20"></div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center space-x-3">
                                                        <div className="h-4 w-4 bg-gray-700/60 rounded"></div>
                                                        <div className="h-4 w-4 bg-gray-700/60 rounded"></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {(trendingError || marketDataError) && (
                        <div className="my-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                            <strong>Error:</strong> {trendingError || marketDataError}
                            {hasCachedData && (
                                <div className="text-yellow-400 text-sm mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    📱 Using cached data while resolving issues
                                </div>
                            )}
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={loadMarketData}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    Retry Market Data
                                </button>
                                <button
                                    onClick={refreshTrendingCoins}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    Refresh Trending
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Market Stats Cards */}
                    {globalData && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-800/40 backdrop-blur-lg p-4 rounded-lg border border-gray-700/30">
                                <h3 className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Total Market Cap</h3>
                                <div className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{globalData.totalMarketCap}</div>
                                <div
                                    className={`text-sm ${globalData.marketCapChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    {coinGeckoService.formatPercentageChange(globalData.marketCapChange24h)} (24h)
                                </div>
                            </div>

                            <div className="bg-gray-800/40 backdrop-blur-lg p-4 rounded-lg border border-gray-700/30">
                                <h3 className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>24h Trading Volume</h3>
                                <div className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{globalData.totalVolume}</div>
                                <div className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Global volume</div>
                            </div>

                            <div className="bg-gray-800/40 backdrop-blur-lg p-4 rounded-lg border border-gray-700/30">
                                <h3 className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>BTC Dominance</h3>
                                <div className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{globalData.btcDominance}</div>
                                <div className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Market share</div>
                            </div>
                        </div>
                    )}

                    {/* Tokens Table */}
                    {!trendingLoading && !marketDataLoading && tokens.length > 0 && (
                        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full overflow-hidden">
                                    <thead className="bg-gray-700/30 border-b border-gray-600/20">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                Rank
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                Token
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                Price
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                24h Change
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                Chart (7d)
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                Market Cap
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                Volume (24h)
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-800/20">
                                        {filteredTokens.map((token, index) => (
                                            <tr key={token.id} className="hover:bg-gray-700/20 transition-all duration-150 border-b border-gray-700/15 last:border-b-0">
                                                <td className="px-4 py-3 border-r border-gray-700/20">
                                                    <div className="text-white font-medium text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>#{token.rank}</div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-700/20">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full overflow-hidden">
                                                                <Image src={token.logo} alt={token.name} width={32} height={32} className="w-full h-full object-cover" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium text-sm" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{token.name || 'Unknown'}</div>
                                                            <div className="text-gray-400 text-xs" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{token.symbol || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-700/20">
                                                    <div className="text-gray-300 font-mono text-sm" style={{ fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace' }}>
                                                        {token.priceUsd}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-700/20">
                                                    <div className={`text-sm font-medium ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {token.change24hFormatted}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-700/20">
                                                    <SparklineChart data={token.sparkline} change={token.change24h} />
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-700/20">
                                                    <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {token.marketCapFormatted}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-700/20">
                                                    <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {token.volume24hFormatted}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigateToTrade(token.symbol)}
                                                            className="px-3 py-1.5 bg-green-600/90 hover:bg-green-600 text-white text-xs font-medium rounded-md transition-all duration-200 hover:shadow-md"
                                                            style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                        >
                                                            Trade
                                                        </button>
                                                        <Tooltip.Root>
                                                            <Tooltip.Trigger asChild>
                                                                <button
                                                                    onClick={e => toggleFavorite(token.id, e)}
                                                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-all duration-200"
                                                                >
                                                                    {token.favorite ? <Star size={14} fill="currentColor" className="text-yellow-400" /> : <Star size={14} className="text-gray-300" />}
                                                                </button>
                                                            </Tooltip.Trigger>
                                                            <Tooltip.Portal>
                                                                <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                                    {token.favorite ? 'Remove from favorites' : 'Add to favorites'}
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
                    )}

                    {/* Welcome State - Show when no data available */}
                    {!trendingLoading && !marketDataLoading && tokens.length === 0 && !trendingError && !marketDataError && (
                        <div className="backdrop-blur-lg rounded-xl p-12 text-center border border-white/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            <div className="mb-6">
                                <TrendingUp size={64} className="text-blue-400 mx-auto mb-4" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-2">Discover Trending Cryptocurrencies</h3>
                            <p className="text-gray-300 text-lg mb-6">Real-time market data and trending analysis</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={loadMarketData}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    <RefreshCw size={16} />
                                    Load Market Data
                                </button>
                                <button
                                    onClick={refreshTrendingCoins}
                                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    <TrendingUp size={16} />
                                    Get Trending
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hot Trends Section */}

                </div>
            </div>
        </Tooltip.Provider>
    );
}
