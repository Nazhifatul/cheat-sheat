import { describe, expect, it } from "vitest";

import {
  filterWordsStartsWith,
  normalizeWord,
  sanitizeEntry,
  uniqueWordsCaseInsensitive,
} from "@/utils/filterWords";

describe("normalizeWord", () => {
  it("trim input", () => {
    expect(normalizeWord("  Anak  ")).toBe("Anak");
  });
});

describe("sanitizeEntry", () => {
  it("remove digits and collapse spaces", () => {
    expect(sanitizeEntry("  kata123   sambung  ")).toBe("kata sambung");
  });

  it("remove leading dot markers", () => {
    expect(sanitizeEntry(". yolks")).toBe("yolks");
    expect(sanitizeEntry("141. habituatif")).toBe("habituatif");
  });
});

describe("uniqueWordsCaseInsensitive", () => {
  it("remove duplicates case-insensitively", () => {
    expect(uniqueWordsCaseInsensitive(["Anak", "anak", " ANAK "])).toEqual([
      "Anak",
    ]);
  });
});

describe("filterWordsStartsWith", () => {
  it("match startsWith case-insensitively", () => {
    expect(filterWordsStartsWith(["Antar", "Anak", "Batin"], "an")).toEqual([
      "Antar",
      "Anak",
    ]);
  });

  it("return all words when query empty", () => {
    expect(filterWordsStartsWith(["A", "B"], " ")).toEqual(["A", "B"]);
  });
});
