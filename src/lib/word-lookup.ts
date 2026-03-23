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
