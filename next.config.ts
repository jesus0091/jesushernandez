import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    // Unmatched URLs render src/app/global-not-found.tsx with the right <html lang>.
    globalNotFound: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // Every rule exists twice: English at the root, Spanish under /es.
    return ["", "/es"].flatMap((prefix) => [
      // The two Move The Chain case studies were merged into one.
      ...["mtc-fe", "mtc-ux"].map((id) => ({
        source: `${prefix}/works/${id}`,
        destination: `${prefix}/works/move-the-chain`,
        permanent: true,
      })),
      // Old standalone pages, now sections of the home page.
      { source: `${prefix}/about`, destination: `${prefix}/#about`, permanent: true },
      { source: `${prefix}/projects`, destination: `${prefix}/works`, permanent: true },
    ]);
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

export default withNextIntl(nextConfig);
