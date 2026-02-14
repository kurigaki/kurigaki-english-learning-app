/**
 * Fisher-Yates (Knuth) shuffle — O(n), unbiased.
 * Returns a new shuffled array (does not mutate the input).
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Pick `count` random elements from an array (unbiased).
 * Returns a new array of up to `count` elements.
 */
export function pickRandom<T>(array: T[], count: number): T[] {
  return shuffleArray(array).slice(0, count);
}
