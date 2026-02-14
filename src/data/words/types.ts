import { PartOfSpeech, WordExample, WordColumn, PronunciationData } from "@/types";

// コース種別
export type CourseType =
  | "junior" // 中学英語
  | "senior" // 高校英語
  | "eiken" // 英検
  | "toeic" // TOEIC
  | "conversation"; // 英会話

// コースレベル
export type CourseLevel = {
  courseType: CourseType;
  level: string; // "junior1", "eiken3", "toeic600" など
  displayName: string; // "中学1年", "英検3級", "TOEIC600" など
};

// 拡張カテゴリ（シチュエーション別）
export type ExtendedCategory =
  // 既存（TOEIC向け）
  | "business" // ビジネス一般
  | "office" // オフィス・職場
  | "travel" // 旅行・交通
  | "shopping" // 買い物・店舗
  | "finance" // 金融・経済
  | "technology" // 技術・IT
  | "daily" // 日常生活
  | "communication" // コミュニケーション
  // 中学・高校向け追加
  | "school" // 学校
  | "family" // 家族・家庭
  | "hobby" // 趣味・娯楽
  | "nature" // 自然・環境
  | "health" // 健康・医療
  | "food" // 食事・料理
  | "sports" // スポーツ
  | "culture" // 文化・芸術
  // 英会話向け追加
  | "greeting" // 挨拶
  | "emotion" // 感情表現
  | "opinion" // 意見表明
  | "request" // 依頼・お願い
  | "smalltalk"; // 雑談

// 頻度ランク
// A: 超高頻出（必須）, B: 高頻出, C: 中頻出, D: 低頻出
export type FrequencyRank = "A" | "B" | "C" | "D";

// 拡張難易度（1-7）
export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// 単語データ
export type Word = {
  id: number;
  word: string;
  meaning: string;
  example?: string;
  exampleJa?: string;

  // コース・レベル情報（複数コースに所属可能）
  courses: CourseLevel[];

  // 難易度（1-7に拡張）
  difficulty: Difficulty;

  // カテゴリ（複数指定可能）
  categories: ExtendedCategory[];

  // 頻度ランク
  frequencyRank: FrequencyRank;

  // 品詞
  partOfSpeech: PartOfSpeech;

  // 発音（既存と同様）
  pronunciation?: string | PronunciationData;

  // オプション拡張フィールド（既存と同様）
  examples?: WordExample[];
  synonyms?: string[];
  antonyms?: string[];
  column?: WordColumn;
  imageUrl?: string;
  imageKeyword?: string;
};

// コース定義の型
export type CourseLevelDefinition = {
  level: string;
  displayName: string;
  targetVocab: number;
  difficulty: Difficulty;
};

export type CourseDefinition = {
  name: string;
  levels: CourseLevelDefinition[];
};

export type CourseDefinitions = {
  [K in CourseType]: CourseDefinition;
};
