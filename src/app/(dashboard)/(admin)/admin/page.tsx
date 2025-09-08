"use client";

import React, { useEffect, useState } from "react";

export default function AdminHomePage() {
  const [stripeCount, setStripeCount] = useState<number | null>(null);
  const [onchainCount, setOnchainCount] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [sessionInfo, setSessionInfo] = useState<any | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  type Campaign = {
    id: string;
    projectName: string;
    tierId: 'paddle' | 'motor' | 'helicopter';
    startDate: string;
    endDate: string;
    notes?: string;
    createdAt: string;
  };
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [newCampaign, setNewCampaign] = useState<{ projectName: string; tierId: Campaign['tierId']; startDate: string; notes?: string }>({ projectName: "", tierId: 'paddle', startDate: "", notes: "" });
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/orders/stripe")
      .then(async (r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setStripeCount((d?.data || []).length))
      .catch(() => setStripeCount(0));

    fetch("/api/admin/orders/onchain")
      .then(async (r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setOnchainCount((d?.data || []).length))
      .catch(() => setOnchainCount(0));

    fetch("/api/admin/campaigns")
      .then(async (r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setCampaigns(d?.data || []))
      .catch(() => setCampaigns([]));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <div className="flex gap-3 text-sm">
        <a href="/admin/orders" className="underline">Orders</a>
        <a href="/admin/profiles" className="underline">Profiles</a>
        <a href="/admin/stats" className="underline">Stats</a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">Stripe Orders</div>
          <div className="text-3xl font-bold">{stripeCount ?? '—'}</div>
        </div>
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">On-chain Orders</div>
          <div className="text-3xl font-bold">{onchainCount ?? '—'}</div>
        </div>
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">Users</div>
          <div className="text-3xl font-bold">—</div>
        </div>
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">Listings</div>
          <div className="text-3xl font-bold">—</div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-800 p-6">
        <h3 className="font-semibold mb-2">Getting Started</h3>
        <ul className="list-disc pl-5 text-gray-300 space-y-1 text-sm">
          <li>Use this area to build admin tools and metrics.</li>
          <li>Protects all routes under <code>/admin</code> via middleware.</li>
          <li>Configure the password via the <code>ADMIN_PASSWORD</code> environment variable.</li>
        </ul>
      </div>

      <div className="rounded-xl border border-gray-800 p-6 space-y-6">
        <h3 className="font-semibold text-lg">Admin Operations</h3>
        {/* Stripe session verifier */}
        <div>
          <h4 className="font-medium mb-2">Verify Stripe Checkout Session</h4>
          <form className="flex flex-col md:flex-row gap-2" onSubmit={async (e) => {
            e.preventDefault();
            setSessionError(null);
            setSessionInfo(null);
            if (!sessionId) { setSessionError('Enter a session ID'); return; }
            try {
              const r = await fetch(`/api/admin/stripe-session?id=${encodeURIComponent(sessionId)}`);
              if (!r.ok) throw new Error('Lookup failed');
              const d = await r.json();
              setSessionInfo(d);
            } catch (err: any) {
              setSessionError(err?.message || 'Error');
            }
          }}>
            <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="cs_test_... or cs_..." className="bg-black border border-gray-800 rounded px-3 py-2 w-full md:w-96" />
            <button className="rounded bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm" type="submit">Check</button>
          </form>
          {sessionError && <div className="text-sm text-red-400 mt-2">{sessionError}</div>}
          {sessionInfo && (
            <pre className="mt-3 text-xs bg-black/40 border border-gray-800 p-3 rounded overflow-x-auto">{JSON.stringify(sessionInfo, null, 2)}</pre>
          )}
        </div>

        {/* Campaign scheduler */}
        <div>
          <h4 className="font-medium mb-2">Schedule Campaign (Placement)</h4>
          <form className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end" onSubmit={async (e) => {
            e.preventDefault();
            setCampaignError(null);
            setBusy(true);
            try {
              const r = await fetch('/api/admin/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCampaign),
              });
              if (!r.ok) throw new Error('Failed to create');
              const d = await r.json();
              setCampaigns(d?.data || []);
              setNewCampaign({ projectName: '', tierId: 'paddle', startDate: '', notes: '' });
            } catch (err: any) {
              setCampaignError(err?.message || 'Error');
            } finally {
              setBusy(false);
            }
          }}>
            <input required value={newCampaign.projectName} onChange={(e) => setNewCampaign({ ...newCampaign, projectName: e.target.value })} placeholder="Project name" className="bg-black border border-gray-800 rounded px-3 py-2" />
            <select value={newCampaign.tierId} onChange={(e) => setNewCampaign({ ...newCampaign, tierId: e.target.value as any })} className="bg-black border border-gray-800 rounded px-3 py-2">
              <option value="paddle">Paddle ($300, 1 week)</option>
              <option value="motor">Motor ($500, 1 month)</option>
              <option value="helicopter">Helicopter ($700, 3 months)</option>
            </select>
            <input required type="date" value={newCampaign.startDate} onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })} className="bg-black border border-gray-800 rounded px-3 py-2" />
            <input value={newCampaign.notes} onChange={(e) => setNewCampaign({ ...newCampaign, notes: e.target.value })} placeholder="Notes (optional)" className="bg-black border border-gray-800 rounded px-3 py-2" />
            <button disabled={busy} className="rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm">Create</button>
          </form>
          {campaignError && <div className="text-sm text-red-400 mt-2">{campaignError}</div>}
          <div className="mt-4 overflow-x-auto">
            {!campaigns ? (
              <div className="text-gray-400">Loading campaigns…</div>
            ) : campaigns.length === 0 ? (
              <div className="text-gray-400">No campaigns scheduled.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-300">
                  <tr>
                    <th className="px-2 py-1">Project</th>
                    <th className="px-2 py-1">Tier</th>
                    <th className="px-2 py-1">Start</th>
                    <th className="px-2 py-1">End</th>
                    <th className="px-2 py-1">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id} className="border-t border-gray-800">
                      <td className="px-2 py-1">{c.projectName}</td>
                      <td className="px-2 py-1">{c.tierId}</td>
                      <td className="px-2 py-1">{new Date(c.startDate).toLocaleDateString()}</td>
                      <td className="px-2 py-1">{new Date(c.endDate).toLocaleDateString()}</td>
                      <td className="px-2 py-1">{c.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
