import { describe, expect, it } from "vitest";
import { destinationName } from "./destination";

const t = (key: string) => `T:${key}`;

describe("destinationName", () => {
  it("names a project by its product name, in either locale", () => {
    expect(destinationName("/es/works/ristario", t)).toBe("Ristario");
    expect(destinationName("/works/ristario", t)).toBe("Ristario");
  });

  it("translates the page names", () => {
    expect(destinationName("/es", t)).toBe("T:pages.home");
    expect(destinationName("/", t)).toBe("T:pages.home");
    expect(destinationName("/lab", t)).toBe("T:pages.lab");
    expect(destinationName("/es/works", t)).toBe("T:pages.works");
    expect(destinationName("/es/blog", t)).toBe("T:pages.blog");
    expect(destinationName("/about", t)).toBe("T:pages.about");
    expect(destinationName("/es/sobre-mi", t)).toBe("T:pages.about");
    expect(destinationName("/services", t)).toBe("T:pages.services");
    expect(destinationName("/es/servicios", t)).toBe("T:pages.services");
  });
});
