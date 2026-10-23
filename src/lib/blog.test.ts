import { describe, expect, it } from "vitest";
import { LOCALIZED_SLUGS, pathInLocale } from "@/i18n/slugs";
import { getPost, getPostKeys, getPosts } from "./blog";

describe("blog", () => {
  const posts = getPosts();

  it("reads every post with its metadata", () => {
    expect(posts.length).toBeGreaterThan(0);
    for (const p of posts) {
      expect(p.title).not.toBe("");
      expect(p.description.length).toBeLessThanOrEqual(160);
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.updated >= p.date).toBe(true);
    }
  });

  it("publishes no post with placeholders left in it", () => {
    for (const p of posts.filter((p) => !p.draft)) {
      expect(p.html, p.slug).not.toMatch(/\[\[/);
    }
  });

  it("maps each Spanish slug to its English key in src/i18n/slugs.ts", () => {
    for (const p of getPosts("es")) {
      expect(pathInLocale(`/blog/${p.slug}`, "es", "en")).toBe(`/blog/${p.key}`);
      expect(LOCALIZED_SLUGS).toContainEqual({ en: `/blog/${p.key}`, es: `/blog/${p.slug}` });
    }
  });

  it("pairs each translation with an English version", () => {
    for (const key of getPostKeys()) {
      expect(getPost("en", key), key).toBeDefined();
    }
  });

  it("drops the body's own H1 and gives headings anchors", () => {
    const post = getPost("en", "is-vibe-coding-bad")!;
    expect(post.html).not.toMatch(/<h1/);
    expect(post.html).toContain('<h2 id="what-do-i-mean-by-vibe-coding">');
  });

  it("wraps tables so they scroll on their own", () => {
    const post = getPost("es", "is-vibe-coding-bad")!;
    expect(post.html).toContain('<div class="post-table" tabindex="0" role="region" aria-label="Table"><table>');
  });

  it("opens external links in a new tab, internal ones in place", () => {
    const post = getPost("en", "is-vibe-coding-bad")!;
    expect(post.html).toContain('href="https://survey.stackoverflow.co/2025/ai" target="_blank" rel="noopener noreferrer"');
    expect(post.html).toMatch(/<a href="\/works\/ristario">/);
  });
});
