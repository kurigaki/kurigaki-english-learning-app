/**
 * クイズセッション状態の永続化
 * リザルト画面から単語詳細に遷移し、戻ってきた際にリザルト状態を復元するため
 */

import type { AnsweredWord, Question } from "@/types";
import type { QuizSettings } from "@/lib/quiz/settings";
export type { AnsweredWord };

// セッション結果の型
export type SessionResult = {
  earnedXp: number;
  newLevel: number;
  previousLevel: number;
  streak: number;
  previousStreak: number;
  dailyProgress: { current: number; goal: number; completed: boolean };
  newAchievementIds: string[]; // Achievement全体ではなくIDのみ保存
};

// リザルト画面の状態
export type QuizResultState = {
  score: number;
  totalQuestions: number;
  maxCombo: number;
  elapsedSeconds?: number;
  answeredWords: AnsweredWord[];
  sessionResult: SessionResult | null;
  timestamp: number; // 有効期限チェック用
};

const STORAGE_KEY = "quiz_result_state";
const EXPIRY_MS = 30 * 60 * 1000; // 30分で無効化
const PROGRESS_KEY = "quiz_progress_state";
const PROGRESS_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7日で無効化

/**
 * リザルト状態を保存
 */
export function saveQuizResultState(state: Omit<QuizResultState, "timestamp">): void {
  if (typeof window === "undefined") return;

  const stateWithTimestamp: QuizResultState = {
    ...state,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTimestamp));
  } catch (e) {
    console.warn("Failed to save quiz result state:", e);
  }
}

/**
 * リザルト状態を取得（有効期限切れの場合はnull）
 */
export function getQuizResultState(): QuizResultState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state: QuizResultState = JSON.parse(stored);

    // 有効期限チェック
    if (Date.now() - state.timestamp > EXPIRY_MS) {
      clearQuizResultState();
      return null;
    }

    return state;
  } catch (e) {
    console.warn("Failed to get quiz result state:", e);
    return null;
  }
}

/**
 * リザルト状態をクリア
 */
export function clearQuizResultState(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear quiz result state:", e);
  }
}

/**
 * リザルト状態が存在するかチェック
 */
export function hasQuizResultState(): boolean {
  return getQuizResultState() !== null;
}

// ─── クイズ途中の中断セーブ ──────────────────────────────────

export type QuizProgressState = {
  questions: Question[];
  currentIndex: number;
  score: number;
  combo: number;
  maxCombo: number;
  selected: string | null;
  isCorrect: boolean | null;
  dictationInputs: string[];
  showTranslation: boolean;
  answeredWords: AnsweredWord[];
  elapsedSeconds: number;
  quizSettings: QuizSettings;
  timestamp: number;
};

export function saveQuizProgressState(state: Omit<QuizProgressState, "timestamp">): void {
  if (typeof window === "undefined") return;
  const stateWithTimestamp: QuizProgressState = {
    ...state,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(stateWithTimestamp));
  } catch (e) {
    console.warn("Failed to save quiz progress state:", e);
  }
}

export function getQuizProgressState(): QuizProgressState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (!stored) return null;
    const state: QuizProgressState = JSON.parse(stored);
    if (Date.now() - state.timestamp > PROGRESS_EXPIRY_MS) {
      clearQuizProgressState();
      return null;
    }
    return state;
  } catch (e) {
    console.warn("Failed to get quiz progress state:", e);
    return null;
  }
}

export function clearQuizProgressState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (e) {
    console.warn("Failed to clear quiz progress state:", e);
  }
}

export function hasQuizProgressState(): boolean {
  return getQuizProgressState() !== null;
}

// ─── 単語帳クイズ用の単語IDリスト ───────────────────────────────────

const BOOK_WORD_IDS_KEY = "quiz_book_word_ids";

/**
 * 単語帳からクイズを開始するときの単語IDリストを保存
 */
export function saveBookWordIds(wordIds: number[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BOOK_WORD_IDS_KEY, JSON.stringify(wordIds));
  } catch (e) {
    console.warn("Failed to save book word ids:", e);
  }
}

/**
 * 保存された単語IDリストを取得してクリア（一度だけ使う）
 */
export function getAndClearBookWordIds(): number[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BOOK_WORD_IDS_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(BOOK_WORD_IDS_KEY);
    return JSON.parse(raw) as number[];
  } catch (e) {
    console.warn("Failed to get book word ids:", e);
    return null;
  }
}
