import { routing, type Locale } from "./routing";

const PREFIXED = routing.locales.filter((l) => l !== routing.defaultLocale);

/** Adds the locale prefix to an internal path (query and hash are kept). */
export function localizePath(path: string, locale: Locale): string {
  if (locale === routing.defaultLocale) return path;
  const prefix = `/${locale}`;
  return path === "/" ? prefix : `${prefix}${path}`;
}

/** Splits a pathname into its locale and the unprefixed path. */
export function stripLocale(pathname: string): { locale: Locale; path: string } {
  for (const locale of PREFIXED) {
    const prefix = `/${locale}`;
    if (pathname === prefix) return { locale, path: "/" };
    if (pathname.startsWith(`${prefix}/`)) return { locale, path: pathname.slice(prefix.length) };
  }
  return { locale: routing.defaultLocale, path: pathname };
}
