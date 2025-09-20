import React from 'react';
import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function PaymentSuccessPage({
  searchParams
}: {
  searchParams: { tier?: string; orderId?: string; method?: string };
}) {
  const { tier, orderId, method } = searchParams;

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <PublicHeader />
      
      {/* Success background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-green-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-600/20 border-2 border-green-500">
              <FaCheckCircle className="text-4xl text-green-400" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400 mb-6">
            Payment Successful!
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Thank you for your purchase. Your {tier || 'subscription'} has been activated successfully.
          </p>

          {/* Payment Details */}
          <div className="bg-[#0f1923] rounded-xl p-6 border border-gray-800 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-green-400">Payment Details</h2>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan:</span>
                <span className="font-medium capitalize">{tier || 'NyaltxPro'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span className="font-medium capitalize">{method || 'PayPal'}</span>
              </div>
              {orderId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="font-mono text-sm text-cyan-400">{orderId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-medium">✓ Completed</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-[#0f1923] rounded-xl p-6 border border-gray-800 mb-8">
            <h2 className="text-lg font-semibold mb-4">What's Next?</h2>
            <div className="space-y-4 text-left">
              {tier === 'nyaltxpro' ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                    <div>
                      <p className="font-medium">Register Your Token</p>
                      <p className="text-sm text-gray-400">Complete your project profile and add your token information.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                    <div>
                      <p className="font-medium">Access Dashboard</p>
                      <p className="text-sm text-gray-400">Your NyaltxPro membership is now active for 1 year.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                    <div>
                      <p className="font-medium">Campaign Activation</p>
                      <p className="text-sm text-gray-400">Your Race to Liberty campaign will be activated within 24 hours.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                    <div>
                      <p className="font-medium">Placement Begins</p>
                      <p className="text-sm text-gray-400">Your project will appear in the designated placement areas.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {tier === 'nyaltxpro' ? (
              <Link
                href="/dashboard/register-token"
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium transition-colors"
              >
                Register Your Token
                <FaArrowRight />
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
                <FaArrowRight />
              </Link>
            )}
            
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-medium transition-colors"
            >
              View Pricing
            </Link>
          </div>

          {/* Support */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@nyaltx.com" className="text-cyan-400 hover:underline">
                support@nyaltx.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
