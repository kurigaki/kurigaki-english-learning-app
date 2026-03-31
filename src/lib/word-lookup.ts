import { words } from "@/data/words";

/**
 * 単語(小文字)→IDのルックアップMap
 * モジュールレベルで一度だけ生成してO(1)検索を実現
 */
const wordLookupMap = new Map<string, number>(
  words.map((w) => [w.word.toLowerCase(), w.id])
);

/**
 * 英単語を語彙DBで検索し、IDを返す
 * @returns 単語のID、または見つからない場合はnull
 */
export const findWordId = (word: string): number | null =>
  wordLookupMap.get(word.toLowerCase()) ?? null;

/**
 * 品詞ごとのmeaning情報
 */
export type WordMeaningByPos = {
  partOfSpeech: string;
  meaning: string;
};

const POS_LABEL: Record<string, string> = {
  noun: "名",
  verb: "動",
  adjective: "形",
  adverb: "副",
  other: "他",
};

/**
 * 品詞ラベルを返す（名/動/形/副/他）
 */
export const getPosLabel = (pos: string): string => POS_LABEL[pos] ?? pos;

/**
 * 同じ word を持つ全エントリから、品詞ごとのユニークな meaning を集約して返す。
 * 例: blanket → [{partOfSpeech:"noun", meaning:"毛布"}, {partOfSpeech:"adjective", meaning:"包括的な"}]
 *
 * 同品詞で meaning が異なるエントリがある場合は最初のものを採用。
 */
export function getMultiPosMeanings(word: string): WordMeaningByPos[] {
  const lower = word.toLowerCase();
  const seen = new Map<string, string>(); // pos → meaning
  for (const w of words) {
    if (w.word.toLowerCase() !== lower) continue;
    if (!seen.has(w.partOfSpeech)) {
      seen.set(w.partOfSpeech, w.meaning);
    }
  }
  return Array.from(seen.entries()).map(([partOfSpeech, meaning]) => ({
    partOfSpeech,
    meaning,
  }));
}
