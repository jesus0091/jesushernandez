import type { MetadataRoute } from "next";
import { WORKS } from "@/data/works";

const CANONICAL = "https://jesushernandez.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const workPages = WORKS.map((w) => ({
    url: `${CANONICAL}/works/${w.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: CANONICAL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${CANONICAL}/works`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...workPages,
  ];
}
