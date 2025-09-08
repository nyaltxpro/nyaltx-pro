"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  profiles: { count: number; active: number };
  orders: { stripe: { count: number; totalUSD: number }; onchain: { count: number } };
  campaigns: { count: number; active: number };
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load stats");
        const d = await r.json();
        setStats(d?.data || null);
      })
      .catch((e) => setError(e?.message || "Error"));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Stats</h2>
        <Link href="/admin" className="text-sm underline text-gray-300">Back to Dashboard</Link>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      {!stats ? (
        <div className="text-gray-400">Loading…</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-800 p-4">
              <div className="text-gray-400 text-sm">Profiles</div>
              <div className="text-3xl font-bold">{stats.profiles.count}</div>
              <div className="text-xs text-gray-400">Active: {stats.profiles.active}</div>
            </div>
            <div className="rounded-xl border border-gray-800 p-4">
              <div className="text-gray-400 text-sm">Stripe Orders</div>
              <div className="text-3xl font-bold">{stats.orders.stripe.count}</div>
              <div className="text-xs text-gray-400">Revenue: ${stats.orders.stripe.totalUSD.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-gray-800 p-4">
              <div className="text-gray-400 text-sm">On-chain Orders</div>
              <div className="text-3xl font-bold">{stats.orders.onchain.count}</div>
            </div>
            <div className="rounded-xl border border-gray-800 p-4">
              <div className="text-gray-400 text-sm">Campaigns</div>
              <div className="text-3xl font-bold">{stats.campaigns.count}</div>
              <div className="text-xs text-gray-400">Active: {stats.campaigns.active}</div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 p-6">
            <h3 className="font-semibold mb-2">Summary</h3>
            <ul className="list-disc pl-5 text-gray-300 space-y-1 text-sm">
              <li>Total revenue (Stripe): ${stats.orders.stripe.totalUSD.toLocaleString()}</li>
              <li>Total orders: {stats.orders.stripe.count + stats.orders.onchain.count}</li>
              <li>Active campaigns: {stats.campaigns.active}</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
