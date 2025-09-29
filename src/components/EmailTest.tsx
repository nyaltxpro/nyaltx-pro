'use client';

import { useState } from 'react';

export default function EmailTest() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testEmail = async () => {
    if (!email) {
      setResult('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Success: ${data.message}`);
        setEmail('');
        setName('');
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Network Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/newsletter');
      const data = await response.json();
      setResult(`📊 Service Status: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Status Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Email Newsletter Test</h2>
      
      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500"
          disabled={isLoading}
        />
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500"
          disabled={isLoading}
        />
        
        <div className="flex gap-2">
          <button
            onClick={testEmail}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Subscribe'}
          </button>
          
          <button
            onClick={testStatus}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Status
          </button>
        </div>
        
        {result && (
          <div className="p-3 bg-gray-900 rounded text-sm text-gray-300 whitespace-pre-wrap">
            {result}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-xs text-gray-400">
        <p><strong>Setup Required:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Configure SMTP settings in .env.local</li>
          <li>Set SMTP_USER, SMTP_PASS, FROM_EMAIL, ADMIN_EMAIL</li>
          <li>For Gmail: Enable 2FA and use App Password</li>
        </ul>
      </div>
    </div>
  );
}
