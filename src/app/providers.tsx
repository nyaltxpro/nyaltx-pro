'use client'
import ContextProvider from "../providers/Web3Provider";
import ReduxProvider from "../components/providers/ReduxProvider";
import { useState, useEffect } from 'react';

// Import web3modal to initialize it
import "../lib/web3modal";

export default function Providers({
  children
}: Readonly<{
  children: React.ReactNode
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
        {children}
      </ContextProvider>
    </ReduxProvider>
  );
}
