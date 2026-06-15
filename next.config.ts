import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.tchilla.com" },
      { protocol: "https", hostname: "api.hmg.tchilla.com" },
      { protocol: "https", hostname: "storage.tchilla.com" },
      { protocol: "http", hostname: "181.215.135.159", port: "9000" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [{ source: "/api-proxy/:path*", destination: `${process.env.API_URL}/:path*` }]
      : [];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
