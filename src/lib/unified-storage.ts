/**
 * 統合ストレージモジュール
 * ログイン中: Supabaseを使用（端末間同期）
 * 未ログイン: localStorageを使用（端末ローカル）
 * 接続エラー時: localStorageにフォールバック
 *
 * Note: 初回ログイン時はlocalStorageのデータをSupabaseに同期（data-sync.ts）
 */

import { getCurrentUserId, isLoggedIn, isAuthTimedOut } from "./user-session";
import { storage } from "./storage";
import { supabaseStorage } from "./supabase/database";
import type { UserData, WordStats } from "./storage";
import type {
  LearningRecord,
  QuestionType,
  UnlockedAchievement,
  SpeedChallengeResult,
} from "@/types";
import { ACHIEVEMENTS } from "@/data/achievements";
import { words } from "@/data/words/compat";
import type { SrsProgress } from "./srs";

/**
 * Supabaseを使用すべきかどうかを判定
 * ログイン中かつ認証がタイムアウトしていない場合にSupabaseを使用
 *
 * Note: 初回ログイン時のlocalStorage→Supabase同期は別途data-sync.tsで処理
 * Note: 認証タイムアウト時はlocalStorageを使用（Supabaseへの接続が不安定なため）
 */
function shouldUseSupabase(): boolean {
  const userId = getCurrentUserId();
  const timedOut = isAuthTimedOut();
  const result = userId !== null && !timedOut;
  console.log("[UnifiedStorage] shouldUseSupabase:", "userId=" + userId, "isAuthTimedOut=" + timedOut, "result=" + result);
  // ユーザーIDがあり、かつ認証がタイムアウトしていない場合のみSupabaseを使用
  return result;
}

/**
 * localStorageの操作を安全に実行（エラー時はデフォルト値を返す）
 */
function safeLocalOp<T>(localOp: () => T, defaultValue: T, operationName: string): T {
  try {
    return localOp();
  } catch (error) {
    console.error(`[UnifiedStorage] localStorage ${operationName} failed:`, error);
    return defaultValue;
  }
}

/**
 * Supabase操作をラップしてエラー/タイムアウト時にlocalStorageにフォールバック
 * リトライ機能付き（初回接続は時間がかかる場合がある）
 */
async function withFallback<T>(
  supabaseOp: () => Promise<T>,
  localOp: () => T,
  defaultValue: T,
  operationName: string,
  timeoutMs: number = 15000,
  maxRetries: number = 2
): Promise<T> {
  // Supabaseを使用すべきでない場合はlocalStorageを使用
  if (!shouldUseSupabase()) {
    return safeLocalOp(localOp, defaultValue, operationName);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // タイムアウト付きでSupabase操作を実行
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`${operationName} timeout`)), timeoutMs);
      });

      const result = await Promise.race([supabaseOp(), timeoutPromise]);
      // 成功した場合は結果を返す
      if (attempt > 0) {
        console.log(`[UnifiedStorage] ${operationName} succeeded on retry ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        console.log(`[UnifiedStorage] ${operationName} failed (attempt ${attempt + 1}/${maxRetries}), retrying...`);
        // 少し待ってからリトライ
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.warn(`[UnifiedStorage] ${operationName} failed after ${maxRetries} attempts, falling back to localStorage:`, lastError);
  return safeLocalOp(localOp, defaultValue, operationName);
}

/**
 * 統合ストレージ
 * storage.ts と同じインターフェースを提供
 */
export const unifiedStorage = {
  // 学習記録
  getRecords: async (): Promise<LearningRecord[]> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getRecords(userId);
      },
      () => storage.getRecords(),
      [],
      "getRecords"
    );
  },

  addRecord: async (record: {
    wordId: number;
    word: string;
    meaning: string;
    questionType: QuestionType;
    correct: boolean;
  }): Promise<LearningRecord | null> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.addRecord(userId, record);
      },
      () => storage.addRecord(record),
      null,
      "addRecord"
    );
  },

  clearRecords: async (): Promise<void> => {
    const userId = getCurrentUserId();
    if (userId && shouldUseSupabase()) {
      try {
        await supabaseStorage.clearRecords(userId);
        return;
      } catch (error) {
        console.warn("[UnifiedStorage] clearRecords failed, falling back to localStorage:", error);
      }
    }
    try {
      storage.clearRecords();
    } catch (error) {
      console.error("[UnifiedStorage] localStorage clearRecords failed:", error);
    }
  },

  // 単語統計
  getWordStats: async (): Promise<Map<number, WordStats>> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getWordStats(userId);
      },
      () => storage.getWordStats(),
      new Map<number, WordStats>(),
      "getWordStats"
    );
  },

  getWeakWords: async (threshold: number = 60): Promise<number[]> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getWeakWords(userId, threshold);
      },
      () => storage.getWeakWords(threshold),
      [],
      "getWeakWords"
    );
  },

  getStudiedWordIds: async (): Promise<number[]> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getStudiedWordIds(userId);
      },
      () => storage.getStudiedWordIds(),
      [],
      "getStudiedWordIds"
    );
  },

  getMasteredWordCount: async (): Promise<number> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getMasteredWordCount(userId);
      },
      () => storage.getMasteredWordCount(),
      0,
      "getMasteredWordCount"
    );
  },

  // ユーザーデータ
  getUserData: async (): Promise<UserData> => {
    const defaultUserData: UserData = {
      streak: 0,
      lastStudyDate: null,
      totalXp: 0,
      level: 1,
      dailyGoal: 10,
      todayCorrect: 0,
      todayDate: null,
    };
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getUserData(userId);
      },
      () => storage.getUserData(),
      defaultUserData,
      "getUserData"
    );
  },

  saveUserData: async (userData: UserData): Promise<void> => {
    const userId = getCurrentUserId();
    if (userId && shouldUseSupabase()) {
      try {
        await supabaseStorage.saveUserData(userId, userData);
        return;
      } catch (error) {
        console.warn("[UnifiedStorage] saveUserData failed, falling back to localStorage:", error);
      }
    }
    try {
      storage.saveUserData(userData);
    } catch (error) {
      console.error("[UnifiedStorage] localStorage saveUserData failed:", error);
    }
  },

  // 学習セッション記録（XP・レベル・ストリーク更新）
  recordStudySession: async (
    correctCount: number,
    comboBonus: number = 0
  ): Promise<UserData> => {
    const userId = getCurrentUserId();
    const useSupabase = shouldUseSupabase();

    const defaultUserData: UserData = {
      streak: 0,
      lastStudyDate: null,
      totalXp: 0,
      level: 1,
      dailyGoal: 10,
      todayCorrect: 0,
      todayDate: null,
    };

    // まず現在のユーザーデータを取得
    let userData: UserData;
    try {
      userData = (userId && useSupabase)
        ? await supabaseStorage.getUserData(userId)
        : storage.getUserData();
    } catch (error) {
      console.warn("[UnifiedStorage] getUserData failed in recordStudySession, using default:", error);
      try {
        userData = storage.getUserData();
      } catch (localError) {
        console.error("[UnifiedStorage] localStorage also failed, using default:", localError);
        userData = { ...defaultUserData };
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const isToday = (dateStr: string | null): boolean => dateStr === today;
    const isYesterday = (dateStr: string): boolean => {
      const date = new Date(dateStr);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return date.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0];
    };

    // ストリーク更新
    if (userData.lastStudyDate === null) {
      userData.streak = 1;
    } else if (isToday(userData.lastStudyDate)) {
      // 今日すでに学習済み - ストリークは維持
    } else if (isYesterday(userData.lastStudyDate)) {
      userData.streak += 1;
    } else {
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
    const XP_PER_CORRECT = 10;
    const XP_PER_COMBO_BONUS = 5;
    const earnedXp = correctCount * XP_PER_CORRECT + comboBonus * XP_PER_COMBO_BONUS;
    userData.totalXp += earnedXp;

    // レベルアップチェック
    const getRequiredXpForLevel = (level: number) => level * 100;
    let requiredXp = getRequiredXpForLevel(userData.level);
    while (userData.totalXp >= requiredXp) {
      userData.level += 1;
      requiredXp = getRequiredXpForLevel(userData.level);
    }

    // 最終学習日を更新
    userData.lastStudyDate = today;

    // 保存（エラーでも処理を継続 - UIには更新されたuserDataを返す）
    if (userId && useSupabase) {
      try {
        await supabaseStorage.saveUserData(userId, userData);
      } catch (error) {
        console.warn("[UnifiedStorage] saveUserData failed in recordStudySession, trying localStorage:", error);
        try {
          storage.saveUserData(userData);
        } catch (localError) {
          console.error("[UnifiedStorage] localStorage save also failed:", localError);
        }
      }
    } else {
      try {
        storage.saveUserData(userData);
      } catch (error) {
        console.error("[UnifiedStorage] localStorage save failed:", error);
      }
    }

    return userData;
  },

  // XP進捗取得（同期版 - UserDataを渡す）
  getXpProgress: (userData: UserData): {
    current: number;
    required: number;
    percentage: number;
  } => {
    return storage.getXpProgress(userData);
  },

  // デイリー進捗取得（同期版 - UserDataを渡す）
  getDailyProgress: (
    userData: UserData
  ): { current: number; goal: number; percentage: number; completed: boolean } => {
    return storage.getDailyProgress(userData);
  },

  // 実績
  getUnlockedAchievements: async (): Promise<UnlockedAchievement[]> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getUnlockedAchievements(userId);
      },
      () => storage.getUnlockedAchievements(),
      [],
      "getUnlockedAchievements"
    );
  },

  unlockAchievement: async (
    achievementId: string
  ): Promise<UnlockedAchievement | null> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.unlockAchievement(userId, achievementId);
      },
      () => storage.unlockAchievement(achievementId),
      null,
      "unlockAchievement"
    );
  },

  isAchievementUnlocked: async (achievementId: string): Promise<boolean> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.isAchievementUnlocked(userId, achievementId);
      },
      () => storage.isAchievementUnlocked(achievementId),
      false,
      "isAchievementUnlocked"
    );
  },

  // 実績条件チェック（新しく解除された実績のIDリストを返す）
  checkAndUnlockAchievements: async (context: {
    totalQuestions?: number;
    maxCombo?: number;
    streak?: number;
    masteredWords?: number;
    level?: number;
    speedScore?: number;
    isSpeedChallenge?: boolean;
  }): Promise<string[]> => {
    const newlyUnlocked: string[] = [];

    for (const achievement of ACHIEVEMENTS) {
      const isUnlocked = await unifiedStorage.isAchievementUnlocked(achievement.id);
      if (isUnlocked) continue;

      let shouldUnlock = false;

      switch (achievement.category) {
        case "learning":
          if (
            context.totalQuestions !== undefined &&
            context.totalQuestions >= achievement.requirement
          ) {
            shouldUnlock = true;
          }
          break;
        case "combo":
          if (
            context.maxCombo !== undefined &&
            context.maxCombo >= achievement.requirement
          ) {
            shouldUnlock = true;
          }
          break;
        case "streak":
          if (
            context.streak !== undefined &&
            context.streak >= achievement.requirement
          ) {
            shouldUnlock = true;
          }
          break;
        case "mastery":
          if (
            context.masteredWords !== undefined &&
            context.masteredWords >= achievement.requirement
          ) {
            shouldUnlock = true;
          }
          break;
        case "level":
          if (
            context.level !== undefined &&
            context.level >= achievement.requirement
          ) {
            shouldUnlock = true;
          }
          break;
        case "speed":
          if (achievement.id === "speed_first" && context.isSpeedChallenge) {
            shouldUnlock = true;
          } else if (
            context.speedScore !== undefined &&
            context.speedScore >= achievement.requirement
          ) {
            shouldUnlock = true;
          }
          break;
      }

      if (shouldUnlock) {
        await unifiedStorage.unlockAchievement(achievement.id);
        newlyUnlocked.push(achievement.id);
      }
    }

    return newlyUnlocked;
  },

  // スピードチャレンジ
  getSpeedChallengeResults: async (): Promise<SpeedChallengeResult[]> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getSpeedChallengeResults(userId);
      },
      () => storage.getSpeedChallengeResults(),
      [],
      "getSpeedChallengeResults"
    );
  },

  addSpeedChallengeResult: async (
    result: Omit<SpeedChallengeResult, "id" | "playedAt">
  ): Promise<SpeedChallengeResult | null> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.addSpeedChallengeResult(userId, result);
      },
      () => storage.addSpeedChallengeResult(result),
      null,
      "addSpeedChallengeResult"
    );
  },

  getSpeedChallengeHighScore: async (): Promise<number> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getSpeedChallengeHighScore(userId);
      },
      () => storage.getSpeedChallengeHighScore(),
      0,
      "getSpeedChallengeHighScore"
    );
  },

  getSpeedChallengeBestResult: async (): Promise<SpeedChallengeResult | null> => {
    const results = await unifiedStorage.getSpeedChallengeResults();
    if (results.length === 0) return null;
    return results.reduce((best, current) =>
      current.score > best.score ? current : best
    );
  },

  // ブックマーク
  getBookmarkedWordIds: async (): Promise<number[]> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getBookmarkedWordIds(userId);
      },
      () => storage.getBookmarkedWordIds(),
      [],
      "getBookmarkedWordIds"
    );
  },

  isWordBookmarked: async (wordId: number): Promise<boolean> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.isWordBookmarked(userId, wordId);
      },
      () => storage.isWordBookmarked(wordId),
      false,
      "isWordBookmarked"
    );
  },

  addBookmark: async (wordId: number): Promise<void> => {
    const userId = getCurrentUserId();
    if (userId && shouldUseSupabase()) {
      try {
        await supabaseStorage.addBookmark(userId, wordId);
        return;
      } catch (error) {
        console.warn("[UnifiedStorage] addBookmark failed, falling back to localStorage:", error);
      }
    }
    try {
      storage.addBookmark(wordId);
    } catch (error) {
      console.error("[UnifiedStorage] localStorage addBookmark failed:", error);
    }
  },

  removeBookmark: async (wordId: number): Promise<void> => {
    const userId = getCurrentUserId();
    if (userId && shouldUseSupabase()) {
      try {
        await supabaseStorage.removeBookmark(userId, wordId);
        return;
      } catch (error) {
        console.warn("[UnifiedStorage] removeBookmark failed, falling back to localStorage:", error);
      }
    }
    try {
      storage.removeBookmark(wordId);
    } catch (error) {
      console.error("[UnifiedStorage] localStorage removeBookmark failed:", error);
    }
  },

  toggleBookmark: async (wordId: number): Promise<boolean> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.toggleBookmark(userId, wordId);
      },
      () => storage.toggleBookmark(wordId),
      false,
      "toggleBookmark"
    );
  },

  // === SRS（間隔反復学習）===

  getSrsProgressAll: async (): Promise<SrsProgress[]> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getSrsProgressAll(userId);
      },
      () => storage.getSrsProgressAll(),
      [],
      "getSrsProgressAll"
    );
  },

  getSrsProgress: async (wordId: number): Promise<SrsProgress | null> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getSrsProgress(userId, wordId);
      },
      () => storage.getSrsProgress(wordId),
      null,
      "getSrsProgress"
    );
  },

  saveSrsProgress: async (progress: SrsProgress): Promise<void> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        await supabaseStorage.saveSrsProgress(userId, progress);
      },
      () => storage.saveSrsProgress(progress),
      undefined,
      "saveSrsProgress"
    );
  },

  getDueWords: async (): Promise<SrsProgress[]> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getDueWords(userId);
      },
      () => storage.getDueWords(),
      [],
      "getDueWords"
    );
  },

  /**
   * 当日の復習バッチを返す。
   *
   * 初回呼び出し時に getDueWords() で対象単語 ID を取得し localStorage にキャッシュする。
   * 同日中は常にキャッシュ済みのリストを返すため、復習後に SRS が更新されても
   * ホームカードが消えず、何度でも同日中に再挑戦できる。
   * 日付が変わると自動的にリセットされ、新しい復習リストを生成する。
   */
  getDailyReviewBatch: async (): Promise<SrsProgress[]> => {
    const BATCH_KEY = "srs_daily_batch";
    const today = new Date().toISOString().split("T")[0];

    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(BATCH_KEY);
        if (cached) {
          const { date, wordIds }: { date: string; wordIds: number[] } = JSON.parse(cached);
          if (date === today && wordIds.length > 0) {
            // キャッシュ済みの単語 ID に対応する最新の SRS 進捗を返す
            const all = await unifiedStorage.getSrsProgressAll();
            const batchSet = new Set(wordIds);
            return all.filter((p) => batchSet.has(p.wordId));
          }
        }
      } catch {
        // キャッシュ読み取り失敗時は通常の getDueWords() にフォールバック
      }
    }

    // 当日初回: getDueWords() で取得してキャッシュ
    const dueWords = await unifiedStorage.getDueWords();
    if (typeof window !== "undefined" && dueWords.length > 0) {
      try {
        localStorage.setItem(
          BATCH_KEY,
          JSON.stringify({ date: today, wordIds: dueWords.map((p) => p.wordId) })
        );
      } catch {
        // キャッシュ保存失敗は無視
      }
    }
    return dueWords;
  },

  /**
   * 現在の単語リストに存在しない孤立データを localStorage から削除する。
   * アプリ起動時に自動実行され、削除済み単語セットの残骸を掃除する。
   *
   * Supabase 側は unified-storage 経由での削除を行わない
   * （Supabase は RLS でユーザーデータが分離されており、孤立データの影響が軽微なため）。
   */
  cleanupOrphanedData: (): { records: number; srsEntries: number } => {
    const validWordIds = words.map((w) => w.id);
    return storage.cleanupOrphanedData(validWordIds);
  },

  // ヘルパー: ログイン状態を確認
  isLoggedIn,
};
