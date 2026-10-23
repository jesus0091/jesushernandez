import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked, type Tokens } from "marked";
import { highlight } from "sugar-high";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Blog posts, read from content/blog/<locale>/<slug>.md at build time.
 *
 * A post and its translation share a key: the English slug. Routes and the
 * page registry use the key ("/blog/<key>"); the Spanish URL is the Spanish
 * slug, mapped to the key in src/i18n/slugs.ts like any other localized path.
 */
export type Post = {
  /** The English slug, shared by both language versions. */
  key: string;
  locale: Locale;
  /** This version's own slug (its URL is /blog/<slug> in its locale). */
  slug: string;
  title: string;
  description: string;
  /** ISO dates (YYYY-MM-DD). */
  date: string;
  updated: string;
  keywords: string[];
  /** Drafts only exist outside production (they still have placeholders). */
  draft: boolean;
  minutes: number;
  html: string;
};

const ROOT = path.join(process.cwd(), "content", "blog");
const WORDS_PER_MINUTE = 220;

/** "¿Qué es el vibe coding?" → "que-es-el-vibe-coding", for heading anchors. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/<[^>]+>|&[a-z0-9#]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const markdown = new Marked({
  gfm: true,
  renderer: {
    heading({ tokens, depth }: Tokens.Heading) {
      const html = this.parser.parseInline(tokens);
      return `<h${depth} id="${slugify(html)}">${html}</h${depth}>\n`;
    },
    // Highlighted on the server: the page ships no highlighter.
    code({ text, lang }: Tokens.Code) {
      const label = lang ? ` data-lang="${lang}"` : "";
      return `<pre${label}><code>${highlight(text)}</code></pre>\n`;
    },
    link({ href, tokens }: Tokens.Link) {
      const html = this.parser.parseInline(tokens);
      const external = /^https?:\/\//.test(href);
      return external
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${html}</a>`
        : `<a href="${href}">${html}</a>`;
    },
  },
});

/** Tables scroll inside their own box, so a wide one never scrolls the page sideways. */
const wrapTables = (html: string) =>
  html.replace(/<table>/g, '<div class="post-table" tabindex="0" role="region" aria-label="Table"><table>').replace(/<\/table>/g, "</table></div>");

/** gray-matter parses bare YAML dates as Date objects. */
const isoDate = (value: unknown) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : String(value);

function readPost(locale: Locale, file: string): Post {
  const { data, content } = matter(fs.readFileSync(path.join(ROOT, locale, file), "utf8"));
  const slug = String(data.slug ?? file.replace(/\.md$/, ""));
  // The page renders the title itself, so the body's own H1 is dropped.
  const body = content.replace(/^\s*# .*\n/, "");
  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    key: locale === routing.defaultLocale ? slug : String(data.alternateSlug ?? slug),
    locale,
    slug,
    title: String(data.title),
    description: String(data.description),
    date: isoDate(data.date),
    updated: isoDate(data.updated ?? data.date),
    keywords: (data.keywords as string[] | undefined) ?? [],
    draft: data.draft === true,
    minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    html: wrapTables(markdown.parse(body, { async: false })),
  };
}

const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

const ALL: Post[] = routing.locales.flatMap((locale) => {
  const dir = path.join(ROOT, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readPost(locale, f));
});

/** Every post that exists in this build, newest first. */
export function getPosts(locale?: Locale): Post[] {
  return ALL.filter((p) => (SHOW_DRAFTS || !p.draft) && (!locale || p.locale === locale)).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

/** One language version of a post, by its shared key. */
export function getPost(locale: Locale, key: string): Post | undefined {
  return getPosts(locale).find((p) => p.key === key);
}

/** "22 October 2026" / "22 de octubre de 2026". Read as UTC so the day never shifts. */
export function formatPostDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

/** Every post key, once, whatever languages it exists in. */
export function getPostKeys(): string[] {
  return [...new Set(getPosts().map((p) => p.key))];
}
