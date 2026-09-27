import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // The two Move The Chain case studies were merged into one.
      ...["mtc-fe", "mtc-ux"].map((id) => ({
        source: `/works/${id}`,
        destination: "/works/move-the-chain",
        permanent: true,
      })),
      // Old standalone pages, now sections of the home page.
      { source: "/about", destination: "/#about", permanent: true },
      { source: "/projects", destination: "/works", permanent: true },
    ];
  },
  // Security headers only take effect as real HTTP headers, not <meta> tags.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
