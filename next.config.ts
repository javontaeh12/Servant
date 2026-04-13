import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kesljsznlppvxqtgrlww.supabase.co",
      },
    ],
  },
};

export default nextConfig;
