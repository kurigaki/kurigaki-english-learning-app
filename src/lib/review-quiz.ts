/**
 * /review ページ専用のクイズユーティリティ
 *
 * SRS復習・苦手単語復習で使用する en-to-ja 問題生成と
 * 次回復習日の表示フォーマットを提供する。
 */

import { shuffleArray, pickRandom } from "@/lib/shuffle";
import type { Word } from "@/data/words/compat";

/**
 * en-to-ja 問題の選択肢を生成する。
 * 正解の意味 1つ + ランダムな誤答 3つ の計4択（シャッフル済み）を返す。
 */
export function generateReviewChoices(correctWord: Word, allWords: Word[]): string[] {
  const wrongWords = pickRandom(
    allWords.filter((w) => w.id !== correctWord.id),
    3
  );
  const choices = [correctWord.meaning, ...wrongWords.map((w) => w.meaning)];
  return shuffleArray(choices);
}

/**
 * SRS の次回復習日（"YYYY-MM-DD" | null）を
 * ユーザー向けの日本語ラベルに変換する。
 *
 * - null        → "未設定"
 * - 今日        → "今日"
 * - 明日        → "明日"
 * - n 日後      → "n日後"
 */
export function formatNextReviewDate(nextReviewDate: string | null): string {
  if (!nextReviewDate) return "未設定";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(nextReviewDate + "T00:00:00");
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "今日";
  if (diffDays === 1) return "明日";
  return `${diffDays}日後`;
}
