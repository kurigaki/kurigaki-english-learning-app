-- ============================================================
-- 002_word_master_schema.sql
-- 英語学習SaaS — 本番運用スキーマ（単語マスタ・SRS・課金）
--
-- Target: Supabase (PostgreSQL 15+)
-- Depends on: 001_initial_schema.sql
--
-- 設計方針:
--   - words.id は内部用 bigint（コース別レンジで自動採番）
--   - words.slug は外部公開ID（URL安全、UNIQUE）
--   - course/stage はマスターテーブルで正規化
--   - 各コース100万ID分のレンジを確保（将来拡張対応）
--   - RLS で全ユーザーデータを保護
-- ============================================================

-- ============================================================
-- 0. Utility: updated_at 自動更新関数
--    （001 で作成済みだが、冪等に再定義）
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. マスターテーブル: courses
-- ============================================================

CREATE TABLE IF NOT EXISTS public.courses (
  id            smallint      PRIMARY KEY,
  code          text          NOT NULL UNIQUE,
  name          text          NOT NULL,
  description   text          NOT NULL DEFAULT '',
  display_order int           NOT NULL DEFAULT 0,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.courses IS 'コースマスタ（中学英語, TOEIC 等）';
COMMENT ON COLUMN public.courses.code IS 'URL / API 用識別子 (例: junior, toeic)';

-- ============================================================
-- 2. マスターテーブル: stages
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stages (
  id            smallint      PRIMARY KEY,
  course_id     smallint      NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  code          text          NOT NULL UNIQUE,
  name          text          NOT NULL,
  level_order   int           NOT NULL DEFAULT 0,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.stages IS 'ステージマスタ（コース内の段階: 中学1年, TOEIC500 等）';
COMMENT ON COLUMN public.stages.code IS 'URL / API 用識別子 (例: junior1, toeic500)';

CREATE INDEX IF NOT EXISTS idx_stages_course_id
  ON public.stages(course_id);

-- ============================================================
-- 3. コース別シーケンス（100万ID/コース）
--
--    junior       : 1,000,000 – 1,999,999
--    senior       : 2,000,000 – 2,999,999
--    eiken        : 3,000,000 – 3,999,999
--    toeic        : 4,000,000 – 4,999,999
--    general      : 5,000,000 – 5,999,999
--    business     : 6,000,000 – 6,999,999
--    conversation : 7,000,000 – 7,999,999
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS public.words_seq_junior
  START WITH 1000000 INCREMENT BY 1 MAXVALUE 1999999 NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.words_seq_senior
  START WITH 2000000 INCREMENT BY 1 MAXVALUE 2999999 NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.words_seq_eiken
  START WITH 3000000 INCREMENT BY 1 MAXVALUE 3999999 NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.words_seq_toeic
  START WITH 4000000 INCREMENT BY 1 MAXVALUE 4999999 NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.words_seq_general
  START WITH 5000000 INCREMENT BY 1 MAXVALUE 5999999 NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.words_seq_business
  START WITH 6000000 INCREMENT BY 1 MAXVALUE 6999999 NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.words_seq_conversation
  START WITH 7000000 INCREMENT BY 1 MAXVALUE 7999999 NO CYCLE;

-- ============================================================
-- 4. words テーブル
-- ============================================================

CREATE TABLE IF NOT EXISTS public.words (
  -- 内部ID（コース別シーケンスから自動採番、外部非公開）
  id                    bigint        PRIMARY KEY,

  -- 外部公開ID（URL安全、API / フロントで使用）
  slug                  text          NOT NULL UNIQUE
    CONSTRAINT chk_words_slug CHECK (slug ~ '^[a-z0-9][a-z0-9\-]{2,63}$'),

  -- 所属コース・ステージ
  course_id             smallint      NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  stage_id              smallint      NOT NULL REFERENCES public.stages(id)  ON DELETE RESTRICT,

  -- 単語データ
  word                  text          NOT NULL,
  meaning               text          NOT NULL,
  part_of_speech        text          CHECK (part_of_speech IN (
                                        'noun','verb','adjective','adverb','other'
                                      )),
  example               text,
  example_translation   text,

  -- メタデータ
  difficulty            smallint      CHECK (difficulty BETWEEN 1 AND 10),
  frequency_rank        smallint,
  source                text,         -- 出典（教科書名 等）

  -- タイムスタンプ
  created_at            timestamptz   NOT NULL DEFAULT now(),
  updated_at            timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.words IS '単語マスタ — IDはコース別レンジで自動採番、外部にはslugを公開';
COMMENT ON COLUMN public.words.id IS '内部専用ID（コース別シーケンスから採番）';
COMMENT ON COLUMN public.words.slug IS '外部公開ID（例: junior1-000123, toeic500-001245）';
COMMENT ON COLUMN public.words.frequency_rank IS '頻出度: 1=最頻出 … 4=低頻出';

-- ============================================================
-- 4a. words — 自動ID採番トリガー
--
--     INSERT 時に id が NULL であれば、course_id に対応する
--     シーケンスから nextval で採番する。
-- ============================================================

CREATE OR REPLACE FUNCTION public.assign_word_id()
RETURNS TRIGGER AS $$
DECLARE
  v_course_code text;
  v_seq_name    text;
BEGIN
  SELECT code INTO STRICT v_course_code
    FROM public.courses
   WHERE id = NEW.course_id;

  v_seq_name := 'public.words_seq_' || v_course_code;

  NEW.id := nextval(v_seq_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_words_assign_id ON public.words;
CREATE TRIGGER trg_words_assign_id
  BEFORE INSERT ON public.words
  FOR EACH ROW
  WHEN (NEW.id IS NULL)
  EXECUTE FUNCTION public.assign_word_id();

-- ============================================================
-- 4b. words — stage/course 整合性チェック
--
--     stage_id が course_id に所属するか検証する。
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_word_stage_course()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.stages s
     WHERE s.id = NEW.stage_id
       AND s.course_id = NEW.course_id
  ) THEN
    RAISE EXCEPTION
      'stage_id=% does not belong to course_id=%',
      NEW.stage_id, NEW.course_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_words_check_stage ON public.words;
CREATE TRIGGER trg_words_check_stage
  BEFORE INSERT OR UPDATE ON public.words
  FOR EACH ROW
  EXECUTE FUNCTION public.check_word_stage_course();

-- updated_at 自動更新
DROP TRIGGER IF EXISTS trg_words_updated_at ON public.words;
CREATE TRIGGER trg_words_updated_at
  BEFORE UPDATE ON public.words
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 4c. words — インデックス
-- ============================================================

-- slug は UNIQUE 制約でインデックス済みだが、明示的にも作成
CREATE INDEX IF NOT EXISTS idx_words_course_id  ON public.words(course_id);
CREATE INDEX IF NOT EXISTS idx_words_stage_id   ON public.words(stage_id);
CREATE INDEX IF NOT EXISTS idx_words_word       ON public.words(word);
CREATE INDEX IF NOT EXISTS idx_words_difficulty  ON public.words(course_id, difficulty);

-- ============================================================
-- 5. user_word_progress（SRS: 間隔反復学習）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_word_progress (
  id               bigint        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id          bigint        NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,

  -- 学習ステータス
  status           text          NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','learning','review','mastered')),

  -- 正誤カウント
  correct_count    int           NOT NULL DEFAULT 0,
  incorrect_count  int           NOT NULL DEFAULT 0,
  review_count     int           NOT NULL DEFAULT 0,

  -- SM-2 アルゴリズム用パラメータ
  ease_factor      real          NOT NULL DEFAULT 2.5,
  interval_days    int           NOT NULL DEFAULT 0,

  -- レビュースケジュール
  last_reviewed_at timestamptz,
  next_review_at   timestamptz,

  -- タイムスタンプ
  created_at       timestamptz   NOT NULL DEFAULT now(),
  updated_at       timestamptz   NOT NULL DEFAULT now(),

  -- 1ユーザー1単語につき1レコード
  UNIQUE (user_id, word_id)
);

COMMENT ON TABLE public.user_word_progress IS 'ユーザー別単語学習進捗（SM-2 間隔反復対応）';
COMMENT ON COLUMN public.user_word_progress.ease_factor IS 'SM-2 易しさ係数（初期値 2.5）';
COMMENT ON COLUMN public.user_word_progress.interval_days IS '次回復習までの日数間隔';

-- updated_at 自動更新
DROP TRIGGER IF EXISTS trg_uwp_updated_at ON public.user_word_progress;
CREATE TRIGGER trg_uwp_updated_at
  BEFORE UPDATE ON public.user_word_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- インデックス
CREATE INDEX IF NOT EXISTS idx_uwp_user_id
  ON public.user_word_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_uwp_word_id
  ON public.user_word_progress(word_id);

-- 「今日復習すべき単語」クエリの高速化（最頻出クエリ）
CREATE INDEX IF NOT EXISTS idx_uwp_next_review
  ON public.user_word_progress(user_id, next_review_at)
  WHERE status IN ('learning', 'review');

-- ステータス別集計の高速化
CREATE INDEX IF NOT EXISTS idx_uwp_status
  ON public.user_word_progress(user_id, status);

-- ============================================================
-- 6. review_logs（回答履歴 — イミュータブル）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.review_logs (
  id                bigint        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id           bigint        NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,

  -- 回答データ
  result            boolean       NOT NULL,
  response_time_ms  int,
  question_type     text          CHECK (question_type IN (
                                    'en-to-ja','ja-to-en','fill-blank'
                                  )),

  -- タイムスタンプ（書き込み専用、更新なし）
  created_at        timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.review_logs IS '学習ログ（全回答履歴、イミュータブル）';

-- インデックス
CREATE INDEX IF NOT EXISTS idx_rl_user_id
  ON public.review_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_rl_user_word
  ON public.review_logs(user_id, word_id);

-- 直近の学習履歴表示（DESC ソート）
CREATE INDEX IF NOT EXISTS idx_rl_created_at
  ON public.review_logs(user_id, created_at DESC);

-- 日別集計クエリ用（date_trunc 使用時）
CREATE INDEX IF NOT EXISTS idx_rl_created_date
  ON public.review_logs(user_id, (created_at::date));

-- ============================================================
-- 7. subscriptions（SaaS 課金 — Stripe 連携前提）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      bigint        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id                 uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- プラン
  plan                    text          NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free','pro','premium')),

  -- ステータス
  status                  text          NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','canceled','past_due','trialing','paused','incomplete')),

  -- Stripe 連携
  stripe_customer_id      text,
  stripe_subscription_id  text,
  stripe_price_id         text,

  -- 課金期間
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at               timestamptz,
  canceled_at             timestamptz,
  trial_start             timestamptz,
  trial_end               timestamptz,

  -- タイムスタンプ
  created_at              timestamptz   NOT NULL DEFAULT now(),
  updated_at              timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS 'サブスクリプション管理（Stripe webhook 連携前提）';

-- updated_at 自動更新
DROP TRIGGER IF EXISTS trg_sub_updated_at ON public.subscriptions;
CREATE TRIGGER trg_sub_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- インデックス
CREATE INDEX IF NOT EXISTS idx_sub_user_id
  ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_sub_active
  ON public.subscriptions(status)
  WHERE status = 'active';

-- Stripe ID のユニーク制約（NULL 以外）
CREATE UNIQUE INDEX IF NOT EXISTS idx_sub_stripe_subscription
  ON public.subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sub_stripe_customer
  ON public.subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- ============================================================
-- 8. Row Level Security (RLS)
-- ============================================================

-- ----------------------------------------------------------
-- 8a. courses, stages, words — 全員読み取り可、書き込みは
--     service_role（管理API / マイグレーション）のみ
-- ----------------------------------------------------------

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words   ENABLE ROW LEVEL SECURITY;

-- SELECT: 認証不要で全員閲覧可（無料ティアでも単語一覧を見られる）
DROP POLICY IF EXISTS "courses: public read" ON public.courses;
CREATE POLICY "courses: public read" ON public.courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "stages: public read" ON public.stages;
CREATE POLICY "stages: public read" ON public.stages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "words: public read" ON public.words;
CREATE POLICY "words: public read" ON public.words
  FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: ポリシーなし → service_role のみ操作可能

-- ----------------------------------------------------------
-- 8b. user_word_progress — 本人のみ CRUD
-- ----------------------------------------------------------

ALTER TABLE public.user_word_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "uwp: select own" ON public.user_word_progress;
CREATE POLICY "uwp: select own" ON public.user_word_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "uwp: insert own" ON public.user_word_progress;
CREATE POLICY "uwp: insert own" ON public.user_word_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "uwp: update own" ON public.user_word_progress;
CREATE POLICY "uwp: update own" ON public.user_word_progress
  FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "uwp: delete own" ON public.user_word_progress;
CREATE POLICY "uwp: delete own" ON public.user_word_progress
  FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------
-- 8c. review_logs — 本人のみ INSERT + SELECT（ログは不変）
-- ----------------------------------------------------------

ALTER TABLE public.review_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rl: select own" ON public.review_logs;
CREATE POLICY "rl: select own" ON public.review_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "rl: insert own" ON public.review_logs;
CREATE POLICY "rl: insert own" ON public.review_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE / DELETE なし: ログはイミュータブル

-- ----------------------------------------------------------
-- 8d. subscriptions — 本人は SELECT のみ
--     INSERT/UPDATE は Stripe webhook (service_role) 経由
-- ----------------------------------------------------------

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sub: select own" ON public.subscriptions;
CREATE POLICY "sub: select own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE: service_role のみ（Stripe webhook handler）

-- ============================================================
-- 9. シードデータ: courses & stages
-- ============================================================

INSERT INTO public.courses (id, code, name, description, display_order) VALUES
  (1, 'junior',       '中学英語',       '中学1年〜3年の基礎英語',              10),
  (2, 'senior',       '高校英語',       '高校1年〜3年の応用英語',              20),
  (3, 'eiken',        '英検',           '英検5級〜1級対策',                    30),
  (4, 'toeic',        'TOEIC',          'TOEIC 500〜900点対策',               40),
  (5, 'general',      '一般英語',       '一般的な英語語彙（将来用）',           50),
  (6, 'business',     'ビジネス英語',   'ビジネスシーンの英語（将来用）',       60),
  (7, 'conversation', '英会話',         '実践的な英会話フレーズ',              70)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.stages (id, course_id, code, name, level_order) VALUES
  -- junior (course_id = 1)
  (101, 1, 'junior1',    '中学1年',      1),
  (102, 1, 'junior2',    '中学2年',      2),
  (103, 1, 'junior3',    '中学3年',      3),

  -- senior (course_id = 2)
  (201, 2, 'senior1',    '高校1年',      1),
  (202, 2, 'senior2',    '高校2年',      2),
  (203, 2, 'senior3',    '高校3年',      3),

  -- eiken (course_id = 3)
  (301, 3, 'eiken5',     '5級',          1),
  (302, 3, 'eiken4',     '4級',          2),
  (303, 3, 'eiken3',     '3級',          3),
  (304, 3, 'eikenpre2',  '準2級',        4),
  (305, 3, 'eiken2',     '2級',          5),
  (306, 3, 'eikenpre1',  '準1級',        6),
  (307, 3, 'eiken1',     '1級',          7),

  -- toeic (course_id = 4)
  (401, 4, 'toeic500',   '500点',        1),
  (402, 4, 'toeic600',   '600点',        2),
  (403, 4, 'toeic700',   '700点',        3),
  (404, 4, 'toeic800',   '800点',        4),
  (405, 4, 'toeic900',   '900点',        5),

  -- conversation (course_id = 7)
  (701, 7, 'conv1',      '超初歩',       1),
  (702, 7, 'conv2',      '初級',         2),
  (703, 7, 'conv3',      '中級',         3),
  (704, 7, 'conv4',      '上級',         4),
  (705, 7, 'conv5',      'ネイティブ',    5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 10. ビュー: 復習キュー（参考実装）
--
--     next_review_at <= now() の単語を優先度順で返す。
--     アプリ側から SELECT * FROM review_queue LIMIT 20 で利用。
-- ============================================================

CREATE OR REPLACE VIEW public.review_queue AS
SELECT
  uwp.id          AS progress_id,
  uwp.user_id,
  uwp.word_id,
  uwp.status,
  uwp.ease_factor,
  uwp.interval_days,
  uwp.next_review_at,
  uwp.review_count,
  w.word,
  w.meaning,
  w.slug,
  w.part_of_speech,
  w.example,
  w.example_translation,
  c.code           AS course_code,
  s.code           AS stage_code
FROM public.user_word_progress uwp
JOIN public.words   w ON w.id = uwp.word_id
JOIN public.courses c ON c.id = w.course_id
JOIN public.stages  s ON s.id = w.stage_id
WHERE uwp.status IN ('learning', 'review')
  AND uwp.next_review_at <= now()
ORDER BY uwp.next_review_at ASC;

COMMENT ON VIEW public.review_queue IS '復習キュー: next_review_at に達した単語を返す';

-- ============================================================
-- 完了
-- ============================================================
