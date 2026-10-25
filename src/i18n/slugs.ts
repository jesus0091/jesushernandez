/**
 * Pages whose Spanish URL differs from the English one. The route lives at
 * the English path; next.config.ts rewrites the Spanish URL to it and
 * redirects "/es" + English path to the Spanish URL. Kept free of imports so
 * next.config.ts can load it.
 */
export const LOCALIZED_SLUGS: { en: string; es: string }[] = [
  { en: "/about", es: "/sobre-mi" },
  { en: "/services", es: "/servicios" },
  // One page per service (src/data/services.ts).
  { en: "/services/web-development", es: "/servicios/desarrollo-web" },
  { en: "/services/web-apps", es: "/servicios/desarrollo-de-aplicaciones-web" },
  { en: "/services/mobile-apps", es: "/servicios/desarrollo-de-apps-moviles" },
  // Blog posts: the English slug is the route, each post's alternateSlug its
  // Spanish URL. src/lib/blog.test.ts checks this list against content/blog.
  { en: "/blog/is-vibe-coding-bad", es: "/blog/vibe-coding-en-produccion" },
  { en: "/blog/gsap-scrolltrigger-nextjs-app-router", es: "/blog/gsap-scrolltrigger-nextjs" },
  { en: "/blog/how-much-does-a-website-cost", es: "/blog/cuanto-cuesta-una-pagina-web-en-argentina" },
];

/** Service pages that no longer exist, by their old URLs, and the page that took their place. */
export const RETIRED_SERVICES: { en: string; es: string; to: string }[] = [
  { en: "/services/product-design", es: "/servicios/diseno-de-producto-ux-ui", to: "/services" },
  { en: "/services/ai-features", es: "/servicios/funciones-de-ia", to: "/services/web-apps" },
  { en: "/services/ai-prototype-to-production", es: "/servicios/prototipo-ia-a-produccion", to: "/services/web-apps" },
];

/** Spanish path for an English one (unchanged when it isn't translated). */
export const esPath = (en: string): string => LOCALIZED_SLUGS.find((s) => s.en === en)?.es ?? en;

/** The same page in another language, by the current one's path ("/sobre-mi" → "/about"). */
export function pathInLocale(path: string, from: "en" | "es", to: "en" | "es"): string {
  if (from === to) return path;
  return LOCALIZED_SLUGS.find((s) => s[from] === path)?.[to] ?? path;
}
