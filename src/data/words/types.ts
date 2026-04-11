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

// コンテンツフラグ（センシティブ単語の分類）
// substance: 飲酒・喫煙・薬物
// violence:  暴力・武器・犯罪
// sexual:    性・生殖関連
// sensitive: その他センシティブ（政治的含意・差別 等）
export type ContentFlag = "substance" | "violence" | "sexual" | "sensitive";

// コース所属情報
export type CourseAssignment = {
  course: Course;
  stage: Stage;
  meaning?: string;  // コース固有のmeaning（省略時はMasterWordのmeaningを使用）
  tier?: FrequencyTier;  // コース固有の頻出度ティア（省略時はMasterWord.frequencyTierにフォールバック）
};

// マスター型 — データの源泉。1語1エントリで複数コースに所属する
// master/*.ts に格納
// @note frequencyTier は MasterWord 共通の暫定値。コース別 tier は CourseAssignment.tier を優先する
//       Phase 2.4 完了後に @deprecated 宣言予定（docs/tier-calibration-policy.md 参照）
export type MasterWord = {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: PartOfSpeech;
  examples: [WordExampleEntry, WordExampleEntry, WordExampleEntry];
  categories: [string, ...string[]];
  frequencyTier: FrequencyTier;
  contentFlags?: ContentFlag[];
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
  courseTier: FrequencyTier;  // コース別 tier（assignment.tier ?? MasterWord.frequencyTier）
};
