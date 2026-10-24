import { WORKS } from "@/data/works";
import { getPostKeys, getPosts } from "@/lib/blog";
import type { Locale } from "./routing";
import { esPath } from "./slugs";

/**
 * Every public page, once: which languages it exists in, its path in each,
 * whether search engines should index it, and when its content last changed.
 * Canonicals, hreflang, robots and the sitemap are all derived from here.
 */
export type Page = {
  /** Path per language. A language left out has no version of this page. */
  paths: Partial<Record<Locale, string>>;
  /** False for pages without real content yet (empty or thin). */
  index: boolean;
  /** Last real content change, as an ISO date. Never the build time. */
  updated: string;
};

// Case studies with enough substance to be worth indexing. The rest stay
// reachable from /works but out of the index until they're expanded.
const INDEXED_WORKS = new Set(["ristario", "fundacion-pataro"]);

const BOTH = (path: string) => ({ en: path, es: path });

const POSTS = getPosts();
// Drafts stay out of the index (they only exist outside production anyway).
const PUBLISHED = POSTS.filter((p) => !p.draft);
const latest = (dates: string[], fallback: string) => dates.sort().at(-1) ?? fallback;

export const PAGES: Record<string, Page> = {
  "/": { paths: BOTH("/"), index: true, updated: "2026-10-20" },
  "/about": { paths: { en: "/about", es: esPath("/about") }, index: true, updated: "2026-10-20" },
  "/services": { paths: { en: "/services", es: esPath("/services") }, index: true, updated: "2026-10-24" },
  "/works": { paths: { en: "/works" }, index: true, updated: "2026-10-16" },
  // Indexed once it lists its first published post.
  "/blog": {
    paths: BOTH("/blog"),
    index: PUBLISHED.length > 0,
    updated: latest(PUBLISHED.map((p) => p.updated), "2026-10-19"),
  },
  // Empty until it has its first entries.
  "/lab": { paths: BOTH("/lab"), index: false, updated: "2026-10-19" },
  ...Object.fromEntries(
    getPostKeys().map((key) => {
      const versions = POSTS.filter((p) => p.key === key);
      const page: Page = {
        paths: Object.fromEntries(versions.map((p) => [p.locale, `/blog/${p.slug}`])),
        index: versions.every((p) => !p.draft),
        updated: latest(versions.map((p) => p.updated), versions[0].date),
      };
      return [`/blog/${key}`, page];
    }),
  ),
  ...Object.fromEntries(
    WORKS.map((w) => [
      `/works/${w.id}`,
      { paths: { en: `/works/${w.id}` }, index: INDEXED_WORKS.has(w.id), updated: "2026-10-16" },
    ]),
  ),
};

/** The registry entry for a page, by its English path. */
export function pageFor(key: string): Page {
  const page = PAGES[key];
  if (!page) throw new Error(`Page "${key}" is missing from src/i18n/pages.ts`);
  return page;
}
