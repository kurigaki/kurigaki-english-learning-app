/**
 * /review ページ専用のクイズユーティリティ
 *
 * SRS復習・苦手単語復習で使用する en-to-ja 問題生成、
 * 次回復習日の表示フォーマット、
 * 単語詳細への遷移後に結果状態を復元するためのセッション保存機能を提供する。
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

// ===== セッション保存（単語詳細遷移後に結果画面を復元するため） =====

const REVIEW_SESSION_KEY = "review_page_session";

type ReviewSessionEnvelope = {
  data: unknown;
  /** 保存時の日付 "YYYY-MM-DD"。日付が変わったら期限切れとして扱う */
  date: string;
};

/** 今日の日付をローカルタイムゾーンで "YYYY-MM-DD" 形式で返す */
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 結果フェーズの状態を sessionStorage に保存する。
 * 単語詳細画面から戻ってきた際に結果画面を復元するために使用。
 * セッションは同日中（日付が変わるまで）有効。
 */
export function saveReviewSession(state: unknown): void {
  if (typeof window === "undefined") return;
  try {
    const envelope: ReviewSessionEnvelope = {
      data: state,
      date: todayStr(),
    };
    sessionStorage.setItem(REVIEW_SESSION_KEY, JSON.stringify(envelope));
  } catch (e) {
    console.warn("[Review] Failed to save session:", e);
  }
}

/**
 * sessionStorage からセッション状態を取得する。
 * 保存日が今日と異なる（日付をまたいだ）場合は null を返す。
 */
export function getReviewSession<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(REVIEW_SESSION_KEY);
    if (!stored) return null;
    const envelope: ReviewSessionEnvelope = JSON.parse(stored);
    if (envelope.date !== todayStr()) {
      clearReviewSession();
      return null;
    }
    return envelope.data as T;
  } catch (e) {
    console.warn("[Review] Failed to get session:", e);
    return null;
  }
}

/**
 * セッション状態を削除する。
 * ユーザーが明示的にリストへ戻るか再挑戦を始めた際に呼び出す。
 */
export function clearReviewSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(REVIEW_SESSION_KEY);
  } catch (e) {
    console.warn("[Review] Failed to clear session:", e);
  }
}
