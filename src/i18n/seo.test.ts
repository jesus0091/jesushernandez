import { describe, expect, it } from "vitest";
import { OG_LOCALE, SITE, alternatesFor, isTranslated, robotsFor } from "./seo";

describe("seo", () => {
  it("knows which paths are translated", () => {
    expect(isTranslated("/")).toBe(true);
    expect(isTranslated("/lab")).toBe(true);
    expect(isTranslated("/works")).toBe(false);
    expect(isTranslated("/works/ristario")).toBe(false);
  });

  it("builds alternates for translated paths", () => {
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

  it("gives untranslated paths a canonical only", () => {
    expect(alternatesFor("/works/ristario", "en")).toEqual({
      canonical: "https://jesushernandez.site/works/ristario",
    });
  });

  it("noindexes only untranslated Spanish pages", () => {
    expect(robotsFor("/works", "es")).toEqual({ index: false, follow: true });
    expect(robotsFor("/works", "en")).toBeUndefined();
    expect(robotsFor("/lab", "es")).toBeUndefined();
  });

  it("maps locales to Open Graph locales", () => {
    expect(OG_LOCALE).toEqual({ en: "en_US", es: "es_LA" });
  });
});
