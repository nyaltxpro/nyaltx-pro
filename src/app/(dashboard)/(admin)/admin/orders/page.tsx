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
  refundStatus?: 'none' | 'requested' | 'processing' | 'completed' | 'failed';
  refundAmount?: string;
  refundDate?: string;
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
  const [refundingIds, setRefundingIds] = useState<Set<string>>(new Set());
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionOrder | null>(null);
  const [customRefundAmount, setCustomRefundAmount] = useState('');

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

  const openRefundModal = (subscription: SubscriptionOrder) => {
    setSelectedSubscription(subscription);
    setCustomRefundAmount(subscription.amount || '');
    setRefundModalOpen(true);
  };

  const closeRefundModal = () => {
    setRefundModalOpen(false);
    setSelectedSubscription(null);
    setCustomRefundAmount('');
  };

  const handleRefund = async (subscriptionId: string, amount?: string) => {
    setRefundingIds(prev => new Set(prev).add(subscriptionId));
    try {
      const res = await fetch(`/api/admin/orders/subscriptions/${subscriptionId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to process refund');
      }
      
      // Refresh subscription orders
      const refreshRes = await fetch('/api/admin/orders/subscriptions');
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setSubscriptionOrders(refreshData?.data || []);
      }
      
      closeRefundModal();
    } catch (e: any) {
      alert(`Refund failed: ${e.message}`);
    } finally {
      setRefundingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(subscriptionId);
        return newSet;
      });
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
          <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as any })}>
            <option value="ETH">ETH</option>
            <option value="NYAX">NYAX</option>
          </select>
          <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={form.tierId} onChange={(e) => setForm({ ...form, tierId: e.target.value as any })}>
            <option value="paddle">Paddle</option>
            <option value="motor">Motor</option>
            <option value="helicopter">Helicopter</option>
          </select>
          <input required placeholder="Wallet (0x...)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={form.wallet} onChange={(e) => setForm({ ...form, wallet: e.target.value })} />
          <input required placeholder="Tx Hash (0x...)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={form.txHash} onChange={(e) => setForm({ ...form, txHash: e.target.value })} />
          <input required placeholder="Amount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input required type="number" placeholder="Chain ID" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={form.chainId} onChange={(e) => setForm({ ...form, chainId: Number(e.target.value) })} />
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
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">ID</th>
                  <th scope="col" className="px-6 py-3">Method</th>
                  <th scope="col" className="px-6 py-3">Tier</th>
                  <th scope="col" className="px-6 py-3">Wallet</th>
                  <th scope="col" className="px-6 py-3">Tx Hash</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Chain</th>
                  <th scope="col" className="px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {onchainOrders.map((o) => (
                  <tr key={o.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{o.id}</th>
                    <td className="px-6 py-4">{o.method}</td>
                    <td className="px-6 py-4">{o.tierId}</td>
                    <td className="px-6 py-4">{o.wallet}</td>
                    <td className="px-6 py-4"><a className="font-medium text-blue-600 dark:text-blue-500 hover:underline" href={`https://etherscan.io/tx/${o.txHash}`} target="_blank" rel="noreferrer">{o.txHash.slice(0,10)}…</a></td>
                    <td className="px-6 py-4">{o.amount}</td>
                    <td className="px-6 py-4">{o.chainId}</td>
                    <td className="px-6 py-4">{new Date(o.createdAt).toLocaleString()}</td>
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
          <input placeholder="User ID (optional)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={subForm.userId} onChange={(e) => setSubForm({ ...subForm, userId: e.target.value })} />
          <input placeholder="Email (optional)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={subForm.email} onChange={(e) => setSubForm({ ...subForm, email: e.target.value })} />
          <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={subForm.status} onChange={(e) => setSubForm({ ...subForm, status: e.target.value as any })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={subForm.paymentMethod} onChange={(e) => setSubForm({ ...subForm, paymentMethod: e.target.value as any })}>
            <option value="demo">Demo</option>
            <option value="stripe">Stripe</option>
            <option value="other">Other</option>
          </select>
          <input placeholder="Amount (optional)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={subForm.amount} onChange={(e) => setSubForm({ ...subForm, amount: e.target.value })} />
          <input placeholder="Expires At (ISO)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={subForm.expiresAt} onChange={(e) => setSubForm({ ...subForm, expiresAt: e.target.value })} />
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
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">ID</th>
                  <th scope="col" className="px-6 py-3">Plan</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Payment Method</th>
                  <th scope="col" className="px-6 py-3">User/Email</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Created</th>
                  <th scope="col" className="px-6 py-3">Expires</th>
                  <th scope="col" className="px-6 py-3">Refund Status</th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptionOrders.map((s) => (
                  <tr key={s.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{s.id}</th>
                    <td className="px-6 py-4 capitalize">{s.plan}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        s.status === 'active' ? 'bg-green-900 text-green-300' :
                        s.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize">{s.paymentMethod}</td>
                    <td className="px-6 py-4">{s.email || s.userId || '—'}</td>
                    <td className="px-6 py-4">{s.amount ? `${s.amount} ${s.currency || ''}` : '—'}</td>
                    <td className="px-6 py-4">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">{s.expiresAt ? new Date(s.expiresAt).toLocaleString() : '—'}</td>
                    <td className="px-6 py-4">
                      {s.refundStatus ? (
                        <span className={`px-2 py-1 rounded text-xs ${
                          s.refundStatus === 'completed' ? 'bg-green-900 text-green-300' :
                          s.refundStatus === 'processing' ? 'bg-yellow-900 text-yellow-300' :
                          s.refundStatus === 'failed' ? 'bg-red-900 text-red-300' :
                          s.refundStatus === 'requested' ? 'bg-blue-900 text-blue-300' :
                          'bg-gray-900 text-gray-300'
                        }`}>
                          {s.refundStatus === 'none' ? 'No Refund' : s.refundStatus}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                      {s.refundAmount && s.refundDate && (
                        <div className="text-xs text-gray-400 mt-1">
                          ${s.refundAmount} on {new Date(s.refundDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2">
                        {s.amount && (!s.refundStatus || s.refundStatus === 'none' || s.refundStatus === 'failed') ? (
                          <>
                            <button
                              onClick={() => openRefundModal(s)}
                              disabled={refundingIds.has(s.id)}
                              className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed px-2 py-1 rounded text-xs text-white"
                            >
                              {refundingIds.has(s.id) ? 'Processing...' : '💰 Refund'}
                            </button>
                            {s.paymentMethod === 'stripe' && (
                              <button
                                onClick={() => handleRefund(s.id, s.amount)}
                                disabled={refundingIds.has(s.id)}
                                className="bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 disabled:cursor-not-allowed px-2 py-1 rounded text-xs text-white"
                              >
                                Quick Refund
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Refund Modal */}
      {refundModalOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-white">💰 Process Refund</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Subscription ID:</label>
                <div className="text-sm text-gray-400 bg-gray-800 p-2 rounded">{selectedSubscription.id}</div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">Customer:</label>
                <div className="text-sm text-gray-400 bg-gray-800 p-2 rounded">
                  {selectedSubscription.email || selectedSubscription.userId || 'N/A'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">Original Amount:</label>
                <div className="text-sm text-gray-400 bg-gray-800 p-2 rounded">
                  ${selectedSubscription.amount} {selectedSubscription.currency}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">Refund Amount:</label>
                <input
                  type="number"
                  step="0.01"
                  value={customRefundAmount}
                  onChange={(e) => setCustomRefundAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="Enter refund amount"
                />
              </div>
              
              <div className="bg-yellow-900 border border-yellow-600 rounded p-3">
                <p className="text-yellow-200 text-sm">
                  ⚠️ This will process a refund for the specified amount. This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleRefund(selectedSubscription.id, customRefundAmount)}
                disabled={refundingIds.has(selectedSubscription.id) || !customRefundAmount}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed px-4 py-2 rounded text-white font-medium"
              >
                {refundingIds.has(selectedSubscription.id) ? 'Processing...' : 'Process Refund'}
              </button>
              <button
                onClick={closeRefundModal}
                className="flex-1 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
