
"use client";

import { useState } from 'react';
import type { Metadata } from "next";
import { Poppins, Inter, Roboto } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/HeaderUpdated"; // Assuming HeaderUpdated is the one to use
import Footer from "../components/Footer";
import Providers from "./providers";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import "./globals.css";

// Removed duplicate web3modal import - already imported in providers

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inter = Inter({ subsets: ['latin'] })

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

// Metadata can't be exported from a client component in this way.
// We'll move this or handle it differently if needed, for now, we focus on layout.
// export const metadata: Metadata = {
//   title: "NYALTX | Crypto Token Tracker",
//   description: "Track meme tokens, view real-time charts, history and all token information from blockchain.",
//   icons: {
//     icon: "/logo.png",
//     apple: "/logo.png",
//     shortcut: "/logo.png"
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <html lang="en" className={`${poppins.variable} ${roboto.variable}`}>
      <body className={inter.className}>
        <PayPalScriptProvider options={{ 
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
          currency: "USD",
          intent: "capture"
        }}>
          <Providers>
            {/* <Sidebar isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} /> */}
            {/* Apply margin-left for desktop, none for mobile */}
            <div className=" transition-all duration-300 flex flex-col min-h-screen">
              {/* <Header toggleMobileMenu={toggleMobileMenu} /> */}
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </Providers>
        </PayPalScriptProvider>
      </body>
    </html>
  );
}
