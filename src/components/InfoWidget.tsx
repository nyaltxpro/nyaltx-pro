import { AlertTriangle, ChevronDown, Copy, ExternalLink, MoreVertical, Star } from 'lucide-react';
import { useState } from 'react';

export interface TokenData {
    // Basic Token Info
    name: string;
    symbol: string;
    baseToken: string;
    chain: string;
    dex: string;
    logoUri?: string;
    description?: string;

    // Price Data
    priceUsd: string;
    priceNative: string;
    priceChange?: string; // Overall price change
    high24h?: string;
    low24h?: string;

    // Market Data
    liquidity: string;
    fdv: string;
    marketCap: string;
    totalSupply?: string;
    circulatingSupply?: string;
    maxSupply?: string;

    // Price Changes (Time Intervals)
    change5m?: string;
    change1h?: string;
    change6h?: string;
    change24h?: string;
    change7d?: string;
    change30d?: string;

    // Trading Stats (24h)
    txns: number;
    buys: number;
    sells: number;
    volume: string;
    volume24h?: string;
    buyVolume: string;
    sellVolume: string;
    volumeChange24h?: string;

    // Maker Stats
    makers: number;
    buyers: number;
    sellers: number;
    uniqueWallets24h?: number;

    // Liquidity Pool Data
    pairCreated?: string;
    pooledToken: string;
    pooledTokenAmount: string;
    pooledTokenValue: string;
    pooledBase: string;
    pooledBaseAmount: string;
    pooledBaseValue: string;

    // Contract Addresses
    pairAddress?: string;
    tokenAddress?: string;
    baseAddress?: string;

    // Social & External Links
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    github?: string;
    coingeckoId?: string;
    coinmarketcapId?: string;

    // Security & Audit
    securityIssues?: Array<{ title: string; description: string }>;
    intelIssues?: Array<{ title: string; description: string }>;
    snifferScore?: number;
    isVerified?: boolean;
    isAudited?: boolean;
    auditBy?: string;

    // Holder Information
    holders?: string;
    top10HoldersPercent?: string;

    // Additional Metrics
    ath?: string; // All-time high
    atl?: string; // All-time low
    athDate?: string;
    atlDate?: string;
    rank?: number;

    // DEX Specific
    dexUrl?: string;
    chartUrl?: string;
}

interface InfoWidgetProps {
    data?: TokenData;
}

export default function InfoWidget({ data }: InfoWidgetProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [goSecurityOpen, setGoSecurityOpen] = useState(false);
    const [quickIntelOpen, setQuickIntelOpen] = useState(false);

    // Default data if no props provided
    const tokenData = {
        // Basic Info
        name: data?.token?.name,
        symbol: data?.token?.name,
        baseToken: data?.token?.name,
        chain: 'SOL',
        dex: 'pummpfun',
        description: data?.token?.description,
        logoUri: data?.token?.image,

        // Prices
        priceUsd: data?.pools[0]?.price?.usd,
        priceNative: data?.pools[0]?.price?.quote,
        high24h: '$0.003250',
        low24h: '$0.003050',

        // Market Data
        liquidity: data?.pools[0]?.liquidity?.usd,
        fdv: '$78K',
        marketCap: data?.pools[0]?.marketCap?.usd,
        totalSupply: data?.pools[0]?.tokenSupply,
        circulatingSupply: '85M',

        // Price Changes

        change5m: data?.events["5m"]?.priceChangePercentage,
        change30m: data?.events["30m"]?.priceChangePercentage,
        change1h: data?.events["1h"]?.priceChangePercentage,
        change2h: data?.events["2h"]?.priceChangePercentage,
        change6h: data?.events["6h"]?.priceChangePercentage,
        change24h: data?.events["24h"]?.priceChangePercentage,



        // Trading Stats
        txns: data?.pools[0]?.txns?.total,
        buys: data?.pools[0]?.txns?.buys,
        sells: data?.pools[0]?.txns?.sells,
        volume: data?.pools[0]?.txns?.volume,
        volume24h: data?.pools[0]?.txns?.volume24h,
        buyVolume: '$287',
        sellVolume: '$202',
        volumeChange24h: '+15.2%',

        // Makers
        makers: 20,
        buyers: 11,
        sellers: 13,
        uniqueWallets24h: 45,

        // Pool Data
        pairCreated: '1y 11d ago',
        pooledToken: 'xSPACE',
        pooledTokenAmount: '6,821,431',
        pooledTokenValue: '$21K',
        pooledBase: 'WPOL',
        pooledBaseAmount: '111,232',
        pooledBaseValue: '$22K',

        // Addresses
        pairAddress: '0xDF6...cD37',
        tokenAddress: '0x1D1...056f',
        baseAddress: '0x0d5...1270',

        // Social Links
        website: 'https://xspace.io',
        twitter: 'https://twitter.com/xspace',
        telegram: 'https://t.me/xspace',

        // Security
        securityIssues: [
            { title: 'Trading Cooldown Detected', description: 'The contract implements a cooldown period between trades which may limit trading frequency.' },
            { title: 'High Slippage Risk', description: 'Low liquidity may result in high slippage for larger trades.' }
        ],
        intelIssues: [
            { title: 'Low Holder Count', description: 'Token has a relatively small number of holders which may indicate limited adoption.' },
            { title: 'Concentrated Ownership', description: 'Top 10 holders control a significant portion of the total supply.' }
        ],
        snifferScore: 45,
        isVerified: true,
        isAudited: false,

        // Holder Info
        holders: '1,234',
        top10HoldersPercent: '45%',

        // Additional Metrics
        ath: '$0.015',
        atl: '$0.001',
        athDate: '3 months ago',
        atlDate: '1 year ago',
        rank: 1250
    };

    return (
        <div className="text-white w-full h-full font-sans shadow-md" style={{ backgroundColor: '#171C1C', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.8), 0 2px 4px -1px rgba(0, 0, 0, 0.6)' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-2 sm:p-3  bg-[#222227] border-b border-gray-800">
                <div className="flex items-center gap-2">
                    {tokenData.logoUri ? (
                        <img src={tokenData.logoUri} alt={tokenData.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
                    ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-dashed border-gray-600 rounded-lg"></div>
                    )}
                    <h1 className="text-sm sm:text-base font-semibold truncate">{tokenData.name}</h1>
                </div>
                <button className="p-1 sm:p-1.5 rounded-lg border border-gray-700">
                    <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            {!showDetails ? (
                /* Main View */
                <div className="p-2 sm:p-3">

                    <div className="flex flex-col gap-2 mb-2 sm:mb-3" style={{ backgroundColor: '#111116', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-2">
                            <h2 className="text-sm sm:text-base font-semibold">{tokenData.symbol}</h2>
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            <span className="text-sm sm:text-base text-gray-400">/</span>
                            <span className="text-sm sm:text-base font-semibold">{tokenData.baseToken}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-1 sm:gap-1.5 bg-purple-600/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-600 rounded-full"></div>
                                <span className="text-xs">{tokenData.chain}</span>
                                <span className="text-gray-400 text-xs">{'>'}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5 bg-pink-600/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-pink-600 rounded"></div>
                                <span className="text-xs">{tokenData.dex}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2">
                        <div className="bg-transparent rounded-lg p-1.5 sm:p-2 border border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">PRICE USD</div>
                            <div className="text-sm sm:text-base font-semibold truncate">{tokenData.priceUsd}</div>
                        </div>
                        <div className="bg-transparent rounded-lg p-1.5 sm:p-2 border border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">PRICE</div>
                            <div className="text-sm sm:text-base font-semibold truncate">{tokenData.priceNative}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2">
                        <div className="bg-transparent rounded-lg p-1.5 sm:p-2 border border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">LIQUIDITY</div>
                            <div className="text-xs sm:text-sm font-semibold truncate">{tokenData.liquidity}</div>
                        </div>
                        <div className="bg-transparent rounded-lg p-1.5 sm:p-2 border border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">FDV</div>
                            <div className="text-xs sm:text-sm font-semibold truncate">{tokenData.fdv}</div>
                        </div>
                        <div className="bg-transparent rounded-lg p-1.5 sm:p-2 border border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">MKT CAP</div>
                            <div className="text-xs sm:text-sm font-semibold truncate">{tokenData.marketCap}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 mb-2 bg-transparent rounded-lg border border-gray-800 overflow-hidden">
                        <button className="py-1.5 sm:py-2 text-center border-r border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">5M</div>
                            <div className={`text-xs font-semibold ${parseFloat(tokenData.change5m || '0') >= 0 ? 'text-lime-400' : 'text-red-400'}`}>{tokenData.change5m || 'N/A'}</div>
                        </button>
                        <button className="py-1.5 sm:py-2 text-center border-r border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">1H</div>
                            <div className={`text-xs font-semibold ${parseFloat(tokenData.change1h || '0') >= 0 ? 'text-lime-400' : 'text-red-400'}`}>{tokenData.change1h || 'N/A'}</div>
                        </button>
                        <button className="py-1.5 sm:py-2 text-center border-r border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">6H</div>
                            <div className={`text-xs font-semibold ${parseFloat(tokenData.change6h || '0') >= 0 ? 'text-lime-400' : 'text-red-400'}`}>{tokenData.change6h || 'N/A'}</div>
                        </button>
                        <button className="py-1.5 sm:py-2 text-center bg-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">24H</div>
                            <div className={`text-xs font-semibold ${parseFloat(tokenData.change24h || '0') >= 0 ? 'text-lime-400' : 'text-red-400'}`}>{tokenData.change24h || 'N/A'}</div>
                        </button>
                    </div>

                    <div className="bg-transparent rounded-lg border border-gray-800 p-2 sm:p-3 mb-2">
                        <div className="mb-2 sm:mb-3">
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-xs">TXNS</span>
                                <div className="flex gap-3 sm:gap-4">
                                    <span className="text-gray-400 text-xs">BUYS</span>
                                    <span className="text-gray-400 text-xs">SELLS</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm sm:text-base font-semibold">{tokenData.txns}</span>
                                <div className="flex gap-4 sm:gap-6">
                                    <span className="text-xs sm:text-sm font-semibold">{tokenData.buys}</span>
                                    <span className="text-xs sm:text-sm font-semibold">{tokenData.sells}</span>
                                </div>
                            </div>
                            <div className="flex h-1.5 rounded-full overflow-hidden">
                                <div className="bg-lime-500" style={{ width: `${(tokenData.buys / tokenData.txns * 100).toFixed(0)}%` }}></div>
                                <div className="bg-red-500" style={{ width: `${(tokenData.sells / tokenData.txns * 100).toFixed(0)}%` }}></div>
                            </div>
                        </div>

                        <div className="mb-2 sm:mb-3">
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-xs">VOLUME</span>
                                <div className="flex gap-2 sm:gap-3">
                                    <span className="text-gray-400 text-xs">BUY VOL</span>
                                    <span className="text-gray-400 text-xs">SELL VOL</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm sm:text-base font-semibold">{tokenData.volume}</span>
                                <div className="flex gap-4 sm:gap-6">
                                    <span className="text-xs sm:text-sm font-semibold">{tokenData.buyVolume}</span>
                                    <span className="text-xs sm:text-sm font-semibold">{tokenData.sellVolume}</span>
                                </div>
                            </div>
                            <div className="flex h-1.5 rounded-full overflow-hidden">
                                <div className="bg-lime-500" style={{ width: `${(parseFloat(tokenData.buyVolume) / parseFloat(tokenData.volume) * 100).toFixed(0)}%` }}></div>
                                <div className="bg-red-500" style={{ width: `${(parseFloat(tokenData.sellVolume) / parseFloat(tokenData.volume) * 100).toFixed(0)}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-xs">MAKERS</span>
                                <div className="flex gap-2 sm:gap-3">
                                    <span className="text-gray-400 text-xs">BUYERS</span>
                                    <span className="text-gray-400 text-xs">SELLERS</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm sm:text-base font-semibold">{tokenData.makers}</span>
                                <div className="flex gap-5 sm:gap-7">
                                    <span className="text-xs sm:text-sm font-semibold">{tokenData.buyers}</span>
                                    <span className="text-xs sm:text-sm font-semibold">{tokenData.sellers}</span>
                                </div>
                            </div>
                            <div className="flex h-1.5 rounded-full overflow-hidden">
                                <div className="bg-lime-500" style={{ width: `${(tokenData.buyers / tokenData.makers * 100).toFixed(0)}%` }}></div>
                                <div className="bg-red-500" style={{ width: `${(tokenData.sellers / tokenData.makers * 100).toFixed(0)}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-transparent border border-gray-700 rounded-lg py-2 sm:py-2.5 flex items-center justify-center gap-1.5 mb-1.5">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">Watchlist</span>
                    </button>

                    <button className="w-full bg-transparent border border-gray-700 rounded-lg py-2 sm:py-2.5 flex items-center justify-between px-3 sm:px-4 mb-2">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
                                <path d="M7 16V4M17 20V8M3 20L7 16L12 20L17 16L21 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-xs sm:text-sm">Trade on Uniswap</span>
                        </div>
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>

                    <button
                        onClick={() => setShowDetails(true)}
                        className="w-full text-blue-400 py-1.5 text-xs sm:text-sm"
                    >
                        View Details ↓
                    </button>
                </div>
            ) : (
                /* Details View */
                <div className="p-2 sm:p-3">
                    <button
                        onClick={() => setShowDetails(false)}
                        className="w-full text-blue-400 py-1 mb-2 text-xs sm:text-sm"
                    >
                        ↑ Back to Overview
                    </button>

                    {/* Pair Created */}
                    {tokenData.pairCreated && (
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs sm:text-sm">Pair created</span>
                            <span className="text-xs sm:text-sm">{tokenData.pairCreated}</span>
                        </div>
                    )}

                    {/* Pooled Tokens */}
                    <div className="bg-transparent border border-gray-800 rounded-lg p-1.5 sm:p-2 mb-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm">Pooled {tokenData.pooledToken}</span>
                            <div className="flex gap-1.5 sm:gap-2 items-center">
                                <span className="text-xs sm:text-sm font-semibold">{tokenData.pooledTokenAmount}</span>
                                <span className="text-xs sm:text-sm font-semibold">{tokenData.pooledTokenValue}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-transparent border border-gray-800 rounded-lg p-1.5 sm:p-2 mb-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm">Pooled {tokenData.pooledBase}</span>
                            <div className="flex gap-1.5 sm:gap-2 items-center">
                                <span className="text-xs sm:text-sm font-semibold">{tokenData.pooledBaseAmount}</span>
                                <span className="text-xs sm:text-sm font-semibold">{tokenData.pooledBaseValue}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contract Addresses */}
                    <div className="space-y-1.5 mb-2">
                        {tokenData.pairAddress && (
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                                <span className="text-xs sm:text-sm">Pair</span>
                                <div className="flex items-center gap-1">
                                    <button className="flex items-center gap-0.5 bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                        <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        {tokenData.pairAddress}
                                    </button>
                                    <button className="flex items-center gap-0.5 bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                        EXP
                                        <ExternalLink className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {tokenData.tokenAddress && (
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                                <span className="text-xs sm:text-sm">{tokenData.symbol}</span>
                                <div className="flex items-center gap-1">
                                    <button className="flex items-center gap-0.5 bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                        <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        {tokenData.tokenAddress}
                                    </button>
                                    <button className="flex items-center gap-0.5 bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                        HLD
                                        <ExternalLink className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                    </button>
                                    <button className="flex items-center gap-0.5 bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                        EXP
                                        <ExternalLink className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {tokenData.baseAddress && (
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                                <span className="text-xs sm:text-sm">{tokenData.baseToken}</span>
                                <div className="flex items-center gap-1">
                                    <button className="flex items-center gap-0.5 bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                        <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        {tokenData.baseAddress}
                                    </button>
                                    <button className="flex items-center gap-0.5 bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                        HLD
                                        <ExternalLink className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                    </button>
                                    <button className="flex items-center gap-0.5 bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                        EXP
                                        <ExternalLink className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Supply Information */}
                    {(tokenData.totalSupply || tokenData.circulatingSupply || tokenData.holders) && (
                        <div className="bg-transparent border border-gray-800 rounded-lg p-1.5 sm:p-2 mb-2">
                            <div className="space-y-1">
                                {tokenData.totalSupply && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Total Supply</span>
                                        <span className="text-xs font-semibold">{tokenData.totalSupply}</span>
                                    </div>
                                )}
                                {tokenData.circulatingSupply && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Circulating</span>
                                        <span className="text-xs font-semibold">{tokenData.circulatingSupply}</span>
                                    </div>
                                )}
                                {tokenData.holders && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Holders</span>
                                        <span className="text-xs font-semibold">{tokenData.holders}</span>
                                    </div>
                                )}
                                {tokenData.top10HoldersPercent && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Top 10 Holders</span>
                                        <span className="text-xs font-semibold">{tokenData.top10HoldersPercent}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ATH/ATL Information */}
                    {(tokenData.ath || tokenData.atl) && (
                        <div className="grid grid-cols-2 gap-1.5 mb-2">
                            {tokenData.ath && (
                                <div className="bg-transparent border border-gray-800 rounded-lg p-1.5 sm:p-2">
                                    <div className="text-xs text-gray-400 mb-0.5">ATH</div>
                                    <div className="text-xs sm:text-sm font-semibold text-green-400">{tokenData.ath}</div>
                                    {tokenData.athDate && <div className="text-xs text-gray-500 mt-0.5">{tokenData.athDate}</div>}
                                </div>
                            )}
                            {tokenData.atl && (
                                <div className="bg-transparent border border-gray-800 rounded-lg p-1.5 sm:p-2">
                                    <div className="text-xs text-gray-400 mb-0.5">ATL</div>
                                    <div className="text-xs sm:text-sm font-semibold text-red-400">{tokenData.atl}</div>
                                    {tokenData.atlDate && <div className="text-xs text-gray-500 mt-0.5">{tokenData.atlDate}</div>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Social Links */}
                    {(tokenData.website || tokenData.twitter || tokenData.telegram || tokenData.discord || tokenData.github) && (
                        <div className="bg-transparent border border-gray-800 rounded-lg p-1.5 sm:p-2 mb-2">
                            <div className="text-xs font-semibold mb-1.5">Social Links</div>
                            <div className="space-y-1">
                                {tokenData.website && (
                                    <a href={tokenData.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs hover:text-cyan-400 transition-colors">
                                        <span>Website</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                )}
                                {tokenData.twitter && (
                                    <a href={tokenData.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs hover:text-cyan-400 transition-colors">
                                        <span>Twitter</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                )}
                                {tokenData.telegram && (
                                    <a href={tokenData.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs hover:text-cyan-400 transition-colors">
                                        <span>Telegram</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                )}
                                {tokenData.discord && (
                                    <a href={tokenData.discord} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs hover:text-cyan-400 transition-colors">
                                        <span>Discord</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                )}
                                {tokenData.github && (
                                    <a href={tokenData.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs hover:text-cyan-400 transition-colors">
                                        <span>GitHub</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                        {tokenData.dexUrl ? (
                            <a href={tokenData.dexUrl} target="_blank" rel="noopener noreferrer" className="bg-transparent border border-gray-700 rounded-lg py-1.5 sm:py-2 flex items-center justify-center gap-1 hover:border-cyan-500 transition-colors">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
                                    <path d="M7 16V4M17 20V8M3 20L7 16L12 20L17 16L21 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-xs">Trade</span>
                            </a>
                        ) : (
                            <button className="bg-transparent border border-gray-700 rounded-lg py-1.5 sm:py-2 flex items-center justify-center gap-1">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
                                    <path d="M7 16V4M17 20V8M3 20L7 16L12 20L17 16L21 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-xs">Trade</span>
                            </button>
                        )}
                        {tokenData.chartUrl ? (
                            <a href={tokenData.chartUrl} target="_blank" rel="noopener noreferrer" className="bg-transparent border border-gray-700 rounded-lg py-1.5 sm:py-2 flex items-center justify-center gap-1 hover:border-cyan-500 transition-colors">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                                    <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <span className="text-xs">Chart</span>
                            </a>
                        ) : (
                            <button className="bg-transparent border border-gray-700 rounded-lg py-1.5 sm:py-2 flex items-center justify-center gap-1">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                                    <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <span className="text-xs">Chart</span>
                            </button>
                        )}
                    </div>

                    {/* Security Sections */}
                    <div className="space-y-1.5 mb-2">
                        {/* Go+ Security */}
                        {tokenData.securityIssues && tokenData.securityIssues.length > 0 && (
                            <div className="bg-transparent border border-gray-800 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setGoSecurityOpen(!goSecurityOpen)}
                                    className="w-full flex items-center justify-between p-2 sm:p-2.5"
                                >
                                    <span className="text-xs sm:text-sm font-semibold">Go+ Security</span>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="flex items-center gap-1 text-red-500">
                                            <span className="text-xs font-semibold">{tokenData.securityIssues.length} issues</span>
                                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </div>
                                        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${goSecurityOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                {goSecurityOpen && (
                                    <div className="px-2 sm:px-2.5 pb-2 space-y-1.5 border-t border-gray-800 pt-2">
                                        {tokenData.securityIssues.map((issue, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium">{issue.title}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{issue.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quick Intel */}
                        {tokenData.intelIssues && tokenData.intelIssues.length > 0 && (
                            <div className="bg-transparent border border-gray-800 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setQuickIntelOpen(!quickIntelOpen)}
                                    className="w-full flex items-center justify-between p-2 sm:p-2.5"
                                >
                                    <span className="text-xs sm:text-sm font-semibold">Quick Intel</span>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="flex items-center gap-1 text-red-500">
                                            <span className="text-xs font-semibold">{tokenData.intelIssues.length} issues</span>
                                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </div>
                                        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${quickIntelOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                {quickIntelOpen && (
                                    <div className="px-2 sm:px-2.5 pb-2 space-y-1.5 border-t border-gray-800 pt-2">
                                        {tokenData.intelIssues.map((issue, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium">{issue.title}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{issue.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Token Sniffer */}
                        {tokenData.snifferScore !== undefined && (
                            <div className="bg-transparent border border-gray-800 rounded-lg p-2 sm:p-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm font-semibold">Token Sniffer</span>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs sm:text-sm font-semibold">{tokenData.snifferScore}/100</span>
                                            <AlertTriangle className={`w-3 h-3 sm:w-4 sm:h-4 ${tokenData.snifferScore < 50 ? 'text-red-500' : tokenData.snifferScore < 70 ? 'text-yellow-500' : 'text-green-500'}`} />
                                        </div>
                                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Warning */}
                    <p className="text-xs text-gray-500 mb-2">
                        <span className="text-gray-400 font-semibold">Warning!</span> Audits may not be 100% accurate!
                    </p>

                    {/* Boost Button */}
                    <button className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg py-2 sm:py-2.5 flex items-center justify-center gap-1.5 font-semibold text-xs sm:text-sm border-2 border-yellow-600">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                        </svg>
                        Boost
                    </button>
                </div>
            )}
        </div>
    );
}