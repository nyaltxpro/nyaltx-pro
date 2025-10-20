'use client';

import { useAppKit } from '@reown/appkit/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { FaEye, FaEyeSlash, FaLock, FaShieldAlt, FaWallet } from 'react-icons/fa';
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
        const redirectTo = params?.get('redirect') || '/adminpanel';
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
      const verifyResponse = await fetch('/api/panel/login/verify', {
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
        const redirectTo = params?.get('redirect') || '/adminpanel';
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f1923] via-[#1a2932] to-[#0f1923] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00b8d8]/20 via-transparent to-[#00b8d8]/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00b8d8]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00b8d8]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/20 rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00b8d8] to-[#0099b8] rounded-2xl flex items-center justify-center shadow-lg">
              <FaShieldAlt className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            NYALTX Admin
          </h1>
          <p className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            Secure access to the administration panel
          </p>
        </div>

        {/* Wallet Login Section */}
        <div className="mb-8">
          <button
            onClick={handleWalletLogin}
            disabled={wLoading}
            className="w-full bg-gradient-to-r from-[#00b8d8] to-[#0099b8] hover:from-[#00a5c7] hover:to-[#0088a5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl border border-[#00b8d8]/30"
            style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
          >
            {wLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <FaWallet className="w-5 h-5" />
                <span>{isConnected ? 'Sign Message to Login' : 'Connect Wallet to Login'}</span>
              </>
            )}
          </button>
          {wError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
              <p className="text-red-300 text-sm text-center" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {wError}
              </p>
            </div>
          )}
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-800/40 text-gray-400 backdrop-blur-sm rounded-full" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              or continue with email
            </span>
          </div>
        </div>

        {/* Email/Password Login */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-[#00b8d8] backdrop-blur-sm transition-all duration-200"
              placeholder="admin@nyaltx.com"
              style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b8d8] focus:border-[#00b8d8] backdrop-blur-sm transition-all duration-200 pr-12"
                placeholder="••••••••"
                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#00b8d8] transition-colors duration-200"
              >
                {show ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <p className="text-red-300 text-sm text-center" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-600/80 to-gray-700/80 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 backdrop-blur-sm border border-gray-600/30 shadow-lg hover:shadow-xl"
            style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <FaLock className="w-4 h-4" />
                <span>Sign In</span>
              </div>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            By continuing you agree to the acceptable use of this dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
