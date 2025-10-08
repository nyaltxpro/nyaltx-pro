'use client';

import { useAppKit } from '@reown/appkit/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

export default function AdminLoginComponent() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [wError, setWError] = useState<string | null>(null);
  const [wLoading, setWLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { open } = useAppKit();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const redirectTo = params?.get('redirect') || '/admin';
        router.push(redirectTo);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    if (!isConnected) {
      open();
      return;
    }

    setWError(null);
    setWLoading(true);

    try {
      // Get nonce
      const nonceResponse = await fetch('/api/admin/login/nonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const { nonce } = await nonceResponse.json();

      // Sign message
      const message = `Sign this message to authenticate with NYALTX Admin Panel.\n\nNonce: ${nonce}`;
      const signature = await signMessageAsync({ message });

      // Verify signature
      const verifyResponse = await fetch('/api/admin/login/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          signature,
          message,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        const redirectTo = params?.get('redirect') || '/admin';
        router.push(redirectTo);
      } else {
        setWError(verifyData.message || 'Wallet authentication failed');
      }
    } catch (err: any) {
      setWError(err.message || 'Wallet authentication failed');
    } finally {
      setWLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/nyax-logo.svg"
              alt="NYALTX"
              width={60}
              height={60}
              className="rounded-lg"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-gray-400 text-sm">
            Access the NYALTX administration panel
          </p>
        </div>

        {/* Wallet Login Section */}
        <div className="mb-6">
          <button
            onClick={handleWalletLogin}
            disabled={wLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {wLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Authenticating...
              </>
            ) : (
              <>
                🔐 {isConnected ? 'Sign Message to Login' : 'Connect Wallet to Login'}
              </>
            )}
          </button>
          {wError && (
            <p className="text-red-400 text-sm mt-2 text-center">{wError}</p>
          )}
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">or</span>
          </div>
        </div>

        {/* Email/Password Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="admin@nyaltx.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              >
                {show ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-4 text-[12px] text-gray-500">
          By continuing you agree to the acceptable use of this dashboard.
        </div>
      </div>
    </div>
  );
}
