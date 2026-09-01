import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  env: {
    NEXT_PHASE: process.env.NEXT_PHASE || '',
  },

  // Avoid Next 15 minify plugin crash that masks the real error as
  // "WebpackError is not a constructor" on large server bundles.
  experimental: {
    serverMinification: false,
    webpackMemoryOptimizations: true,
    cpus: 1,
  },

  serverExternalPackages: [
    'pino-pretty',
    'lokijs',
    'encoding',
  ],

  webpack: (config, { isServer, dev }) => {
    // Only externalize Node-only packages. Do NOT externalize Solana/Reown
    // client SDKs — that produces broken bundles and minify failures.
    if (isServer) {
      const existing = Array.isArray(config.externals)
        ? config.externals
        : config.externals
          ? [config.externals]
          : [];
      config.externals = [
        ...existing,
        'pino-pretty',
        'lokijs',
        'encoding',
      ];
    }

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Optional wagmi Tempo dependency — not installed, must not fail resolve
      accounts: false,
    };

    // Reduce peak memory during production minify on Vercel 2-core builders
    if (!dev) {
      config.parallelism = 1;
    }

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
      "assets.tina.io",
      "coinmarketcal-share.s3.eu-west-1.amazonaws.com",
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
        hostname: "assets.tina.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "coinmarketcal-share.s3.eu-west-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nyaltx.pro",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
