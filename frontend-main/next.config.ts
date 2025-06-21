import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["img.freepik.com", "i.guim.co.uk"],
  },
  // Add configuration to help with hydration issues
  experimental: {
    // This can help with hydration issues
    optimizePackageImports: ["@rainbow-me/rainbowkit", "wagmi"],
  },
  // Ensure proper SSR handling
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
