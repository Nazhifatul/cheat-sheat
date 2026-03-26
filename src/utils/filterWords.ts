export function normalizeWord(value: string) {
  return value.trim();
}

export function sanitizeEntry(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withoutDigits = trimmed.replace(/[0-9]+/g, "");
  const withoutLeadingMarkers = withoutDigits
    .replace(/^[\s.\-–—•·●▪‣]+/g, "")
    .replace(/[.]+$/g, "");
  const collapsedSpaces = withoutLeadingMarkers.replace(/\s+/g, " ").trim();
  return collapsedSpaces;
}

export function uniqueWordsCaseInsensitive(words: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const w of words) {
    const normalized = normalizeWord(w);
    if (!normalized) continue;
    const key = normalized.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
}

export function filterWordsStartsWith(words: string[], query: string) {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return words;

  return words.filter((w) => w.toLocaleLowerCase().startsWith(q));
}
