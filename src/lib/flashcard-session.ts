/**
 * フラッシュカードセッション状態の永続化
 * 「詳細を見る」→ 単語詳細画面 → 「単語帳に戻る」で戻った際にフラッシュカード状態を復元するため
 */

import type { MasteryLevel, WordListSortOption } from "@/types";
import type { Course, Stage } from "@/data/words/types";
import type { Category } from "@/data/words/compat";
import type { ManualMasteryLevel } from "@/lib/storage";
import { SESSION_EXPIRY_MS } from "@/lib/navigation-state";

export type WordListAccuracyFilter =
  | "all"
  | "unattempted"
  | "0-33"
  | "34-66"
  | "67-99"
  | "100";

export type FlashcardSessionState = {
  currentIndex: number;
  selectedCourse: Course | null;
  selectedStage: Stage | null;
  selectedCategory: Category | "all";
  selectedDifficulty: number | "all";
  selectedMemory?: ManualMasteryLevel | "all";
  selectedAccuracy?: WordListAccuracyFilter;
  selectedMastery?: MasteryLevel | "all"; // legacy
  flashcardWordIds?: number[];
  searchQuery: string;
  showBookmarksOnly: boolean;
  sortOption: WordListSortOption;
  timestamp: number; // 有効期限チェック用
};

const STORAGE_KEY = "flashcard_session_state";

/**
 * フラッシュカードセッション状態を保存
 */
export function saveFlashcardSession(
  state: Omit<FlashcardSessionState, "timestamp">
): void {
  if (typeof window === "undefined") return;

  const stateWithTimestamp: FlashcardSessionState = {
    ...state,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTimestamp));
  } catch (e) {
    console.warn("Failed to save flashcard session state:", e);
  }
}

/**
 * フラッシュカードセッション状態を取得（有効期限切れの場合はnull）
 */
export function getFlashcardSession(): FlashcardSessionState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state: FlashcardSessionState = JSON.parse(stored);

    // 有効期限チェック
    if (Date.now() - state.timestamp > SESSION_EXPIRY_MS) {
      clearFlashcardSession();
      return null;
    }

    return state;
  } catch (e) {
    console.warn("Failed to get flashcard session state:", e);
    return null;
  }
}

/**
 * フラッシュカードセッション状態をクリア
 */
export function clearFlashcardSession(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear flashcard session state:", e);
  }
}

/**
 * 任意画面から単語帳のフラッシュカードを即開始するためのクイック保存
 */
export function saveQuickFlashcardSession(wordIds: number[]): void {
  if (typeof window === "undefined") return;
  saveFlashcardSession({
    currentIndex: 0,
    selectedCourse: null,
    selectedStage: null,
    selectedCategory: "all",
    selectedDifficulty: "all",
    selectedMemory: "all",
    selectedAccuracy: "all",
    flashcardWordIds: wordIds,
    searchQuery: "",
    showBookmarksOnly: false,
    sortOption: "default",
  });
}

// ── 単語帳リストモード用フィルター保存 ──────────────────────────

/**
 * 単語帳リストモードのフィルター状態
 * FlashcardSessionState から currentIndex を除き、スクロール位置を追加したもの
 */
export type WordListFilterState = Omit<FlashcardSessionState, "currentIndex"> & {
  scrollTop: number; // 単語リストのスクロール位置
};

const FILTER_STORAGE_KEY = "word_list_filter_state";

/**
 * 単語帳リストモードのフィルター状態を保存
 */
export function saveWordListFilter(
  state: Omit<WordListFilterState, "timestamp">
): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({ ...state, timestamp: Date.now() })
    );
  } catch (e) {
    console.warn("Failed to save word list filter state:", e);
  }
}

/**
 * 単語帳リストモードのフィルター状態を取得（有効期限切れの場合はnull）
 */
export function getWordListFilter(): WordListFilterState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(FILTER_STORAGE_KEY);
    if (!stored) return null;

    const state: WordListFilterState = JSON.parse(stored);

    if (Date.now() - state.timestamp > SESSION_EXPIRY_MS) {
      clearWordListFilter();
      return null;
    }

    return state;
  } catch (e) {
    console.warn("Failed to get word list filter state:", e);
    return null;
  }
}

/**
 * 単語帳リストモードのフィルター状態をクリア
 */
export function clearWordListFilter(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(FILTER_STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear word list filter state:", e);
  }
}
