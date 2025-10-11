'use client';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import '@solana/wallet-adapter-react-ui/styles.css';
import { useEffect, useState } from 'react';
import AnalyticsProvider from '../components/AnalyticsProvider';
import ReduxProvider from '../components/providers/ReduxProvider';
import ContextProvider from '../providers/Web3Provider';
// Import web3modal to initialize it
import '../lib/web3modal';

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Client-side cookie handling
  const [cookies, setCookies] = useState<string | null>(null);

  useEffect(() => {
    // Get cookies on client side
    setCookies(document.cookie);
  }, []);

  return (
    <ReduxProvider>
      <ContextProvider cookies={cookies}>
        <AnalyticsProvider>
          <PayPalScriptProvider options={{
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
            currency: "USD",
            intent: "capture"
          }}>
            {children}
          </PayPalScriptProvider>
        </AnalyticsProvider>
      </ContextProvider>
    </ReduxProvider>
  );
}
