import { LearningRecord, QuestionType, UnlockedAchievement, SpeedChallengeResult, PeriodProgress } from "@/types";
import { MISSIONS } from "@/data/missions";
import { ACHIEVEMENTS, getAchievementById } from "@/data/achievements";
import { type SrsProgress, isDueForReview } from "./srs";

const STORAGE_KEY = "learning_records";
const USER_DATA_KEY = "user_data";
const ACHIEVEMENTS_KEY = "unlocked_achievements";
const SPEED_RESULTS_KEY = "speed_challenge_results";
const BOOKMARKS_KEY = "bookmarked_words";
const SRS_PROGRESS_KEY = "srs_progress";
const MANUAL_MASTERY_KEY = "manual_mastery";
const DUNGEON_STATS_KEY = "dungeon_stats";
const DUNGEON_LOG_KEY = "dungeon_run_log";
const DUNGEON_SAVE_KEY = "dungeon_save";
const DUNGEON_LOG_MAX = 10; // 保持する最大件数
const DAILY_PROGRESS_KEY = "daily_progress";
const WEEKLY_PROGRESS_KEY = "weekly_progress";
const MONTHLY_PROGRESS_KEY = "monthly_progress";
const DEFAULT_USER_ID = "default";
export type ManualMasteryLevel = "unlearned" | "weak" | "vague" | "almost" | "remembered";

export type DungeonRunLog = {
  playedAt: string;     // ISO 8601形式
  floor: number;        // 到達フロア
  kills: number;        // 撃破数
  correct: number;      // 正解数
  wrong: number;        // 不正解数
  turns: number;        // 経過ターン
  isCleared: boolean;   // クリアしたか
};

export type DungeonStats = {
  attempts: number;     // 累計挑戦回数
  kills: number;        // 累計撃破数
  correct: number;      // 累計正解数
  clears: number;       // 累計クリア回数（B5F踏破）
  maxFloor: number;     // 到達最高フロア（ベスト）
  bestKills: number;    // 1ランクの最大撃破数（ベスト）
  bestCorrect: number;  // 1ランクの最大正解数（ベスト）
};

export type WordStats = {
  wordId: number;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  lastStudiedAt: string | null;
  accuracy: number; // 0-100
};

export type UserData = {
  streak: number;              // 連続学習日数
  lastStudyDate: string | null; // 最終学習日 (YYYY-MM-DD)
  totalXp: number;             // 累計XP
  level: number;               // 現在のレベル
  dailyGoal: number;           // デイリー目標（問題数）
  todayCorrect: number;        // 今日の正解数
  todayDate: string | null;    // 今日の日付
};

const DEFAULT_USER_DATA: UserData = {
  streak: 0,
  lastStudyDate: null,
  totalXp: 0,
  level: 1,
  dailyGoal: 10,
  todayCorrect: 0,
  todayDate: null,
};

// XPとレベルの計算
const XP_PER_CORRECT = 10;
const XP_PER_COMBO_BONUS = 5;
const getRequiredXpForLevel = (level: number) => level * 100;

function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getToday(): string {
  return toLocalDateStr(new Date());
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === toLocalDateStr(yesterday);
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr === getToday();
}

export const storage = {
  getRecords: (): LearningRecord[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  addRecord: (record: {
    wordId: number;
    word: string;
    meaning: string;
    questionType: QuestionType;
    correct: boolean;
  }): LearningRecord => {
    const records = storage.getRecords();
    const newRecord: LearningRecord = {
      ...record,
      id: crypto.randomUUID(),
      userId: DEFAULT_USER_ID,
      studiedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return newRecord;
  },

  clearRecords: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getWordStats: (): Map<number, WordStats> => {
    const records = storage.getRecords();
    const statsMap = new Map<number, WordStats>();

    for (const record of records) {
      const existing = statsMap.get(record.wordId);
      if (existing) {
        existing.totalAttempts++;
        if (record.correct) {
          existing.correctCount++;
        } else {
          existing.incorrectCount++;
        }
        if (!existing.lastStudiedAt || record.studiedAt > existing.lastStudiedAt) {
          existing.lastStudiedAt = record.studiedAt;
        }
        existing.accuracy = Math.round((existing.correctCount / existing.totalAttempts) * 100);
      } else {
        statsMap.set(record.wordId, {
          wordId: record.wordId,
          totalAttempts: 1,
          correctCount: record.correct ? 1 : 0,
          incorrectCount: record.correct ? 0 : 1,
          lastStudiedAt: record.studiedAt,
          accuracy: record.correct ? 100 : 0,
        });
      }
    }

    return statsMap;
  },

  getWeakWords: (threshold: number = 60): number[] => {
    const statsMap = storage.getWordStats();
    const weakWordIds: number[] = [];

    statsMap.forEach((stats) => {
      if (stats.accuracy < threshold && stats.totalAttempts >= 1) {
        weakWordIds.push(stats.wordId);
      }
    });

    return weakWordIds;
  },

  getStudiedWordIds: (): number[] => {
    const statsMap = storage.getWordStats();
    return Array.from(statsMap.keys());
  },

  // ユーザーデータ管理
  getUserData: (): UserData => {
    if (typeof window === "undefined") return DEFAULT_USER_DATA;
    const data = localStorage.getItem(USER_DATA_KEY);
    if (!data) return DEFAULT_USER_DATA;

    const userData = JSON.parse(data) as UserData;

    // データ整合性チェック: totalXpは0以上
    if (typeof userData.totalXp !== "number" || userData.totalXp < 0) {
      userData.totalXp = 0;
    }

    // データ整合性チェック: levelは1以上かつtotalXpと整合
    if (typeof userData.level !== "number" || userData.level < 1) {
      userData.level = 1;
    }

    // レベルとXPの整合性を再計算（不正なデータを修復）
    let correctLevel = 1;
    while (userData.totalXp >= getRequiredXpForLevel(correctLevel)) {
      correctLevel++;
    }
    if (userData.level !== correctLevel) {
      userData.level = correctLevel;
    }

    // streakは0以上
    if (typeof userData.streak !== "number" || userData.streak < 0) {
      userData.streak = 0;
    }

    // 日付が変わっていたら今日の正解数をリセット
    if (!isToday(userData.todayDate)) {
      userData.todayCorrect = 0;
      userData.todayDate = getToday();
    }

    return userData;
  },

  saveUserData: (userData: UserData): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  },

  // 学習完了時に呼び出す（ストリーク・XP・レベル更新）
  recordStudySession: (correctCount: number, comboBonus: number = 0): UserData => {
    const userData = storage.getUserData();
    const today = getToday();

    // ストリーク更新
    if (userData.lastStudyDate === null) {
      // 初めての学習
      userData.streak = 1;
    } else if (isToday(userData.lastStudyDate)) {
      // 今日すでに学習済み - ストリークは維持
    } else if (isYesterday(userData.lastStudyDate)) {
      // 昨日学習した - ストリーク継続
      userData.streak += 1;
    } else {
      // 2日以上空いた - ストリークリセット
      userData.streak = 1;
    }

    // 今日の正解数を更新
    if (!isToday(userData.todayDate)) {
      userData.todayCorrect = correctCount;
      userData.todayDate = today;
    } else {
      userData.todayCorrect += correctCount;
    }

    // XP追加
    const earnedXp = (correctCount * XP_PER_CORRECT) + (comboBonus * XP_PER_COMBO_BONUS);
    userData.totalXp += earnedXp;

    // レベルアップチェック
    let requiredXp = getRequiredXpForLevel(userData.level);
    while (userData.totalXp >= requiredXp) {
      userData.level += 1;
      requiredXp = getRequiredXpForLevel(userData.level);
    }

    // 最終学習日を更新
    userData.lastStudyDate = today;

    storage.saveUserData(userData);
    return userData;
  },

  // レベルアップに必要なXPを計算
  getXpProgress: (userData: UserData): {
    current: number;
    required: number;
    percentage: number;
  } => {
    // 安全なデータを確保
    const safeLevel = Math.max(1, userData.level || 1);
    const safeTotalXp = Math.max(0, userData.totalXp || 0);

    const requiredForCurrentLevel = getRequiredXpForLevel(safeLevel);
    const previousLevelThreshold = (safeLevel - 1) * 100;

    // 現在のレベル内での進捗（0以上を保証）
    const currentXp = Math.max(0, safeTotalXp - previousLevelThreshold);

    // パーセンテージ（0-100の範囲を保証）
    const percentage = Math.max(0, Math.min(
      100,
      Math.round((currentXp / requiredForCurrentLevel) * 100)
    ));

    return {
      current: currentXp,
      required: requiredForCurrentLevel,
      percentage,
    };
  },


  // デイリー目標の達成状況
  getDailyProgress: (userData: UserData): { current: number; goal: number; percentage: number; completed: boolean } => {
    return {
      current: userData.todayCorrect,
      goal: userData.dailyGoal,
      percentage: Math.min(100, Math.round((userData.todayCorrect / userData.dailyGoal) * 100)),
      completed: userData.todayCorrect >= userData.dailyGoal,
    };
  },

  // 実績管理
  getUnlockedAchievements: (): UnlockedAchievement[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(ACHIEVEMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  unlockAchievement: (achievementId: string): UnlockedAchievement | null => {
    const unlocked = storage.getUnlockedAchievements();
    if (unlocked.some((a) => a.achievementId === achievementId)) {
      return null; // 既に解除済み
    }

    const achievement = getAchievementById(achievementId);
    if (!achievement) return null;

    const newUnlock: UnlockedAchievement = {
      achievementId,
      unlockedAt: new Date().toISOString(),
    };
    unlocked.push(newUnlock);
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
    return newUnlock;
  },

  isAchievementUnlocked: (achievementId: string): boolean => {
    const unlocked = storage.getUnlockedAchievements();
    return unlocked.some((a) => a.achievementId === achievementId);
  },

  // 実績条件チェック（新しく解除された実績のIDリストを返す）
  checkAndUnlockAchievements: (context: {
    totalQuestions?: number;
    maxCombo?: number;
    streak?: number;
    masteredWords?: number;
    level?: number;
    speedScore?: number;
    isSpeedChallenge?: boolean;
    dungeonStats?: DungeonStats;
  }): string[] => {
    const newlyUnlocked: string[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (storage.isAchievementUnlocked(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.category) {
        case "learning":
          if (context.totalQuestions !== undefined && context.totalQuestions >= achievement.requirement) {
            shouldUnlock = true;
          }
          break;
        case "combo":
          if (context.maxCombo !== undefined && context.maxCombo >= achievement.requirement) {
            shouldUnlock = true;
          }
          break;
        case "streak":
          if (context.streak !== undefined && context.streak >= achievement.requirement) {
            shouldUnlock = true;
          }
          break;
        case "mastery":
          if (context.masteredWords !== undefined && context.masteredWords >= achievement.requirement) {
            shouldUnlock = true;
          }
          break;
        case "level":
          if (context.level !== undefined && context.level >= achievement.requirement) {
            shouldUnlock = true;
          }
          break;
        case "speed":
          if (achievement.id === "speed_first" && context.isSpeedChallenge) {
            shouldUnlock = true;
          } else if (context.speedScore !== undefined && context.speedScore >= achievement.requirement) {
            shouldUnlock = true;
          }
          break;
        case "dungeon": {
          const ds = context.dungeonStats;
          if (!ds) break;
          if (achievement.id === "dungeon_enter" && ds.attempts >= 1) {
            shouldUnlock = true;
          } else if (achievement.id === "dungeon_floor3" && ds.maxFloor >= 3) {
            shouldUnlock = true;
          } else if (achievement.id === "dungeon_first_clear" && ds.clears >= 1) {
            shouldUnlock = true;
          } else if (achievement.id === "dungeon_kills_10" && ds.kills >= 10) {
            shouldUnlock = true;
          } else if (achievement.id === "dungeon_kills_50" && ds.kills >= 50) {
            shouldUnlock = true;
          } else if (achievement.id === "dungeon_correct_50" && ds.correct >= 50) {
            shouldUnlock = true;
          } else if (achievement.id === "dungeon_tenacious" && ds.attempts >= 3) {
            shouldUnlock = true;
          }
          break;
        }
      }

      if (shouldUnlock) {
        storage.unlockAchievement(achievement.id);
        newlyUnlocked.push(achievement.id);
      }
    }

    return newlyUnlocked;
  },

  // 習得した単語数（正答率80%以上で2回以上学習）
  getMasteredWordCount: (): number => {
    const statsMap = storage.getWordStats();
    let count = 0;
    statsMap.forEach((stats) => {
      if (stats.accuracy >= 80 && stats.totalAttempts >= 3) {
        count++;
      }
    });
    return count;
  },

  // スピードチャレンジ結果管理
  getSpeedChallengeResults: (): SpeedChallengeResult[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(SPEED_RESULTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addSpeedChallengeResult: (result: Omit<SpeedChallengeResult, "id" | "playedAt">): SpeedChallengeResult => {
    const results = storage.getSpeedChallengeResults();
    const newResult: SpeedChallengeResult = {
      ...result,
      id: crypto.randomUUID(),
      playedAt: new Date().toISOString(),
    };
    results.push(newResult);
    localStorage.setItem(SPEED_RESULTS_KEY, JSON.stringify(results));
    return newResult;
  },

  getSpeedChallengeHighScore: (): number => {
    const results = storage.getSpeedChallengeResults();
    if (results.length === 0) return 0;
    return Math.max(...results.map((r) => r.score));
  },

  getSpeedChallengeBestResult: (): SpeedChallengeResult | null => {
    const results = storage.getSpeedChallengeResults();
    if (results.length === 0) return null;
    return results.reduce((best, current) =>
      current.score > best.score ? current : best
    );
  },

  // ブックマーク管理
  getBookmarkedWordIds: (): number[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  isWordBookmarked: (wordId: number): boolean => {
    const bookmarks = storage.getBookmarkedWordIds();
    return bookmarks.includes(wordId);
  },

  addBookmark: (wordId: number): void => {
    const bookmarks = storage.getBookmarkedWordIds();
    if (!bookmarks.includes(wordId)) {
      bookmarks.push(wordId);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }
  },

  removeBookmark: (wordId: number): void => {
    const bookmarks = storage.getBookmarkedWordIds();
    const filtered = bookmarks.filter((id) => id !== wordId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
  },

  toggleBookmark: (wordId: number): boolean => {
    if (storage.isWordBookmarked(wordId)) {
      storage.removeBookmark(wordId);
      return false;
    } else {
      storage.addBookmark(wordId);
      return true;
    }
  },

  // 手動記憶度（学習者が明示的に設定する習得度）
  getManualMasteryMap: (): Record<number, ManualMasteryLevel> => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(MANUAL_MASTERY_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const next: Record<number, ManualMasteryLevel> = {};
      for (const [k, v] of Object.entries(parsed)) {
        const id = Number(k);
        if (Number.isNaN(id)) continue;
        // 旧データ互換: learning/familiar/mastered を新しい4段階へ移行
        if (v === "learning") {
          next[id] = "weak";
          continue;
        }
        if (v === "familiar") {
          next[id] = "almost";
          continue;
        }
        if (v === "mastered") {
          next[id] = "remembered";
          continue;
        }
        if (v === "unlearned" || v === "weak" || v === "vague" || v === "almost" || v === "remembered") {
          next[id] = v;
        }
      }
      return next;
    } catch {
      return {};
    }
  },

  getManualMastery: (wordId: number): ManualMasteryLevel | null => {
    const map = storage.getManualMasteryMap();
    return map[wordId] ?? null;
  },

  setManualMastery: (wordId: number, mastery: ManualMasteryLevel): void => {
    if (typeof window === "undefined") return;
    const map = storage.getManualMasteryMap();
    map[wordId] = mastery;
    localStorage.setItem(MANUAL_MASTERY_KEY, JSON.stringify(map));
  },

  // === SRS（間隔反復学習）===

  /** 全SRS進捗データを取得 */
  getSrsProgressAll: (): SrsProgress[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(SRS_PROGRESS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /** 特定単語のSRS進捗を取得 */
  getSrsProgress: (wordId: number): SrsProgress | null => {
    if (typeof window === "undefined") return null;
    const all = storage.getSrsProgressAll();
    return all.find((p) => p.wordId === wordId) ?? null;
  },

  /** SRS進捗を保存（既存があれば更新、なければ追加） */
  saveSrsProgress: (progress: SrsProgress): void => {
    if (typeof window === "undefined") return;
    const all = storage.getSrsProgressAll();
    const idx = all.findIndex((p) => p.wordId === progress.wordId);
    if (idx >= 0) {
      all[idx] = progress;
    } else {
      all.push(progress);
    }
    localStorage.setItem(SRS_PROGRESS_KEY, JSON.stringify(all));
  },

  /** 今日復習すべき単語のSRS進捗を取得 */
  getDueWords: (): SrsProgress[] => {
    if (typeof window === "undefined") return [];
    const all = storage.getSrsProgressAll();
    return all.filter(isDueForReview);
  },

  // ダンジョン統計管理
  getDungeonStats: (): DungeonStats => {
    const defaults: DungeonStats = { attempts: 0, kills: 0, correct: 0, clears: 0, maxFloor: 0, bestKills: 0, bestCorrect: 0 };
    if (typeof window === "undefined") return defaults;
    try {
      const data = localStorage.getItem(DUNGEON_STATS_KEY);
      if (!data) return defaults;
      return { ...defaults, ...(JSON.parse(data) as Partial<DungeonStats>) };
    } catch {
      return defaults;
    }
  },

  saveDungeonStats: (stats: DungeonStats): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DUNGEON_STATS_KEY, JSON.stringify(stats));
  },

  getDungeonRunLog: (): DungeonRunLog[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(DUNGEON_LOG_KEY);
      return data ? (JSON.parse(data) as DungeonRunLog[]) : [];
    } catch {
      return [];
    }
  },

  addDungeonRunLog: (entry: Omit<DungeonRunLog, "playedAt">): void => {
    if (typeof window === "undefined") return;
    const log = storage.getDungeonRunLog();
    const newEntry: DungeonRunLog = { ...entry, playedAt: new Date().toISOString() };
    const updated = [newEntry, ...log].slice(0, DUNGEON_LOG_MAX);
    localStorage.setItem(DUNGEON_LOG_KEY, JSON.stringify(updated));
  },

  // ダンジョンセーブデータ管理
  saveDungeonGame: (data: unknown): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DUNGEON_SAVE_KEY, JSON.stringify(data));
  },

  getDungeonGame: (): unknown => {
    if (typeof window === "undefined") return null;
    try {
      const d = localStorage.getItem(DUNGEON_SAVE_KEY);
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  },

  clearDungeonGame: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(DUNGEON_SAVE_KEY);
  },

  hasDungeonGame: (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DUNGEON_SAVE_KEY) !== null;
  },

  // ── Records（ランキング）─────────────────────────────────────────────────
  getDungeonRankings: (): import("@/lib/dungeon/types").DungeonRanking[] => {
    if (typeof window === "undefined") return [];
    try {
      const d = localStorage.getItem("dungeon_rankings");
      return d ? JSON.parse(d) : [];
    } catch { return []; }
  },

  addDungeonRanking: (r: import("@/lib/dungeon/types").DungeonRanking): number => {
    // バリデーション: スコア・フロアの範囲チェック
    if (typeof r.score !== "number" || r.score < 0 || r.score > 999999) return -1;
    if (typeof r.floor !== "number" || r.floor < 1 || r.floor > 99) return -1;
    if (typeof r.lv !== "number" || r.lv < 1 || r.lv > 99) return -1;
    const rankings = storage.getDungeonRankings();
    rankings.push(r);
    rankings.sort((a, b) => b.score - a.score);
    const trimmed = rankings.slice(0, 50);
    if (typeof window !== "undefined") {
      localStorage.setItem("dungeon_rankings", JSON.stringify(trimmed));
    }
    return trimmed.findIndex((x) => x === r) + 1; // 1-based rank
  },

  // ── 倉庫（アイテム持ち込み・持ち帰り）──────────────────────────────────────
  getWarehouse: (): import("@/lib/dungeon/types").InventoryItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const d = localStorage.getItem("dungeon_warehouse");
      if (!d) return [];
      const raw = JSON.parse(d);
      if (!Array.isArray(raw)) return [];
      // バリデーション: 各アイテムのcount上限・ID長チェック
      return raw.filter((item: unknown) => {
        if (!item || typeof item !== "object") return false;
        const it = item as Record<string, unknown>;
        if (typeof it.id !== "string" || it.id.length === 0 || it.id.length > 50) return false;
        if (typeof it.count !== "number" || it.count < 1 || it.count > 99) return false;
        return true;
      }).map((it: Record<string, unknown>) => ({
        ...it,
        count: Math.min(99, Math.max(1, it.count as number)),
      })) as import("@/lib/dungeon/types").InventoryItem[];
    } catch { return []; }
  },

  saveWarehouse: (items: import("@/lib/dungeon/types").InventoryItem[]): void => {
    if (typeof window === "undefined") return;
    // 保存時もcount上限を適用
    const sanitized = items.map((i) => ({ ...i, count: Math.min(99, Math.max(0, i.count)) })).filter((i) => i.count > 0);
    localStorage.setItem("dungeon_warehouse", JSON.stringify(sanitized));
  },

  getGoldBank: (): number => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = parseInt(localStorage.getItem("dungeon_gold_bank") ?? "0", 10) || 0;
      return Math.max(0, Math.min(999999, raw));
    } catch { return 0; }
  },

  saveGoldBank: (gold: number): void => {
    if (typeof window === "undefined") return;
    const clamped = Math.max(0, Math.min(999999, Math.floor(gold)));
    localStorage.setItem("dungeon_gold_bank", String(clamped));
  },

  // ── 倉庫持ち込み設定 ─────────────────────────────────────────────────
  getCarrySettings: (): { selectedItems: Record<string, number>; goldAmount: number } => {
    if (typeof window === "undefined") return { selectedItems: {}, goldAmount: 0 };
    try {
      const raw = localStorage.getItem("dungeon_carry_settings");
      if (!raw) return { selectedItems: {}, goldAmount: 0 };
      const parsed = JSON.parse(raw);
      // 旧フォーマット（string[]）からの互換
      if (Array.isArray(parsed.selectedItems)) {
        const obj: Record<string, number> = {};
        for (const id of parsed.selectedItems) obj[id] = 99;
        return { selectedItems: obj, goldAmount: parsed.goldAmount ?? 0 };
      }
      return parsed;
    } catch { return { selectedItems: {}, goldAmount: 0 }; }
  },
  saveCarrySettings: (settings: { selectedItems: Record<string, number>; goldAmount: number }): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("dungeon_carry_settings", JSON.stringify(settings));
  },

  // ── ミッション進捗（日/週/月リセット）──────────────────────────────────────

  /** ローカル日付文字列 "YYYY-MM-DD" */
  _localDate: (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },

  /** 今週月曜日の "YYYY-MM-DD" */
  _weekStart: (): string => {
    const d = new Date();
    const day = d.getDay(); // 0=日 1=月 ... 6=土
    const daysToMonday = day === 0 ? 6 : day - 1;
    const mon = new Date(d.getTime() - daysToMonday * 86400000);
    return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`;
  },

  /** 今月の "YYYY-MM" */
  _monthKey: (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  },

  _getOrInitProgress: (key: string, periodKey: string): PeriodProgress => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw) as PeriodProgress;
        if (data.periodKey === periodKey) return data;
      }
    } catch { /* ignore */ }
    return { periodKey, quizPlays: 0, speedPlays: 0, dungeonPlays: 0, completed: [] };
  },

  getDailyMissionProgress: (): PeriodProgress => {
    if (typeof window === "undefined") return { periodKey: "", quizPlays: 0, speedPlays: 0, dungeonPlays: 0, completed: [] };
    return storage._getOrInitProgress(DAILY_PROGRESS_KEY, storage._localDate());
  },

  getWeeklyMissionProgress: (): PeriodProgress => {
    if (typeof window === "undefined") return { periodKey: "", quizPlays: 0, speedPlays: 0, dungeonPlays: 0, completed: [] };
    return storage._getOrInitProgress(WEEKLY_PROGRESS_KEY, storage._weekStart());
  },

  getMonthlyMissionProgress: (): PeriodProgress => {
    if (typeof window === "undefined") return { periodKey: "", quizPlays: 0, speedPlays: 0, dungeonPlays: 0, completed: [] };
    return storage._getOrInitProgress(MONTHLY_PROGRESS_KEY, storage._monthKey());
  },

  /**
   * モードプレイを記録する。日/週/月すべての進捗に加算し、
   * 達成したミッションを `completed` に追加する。
   */
  recordModePlay: (mode: "quiz" | "speed" | "dungeon"): void => {
    if (typeof window === "undefined") return;
    const pk = mode === "quiz" ? "quizPlays" : mode === "speed" ? "speedPlays" : "dungeonPlays";

    const update = (
      key: string,
      periodKey: string,
      period: "daily" | "weekly" | "monthly",
    ): void => {
      const prog = storage._getOrInitProgress(key, periodKey);
      prog[pk]++;
      for (const m of MISSIONS.filter((ms) => ms.period === period && ms.progressKey === pk)) {
        if (!prog.completed.includes(m.id) && prog[pk] >= m.target) {
          prog.completed.push(m.id);
        }
      }
      localStorage.setItem(key, JSON.stringify(prog));
    };

    update(DAILY_PROGRESS_KEY, storage._localDate(), "daily");
    update(WEEKLY_PROGRESS_KEY, storage._weekStart(), "weekly");
    update(MONTHLY_PROGRESS_KEY, storage._monthKey(), "monthly");
  },

  /**
   * 現在の単語リストに存在しない孤立データを削除する。
   *
   * 削除対象:
   * - learning_records: validWordIds に含まれない wordId の学習記録
   * - srs_progress:     validWordIds に含まれない wordId の SRS スケジュール
   *
   * @param validWordIds 現在有効な単語 ID の配列
   * @returns 削除したエントリ数 { records, srsEntries }
   */
  cleanupOrphanedData: (validWordIds: number[]): { records: number; srsEntries: number } => {
    if (typeof window === "undefined") return { records: 0, srsEntries: 0 };
    const validSet = new Set(validWordIds);

    // learning_records のクリーンアップ
    const records = storage.getRecords();
    const filteredRecords = records.filter((r) => validSet.has(r.wordId));
    const deletedRecords = records.length - filteredRecords.length;
    if (deletedRecords > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords));
    }

    // SRS 進捗のクリーンアップ
    const srsAll = storage.getSrsProgressAll();
    const filteredSrs = srsAll.filter((p) => validSet.has(p.wordId));
    const deletedSrs = srsAll.length - filteredSrs.length;
    if (deletedSrs > 0) {
      localStorage.setItem(SRS_PROGRESS_KEY, JSON.stringify(filteredSrs));
    }

    return { records: deletedRecords, srsEntries: deletedSrs };
  },
};
