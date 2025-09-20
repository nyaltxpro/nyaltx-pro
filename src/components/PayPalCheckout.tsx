"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

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
  onError 
}: PayPalCheckoutProps) {
  const [processing, setProcessing] = useState(false);

  const handleSuccess = async (details: any) => {
    try {
      // Set pro status cookie for nyaltxpro purchases
      if (tier.toLowerCase() === 'nyaltxpro') {
        document.cookie = "nyaltx_pro=1; path=/; max-age=31536000"; // 1 year
        
        // Redirect to register token page after successful payment
        setTimeout(() => {
          window.location.href = '/dashboard/register-token?payment=paypal_success';
        }, 2000);
      }
      
      if (onSuccess) {
        onSuccess(details);
      }
    } catch (error) {
      console.error('Post-payment processing error:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <div className="w-full">
      <PayPalButtons
        style={{ 
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal"
        }}
        createOrder={async (_, actions) => {
          setProcessing(true);
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  value: amount,
                  currency_code: "USD"
                },
                description: `NYALTX ${tier} subscription`,
                custom_id: `${tier}_${Date.now()}`,
              },
            ],
            application_context: {
              brand_name: "NYALTX",
              landing_page: "BILLING",
              user_action: "PAY_NOW",
            },
          });
        }}
        onApprove={async (_, actions) => {
          try {
            const details = await actions.order?.capture();
            console.log("Payment Approved: ", details);
            
            if (details?.status === 'COMPLETED') {
              handleSuccess(details);
            } else {
              throw new Error('Payment not completed');
            }
          } catch (error) {
            console.error("Payment capture error:", error);
            if (onError) {
              onError(error);
            }
          } finally {
            setProcessing(false);
          }
        }}
        onError={(err) => {
          console.error("PayPal Checkout Error", err);
          setProcessing(false);
          if (onError) {
            onError(err);
          }
        }}
        onCancel={() => {
          console.log("Payment cancelled by user");
          setProcessing(false);
        }}
        disabled={processing}
      />
      
      {processing && (
        <div className="mt-2 text-center text-sm text-gray-400">
          Processing payment...
        </div>
      )}
    </div>
  );
}
