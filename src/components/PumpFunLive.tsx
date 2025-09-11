"use client";

import React from 'react'
import Image from 'next/image'
import { usePumpFunTrades } from '@/hooks/usePumpFunTrades'

export default function PumpFunLive() {
  const { connected, trades, topByMarketCap, allTokens } = usePumpFunTrades()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Pump.fun Live</h2>
        <div className={`text-xs px-2 py-1 rounded ${connected ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-300'}`}>
          {connected ? 'LIVE' : 'DISCONNECTED'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Market Cap Tokens */}
        <div className="section-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Top Market Cap (Pump.fun)</h3>
            <span className="text-xs text-gray-400">Top {topByMarketCap.length}</span>
          </div>
          <div className="max-h-[360px] overflow-auto divide-y divide-gray-800/60">
            {topByMarketCap.length === 0 && (
              <div className="text-sm text-gray-400 p-3">No market cap data yet. Gathering live trades...</div>
            )}
            {topByMarketCap.map((t) => (
              <div key={t.mint} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                  {t.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.image} alt={t.symbol} className="w-full h-full object-cover"/>
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{t.name}</span>
                    <span className="text-xs text-cyan-400">${t.symbol}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono truncate">{t.mint}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatCurrency(t.marketCap)}</div>
                  {t.price !== undefined && (
                    <div className="text-xs text-gray-400">Price: {formatNumber(t.price)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Trades Feed */}
        <div className="section-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Live Trades</h3>
            <span className="text-xs text-gray-400">Latest {trades.length}</span>
          </div>
          <div className="max-h-[360px] overflow-auto divide-y divide-gray-800/60">
            {trades.length === 0 && (
              <div className="text-sm text-gray-400 p-3">Waiting for trades...</div>
            )}
            {trades.map((t, idx) => (
              <div key={idx + (t.mint || '')} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                  {t.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.image} alt={t.symbol || ''} className="w-full h-full object-cover"/>
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{t.name || 'Unknown'}</span>
                    {t.symbol && <span className="text-xs text-purple-300">${t.symbol}</span>}
                  </div>
                  <div className="text-xs text-gray-400 font-mono truncate">{t.mint}</div>
                </div>
                <div className="text-right">
                  {t.marketCap !== undefined && (
                    <div className="text-sm font-semibold">{formatCurrency(t.marketCap)}</div>
                  )}
                  {t.price !== undefined && (
                    <div className="text-xs text-gray-400">Price: {formatNumber(t.price)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All tokens simple list (optional) */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">All Tokens (Live Snapshot)</h3>
          <span className="text-xs text-gray-400">{allTokens.length}</span>
        </div>
        <div className="max-h-[280px] overflow-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allTokens.map((t) => (
            <div key={t.mint} className="flex items-center gap-2 p-2 rounded hover:bg-white/5">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700">
                {t.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.image} alt={t.symbol} className="w-full h-full object-cover"/>
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{t.name} <span className="text-xs text-cyan-400">${t.symbol}</span></div>
                <div className="text-[10px] text-gray-500 font-mono truncate">{t.mint}</div>
              </div>
              {t.marketCap !== undefined && (
                <div className="text-xs text-right">{formatCurrency(t.marketCap)}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatCurrency(n?: number) {
  if (typeof n !== 'number') return '-'
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(n)
  } catch {
    return `$${formatNumber(n)}`
  }
}

function formatNumber(n?: number) {
  if (typeof n !== 'number') return '-'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(n)
}
