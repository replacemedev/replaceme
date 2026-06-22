import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: false, // Vercel handles compression at the edge layer; disabling it in Next.js reduces serverless execution overhead.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;

