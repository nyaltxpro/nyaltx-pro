import Footer from '@/components/Footer';
import '@solana/wallet-adapter-react-ui/styles.css';

import type { Metadata } from 'next';
import { Inter, Poppins, Roboto } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import Providers from './providers';

const baseUrl = 'https://www.nyaltx.pro';
const metadataBase = new URL(baseUrl);
export const metadata: Metadata = {
  metadataBase,
  alternates: {
    canonical: baseUrl,
  },
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
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': `${baseUrl}/#organization`,
              name: 'NYALTX',
              url: baseUrl,
              logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/og-image.png`,
                width: 512,
                height: 512,
              },
              description: 'Crypto token tracker and DeFi platform for discovering, tracking, and promoting cryptocurrency tokens.',
              sameAs: [
                'https://twitter.com/nyaltx',
                'https://t.me/nyaltx',
                'https://discord.gg/nyaltx',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                url: `${baseUrl}/contact`,
              },
            })
          }}
        />
        {/* WebSite Schema with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': `${baseUrl}/#website`,
              name: 'NYALTX',
              url: baseUrl,
              description: 'Track meme tokens, view real-time charts, participate in Race to Liberty gamification, and discover trending cryptocurrencies.',
              publisher: {
                '@id': `${baseUrl}/#organization`,
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${baseUrl}/dashboard/trade?search={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
              inLanguage: 'en-US',
            })
          }}
        />
        {/* SiteNavigationElement for Google Sitelinks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: [
                {
                  '@type': 'SiteNavigationElement',
                  position: 1,
                  name: 'Dashboard',
                  description: 'Access your crypto dashboard with real-time token tracking',
                  url: `${baseUrl}/dashboard`,
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 2,
                  name: 'Pricing',
                  description: 'View pricing plans for Race to Liberty and boost packs',
                  url: `${baseUrl}/pricing`,
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 3,
                  name: 'About Us',
                  description: 'Learn about NYALTX and our mission',
                  url: `${baseUrl}/about-us`,
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 4,
                  name: 'Contact',
                  description: 'Get in touch with the NYALTX team',
                  url: `${baseUrl}/contact`,
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 5,
                  name: 'Whitepaper',
                  description: 'Read the NYALTX whitepaper and documentation',
                  url: `${baseUrl}/whitepaper`,
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 6,
                  name: 'Podcast',
                  description: 'Listen to Off Road with Frank Ferraro podcast',
                  url: `${baseUrl}/podcast`,
                },
              ],
            })
          }}
        />
        {/* WebPage Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              '@id': `${baseUrl}/#webpage`,
              url: baseUrl,
              name: 'NYALTX | Crypto Token Tracker & DeFi Platform',
              description: 'Track meme tokens, view real-time charts, participate in Race to Liberty gamification, and discover trending cryptocurrencies across multiple blockchains.',
              isPartOf: {
                '@id': `${baseUrl}/#website`,
              },
              about: {
                '@id': `${baseUrl}/#organization`,
              },
              primaryImageOfPage: {
                '@type': 'ImageObject',
                url: `${baseUrl}/og-image.png`,
              },
              inLanguage: 'en-US',
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
