import type { Difficulty } from "./difficulty";

// コース種別（7コース、将来拡張用に general/business 予約）
export type Course =
  | "junior"
  | "senior"
  | "toeic"
  | "eiken"
  | "general"
  | "business"
  | "conversation";

// ステージ（コース内の段階）
export type Stage =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "pre2"
  | "pre1"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

// 品詞（5種に簡素化）
export type PartOfSpeech = "noun" | "verb" | "adjective" | "adverb" | "other";

// 単語の例文（3件ランダム出題用）
export type WordExampleEntry = {
  en: string;
  ja: string;
  context: string;
};

// 統一Word型
// category/categories は string で定義（Category union の組み合わせ爆発を回避）
// UI表示には categoryLabels を使用し、正しさはテストで保証する
export type Word = {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: PartOfSpeech;
  course: Course;
  stage: Stage;
  example?: string;
  exampleJa?: string;
  examples?: WordExampleEntry[]; // 例文3件（クイズ・ダンジョンでランダム出題）
  difficulty: Difficulty;
  category: string;
  categories?: string[];
  frequencyRank?: number;
  source?: string;
};
