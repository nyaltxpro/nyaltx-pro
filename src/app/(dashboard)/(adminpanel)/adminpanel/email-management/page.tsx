'use client';

import Link from 'next/link';
import { Dialog } from '@/components/reui/dialog';
import { Checkbox } from '@/components/reui/checkbox';
import { Card } from '@/components/reui/card';
import { Button } from '@/components/reui/button';
import { Badge } from '@/components/reui/badge';
import { EmojiPicker } from '@/components/reui/emoji-picker';
import { Field } from '@/components/reui/field';
import { Filters } from '@/components/reui/filters';
import { paginateItems, TablePagination } from '@/components/reui/table-pagination';
import { Alert } from '@/components/reui/alert';
import { useConfirmDialog } from '@/components/reui/confirm-dialog';
import { Input } from '@/components/reui/input';
import { NativeSelect } from '@/components/reui/native-select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import toast from 'react-hot-toast';
import {
  CircleX,
  History,
  Inbox,
  Mail,
  Plus,
  RefreshCw,
  Reply,
  Send,
  Trash2,
  Users,
} from 'lucide-react';

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

function getInitials(name?: string, email?: string) {
  const source = (name?.trim() || email?.split('@')[0] || 'User').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2)).toUpperCase();
}

export default function EmailManagementPage() {
  const { confirm, dialog: confirmationDialog } = useConfirmDialog();
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientStatusFilter, setRecipientStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all'
  );
  const [recipientPage, setRecipientPage] = useState(1);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [bulkRecipientBusy, setBulkRecipientBusy] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'admin',
  });

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
  const [inboxPage, setInboxPage] = useState(1);
  const [selectedInboxUids, setSelectedInboxUids] = useState<number[]>([]);
  const [showMailboxComposeModal, setShowMailboxComposeModal] = useState(false);
  const [mailboxTo, setMailboxTo] = useState('');
  const [mailboxSubject, setMailboxSubject] = useState('');
  const [mailboxMessage, setMailboxMessage] = useState('');
  const mailboxMessageRef = useRef<HTMLTextAreaElement>(null);
  const [sendingMailboxEmail, setSendingMailboxEmail] = useState(false);
  const [mailboxComposeError, setMailboxComposeError] = useState<string | null>(null);

  // Email history state
  const [emailHistory, setEmailHistory] = useState<EmailRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'recipients' | 'history'>('inbox');
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'sent' | 'failed'>('all');
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [recipientRoleFilter, setRecipientRoleFilter] = useState('all');

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
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchRecipients();
        setShowAddModal(false);
        setFormData({ email: '', name: '', role: 'admin' });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add recipient');
      }
    } catch (err) {
      toast.error('Error adding recipient');
    }
  };

  const handleUpdateRecipient = async (id: string, updates: Partial<EmailRecipient>) => {
    try {
      const response = await fetch('/api/admin/email-recipients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      if (response.ok) {
        await fetchRecipients();
      }
    } catch (err) {
      toast.error('Error updating recipient');
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    if (
      !(await confirm({
        title: 'Delete recipient?',
        description: 'This will remove the recipient from email lists.',
        confirmLabel: 'Delete recipient',
        destructive: true,
      }))
    )
      return;

    try {
      const response = await fetch(`/api/admin/email-recipients?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRecipients();
        setSelectedRecipientIds(current => current.filter(selectedId => selectedId !== id));
      }
    } catch (err) {
      toast.error('Error deleting recipient');
    }
  };

  const handleBulkRecipientUpdate = async (active: boolean) => {
    if (selectedRecipientIds.length === 0) return;
    setBulkRecipientBusy(true);
    try {
      await Promise.all(
        selectedRecipientIds.map(id =>
          fetch('/api/admin/email-recipients', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, active }),
          })
        )
      );
      await fetchRecipients();
      setSelectedRecipientIds([]);
    } catch (err) {
      toast.error('Error updating selected recipients');
    } finally {
      setBulkRecipientBusy(false);
    }
  };

  const handleBulkRecipientDelete = async () => {
    if (selectedRecipientIds.length === 0) return;
    if (
      !(await confirm({
        title: 'Delete selected recipients?',
        description: `Delete ${selectedRecipientIds.length} selected recipient${selectedRecipientIds.length === 1 ? '' : 's'}?`,
        confirmLabel: 'Delete recipients',
        destructive: true,
      }))
    )
      return;

    setBulkRecipientBusy(true);
    try {
      await Promise.all(
        selectedRecipientIds.map(id =>
          fetch(`/api/admin/email-recipients?id=${id}`, { method: 'DELETE' })
        )
      );
      await fetchRecipients();
      setSelectedRecipientIds([]);
    } catch (err) {
      toast.error('Error deleting selected recipients');
    } finally {
      setBulkRecipientBusy(false);
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
        current.map(message => (message.uid === uid ? { ...message, unread: false } : message))
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
    setMailboxSubject(
      /^re:/i.test(selectedInboxMessage.subject)
        ? selectedInboxMessage.subject
        : `Re: ${selectedInboxMessage.subject}`
    );
    setMailboxMessage(
      `\n\nOn ${new Date(selectedInboxMessage.date).toLocaleString()}, ${sender.email} wrote:\n` +
        selectedInboxMessage.body
          .split('\n')
          .map(line => `> ${line}`)
          .join('\n')
    );
    setMailboxComposeError(null);
    setShowMailboxComposeModal(true);
  };

  const handleSendMailboxEmail = async () => {
    setMailboxComposeError(null);
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
      toast.success(result.message || 'Email sent successfully.');
      closeMailboxCompose();
      await fetchEmailHistory();
    } catch (err) {
      setMailboxComposeError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSendingMailboxEmail(false);
    }
  };

  const handleSendClientEmail = async () => {
    if (!emailSubject || !emailMessage) {
      toast.error('Please enter both subject and message');
      return;
    }

    const activeRecipients = recipients.filter(r => r.active && r.role !== 'admin');
    if (activeRecipients.length === 0) {
      toast.error('No active client recipients found. Please add client recipients first.');
      return;
    }

    if (
      !(await confirm({
        title: 'Send client email?',
        description: `Send this email to ${activeRecipients.length} active client${activeRecipients.length === 1 ? '' : 's'}?`,
        confirmLabel: 'Send email',
      }))
    )
      return;

    try {
      setSendingEmail(true);
      const response = await fetch('/api/admin/send-client-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
          recipients: activeRecipients.map(r => r.email),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Email sent successfully to ${result.sentCount} recipient(s)!`);
        setShowSendEmailModal(false);
        setEmailSubject('');
        setEmailMessage('');
        fetchEmailHistory(); // Refresh history
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send email');
      }
    } catch (err) {
      toast.error('Error sending email');
    } finally {
      setSendingEmail(false);
    }
  };

  const filteredRecipients = recipients.filter(recipient => {
    const query = recipientSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [recipient.email, recipient.name || '', recipient.role].some(value =>
        value.toLowerCase().includes(query)
      );
    const matchesStatus =
      recipientStatusFilter === 'all' ||
      (recipientStatusFilter === 'active' && recipient.active) ||
      (recipientStatusFilter === 'inactive' && !recipient.active);
    const matchesRole = recipientRoleFilter === 'all' || recipient.role === recipientRoleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });
  const paginatedRecipients = paginateItems(filteredRecipients, recipientPage, 10);
  const filteredInboxMessages = inboxMessages
    .filter(message => !unreadOnly || message.unread)
    .filter(message => {
      const sender = message.from.map(address => `${address.name} ${address.email}`).join(' ');
      return `${sender} ${message.subject} ${message.to.join(' ')}`
        .toLowerCase()
        .includes(inboxSearch.trim().toLowerCase());
    });
  const paginatedInboxMessages = paginateItems(filteredInboxMessages, inboxPage, 10);
  const filteredEmailHistory = emailHistory.filter(record => {
    const query = historySearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [record.subject, record.message, record.sentBy, ...record.recipients].some(value =>
        value.toLowerCase().includes(query)
      );
    const matchesStatus = historyStatusFilter === 'all' || record.status === historyStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const paginatedEmailHistory = paginateItems(filteredEmailHistory, historyPage, 10);
  const selectedHistoryRecord =
    emailHistory.find(record => record.id === selectedHistoryId) ?? null;

  return (
    <div className="admin-panel-form mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Email Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your inbox, email recipients, and outbound messages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/adminpanel">Back to dashboard</Link>
          </Button>
          <Button onClick={() => setShowSendEmailModal(true)}>
            <Send aria-hidden="true" className="size-4" />
            Compose broadcast
          </Button>
        </div>
      </header>

      <Card className="w-fit max-w-full overflow-hidden p-2">
        <div
          role="tablist"
          aria-label="Email management sections"
          className="flex flex-nowrap gap-2 overflow-x-auto"
        >
          {(
            [
              { id: 'inbox', label: 'Inbox', icon: Inbox },
              { id: 'recipients', label: 'Recipients', icon: Users },
              { id: 'history', label: 'Email history', icon: History },
            ] as const
          ).map(tab => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                id={`email-tab-${tab.id}`}
                role="tab"
                aria-selected={selected}
                aria-controls={`email-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className="h-auto shrink-0 gap-0 rounded-md p-0 hover:bg-transparent"
              >
                <Badge
                  variant={selected ? 'primary-light' : 'outline'}
                  size="sm"
                  className="gap-1.5"
                >
                  <Icon aria-hidden="true" className="size-3" />
                  {tab.label}
                </Badge>
              </Button>
            );
          })}
        </div>
      </Card>

      {activeTab === 'inbox' && (
        <section
          id="email-panel-inbox"
          role="tabpanel"
          aria-labelledby="email-tab-inbox"
          className="overflow-hidden border border-white/10 bg-[#0d141b]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-700 px-5 py-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <Inbox aria-hidden="true" className="size-5 text-cyan-400" />
                Inbox
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {inboxMessages.length} recent message{inboxMessages.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={unreadOnly ? 'default' : 'outline'}
                onClick={() => {
                  setUnreadOnly(value => !value);
                  setInboxPage(1);
                }}
                aria-pressed={unreadOnly}
              >
                {unreadOnly ? 'Unread only' : 'All messages'}
              </Button>
              <Button type="button" variant="outline" onClick={fetchInbox} disabled={loadingInbox}>
                <RefreshCw
                  aria-hidden="true"
                  className={`size-4 ${loadingInbox ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button type="button" onClick={() => setShowMailboxComposeModal(true)}>
                <Send aria-hidden="true" className="size-4" />
                Compose
              </Button>
            </div>
          </div>

          {inboxError && (
            <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
              {inboxError}
            </Alert>
          )}

          <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
            <div className="border-b border-gray-700 lg:border-b-0 lg:border-r">
              <div className="border-b border-gray-700 p-3">
                <Input
                  type="search"
                  value={inboxSearch}
                  onChange={event => {
                    setInboxSearch(event.target.value);
                    setInboxPage(1);
                  }}
                  placeholder="Search inbox"
                  aria-label="Search inbox"
                />
                {(inboxSearch.trim() || unreadOnly) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {inboxSearch.trim() && (
                      <button
                        type="button"
                        onClick={() => setInboxSearch('')}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10"
                      >
                        <span className="truncate">Search: {inboxSearch}</span>
                        <CircleX aria-hidden="true" className="size-3 shrink-0" />
                      </button>
                    )}
                    {unreadOnly && (
                      <button
                        type="button"
                        onClick={() => setUnreadOnly(false)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10"
                      >
                        Unread only
                        <CircleX aria-hidden="true" className="size-3 shrink-0" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {loadingInbox && inboxMessages.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">Connecting to inbox…</div>
              ) : inboxMessages.length === 0 && !inboxError ? (
                <div className="p-6 text-center text-sm text-gray-400">Your inbox is empty.</div>
              ) : (
                <div>
                  {selectedInboxUids.length > 0 && (
                    <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-cyan-500/30 bg-cyan-950/95 px-3 py-2">
                      <span className="mr-auto text-xs font-medium text-cyan-100">
                        {selectedInboxUids.length} selected
                      </span>
                      <button
                        type="button"
                        className="rounded-md border border-cyan-500/30 px-2 py-1 text-xs text-cyan-200 hover:bg-cyan-900/50"
                        onClick={async () => {
                          await Promise.all(
                            selectedInboxUids.map(async uid => {
                              const response = await fetch(`/api/admin/mailbox/${uid}`);
                              if (response.ok) {
                                await response.json();
                              }
                            })
                          );
                          setInboxMessages(current =>
                            current.map(message =>
                              selectedInboxUids.includes(message.uid)
                                ? { ...message, unread: false }
                                : message
                            )
                          );
                          setSelectedInboxUids([]);
                        }}
                      >
                        Mark read
                      </button>
                      <button
                        type="button"
                        className="text-xs text-gray-400 hover:text-white"
                        onClick={() => setSelectedInboxUids([])}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3 border-b border-gray-700 px-4 py-2">
                    {(() => {
                      const visibleInboxMessages = paginatedInboxMessages;
                      return (
                        <Checkbox
                          aria-label="Select all inbox messages"
                          checked={
                            visibleInboxMessages.length > 0 &&
                            visibleInboxMessages.every(message =>
                              selectedInboxUids.includes(message.uid)
                            )
                          }
                          onChange={event =>
                            setSelectedInboxUids(current =>
                              event.target.checked
                                ? Array.from(
                                    new Set([
                                      ...current,
                                      ...visibleInboxMessages.map(message => message.uid),
                                    ])
                                  )
                                : current.filter(
                                    uid =>
                                      !visibleInboxMessages.some(message => message.uid === uid)
                                  )
                            )
                          }
                        />
                      );
                    })()}
                    <span className="text-xs text-gray-500">Select all</span>
                  </div>
                  {paginatedInboxMessages.map(message => {
                    const sender = message.from[0];
                    const selected = selectedInboxMessage?.uid === message.uid;
                    return (
                      <div
                        key={message.uid}
                        className={`flex items-start gap-3 border-b border-gray-700/80 p-2.5 transition-colors ${
                          selected ? 'bg-cyan-950/50' : 'hover:bg-gray-700/50'
                        }`}
                      >
                        <Checkbox
                          className="mt-1"
                          aria-label={`Select email from ${sender?.name || sender?.email || 'unknown sender'}`}
                          checked={selectedInboxUids.includes(message.uid)}
                          onChange={event =>
                            setSelectedInboxUids(current =>
                              event.target.checked
                                ? [...current, message.uid]
                                : current.filter(uid => uid !== message.uid)
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => openInboxMessage(message.uid)}
                          aria-current={selected ? 'true' : undefined}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar size="sm">
                              <AvatarFallback className="bg-slate-700 text-xs text-slate-200">
                                {getInitials(sender?.name, sender?.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <span
                                  className={`truncate text-xs ${message.unread ? 'font-semibold text-white' : 'text-gray-300'}`}
                                >
                                  {sender?.name || sender?.email || 'Unknown sender'}
                                </span>
                                <span className="shrink-0 text-[11px] text-gray-500">
                                  {new Date(message.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p
                                className={`mt-1 truncate text-xs ${message.unread ? 'font-medium text-white' : 'text-gray-400'}`}
                              >
                                {message.subject}
                              </p>
                              <p className="mt-1 truncate text-xs text-gray-500">
                                {sender?.email || ''}
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                  {filteredInboxMessages.length === 0 && (
                    <p className="px-4 py-8 text-center text-sm text-gray-500">
                      No messages match these filters.
                    </p>
                  )}
                  <TablePagination
                    page={inboxPage}
                    pageSize={10}
                    total={filteredInboxMessages.length}
                    onPageChange={setInboxPage}
                  />
                </div>
              )}
            </div>

            <div className="min-w-0 bg-gray-900/40">
              {!selectedInboxMessage ? (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center p-8 text-center text-gray-500">
                  <Mail aria-hidden="true" className="mb-3 size-8 text-gray-600" />
                  <p>Select a message to read it.</p>
                </div>
              ) : (
                <article className="h-full">
                  <header className="border-b border-gray-700 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="break-words text-xl font-semibold text-white">
                          {selectedInboxMessage.subject}
                        </h3>
                        {selectedInboxMessage.from.map(address => (
                          <div key={address.email} className="mt-3 flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-cyan-950 text-cyan-200">
                                {getInitials(address.name, address.email)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm text-gray-300">
                              From{' '}
                              {address.name ? `${address.name} <${address.email}>` : address.email}
                            </p>
                          </div>
                        ))}
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
                        <Reply aria-hidden="true" className="size-4" />
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

      {activeTab === 'recipients' && (
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <Mail aria-hidden="true" className="size-5 text-cyan-400" />
              Email Recipients
            </h2>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus aria-hidden="true" className="size-4" />
              Add Recipient
            </Button>
          </div>

          <Filters
            className="mb-4"
            activeFilters={[
              ...(recipientSearch.trim()
                ? [
                    {
                      id: 'recipient-search',
                      label: `Search: ${recipientSearch}`,
                      onRemove: () => setRecipientSearch(''),
                    },
                  ]
                : []),
              ...(recipientStatusFilter !== 'all'
                ? [
                    {
                      id: 'recipient-status',
                      label: `Status: ${recipientStatusFilter}`,
                      onRemove: () => setRecipientStatusFilter('all'),
                    },
                  ]
                : []),
              ...(recipientRoleFilter !== 'all'
                ? [
                    {
                      id: 'recipient-role',
                      label: `Role: ${recipientRoleFilter}`,
                      onRemove: () => setRecipientRoleFilter('all'),
                    },
                  ]
                : []),
            ]}
          >
            <Input
              type="search"
              value={recipientSearch}
              onChange={event => {
                setRecipientSearch(event.target.value);
                setRecipientPage(1);
              }}
              placeholder="Search email, name, or role..."
              aria-label="Search email recipients"
              className="min-w-[220px] flex-1"
            />
            <NativeSelect
              value={recipientStatusFilter}
              onChange={event => {
                setRecipientStatusFilter(event.target.value as typeof recipientStatusFilter);
                setRecipientPage(1);
              }}
              aria-label="Filter recipients by status"
              className="sm:w-44"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </NativeSelect>
            <NativeSelect
              value={recipientRoleFilter}
              onChange={event => {
                setRecipientRoleFilter(event.target.value);
                setRecipientPage(1);
              }}
              aria-label="Filter recipients by role"
              className="sm:w-44"
            >
              <option value="all">All roles</option>
              {Array.from(new Set(recipients.map(recipient => recipient.role)))
                .sort()
                .map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
            </NativeSelect>
          </Filters>

          {!loading && !error && (
            <>
              {selectedRecipientIds.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-4 py-3">
                  <span className="mr-auto text-sm font-medium text-cyan-100">
                    {selectedRecipientIds.length} selected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={bulkRecipientBusy}
                    onClick={() => handleBulkRecipientUpdate(true)}
                  >
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={bulkRecipientBusy}
                    onClick={() => handleBulkRecipientUpdate(false)}
                  >
                    Deactivate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={bulkRecipientBusy}
                    onClick={handleBulkRecipientDelete}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    Delete
                  </Button>
                  <button
                    type="button"
                    className="text-xs text-gray-400 hover:text-white"
                    onClick={() => setSelectedRecipientIds([])}
                  >
                    Clear
                  </button>
                </div>
              )}
            </>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading recipients...</div>
          ) : error ? (
            <Alert variant="destructive" className="my-4">
              {error}
            </Alert>
          ) : recipients.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No recipients configured. Add one to get started.
            </div>
          ) : filteredRecipients.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No recipients match these filters.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.03]">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <Checkbox
                          aria-label="Select all visible recipients"
                          checked={
                            paginatedRecipients.length > 0 &&
                            paginatedRecipients.every(recipient =>
                              selectedRecipientIds.includes(recipient.id)
                            )
                          }
                          onChange={event =>
                            setSelectedRecipientIds(current =>
                              event.target.checked
                                ? Array.from(
                                    new Set([
                                      ...current,
                                      ...paginatedRecipients.map(recipient => recipient.id),
                                    ])
                                  )
                                : current.filter(
                                    id =>
                                      !paginatedRecipients.some(recipient => recipient.id === id)
                                  )
                            )
                          }
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                        Added
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedRecipients.map(recipient => (
                      <tr key={recipient.id} className="transition-colors hover:bg-white/[0.03]">
                        <td className="px-4 py-3">
                          <Checkbox
                            aria-label={`Select ${recipient.name || recipient.email}`}
                            checked={selectedRecipientIds.includes(recipient.id)}
                            onChange={event =>
                              setSelectedRecipientIds(current =>
                                event.target.checked
                                  ? [...current, recipient.id]
                                  : current.filter(id => id !== recipient.id)
                              )
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-white">
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback className="bg-slate-800 text-xs text-slate-200">
                                {getInitials(recipient.name, recipient.email)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{recipient.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{recipient.name || '-'}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{recipient.role}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <label className="inline-flex cursor-pointer items-center gap-2">
                            <Checkbox
                              checked={recipient.active}
                              onChange={event =>
                                handleUpdateRecipient(recipient.id, {
                                  active: event.target.checked,
                                })
                              }
                            />
                            <Badge variant={recipient.active ? 'success-light' : 'secondary'}>
                              {recipient.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </label>
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(recipient.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteRecipient(recipient.id)}
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                page={recipientPage}
                pageSize={10}
                total={filteredRecipients.length}
                onPageChange={setRecipientPage}
              />
            </>
          )}
        </Card>
      )}

      {activeTab === 'history' && (
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <History aria-hidden="true" className="size-5 text-cyan-400" />
              Email History
            </h2>
          </div>

          <Filters
            className="mb-4"
            activeFilters={[
              ...(historySearch.trim()
                ? [
                    {
                      id: 'history-search',
                      label: `Search: ${historySearch}`,
                      onRemove: () => setHistorySearch(''),
                    },
                  ]
                : []),
              ...(historyStatusFilter !== 'all'
                ? [
                    {
                      id: 'history-status',
                      label: `Status: ${historyStatusFilter}`,
                      onRemove: () => setHistoryStatusFilter('all'),
                    },
                  ]
                : []),
            ]}
          >
            <Input
              type="search"
              value={historySearch}
              onChange={event => {
                setHistorySearch(event.target.value);
                setHistoryPage(1);
              }}
              placeholder="Search subject, sender, or recipient"
              aria-label="Search email history"
              className="min-w-[220px] flex-1"
            />
            <NativeSelect
              value={historyStatusFilter}
              onChange={event => {
                setHistoryStatusFilter(event.target.value as typeof historyStatusFilter);
                setHistoryPage(1);
              }}
              aria-label="Filter email history by status"
              className="sm:w-44"
            >
              <option value="all">All statuses</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </NativeSelect>
          </Filters>

          {loadingHistory ? (
            <div className="text-center py-8 text-gray-400">Loading history...</div>
          ) : emailHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No emails sent yet. Send your first email to clients to see history here.
            </div>
          ) : filteredEmailHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No emails match these filters.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.03]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                        Recipients
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                        Sent by
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-400">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedEmailHistory.map(record => (
                      <tr key={record.id} className="hover:bg-white/[0.03]">
                        <td className="max-w-[360px] px-4 py-3">
                          <p className="truncate font-medium text-white">{record.subject}</p>
                          <p className="mt-1 truncate text-xs text-gray-400">{record.message}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{record.recipientCount}</td>
                        <td className="px-4 py-3 text-gray-300">{record.sentBy}</td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(record.sentAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              record.status === 'sent' ? 'success-light' : 'destructive-light'
                            }
                          >
                            {record.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedHistoryId(record.id)}
                          >
                            View details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                page={historyPage}
                pageSize={10}
                total={filteredEmailHistory.length}
                onPageChange={setHistoryPage}
              />
            </>
          )}
        </Card>
      )}

      {selectedHistoryRecord && (
        <Dialog
          open
          onClose={() => setSelectedHistoryId(null)}
          title="Email details"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedHistoryRecord.subject}</h3>
              <p className="mt-1 text-sm text-gray-400">
                Sent by {selectedHistoryRecord.sentBy} ·{' '}
                {new Date(selectedHistoryRecord.sentAt).toLocaleString()}
              </p>
            </div>
            <Badge
              variant={
                selectedHistoryRecord.status === 'sent' ? 'success-light' : 'destructive-light'
              }
            >
              {selectedHistoryRecord.status}
            </Badge>
            <div className="max-h-52 overflow-y-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-200">
              {selectedHistoryRecord.message}
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-white">
                Recipients ({selectedHistoryRecord.recipients.length})
              </h4>
              <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                {selectedHistoryRecord.recipients.map(email => {
                  const failed = selectedHistoryRecord.failedRecipients?.includes(email) ?? false;
                  return (
                    <Badge key={email} variant={failed ? 'destructive-light' : 'secondary'}>
                      {failed && <CircleX aria-hidden="true" className="size-3" />}
                      {email}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </Dialog>
      )}

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
          <div className="w-full rounded-xl border border-white/10 bg-[#0d141b] p-6 shadow-2xl">
            <h3 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
              <Send aria-hidden="true" className="size-5 text-cyan-400" />
              Compose Email to Clients
            </h3>

            <div className="space-y-4">
              <Field id="broadcast-subject" label="Subject" required>
                <Input
                  id="broadcast-subject"
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  required
                />
              </Field>

              <Field id="broadcast-message" label="Message" required>
                <div className="flex justify-end">
                  <EmojiPicker
                    onSelect={emoji => insertEmoji(emailMessageRef.current, setEmailMessage, emoji)}
                  />
                </div>
                <textarea
                  id="broadcast-message"
                  ref={emailMessageRef}
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={8}
                  className="w-full resize-y rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-3 focus:ring-cyan-400/10"
                  required
                />
              </Field>

              <Alert variant="info">
                <p className="text-sm text-gray-300">
                  <strong>Recipients:</strong> This email will be sent to{' '}
                  <strong>{recipients.filter(r => r.active && r.role !== 'admin').length}</strong>{' '}
                  active client(s)
                </p>
              </Alert>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSendEmailModal(false);
                  setEmailSubject('');
                  setEmailMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
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
          <div className="rounded-xl border border-white/10 bg-[#0d141b] p-6 shadow-2xl">
            <h3 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
              <Send aria-hidden="true" className="size-5 text-cyan-400" />
              Compose Email
            </h3>
            <div className="space-y-4">
              <Field id="mailbox-to" label="To">
                <Input
                  id="mailbox-to"
                  type="email"
                  value={mailboxTo}
                  onChange={event => setMailboxTo(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </Field>
              <Field id="mailbox-subject" label="Subject">
                <Input
                  id="mailbox-subject"
                  type="text"
                  maxLength={200}
                  value={mailboxSubject}
                  onChange={event => setMailboxSubject(event.target.value)}
                  placeholder="Subject"
                />
              </Field>
              <Field id="mailbox-message" label="Message">
                <div className="flex justify-end">
                  <EmojiPicker
                    onSelect={emoji =>
                      insertEmoji(mailboxMessageRef.current, setMailboxMessage, emoji)
                    }
                  />
                </div>
                <textarea
                  ref={mailboxMessageRef}
                  id="mailbox-message"
                  rows={10}
                  maxLength={50000}
                  value={mailboxMessage}
                  onChange={event => setMailboxMessage(event.target.value)}
                  placeholder="Write your email…"
                  className="w-full resize-y rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-3 focus:ring-cyan-400/10"
                />
              </Field>
              {mailboxComposeError && <Alert variant="destructive">{mailboxComposeError}</Alert>}
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
                disabled={
                  sendingMailboxEmail ||
                  !mailboxTo ||
                  !mailboxSubject.trim() ||
                  !mailboxMessage.trim()
                }
              >
                <Send aria-hidden="true" className="size-4" />
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
          <div className="w-full rounded-xl border border-white/10 bg-[#0d141b] p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Add Email Recipient</h3>

            <div className="space-y-4">
              <Field id="recipient-email" label="Email address" required>
                <Input
                  id="recipient-email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                  required
                />
              </Field>

              <Field id="recipient-name" label="Name (optional)">
                <Input
                  id="recipient-name"
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </Field>

              <Field id="recipient-role" label="Role">
                <NativeSelect
                  id="recipient-role"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin (won't receive client emails)</option>
                  <option value="client">Client (receives announcements)</option>
                  <option value="moderator">Moderator</option>
                  <option value="support">Support</option>
                </NativeSelect>
              </Field>
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
              <Button className="flex-1" onClick={handleAddRecipient} disabled={!formData.email}>
                Add Recipient
              </Button>
            </div>
          </div>
        </Dialog>
      )}
      {confirmationDialog}
    </div>
  );
}
