import type { MetadataRoute } from "next";
import { PAGES } from "@/i18n/pages";
import { routing } from "@/i18n/routing";
import { absoluteUrl, isTranslated, languageUrls } from "@/i18n/seo";

// Only indexable pages, once per language they exist in. lastModified is the
// page's real content date (src/i18n/pages.ts), so it only moves when the
// content does. changefreq and priority are left out: Google ignores them.
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.entries(PAGES)
    .filter(([, page]) => page.index)
    .flatMap(([key, page]) => {
      const translated = isTranslated(key);
      const languages = { ...languageUrls(key), "x-default": absoluteUrl(page.paths.en ?? key, routing.defaultLocale) };

      return routing.locales
        .filter((locale) => page.paths[locale])
        .map((locale) => ({
          url: absoluteUrl(page.paths[locale]!, locale),
          lastModified: page.updated,
          ...(translated && { alternates: { languages } }),
        }));
    });
}
