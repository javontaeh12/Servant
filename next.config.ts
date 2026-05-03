import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-606b1ef7f1be462ba03a314cbae996f9.r2.dev",
      },
    ],
  },
};

export default nextConfig;
