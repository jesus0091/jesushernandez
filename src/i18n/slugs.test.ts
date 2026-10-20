import { describe, expect, it } from "vitest";
import { esPath, pathInLocale } from "./slugs";

describe("slugs", () => {
  it("translates the paths that have a Spanish URL", () => {
    expect(esPath("/about")).toBe("/sobre-mi");
    expect(esPath("/services")).toBe("/servicios");
    expect(esPath("/works")).toBe("/works");
  });

  it("maps a page's path between languages", () => {
    expect(pathInLocale("/sobre-mi", "es", "en")).toBe("/about");
    expect(pathInLocale("/about", "en", "es")).toBe("/sobre-mi");
    expect(pathInLocale("/works/ristario", "en", "es")).toBe("/works/ristario");
  });
});
