/**
 * クイズセッション状態の永続化
 * リザルト画面から単語詳細に遷移し、戻ってきた際にリザルト状態を復元するため
 */

import type { AnsweredWord } from "@/types";
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
