import type { Course, Stage, FrequencyTier } from "@/data/words/types";
import type { Category } from "@/data/words";
import { COURSE_DEFINITIONS } from "@/data/words/courses";
import { QuestionTypeRatios } from "@/types";

// 単語レベル設定（頻出度ティアのフィルタ）
export type WordLevelMode = "essential" | "standard" | "all";

// クイズ設定の型
export type QuizSettings = {
  course: Course | null;   // null は「全コース」
  stage: Stage | null;     // null は「全ステージ」
  categories: Category[];  // 空配列は「全カテゴリ」
  difficulties: number[];  // 空配列は「全難易度」
  includeBookmarksOnly: boolean;
  typeRatios: QuestionTypeRatios;
  wordLevel: WordLevelMode; // "essential"=頻出のみ, "standard"=標準, "all"=全て
};

export const defaultTypeRatios: QuestionTypeRatios = {
  enToJa: 25,
  jaToEn: 25,
  listening: 25,
  dictation: 25,
  speaking: 0,
};

export const defaultQuizSettings: QuizSettings = {
  course: null,
  stage: null,
  categories: [],
  difficulties: [],
  includeBookmarksOnly: false,
  typeRatios: { ...defaultTypeRatios },
  wordLevel: "standard",
};

/** WordLevelMode → 許可するfrequencyTierの集合 */
export function getAllowedTiers(mode: WordLevelMode): Set<FrequencyTier> {
  switch (mode) {
    case "essential": return new Set<FrequencyTier>([1]);
    case "standard":  return new Set<FrequencyTier>([1, 2]);
    case "all":       return new Set<FrequencyTier>([1, 2, 3]);
  }
}

// カテゴリリスト（loadQuizSettings のバリデーションで参照するため先に定義）
export const ALL_CATEGORIES: Category[] = [
  "daily", "school", "family", "food", "hobby",
  "nature", "health", "sports", "culture",
  "business", "office", "travel", "shopping",
  "finance", "technology", "communication",
  "greeting", "emotion", "opinion", "request", "smalltalk",
];

// ─── クイズ設定の永続化 ──────────────────────────────────────────────────────

const QUIZ_SETTINGS_KEY = "english-app-quiz-settings";

// COURSE_DEFINITIONS から導出（Course 型の追加・削除に自動追従する）
const VALID_COURSES = new Set<string>(Object.keys(COURSE_DEFINITIONS));
// COURSE_DEFINITIONS の各コースが持つ全 Stage を収集
const VALID_STAGES = new Set<string>(
  Object.values(COURSE_DEFINITIONS).flatMap((def) => def.stages.map((s) => s.stage))
);

/** クイズ設定を localStorage に保存する */
export function saveQuizSettings(settings: QuizSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUIZ_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("[Quiz] Failed to save quiz settings:", e);
  }
}

/**
 * localStorage からクイズ設定を復元する。
 * データが存在しない・破損している場合は defaultQuizSettings を返す。
 */
export function loadQuizSettings(): QuizSettings {
  if (typeof window === "undefined") return { ...defaultQuizSettings };
  try {
    const raw = localStorage.getItem(QUIZ_SETTINGS_KEY);
    if (!raw) return { ...defaultQuizSettings };

    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return { ...defaultQuizSettings };
    const p = parsed as Record<string, unknown>;

    const course = typeof p.course === "string" && VALID_COURSES.has(p.course)
      ? (p.course as Course) : null;
    const stage  = typeof p.stage  === "string" && VALID_STAGES.has(p.stage)
      ? (p.stage  as Stage)  : null;

    const categories = Array.isArray(p.categories)
      ? (p.categories as unknown[]).filter((c): c is Category =>
          typeof c === "string" && (ALL_CATEGORIES as string[]).includes(c)
        )
      : [];

    const difficulties = Array.isArray(p.difficulties)
      ? (p.difficulties as unknown[]).filter(
          (d): d is number => typeof d === "number" && d >= 1 && d <= 7
        )
      : [];

    const includeBookmarksOnly =
      typeof p.includeBookmarksOnly === "boolean" ? p.includeBookmarksOnly : false;

    const tr = typeof p.typeRatios === "object" && p.typeRatios !== null
      ? (p.typeRatios as Record<string, unknown>)
      : {};
    const typeRatios: QuestionTypeRatios = {
      enToJa:    typeof tr.enToJa    === "number" ? tr.enToJa    : defaultTypeRatios.enToJa,
      jaToEn:    typeof tr.jaToEn    === "number" ? tr.jaToEn    : defaultTypeRatios.jaToEn,
      listening: typeof tr.listening === "number" ? tr.listening : defaultTypeRatios.listening,
      dictation: typeof tr.dictation === "number" ? tr.dictation : defaultTypeRatios.dictation,
      speaking:  typeof tr.speaking  === "number" ? tr.speaking  : defaultTypeRatios.speaking,
    };

    const VALID_WORD_LEVELS: WordLevelMode[] = ["essential", "standard", "all"];
    const wordLevel: WordLevelMode = typeof p.wordLevel === "string" && VALID_WORD_LEVELS.includes(p.wordLevel as WordLevelMode)
      ? (p.wordLevel as WordLevelMode) : "standard";

    return { course, stage, categories, difficulties, includeBookmarksOnly, typeRatios, wordLevel };
  } catch (e) {
    console.warn("[Quiz] Failed to load quiz settings:", e);
    return { ...defaultQuizSettings };
  }
}