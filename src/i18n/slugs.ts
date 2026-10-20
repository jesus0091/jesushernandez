/**
 * Pages whose Spanish URL differs from the English one. The route lives at
 * the English path; next.config.ts rewrites the Spanish URL to it and
 * redirects "/es" + English path to the Spanish URL. Kept free of imports so
 * next.config.ts can load it.
 */
export const LOCALIZED_SLUGS: { en: string; es: string }[] = [
  { en: "/about", es: "/sobre-mi" },
  { en: "/services", es: "/servicios" },
];

/** Spanish path for an English one (unchanged when it isn't translated). */
export const esPath = (en: string): string => LOCALIZED_SLUGS.find((s) => s.en === en)?.es ?? en;

/** The same page in another language, by the current one's path ("/sobre-mi" → "/about"). */
export function pathInLocale(path: string, from: "en" | "es", to: "en" | "es"): string {
  if (from === to) return path;
  return LOCALIZED_SLUGS.find((s) => s[from] === path)?.[to] ?? path;
}
