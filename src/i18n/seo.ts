import type { Metadata } from "next";
import { pageFor } from "./pages";
import { localizePath } from "./paths";
import { routing, type Locale } from "./routing";

export const SITE = "https://jesushernandez.site";

/** The JSON-LD @id of the site's author, referenced by every page and article. */
export const PERSON_ID = `${SITE}/#person`;

export const OG_LOCALE: Record<Locale, string> = { en: "en_US", es: "es_LA" };

/** Absolute URL of a path in a locale; the English home stays "/" like the sitemap. */
export function absoluteUrl(path: string, locale: Locale): string {
  const local = localizePath(path, locale);
  return local === "/" ? `${SITE}/` : `${SITE}${local}`;
}

/** Absolute URL of each language version of a page (only those that exist). */
export function languageUrls(key: string): Partial<Record<Locale, string>> {
  const { paths } = pageFor(key);
  return Object.fromEntries(
    routing.locales.filter((l) => paths[l]).map((l) => [l, absoluteUrl(paths[l]!, l)]),
  );
}

/** True when the page exists in more than one language. */
export function isTranslated(key: string): boolean {
  return Object.keys(pageFor(key).paths).length > 1;
}

/**
 * Canonical for this locale, plus hreflang links when the page exists in more
 * than one language. A locale without its own version keeps a self canonical
 * (it is noindexed, and noindex shouldn't point a canonical elsewhere).
 */
export function alternatesFor(key: string, locale: Locale): Metadata["alternates"] {
  const urls = languageUrls(key);
  const canonical = urls[locale] ?? absoluteUrl(key, locale);
  if (!isTranslated(key)) return { canonical };
  return { canonical, languages: { ...urls, "x-default": urls[routing.defaultLocale]! } };
}

/**
 * Out of the index: pages flagged as not ready, and a locale's view of a page
 * that has no version in that language (it shows the English content).
 */
export function robotsFor(key: string, locale: Locale): Metadata["robots"] | undefined {
  const page = pageFor(key);
  return !page.index || !page.paths[locale] ? { index: false, follow: true } : undefined;
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
