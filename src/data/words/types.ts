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

// データファイルに格納する型（冗長フィールドを含まない最小形）
// course/stage はファイルの場所から、difficulty は course:stage から導出される
export type RawWord = {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: PartOfSpeech;
  examples: [WordExampleEntry, WordExampleEntry, WordExampleEntry];
  categories: [string, ...string[]]; // 1個以上必須、[0]が主カテゴリ
};

// ランタイム型（enrichWords で RawWord に course/stage/difficulty 等を付与した完全型）
// category/categories は string で定義（Category union の組み合わせ爆発を回避）
// UI表示には categoryLabels を使用し、正しさはテストで保証する
export type Word = {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: PartOfSpeech;
  course: Course;
  stage: Stage;
  example: string;      // examples[0].en
  exampleJa: string;    // examples[0].ja
  examples: [WordExampleEntry, WordExampleEntry, WordExampleEntry];
  difficulty: Difficulty;
  category: string;     // categories[0]
  categories: string[];
};
