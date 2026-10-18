import type { MetadataRoute } from "next";

const CANONICAL = "https://jesushernandez.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${CANONICAL}/sitemap.xml`,
  };
}
