import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

type Tree = { [key: string]: string | string[] | Tree };

/** Flattens nested messages into `a.b.c` keys (and their values); list items are `a.b.0`, `a.b.1`… */
function flatten(tree: Tree, prefix = ""): [string, string][] {
  return Object.entries(tree).flatMap(([k, v]) =>
    typeof v === "string" ? [[`${prefix}${k}`, v] as [string, string]] : flatten({ ...v } as Tree, `${prefix}${k}.`)
  );
}

describe("messages", () => {
  it("en and es have exactly the same keys", () => {
    const keys = (t: Tree) => flatten(t).map(([k]) => k).sort();
    expect(keys(es as Tree)).toEqual(keys(en as Tree));
  });

  it("no es value is empty", () => {
    const empty = flatten(es as Tree).filter(([, v]) => v.trim() === "").map(([k]) => k);
    expect(empty).toEqual([]);
  });
});
