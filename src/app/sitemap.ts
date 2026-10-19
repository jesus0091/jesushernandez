import type { MetadataRoute } from "next";
import { WORKS } from "@/data/works";
import { routing } from "@/i18n/routing";
import { TRANSLATED_PATHS, absoluteUrl, isTranslated } from "@/i18n/seo";

const PRIORITY: Record<string, number> = { "/": 1, "/works": 0.9 };

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = [
    ...new Set([
      ...TRANSLATED_PATHS,
      "/works",
      ...WORKS.map((w) => `/works/${w.id}`),
    ]),
  ];

  // A translated page is listed once per language, each pointing at the other.
  // Everything else is English only, with no alternates.
  return paths.flatMap((path) => {
    const translated = isTranslated(path);
    const locales = translated ? routing.locales : [routing.defaultLocale];
    const languages = Object.fromEntries(
      routing.locales.map((l) => [l, absoluteUrl(path, l)]),
    );

    return locales.map((locale) => ({
      url: absoluteUrl(path, locale),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: PRIORITY[path] ?? 0.7,
      ...(translated && { alternates: { languages } }),
    }));
  });
}
