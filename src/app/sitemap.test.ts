import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  const entries = sitemap();
  const byUrl = (url: string) => entries.filter((e) => e.url === url);
  const urls = entries.map((e) => e.url);

  it("lists translated pages in both languages with alternates and x-default", () => {
    const languages = {
      en: "https://jesushernandez.site/",
      es: "https://jesushernandez.site/es",
      "x-default": "https://jesushernandez.site/",
    };
    for (const url of ["https://jesushernandez.site/", "https://jesushernandez.site/es"]) {
      const found = byUrl(url);
      expect(found).toHaveLength(1);
      expect(found[0].alternates?.languages).toEqual(languages);
    }
  });

  it("lists translated slugs with reciprocal alternates", () => {
    const found = byUrl("https://jesushernandez.site/es/sobre-mi");
    expect(found).toHaveLength(1);
    expect(found[0].alternates?.languages).toEqual({
      en: "https://jesushernandez.site/about",
      es: "https://jesushernandez.site/es/sobre-mi",
      "x-default": "https://jesushernandez.site/about",
    });
  });

  it("lists indexed projects in English only, without alternates", () => {
    const found = byUrl("https://jesushernandez.site/works/ristario");
    expect(found).toHaveLength(1);
    expect(found[0].alternates).toBeUndefined();
  });

  it("leaves out pages without content and Spanish works", () => {
    for (const path of ["/blog", "/es/blog", "/lab", "/es/lab", "/works/iacon", "/works/move-the-chain"]) {
      expect(urls).not.toContain(`https://jesushernandez.site${path}`);
    }
    expect(urls.some((u) => u.includes("/es/works"))).toBe(false);
  });

  it("uses each page's content date, not the build time", () => {
    expect(entries.every((e) => /^\d{4}-\d{2}-\d{2}$/.test(String(e.lastModified)))).toBe(true);
    expect(sitemap()).toEqual(entries);
  });
});
