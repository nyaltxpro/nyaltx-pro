'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface PayPalCheckoutProps {
  amount: string;
  tier: string;
  email?: string;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
}

export default function PayPalCheckout({
  amount,
  tier,
  email,
  onSuccess,
  onError,
}: PayPalCheckoutProps) {
  const [processing, setProcessing] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  // Check if PayPal SDK is properly configured
  const isPayPalConfigured =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'your-paypal-client-id-here' &&
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'test';

  const handleSuccess = async (details: any) => {
    try {
      toast.success('🎉 PayPal payment successful!');
      
      // Set pro status cookie for nyaltxpro purchases
      if (tier.toLowerCase() === 'nyaltxpro' || tier.toLowerCase() === 'nyaltxpro1') {
        document.cookie = 'nyaltx_pro=1; path=/; max-age=31536000'; // 1 year

        // Check if there's a pending token registration to process
        const pendingTokenData = localStorage.getItem('pendingTokenRegistration');
        if (pendingTokenData) {
          // Register the token after successful payment (this will create the token registration record)
          await handleTokenRegistrationAfterPayment(details, pendingTokenData);
        } else {
          // No pending token registration, so store the PayPal payment order
          await storePayPalOrder(details);
          // Redirect to register token page after successful payment
          setTimeout(() => {
            window.location.href = '/dashboard/register-token?payment=paypal_success';
          }, 2000);
        }
      } else if (tier.toLowerCase().includes('race-') || ['paddle', 'motor', 'helicopter'].includes(tier.toLowerCase())) {
        // Handle Race to Liberty payments - store PayPal order for these
        await storePayPalOrder(details);
        setTimeout(() => {
          window.location.href = `/pricing/race-to-liberty/success?tier=${tier}&payment=paypal_success`;
        }, 2000);
      } else {
        // For other payments, check if there's a pending token registration
        const pendingTokenData = localStorage.getItem('pendingTokenRegistration');
        if (pendingTokenData) {
          // Register the token after successful payment (this will create the token registration record)
          await handleTokenRegistrationAfterPayment(details, pendingTokenData);
        } else {
          // No token registration, store as regular PayPal order
          await storePayPalOrder(details);
        }
      }

      if (onSuccess) {
        onSuccess(details);
      }
    } catch (error) {
      console.error('Post-payment processing error:', error);
      toast.error('Payment processing failed. Please contact support.');
      if (onError) {
        onError(error);
      }
    }
  };

  const handleError = (error: any) => {
    console.error('PayPal payment error:', error);
    toast.error('PayPal payment failed. Please try again.');
    if (onError) {
      onError(error);
    }
  };

  // Store PayPal payment order in database
  const storePayPalOrder = async (paymentDetails: any) => {
    try {
      const orderData = {
        type: tier.toLowerCase() === 'nyaltxpro' || tier.toLowerCase() === 'nyaltxpro1' ? 'pro_subscription' : 
              ['paddle', 'motor', 'helicopter'].includes(tier.toLowerCase()) ? 'race_to_liberty' : 'pro_subscription',
        paymentMethod: 'paypal',
        amount: amount,
        currency: 'USD',
        paymentId: paymentDetails.id,
        email: email,
        productName: `${tier.toUpperCase()} - PayPal Payment`,
        tier: tier,
        status: 'completed',
        metadata: {
          paypalDetails: paymentDetails,
          paymentSource: 'paypal_checkout'
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
      
      // Redirect to success page with token and payment details
      const successUrl = new URL('/dashboard/checkout/success', window.location.origin);
      successUrl.searchParams.set('method', 'paypal');
      successUrl.searchParams.set('tokenName', tokenData.tokenName);
      successUrl.searchParams.set('tokenSymbol', tokenData.tokenSymbol);
      successUrl.searchParams.set('txId', paymentDetails.id);
      successUrl.searchParams.set('regId', result.record.id);
      
      setTimeout(() => {
        window.location.href = successUrl.toString();
      }, 2000);
      
    } catch (error) {
      console.error('Token registration after payment failed:', error);
      
      // Still redirect to success page but show error
      const successUrl = new URL('/dashboard/checkout/success', window.location.origin);
      successUrl.searchParams.set('method', 'paypal');
      successUrl.searchParams.set('error', 'registration_failed');
      successUrl.searchParams.set('txId', paymentDetails.id);
      
      setTimeout(() => {
        window.location.href = successUrl.toString();
      }, 2000);
    }
  };

  if (!isPayPalConfigured) {
    return (
      <div className="w-full p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
        <div className="text-yellow-400 font-medium mb-2">PayPal Not Configured</div>
        <div className="text-sm text-gray-300 mb-3">
          PayPal payments are not available. Please configure your PayPal Client ID in environment
          variables.
        </div>
        <div className="text-xs text-gray-400">
          Add <code className="bg-gray-800 px-1 rounded">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> to your
          .env.local file
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
        }}
        createOrder={async (_, actions) => {
          setProcessing(true);
          return actions.order.create({
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
        }}
        onApprove={async (_, actions) => {
          try {
            const details = await actions.order?.capture();
            console.log('Payment Approved: ', details);

            if (details?.status === 'COMPLETED') {
              handleSuccess(details);
            } else {
              throw new Error('Payment not completed');
            }
          } catch (error) {
            console.error('Payment capture error:', error);
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
          setProcessing(false);
        }}
        disabled={processing}
      />

      {processing && (
        <div className="mt-2 text-center text-sm text-gray-400">Processing payment...</div>
      )}
    </div>
  );
}
