'use client';

import Link from 'next/link';
import { Dialog } from '@/components/reui/dialog';
import { Checkbox } from '@/components/reui/checkbox';
import { Card } from '@/components/reui/card';
import { Button } from '@/components/reui/button';
import { EmojiPicker } from '@/components/reui/emoji-picker';
import { Field } from '@/components/reui/field';
import { Filters } from '@/components/reui/filters';
import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { FaCheckCircle, FaChevronDown, FaChevronUp, FaEnvelope, FaHistory, FaInbox, FaPaperPlane, FaPlus, FaReply, FaSearch, FaSync, FaTimesCircle, FaTrash, FaUsers } from 'react-icons/fa';

interface EmailRecipient {
  id: string;
  email: string;
  name?: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface EmailRecord {
  id: string;
  subject: string;
  message: string;
  recipients: string[];
  recipientCount: number;
  sentBy: string;
  sentAt: string;
  status: 'sent' | 'failed';
  failedRecipients?: string[];
}

interface MailAddress {
  name: string;
  email: string;
}

interface InboxRecord {
  uid: number;
  from: MailAddress[];
  to: string[];
  subject: string;
  date: string;
  unread: boolean;
  size: number;
}

interface InboxMessage {
  uid: number;
  from: MailAddress[];
  to: MailAddress[];
  cc: MailAddress[];
  subject: string;
  date: string;
  body: string;
  messageId: string;
}

export default function EmailManagementPage() {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<EmailRecipient | null>(null);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientStatusFilter, setRecipientStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'admin'
  });

  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Client email state
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const emailMessageRef = useRef<HTMLTextAreaElement>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Mailbox inbox state
  const [inboxMessages, setInboxMessages] = useState<InboxRecord[]>([]);
  const [selectedInboxMessage, setSelectedInboxMessage] = useState<InboxMessage | null>(null);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [inboxSearch, setInboxSearch] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [showMailboxComposeModal, setShowMailboxComposeModal] = useState(false);
  const [mailboxTo, setMailboxTo] = useState('');
  const [mailboxSubject, setMailboxSubject] = useState('');
  const [mailboxMessage, setMailboxMessage] = useState('');
  const mailboxMessageRef = useRef<HTMLTextAreaElement>(null);
  const [sendingMailboxEmail, setSendingMailboxEmail] = useState(false);
  const [mailboxComposeError, setMailboxComposeError] = useState<string | null>(null);
  const [mailboxComposeSuccess, setMailboxComposeSuccess] = useState<string | null>(null);

  // Email history state
  const [emailHistory, setEmailHistory] = useState<EmailRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'recipients' | 'history'>('inbox');
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  const insertEmoji = (
    textarea: HTMLTextAreaElement | null,
    setValue: Dispatch<SetStateAction<string>>,
    emoji: string
  ) => {
    if (!textarea) {
      setValue(current => `${current}${emoji}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setValue(current => `${current.slice(0, start)}${emoji}${current.slice(end)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + emoji.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  useEffect(() => {
    fetchRecipients();
    fetchEmailHistory();
    fetchInbox();
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/email-recipients');
      if (response.ok) {
        const data = await response.json();
        setRecipients(data.recipients || []);
      }
    } catch (err) {
      setError('Failed to load email recipients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = async () => {
    try {
      const response = await fetch('/api/admin/email-recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchRecipients();
        setShowAddModal(false);
        setFormData({ email: '', name: '', role: 'admin' });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add recipient');
      }
    } catch (err) {
      alert('Error adding recipient');
    }
  };

  const handleUpdateRecipient = async (id: string, updates: Partial<EmailRecipient>) => {
    try {
      const response = await fetch('/api/admin/email-recipients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });

      if (response.ok) {
        await fetchRecipients();
      }
    } catch (err) {
      alert('Error updating recipient');
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipient?')) return;

    try {
      const response = await fetch(`/api/admin/email-recipients?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchRecipients();
      }
    } catch (err) {
      alert('Error deleting recipient');
    }
  };

  const fetchEmailHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch('/api/admin/email-history');
      if (response.ok) {
        const data = await response.json();
        setEmailHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load email history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchInbox = async () => {
    try {
      setLoadingInbox(true);
      setInboxError(null);
      const response = await fetch('/api/admin/mailbox');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load inbox');
      setInboxMessages(data.messages || []);
    } catch (err) {
      setInboxError(err instanceof Error ? err.message : 'Unable to load inbox');
    } finally {
      setLoadingInbox(false);
    }
  };

  const openInboxMessage = async (uid: number) => {
    setInboxError(null);
    try {
      const response = await fetch(`/api/admin/mailbox/${uid}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to open message');
      setSelectedInboxMessage(data.message);
      setInboxMessages(current =>
        current.map(message => message.uid === uid ? { ...message, unread: false } : message)
      );
    } catch (err) {
      setInboxError(err instanceof Error ? err.message : 'Unable to open message');
    }
  };

  const closeMailboxCompose = () => {
    setShowMailboxComposeModal(false);
    setMailboxTo('');
    setMailboxSubject('');
    setMailboxMessage('');
    setMailboxComposeError(null);
  };

  const handleReplyToInboxMessage = () => {
    const sender = selectedInboxMessage?.from.find(address => address.email);
    if (!selectedInboxMessage || !sender) return;
    setMailboxTo(sender.email);
    setMailboxSubject(/^re:/i.test(selectedInboxMessage.subject)
      ? selectedInboxMessage.subject
      : `Re: ${selectedInboxMessage.subject}`);
    setMailboxMessage(
      `\n\nOn ${new Date(selectedInboxMessage.date).toLocaleString()}, ${sender.email} wrote:\n` +
      selectedInboxMessage.body.split('\n').map(line => `> ${line}`).join('\n')
    );
    setMailboxComposeError(null);
    setShowMailboxComposeModal(true);
  };

  const handleSendMailboxEmail = async () => {
    setMailboxComposeError(null);
    setMailboxComposeSuccess(null);
    try {
      setSendingMailboxEmail(true);
      const response = await fetch('/api/admin/mailbox/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: mailboxTo,
          subject: mailboxSubject,
          message: mailboxMessage,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send email');
      setMailboxComposeSuccess(result.message || 'Email sent successfully.');
      closeMailboxCompose();
      await fetchEmailHistory();
    } catch (err) {
      setMailboxComposeError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSendingMailboxEmail(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter an email address');
      return;
    }

    try {
      setSendingTest(true);
      const response = await fetch('/api/admin/email-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail })
      });

      if (response.ok) {
        alert('Test email sent successfully!');
        setTestEmail('');
      } else {
        alert('Failed to send test email');
      }
    } catch (err) {
      alert('Error sending test email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendClientEmail = async () => {
    if (!emailSubject || !emailMessage) {
      alert('Please enter both subject and message');
      return;
    }

    const activeRecipients = recipients.filter(r => r.active && r.role !== 'admin');
    if (activeRecipients.length === 0) {
      alert('No active client recipients found. Please add client recipients first.');
      return;
    }

    if (!confirm(`Send email to ${activeRecipients.length} client(s)?`)) {
      return;
    }

    try {
      setSendingEmail(true);
      const response = await fetch('/api/admin/send-client-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
          recipients: activeRecipients.map(r => r.email)
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Email sent successfully to ${result.sentCount} recipient(s)!`);
        setShowSendEmailModal(false);
        setEmailSubject('');
        setEmailMessage('');
        fetchEmailHistory(); // Refresh history
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to send email');
      }
    } catch (err) {
      alert('Error sending email');
    } finally {
      setSendingEmail(false);
    }
  };

  const filteredRecipients = recipients.filter(recipient => {
    const query = recipientSearch.trim().toLowerCase();
    const matchesSearch = !query || [recipient.email, recipient.name || '', recipient.role]
      .some(value => value.toLowerCase().includes(query));
    const matchesStatus =
      recipientStatusFilter === 'all' ||
      (recipientStatusFilter === 'active' && recipient.active) ||
      (recipientStatusFilter === 'inactive' && !recipient.active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Email Management</h1>
          <p className="text-gray-400">Read your mailbox, compose messages, and manage notification recipients</p>
        </div>
        <Link
          href="/adminpanel"
          className="text-sm text-cyan-400 hover:text-cyan-300 underline"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Client broadcast */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-6 mb-6 border border-purple-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <FaUsers className="text-purple-400" />
              Client Broadcast
            </h2>
            <p className="text-sm text-gray-400">
              Send announcements to all active client recipients ({recipients.filter(r => r.active && r.role !== 'admin').length} clients)
            </p>
          </div>
          <Button size="lg"
            onClick={() => setShowSendEmailModal(true)}
          >
            <FaPaperPlane />
            Compose Broadcast
          </Button>
        </div>
      </div>

      {/* Test Email Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FaPaperPlane className="text-cyan-400" />
          Send Test Email
        </h2>
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email address..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <Button size="sm"
            onClick={handleSendTestEmail}
            disabled={sendingTest}
          >
            {sendingTest ? 'Sending...' : 'Send Test'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'inbox'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
            }`}
        >
          <FaInbox />
          Inbox
          {inboxMessages.filter(message => message.unread).length > 0 && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {inboxMessages.filter(message => message.unread).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('recipients')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'recipients'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
            }`}
        >
          <FaEnvelope />
          Recipients
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'history'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
            }`}
        >
          <FaHistory />
          Email History
        </button>
      </div>

      {activeTab === 'inbox' && (
        <section className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-700 px-5 py-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <FaInbox className="text-cyan-400" />
                Inbox
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {inboxMessages.length} recent message{inboxMessages.length === 1 ? '' : 's'}
                {' · '}{inboxMessages.filter(message => message.unread).length} unread
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setUnreadOnly(value => !value)}
                aria-pressed={unreadOnly}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${unreadOnly
                  ? 'border-cyan-500 bg-cyan-500/15 text-cyan-200'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                Unread
              </button>
              <button
                type="button"
                onClick={fetchInbox}
                disabled={loadingInbox}
                className="flex items-center gap-2 rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 disabled:opacity-50"
              >
                <FaSync className={loadingInbox ? 'animate-spin' : ''} />
                Refresh
              </button>
              <Button
                type="button"
                onClick={() => {
                  setMailboxComposeSuccess(null);
                  setShowMailboxComposeModal(true);
                }}
              >
                <FaPaperPlane />
                Compose
              </Button>
            </div>
          </div>

          {mailboxComposeSuccess && (
            <div role="status" className="border-b border-green-800 bg-green-900/20 px-5 py-3 text-sm text-green-200">
              {mailboxComposeSuccess}
            </div>
          )}
          {inboxError && (
            <div role="alert" className="border-b border-red-800 bg-red-900/20 px-5 py-3 text-sm text-red-200">
              {inboxError}
            </div>
          )}

          <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
            <div className="border-b border-gray-700 lg:border-b-0 lg:border-r">
              <label className="relative block border-b border-gray-700 p-3">
                <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="search"
                  value={inboxSearch}
                  onChange={event => setInboxSearch(event.target.value)}
                  placeholder="Search inbox"
                  className="w-full rounded-lg border border-gray-600 bg-gray-900 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-500"
                />
              </label>

              {loadingInbox && inboxMessages.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">Connecting to inbox…</div>
              ) : inboxMessages.length === 0 && !inboxError ? (
                <div className="p-6 text-center text-sm text-gray-400">Your inbox is empty.</div>
              ) : (
                <div className="max-h-[560px] overflow-y-auto">
                  {inboxMessages
                    .filter(message => !unreadOnly || message.unread)
                    .filter(message => {
                      const sender = message.from.map(address => `${address.name} ${address.email}`).join(' ');
                      return `${sender} ${message.subject}`.toLowerCase().includes(inboxSearch.toLowerCase());
                    })
                    .map(message => {
                      const sender = message.from[0];
                      const selected = selectedInboxMessage?.uid === message.uid;
                      return (
                        <button
                          key={message.uid}
                          type="button"
                          onClick={() => openInboxMessage(message.uid)}
                          aria-current={selected ? 'true' : undefined}
                          className={`block w-full border-b border-gray-700/80 p-4 text-left transition-colors ${selected
                            ? 'bg-cyan-950/50'
                            : 'hover:bg-gray-700/50'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className={`truncate text-sm ${message.unread ? 'font-semibold text-white' : 'text-gray-300'}`}>
                              {sender?.name || sender?.email || 'Unknown sender'}
                            </span>
                            <span className="shrink-0 text-xs text-gray-500">
                              {new Date(message.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`mt-1 truncate text-sm ${message.unread ? 'font-medium text-white' : 'text-gray-400'}`}>
                            {message.subject}
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">{sender?.email || ''}</p>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="min-w-0 bg-gray-900/40">
              {!selectedInboxMessage ? (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center p-8 text-center text-gray-500">
                  <FaEnvelope className="mb-3 text-3xl text-gray-600" />
                  <p>Select a message to read it.</p>
                </div>
              ) : (
                <article className="h-full">
                  <header className="border-b border-gray-700 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="break-words text-xl font-semibold text-white">{selectedInboxMessage.subject}</h3>
                        <p className="mt-2 text-sm text-gray-400">
                          From {selectedInboxMessage.from.map(address => address.name
                            ? `${address.name} <${address.email}>`
                            : address.email).join(', ')}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          To {selectedInboxMessage.to.map(address => address.email).join(', ')}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(selectedInboxMessage.date).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleReplyToInboxMessage}
                        disabled={!selectedInboxMessage.from.some(address => address.email)}
                        className="flex items-center gap-2 rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-200 transition-colors hover:bg-gray-700 disabled:opacity-50"
                      >
                        <FaReply />
                        Reply
                      </button>
                    </div>
                    {selectedInboxMessage.cc.length > 0 && (
                      <p className="mt-2 text-xs text-gray-500">
                        Cc {selectedInboxMessage.cc.map(address => address.email).join(', ')}
                      </p>
                    )}
                  </header>
                  <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words p-5 font-sans text-sm leading-7 text-gray-200">
                    {selectedInboxMessage.body || '(This message has no plain-text body.)'}
                  </pre>
                </article>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Recipients List */}
      {activeTab === 'recipients' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FaEnvelope className="text-cyan-400" />
              Email Recipients
            </h2>
            <Button
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus />
              Add Recipient
            </Button>
          </div>

          {!loading && !error && recipients.length > 0 && (
            <Filters
              className="mb-4"
              activeFilters={[
                ...(recipientSearch.trim()
                  ? [{ id: 'recipient-search', label: `Search: ${recipientSearch}`, onRemove: () => setRecipientSearch('') }]
                  : []),
                ...(recipientStatusFilter !== 'all'
                  ? [{ id: 'recipient-status', label: `Status: ${recipientStatusFilter}`, onRemove: () => setRecipientStatusFilter('all') }]
                  : []),
              ]}
            >
              <div className="relative min-w-[220px] flex-1">
                <FaSearch className="admin-panel-input-icon" aria-hidden="true" />
                <input
                  type="search"
                  value={recipientSearch}
                  onChange={event => setRecipientSearch(event.target.value)}
                  placeholder="Search email, name, or role..."
                  aria-label="Search email recipients"
                  className="w-full px-3 py-2"
                />
              </div>
              <select
                value={recipientStatusFilter}
                onChange={event => setRecipientStatusFilter(event.target.value as typeof recipientStatusFilter)}
                aria-label="Filter recipients by status"
                className="px-3 py-2"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Filters>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading recipients...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : recipients.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No recipients configured. Add one to get started.
            </div>
          ) : filteredRecipients.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No recipients match these filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50 border-b border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Added</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredRecipients.map((recipient) => (
                    <tr key={recipient.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-white">{recipient.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{recipient.name || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                          {recipient.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <label className="inline-flex items-center cursor-pointer">
                          <Checkbox
                            checked={recipient.active}
                            onChange={(e) => handleUpdateRecipient(recipient.id, { active: e.target.checked })}
                            className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                          />
                          <span className={`ml-2 text-xs font-medium ${recipient.active ? 'text-green-300' : 'text-red-300'}`}>
                            {recipient.active ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(recipient.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <button
                          onClick={() => handleDeleteRecipient(recipient.id)}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-medium transition-all"
                        >
                          <FaTrash className="inline mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Email History Tab */}
      {activeTab === 'history' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FaHistory className="text-cyan-400" />
            Email History
          </h2>

          {loadingHistory ? (
            <div className="text-center py-8 text-gray-400">Loading history...</div>
          ) : emailHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No emails sent yet. Send your first email to clients to see history here.
            </div>
          ) : (
            <div className="space-y-4">
              {emailHistory.map((record) => (
                <div
                  key={record.id}
                  className="bg-gray-700/30 rounded-lg border border-gray-600/50 hover:border-gray-500/50 transition-colors overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{record.subject}</h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{record.message}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'sent'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                          }`}
                      >
                        {record.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
                      <span className="flex items-center gap-1">
                        <FaUsers className="text-purple-400" />
                        {record.recipientCount} recipient{record.recipientCount !== 1 ? 's' : ''}
                      </span>
                      <span>Sent by: {record.sentBy}</span>
                      <span>{new Date(record.sentAt).toLocaleString()}</span>
                    </div>

                    {/* View Recipients Button */}
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-3"
                      onClick={() => setExpandedEmailId(expandedEmailId === record.id ? null : record.id)}
                    >
                      {expandedEmailId === record.id ? <FaChevronUp /> : <FaChevronDown />}
                      {expandedEmailId === record.id ? 'Hide' : 'View'} Recipients
                    </Button>
                  </div>

                  {/* Expandable Recipients List */}
                  {expandedEmailId === record.id && (
                    <div className="bg-gray-800/50 border-t border-gray-600/50 p-4">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <FaEnvelope className="text-cyan-400" />
                        Email Recipients ({record.recipients?.length || 0})
                      </h4>

                      {/* Successful Recipients */}
                      {record.recipients && record.recipients.length > 0 && (
                        <div className="mb-4">
                          <p className="text-green-300 text-sm font-medium mb-2 flex items-center gap-2">
                            <FaCheckCircle />
                            Successfully Sent ({record.recipients.length - (record.failedRecipients?.length || 0)})
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {record.recipients
                              .filter(email => !record.failedRecipients?.includes(email))
                              .map((email, idx) => (
                                <div
                                  key={idx}
                                  className="bg-gray-700/50 px-3 py-2 rounded text-sm text-gray-300 flex items-center gap-2"
                                >
                                  <FaCheckCircle className="text-green-400 text-xs" />
                                  {email}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Failed Recipients */}
                      {record.failedRecipients && record.failedRecipients.length > 0 && (
                        <div>
                          <p className="text-red-300 text-sm font-medium mb-2 flex items-center gap-2">
                            <FaTimesCircle />
                            Failed to Send ({record.failedRecipients.length})
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {record.failedRecipients.map((email, idx) => (
                              <div
                                key={idx}
                                className="bg-red-900/20 border border-red-700/50 px-3 py-2 rounded text-sm text-red-300 flex items-center gap-2"
                              >
                                <FaTimesCircle className="text-red-400 text-xs" />
                                {email}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Send Client Email Modal */}
      {showSendEmailModal && (
        <Dialog
          open={showSendEmailModal}
          onClose={() => {
            setShowSendEmailModal(false);
            setEmailSubject('');
            setEmailMessage('');
          }}
          title="Compose Email to Clients"
        >
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaPaperPlane className="text-purple-400" />
              Compose Email to Clients
            </h3>

            <div className="space-y-4">
              <Field id="broadcast-subject" label="Subject" required>
                <input
                  id="broadcast-subject"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </Field>

              <Field id="broadcast-message" label="Message" required>
                <div className="flex justify-end">
                  <EmojiPicker onSelect={emoji => insertEmoji(emailMessageRef.current, setEmailMessage, emoji)} />
                </div>
                <textarea
                  id="broadcast-message"
                  ref={emailMessageRef}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={8}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </Field>

              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-3">
                <p className="text-sm text-gray-300">
                  <strong className="text-purple-400">Recipients:</strong> This email will be sent to{' '}
                  <strong>{recipients.filter(r => r.active && r.role !== 'admin').length}</strong> active client(s)
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowSendEmailModal(false);
                  setEmailSubject('');
                  setEmailMessage('');
                }}
              >
                Cancel
              </Button>
              <Button className="flex-1"
                onClick={handleSendClientEmail}
                disabled={sendingEmail || !emailSubject || !emailMessage}
              >
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Compose individual mailbox email */}
      {showMailboxComposeModal && (
        <Dialog
          open={showMailboxComposeModal}
          onClose={() => {
            if (!sendingMailboxEmail) closeMailboxCompose();
          }}
          title="Compose Email"
          maxWidth="max-w-2xl"
        >
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-2xl">
            <h3 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
              <FaPaperPlane className="text-cyan-400" />
              Compose Email
            </h3>
            <div className="space-y-4">
              <Field id="mailbox-to" label="To">
                <input
                  id="mailbox-to"
                  type="email"
                  value={mailboxTo}
                  onChange={event => setMailboxTo(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
              </Field>
              <Field id="mailbox-subject" label="Subject">
                <input
                  id="mailbox-subject"
                  type="text"
                  maxLength={200}
                  value={mailboxSubject}
                  onChange={event => setMailboxSubject(event.target.value)}
                  placeholder="Subject"
                  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
              </Field>
              <Field id="mailbox-message" label="Message">
                <div className="flex justify-end">
                  <EmojiPicker onSelect={emoji => insertEmoji(mailboxMessageRef.current, setMailboxMessage, emoji)} />
                </div>
                <textarea
                  ref={mailboxMessageRef}
                  id="mailbox-message"
                  rows={10}
                  maxLength={50000}
                  value={mailboxMessage}
                  onChange={event => setMailboxMessage(event.target.value)}
                  placeholder="Write your email…"
                  className="w-full resize-y rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
              </Field>
              {mailboxComposeError && (
                <p role="alert" className="text-sm text-red-300">{mailboxComposeError}</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={closeMailboxCompose}
                disabled={sendingMailboxEmail}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendMailboxEmail}
                disabled={sendingMailboxEmail || !mailboxTo || !mailboxSubject.trim() || !mailboxMessage.trim()}
              >
                <FaPaperPlane />
                {sendingMailboxEmail ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Add Recipient Modal */}
      {showAddModal && (
        <Dialog
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setFormData({ email: '', name: '', role: 'admin' });
          }}
          title="Add Email Recipient"
          maxWidth="max-w-lg"
        >
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Add Email Recipient</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name (Optional)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="admin">Admin (won't receive client emails)</option>
                  <option value="client">Client (receives announcements)</option>
                  <option value="moderator">Moderator</option>
                  <option value="support">Support</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ email: '', name: '', role: 'admin' });
                }}
              >
                Cancel
              </Button>
              <Button className="flex-1"
                onClick={handleAddRecipient}
                disabled={!formData.email}
              >
                Add Recipient
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
