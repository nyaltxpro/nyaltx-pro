'use client';

import { ExternalLinkIcon, MagnifyingGlassIcon, ReloadIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

type SecurityRow = {
  id: string;
  name: string;
  symbol: string;
  underlyingSymbol: string;
  underlyingExchange: string;
  logo: string | null;
  isTradingHalted: boolean;
  openNow: boolean;
  tradingPeriod: string | null;
  networks: string[];
  tokenizedPrice: number | null;
  traditionalPrice: number | null;
  spread: number | null;
  spreadBps: number | null;
};

type ApiResponse = {
  updatedAt?: string;
  source?: string;
  count?: number;
  securities?: SecurityRow[];
  note?: string;
  error?: string;
};

const formatUsd = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value >= 100 ? 2 : 4,
  }).format(value);
};

const formatSpread = (spread: number | null, bps: number | null) => {
  if (spread === null) return '—';
  const sign = spread > 0 ? '+' : '';
  const bpsLabel = bps !== null ? ` (${sign}${bps.toFixed(1)} bps)` : '';
  return `${sign}${formatUsd(spread)}${bpsLabel}`;
};

export default function TokenizedSecurities() {
  const [rows, setRows] = useState<SecurityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'halted'>('all');

  const load = useCallback(async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/tokenized-securities${refresh ? '?refresh=1' : ''}`);
      const data: ApiResponse = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load market data');
      }
      setRows(data.securities || []);
      setNote(data.note || null);
      setUpdatedAt(data.updatedAt || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    const id = window.setInterval(() => load(false), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(row => {
      if (statusFilter === 'open' && (row.isTradingHalted || !row.openNow)) return false;
      if (statusFilter === 'halted' && !row.isTradingHalted) return false;
      if (!q) return true;
      return (
        row.symbol.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.underlyingSymbol.toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  const pricedCount = useMemo(
    () => rows.filter(r => r.tokenizedPrice !== null).length,
    [rows],
  );

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 lg:px-8">
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1628] via-[#0b1220] to-[#061018] p-6 md:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 20% 0%, rgba(0,212,170,0.18), transparent 50%), radial-gradient(ellipse at 90% 20%, rgba(59,130,246,0.15), transparent 45%)',
          }}
        />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#00d4aa]/80">
              NYALTX Market Data
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Tokenized Securities
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300 md:text-base">
              Compare traditional equity references with tokenized xStock quotes — a market-data
              board for tokenized securities, not a trading venue.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              {rows.length} assets · {pricedCount} priced
            </span>
            {updatedAt && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                Updated {new Date(updatedAt).toLocaleTimeString()}
              </span>
            )}
            <button
              type="button"
              onClick={() => load(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-3 py-1.5 text-[#00d4aa] transition hover:bg-[#00d4aa]/20 disabled:opacity-50"
            >
              <ReloadIcon className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search AAPL, TSLAx, Nvidia…"
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-[#00d4aa]/40 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'open', 'halted'] as const).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`rounded-lg px-3 py-2 text-xs capitalize transition ${
                statusFilter === key
                  ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30'
                  : 'border border-white/10 bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {note && (
        <p className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-100/80">
          {note} Market data display only — not an offer to buy or sell securities.
        </p>
      )}

      {loading && rows.length === 0 ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#00d4aa]" />
            <p className="text-gray-400">Loading xStocks market data…</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-5">
          <h3 className="mb-2 font-semibold text-red-300">Unable to load quotes</h3>
          <p className="text-sm text-red-200/80">{error}</p>
          <button
            type="button"
            onClick={() => load(true)}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Security</th>
                  <th className="px-4 py-3 font-medium">Traditional</th>
                  <th className="px-4 py-3 font-medium">Tokenized</th>
                  <th className="px-4 py-3 font-medium">Spread</th>
                  <th className="px-4 py-3 font-medium">Networks</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-white/5 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-white/5">
                          {row.logo ? (
                            <Image
                              src={row.logo}
                              alt={row.symbol}
                              fill
                              className="object-cover"
                              sizes="36px"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">
                              {row.underlyingSymbol?.slice(0, 2) || '—'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {row.underlyingSymbol || row.symbol}{' '}
                            <span className="text-gray-500">({row.symbol})</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {row.name.replace(/ xStock$/i, '')} · {row.underlyingExchange}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-200">
                      {formatUsd(row.traditionalPrice)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#00d4aa]">
                      {formatUsd(row.tokenizedPrice)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {formatSpread(row.spread, row.spreadBps)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {row.networks.slice(0, 4).map(network => (
                          <span
                            key={network}
                            className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-300"
                          >
                            {network}
                          </span>
                        ))}
                        {row.networks.length > 4 && (
                          <span className="text-[10px] text-gray-500">
                            +{row.networks.length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {row.isTradingHalted ? (
                        <span className="rounded-full bg-red-500/15 px-2 py-1 text-[11px] text-red-300">
                          Halted
                        </span>
                      ) : row.openNow ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] text-emerald-300">
                          Open
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-500/15 px-2 py-1 text-[11px] text-gray-300">
                          {row.tradingPeriod || 'Closed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      No securities match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
        <p>
          Data source:{' '}
          <a
            href="https://docs.xstocks.fi/developers"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[#00d4aa] hover:underline"
          >
            xStocks public API <ExternalLinkIcon />
          </a>
        </p>
        <p>For demonstration and research. Licensed traditional feeds can replace the reference column later.</p>
      </div>
    </div>
  );
}
