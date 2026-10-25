import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";
import { LOCALIZED_SLUGS, RETIRED_SERVICES, esPath } from "./src/i18n/slugs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    // Unmatched URLs render src/app/global-not-found.tsx with the right <html lang>.
    globalNotFound: true,
    // The CSS is small (~18 KiB): inlined in the HTML it no longer blocks the first paint.
    inlineCss: true,
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
      // Old standalone page, now /works.
      { source: `${prefix}/projects`, destination: `${prefix}/works`, permanent: true },
    ]).concat(
      // Services folded into others: design is part of every service, AI part of web apps.
      RETIRED_SERVICES.flatMap(({ en, es, to }) => [
        { source: en, destination: to, permanent: true },
        { source: `/es${en}`, destination: `/es${esPath(to)}`, permanent: true },
        { source: `/es${es}`, destination: `/es${esPath(to)}`, permanent: true },
      ]),
    ).concat(
      // Spanish pages have Spanish URLs: the English-path one redirects there.
      LOCALIZED_SLUGS.map(({ en, es }) => ({ source: `/es${en}`, destination: `/es${es}`, permanent: true })),
    );
  },
  // …and the Spanish URL is served by the route at the English path.
  async rewrites() {
    return LOCALIZED_SLUGS.map(({ en, es }) => ({ source: `/es${es}`, destination: `/es${en}` }));
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
