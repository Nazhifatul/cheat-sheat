import {
  filterWordsEndsWith,
  filterWordsStartsWith,
  uniqueWordsCaseInsensitive,
} from "@/utils/filterWords";

export type SortMode = "recent" | "az";

export type WordsViewParams = {
  words: string[];
  query: string;
  suffixQuery: string;
  sortMode: SortMode;
  minLen: number | null;
  maxLen: number | null;
  limit: number;
};

export function computeVisibleWords(params: WordsViewParams) {
  const unique = uniqueWordsCaseInsensitive(params.words);

  const sorted =
    params.sortMode === "az"
      ? [...unique].sort((a, b) =>
          a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()),
        )
      : unique;

  const startsWithFiltered = filterWordsStartsWith(sorted, params.query);
  const endsWithFiltered = filterWordsEndsWith(
    startsWithFiltered,
    params.suffixQuery,
  );

  const minLen = params.minLen ?? 0;
  const maxLen = params.maxLen ?? Number.POSITIVE_INFINITY;

  const lengthFiltered = endsWithFiltered.filter(
    (w) => w.length >= minLen && w.length <= maxLen,
  );

  const safeLimit = Number.isFinite(params.limit)
    ? Math.min(Math.max(1, Math.floor(params.limit)), 5000)
    : 200;

  return {
    totalUnique: unique.length,
    matched: lengthFiltered.length,
    visible: lengthFiltered.slice(0, safeLimit),
  };
}
