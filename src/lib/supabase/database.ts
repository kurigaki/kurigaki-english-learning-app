import { getSupabaseClient } from "./client";
import type { QuestionType, UnlockedAchievement, SpeedChallengeResult } from "@/types";
import type { UserData, WordStats } from "@/lib/storage";
import type {
  DbUserData,
  DbLearningRecord,
  DbUnlockedAchievement,
  DbSpeedChallengeResult,
  DbBookmark,
} from "@/types/database";

// ユーティリティ関数
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// LearningRecord型（Supabaseから取得した後の変換用）
export type LearningRecord = {
  id: string;
  userId: string;
  wordId: number;
  word: string;
  meaning: string;
  questionType: QuestionType;
  correct: boolean;
  studiedAt: string;
};

// DbLearningRecordをLearningRecordに変換
function toLocalRecord(record: DbLearningRecord): LearningRecord {
  return {
    id: record.id,
    userId: record.user_id,
    wordId: record.word_id,
    word: record.word,
    meaning: record.meaning,
    questionType: record.question_type as QuestionType,
    correct: record.correct,
    studiedAt: record.studied_at,
  };
}

// DbUserDataをUserDataに変換
function toLocalUserData(data: DbUserData): UserData {
  return {
    streak: data.streak,
    lastStudyDate: data.last_study_date,
    totalXp: data.total_xp,
    level: data.level,
    dailyGoal: data.daily_goal,
    todayCorrect: data.today_correct,
    todayDate: data.today_date,
  };
}

// DbUnlockedAchievementをUnlockedAchievementに変換
function toLocalAchievement(data: DbUnlockedAchievement): UnlockedAchievement {
  return {
    achievementId: data.achievement_id,
    unlockedAt: data.unlocked_at,
  };
}

// DbSpeedChallengeResultをSpeedChallengeResultに変換
function toLocalSpeedResult(data: DbSpeedChallengeResult): SpeedChallengeResult {
  return {
    id: data.id,
    score: data.score,
    correctCount: data.correct_count,
    totalQuestions: data.total_questions,
    timeLimit: data.time_limit,
    playedAt: data.played_at,
  };
}

/**
 * Supabaseストレージ操作
 */
export const supabaseStorage = {
  // 学習記録
  async getRecords(userId: string): Promise<LearningRecord[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("learning_records")
      .select("*")
      .eq("user_id", userId)
      .order("studied_at", { ascending: false });

    if (error) {
      console.error("学習記録の取得に失敗:", error);
      return [];
    }

    return ((data || []) as DbLearningRecord[]).map(toLocalRecord);
  },

  async addRecord(
    userId: string,
    record: {
      wordId: number;
      word: string;
      meaning: string;
      questionType: QuestionType;
      correct: boolean;
    }
  ): Promise<LearningRecord | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("learning_records")
      .insert({
        user_id: userId,
        word_id: record.wordId,
        word: record.word,
        meaning: record.meaning,
        question_type: record.questionType,
        correct: record.correct,
      })
      .select()
      .single();

    if (error) {
      console.error("学習記録の追加に失敗:", error);
      return null;
    }

    return toLocalRecord(data as DbLearningRecord);
  },

  async clearRecords(userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("learning_records")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("学習記録の削除に失敗:", error);
      return false;
    }

    return true;
  },

  // 単語統計
  async getWordStats(userId: string): Promise<Map<number, WordStats>> {
    const records = await supabaseStorage.getRecords(userId);
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
        existing.accuracy = Math.round(
          (existing.correctCount / existing.totalAttempts) * 100
        );
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

  async getWeakWords(userId: string, threshold: number = 70): Promise<number[]> {
    const statsMap = await supabaseStorage.getWordStats(userId);
    const weakWordIds: number[] = [];

    statsMap.forEach((stats) => {
      if (stats.accuracy < threshold && stats.totalAttempts >= 1) {
        weakWordIds.push(stats.wordId);
      }
    });

    return weakWordIds;
  },

  async getStudiedWordIds(userId: string): Promise<number[]> {
    const statsMap = await supabaseStorage.getWordStats(userId);
    return Array.from(statsMap.keys());
  },

  async getMasteredWordCount(userId: string): Promise<number> {
    const statsMap = await supabaseStorage.getWordStats(userId);
    let count = 0;
    statsMap.forEach((stats) => {
      if (stats.accuracy >= 80 && stats.totalAttempts >= 2) {
        count++;
      }
    });
    return count;
  },

  // ユーザーデータ
  async getUserData(userId: string): Promise<UserData> {
    const supabase = getSupabaseClient();
    const defaultData: UserData = {
      streak: 0,
      lastStudyDate: null,
      totalXp: 0,
      level: 1,
      dailyGoal: 10,
      todayCorrect: 0,
      todayDate: null,
    };

    if (!supabase) return defaultData;

    const { data, error } = await supabase
      .from("user_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // データが存在しない場合は作成
        await supabaseStorage.saveUserData(userId, defaultData);
        return defaultData;
      }
      console.error("ユーザーデータの取得に失敗:", error);
      return defaultData;
    }

    const userData = toLocalUserData(data as DbUserData);

    // 日付が変わっていたら今日の正解数をリセット
    const today = getToday();
    if (userData.todayDate !== today) {
      userData.todayCorrect = 0;
      userData.todayDate = today;
    }

    return userData;
  },

  async saveUserData(userId: string, userData: UserData): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from("user_data").upsert(
      {
        user_id: userId,
        streak: userData.streak,
        last_study_date: userData.lastStudyDate,
        total_xp: userData.totalXp,
        level: userData.level,
        daily_goal: userData.dailyGoal,
        today_correct: userData.todayCorrect,
        today_date: userData.todayDate,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("ユーザーデータの保存に失敗:", error);
      return false;
    }

    return true;
  },

  // 実績
  async getUnlockedAchievements(userId: string): Promise<UnlockedAchievement[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("unlocked_achievements")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("実績の取得に失敗:", error);
      return [];
    }

    return ((data || []) as DbUnlockedAchievement[]).map(toLocalAchievement);
  },

  async unlockAchievement(
    userId: string,
    achievementId: string
  ): Promise<UnlockedAchievement | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("unlocked_achievements")
      .insert({
        user_id: userId,
        achievement_id: achievementId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // 既に存在する場合
        return null;
      }
      console.error("実績の解除に失敗:", error);
      return null;
    }

    return toLocalAchievement(data as DbUnlockedAchievement);
  },

  async isAchievementUnlocked(
    userId: string,
    achievementId: string
  ): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { data, error } = await supabase
      .from("unlocked_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("achievement_id", achievementId)
      .single();

    if (error) return false;
    return Boolean(data);
  },

  // スピードチャレンジ
  async getSpeedChallengeResults(userId: string): Promise<SpeedChallengeResult[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("speed_challenge_results")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: false });

    if (error) {
      console.error("スピードチャレンジ結果の取得に失敗:", error);
      return [];
    }

    return ((data || []) as DbSpeedChallengeResult[]).map(toLocalSpeedResult);
  },

  async addSpeedChallengeResult(
    userId: string,
    result: Omit<SpeedChallengeResult, "id" | "playedAt">
  ): Promise<SpeedChallengeResult | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("speed_challenge_results")
      .insert({
        user_id: userId,
        score: result.score,
        correct_count: result.correctCount,
        total_questions: result.totalQuestions,
        time_limit: result.timeLimit,
      })
      .select()
      .single();

    if (error) {
      console.error("スピードチャレンジ結果の追加に失敗:", error);
      return null;
    }

    return toLocalSpeedResult(data as DbSpeedChallengeResult);
  },

  async getSpeedChallengeHighScore(userId: string): Promise<number> {
    const results = await supabaseStorage.getSpeedChallengeResults(userId);
    if (results.length === 0) return 0;
    return Math.max(...results.map((r) => r.score));
  },

  // ブックマーク
  async getBookmarkedWordIds(userId: string): Promise<number[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("bookmarks")
      .select("word_id")
      .eq("user_id", userId);

    if (error) {
      console.error("ブックマークの取得に失敗:", error);
      return [];
    }

    return (data || []).map((d: Pick<DbBookmark, "word_id">) => d.word_id);
  },

  async isWordBookmarked(userId: string, wordId: number): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("word_id", wordId)
      .single();

    if (error) return false;
    return Boolean(data);
  },

  async addBookmark(userId: string, wordId: number): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from("bookmarks").insert({
      user_id: userId,
      word_id: wordId,
    });

    if (error) {
      if (error.code === "23505") {
        // 既に存在する場合
        return true;
      }
      console.error("ブックマークの追加に失敗:", error);
      return false;
    }

    return true;
  },

  async removeBookmark(userId: string, wordId: number): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("word_id", wordId);

    if (error) {
      console.error("ブックマークの削除に失敗:", error);
      return false;
    }

    return true;
  },

  async toggleBookmark(userId: string, wordId: number): Promise<boolean> {
    const isBookmarked = await supabaseStorage.isWordBookmarked(userId, wordId);
    if (isBookmarked) {
      await supabaseStorage.removeBookmark(userId, wordId);
      return false;
    } else {
      await supabaseStorage.addBookmark(userId, wordId);
      return true;
    }
  },
};
