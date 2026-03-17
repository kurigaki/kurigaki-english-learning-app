/**
 * タイムアタックの自己ベスト管理とセッション状態の永続化
 */
import type { QuizSettings } from "@/lib/quiz/settings";
import type { AnsweredWord } from "@/types";

// ─── 自己ベスト（localStorage） ──────────────────────────────────────────────

const BEST_SCORES_KEY = "time_attack_best_scores";

export function deriveTimeAttackKey(settings: QuizSettings): string {
  if (settings.includeBookmarksOnly) return "bookmark";
  if (settings.course !== null) {
    if (settings.stage !== null) return `course:${settings.course}:${settings.stage}`;
    return `course:${settings.course}`;
  }
  if (settings.categories.length > 0 || settings.difficulties.length > 0) {
    const cats = [...settings.categories].sort().join(",");
    const diffs = [...settings.difficulties].sort().join(",");
    return `custom:cats:${cats}:diffs:${diffs}`;
  }
  return "all";
}

export function getTimeAttackBest(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(BEST_SCORES_KEY);
    if (!raw) return 0;
    const map = JSON.parse(raw) as Record<string, number>;
    return map[key] ?? 0;
  } catch {
    return 0;
  }
}

/** スコアが自己ベストを更新した場合 true を返す */
export function saveTimeAttackBest(key: string, score: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(BEST_SCORES_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    const prev = map[key] ?? 0;
    if (score > prev) {
      map[key] = score;
      localStorage.setItem(BEST_SCORES_KEY, JSON.stringify(map));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── セッションコンテキスト（sessionStorage） ─────────────────────────────────

const CONTEXT_KEY = "time_attack_context";

export type TimeAttackContext = {
  wordIds: number[];     // 出題対象の単語IDリスト（空なら全単語）
  bestKey: string;       // deriveTimeAttackKey で生成したキー
  settingsLabel: string; // UI表示用ラベル
};

export function saveTimeAttackContext(ctx: TimeAttackContext): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(ctx));
  } catch (e) {
    console.warn("[TimeAttack] Failed to save context:", e);
  }
}

export function getAndClearTimeAttackContext(): TimeAttackContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CONTEXT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(CONTEXT_KEY);
    return JSON.parse(raw) as TimeAttackContext;
  } catch {
    return null;
  }
}

// ─── リザルト状態（sessionStorage: 単語詳細から戻った際の復元） ─────────────

const RESULT_KEY = "time_attack_result";
const EXPIRY_MS = 30 * 60 * 1000; // 30分

export type TimeAttackResult = {
  score: number;
  totalQuestions: number;
  maxCombo: number;
  isNewBest: boolean;
  earnedXp: number;
  answeredWords: AnsweredWord[];
  bestKey: string;
  settingsLabel: string;
  timestamp: number;
};

export function saveTimeAttackResult(state: Omit<TimeAttackResult, "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(RESULT_KEY, JSON.stringify({ ...state, timestamp: Date.now() }));
  } catch (e) {
    console.warn("[TimeAttack] Failed to save result:", e);
  }
}

export function getTimeAttackResult(): TimeAttackResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as TimeAttackResult;
    if (Date.now() - r.timestamp > EXPIRY_MS) {
      clearTimeAttackResult();
      return null;
    }
    return r;
  } catch {
    return null;
  }
}

export function clearTimeAttackResult(): void {
  if (typeof window === "undefined") return;
  try { sessionStorage.removeItem(RESULT_KEY); } catch { /* noop */ }
}
