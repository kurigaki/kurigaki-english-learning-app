/**
 * スピードチャレンジセッション状態の永続化
 * リザルト画面から単語詳細に遷移し、戻ってきた際にリザルト状態を復元するため
 */

// 回答した単語の型
export type AnsweredWord = {
  id: number;
  word: string;
  meaning: string;
  correct: boolean;
};

// リザルト画面の状態
export type SpeedResultState = {
  score: number;
  totalQuestions: number;
  maxCombo: number;
  isNewHighScore: boolean;
  answeredWords: AnsweredWord[];
  timestamp: number; // 有効期限チェック用
};

const STORAGE_KEY = "speed_result_state";
const EXPIRY_MS = 30 * 60 * 1000; // 30分で無効化

/**
 * リザルト状態を保存
 */
export function saveSpeedResultState(state: Omit<SpeedResultState, "timestamp">): void {
  if (typeof window === "undefined") return;

  const stateWithTimestamp: SpeedResultState = {
    ...state,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTimestamp));
  } catch (e) {
    console.warn("Failed to save speed result state:", e);
  }
}

/**
 * リザルト状態を取得（有効期限切れの場合はnull）
 */
export function getSpeedResultState(): SpeedResultState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state: SpeedResultState = JSON.parse(stored);

    // 有効期限チェック
    if (Date.now() - state.timestamp > EXPIRY_MS) {
      clearSpeedResultState();
      return null;
    }

    return state;
  } catch (e) {
    console.warn("Failed to get speed result state:", e);
    return null;
  }
}

/**
 * リザルト状態をクリア
 */
export function clearSpeedResultState(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear speed result state:", e);
  }
}

/**
 * リザルト状態が存在するかチェック
 */
export function hasSpeedResultState(): boolean {
  return getSpeedResultState() !== null;
}
