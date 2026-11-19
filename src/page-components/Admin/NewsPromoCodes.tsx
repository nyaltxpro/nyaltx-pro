'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Drawer } from '@/components/reui/drawer';
import { Alert } from '@/components/reui/alert';
import { Checkbox } from '@/components/reui/checkbox';
import { CalendarInput } from '@/components/reui/calendar';
import { Button } from '@/components/reui/button';
import { Field } from '@/components/reui/field';
import { Filters } from '@/components/reui/filters';
import { DropdownSelect } from '@/components/reui/dropdown-select';
import { paginateItems, TablePagination } from '@/components/reui/table-pagination';
import { PROMO_PACKAGE_OPTIONS } from '@/lib/promoPackages';
import { Package, Plus, Search, Tag, X } from 'lucide-react';

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
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [page, setPage] = useState(1);
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
      setIsCreateDrawerOpen(false);
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

  const filteredPromoCodes = promoCodes.filter(promo => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || [
      promo.code,
      ...promo.packageIds.map(packageId => PACKAGE_LABELS.get(packageId) || packageId),
    ].some(value => value.toLowerCase().includes(query));
    const expired = Boolean(promo.expiresAt && new Date(promo.expiresAt).getTime() <= Date.now());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'expired' && expired) ||
      (statusFilter === 'active' && promo.active && !expired) ||
      (statusFilter === 'inactive' && !promo.active && !expired);
    return matchesSearch && matchesStatus;
  });
  const paginatedPromoCodes = paginateItems(filteredPromoCodes, page, 10);

  return (
    <div className="admin-panel-form space-y-6 text-white">
      <header className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">News &amp; Pricing Promo Codes</h1>
          <p className="mt-1 text-sm text-gray-400">
            Choose which News Hub or pricing packages each percentage discount applies to. Codes can stay active indefinitely or expire on a date you choose.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => setIsCreateDrawerOpen(true)}
          className="shrink-0"
        >
          <Plus size={16} aria-hidden="true" />
          Create promo code
        </Button>
      </header>

      {isCreateDrawerOpen && (
        <Drawer
          open={isCreateDrawerOpen}
          onClose={() => {
            if (!saving) setIsCreateDrawerOpen(false);
          }}
          title="Create Promo Code"
          maxWidth="max-w-xl"
        >
          <form onSubmit={createPromoCode} className="admin-panel-form admin-promo-code-drawer flex h-full min-h-full w-full flex-col overflow-hidden border-l border-white/10 bg-[#0d0d0d]">
            <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Tag size={18} className="text-cyan-300" aria-hidden="true" />
                Create a promo code
              </h2>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => setIsCreateDrawerOpen(false)}
                disabled={saving}
                aria-label="Close promo code form"
              >
                <X size={20} aria-hidden="true" />
              </Button>
            </header>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <Field id="promo-code" label="Promo code">
                <input
                  id="promo-code"
                  value={code}
                  onChange={event => setCode(event.target.value.toUpperCase())}
                  minLength={3}
                  maxLength={32}
                  pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,31}"
                  required
                  placeholder="NEWS10"
                  className="w-full px-3 py-2"
                />
              </Field>
              <Field id="promo-discount" label="Discount percent (1-99%)" required>
                <input
                  id="promo-discount"
                  type="number"
                  min={1}
                  max={99}
                  step={1}
                  value={discountPercent}
                  onChange={event => setDiscountPercent(event.target.value)}
                  required
                  className="w-full px-3 py-2"
                />
              </Field>
              <Field id="promo-expires-at" label="Expires at (optional)">
                <CalendarInput
                  id="promo-expires-at"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={event => setExpiresAt(event.target.value)}
                  className="w-full px-3 py-2"
                />
              </Field>
              <fieldset className="space-y-3">
                <legend className="flex items-center gap-2 text-[13px] font-medium text-gray-300">
                  <Package size={14} aria-hidden="true" />
                  Packages (select one or more)
                </legend>
                <div className="grid gap-3">
                  {PACKAGE_GROUPS.map(group => (
                    <fieldset key={group.label} className="space-y-2 rounded-xl border border-white/10 p-3">
                      <legend className="px-1 text-[13px] font-medium text-gray-200">{group.label}</legend>
                      {group.packages.map(option => (
                        <label key={option.id} className="flex items-center gap-2 text-[13px] text-gray-300">
                          <Checkbox
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
              {error && <Alert variant="destructive">{error}</Alert>}
            </div>
            <footer className="flex justify-end gap-3 border-t border-white/10 px-5 py-3">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsCreateDrawerOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                type="submit"
                disabled={saving || packageIds.length === 0}
              >
                <Plus size={15} aria-hidden="true" />
                {saving ? 'Creating...' : 'Create Code'}
              </Button>
            </footer>
          </form>
        </Drawer>
      )}

      {error && <Alert variant="destructive">{error}</Alert>}
      {notice && <Alert variant="success">{notice}</Alert>}

      <Filters
        className="admin-promo-code-filters"
        activeFilters={[
          ...(searchTerm.trim()
            ? [{ id: 'promo-search', label: `Search: ${searchTerm}`, onRemove: () => setSearchTerm('') }]
            : []),
          ...(statusFilter !== 'all'
            ? [{ id: 'promo-status', label: `Status: ${statusFilter}`, onRemove: () => setStatusFilter('all') }]
            : []),
        ]}
      >
        <div className="relative min-w-[220px] flex-1">
          <Search className="admin-panel-input-icon" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Search code or package..."
            aria-label="Search promo codes"
            className="w-full px-3 py-2"
          />
        </div>
        <DropdownSelect
          value={statusFilter}
          aria-label="Filter promo codes by status"
          className="!w-[111px] px-3 py-2"
          onValueChange={value => setStatusFilter(value as typeof statusFilter)}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'expired', label: 'Expired' },
          ]}
        />
      </Filters>

      <section className="admin-panel-card overflow-hidden">
        <div className="border-b border-gray-700/40 px-5 py-4">
          <h2 className="text-lg font-medium">Existing codes <span className="text-sm text-gray-400">({filteredPromoCodes.length})</span></h2>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-gray-400">Loading promo codes...</p>
        ) : promoCodes.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">No promo codes have been created.</p>
        ) : filteredPromoCodes.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">No promo codes match these filters.</p>
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
                {paginatedPromoCodes.map(promo => {
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
                          <CalendarInput
                            type="datetime-local"
                            showIcon={false}
                            value={expirationDrafts[promo.code] ?? ''}
                            onChange={event => setExpirationDrafts(current => ({ ...current, [promo.code]: event.target.value }))}
                            className="min-w-[12rem] rounded border border-gray-600 bg-gray-900 px-2 py-1 text-xs text-white"
                            aria-label={`Expiration date for ${promo.code}`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => saveExpiration(promo)}
                            disabled={savingCode === promo.code}
                          >
                            Save
                          </Button>
                        </div>
                        {!promo.expiresAt && <span className="mt-1 block text-xs text-gray-500">No expiration</span>}
                      </td>
                      <td className={`px-5 py-4 ${usable ? 'text-green-300' : 'text-gray-400'}`}>
                        {expired ? 'Expired' : promo.active ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          variant={promo.active ? 'destructive' : 'outline'}
                          size="sm"
                          type="button"
                          onClick={() => void updatePromoCode(
                            promo,
                            { active: !promo.active },
                            `${promo.code} ${promo.active ? 'deactivated' : 'activated'}.`
                          )}
                          disabled={savingCode === promo.code || (expired && !promo.active)}
                        >
                          {promo.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredPromoCodes.length > 0 && (
          <TablePagination
            page={page}
            pageSize={10}
            total={filteredPromoCodes.length}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
