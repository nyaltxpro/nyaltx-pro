'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, Mail, MapPin, RefreshCw } from 'lucide-react';

type PricingInquiry = {
  _id: string;
  name: string;
  companyName: string;
  email: string;
  city: string;
  state: string;
  message?: string;
  serviceId: string;
  serviceName?: string;
  price?: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
};

const serviceNames: Record<string, string> = {
  'executive-podcast': 'Executive Podcast Interview',
  'full-media': 'Full Media Package',
  'live-roadshows': 'Live Roadshows',
  'national-tv': 'National TV Campaign',
  'custom-media-campaign': 'Custom Media Campaign',
};

export default function PricingInquiries() {
  const [inquiries, setInquiries] = useState<PricingInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/pricing-inquiries', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.error || `Could not load inquiries (HTTP ${response.status}).`);
      setInquiries(Array.isArray(data.inquiries) ? data.inquiries : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load inquiries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInquiries();
  }, [loadInquiries]);

  const updateStatus = async (id: string, status: PricingInquiry['status']) => {
    setUpdatingId(id);
    setError('');
    try {
      const response = await fetch('/api/admin/pricing-inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.error || `Could not update inquiry (HTTP ${response.status}).`);
      setInquiries(current => current.map(item => (item._id === id ? { ...item, status } : item)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update inquiry.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="p-4 text-white md:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Media Inquiries</h1>
          <p className="mt-1 text-sm text-slate-400">
            Pricing-page requests from prospective media clients.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadInquiries()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-slate-400">Loading inquiries…</p>
      ) : inquiries.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-slate-400">
          No media inquiries yet.
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map(inquiry => (
            <article
              key={inquiry._id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{inquiry.name}</h2>
                    <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs capitalize text-cyan-200">
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-cyan-300">
                    {inquiry.serviceName || serviceNames[inquiry.serviceId] || inquiry.serviceId}
                    {inquiry.price ? ` · ${inquiry.price}` : ''}
                  </p>
                </div>
                <time className="text-sm text-slate-400" dateTime={inquiry.createdAt}>
                  {new Date(inquiry.createdAt).toLocaleString()}
                </time>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  {inquiry.companyName}
                </p>
                <a
                  className="flex items-center gap-2 text-cyan-300 hover:underline"
                  href={`mailto:${encodeURIComponent(inquiry.email)}`}
                >
                  <Mail className="h-4 w-4" />
                  {inquiry.email}
                </a>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {inquiry.city}, {inquiry.state}
                </p>
              </div>
              {inquiry.message && (
                <p className="mt-4 whitespace-pre-wrap rounded-lg bg-black/20 p-3 text-sm text-slate-300">
                  {inquiry.message}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {inquiry.status !== 'contacted' && (
                  <button
                    type="button"
                    disabled={updatingId === inquiry._id}
                    onClick={() => void updateStatus(inquiry._id, 'contacted')}
                    className="rounded-lg border border-cyan-500/30 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-50"
                  >
                    Mark contacted
                  </button>
                )}
                {inquiry.status !== 'closed' && (
                  <button
                    type="button"
                    disabled={updatingId === inquiry._id}
                    onClick={() => void updateStatus(inquiry._id, 'closed')}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
                  >
                    Close inquiry
                  </button>
                )}
                {inquiry.status !== 'new' && (
                  <button
                    type="button"
                    disabled={updatingId === inquiry._id}
                    onClick={() => void updateStatus(inquiry._id, 'new')}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
