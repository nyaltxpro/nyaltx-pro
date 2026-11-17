'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface PayPalCheckoutProps {
  amount: string;
  tier: string;
  email?: string;
  onBeforeCryptoRedirect?: () => void;
  onSuccess?: (details: any) => void | Promise<void>;
  onError?: (error: any) => void;
}

export default function PayPalCheckout({
  amount,
  tier,
  email,
  onBeforeCryptoRedirect,
  onSuccess,
  onError,
}: PayPalCheckoutProps) {
  const [processing, setProcessing] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [cryptoCheckoutOpen, setCryptoCheckoutOpen] = useState(false);
  const [cryptoGivenName, setCryptoGivenName] = useState('');
  const [cryptoSurname, setCryptoSurname] = useState('');
  const [cryptoProcessing, setCryptoProcessing] = useState(false);
  const processedCryptoOrderRef = useRef<string | null>(null);
  const cryptoCreateInProgressRef = useRef(false);

  // Check if PayPal SDK is properly configured
  const isPayPalConfigured =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'your-paypal-client-id-here' &&
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'test';

  const handleSuccess = async (details: any) => {
    const processingToast = toast.loading('🔄 Processing your payment...');
    const isCryptoPayment = Boolean(
      details?.paymentSource === 'paypal_crypto' || details?.payment_source?.crypto,
    );
    
    try {
      toast.dismiss(processingToast);
      toast.success(isCryptoPayment ? '🎉 PayPal crypto payment successful!' : '🎉 PayPal payment successful!');
      
      // Set pro status cookie for nyaltxpro purchases
      if (tier.toLowerCase() === 'nyaltxpro' || tier.toLowerCase() === 'nyaltxpro1') {
        document.cookie = 'nyaltx_pro=1; path=/; max-age=31536000'; // 1 year

        // Check if there's a pending token registration to process
        const pendingTokenData = localStorage.getItem('pendingTokenRegistration');
        if (pendingTokenData) {
          const tokenToast = toast.loading('🪙 Registering your token...');
          try {
            // Register the token after successful payment (this will create the token registration record)
            await handleTokenRegistrationAfterPayment(details, pendingTokenData);
            toast.dismiss(tokenToast);
          } catch (error) {
            toast.dismiss(tokenToast);
            throw error;
          }
        } else {
          const orderToast = toast.loading('📝 Saving payment details...');
          try {
            // No pending token registration, so store the PayPal payment order
            await storePayPalOrder(details);
            toast.dismiss(orderToast);
            toast.success('✅ Payment saved successfully!');
            // Redirect to register token page after successful payment
            toast.loading('🔄 Redirecting to token registration...');
            setTimeout(() => {
              window.location.href = '/dashboard/register-token?payment=paypal_success';
            }, 2000);
          } catch (error) {
            toast.dismiss(orderToast);
            throw error;
          }
        }
      } else if (tier.toLowerCase().includes('race-') || ['paddle', 'motor', 'helicopter'].includes(tier.toLowerCase())) {
        const raceToast = toast.loading('🏁 Processing Race to Liberty payment...');
        try {
          // Handle Race to Liberty payments - store PayPal order for these
          await storePayPalOrder(details);
          toast.dismiss(raceToast);
          toast.success('🏆 Race to Liberty payment processed!');
          toast.loading('🔄 Redirecting to success page...');
          setTimeout(() => {
            window.location.href = `/pricing/race-to-liberty/success?tier=${tier}&payment=paypal_success`;
          }, 2000);
        } catch (error) {
          toast.dismiss(raceToast);
          throw error;
        }
      } else if (tier.toLowerCase().startsWith('news') || tier.toLowerCase().startsWith('pr')) {
        const orderToast = toast.loading('📝 Recording submission payment...');
        try {
          await storePayPalOrder(details);
          toast.dismiss(orderToast);
          toast.success('✅ Payment verified! Submitting story...');
        } catch (error) {
          toast.dismiss(orderToast);
          console.warn('Order record notice:', error);
        }
      } else {
        // For other payments, check if there's a pending token registration
        const pendingTokenData = localStorage.getItem('pendingTokenRegistration');
        if (pendingTokenData) {
          const tokenToast = toast.loading('🪙 Registering your token...');
          try {
            // Register the token after successful payment (this will create the token registration record)
            await handleTokenRegistrationAfterPayment(details, pendingTokenData);
            toast.dismiss(tokenToast);
          } catch (error) {
            toast.dismiss(tokenToast);
            throw error;
          }
        } else {
          const orderToast = toast.loading('📝 Saving payment details...');
          try {
            // No token registration, store as regular PayPal order
            await storePayPalOrder(details);
            toast.dismiss(orderToast);
            toast.success('✅ Payment processed successfully!');
          } catch (error) {
            toast.dismiss(orderToast);
            throw error;
          }
        }
      }

      if (onSuccess) {
        await onSuccess(details);
      }
    } catch (error) {
      toast.dismiss(processingToast);
      console.error('Post-payment processing error:', error);
      toast.error('❌ Payment processing failed. Please contact support.');
      if (onError) {
        onError(error);
      }
    }
  };

  const handleSuccessRef = useRef(handleSuccess);
  handleSuccessRef.current = handleSuccess;

  useEffect(() => {
    const url = new URL(window.location.href);
    const cryptoStatus = url.searchParams.get('paypalCryptoStatus');
    const cryptoOrderId = url.searchParams.get('paypalCryptoOrderId');

    if (!cryptoStatus) return;

    const clearCryptoReturnParams = () => {
      url.searchParams.delete('paypalCryptoStatus');
      url.searchParams.delete('paypalCryptoOrderId');
      window.history.replaceState(window.history.state, '', url.toString());
    };

    if (cryptoStatus === 'cancelled') {
      clearCryptoReturnParams();
      setCryptoCheckoutOpen(true);
      toast('PayPal crypto checkout was cancelled. No payment was completed.');
      return;
    }

    if (cryptoStatus === 'failed') {
      clearCryptoReturnParams();
      setCryptoCheckoutOpen(true);
      toast.error('PayPal could not complete the crypto payment. Please try again or choose another payment method.');
      return;
    }

    if (cryptoStatus !== 'returned' || !cryptoOrderId) {
      clearCryptoReturnParams();
      setCryptoCheckoutOpen(true);
      toast.error('Could not confirm the PayPal crypto checkout return.');
      return;
    }

    if (processedCryptoOrderRef.current === cryptoOrderId) return;
    processedCryptoOrderRef.current = cryptoOrderId;
    setCryptoCheckoutOpen(true);
    setCryptoProcessing(true);

    const verifyCryptoPayment = async () => {
      const maxAttempts = 6;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const response = await fetch('/api/paypal/crypto/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: cryptoOrderId }),
          cache: 'no-store',
        });
        const result = await response.json();

        if (response.ok && result.success && result.order) {
          clearCryptoReturnParams();
          await handleSuccessRef.current({ ...result.order, paymentSource: result.paymentSource });
          return;
        }

        if (response.status !== 409 || attempt === maxAttempts - 1) {
          throw new Error(result.error || 'PayPal has not confirmed the crypto payment.');
        }
        await new Promise<void>(resolve => setTimeout(resolve, 5000));
      }
    };

    void verifyCryptoPayment()
      .catch(error => {
        console.error('PayPal crypto return verification failed:', error);
        toast.error(error instanceof Error ? error.message : 'Could not verify the crypto payment.');
        processedCryptoOrderRef.current = null;
      })
      .finally(() => setCryptoProcessing(false));
  }, []);

  const startCryptoCheckout = async () => {
    if (cryptoCreateInProgressRef.current) return;
    if (!cryptoGivenName.trim() || !cryptoSurname.trim()) {
      toast.error('Enter your first and last name for PayPal crypto checkout.');
      return;
    }
    cryptoCreateInProgressRef.current = true;
    setCryptoProcessing(true);
    try {
      const returnUrl = new URL(window.location.href);
      returnUrl.searchParams.delete('paypalCryptoStatus');
      returnUrl.searchParams.delete('paypalCryptoOrderId');
      const response = await fetch('/api/paypal/crypto/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          tier,
          email,
          givenName: cryptoGivenName,
          surname: cryptoSurname,
          returnUrl: returnUrl.toString(),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.approvalUrl) {
        throw new Error(result.error || 'Could not start PayPal crypto checkout.');
      }

      onBeforeCryptoRedirect?.();
      window.location.assign(result.approvalUrl);
    } catch (error) {
      console.error('PayPal crypto checkout could not start:', error);
      toast.error(error instanceof Error ? error.message : 'Could not start PayPal crypto checkout.');
      setCryptoProcessing(false);
    } finally {
      cryptoCreateInProgressRef.current = false;
    }
  };

  const handleError = (error: any) => {
    console.error('PayPal payment error:', error);
    toast.error('❌ PayPal payment failed. Please try again.');
    if (onError) {
      onError(error);
    }
  };

  // Store PayPal payment order in database
  const storePayPalOrder = async (paymentDetails: any) => {
    try {
      const orderData = {
        type: tier.toLowerCase() === 'nyaltxpro' || tier.toLowerCase() === 'nyaltxpro1' ? 'pro_subscription' : 
              ['paddle', 'motor', 'helicopter'].includes(tier.toLowerCase()) ? 'race_to_liberty' :
              (tier.toLowerCase().startsWith('news') || tier.toLowerCase().startsWith('pr')) ? 'news_submission' : 'pro_subscription',
        paymentMethod: 'paypal',
        amount: amount,
        currency: 'USD',
        paymentId: paymentDetails.id,
        email: email,
        productName: `${tier.toUpperCase()} - PayPal Payment`,
        tier: tier,
        status: 'completed',
        metadata: {
          paypalDetails:
            paymentDetails?.paymentSource === 'paypal_crypto' ||
            paymentDetails?.payment_source?.crypto
              ? { id: paymentDetails.id, status: paymentDetails.status }
              : paymentDetails,
          paymentSource:
            paymentDetails?.paymentSource === 'paypal_crypto' ||
            paymentDetails?.payment_source?.crypto
            ? 'paypal_crypto'
            : 'paypal_checkout'
        }
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        console.error('Failed to store PayPal order');
      } else {
        console.log('✅ PayPal order stored successfully');
      }
    } catch (error) {
      console.error('Error storing PayPal order:', error);
    }
  };

  // Handle token registration after successful payment
  const handleTokenRegistrationAfterPayment = async (paymentDetails: any, pendingTokenDataString: string) => {
    try {
      const tokenData = JSON.parse(pendingTokenDataString);
      
      // Add payment information to the token registration
      const tokenDataWithPayment = {
        ...tokenData,
        paymentMethod: 'paypal',
        paymentId: paymentDetails.id,
        paymentAmount: amount,
        paymentCurrency: 'USD',
        tier: tier
      };
      
      // Register the token via API with payment information
      const response = await fetch('/api/tokens/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenDataWithPayment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Token registration failed');
      }

      const result = await response.json();
      
      // Clear pending registration data
      localStorage.removeItem('pendingTokenRegistration');
      
      toast.success('🪙 Token registered successfully!');
      
      // Redirect to success page with token and payment details
      const successUrl = new URL('/dashboard/checkout/success', window.location.origin);
      successUrl.searchParams.set('method', 'paypal');
      successUrl.searchParams.set('tokenName', tokenData.tokenName);
      successUrl.searchParams.set('tokenSymbol', tokenData.tokenSymbol);
      successUrl.searchParams.set('txId', paymentDetails.id);
      successUrl.searchParams.set('regId', result.record.id);
      
      toast.loading('🔄 Redirecting to success page...');
      setTimeout(() => {
        window.location.href = successUrl.toString();
      }, 2000);
      
    } catch (error) {
      console.error('Token registration after payment failed:', error);
      toast.error('❌ Token registration failed, but payment was successful');
      
      // Still redirect to success page but show error
      const successUrl = new URL('/dashboard/checkout/success', window.location.origin);
      successUrl.searchParams.set('method', 'paypal');
      successUrl.searchParams.set('error', 'registration_failed');
      successUrl.searchParams.set('txId', paymentDetails.id);
      
      toast.loading('🔄 Redirecting to success page...');
      setTimeout(() => {
        window.location.href = successUrl.toString();
      }, 2000);
    }
  };

  if (!isPayPalConfigured) {
    return (
      <div className="w-full p-6 bg-yellow-500/10 backdrop-blur-lg border border-yellow-500/20 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <div className="text-yellow-400 font-semibold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              PayPal Not Configured
            </div>
            <div className="text-sm text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Payment service unavailable
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-300 mb-3" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          PayPal payments are not available. Please configure your PayPal Client ID in environment
          variables.
        </div>
        <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          Add <code className="bg-gray-700/30 px-2 py-1 rounded border border-gray-600/30">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> to your
          .env.local file
        </div>
      </div>
    );
  }

  const paypalScriptOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: 'USD',
    intent: 'capture',
    components: 'buttons',
  };

  return (
    <div className="w-full bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-4 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
          <span className="text-xl">💳</span>
        </div>
        <div>
          <div className="text-white font-semibold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            PayPal Payment
          </div>
          <div className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            Secure payment with PayPal
          </div>
        </div>
      </div>
      
      <PayPalScriptProvider options={paypalScriptOptions}>
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
          }}
          createOrder={async (_, actions) => {
            setProcessing(true);
            const orderToast = toast.loading('💳 Creating PayPal order...');
            
            try {
              const order = await actions.order.create({
                intent: 'CAPTURE',
                purchase_units: [
                  {
                    amount: {
                      value: amount,
                      currency_code: 'USD',
                    },
                    description: `NYALTX ${tier} subscription`,
                    custom_id: `${tier}_${Date.now()}`,
                  },
                ],
                application_context: {
                  brand_name: 'NYALTX',
                  landing_page: 'BILLING',
                  user_action: 'PAY_NOW',
                },
              });
              
              toast.dismiss(orderToast);
              toast.success('✅ PayPal order created! Complete your payment.');
              return order;
            } catch (error) {
              toast.dismiss(orderToast);
              toast.error('❌ Failed to create PayPal order');
              throw error;
            }
          }}
          onApprove={async (_, actions) => {
            const captureToast = toast.loading('💰 Capturing your payment...');
            
            try {
              const details = await actions.order?.capture();
              console.log('Payment Approved: ', details);

              toast.dismiss(captureToast);
              
              if (details?.status === 'COMPLETED') {
                await handleSuccess(details);
              } else {
                toast.error('❌ Payment not completed');
                throw new Error('Payment not completed');
              }
            } catch (error) {
              toast.dismiss(captureToast);
              console.error('Payment capture error:', error);
              toast.error('❌ Failed to capture payment');
              if (onError) {
                onError(error);
              }
            } finally {
              setProcessing(false);
            }
          }}
          onError={err => {
            console.error('PayPal Checkout Error', err);
            handleError(err);
            setProcessing(false);
          }}
          onCancel={() => {
            console.log('Payment cancelled by user');
            toast('⚠️ Payment cancelled by user', { 
              icon: '❌',
              style: {
                background: '#374151',
                color: '#f9fafb',
                border: '1px solid #6b7280',
              }
            });
            setProcessing(false);
          }}
          disabled={processing}
        />

        <div className="mt-4 border-t border-gray-700/50 pt-4">
          <button
            type="button"
            onClick={() => setCryptoCheckoutOpen(open => !open)}
            disabled={cryptoProcessing}
            className="w-full rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cryptoCheckoutOpen ? 'Close PayPal crypto option' : 'Pay with crypto using PayPal'}
          </button>

          {cryptoCheckoutOpen && (
            <div className="mt-3 space-y-3 rounded-lg border border-cyan-500/30 bg-gray-900/50 p-4">
              <p className="text-sm font-medium text-white">Pay with crypto through PayPal</p>
              <p className="text-xs leading-relaxed text-gray-300">
                Eligible buyers worldwide can pay with supported cryptocurrencies. PayPal converts
                the payment to your account&apos;s settlement currency. This feature requires an
                eligible, verified US PayPal Business account with Pay with crypto enabled.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-gray-300">
                  First name
                  <input
                    autoComplete="given-name"
                    maxLength={140}
                    value={cryptoGivenName}
                    onChange={event => setCryptoGivenName(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="text-xs text-gray-300">
                  Last name
                  <input
                    autoComplete="family-name"
                    maxLength={140}
                    value={cryptoSurname}
                    onChange={event => setCryptoSurname(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => void startCryptoCheckout()}
                disabled={cryptoProcessing}
                className="w-full rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cryptoProcessing
                  ? 'Connecting to PayPal...'
                  : `Continue with PayPal crypto · $${Number(amount).toFixed(2)} USD`}
              </button>
            </div>
          )}
        </div>

        {processing && (
          <div className="mt-4 flex items-center justify-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Processing payment...
            </span>
          </div>
        )}
      </PayPalScriptProvider>
    </div>
  );
}
