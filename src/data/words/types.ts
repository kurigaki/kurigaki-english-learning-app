import type { Category } from "./category";
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

// 統一Word型
export type Word = {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: PartOfSpeech;
  course: Course;
  stage: Stage;
  example?: string;
  exampleJa?: string;
  difficulty: Difficulty;
  category: Category;
  categories?: Category[];
  frequencyRank?: number;
  source?: string;
};
