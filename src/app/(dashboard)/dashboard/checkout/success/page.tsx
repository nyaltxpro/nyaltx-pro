'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { FaArrowRight, FaCheckCircle, FaCog, FaEnvelope, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  // Get URL parameters
  const paymentMethod = searchParams?.get('method');
  const tokenName = searchParams?.get('tokenName');
  const tokenSymbol = searchParams?.get('tokenSymbol');
  const transactionId = searchParams?.get('txId');
  const registrationId = searchParams?.get('regId');
  const error = searchParams?.get('error');

  // Countdown timer for redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard/profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen 0 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
          {/* Success/Error Icon */}
          <div className="mb-6">
            {error === 'registration_failed' ? (
              <>
                <div className="mx-auto w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                  <FaExclamationTriangle className="w-10 h-10 text-yellow-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Payment Successful!
                </h1>
                <p className="text-yellow-300 text-lg">
                  Payment completed, but token registration failed
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <FaCheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Payment Successful!
                </h1>
                <p className="text-gray-300 text-lg">
                  Your token has been registered successfully
                </p>
              </>
            )}
          </div>

          {/* Token Information */}
          {tokenName && tokenSymbol && (
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Token Registered</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <span className="text-gray-400 text-sm">Token Name:</span>
                  <p className="text-white font-medium">{tokenName}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Symbol:</span>
                  <p className="text-white font-medium">{tokenSymbol}</p>
                </div>
                {registrationId && (
                  <div className="md:col-span-2">
                    <span className="text-gray-400 text-sm">Registration ID:</span>
                    <p className="text-white font-mono text-sm">{registrationId}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Payment Details</h3>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span className="text-white capitalize">{paymentMethod || 'PayPal'}</span>
              </div>
              {transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction ID:</span>
                  <span className="text-white font-mono text-sm">{transactionId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-medium">✓ Completed</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-center">
              <FaCog className="mr-2" />
              What's Next?
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-white font-medium">Admin Review</p>
                  <p className="text-gray-400 text-sm">Our team will review your token registration within 24-48 hours</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-white font-medium">Email Notification</p>
                  <p className="text-gray-400 text-sm">You'll receive an email once the review is complete</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-white font-medium">Go Live</p>
                  <p className="text-gray-400 text-sm">Approved tokens appear in search results and analytics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Confirmation or Error */}
          {error === 'registration_failed' ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center text-red-400 mb-2">
                <FaExclamationTriangle className="mr-2" />
                <span className="font-medium">Token Registration Failed</span>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Your payment was successful, but we couldn't register your token automatically.
                Please try registering your token manually or contact support.
              </p>
              <Link
                href="/dashboard/register-token"
                className="inline-block bg-[#00b8d8] hover:bg-[#0099b8] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Register Token Manually
              </Link>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center text-green-400 mb-2">
                <FaEnvelope className="mr-2" />
                <span className="font-medium">Email Notifications Sent</span>
              </div>
              <p className="text-gray-300 text-sm">
                Confirmation emails have been sent to you and our admin team
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link
              href="/dashboard/tokens"
              className="flex-1 bg-[#00b8d8] hover:bg-[#0099b8] text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
            >
              <span>View My Tokens</span>
              <FaArrowRight className="ml-2" />
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>

          {/* Auto Redirect Notice */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Automatically redirecting to your tokens in{' '}
              <span className="text-[#00b8d8] font-mono font-bold">{countdown}</span> seconds
            </p>
            <button
              onClick={() => router.push('/dashboard/tokens')}
              className="text-[#00b8d8] hover:text-[#0099b8] text-sm underline mt-2"
            >
              Go now
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">
            Need help? Contact our support team
          </p>
          <Link
            href="mailto:support@nyaltx.pro"
            className="text-[#00b8d8] hover:text-[#0099b8] text-sm underline"
          >
            admin@nyaltx.pro
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <div className="mx-auto w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <FaSpinner className="w-10 h-10 text-blue-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Loading...</h1>
            <p className="text-gray-300">Please wait while we load your success page</p>
          </div>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
