import { AlertTriangle, ChevronDown, Copy, ExternalLink, MoreVertical, Star } from 'lucide-react';
import { useState } from 'react';

export default function XSpaceToken() {
    const [showDetails, setShowDetails] = useState(false);
    const [goSecurityOpen, setGoSecurityOpen] = useState(false);
    const [quickIntelOpen, setQuickIntelOpen] = useState(false);

    return (
        <div className="bg-black text-white w-full h-full font-sans">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-800">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 border-2 border-dashed border-gray-600 rounded-lg"></div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold truncate">Token Info</h1>
                </div>
                <button className="p-1.5 sm:p-2 rounded-lg border border-gray-700">
                    <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            </div>

            {!showDetails ? (
                /* Main View */
                <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">xSPACE</h2>
                        <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <span className="text-lg sm:text-xl md:text-2xl text-gray-400">/</span>
                        <span className="text-lg sm:text-xl md:text-2xl font-semibold">WPOL</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-purple-600/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-600 rounded-full"></div>
                            <span className="text-xs sm:text-sm">Polygon</span>
                            <span className="text-gray-400 text-xs sm:text-sm">{'>'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-pink-600/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-pink-600 rounded"></div>
                            <span className="text-xs sm:text-sm">Uniswap</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="bg-gray-900 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-gray-800">
                            <div className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">PRICE USD</div>
                            <div className="text-base sm:text-xl md:text-2xl font-semibold truncate">$0.003139</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-gray-800">
                            <div className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">PRICE</div>
                            <div className="text-base sm:text-xl md:text-2xl font-semibold truncate">0.01586 WPOL</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="bg-gray-900 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-gray-800">
                            <div className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">LIQUIDITY</div>
                            <div className="text-sm sm:text-lg md:text-xl font-semibold truncate">$43K</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-gray-800">
                            <div className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">FDV</div>
                            <div className="text-sm sm:text-lg md:text-xl font-semibold truncate">$78K</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-gray-800">
                            <div className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">MKT CAP</div>
                            <div className="text-sm sm:text-lg md:text-xl font-semibold truncate">$268K</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 mb-3 sm:mb-4 bg-gray-900 rounded-lg sm:rounded-xl border border-gray-800 overflow-hidden">
                        <button className="py-2 sm:py-3 text-center border-r border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5 sm:mb-1">5M</div>
                            <div className="text-lime-400 text-xs sm:text-sm font-semibold">0.05%</div>
                        </button>
                        <button className="py-2 sm:py-3 text-center border-r border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5 sm:mb-1">1H</div>
                            <div className="text-lime-400 text-xs sm:text-sm font-semibold">0.05%</div>
                        </button>
                        <button className="py-2 sm:py-3 text-center border-r border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5 sm:mb-1">6H</div>
                            <div className="text-lime-400 text-xs sm:text-sm font-semibold">1.03%</div>
                        </button>
                        <button className="py-2 sm:py-3 text-center bg-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5 sm:mb-1">24H</div>
                            <div className="text-lime-400 text-xs sm:text-sm font-semibold">2.21%</div>
                        </button>
                    </div>

                    <div className="bg-gray-900 rounded-lg sm:rounded-xl border border-gray-800 p-3 sm:p-4 mb-3 sm:mb-4">
                        <div className="mb-3 sm:mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400 text-xs sm:text-sm">TXNS</span>
                                <div className="flex gap-4 sm:gap-6 md:gap-8">
                                    <span className="text-gray-400 text-xs sm:text-sm">BUYS</span>
                                    <span className="text-gray-400 text-xs sm:text-sm">SELLS</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-lg sm:text-xl md:text-2xl font-semibold">28</span>
                                <div className="flex gap-6 sm:gap-8 md:gap-12">
                                    <span className="text-base sm:text-lg font-semibold">13</span>
                                    <span className="text-base sm:text-lg font-semibold">15</span>
                                </div>
                            </div>
                            <div className="flex h-1.5 rounded-full overflow-hidden">
                                <div className="bg-lime-500" style={{ width: '46%' }}></div>
                                <div className="bg-red-500" style={{ width: '54%' }}></div>
                            </div>
                        </div>

                        <div className="mb-3 sm:mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400 text-xs sm:text-sm">VOLUME</span>
                                <div className="flex gap-2 sm:gap-3 md:gap-4">
                                    <span className="text-gray-400 text-xs sm:text-sm">BUY VOL</span>
                                    <span className="text-gray-400 text-xs sm:text-sm">SELL VOL</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-lg sm:text-xl md:text-2xl font-semibold">$489</span>
                                <div className="flex gap-6 sm:gap-8 md:gap-12">
                                    <span className="text-base sm:text-lg font-semibold">$287</span>
                                    <span className="text-base sm:text-lg font-semibold">$202</span>
                                </div>
                            </div>
                            <div className="flex h-1.5 rounded-full overflow-hidden">
                                <div className="bg-lime-500" style={{ width: '59%' }}></div>
                                <div className="bg-red-500" style={{ width: '41%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400 text-xs sm:text-sm">MAKERS</span>
                                <div className="flex gap-3 sm:gap-4 md:gap-6">
                                    <span className="text-gray-400 text-xs sm:text-sm">BUYERS</span>
                                    <span className="text-gray-400 text-xs sm:text-sm">SELLERS</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-lg sm:text-xl md:text-2xl font-semibold">20</span>
                                <div className="flex gap-7 sm:gap-10 md:gap-14">
                                    <span className="text-base sm:text-lg font-semibold">11</span>
                                    <span className="text-base sm:text-lg font-semibold">13</span>
                                </div>
                            </div>
                            <div className="flex h-1.5 rounded-full overflow-hidden">
                                <div className="bg-lime-500" style={{ width: '46%' }}></div>
                                <div className="bg-red-500" style={{ width: '54%' }}></div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-gray-900 border border-gray-700 rounded-lg sm:rounded-xl py-3 sm:py-4 flex items-center justify-center gap-2 mb-2 sm:mb-3">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-base sm:text-lg">Watchlist</span>
                    </button>

                    <button className="w-full bg-gray-900 border border-gray-700 rounded-lg sm:rounded-xl py-3 sm:py-4 flex items-center justify-between px-4 sm:px-6 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
                                <path d="M7 16V4M17 20V8M3 20L7 16L12 20L17 16L21 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-base sm:text-lg">Trade on Uniswap</span>
                        </div>
                        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <button
                        onClick={() => setShowDetails(true)}
                        className="w-full text-blue-400 py-2 text-sm sm:text-base"
                    >
                        View Details ↓
                    </button>
                </div>
            ) : (
                /* Details View */
                <div className="p-3 sm:p-4">
                    <button
                        onClick={() => setShowDetails(false)}
                        className="w-full text-blue-400 py-2 mb-3 sm:mb-4 text-sm sm:text-base"
                    >
                        ↑ Back to Overview
                    </button>

                    {/* Pair Created */}
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <span className="text-base sm:text-lg">Pair created</span>
                        <span className="text-base sm:text-lg">1y 11d ago</span>
                    </div>

                    {/* Pooled Tokens */}
                    <div className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm sm:text-base md:text-lg">Pooled xSPACE</span>
                            <div className="flex gap-2 sm:gap-3 md:gap-4 items-center">
                                <span className="text-sm sm:text-base md:text-lg font-semibold">6,821,431</span>
                                <span className="text-sm sm:text-base md:text-lg font-semibold">$21K</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm sm:text-base md:text-lg">Pooled WPOL</span>
                            <div className="flex gap-2 sm:gap-3 md:gap-4 items-center">
                                <span className="text-sm sm:text-base md:text-lg font-semibold">111,232</span>
                                <span className="text-sm sm:text-base md:text-lg font-semibold">$22K</span>
                            </div>
                        </div>
                    </div>

                    {/* Contract Addresses */}
                    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <span className="text-sm sm:text-base md:text-lg">Pair</span>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <button className="flex items-center gap-1 bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                                    0xDF6...cD37
                                </button>
                                <button className="flex items-center gap-1 bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                                    EXP
                                    <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <span className="text-sm sm:text-base md:text-lg">xSPACE</span>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <button className="flex items-center gap-1 bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                                    0x1D1...056f
                                </button>
                                <button className="flex items-center gap-1 bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                                    HLD
                                    <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                                <button className="flex items-center gap-1 bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                                    EXP
                                    <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <span className="text-sm sm:text-base md:text-lg">WPOL</span>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <button className="flex items-center gap-1 bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                                    0x0d5...1270
                                </button>
                                <button className="flex items-center gap-1 bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                                    HLD
                                    <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                                <button className="flex items-center gap-1 bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                                    EXP
                                    <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <button className="bg-gray-900 border border-gray-700 rounded-lg sm:rounded-xl py-2 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                            </svg>
                            <span className="text-xs sm:text-sm md:text-base">Search on Twitter</span>
                        </button>
                        <button className="bg-gray-900 border border-gray-700 rounded-lg sm:rounded-xl py-2 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span className="text-xs sm:text-sm md:text-base">Other pairs</span>
                        </button>
                    </div>

                    {/* Security Sections */}
                    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                        {/* Go+ Security */}
                        <div className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl overflow-hidden">
                            <button
                                onClick={() => setGoSecurityOpen(!goSecurityOpen)}
                                className="w-full flex items-center justify-between p-3 sm:p-4"
                            >
                                <span className="text-base sm:text-lg font-semibold">Go+ Security</span>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-red-500">
                                        <span className="text-sm sm:text-base font-semibold">2 issues</span>
                                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${goSecurityOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            {goSecurityOpen && (
                                <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 border-t border-gray-800 pt-3 sm:pt-4">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">Trading Cooldown Detected</p>
                                            <p className="text-xs text-gray-400 mt-1">The contract implements a cooldown period between trades which may limit trading frequency.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">High Slippage Risk</p>
                                            <p className="text-xs text-gray-400 mt-1">Low liquidity may result in high slippage for larger trades.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Intel */}
                        <div className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl overflow-hidden">
                            <button
                                onClick={() => setQuickIntelOpen(!quickIntelOpen)}
                                className="w-full flex items-center justify-between p-3 sm:p-4"
                            >
                                <span className="text-base sm:text-lg font-semibold">Quick Intel</span>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-red-500">
                                        <span className="text-sm sm:text-base font-semibold">2 issues</span>
                                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${quickIntelOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            {quickIntelOpen && (
                                <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 border-t border-gray-800 pt-3 sm:pt-4">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">Low Holder Count</p>
                                            <p className="text-xs text-gray-400 mt-1">Token has a relatively small number of holders which may indicate limited adoption.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">Concentrated Ownership</p>
                                            <p className="text-xs text-gray-400 mt-1">Top 10 holders control a significant portion of the total supply.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Token Sniffer */}
                        <div className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-base sm:text-lg font-semibold">Token Sniffer</span>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <span className="text-base sm:text-lg font-semibold">45/100</span>
                                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                                    </div>
                                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                        <span className="text-gray-400 font-semibold">Warning!</span> Audits may not be 100% accurate! <span className="text-blue-400">More.</span>
                    </p>

                    {/* Boost Button */}
                    <button className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg sm:rounded-xl py-3 sm:py-4 flex items-center justify-center gap-2 font-semibold text-base sm:text-lg border-2 border-yellow-600">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                        </svg>
                        Boost
                    </button>
                </div>
            )}
        </div>
    );
}