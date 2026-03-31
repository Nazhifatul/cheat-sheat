import { describe, expect, it } from "vitest";

import { computeVisibleWords } from "@/utils/wordsView";

describe("computeVisibleWords", () => {
  it("dedupe, startsWith, and apply limit", () => {
    const result = computeVisibleWords({
      words: ["Atap", "atap", "Batu"],
      query: "a",
      sortMode: "recent",
      minLen: null,
      maxLen: null,
      limit: 1,
    });

    expect(result.totalUnique).toBe(2);
    expect(result.matched).toBe(1);
    expect(result.visible).toEqual(["Atap"]);
  });

  it("sort A-Z and filter by length", () => {
    const result = computeVisibleWords({
      words: ["tif", "tiflofili", "tifa"],
      query: "tif",
      sortMode: "az",
      minLen: 4,
      maxLen: 7,
      limit: 10,
    });

    expect(result.visible).toEqual(["tifa"]);
  });
});

