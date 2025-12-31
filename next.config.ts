import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    // Only rewrite in development. In production, Vercel handles /api automatically.
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://127.0.0.1:5328/api/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
