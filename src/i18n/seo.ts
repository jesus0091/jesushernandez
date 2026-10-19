import type { Metadata } from "next";
import { localizePath } from "./paths";
import { routing, type Locale } from "./routing";

export const SITE = "https://jesushernandez.site";

/** Paths with a real Spanish version. Phase 2 adds /works and the projects. */
export const TRANSLATED_PATHS: string[] = ["/", "/lab", "/blog"];

export const OG_LOCALE: Record<Locale, string> = { en: "en_US", es: "es_LA" };

export function isTranslated(path: string): boolean {
  return TRANSLATED_PATHS.includes(path);
}

/** Absolute URL of a path in a locale; the English home stays "/" like the sitemap. */
export function absoluteUrl(path: string, locale: Locale): string {
  const local = localizePath(path, locale);
  return local === "/" ? `${SITE}/` : `${SITE}${local}`;
}

/** Canonical for this locale, plus hreflang links when the page exists in both. */
export function alternatesFor(path: string, locale: Locale): Metadata["alternates"] {
  const canonical = absoluteUrl(path, locale);
  if (!isTranslated(path)) return { canonical };

  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = absoluteUrl(path, l);
  languages["x-default"] = languages[routing.defaultLocale];
  return { canonical, languages };
}

/** Untranslated Spanish pages show English content: keep them out of the index. */
export function robotsFor(path: string, locale: Locale): Metadata["robots"] | undefined {
  return locale !== routing.defaultLocale && !isTranslated(path)
    ? { index: false, follow: true }
    : undefined;
}

/**
 * Share-card metadata for a page. The image is addressed by its public URL
 * ("/opengraph-image", "/es/opengraph-image"): the "/en/..." form that the
 * file convention emits is redirected by the middleware.
 */
export function shareFor(
  path: string,
  locale: Locale,
  { title, description }: { title: string; description: string },
): Pick<Metadata, "openGraph" | "twitter"> {
  const image = absoluteUrl("/opengraph-image", locale);
  return {
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      siteName: "Jesús Hernández",
      url: absoluteUrl(path, locale),
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
