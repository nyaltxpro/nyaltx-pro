import { Inter, Poppins, Roboto } from "next/font/google";
import Footer from "../components/Footer";
import "./globals.css";
import Providers from "./providers";
import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx.com';

export const metadata: Metadata = {
  title: 'NYALTX | Crypto Token Tracker & DeFi Platform',
  description: 'Track meme tokens, view real-time charts, participate in Race to Liberty gamification, and discover trending cryptocurrencies across multiple blockchains.',
  keywords: 'crypto, cryptocurrency, token tracker, DeFi, meme tokens, blockchain, Ethereum, trading, gamification, Race to Liberty, NYAX',
  authors: [{ name: 'NYALTX Team' }],
  creator: 'NYALTX Team',
  publisher: 'NYALTX',
  robots: 'index, follow',
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
        width: 1200,
        height: 630,
        alt: 'NYALTX - Crypto Token Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nyaltx',
    creator: '@nyaltx',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  themeColor: '#06b6d4',
  viewport: 'width=device-width, initial-scale=1',
};


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
              logo: `${baseUrl}/logo.png`,
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
      <body className={inter.className}>
        <Providers>
          <div className=" transition-all duration-300 flex flex-col min-h-screen">
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
