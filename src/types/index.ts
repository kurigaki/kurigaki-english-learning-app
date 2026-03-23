// 問題タイプ
export type QuestionType = "en-to-ja" | "ja-to-en" | "listening" | "dictation" | "speaking";

// 問題タイプの出題比率（0〜100 の重みづけ、内部で正規化）
export type QuestionTypeRatios = {
  enToJa: number;    // A: 英語→日本語
  jaToEn: number;    // B: 日本語→英語
  listening: number; // C: リスニング（例文の空欄選択）
  dictation: number; // D: 書き取り（例文の空欄入力）
  speaking: number;  // E: スピーキング（声に出して英語で答える）
};

// クイズモード
export type QuizMode = "normal" | "speed";

// レビューモード
export type ReviewMode = "srs" | "weak";

// 品詞（5種に簡素化）
export type PartOfSpeech = "noun" | "verb" | "adjective" | "adverb" | "other";

// 例文
export type WordExample = {
  en: string;     // 英語の例文
  ja: string;     // 日本語訳
  context?: string; // 使用シーン（ビジネス、日常会話など）
};

// 発音データ（UK/US切り替え対応）
export type PronunciationData = {
  us: string;   // US発音記号 (例: /ˈskedʒuːl/)
  uk?: string;  // UK発音記号 (例: /ˈʃedjuːl/) - 差がある場合のみ
};

// 発音バリアント
export type PronunciationVariant = "us" | "uk";

// 単語コラム
export type WordColumn = {
  title: string;
  content: string;
  etymology?: string;          // 語源
  tips?: string[];             // 覚え方のヒント
};

// 関連語エントリ（品詞・意味付き）
export type RelatedWordEntry = {
  word: string;
  partOfSpeech: string;  // "名", "形", "動", "副" など（日本語略称）
  meaning: string;
  isAntonym?: boolean;   // true なら ↔ プレフィックスで表示
};

// 類義語の違いエントリ（構造化）
export type SynonymDifferenceEntry = {
  word: string;
  description: string;
};

/**
 * 単語拡張データ（word-extensions のマップ値型）
 * 単語詳細画面で表示するコアイメージ・使い方・類義語比較等を管理する。
 */
export type WordExtension = {
  pronunciation?: string | PronunciationData;
  coreImage?: string;
  usage?: string;
  synonymDifference?: string;
  synonymDifferenceEntries?: SynonymDifferenceEntry[];
  englishDefinition?: string;
  etymology?: string | string[];
  examples?: WordExample[];
  relatedWords?: string[];
  relatedWordEntries?: RelatedWordEntry[];
  synonyms?: string[];
  antonyms?: string[];
  column?: WordColumn;
};

// クイズの問題
export type Question = {
  word: {
    id: number;
    word: string;
    meaning: string;
    example?: string;
    exampleJa?: string;  // 例文の日本語訳
    imageUrl?: string;
    category?: string;
  };
  type: QuestionType;
  choices: string[];
  correctAnswer: string;
};

// 学習記録
export type LearningRecord = {
  id: string;
  userId: string; // 将来の認証対応用（現在は固定値"default"）
  wordId: number;
  word: string;
  meaning: string;
  questionType: QuestionType;
  correct: boolean;
  studiedAt: string; // ISO 8601形式
};

// 実績カテゴリ
export type AchievementCategory = "learning" | "combo" | "streak" | "mastery" | "level" | "speed" | "dungeon";

// 実績定義
export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number; // 達成に必要な数値
  rarity: "common" | "rare" | "epic" | "legendary";
};

// ユーザーが解除した実績
export type UnlockedAchievement = {
  achievementId: string;
  unlockedAt: string; // ISO 8601形式
};

// 記憶度レベル
export type MasteryLevel = "new" | "learning" | "familiar" | "mastered";

// ── ミッション（日/週/月リセット型実績） ──────────────────────────────────
export type MissionProgressKey = "quizPlays" | "speedPlays" | "dungeonPlays";

export type Mission = {
  id: string;
  period: "daily" | "weekly" | "monthly";
  name: string;
  description: string;
  icon: string;
  target: number;
  progressKey: MissionProgressKey;
};

/** 日/週/月ごとのプレイ回数と達成済みミッションID */
export type PeriodProgress = {
  periodKey: string; // 日: "YYYY-MM-DD"、週: "YYYY-MM-DD"(月曜日)、月: "YYYY-MM"
  quizPlays: number;
  speedPlays: number;
  dungeonPlays: number;
  completed: string[]; // 達成済みミッションID
};

// フラッシュカード表示用の単語データ
export type FlashcardWord = {
  id: number;
  word: string;
  meaning: string;
  mastery: MasteryLevel;
  example?: string;
  exampleJa?: string;
};

// 記憶度判定（accuracy >= 80 && attempts >= 3 で習得済み）
export const getMasteryLevel = (accuracy: number | null, attempts: number): MasteryLevel => {
  if (attempts === 0 || accuracy === null) return "new";
  if (accuracy >= 80 && attempts >= 3) return "mastered";
  if (accuracy >= 60) return "familiar";
  return "learning";
};

/**
 * 「苦手単語」の判定ヘルパー（閾値: 正答率 60% 未満）
 *
 * ─ getMasteryLevel との違い ─
 * getMasteryLevel は "new" / "learning" / "familiar" / "mastered" の
 * 4段階ラベルを返し、単語帳の色分けや記憶度表示に使います。
 * isWeakWord は「復習が必要かどうか」という boolean の判定に特化しており、
 * 苦手単語リストのフィルタリング・カウントに使います。
 *
 * 閾値を getMasteryLevel の "learning"（accuracy < 60）と揃えることで、
 * 単語帳で「苦手」と表示される単語とホーム・苦手単語ページの数が一致します。
 */
export const isWeakWord = (accuracy: number | null, attempts: number): boolean =>
  attempts >= 1 && accuracy !== null && accuracy < 60;

// 手動記憶度レベル（@/lib/storage の ManualMasteryLevel と同一定義）
// ※ storage.ts が @/types から import するため循環参照を避け、ここで独立して定義する
export type ManualMasteryLevel = "unlearned" | "weak" | "vague" | "almost" | "remembered";

// 単語帳のソートオプション
export type WordListSortOption =
  | "default"
  | "alphabetical"
  | "alphabetical-desc"
  | "accuracy"
  | "accuracy-desc"
  | "attempts"
  | "attempts-asc"
  | "mastery-asc"
  | "mastery-desc"
  | "difficulty";

// 単語帳詳細の絞り込み設定
export type BookDetailFilter = {
  accuracyRange: [number, number]; // [0, 100] = 全範囲（フィルターなし）
  daysSince: number | null;        // null = 絞り込みなし
  masteryLevels: ManualMasteryLevel[]; // 空配列 = 全て表示
};

// 単語表示モード（単語帳詳細）
export type WordDisplayMode = "both" | "hide-meaning" | "hide-word";

// クイズ・スピードチャレンジで回答した単語
export type AnsweredWord = {
  id: number;
  word: string;
  meaning: string;
  correct: boolean;
};

// スピードチャレンジ結果
export type SpeedChallengeResult = {
  id: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeLimit: number; // 秒
  playedAt: string; // ISO 8601形式
  maxCombo?: number;
  incorrectWordIds?: number[];
  mode?: string;
  difficulty?: string;
};
