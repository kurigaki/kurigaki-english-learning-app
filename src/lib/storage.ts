import { LearningRecord, QuestionType, UnlockedAchievement, SpeedChallengeResult } from "@/types";
import { ACHIEVEMENTS, getAchievementById } from "@/data/achievements";

const STORAGE_KEY = "learning_records";
const USER_DATA_KEY = "user_data";
const ACHIEVEMENTS_KEY = "unlocked_achievements";
const SPEED_RESULTS_KEY = "speed_challenge_results";
const DEFAULT_USER_ID = "default";

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

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function isYesterday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0];
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

  getWeakWords: (threshold: number = 70): number[] => {
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
      if (stats.accuracy >= 80 && stats.totalAttempts >= 2) {
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
};
