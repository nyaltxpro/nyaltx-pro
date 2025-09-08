"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type StripeOrder = {
  id: string;
  amount_total: number | null;
  currency: string | null;
  status: string | null;
  customer_email?: string | null;
  created: number;
  metadata?: Record<string, string> | null;
  url?: string | null;
};

type OnchainOrder = {
  id: string;
  method: "ETH" | "NYAX";
  tierId: "paddle" | "motor" | "helicopter";
  wallet: string;
  txHash: string;
  amount: string; // in native units (ETH) or token units (NYAX)
  chainId: number;
  createdAt: string; // ISO string
};

export default function AdminOrdersPage() {
  const [stripeOrders, setStripeOrders] = useState<StripeOrder[] | null>(null);
  const [onchainOrders, setOnchainOrders] = useState<OnchainOrder[] | null>(null);
  const [form, setForm] = useState<Omit<OnchainOrder, "id" | "createdAt">>({
    method: "ETH",
    tierId: "paddle",
    wallet: "",
    txHash: "",
    amount: "",
    chainId: 1,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders/stripe").then(async (r) => {
      if (!r.ok) throw new Error("Stripe fetch error");
      const d = await r.json();
      setStripeOrders(d?.data || []);
    }).catch(() => setStripeOrders([]));

    fetch("/api/admin/orders/onchain").then(async (r) => {
      if (!r.ok) throw new Error("Onchain fetch error");
      const d = await r.json();
      setOnchainOrders(d?.data || []);
    }).catch(() => setOnchainOrders([]));
  }, []);

  const submitOnchain = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders/onchain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save record");
      const d = await res.json();
      setOnchainOrders(d?.data || []);
      setForm({ method: "ETH", tierId: "paddle", wallet: "", txHash: "", amount: "", chainId: 1 });
    } catch (e: any) {
      setError(e?.message || "Error saving record");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Orders</h2>
        <Link href="/admin" className="text-sm underline text-gray-300">Back to Dashboard</Link>
      </div>

      <section className="rounded-xl border border-gray-800 p-4">
        <h3 className="font-semibold mb-3">Stripe Payments</h3>
        {!stripeOrders ? (
          <div className="text-gray-400">Loading…</div>
        ) : stripeOrders.length === 0 ? (
          <div className="text-gray-400">No Stripe orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-300">
                <tr>
                  <th className="px-2 py-1">ID</th>
                  <th className="px-2 py-1">Tier</th>
                  <th className="px-2 py-1">Amount</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Email</th>
                  <th className="px-2 py-1">Created</th>
                </tr>
              </thead>
              <tbody>
                {stripeOrders.map((s) => (
                  <tr key={s.id} className="border-t border-gray-800">
                    <td className="px-2 py-1">{s.id}</td>
                    <td className="px-2 py-1">{s.metadata?.tierId ?? "—"}</td>
                    <td className="px-2 py-1">{s.amount_total ? `$${(s.amount_total / 100).toFixed(2)}` : "—"}</td>
                    <td className="px-2 py-1">{s.status ?? "—"}</td>
                    <td className="px-2 py-1">{s.customer_email ?? "—"}</td>
                    <td className="px-2 py-1">{new Date(s.created * 1000).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-800 p-4">
        <h3 className="font-semibold mb-3">On-chain Payments (ETH/NYAX)</h3>
        <form onSubmit={submitOnchain} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
          <select className="bg-black border border-gray-800 rounded px-2 py-1" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as any })}>
            <option value="ETH">ETH</option>
            <option value="NYAX">NYAX</option>
          </select>
          <select className="bg-black border border-gray-800 rounded px-2 py-1" value={form.tierId} onChange={(e) => setForm({ ...form, tierId: e.target.value as any })}>
            <option value="paddle">Paddle</option>
            <option value="motor">Motor</option>
            <option value="helicopter">Helicopter</option>
          </select>
          <input required placeholder="Wallet (0x...)" className="bg-black border border-gray-800 rounded px-2 py-1" value={form.wallet} onChange={(e) => setForm({ ...form, wallet: e.target.value })} />
          <input required placeholder="Tx Hash (0x...)" className="bg-black border border-gray-800 rounded px-2 py-1" value={form.txHash} onChange={(e) => setForm({ ...form, txHash: e.target.value })} />
          <input required placeholder="Amount" className="bg-black border border-gray-800 rounded px-2 py-1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input required type="number" placeholder="Chain ID" className="bg-black border border-gray-800 rounded px-2 py-1" value={form.chainId} onChange={(e) => setForm({ ...form, chainId: Number(e.target.value) })} />
          <div className="md:col-span-6 flex items-center gap-2">
            <button disabled={busy} className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-sm">Save Record</button>
            {error && <span className="text-red-400 text-sm">{error}</span>}
          </div>
        </form>

        {!onchainOrders ? (
          <div className="text-gray-400">Loading…</div>
        ) : onchainOrders.length === 0 ? (
          <div className="text-gray-400">No on-chain orders recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-300">
                <tr>
                  <th className="px-2 py-1">ID</th>
                  <th className="px-2 py-1">Method</th>
                  <th className="px-2 py-1">Tier</th>
                  <th className="px-2 py-1">Wallet</th>
                  <th className="px-2 py-1">Tx Hash</th>
                  <th className="px-2 py-1">Amount</th>
                  <th className="px-2 py-1">Chain</th>
                  <th className="px-2 py-1">Created</th>
                </tr>
              </thead>
              <tbody>
                {onchainOrders.map((o) => (
                  <tr key={o.id} className="border-t border-gray-800">
                    <td className="px-2 py-1">{o.id}</td>
                    <td className="px-2 py-1">{o.method}</td>
                    <td className="px-2 py-1">{o.tierId}</td>
                    <td className="px-2 py-1">{o.wallet}</td>
                    <td className="px-2 py-1"><a className="underline" href={`https://etherscan.io/tx/${o.txHash}`} target="_blank" rel="noreferrer">{o.txHash.slice(0,10)}…</a></td>
                    <td className="px-2 py-1">{o.amount}</td>
                    <td className="px-2 py-1">{o.chainId}</td>
                    <td className="px-2 py-1">{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
