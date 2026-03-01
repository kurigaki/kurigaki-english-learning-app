/**
 * ページナビゲーション状態の保存・復元
 * 単語詳細画面から「戻る」操作時に、元のページの状態（ソート順・タブ等）を復元するため
 *
 * - sessionStorage 使用（ブラウザタブ単位）
 * - 30分有効期限
 * - getAndClear パターン: 読み取りと同時にクリアし、古い状態の残留を防ぐ
 */

export const SESSION_EXPIRY_MS = 30 * 60 * 1000;

type SimpleState = { value: string; timestamp: number };

function save(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
  } catch (e) {
    console.warn("Failed to save navigation state:", e);
  }
}

function getAndClear(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;
    const state: SimpleState = JSON.parse(stored);
    sessionStorage.removeItem(key);
    if (Date.now() - state.timestamp > SESSION_EXPIRY_MS) return null;
    return state.value;
  } catch (e) {
    console.warn("Failed to get navigation state:", e);
    return null;
  }
}

// ── ブックマーク一覧 ──────────────────────────────

export type BookmarkSort = "added" | "name" | "difficulty";

export const saveBookmarkSort = (sort: BookmarkSort): void =>
  save("bookmark_sort", sort);

export const getAndClearBookmarkSort = (): BookmarkSort | null =>
  getAndClear("bookmark_sort") as BookmarkSort | null;

// ── 苦手単語一覧 ──────────────────────────────────

export type WeakWordSort = "accuracy" | "recent";

export const saveWeakWordSort = (sort: WeakWordSort): void =>
  save("weak_word_sort", sort);

export const getAndClearWeakWordSort = (): WeakWordSort | null =>
  getAndClear("weak_word_sort") as WeakWordSort | null;

// ── 学習履歴 ─────────────────────────────────────

export type HistoryTab = "overview" | "weak" | "history" | "progress";

export const saveHistoryTab = (tab: HistoryTab): void =>
  save("history_tab", tab);

export const getAndClearHistoryTab = (): HistoryTab | null =>
  getAndClear("history_tab") as HistoryTab | null;
