// Supabaseデータベースの型定義
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_records: {
        Row: {
          id: string;
          user_id: string;
          word_id: number;
          word: string;
          meaning: string;
          question_type: string;
          correct: boolean;
          studied_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_id: number;
          word: string;
          meaning: string;
          question_type: string;
          correct: boolean;
          studied_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          word_id?: number;
          word?: string;
          meaning?: string;
          question_type?: string;
          correct?: boolean;
          studied_at?: string;
        };
        Relationships: [];
      };
      user_data: {
        Row: {
          id: string;
          user_id: string;
          streak: number;
          last_study_date: string | null;
          total_xp: number;
          level: number;
          daily_goal: number;
          today_correct: number;
          today_date: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          streak?: number;
          last_study_date?: string | null;
          total_xp?: number;
          level?: number;
          daily_goal?: number;
          today_correct?: number;
          today_date?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          streak?: number;
          last_study_date?: string | null;
          total_xp?: number;
          level?: number;
          daily_goal?: number;
          today_correct?: number;
          today_date?: string | null;
        };
        Relationships: [];
      };
      unlocked_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
        Relationships: [];
      };
      speed_challenge_results: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          correct_count: number;
          total_questions: number;
          time_limit: number;
          played_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          correct_count: number;
          total_questions: number;
          time_limit: number;
          played_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          score?: number;
          correct_count?: number;
          total_questions?: number;
          time_limit?: number;
          played_at?: string;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          word_id: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_id: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          word_id?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      srs_progress: {
        Row: {
          id: string;
          user_id: string;
          word_id: number;
          ease_factor: number;
          interval_days: number;
          repetitions: number;
          next_review_date: string | null;
          status: string;
          last_reviewed_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_id: number;
          ease_factor?: number;
          interval_days?: number;
          repetitions?: number;
          next_review_date?: string | null;
          status?: string;
          last_reviewed_date?: string | null;
        };
        Update: {
          ease_factor?: number;
          interval_days?: number;
          repetitions?: number;
          next_review_date?: string | null;
          status?: string;
          last_reviewed_date?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// プロフィール型
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// 学習記録型（Supabase用）
export type DbLearningRecord = Database["public"]["Tables"]["learning_records"]["Row"];
export type DbLearningRecordInsert = Database["public"]["Tables"]["learning_records"]["Insert"];

// ユーザーデータ型（Supabase用）
export type DbUserData = Database["public"]["Tables"]["user_data"]["Row"];
export type DbUserDataInsert = Database["public"]["Tables"]["user_data"]["Insert"];
export type DbUserDataUpdate = Database["public"]["Tables"]["user_data"]["Update"];

// 解除済み実績型（Supabase用）
export type DbUnlockedAchievement = Database["public"]["Tables"]["unlocked_achievements"]["Row"];
export type DbUnlockedAchievementInsert = Database["public"]["Tables"]["unlocked_achievements"]["Insert"];

// スピードチャレンジ結果型（Supabase用）
export type DbSpeedChallengeResult = Database["public"]["Tables"]["speed_challenge_results"]["Row"];
export type DbSpeedChallengeResultInsert = Database["public"]["Tables"]["speed_challenge_results"]["Insert"];

// ブックマーク型（Supabase用）
export type DbBookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
export type DbBookmarkInsert = Database["public"]["Tables"]["bookmarks"]["Insert"];

// SRS進捗型（Supabase用）
export type DbSrsProgress = Database["public"]["Tables"]["srs_progress"]["Row"];
export type DbSrsProgressInsert = Database["public"]["Tables"]["srs_progress"]["Insert"];
export type DbSrsProgressUpdate = Database["public"]["Tables"]["srs_progress"]["Update"];
