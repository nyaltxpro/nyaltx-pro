import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: '/(.*)', // apply to all routes
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // allow embedding anywhere
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;", // optional: modern CSP replacement
          },
        ],
      },
    ]
  },
  
  typescript: {
    // Disable TypeScript errors during builds (optional)
    ignoreBuildErrors: true,
  },
  // Disable static optimization for pages that might call APIs during build
  // experimental: {
  //   // Skip static optimization for pages with dynamic content
  //   skipTrailingSlashRedirect: true,
  // },
  // Environment variables for build-time detection
  env: {
    NEXT_PHASE: process.env.NEXT_PHASE || '',
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding",'@solana/web3.js', '@solana/wallet-adapter-wallets','@solana/wallet-adapter-react-ui','@reown/appkit-adapter-solana','@reown/appkit-adapter-wagmi');
    
    // Suppress punycode deprecation warnings
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
      /Critical dependency: the request of a dependency is an expression/,
    ];
    
    return config;
  },
  
  images: {
    domains: [
      "coin-images.coingecko.com", 
      "cryptologos.cc",
      "ipfs.io",
      "gateway.ipfs.io",
      "cloudflare-ipfs.com",
      "dweb.link",
      "assets.coingecko.com",
      "s2.coinmarketcap.com",
      "raw.githubusercontent.com",
      "github.com",
      "imgur.com",
      "i.imgur.com",
      "www.nyaltx.com",
      "api.geckoterminal.com",
      "images.pump.fun",
      "logo.moralis.io",
      "cdn.dexscreener.com",
      "dd.dexscreener.com",
        "assets.tina.io"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cryptologos.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gateway.ipfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dweb.link",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s2.coinmarketcap.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imgur.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.nyaltx.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.geckoterminal.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pump.fun",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "logo.moralis.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.dexscreener.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dd.dexscreener.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.tina.io", // ✅ Added TinaCMS remote pattern
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nyaltx.pro ", // ✅ Added TinaCMS remote pattern
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
