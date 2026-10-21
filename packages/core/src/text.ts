/** Normalize visible text for length checks without changing the input document. */
export function cleanText(value: string): string {
  return value.normalize('NFKC').replace(/\s+/gu, ' ').trim();
}

/** Unicode-aware tokens make phrase matching independent of punctuation and case. */
export function words(value: string): string[] {
  return (
    cleanText(value)
      .toLocaleLowerCase('und')
      .match(/[\p{L}\p{M}\p{N}]+/gu) ?? []
  );
}

export function containsPhrase(value: string, phrase: string): boolean {
  const haystack = words(value);
  const needle = words(phrase);
  if (needle.length === 0 || needle.length > haystack.length) return false;

  for (let start = 0; start <= haystack.length - needle.length; start++) {
    if (needle.every((word, offset) => haystack[start + offset] === word)) {
      return true;
    }
  }
  return false;
}

export function characterCount(value: string): number {
  return Array.from(cleanText(value)).length;
}
