"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

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

type SubscriptionOrder = {
  id: string;
  type: 'pro_subscription';
  userId?: string;
  email?: string;
  plan: 'pro';
  status: 'active' | 'inactive' | 'pending';
  paymentMethod: 'stripe' | 'demo' | 'other';
  amount?: string;
  currency?: string;
  createdAt: string;
  expiresAt?: string;
};

export default function AdminOrdersPage() {
  const [onchainOrders, setOnchainOrders] = useState<OnchainOrder[] | null>(null);
  const [subscriptionOrders, setSubscriptionOrders] = useState<SubscriptionOrder[] | null>(null);
  const [form, setForm] = useState<Omit<OnchainOrder, "id" | "createdAt">>({
    method: "ETH",
    tierId: "paddle",
    wallet: "",
    txHash: "",
    amount: "",
    chainId: 1,
  });
  const [subForm, setSubForm] = useState<Omit<SubscriptionOrder, "id" | "createdAt" | "type">>({
    userId: "",
    email: "",
    plan: "pro",
    status: "active",
    paymentMethod: "demo",
    amount: "",
    currency: "USD",
    expiresAt: "",
  });
  const [busy, setBusy] = useState(false);
  const [subBusy, setSubBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subError, setSubError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch onchain orders
    fetch("/api/admin/orders/onchain").then(async (r) => {
      if (!r.ok) throw new Error("Onchain fetch error");
      const d = await r.json();
      setOnchainOrders(d?.data || []);
    }).catch(() => setOnchainOrders([]));

    // Fetch subscription orders
    fetch("/api/admin/orders/subscriptions").then(async (r) => {
      if (!r.ok) throw new Error("Subscription fetch error");
      const d = await r.json();
      setSubscriptionOrders(d?.data || []);
    }).catch(() => setSubscriptionOrders([]));
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

  const submitSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubBusy(true);
    setSubError(null);
    try {
      const res = await fetch("/api/admin/orders/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subForm),
      });
      if (!res.ok) throw new Error("Failed to save subscription");
      const d = await res.json();
      setSubscriptionOrders(d?.data || []);
      setSubForm({
        userId: "",
        email: "",
        plan: "pro",
        status: "active",
        paymentMethod: "demo",
        amount: "",
        currency: "USD",
        expiresAt: "",
      });
    } catch (e: any) {
      setSubError(e?.message || "Error saving subscription");
    } finally {
      setSubBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Orders</h2>
        <Link href="/admin" className="text-sm underline text-gray-300">Back to Dashboard</Link>
      </div>

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

      {/* Subscription Orders Section */}
      <section className="rounded-xl border border-gray-800 p-4">
        <h3 className="font-semibold mb-3">Pro Subscriptions</h3>
        <form onSubmit={submitSubscription} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
          <input placeholder="User ID (optional)" className="bg-black border border-gray-800 rounded px-2 py-1" value={subForm.userId} onChange={(e) => setSubForm({ ...subForm, userId: e.target.value })} />
          <input placeholder="Email (optional)" className="bg-black border border-gray-800 rounded px-2 py-1" value={subForm.email} onChange={(e) => setSubForm({ ...subForm, email: e.target.value })} />
          <select className="bg-black border border-gray-800 rounded px-2 py-1" value={subForm.status} onChange={(e) => setSubForm({ ...subForm, status: e.target.value as any })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <select className="bg-black border border-gray-800 rounded px-2 py-1" value={subForm.paymentMethod} onChange={(e) => setSubForm({ ...subForm, paymentMethod: e.target.value as any })}>
            <option value="demo">Demo</option>
            <option value="stripe">Stripe</option>
            <option value="other">Other</option>
          </select>
          <input placeholder="Amount (optional)" className="bg-black border border-gray-800 rounded px-2 py-1" value={subForm.amount} onChange={(e) => setSubForm({ ...subForm, amount: e.target.value })} />
          <input placeholder="Expires At (ISO)" className="bg-black border border-gray-800 rounded px-2 py-1" value={subForm.expiresAt} onChange={(e) => setSubForm({ ...subForm, expiresAt: e.target.value })} />
          <div className="md:col-span-6 flex items-center gap-2">
            <button disabled={subBusy} className="rounded bg-blue-600 hover:bg-blue-500 px-3 py-1 text-sm">Save Subscription</button>
            {subError && <span className="text-red-400 text-sm">{subError}</span>}
          </div>
        </form>

        {!subscriptionOrders ? (
          <div className="text-gray-400">Loading subscriptions…</div>
        ) : subscriptionOrders.length === 0 ? (
          <div className="text-gray-400">No subscription orders recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-300">
                <tr>
                  <th className="px-2 py-1">ID</th>
                  <th className="px-2 py-1">Plan</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Payment Method</th>
                  <th className="px-2 py-1">User/Email</th>
                  <th className="px-2 py-1">Amount</th>
                  <th className="px-2 py-1">Created</th>
                  <th className="px-2 py-1">Expires</th>
                </tr>
              </thead>
              <tbody>
                {subscriptionOrders.map((s) => (
                  <tr key={s.id} className="border-t border-gray-800">
                    <td className="px-2 py-1">{s.id}</td>
                    <td className="px-2 py-1 capitalize">{s.plan}</td>
                    <td className="px-2 py-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        s.status === 'active' ? 'bg-green-900 text-green-300' :
                        s.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-2 py-1 capitalize">{s.paymentMethod}</td>
                    <td className="px-2 py-1">{s.email || s.userId || '—'}</td>
                    <td className="px-2 py-1">{s.amount ? `${s.amount} ${s.currency || ''}` : '—'}</td>
                    <td className="px-2 py-1">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="px-2 py-1">{s.expiresAt ? new Date(s.expiresAt).toLocaleString() : '—'}</td>
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
