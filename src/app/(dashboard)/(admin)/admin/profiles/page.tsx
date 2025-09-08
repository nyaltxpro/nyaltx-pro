"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Profile = {
  id: string;
  projectName: string;
  contactEmail?: string;
  website?: string;
  paidTier?: 'paddle' | 'motor' | 'helicopter' | null;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<{ projectName: string; contactEmail?: string; website?: string; paidTier?: Profile['paidTier']; status: Profile['status']; notes?: string }>({
    projectName: "",
    contactEmail: "",
    website: "",
    paidTier: null,
    status: 'active',
    notes: "",
  });

  const [editing, setEditing] = useState<Profile | null>(null);

  const load = () => {
    fetch("/api/admin/profiles").then(async r => {
      if (!r.ok) throw new Error('Failed to load');
      const d = await r.json();
      setProfiles(d?.data || []);
    }).catch(() => setProfiles([]));
  };

  useEffect(() => { load(); }, []);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await fetch('/api/admin/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error('Create failed');
      await r.json();
      setForm({ projectName: '', contactEmail: '', website: '', paidTier: null, status: 'active', notes: '' });
      load();
    } catch (err: any) {
      setError(err?.message || 'Error');
    } finally {
      setBusy(false);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true); setError(null);
    try {
      const r = await fetch('/api/admin/profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      if (!r.ok) throw new Error('Update failed');
      await r.json();
      setEditing(null);
      load();
    } catch (err: any) {
      setError(err?.message || 'Error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this profile?')) return;
    setBusy(true); setError(null);
    try {
      const r = await fetch(`/api/admin/profiles?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Delete failed');
      await r.json();
      load();
    } catch (err: any) {
      setError(err?.message || 'Error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Profiles (Paid)</h2>
        <Link href="/admin" className="text-sm underline text-gray-300">Back to Dashboard</Link>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      {/* Create new profile */}
      <div className="rounded-xl border border-gray-800 p-4">
        <h3 className="font-semibold mb-2">Create Profile</h3>
        <form onSubmit={submitCreate} className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <input required placeholder="Project name" className="bg-black border border-gray-800 rounded px-3 py-2" value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })} />
          <input type="email" placeholder="Contact email" className="bg-black border border-gray-800 rounded px-3 py-2" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} />
          <input placeholder="Website" className="bg-black border border-gray-800 rounded px-3 py-2" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
          <select className="bg-black border border-gray-800 rounded px-3 py-2" value={form.paidTier ?? ''} onChange={e => setForm({ ...form, paidTier: (e.target.value || null) as any })}>
            <option value="">No tier</option>
            <option value="paddle">Paddle</option>
            <option value="motor">Motor</option>
            <option value="helicopter">Helicopter</option>
          </select>
          <select className="bg-black border border-gray-800 rounded px-3 py-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input placeholder="Notes" className="bg-black border border-gray-800 rounded px-3 py-2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="md:col-span-6">
            <button disabled={busy} className="rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm">Create</button>
          </div>
        </form>
      </div>

      {/* List + edit */}
      <div className="rounded-xl border border-gray-800 p-4">
        <h3 className="font-semibold mb-2">Profiles</h3>
        {!profiles ? (
          <div className="text-gray-400">Loading…</div>
        ) : profiles.length === 0 ? (
          <div className="text-gray-400">No profiles yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-300">
                <tr>
                  <th className="px-2 py-1">Project</th>
                  <th className="px-2 py-1">Contact</th>
                  <th className="px-2 py-1">Website</th>
                  <th className="px-2 py-1">Tier</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Updated</th>
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-t border-gray-800">
                    <td className="px-2 py-1">{p.projectName}</td>
                    <td className="px-2 py-1">{p.contactEmail || '—'}</td>
                    <td className="px-2 py-1"><a className="underline" href={p.website || '#'} target="_blank" rel="noreferrer">{p.website || '—'}</a></td>
                    <td className="px-2 py-1">{p.paidTier || '—'}</td>
                    <td className="px-2 py-1">{p.status}</td>
                    <td className="px-2 py-1">{new Date(p.updatedAt).toLocaleString()}</td>
                    <td className="px-2 py-1 space-x-2">
                      <button className="underline" onClick={() => setEditing(p)}>Edit</button>
                      <button className="underline text-red-400" onClick={() => remove(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal/section */}
      {editing && (
        <div className="rounded-xl border border-gray-800 p-4">
          <h3 className="font-semibold mb-2">Edit Profile</h3>
          <form onSubmit={submitEdit} className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <input required placeholder="Project name" className="bg-black border border-gray-800 rounded px-3 py-2" value={editing.projectName} onChange={e => setEditing({ ...editing, projectName: e.target.value })} />
            <input type="email" placeholder="Contact email" className="bg-black border border-gray-800 rounded px-3 py-2" value={editing.contactEmail || ''} onChange={e => setEditing({ ...editing, contactEmail: e.target.value })} />
            <input placeholder="Website" className="bg-black border border-gray-800 rounded px-3 py-2" value={editing.website || ''} onChange={e => setEditing({ ...editing, website: e.target.value })} />
            <select className="bg-black border border-gray-800 rounded px-3 py-2" value={editing.paidTier ?? ''} onChange={e => setEditing({ ...editing, paidTier: (e.target.value || null) as any })}>
              <option value="">No tier</option>
              <option value="paddle">Paddle</option>
              <option value="motor">Motor</option>
              <option value="helicopter">Helicopter</option>
            </select>
            <select className="bg-black border border-gray-800 rounded px-3 py-2" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as any })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <input placeholder="Notes" className="bg-black border border-gray-800 rounded px-3 py-2" value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
            <div className="md:col-span-6 flex items-center gap-2">
              <button disabled={busy} className="rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm">Save</button>
              <button type="button" className="rounded bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
