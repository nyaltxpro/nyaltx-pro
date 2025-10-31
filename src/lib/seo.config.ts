import { DefaultSeoProps } from 'next-seo';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx.pro';

export const defaultSEO: DefaultSeoProps = {
  title: 'NYALTX | Crypto Token Tracker & DeFi Platform',
  description:
    'Track meme tokens, view real-time charts, participate in Race to Liberty gamification, and discover trending cryptocurrencies across multiple blockchains.',
  canonical: baseUrl,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'NYALTX',
    title: 'NYALTX | Crypto Token Tracker & DeFi Platform',
    description:
      'Track meme tokens, view real-time charts, participate in Race to Liberty gamification, and discover trending cryptocurrencies across multiple blockchains.',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'NYALTX - Crypto Token Tracker',
        type: 'image/png',
      },
      {
        url: `${baseUrl}/hero2.png`,
        width: 800,
        height: 600,
        alt: 'NYALTX Platform',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    handle: '@nyaltx',
    site: '@nyaltx',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'keywords',
      content:
        'crypto, cryptocurrency, token tracker, DeFi, meme tokens, blockchain, Ethereum, trading, gamification, Race to Liberty, NYAX',
    },
    {
      name: 'author',
      content: 'NYALTX Team',
    },
    {
      name: 'robots',
      content: 'index, follow',
    },
    {
      name: 'theme-color',
      content: '#06b6d4', // Cyan color from your brand
    },
    {
      name: 'msapplication-TileColor',
      content: '#06b6d4',
    },
    {
      name: 'application-name',
      content: 'NYALTX',
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'NYALTX',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
    {
      name: 'format-detection',
      content: 'telephone=no',
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-touch-fullscreen',
      content: 'yes',
    },
    {
      property: 'og:site_name',
      content: 'NYALTX',
    },
    {
      name: 'twitter:creator',
      content: '@nyaltx',
    },
    {
      name: 'twitter:domain',
      content: 'nyaltx.pro',
    },
    {
      name: 'google-site-verification',
      content: 'your-google-verification-code', // Replace with actual verification code
    },
    {
      name: 'msvalidate.01',
      content: 'your-bing-verification-code', // Replace with actual Bing verification code
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/logo.png',
    },
    {
      rel: 'apple-touch-icon',
      href: '/logo.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
  ],
};

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: 'NYALTX | Crypto Token Tracker & DeFi Platform',
    description:
      'Discover, track, and grow your crypto tokens with NYALTX. Real-time insights, curated listings, and promotional placements across multiple blockchains.',
    canonical: baseUrl,
  },

  dashboard: {
    title: 'Dashboard | NYALTX',
    description:
      'Access your personalized crypto dashboard with real-time token tracking, favorites, and portfolio management.',
    canonical: `${baseUrl}/dashboard`,
  },

  trade: {
    title: 'Trade Crypto Tokens | NYALTX',
    description:
      'Trade cryptocurrencies with real-time charts, market data, and advanced trading tools on NYALTX platform.',
    canonical: `${baseUrl}/dashboard/trade`,
  },

  trending: {
    title: 'Trending Crypto Tokens | NYALTX',
    description:
      'Discover trending cryptocurrencies, market movers, and recently added tokens with real-time data and analytics.',
    canonical: `${baseUrl}/dashboard/trending`,
  },

  raceToLiberty: {
    title: 'Race to Liberty | NYALTX Gamification',
    description:
      'Join the Race to Liberty competition! Boost your token visibility with gamified marketing campaigns and weekly competitions.',
    canonical: `${baseUrl}/race-to-liberty`,
  },

  pricing: {
    title: 'Pricing Plans | NYALTX',
    description:
      'Choose your NYALTX plan: Kayak, Paddle Boat, Motor Boat, or Helicopter tiers for token promotion and visibility.',
    canonical: `${baseUrl}/pricing`,
  },

  liveStream: {
    title: 'Live Crypto Streaming | NYALTX',
    description:
      'Watch and broadcast live crypto streams with real-time chat, token discussions, and community engagement.',
    canonical: `${baseUrl}/dashboard/live-stream`,
  },

  tokenRegistration: {
    title: 'Register Your Token | NYALTX',
    description:
      'Submit your cryptocurrency token for listing on NYALTX. Get visibility, boost multipliers, and community exposure.',
    canonical: `${baseUrl}/dashboard/register-token`,
  },

  gamification: {
    title: 'Crypto Gamification | NYALTX',
    description:
      'Explore NYALTX gamification features including leaderboards, boost packs, weekly competitions, and token promotion campaigns.',
    canonical: `${baseUrl}/dashboard/gamification`,
  },

  about: {
    title: 'About NYALTX | Crypto Token Platform',
    description:
      'Learn about NYALTX mission to democratize crypto token discovery and provide innovative marketing solutions for blockchain projects.',
    canonical: `${baseUrl}/about-us`,
  },

  contact: {
    title: 'Contact NYALTX | Get Support',
    description:
      'Get in touch with NYALTX team for support, partnerships, or questions about our crypto token tracking platform.',
    canonical: `${baseUrl}/contact`,
  },
};

// JSON-LD structured data
export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NYALTX',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  description:
    'Crypto token tracker and DeFi platform for discovering, tracking, and promoting cryptocurrency tokens.',
  sameAs: ['https://twitter.com/nyaltx', 'https://t.me/nyaltx', 'https://discord.gg/nyaltx'],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-XXX-XXX-XXXX', // Replace with actual number
    contactType: 'Customer Service',
    availableLanguage: 'English',
  },
};

export const websiteJsonLd = {
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
};
