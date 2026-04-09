import { masterWords } from "@/data/words";

/**
 * 単語(小文字)→IDのルックアップMap
 * モジュールレベルで一度だけ生成してO(1)検索を実現
 */
const wordLookupMap = new Map<string, number>(
  masterWords.map((w) => [w.word.toLowerCase(), w.id])
);

/**
 * ID→MasterWord meaning のルックアップMap
 * コース別meaningではなく、全語義を含むmaster meaningを取得するために使用
 */
const masterMeaningMap = new Map<number, string>(
  masterWords.map((w) => [w.id, w.meaning])
);

/**
 * 英単語を語彙DBで検索し、IDを返す
 * @returns 単語のID、または見つからない場合はnull
 */
export const findWordId = (word: string): number | null =>
  wordLookupMap.get(word.toLowerCase()) ?? null;

/**
 * IDからmaster meaning（全語義）を取得する
 * コース別meaningではなく、辞書レベルの包括的な意味を返す
 * 例: interest → "興味・関心・利子"（TOEICコースでword.meaning="利子"でも全義を返す）
 */
export const getMasterMeaning = (id: number): string | null =>
  masterMeaningMap.get(id) ?? null;

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
  for (const w of masterWords) {
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
