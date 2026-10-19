import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  const entries = sitemap();
  const byUrl = (url: string) => entries.filter((e) => e.url === url);

  it("lists translated pages in both languages with alternates", () => {
    const languages = {
      en: "https://jesushernandez.site/",
      es: "https://jesushernandez.site/es",
    };
    for (const url of ["https://jesushernandez.site/", "https://jesushernandez.site/es"]) {
      const found = byUrl(url);
      expect(found).toHaveLength(1);
      expect(found[0].alternates?.languages).toEqual(languages);
    }
  });

  it("lists projects in English only, without alternates", () => {
    const found = byUrl("https://jesushernandez.site/works/ristario");
    expect(found).toHaveLength(1);
    expect(found[0].alternates).toBeUndefined();
  });

  it("never lists Spanish works", () => {
    expect(entries.some((e) => e.url.includes("/es/works"))).toBe(false);
  });
});
