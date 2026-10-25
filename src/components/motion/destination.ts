import { getWorkById } from "@/data/works";
import { stripLocale } from "@/i18n/paths";
import { pathInLocale } from "@/i18n/slugs";

const PAGE_KEYS: Record<string, string> = {
  "/": "pages.home",
  "/works": "pages.works",
  "/lab": "pages.lab",
  "/blog": "pages.blog",
  "/about": "pages.about",
  "/services": "pages.services",
};

/**
 * What the black screen says on the way to `pathname`: the page (translated
 * by `t`), or the project's name. Kept apart from PageTransition so it can be
 * tested without GSAP or React.
 */
export function destinationName(pathname: string, t: (key: string) => string): string {
  const { locale, path: localizedPath } = stripLocale(pathname);
  const path = pathInLocale(localizedPath, locale, "en");
  if (PAGE_KEYS[path]) return t(PAGE_KEYS[path]);
  const [, section, id] = path.split("/");
  if (section === "works" && id) return getWorkById(id)?.productName ?? id;
  const last = path.split("/").filter(Boolean).pop() ?? "";
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
