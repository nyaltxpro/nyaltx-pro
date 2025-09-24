import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
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
      "i.imgur.com"
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
    ],
  },
};

export default nextConfig;
