import { describe, expect, it } from "vitest";
import { PAGES } from "./pages";
import { routing } from "./routing";
import { OG_LOCALE, SITE, alternatesFor, isTranslated, robotsFor } from "./seo";

describe("seo", () => {
  it("knows which pages are translated", () => {
    expect(isTranslated("/")).toBe(true);
    expect(isTranslated("/lab")).toBe(true);
    expect(isTranslated("/works")).toBe(false);
    expect(isTranslated("/works/ristario")).toBe(false);
  });

  it("builds alternates for translated pages", () => {
    expect(alternatesFor("/", "es")).toEqual({
      canonical: "https://jesushernandez.site/es",
      languages: {
        en: "https://jesushernandez.site/",
        es: "https://jesushernandez.site/es",
        "x-default": "https://jesushernandez.site/",
      },
    });
    expect(alternatesFor("/lab", "en")).toEqual({
      canonical: `${SITE}/lab`,
      languages: { en: `${SITE}/lab`, es: `${SITE}/es/lab`, "x-default": `${SITE}/lab` },
    });
  });

  it("gives untranslated pages a self canonical only", () => {
    expect(alternatesFor("/works/ristario", "en")).toEqual({
      canonical: "https://jesushernandez.site/works/ristario",
    });
    expect(alternatesFor("/works/ristario", "es")).toEqual({
      canonical: "https://jesushernandez.site/es/works/ristario",
    });
  });

  it("noindexes untranslated Spanish views and pages without content", () => {
    expect(robotsFor("/works", "es")).toEqual({ index: false, follow: true });
    expect(robotsFor("/works", "en")).toBeUndefined();
    expect(robotsFor("/", "es")).toBeUndefined();
    expect(robotsFor("/lab", "en")).toEqual({ index: false, follow: true });
    expect(robotsFor("/blog", "es")).toEqual({ index: false, follow: true });
    expect(robotsFor("/works/ristario", "en")).toBeUndefined();
    expect(robotsFor("/works/iacon", "en")).toEqual({ index: false, follow: true });
  });

  it("only declares reciprocal hreflang between registered versions", () => {
    for (const key of Object.keys(PAGES)) {
      for (const locale of routing.locales) {
        const languages = alternatesFor(key, locale)?.languages as Record<string, string> | undefined;
        if (!languages) continue;
        for (const [lang, url] of Object.entries(languages)) {
          if (lang === "x-default") continue;
          // The version it points at must list this one back.
          const back = alternatesFor(key, lang as typeof locale)?.languages as Record<string, string>;
          expect(back[locale]).toBe(languages[locale]);
          expect(alternatesFor(key, lang as typeof locale)?.canonical).toBe(url);
        }
      }
    }
  });

  it("throws for pages missing from the registry", () => {
    expect(() => alternatesFor("/nope", "en")).toThrow(/missing/);
  });

  it("maps locales to Open Graph locales", () => {
    expect(OG_LOCALE).toEqual({ en: "en_US", es: "es_LA" });
  });
});
