'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { PROMO_PACKAGE_OPTIONS } from '@/lib/promoPackages';

interface NewsPromoCode {
  code: string;
  discountPercent: number;
  packageIds: string[];
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const PACKAGE_GROUPS = [...new Set(PROMO_PACKAGE_OPTIONS.map(option => option.category))].map(label => ({
  label,
  packages: PROMO_PACKAGE_OPTIONS.filter(option => option.category === label),
}));

const PACKAGE_LABELS = new Map<string, string>(
  PROMO_PACKAGE_OPTIONS.map(option => [option.id, option.label] as const)
);

function toLocalDateTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export default function NewsPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<NewsPromoCode[]>([]);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [packageIds, setPackageIds] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [expirationDrafts, setExpirationDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadPromoCodes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/news-promo-codes', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (response.status === 401) {
        window.location.href = `/adminpanel/login?from=${encodeURIComponent('/adminpanel/news-promo-codes')}`;
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load promo codes.');
      const codes = result.data as NewsPromoCode[];
      setPromoCodes(codes);
      setExpirationDrafts(Object.fromEntries(codes.map(promo => [promo.code, toLocalDateTime(promo.expiresAt)])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load promo codes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPromoCodes();
  }, [loadPromoCodes]);

  const createPromoCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/news-promo-codes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountPercent: Number(discountPercent),
          packageIds,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });
      const result = await response.json();
      if (response.status === 401) {
        window.location.href = `/adminpanel/login?from=${encodeURIComponent('/adminpanel/news-promo-codes')}`;
        return;
      }
      if (!response.ok) throw new Error(result.error || 'Could not create promo code.');
      setCode('');
      setDiscountPercent('10');
      setPackageIds([]);
      setExpiresAt('');
      setNotice(`Promo code ${result.data.code} created.`);
      await loadPromoCodes();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create promo code.');
    } finally {
      setSaving(false);
    }
  };

  const updatePromoCode = async (promo: NewsPromoCode, changes: Record<string, unknown>, successMessage: string) => {
    setSavingCode(promo.code);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/news-promo-codes', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promo.code, ...changes }),
      });
      const result = await response.json();
      if (response.status === 401) {
        window.location.href = `/adminpanel/login?from=${encodeURIComponent('/adminpanel/news-promo-codes')}`;
        return;
      }
      if (!response.ok) throw new Error(result.error || 'Could not update promo code.');
      setNotice(successMessage);
      await loadPromoCodes();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update promo code.');
    } finally {
      setSavingCode(null);
    }
  };

  const saveExpiration = (promo: NewsPromoCode) => {
    const draft = expirationDrafts[promo.code] || '';
    const newExpiration = draft ? new Date(draft).toISOString() : null;
    void updatePromoCode(promo, { expiresAt: newExpiration }, `Expiration updated for ${promo.code}.`);
  };

  return (
    <div className="space-y-6 text-white">
      <header>
        <h1 className="text-2xl font-semibold">News &amp; Pricing Promo Codes</h1>
        <p className="mt-1 text-sm text-gray-400">
          Choose which News Hub or pricing packages each percentage discount applies to. Codes can stay active indefinitely or expire on a date you choose.
        </p>
      </header>

      <form onSubmit={createPromoCode} className="space-y-4 rounded-xl border border-gray-700/40 bg-gray-800/40 p-5">
        <h2 className="text-lg font-medium">Create a promo code</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm text-gray-300">
            Promo code
            <input
              value={code}
              onChange={event => setCode(event.target.value.toUpperCase())}
              minLength={3}
              maxLength={32}
              pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,31}"
              required
              placeholder="NEWS10"
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900/70 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-gray-300">
            Discount percent (1-99%)
            <input
              type="number"
              min={1}
              max={99}
              step={1}
              value={discountPercent}
              onChange={event => setDiscountPercent(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900/70 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-gray-300">
            Expires at (optional)
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={event => setExpiresAt(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900/70 px-3 py-2 text-white"
            />
          </label>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-gray-300">Packages (select one or more)</legend>
          <div className="grid gap-4 md:grid-cols-2">
            {PACKAGE_GROUPS.map(group => (
              <fieldset key={group.label} className="space-y-2 rounded-lg border border-gray-700/60 p-3">
                <legend className="px-1 text-sm font-medium text-gray-200">{group.label}</legend>
                {group.packages.map(option => (
                  <label key={option.id} className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={packageIds.includes(option.id)}
                      onChange={event => {
                        setPackageIds(current =>
                          event.target.checked
                            ? [...current, option.id]
                            : current.filter(packageId => packageId !== option.id)
                        );
                      }}
                      className="accent-cyan-500"
                    />
                    {option.label}
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
          {packageIds.length === 0 && (
            <p className="text-xs text-amber-300">Select at least one package before creating the code.</p>
          )}
        </fieldset>
        <p className="text-xs text-gray-400">
          Leave the expiration blank to keep the code valid until you deactivate it.
        </p>
        <button
          type="submit"
          disabled={saving || packageIds.length === 0}
          className="rounded-lg bg-[#00b8d8] px-4 py-2 font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Create Promo Code'}
        </button>
      </form>

      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">{notice}</p>}

      <section className="overflow-hidden rounded-xl border border-gray-700/40 bg-gray-800/40">
        <div className="border-b border-gray-700/40 px-5 py-4">
          <h2 className="text-lg font-medium">Existing codes</h2>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-gray-400">Loading promo codes...</p>
        ) : promoCodes.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">No promo codes have been created.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-gray-900/50 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Discount</th>
                  <th className="px-5 py-3">Packages</th>
                  <th className="px-5 py-3">Expiration</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/40">
                {promoCodes.map(promo => {
                  const expired = Boolean(promo.expiresAt && new Date(promo.expiresAt).getTime() <= Date.now());
                  const usable = promo.active && !expired;
                  return (
                    <tr key={promo.code}>
                      <td className="px-5 py-4 font-mono font-semibold">{promo.code}</td>
                      <td className="px-5 py-4">{promo.discountPercent}%</td>
                      <td className="px-5 py-4">
                        <div className="flex max-w-sm flex-wrap gap-1">
                          {promo.packageIds.map(packageId => (
                            <span key={packageId} className="rounded bg-gray-700/70 px-2 py-1 text-xs">
                              {PACKAGE_LABELS.get(packageId) || packageId}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="datetime-local"
                            value={expirationDrafts[promo.code] ?? ''}
                            onChange={event => setExpirationDrafts(current => ({ ...current, [promo.code]: event.target.value }))}
                            className="rounded border border-gray-600 bg-gray-900 px-2 py-1 text-xs text-white"
                            aria-label={`Expiration date for ${promo.code}`}
                          />
                          <button
                            type="button"
                            onClick={() => saveExpiration(promo)}
                            disabled={savingCode === promo.code}
                            className="text-cyan-300 hover:text-cyan-200 disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                        {!promo.expiresAt && <span className="mt-1 block text-xs text-gray-500">No expiration</span>}
                      </td>
                      <td className={`px-5 py-4 ${usable ? 'text-green-300' : 'text-gray-400'}`}>
                        {expired ? 'Expired' : promo.active ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => void updatePromoCode(
                            promo,
                            { active: !promo.active },
                            `${promo.code} ${promo.active ? 'deactivated' : 'activated'}.`
                          )}
                          disabled={savingCode === promo.code || (expired && !promo.active)}
                          className="rounded border border-gray-600 px-3 py-1.5 text-xs hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {promo.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
