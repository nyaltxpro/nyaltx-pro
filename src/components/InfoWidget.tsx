import { AlertTriangle, ChevronDown, Copy, ExternalLink, MoreVertical, Star } from 'lucide-react';
import { useState } from 'react';

export default function XSpaceToken() {
    const [showDetails, setShowDetails] = useState(false);
    const [goSecurityOpen, setGoSecurityOpen] = useState(false);
    const [quickIntelOpen, setQuickIntelOpen] = useState(false);

    return (
        <div className="bg-black text-white w-full h-full font-sans">
            {/* Header */}
            <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-dashed border-gray-600 rounded-lg"></div>
                    <h1 className="text-sm sm:text-base font-semibold truncate">Token Info</h1>
                </div>
                <button className="p-1 sm:p-1.5 rounded-lg border border-gray-700">
                    <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            {!showDetails ? (
                /* Main View */
                <div className="p-2 sm:p-3">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
                        <h2 className="text-sm sm:text-base font-semibold">xSPACE</h2>
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="text-sm sm:text-base text-gray-400">/</span>
                        <span className="text-sm sm:text-base font-semibold">WPOL</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        <div className="flex items-center gap-1 sm:gap-1.5 bg-purple-600/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-600 rounded-full"></div>
                            <span className="text-xs">Polygon</span>
                            <span className="text-gray-400 text-xs">{'>'}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 bg-pink-600/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-pink-600 rounded"></div>
                            <span className="text-xs">Uniswap</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2">
                        <div className="bg-gray-900 rounded-lg p-1.5 sm:p-2 border border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">PRICE USD</div>
                            <div className="text-sm sm:text-base font-semibold truncate">$0.003139</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-1.5 sm:p-2 border border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">PRICE</div>
                            <div className="text-sm sm:text-base font-semibold truncate">0.01586 WPOL</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2">
                        <div className="bg-gray-900 rounded-lg p-1.5 sm:p-2 border border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">LIQUIDITY</div>
                            <div className="text-xs sm:text-sm font-semibold truncate">$43K</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-1.5 sm:p-2 border border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">FDV</div>
                            <div className="text-xs sm:text-sm font-semibold truncate">$78K</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-1.5 sm:p-2 border border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">MKT CAP</div>
                            <div className="text-xs sm:text-sm font-semibold truncate">$268K</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 mb-2 bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                        <button className="py-1.5 sm:py-2 text-center border-r border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">5M</div>
                            <div className="text-lime-400 text-xs font-semibold">0.05%</div>
                        </button>
                        <button className="py-1.5 sm:py-2 text-center border-r border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">1H</div>
                            <div className="text-lime-400 text-xs font-semibold">0.05%</div>
                        </button>
                        <button className="py-1.5 sm:py-2 text-center border-r border-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">6H</div>
                            <div className="text-lime-400 text-xs font-semibold">1.03%</div>
                        </button>
                        <button className="py-1.5 sm:py-2 text-center bg-gray-800">
                            <div className="text-gray-400 text-xs mb-0.5">24H</div>
                            <div className="text-lime-400 text-xs font-semibold">2.21%</div>
                        </button>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-2 sm:p-3 mb-2">
                        <div className="mb-2 sm:mb-3">
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-xs">TXNS</span>
                                <div className="flex gap-3 sm:gap-4">
                                    <span className="text-gray-400 text-xs">BUYS</span>
                                    <span className="text-gray-400 text-xs">SELLS</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm sm:text-base font-semibold">28</span>
                                <div className="flex gap-4 sm:gap-6">
                                    <span className="text-xs sm:text-sm font-semibold">13</span>
                                    <span className="text-xs sm:text-sm font-semibold">15</span>
                                </div>
                            </div>
                            <div className="flex h-1.5 rounded-full overflow-hidden">
                                <div className="bg-lime-500" style={{ width: '46%' }}></div>
                                <div className="bg-red-500" style={{ width: '54%' }}></div>
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
                                <span className="text-sm sm:text-base font-semibold">$489</span>
                                <div className="flex gap-4 sm:gap-6">
                                    <span className="text-xs sm:text-sm font-semibold">$287</span>
                                    <span className="text-xs sm:text-sm font-semibold">$202</span>
                                </div>
                            </div>
                            <div className="flex h-1.5 rounded-full overflow-hidden">
                                <div className="bg-lime-500" style={{ width: '59%' }}></div>
                                <div className="bg-red-500" style={{ width: '41%' }}></div>
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
                                <span className="text-sm sm:text-base font-semibold">20</span>
                                <div className="flex gap-5 sm:gap-7">
                                    <span className="text-xs sm:text-sm font-semibold">11</span>
                                    <span className="text-xs sm:text-sm font-semibold">13</span>
                                </div>
                            </div>
                            <div className="flex h-1.5 rounded-full overflow-hidden">
                                <div className="bg-lime-500" style={{ width: '46%' }}></div>
                                <div className="bg-red-500" style={{ width: '54%' }}></div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 sm:py-2.5 flex items-center justify-center gap-1.5 mb-1.5">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">Watchlist</span>
                    </button>

                    <button className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 sm:py-2.5 flex items-center justify-between px-3 sm:px-4 mb-2">
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
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs sm:text-sm">Pair created</span>
                        <span className="text-xs sm:text-sm">1y 11d ago</span>
                    </div>

                    {/* Pooled Tokens */}
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-1.5 sm:p-2 mb-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm">Pooled xSPACE</span>
                            <div className="flex gap-1.5 sm:gap-2 items-center">
                                <span className="text-xs sm:text-sm font-semibold">6,821,431</span>
                                <span className="text-xs sm:text-sm font-semibold">$21K</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-1.5 sm:p-2 mb-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm">Pooled WPOL</span>
                            <div className="flex gap-1.5 sm:gap-2 items-center">
                                <span className="text-xs sm:text-sm font-semibold">111,232</span>
                                <span className="text-xs sm:text-sm font-semibold">$22K</span>
                            </div>
                        </div>
                    </div>

                    {/* Contract Addresses */}
                    <div className="space-y-1.5 mb-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                            <span className="text-xs sm:text-sm">Pair</span>
                            <div className="flex items-center gap-1">
                                <button className="flex items-center gap-0.5 bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                    <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    0xDF6...cD37
                                </button>
                                <button className="flex items-center gap-0.5 bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                    EXP
                                    <ExternalLink className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                            <span className="text-xs sm:text-sm">xSPACE</span>
                            <div className="flex items-center gap-1">
                                <button className="flex items-center gap-0.5 bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                    <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    0x1D1...056f
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

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                            <span className="text-xs sm:text-sm">WPOL</span>
                            <div className="flex items-center gap-1">
                                <button className="flex items-center gap-0.5 bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                    <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    0x0d5...1270
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
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                        <button className="bg-gray-900 border border-gray-700 rounded-lg py-1.5 sm:py-2 flex items-center justify-center gap-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                            </svg>
                            <span className="text-xs">Twitter</span>
                        </button>
                        <button className="bg-gray-900 border border-gray-700 rounded-lg py-1.5 sm:py-2 flex items-center justify-center gap-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span className="text-xs">Pairs</span>
                        </button>
                    </div>

                    {/* Security Sections */}
                    <div className="space-y-1.5 mb-2">
                        {/* Go+ Security */}
                        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setGoSecurityOpen(!goSecurityOpen)}
                                className="w-full flex items-center justify-between p-2 sm:p-2.5"
                            >
                                <span className="text-xs sm:text-sm font-semibold">Go+ Security</span>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="flex items-center gap-1 text-red-500">
                                        <span className="text-xs font-semibold">2 issues</span>
                                        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </div>
                                    <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${goSecurityOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            {goSecurityOpen && (
                                <div className="px-2 sm:px-2.5 pb-2 space-y-1.5 border-t border-gray-800 pt-2">
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
                        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setQuickIntelOpen(!quickIntelOpen)}
                                className="w-full flex items-center justify-between p-2 sm:p-2.5"
                            >
                                <span className="text-xs sm:text-sm font-semibold">Quick Intel</span>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="flex items-center gap-1 text-red-500">
                                        <span className="text-xs font-semibold">2 issues</span>
                                        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </div>
                                    <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${quickIntelOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            {quickIntelOpen && (
                                <div className="px-2 sm:px-2.5 pb-2 space-y-1.5 border-t border-gray-800 pt-2">
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
                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-2 sm:p-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-semibold">Token Sniffer</span>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs sm:text-sm font-semibold">45/100</span>
                                        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                                    </div>
                                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                </div>
                            </div>
                        </div>
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