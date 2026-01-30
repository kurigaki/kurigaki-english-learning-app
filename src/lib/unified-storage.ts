/**
 * 統合ストレージモジュール
 * ログイン中 & 同期完了: Supabaseを使用（端末間同期）
 * 未ログイン or 同期未完了: localStorageを使用（端末ローカル）
 * 接続エラー時: localStorageにフォールバック
 */

import { getCurrentUserId, isLoggedIn } from "./user-session";
import { storage } from "./storage";
import { supabaseStorage } from "./supabase/database";
import { isSyncCompleted } from "./data-sync";
import type { UserData, WordStats } from "./storage";
import type {
  LearningRecord,
  QuestionType,
  UnlockedAchievement,
  SpeedChallengeResult,
} from "@/types";
import { ACHIEVEMENTS } from "@/data/achievements";

/**
 * Supabaseを使用すべきかどうかを判定
 * ログイン中かつ同期完了済みの場合のみSupabaseを使用
 */
function shouldUseSupabase(): boolean {
  const userId = getCurrentUserId();
  if (!userId) return false;

  // 同期が完了していない場合はlocalStorageを使用
  if (!isSyncCompleted(userId)) {
    return false;
  }

  return true;
}

/**
 * Supabase操作をラップしてエラー時にlocalStorageにフォールバック
 */
async function withFallback<T>(
  supabaseOp: () => Promise<T>,
  localOp: () => T,
  operationName: string
): Promise<T> {
  // Supabaseを使用すべきでない場合はlocalStorageを使用
  if (!shouldUseSupabase()) {
    return localOp();
  }

  try {
    return await supabaseOp();
  } catch (error) {
    console.warn(`[UnifiedStorage] ${operationName} failed, falling back to localStorage:`, error);
    return localOp();
  }
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
    storage.clearRecords();
  },

  // 単語統計
  getWordStats: async (): Promise<Map<number, WordStats>> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getWordStats(userId);
      },
      () => storage.getWordStats(),
      "getWordStats"
    );
  },

  getWeakWords: async (threshold: number = 70): Promise<number[]> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getWeakWords(userId, threshold);
      },
      () => storage.getWeakWords(threshold),
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
      "getMasteredWordCount"
    );
  },

  // ユーザーデータ
  getUserData: async (): Promise<UserData> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.getUserData(userId);
      },
      () => storage.getUserData(),
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
    storage.saveUserData(userData);
  },

  // 学習セッション記録（XP・レベル・ストリーク更新）
  recordStudySession: async (
    correctCount: number,
    comboBonus: number = 0
  ): Promise<UserData> => {
    const userId = getCurrentUserId();
    const useSupabase = shouldUseSupabase();

    // まず現在のユーザーデータを取得
    let userData: UserData;
    try {
      userData = (userId && useSupabase)
        ? await supabaseStorage.getUserData(userId)
        : storage.getUserData();
    } catch (error) {
      console.warn("[UnifiedStorage] getUserData failed in recordStudySession, using localStorage:", error);
      userData = storage.getUserData();
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

    // 保存
    if (userId && useSupabase) {
      try {
        await supabaseStorage.saveUserData(userId, userData);
      } catch (error) {
        console.warn("[UnifiedStorage] saveUserData failed in recordStudySession, using localStorage:", error);
        storage.saveUserData(userData);
      }
    } else {
      storage.saveUserData(userData);
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
    storage.addBookmark(wordId);
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
    storage.removeBookmark(wordId);
  },

  toggleBookmark: async (wordId: number): Promise<boolean> => {
    return withFallback(
      async () => {
        const userId = getCurrentUserId()!;
        return await supabaseStorage.toggleBookmark(userId, wordId);
      },
      () => storage.toggleBookmark(wordId),
      "toggleBookmark"
    );
  },

  // ヘルパー: ログイン状態を確認
  isLoggedIn,
};
