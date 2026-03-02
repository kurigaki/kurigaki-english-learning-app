/**
 * 単語詳細画面の前後ナビゲーション状態管理
 *
 * 単語帳・ブックマーク・苦手単語・学習履歴・クイズリザルト・スピードチャレンジリザルトから
 * 単語詳細に遷移した際に、表示中のリストを保存して「前の単語 / 次の単語」ナビゲーションを実現する。
 *
 * - sessionStorage 使用（ブラウザタブ単位）
 * - 30 分有効期限
 */

import { SESSION_EXPIRY_MS } from "@/lib/navigation-state";

export type WordNavFrom =
  | "wordlist"
  | "bookmarks"
  | "weak"
  | "history"
  | "quiz"
  | "speed";

export type WordNavState = {
  wordIds: number[];
  from: WordNavFrom;
  timestamp: number;
};

const STORAGE_KEY = "word_nav_state";

/**
 * 単語ナビゲーション状態を保存する。
 * 単語詳細ページへの Link クリック時に呼び出す。
 */
export function saveWordNavState(wordIds: number[], from: WordNavFrom): void {
  if (typeof window === "undefined") return;
  try {
    const state: WordNavState = { wordIds, from, timestamp: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save word nav state:", e);
  }
}

/**
 * 単語ナビゲーション状態を取得する（有効期限切れの場合は null）。
 * 単語詳細ページのレンダリング時に呼び出す。
 * ※ getAndClear パターンではなく「読み取りのみ」 — ←/→ 遷移でも状態を維持するため。
 */
export function getWordNavState(): WordNavState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const state: WordNavState = JSON.parse(stored);
    if (Date.now() - state.timestamp > SESSION_EXPIRY_MS) {
      clearWordNavState();
      return null;
    }
    return state;
  } catch (e) {
    console.warn("Failed to get word nav state:", e);
    return null;
  }
}

/**
 * 単語ナビゲーション状態をクリアする。
 * 単語詳細以外の画面に戻った場合などに呼び出す（任意）。
 */
export function clearWordNavState(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear word nav state:", e);
  }
}
