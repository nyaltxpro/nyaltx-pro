'use client';

import { useState, useEffect } from 'react';
import { FaEnvelope, FaPaperPlane, FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import Link from 'next/link';

interface EmailRecipient {
  id: string;
  email: string;
  name?: string;
  role: string;
  active: boolean;
  createdAt: string;
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

  useEffect(() => {
    fetchRecipients();
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

      {/* Recipients List */}
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
                  <option value="admin">Admin</option>
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
