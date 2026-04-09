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
  | "900"
  | "a1"
  | "a2"
  | "b1"
  | "b2"
  | "c1"
  | "c2";

// 品詞（5種に簡素化）
export type PartOfSpeech = "noun" | "verb" | "adjective" | "adverb" | "other";

// 単語の例文（3件ランダム出題用）
export type WordExampleEntry = {
  en: string;
  ja: string;
  context: string;
};

// 頻出度ティア（1=頻出, 2=標準, 3=発展）
export type FrequencyTier = 1 | 2 | 3;

// コース所属情報
export type CourseAssignment = {
  course: Course;
  stage: Stage;
  meaning?: string;  // コース固有のmeaning（省略時はMasterWordのmeaningを使用）
};

// マスター型 — データの源泉。1語1エントリで複数コースに所属する
// master/*.ts に格納
export type MasterWord = {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: PartOfSpeech;
  examples: [WordExampleEntry, WordExampleEntry, WordExampleEntry];
  categories: [string, ...string[]];
  frequencyTier: FrequencyTier;
  courses: CourseAssignment[];
};

// ランタイム型 — MasterWord の全フィールド + コース固有の導出フィールド
// コース別フィルタ時に getWordsForCourse() で生成される
// 既存コードの word.course / word.stage / word.difficulty はそのまま動く
// 新コードは word.courses で全コース情報にアクセスできる
export type Word = MasterWord & {
  course: Course;
  stage: Stage;
  example: string;      // examples[0].en
  exampleJa: string;    // examples[0].ja
  difficulty: Difficulty;
  category: string;     // categories[0]
};
