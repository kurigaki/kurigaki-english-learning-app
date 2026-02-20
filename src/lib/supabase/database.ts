import type { QuestionType, UnlockedAchievement, SpeedChallengeResult } from "@/types";
import type { UserData, WordStats } from "@/lib/storage";
import type {
  DbUserData,
  DbLearningRecord,
  DbUnlockedAchievement,
  DbSpeedChallengeResult,
  DbBookmark,
  DbSrsProgress,
} from "@/types/database";
import type { SrsProgress, SrsStatus } from "@/lib/srs";

// 環境変数から取得
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * localStorageからセッション情報を取得
 */
function getStoredSession(): { accessToken: string; refreshToken: string; expiresAt: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("english-app-auth");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return {
      accessToken: parsed?.access_token || null,
      refreshToken: parsed?.refresh_token || null,
      expiresAt: parsed?.expires_at || 0,
    };
  } catch {
    return null;
  }
}

/**
 * localStorageのセッション情報を更新
 */
function updateStoredSession(accessToken: string, refreshToken: string, expiresAt: number): void {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem("english-app-auth");
    if (!stored) return;
    const parsed = JSON.parse(stored);
    parsed.access_token = accessToken;
    parsed.refresh_token = refreshToken;
    parsed.expires_at = expiresAt;
    localStorage.setItem("english-app-auth", JSON.stringify(parsed));
  } catch {
    // 無視
  }
}

/**
 * トークンをリフレッシュ
 */
async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: number } | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
    };
  } catch {
    return null;
  }
}

/**
 * 有効なアクセストークンを取得（必要に応じてリフレッシュ）
 */
async function getValidAccessToken(): Promise<string | null> {
  const session = getStoredSession();
  if (!session?.accessToken) return null;

  // トークンの有効期限をチェック（30秒の余裕を持つ）
  const now = Math.floor(Date.now() / 1000);
  if (session.expiresAt && session.expiresAt - 30 < now) {
    // トークンが期限切れまたは期限切れ間近 - リフレッシュを試みる
    if (session.refreshToken) {
      const newSession = await refreshAccessToken(session.refreshToken);
      if (newSession) {
        updateStoredSession(newSession.accessToken, newSession.refreshToken, newSession.expiresAt);
        return newSession.accessToken;
      }
    }
    // リフレッシュ失敗 - 古いトークンを試す（まだ有効かもしれない）
  }

  return session.accessToken;
}

/**
 * Supabaseクライアントをバイパスして直接REST APIを呼び出す
 * これにより、クライアント内部のブロッキング問題を回避
 */
async function directSupabaseQuery<T>(
  table: string,
  queryParams: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: Record<string, unknown>;
    single?: boolean;
    returnData?: boolean; // POSTで作成したデータを返す
    upsert?: boolean; // UPSERT操作
  }
): Promise<{ data: T | null; error: { code?: string; message?: string } | null }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { data: null, error: { message: "Supabase not configured" } };
  }

  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return { data: null, error: { message: "No access token" } };
  }

  const method = options?.method || "GET";
  const url = `${SUPABASE_URL}/rest/v1/${table}?${queryParams}`;

  try {
    const headers: Record<string, string> = {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    if (options?.single) {
      headers["Accept"] = "application/vnd.pgrst.object+json";
    }

    if (options?.returnData) {
      headers["Prefer"] = "return=representation";
    }

    if (options?.upsert) {
      headers["Prefer"] = "resolution=merge-duplicates" + (options.returnData ? ",return=representation" : "");
    }

    const response = await fetch(url, {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    // 401エラーの場合、トークンリフレッシュを試みて再リクエスト
    if (response.status === 401) {
      const session = getStoredSession();
      if (session?.refreshToken) {
        const newSession = await refreshAccessToken(session.refreshToken);
        if (newSession) {
          updateStoredSession(newSession.accessToken, newSession.refreshToken, newSession.expiresAt);
          // 新しいトークンで再試行
          headers["Authorization"] = `Bearer ${newSession.accessToken}`;
          const retryResponse = await fetch(url, {
            method,
            headers,
            body: options?.body ? JSON.stringify(options.body) : undefined,
          });
          if (retryResponse.ok) {
            const contentType = retryResponse.headers.get("content-type");
            if (contentType?.includes("application/json") || contentType?.includes("application/vnd.pgrst")) {
              const data = await retryResponse.json();
              return { data: data as T, error: null };
            }
            return { data: null, error: null };
          }
        }
      }
      return { data: null, error: { code: "401", message: "Unauthorized - please re-login" } };
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      return { data: null, error: errorData };
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json") || contentType?.includes("application/vnd.pgrst")) {
      const data = await response.json();
      return { data: data as T, error: null };
    }

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: { message: (err as Error).message } };
  }
}

// ユーティリティ関数
function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Supabaseエラーがフォールバックすべきエラーかどうかを判定
 * テーブルが存在しない、接続エラーなどはフォールバックすべき
 */
function shouldFallback(error: { code?: string; message?: string }): boolean {
  // テーブルが存在しない
  if (error.code === "PGRST205" || error.code === "42P01") return true;
  // 接続エラー
  if (error.message?.includes("Failed to fetch")) return true;
  if (error.message?.includes("NetworkError")) return true;
  if (error.message?.includes("connection")) return true;
  // その他のPostgRESTエラー（スキーマ関連）
  if (error.code?.startsWith("PGRST")) return true;
  return false;
}

/**
 * Supabaseエラーを処理し、必要に応じて例外をthrow
 */
function handleSupabaseError(
  error: { code?: string; message?: string },
  operationName: string
): void {
  if (shouldFallback(error)) {
    console.warn(`[SupabaseStorage] ${operationName} failed, will fallback:`, error);
    throw new Error(`Supabase operation failed: ${operationName} - ${error.message || error.code}`);
  }
  // それ以外のエラーはログのみ（データなしなど）
  console.error(`[SupabaseStorage] ${operationName} error:`, error);
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

function toLocalSrsProgress(data: DbSrsProgress): SrsProgress {
  return {
    wordId: data.word_id,
    easeFactor: data.ease_factor,
    intervalDays: data.interval_days,
    repetitions: data.repetitions,
    nextReviewDate: data.next_review_date,
    status: data.status as SrsStatus,
    lastReviewedDate: data.last_reviewed_date,
  };
}

/**
 * Supabaseストレージ操作
 * エラー時はthrowしてunified-storageのフォールバックを発動させる
 */
export const supabaseStorage = {
  // 学習記録
  async getRecords(userId: string): Promise<LearningRecord[]> {
    const result = await directSupabaseQuery<DbLearningRecord[]>(
      "learning_records",
      `user_id=eq.${userId}&order=studied_at.desc`
    );

    if (result.error) {
      handleSupabaseError(result.error, "getRecords");
      return [];
    }

    return (result.data || []).map(toLocalRecord);
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
    const result = await directSupabaseQuery<DbLearningRecord>(
      "learning_records",
      "select=*",
      {
        method: "POST",
        body: {
          user_id: userId,
          word_id: record.wordId,
          word: record.word,
          meaning: record.meaning,
          question_type: record.questionType,
          correct: record.correct,
        },
        returnData: true,
        single: true,
      }
    );

    if (result.error) {
      handleSupabaseError(result.error, "addRecord");
      return null;
    }

    return result.data ? toLocalRecord(result.data) : null;
  },

  async clearRecords(userId: string): Promise<boolean> {
    const result = await directSupabaseQuery<null>(
      "learning_records",
      `user_id=eq.${userId}`,
      { method: "DELETE" }
    );

    if (result.error) {
      handleSupabaseError(result.error, "clearRecords");
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

  async getWeakWords(userId: string, threshold: number = 60): Promise<number[]> {
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
      if (stats.accuracy >= 80 && stats.totalAttempts >= 3) {
        count++;
      }
    });
    return count;
  },

  // ユーザーデータ
  async getUserData(userId: string): Promise<UserData> {
    const defaultData: UserData = {
      streak: 0,
      lastStudyDate: null,
      totalXp: 0,
      level: 1,
      dailyGoal: 10,
      todayCorrect: 0,
      todayDate: null,
    };

    const result = await directSupabaseQuery<DbUserData>(
      "user_data",
      `user_id=eq.${userId}`,
      { single: true }
    );

    if (result.error) {
      // データが存在しない場合は作成を試みる
      if ((result.error as { code?: string }).code === "PGRST116") {
        try {
          await supabaseStorage.saveUserData(userId, defaultData);
          return defaultData;
        } catch {
          throw new Error("Failed to create user data");
        }
      }
      handleSupabaseError(result.error, "getUserData");
      return defaultData;
    }

    if (!result.data) {
      // データが存在しない場合は作成を試みる
      try {
        await supabaseStorage.saveUserData(userId, defaultData);
        return defaultData;
      } catch {
        throw new Error("Failed to create user data");
      }
    }

    const userData = toLocalUserData(result.data);

    // 日付が変わっていたら今日の正解数をリセット
    const today = getToday();
    if (userData.todayDate !== today) {
      userData.todayCorrect = 0;
      userData.todayDate = today;
    }

    return userData;
  },

  async saveUserData(userId: string, userData: UserData): Promise<boolean> {
    const result = await directSupabaseQuery<null>(
      "user_data",
      "on_conflict=user_id",
      {
        method: "POST",
        body: {
          user_id: userId,
          streak: userData.streak,
          last_study_date: userData.lastStudyDate,
          total_xp: userData.totalXp,
          level: userData.level,
          daily_goal: userData.dailyGoal,
          today_correct: userData.todayCorrect,
          today_date: userData.todayDate,
        },
        upsert: true,
      }
    );

    if (result.error) {
      handleSupabaseError(result.error, "saveUserData");
      return false;
    }

    return true;
  },

  // 実績
  async getUnlockedAchievements(userId: string): Promise<UnlockedAchievement[]> {
    const result = await directSupabaseQuery<DbUnlockedAchievement[]>(
      "unlocked_achievements",
      `user_id=eq.${userId}`
    );

    if (result.error) {
      handleSupabaseError(result.error, "getUnlockedAchievements");
      return [];
    }

    return (result.data || []).map(toLocalAchievement);
  },

  async unlockAchievement(
    userId: string,
    achievementId: string
  ): Promise<UnlockedAchievement | null> {
    const result = await directSupabaseQuery<DbUnlockedAchievement>(
      "unlocked_achievements",
      "select=*",
      {
        method: "POST",
        body: {
          user_id: userId,
          achievement_id: achievementId,
        },
        returnData: true,
        single: true,
      }
    );

    if (result.error) {
      // 既に存在する場合は正常
      if (result.error.code === "23505") {
        return null;
      }
      handleSupabaseError(result.error, "unlockAchievement");
      return null;
    }

    return result.data ? toLocalAchievement(result.data) : null;
  },

  async isAchievementUnlocked(
    userId: string,
    achievementId: string
  ): Promise<boolean> {
    const result = await directSupabaseQuery<{ id: string }>(
      "unlocked_achievements",
      `user_id=eq.${userId}&achievement_id=eq.${achievementId}&select=id`,
      { single: true }
    );

    if (result.error) {
      // PGRST116はデータなし（= 未解除）
      if ((result.error as { code?: string }).code === "PGRST116") return false;
      handleSupabaseError(result.error, "isAchievementUnlocked");
      return false;
    }
    return Boolean(result.data);
  },

  // スピードチャレンジ
  async getSpeedChallengeResults(userId: string): Promise<SpeedChallengeResult[]> {
    const result = await directSupabaseQuery<DbSpeedChallengeResult[]>(
      "speed_challenge_results",
      `user_id=eq.${userId}&order=played_at.desc`
    );

    if (result.error) {
      handleSupabaseError(result.error, "getSpeedChallengeResults");
      return [];
    }

    return (result.data || []).map(toLocalSpeedResult);
  },

  async addSpeedChallengeResult(
    userId: string,
    resultData: Omit<SpeedChallengeResult, "id" | "playedAt">
  ): Promise<SpeedChallengeResult | null> {
    const result = await directSupabaseQuery<DbSpeedChallengeResult>(
      "speed_challenge_results",
      "select=*",
      {
        method: "POST",
        body: {
          user_id: userId,
          score: resultData.score,
          correct_count: resultData.correctCount,
          total_questions: resultData.totalQuestions,
          time_limit: resultData.timeLimit,
        },
        returnData: true,
        single: true,
      }
    );

    if (result.error) {
      handleSupabaseError(result.error, "addSpeedChallengeResult");
      return null;
    }

    return result.data ? toLocalSpeedResult(result.data) : null;
  },

  async getSpeedChallengeHighScore(userId: string): Promise<number> {
    const results = await supabaseStorage.getSpeedChallengeResults(userId);
    if (results.length === 0) return 0;
    return Math.max(...results.map((r) => r.score));
  },

  // ブックマーク
  async getBookmarkedWordIds(userId: string): Promise<number[]> {
    const result = await directSupabaseQuery<Pick<DbBookmark, "word_id">[]>(
      "bookmarks",
      `user_id=eq.${userId}&select=word_id`
    );

    if (result.error) {
      handleSupabaseError(result.error, "getBookmarkedWordIds");
      return [];
    }

    return (result.data || []).map((d) => d.word_id);
  },

  async isWordBookmarked(userId: string, wordId: number): Promise<boolean> {
    const result = await directSupabaseQuery<{ id: string }>(
      "bookmarks",
      `user_id=eq.${userId}&word_id=eq.${wordId}&select=id`,
      { single: true }
    );

    if (result.error) {
      // PGRST116はデータなし（= ブックマークされていない）
      if ((result.error as { code?: string }).code === "PGRST116") return false;
      handleSupabaseError(result.error, "isWordBookmarked");
      return false;
    }
    return Boolean(result.data);
  },

  async addBookmark(userId: string, wordId: number): Promise<boolean> {
    const result = await directSupabaseQuery<null>(
      "bookmarks",
      "",
      {
        method: "POST",
        body: {
          user_id: userId,
          word_id: wordId,
        },
      }
    );

    if (result.error) {
      // 既に存在する場合は正常
      if (result.error.code === "23505") {
        return true;
      }
      handleSupabaseError(result.error, "addBookmark");
      return false;
    }

    return true;
  },

  async removeBookmark(userId: string, wordId: number): Promise<boolean> {
    const result = await directSupabaseQuery<null>(
      "bookmarks",
      `user_id=eq.${userId}&word_id=eq.${wordId}`,
      { method: "DELETE" }
    );

    if (result.error) {
      handleSupabaseError(result.error, "removeBookmark");
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

  // === SRS（間隔反復学習）===

  async getSrsProgressAll(userId: string): Promise<SrsProgress[]> {
    const result = await directSupabaseQuery<DbSrsProgress[]>(
      "srs_progress",
      `user_id=eq.${userId}&select=*`
    );

    if (result.error) {
      handleSupabaseError(result.error, "getSrsProgressAll");
      return [];
    }

    return (result.data || []).map(toLocalSrsProgress);
  },

  async getSrsProgress(userId: string, wordId: number): Promise<SrsProgress | null> {
    const result = await directSupabaseQuery<DbSrsProgress>(
      "srs_progress",
      `user_id=eq.${userId}&word_id=eq.${wordId}&select=*`,
      { single: true }
    );

    if (result.error || !result.data) {
      return null;
    }

    return toLocalSrsProgress(result.data);
  },

  async saveSrsProgress(userId: string, progress: SrsProgress): Promise<void> {
    const result = await directSupabaseQuery(
      "srs_progress",
      "on_conflict=user_id,word_id",
      {
        method: "POST",
        body: {
          user_id: userId,
          word_id: progress.wordId,
          ease_factor: progress.easeFactor,
          interval_days: progress.intervalDays,
          repetitions: progress.repetitions,
          next_review_date: progress.nextReviewDate,
          status: progress.status,
          last_reviewed_date: progress.lastReviewedDate,
        },
        upsert: true,
      }
    );

    if (result.error) {
      handleSupabaseError(result.error, "saveSrsProgress");
    }
  },

  async getDueWords(userId: string): Promise<SrsProgress[]> {
    const today = getToday();
    const result = await directSupabaseQuery<DbSrsProgress[]>(
      "srs_progress",
      `user_id=eq.${userId}&next_review_date=lte.${today}&status=neq.new&select=*`
    );

    if (result.error) {
      handleSupabaseError(result.error, "getDueWords");
      return [];
    }

    return (result.data || []).map(toLocalSrsProgress);
  },
};
