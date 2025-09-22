"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { twitchApi } from '@/services/twitchApi';

export default function TwitchCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        setStatus('error');
        setError(`Authentication failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received');
        return;
      }

      try {
        await twitchApi.exchangeCodeForToken(code);
        setStatus('success');
        
        // Redirect to live stream page after successful auth
        setTimeout(() => {
          router.push('/dashboard/live-stream?twitch_connected=true');
        }, 2000);
        
      } catch (error: any) {
        setStatus('error');
        setError(error.message || 'Failed to authenticate with Twitch');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Connecting to Twitch...</h1>
            <p className="text-gray-400">Please wait while we authenticate your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-green-400">Successfully Connected!</h1>
            <p className="text-gray-400 mb-4">Your Twitch account has been linked. Redirecting you back...</p>
            <div className="text-sm text-gray-500">You can now start live streaming!</div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-red-400">Connection Failed</h1>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard/live-stream')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
