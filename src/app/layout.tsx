import Footer from '@/components/Footer';
import '@solana/wallet-adapter-react-ui/styles.css';

import type { Metadata } from 'next';
import { Inter, Poppins, Roboto } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import Providers from './providers';

const baseUrl = 'https://www.nyaltx.pro';
export const metadata: Metadata = {
  title: 'NYALTX | Crypto Token Tracker & DeFi Platform',
  description: 'Track meme tokens, view real-time charts, participate in Race to Liberty gamification, and discover trending cryptocurrencies across multiple blockchains.',
  keywords: 'crypto, cryptocurrency, token tracker, DeFi, meme tokens, blockchain, Ethereum, trading, gamification, Race to Liberty, NYAX',
  authors: [{ name: 'NYALTX Team' }],
  creator: 'NYALTX Team',
  publisher: 'NYALTX',
  robots: 'index, follow',
  icons: {
    icon: `${baseUrl}/og-image.png`,
    shortcut: `${baseUrl}/og-image.png`,
    apple: `${baseUrl}/og-image.png`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'NYALTX',
    title: 'NYALTX | Crypto Token Tracker & DeFi Platform',
    description: 'Track meme tokens, view real-time charts, participate in Race to Liberty gamification, and discover trending cryptocurrencies across multiple blockchains.',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 512,
        height: 512,
        alt: 'NYALTX Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nyaltx',
    creator: '@nyaltx',
  },

  manifest: '/manifest.json',
  themeColor: '#06b6d4',

};

export const viewport = 'width=device-width, initial-scale=1';


const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${roboto.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'NYALTX',
              url: baseUrl,
              logo: `${baseUrl}/og-image.png`,
              description: 'Crypto token tracker and DeFi platform for discovering, tracking, and promoting cryptocurrency tokens.',
              sameAs: ['https://twitter.com/nyaltx', 'https://t.me/nyaltx', 'https://discord.gg/nyaltx'],
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'NYALTX',
              url: baseUrl,
              description: 'Crypto token tracker and DeFi platform',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${baseUrl}/dashboard/trade?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}
        style={{
          fontFamily:
            "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }} >
        <Providers>
          {/* DexScreener-inspired background pattern */}
          <div className="dex-bg-pattern"></div>

          <div className="relative transition-all duration-300 flex flex-col min-h-screen">
            <main className="flex-grow relative z-10">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(0, 0, 0, 0.95)',
                color: '#ffffff',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              },
              success: {
                style: {
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  backdropFilter: 'blur(16px)',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                style: {
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  backdropFilter: 'blur(16px)',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
