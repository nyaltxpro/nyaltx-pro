'use client';

import { useEffect, useState } from 'react';
import { Alert } from '@/components/reui/alert';
import { Button } from '@/components/reui/button';
import { Switch } from '@/components/reui/switch';

export default function AnnouncementSettings() {
  const [message, setMessage] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/announcement', { cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(data.error || `Could not load settings (HTTP ${response.status}).`);
        setMessage(data.message || '');
        setEnabled(data.enabled === true);
      } catch (error) {
        setNotice({
          type: 'error',
          text: error instanceof Error ? error.message : 'Could not load announcement settings.',
        });
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch('/api/admin/announcement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, message }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.error || `Could not save settings (HTTP ${response.status}).`);
      setMessage(data.announcement.message);
      setEnabled(data.announcement.enabled);
      setNotice({ type: 'success', text: 'Announcement settings saved.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not save announcement settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-4 text-white md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Announcement Banner</h1>
        <p className="mt-1 text-sm text-slate-400">
          Edit the site-wide announcement and choose when it appears above the public navigation.
        </p>
      </header>

      {notice && (
        <Alert variant={notice.type === 'success' ? 'success' : 'destructive'} className="mb-5">
          {notice.text}
        </Alert>
      )}

      <section className="space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-medium">Show announcement</h2>
            <p className="mt-1 text-sm text-slate-400">
              Turn this off any time to hide the banner without deleting its text.
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            disabled={loading || saving}
            aria-label="Show announcement banner"
          />
        </div>

        <label className="block text-sm font-medium text-slate-200" htmlFor="announcement-message">
          Announcement text
          <textarea
            id="announcement-message"
            value={message}
            onChange={event => setMessage(event.target.value)}
            maxLength={240}
            rows={3}
            disabled={loading || saving}
            placeholder="Write a short update for site visitors…"
            className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-[#0b111b] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/60 disabled:opacity-50"
          />
          <span className="mt-1 block text-right text-xs text-slate-500">{message.length}/240</span>
        </label>

        {message.trim() && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Preview
            </p>
            <div className="rounded-lg border border-cyan-300/20 bg-gradient-to-r from-[#0c3140] via-[#12314b] to-[#14264a] px-3 py-2 text-center text-sm font-medium text-white">
              {message.trim()}
            </div>
          </div>
        )}

        <div className="flex justify-end border-t border-white/10 pt-4">
          <Button type="button" onClick={saveSettings} disabled={loading || saving}>
            {saving ? 'Saving…' : 'Save announcement'}
          </Button>
        </div>
      </section>
    </main>
  );
}
