'use client';

import { useState, useEffect } from 'react';
import { FaEnvelope, FaPaperPlane, FaTrash, FaPlus, FaEdit, FaHistory, FaUsers, FaChevronDown, FaChevronUp, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Link from 'next/link';

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

export default function EmailManagementPage() {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<EmailRecipient | null>(null);
  
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
  const [sendingEmail, setSendingEmail] = useState(false);

  // Email history state
  const [emailHistory, setEmailHistory] = useState<EmailRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'recipients' | 'history'>('recipients');
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipients();
    fetchEmailHistory();
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Email Management</h1>
          <p className="text-gray-400">Manage admin email recipients and notifications</p>
        </div>
        <Link 
          href="/admin" 
          className="text-sm text-cyan-400 hover:text-cyan-300 underline"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Send Email to Clients Section */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-6 mb-6 border border-purple-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <FaUsers className="text-purple-400" />
              Send Email to Clients
            </h2>
            <p className="text-sm text-gray-400">
              Send announcements to all active client recipients ({recipients.filter(r => r.active && r.role !== 'admin').length} clients)
            </p>
          </div>
          <button
            onClick={() => setShowSendEmailModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all shadow-lg"
          >
            <FaPaperPlane />
            Compose Email
          </button>
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
          <button
            onClick={handleSendTestEmail}
            disabled={sendingTest}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingTest ? 'Sending...' : 'Send Test'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('recipients')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'recipients'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
          }`}
        >
          <FaEnvelope />
          Recipients
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
          }`}
        >
          <FaHistory />
          Email History
        </button>
      </div>

      {/* Recipients List */}
      {activeTab === 'recipients' && (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FaEnvelope className="text-cyan-400" />
            Email Recipients
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
          >
            <FaPlus />
            Add Recipient
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading recipients...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : recipients.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No recipients configured. Add one to get started.
          </div>
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
                {recipients.map((recipient) => (
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
                        <input
                          type="checkbox"
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
      </div>
      )}

      {/* Email History Tab */}
      {activeTab === 'history' && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
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
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'sent'
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
                    <button
                      onClick={() => setExpandedEmailId(expandedEmailId === record.id ? null : record.id)}
                      className="mt-3 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                    >
                      {expandedEmailId === record.id ? <FaChevronUp /> : <FaChevronDown />}
                      {expandedEmailId === record.id ? 'Hide' : 'View'} Recipients
                    </button>
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
        </div>
      )}

      {/* Send Client Email Modal */}
      {showSendEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaPaperPlane className="text-purple-400" />
              Compose Email to Clients
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={8}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-3">
                <p className="text-sm text-gray-300">
                  <strong className="text-purple-400">Recipients:</strong> This email will be sent to{' '}
                  <strong>{recipients.filter(r => r.active && r.role !== 'admin').length}</strong> active client(s)
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSendEmailModal(false);
                  setEmailSubject('');
                  setEmailMessage('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSendClientEmail}
                disabled={sendingEmail || !emailSubject || !emailMessage}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Recipient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ email: '', name: '', role: 'admin' });
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecipient}
                disabled={!formData.email}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Recipient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
