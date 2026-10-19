import { describe, expect, it } from "vitest";
import { localizePath, stripLocale } from "./paths";

describe("localizePath", () => {
  it("prefixes Spanish paths", () => {
    expect(localizePath("/works", "es")).toBe("/es/works");
    expect(localizePath("/", "es")).toBe("/es");
    expect(localizePath("/works?x=1#top", "es")).toBe("/es/works?x=1#top");
  });

  it("leaves English paths alone", () => {
    expect(localizePath("/works/ristario", "en")).toBe("/works/ristario");
  });
});

describe("stripLocale", () => {
  it("splits the Spanish prefix from the path", () => {
    expect(stripLocale("/es/works/ristario")).toEqual({ locale: "es", path: "/works/ristario" });
    expect(stripLocale("/es")).toEqual({ locale: "es", path: "/" });
  });

  it("treats everything else as English", () => {
    expect(stripLocale("/estudio")).toEqual({ locale: "en", path: "/estudio" }); // "es" only as a whole segment
    expect(stripLocale("/works")).toEqual({ locale: "en", path: "/works" });
  });
});
