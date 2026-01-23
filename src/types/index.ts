// 問題タイプ
export type QuestionType = "en-to-ja" | "ja-to-en" | "fill-blank";

// クイズモード
export type QuizMode = "normal" | "speed";

// 品詞
export type PartOfSpeech =
  | "noun"        // 名詞
  | "verb"        // 動詞
  | "adjective"   // 形容詞
  | "adverb"      // 副詞
  | "preposition" // 前置詞
  | "conjunction" // 接続詞
  | "pronoun"     // 代名詞
  | "interjection"; // 間投詞

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

// 拡張単語データ
export type WordExtended = {
  pronunciation?: string;      // 発音記号
  partOfSpeech?: PartOfSpeech; // 品詞
  audioUrl?: string;           // 音声ファイルURL（将来対応用）
  imageUrl?: string;           // イメージ画像URL
  examples?: WordExample[];    // 複数の例文
  synonyms?: string[];         // 類義語
  antonyms?: string[];         // 対義語
  column?: WordColumn;         // 学習コラム
  coreImage?: string;          // コアイメージ説明
  relatedWords?: string[];     // 関連語
  usage?: string;              // 使い方説明
  synonymDifference?: string;  // 類義語との違い
  englishDefinition?: string;  // 英英定義
  etymology?: string;          // 語源
};

// クイズの問題
export type Question = {
  word: {
    id: number;
    word: string;
    meaning: string;
    example?: string;
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
export type AchievementCategory = "learning" | "combo" | "streak" | "mastery" | "level" | "speed";

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

// スピードチャレンジ結果
export type SpeedChallengeResult = {
  id: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeLimit: number; // 秒
  playedAt: string; // ISO 8601形式
};
