import { DIFFICULTY_MAP } from "./difficulty";
import type { RawWord, Word, Course, Stage } from "./types";

/**
 * RawWord[] に course/stage/difficulty 等の導出フィールドを付与して Word[] に変換する。
 * データファイルは「他から導出できない情報」のみを持ち、この関数が残りを補完する。
 */
export function enrichWords(
  rawWords: RawWord[],
  course: Course,
  stage: Stage,
): Word[] {
  const key = `${course}:${stage}`;
  const difficulty = DIFFICULTY_MAP[key];
  if (!difficulty) {
    throw new Error(`No difficulty mapping for "${key}"`);
  }
  return rawWords.map((raw) => ({
    ...raw,
    course,
    stage,
    difficulty,
    example: raw.examples[0].en,
    exampleJa: raw.examples[0].ja,
    category: raw.categories[0],
    categories: [...raw.categories],
    frequencyTier: raw.frequencyTier ?? 2, // 未設定時は「標準」
  }));
}
