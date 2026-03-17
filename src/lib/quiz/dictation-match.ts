import { levenshteinDistance } from "@/lib/string-utils";

export type DictationDifficulty = "strict" | "normal" | "easy";

/**
 * 書き取り回答の正規化
 * - 全難易度: trim・小文字化・末尾のピリオドやカンマ等を除去
 * - easy のみ: アポストロフィも除去 (it's → its, I'm → im)
 */
export function normalizeDictationWord(word: string, difficulty: DictationDifficulty): string {
  let s = word.trim().toLowerCase();
  // 前後の句読点を除去
  s = s.replace(/^[.,!?;:]+|[.,!?;:]+$/g, "");
  // easy: アポストロフィを除去してコントラクション差を吸収
  if (difficulty === "easy") {
    s = s.replace(/'/g, "");
  }
  return s;
}

/**
 * 書き取り1ワードの正誤判定
 *
 * strict : 正規化後に完全一致のみ正解
 * normal : 5文字以上なら編集距離 1 まで許容
 * easy   : 4文字以上で距離 1、8文字以上で距離 2 まで許容
 */
export function isDictationWordCorrect(
  input: string,
  correct: string,
  difficulty: DictationDifficulty
): boolean {
  const normInput = normalizeDictationWord(input, difficulty);
  const normCorrect = normalizeDictationWord(correct, difficulty);

  if (normInput === normCorrect) return true;
  if (difficulty === "strict") return false;

  const dist = levenshteinDistance(normInput, normCorrect);
  const len = Math.max(normInput.length, normCorrect.length);

  if (difficulty === "normal") {
    return len >= 5 && dist <= 1;
  }

  // easy
  if (len >= 8) return dist <= 2;
  if (len >= 4) return dist <= 1;
  return false;
}
