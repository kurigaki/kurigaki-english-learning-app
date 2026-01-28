/**
 * データ同期サービス
 * ログイン時にlocalStorageのデータをSupabaseに同期する
 */

import type { UserData } from "./storage";
import { supabaseStorage } from "./supabase/database";
import type {
  LearningRecord,
  UnlockedAchievement,
  SpeedChallengeResult,
} from "@/types";

// 同期結果の型
export type SyncResult = {
  success: boolean;
  error?: string;
  syncedData: {
    learningRecords: number;
    userData: boolean;
    achievements: number;
    speedChallengeResults: number;
    bookmarks: number;
  };
};

// localStorage のキー
const STORAGE_KEY = "learning_records";
const USER_DATA_KEY = "user_data";
const ACHIEVEMENTS_KEY = "unlocked_achievements";
const SPEED_RESULTS_KEY = "speed_challenge_results";
const BOOKMARKS_KEY = "bookmarked_words";
const SYNC_COMPLETED_KEY = "data_sync_completed";

/**
 * localStorageからデータを取得
 */
function getLocalData() {
  if (typeof window === "undefined") {
    return {
      records: [],
      userData: null,
      achievements: [],
      speedResults: [],
      bookmarks: [],
    };
  }

  const recordsRaw = localStorage.getItem(STORAGE_KEY);
  const userDataRaw = localStorage.getItem(USER_DATA_KEY);
  const achievementsRaw = localStorage.getItem(ACHIEVEMENTS_KEY);
  const speedResultsRaw = localStorage.getItem(SPEED_RESULTS_KEY);
  const bookmarksRaw = localStorage.getItem(BOOKMARKS_KEY);

  return {
    records: recordsRaw
      ? (JSON.parse(recordsRaw) as LearningRecord[])
      : [],
    userData: userDataRaw ? (JSON.parse(userDataRaw) as UserData) : null,
    achievements: achievementsRaw
      ? (JSON.parse(achievementsRaw) as UnlockedAchievement[])
      : [],
    speedResults: speedResultsRaw
      ? (JSON.parse(speedResultsRaw) as SpeedChallengeResult[])
      : [],
    bookmarks: bookmarksRaw ? (JSON.parse(bookmarksRaw) as number[]) : [],
  };
}

/**
 * ユーザーデータをマージ（高い値を優先）
 */
function mergeUserData(local: UserData | null, remote: UserData): UserData {
  if (!local) return remote;

  return {
    streak: Math.max(local.streak, remote.streak),
    lastStudyDate:
      local.lastStudyDate && remote.lastStudyDate
        ? local.lastStudyDate > remote.lastStudyDate
          ? local.lastStudyDate
          : remote.lastStudyDate
        : local.lastStudyDate || remote.lastStudyDate,
    totalXp: Math.max(local.totalXp, remote.totalXp),
    level: Math.max(local.level, remote.level),
    dailyGoal: local.dailyGoal || remote.dailyGoal,
    todayCorrect:
      local.todayDate === remote.todayDate
        ? Math.max(local.todayCorrect, remote.todayCorrect)
        : local.todayDate && remote.todayDate
          ? local.todayDate > remote.todayDate
            ? local.todayCorrect
            : remote.todayCorrect
          : local.todayCorrect || remote.todayCorrect,
    todayDate:
      local.todayDate && remote.todayDate
        ? local.todayDate > remote.todayDate
          ? local.todayDate
          : remote.todayDate
        : local.todayDate || remote.todayDate,
  };
}

/**
 * 同期が完了済みかどうかを確認
 */
export function isSyncCompleted(userId: string): boolean {
  if (typeof window === "undefined") return false;
  const key = `${SYNC_COMPLETED_KEY}_${userId}`;
  return localStorage.getItem(key) === "true";
}

/**
 * 同期完了フラグを設定
 */
function setSyncCompleted(userId: string): void {
  if (typeof window === "undefined") return;
  const key = `${SYNC_COMPLETED_KEY}_${userId}`;
  localStorage.setItem(key, "true");
}

/**
 * localStorageのデータをSupabaseに同期
 */
export async function syncLocalDataToSupabase(
  userId: string
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    syncedData: {
      learningRecords: 0,
      userData: false,
      achievements: 0,
      speedChallengeResults: 0,
      bookmarks: 0,
    },
  };

  try {
    // 既に同期済みの場合はスキップ
    if (isSyncCompleted(userId)) {
      result.success = true;
      return result;
    }

    const localData = getLocalData();

    // データがない場合は同期不要
    if (
      localData.records.length === 0 &&
      !localData.userData &&
      localData.achievements.length === 0 &&
      localData.speedResults.length === 0 &&
      localData.bookmarks.length === 0
    ) {
      setSyncCompleted(userId);
      result.success = true;
      return result;
    }

    // 1. 学習記録の同期（既存のIDと重複しないもののみ追加）
    if (localData.records.length > 0) {
      const remoteRecords = await supabaseStorage.getRecords(userId);
      const remoteIds = new Set(remoteRecords.map((r) => r.id));

      for (const record of localData.records) {
        // IDが重複している場合はスキップ
        if (remoteIds.has(record.id)) continue;

        await supabaseStorage.addRecord(userId, {
          wordId: record.wordId,
          word: record.word,
          meaning: record.meaning,
          questionType: record.questionType,
          correct: record.correct,
        });
        result.syncedData.learningRecords++;
      }
    }

    // 2. ユーザーデータの同期（高い値を優先）
    if (localData.userData) {
      const remoteUserData = await supabaseStorage.getUserData(userId);
      const mergedData = mergeUserData(localData.userData, remoteUserData);
      const saved = await supabaseStorage.saveUserData(userId, mergedData);
      result.syncedData.userData = saved;
    }

    // 3. 実績の同期（Union）
    if (localData.achievements.length > 0) {
      const remoteAchievements =
        await supabaseStorage.getUnlockedAchievements(userId);
      const remoteAchievementIds = new Set(
        remoteAchievements.map((a) => a.achievementId)
      );

      for (const achievement of localData.achievements) {
        if (remoteAchievementIds.has(achievement.achievementId)) continue;

        await supabaseStorage.unlockAchievement(
          userId,
          achievement.achievementId
        );
        result.syncedData.achievements++;
      }
    }

    // 4. スピードチャレンジ結果の同期（IDで重複チェック）
    if (localData.speedResults.length > 0) {
      const remoteResults =
        await supabaseStorage.getSpeedChallengeResults(userId);
      const remoteIds = new Set(remoteResults.map((r) => r.id));

      for (const speedResult of localData.speedResults) {
        if (remoteIds.has(speedResult.id)) continue;

        await supabaseStorage.addSpeedChallengeResult(userId, {
          score: speedResult.score,
          correctCount: speedResult.correctCount,
          totalQuestions: speedResult.totalQuestions,
          timeLimit: speedResult.timeLimit,
        });
        result.syncedData.speedChallengeResults++;
      }
    }

    // 5. ブックマークの同期（Union）
    if (localData.bookmarks.length > 0) {
      const remoteBookmarks =
        await supabaseStorage.getBookmarkedWordIds(userId);
      const remoteBookmarkSet = new Set(remoteBookmarks);

      for (const wordId of localData.bookmarks) {
        if (remoteBookmarkSet.has(wordId)) continue;

        await supabaseStorage.addBookmark(userId, wordId);
        result.syncedData.bookmarks++;
      }
    }

    // 同期完了フラグを設定
    setSyncCompleted(userId);
    result.success = true;
  } catch (error) {
    console.error("データ同期エラー:", error);
    result.error =
      error instanceof Error ? error.message : "同期中にエラーが発生しました";
  }

  return result;
}

/**
 * localStorageのデータをクリア（オプション：同期後に呼び出し可能）
 */
export function clearLocalDataAfterSync(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem(ACHIEVEMENTS_KEY);
  localStorage.removeItem(SPEED_RESULTS_KEY);
  localStorage.removeItem(BOOKMARKS_KEY);
}
