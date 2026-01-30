-- 英語学習アプリ 初期スキーマ
-- Supabaseダッシュボードの SQL Editor で実行してください
-- 注意: 既存のオブジェクトがあっても安全に実行できます

-- ==================================================
-- 1. プロフィールテーブル
-- ==================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) を有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除してから再作成
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ==================================================
-- 2. ユーザーデータテーブル（レベル、XP、ストリークなど）
-- ==================================================
CREATE TABLE IF NOT EXISTS public.user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak INTEGER DEFAULT 0,
  last_study_date DATE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  daily_goal INTEGER DEFAULT 10,
  today_correct INTEGER DEFAULT 0,
  today_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS を有効化
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除してから再作成
DROP POLICY IF EXISTS "Users can read own user_data" ON public.user_data;
DROP POLICY IF EXISTS "Users can insert own user_data" ON public.user_data;
DROP POLICY IF EXISTS "Users can update own user_data" ON public.user_data;

CREATE POLICY "Users can read own user_data" ON public.user_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_data" ON public.user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_data" ON public.user_data
  FOR UPDATE USING (auth.uid() = user_id);

-- ==================================================
-- 3. 学習記録テーブル
-- ==================================================
CREATE TABLE IF NOT EXISTS public.learning_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('en-to-ja', 'ja-to-en', 'fill-blank')),
  correct BOOLEAN NOT NULL,
  studied_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS を有効化
ALTER TABLE public.learning_records ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除してから再作成
DROP POLICY IF EXISTS "Users can read own learning_records" ON public.learning_records;
DROP POLICY IF EXISTS "Users can insert own learning_records" ON public.learning_records;
DROP POLICY IF EXISTS "Users can delete own learning_records" ON public.learning_records;

CREATE POLICY "Users can read own learning_records" ON public.learning_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning_records" ON public.learning_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own learning_records" ON public.learning_records
  FOR DELETE USING (auth.uid() = user_id);

-- 検索用インデックス
CREATE INDEX IF NOT EXISTS idx_learning_records_user_id ON public.learning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_word_id ON public.learning_records(word_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_studied_at ON public.learning_records(studied_at DESC);

-- ==================================================
-- 4. 解除済み実績テーブル
-- ==================================================
CREATE TABLE IF NOT EXISTS public.unlocked_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- RLS を有効化
ALTER TABLE public.unlocked_achievements ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除してから再作成
DROP POLICY IF EXISTS "Users can read own achievements" ON public.unlocked_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.unlocked_achievements;

CREATE POLICY "Users can read own achievements" ON public.unlocked_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.unlocked_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 検索用インデックス
CREATE INDEX IF NOT EXISTS idx_unlocked_achievements_user_id ON public.unlocked_achievements(user_id);

-- ==================================================
-- 5. スピードチャレンジ結果テーブル
-- ==================================================
CREATE TABLE IF NOT EXISTS public.speed_challenge_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_limit INTEGER NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS を有効化
ALTER TABLE public.speed_challenge_results ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除してから再作成
DROP POLICY IF EXISTS "Users can read own speed_challenge_results" ON public.speed_challenge_results;
DROP POLICY IF EXISTS "Users can insert own speed_challenge_results" ON public.speed_challenge_results;

CREATE POLICY "Users can read own speed_challenge_results" ON public.speed_challenge_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own speed_challenge_results" ON public.speed_challenge_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 検索用インデックス
CREATE INDEX IF NOT EXISTS idx_speed_challenge_results_user_id ON public.speed_challenge_results(user_id);
CREATE INDEX IF NOT EXISTS idx_speed_challenge_results_played_at ON public.speed_challenge_results(played_at DESC);

-- ==================================================
-- 6. ブックマークテーブル
-- ==================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- RLS を有効化
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除してから再作成
DROP POLICY IF EXISTS "Users can read own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;

CREATE POLICY "Users can read own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- 検索用インデックス
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);

-- ==================================================
-- 更新日時を自動更新するトリガー関数
-- ==================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles テーブルの updated_at 自動更新
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- user_data テーブルの updated_at 自動更新
DROP TRIGGER IF EXISTS update_user_data_updated_at ON public.user_data;
CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON public.user_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
