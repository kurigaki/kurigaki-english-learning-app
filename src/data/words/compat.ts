/**
 * Compatibility adapter: new Word data → legacy Word interface
 *
 * Provides the same export names as the old src/data/words.ts so that
 * UI pages can switch imports with zero logic changes.
 */
import { allWords, Word as InternalWord, Course } from "./index";
import type { PartOfSpeech, PronunciationData, WordExample, WordColumn } from "@/types";
import { wordExtensions } from "../word-extensions";
import { exampleJaOverrides } from "../example-ja-overrides";

// Re-export Course as CourseType for backward compatibility
export type CourseType = Course;

// Category union (simplified: one default per course)
export type Category =
  | "business"
  | "office"
  | "travel"
  | "shopping"
  | "finance"
  | "technology"
  | "daily"
  | "communication"
  | "school"
  | "family"
  | "hobby"
  | "nature"
  | "health"
  | "food"
  | "sports"
  | "culture"
  | "greeting"
  | "emotion"
  | "opinion"
  | "request"
  | "smalltalk";

// Difficulty supports 1-7
export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Legacy-compatible Word type (singular `category` field)
export type Word = {
  id: number;
  word: string;
  meaning: string;
  example?: string;
  exampleJa?: string;
  difficulty: Difficulty;
  category: Category;
  pronunciation?: string | PronunciationData;
  partOfSpeech?: PartOfSpeech;
  examples?: WordExample[];
  synonyms?: string[];
  antonyms?: string[];
  column?: WordColumn;
  imageUrl?: string;
  imageKeyword?: string;
  coreImage?: string;
  usage?: string;
  synonymDifference?: string;
  englishDefinition?: string;
  etymology?: string;
};

// course+stage → difficulty マッピング
const DIFFICULTY_MAP: Record<string, number> = {
  "junior:1": 1, "junior:2": 2, "junior:3": 3,
  "senior:1": 4, "senior:2": 4, "senior:3": 5,
  "eiken:5": 1, "eiken:4": 2, "eiken:3": 3, "eiken:pre2": 4, "eiken:2": 5, "eiken:pre1": 6, "eiken:1": 7,
  "toeic:500": 3, "toeic:600": 4, "toeic:700": 5, "toeic:800": 6, "toeic:900": 7,
  "conversation:1": 1, "conversation:2": 2, "conversation:3": 4, "conversation:4": 5, "conversation:5": 7,
};

// course → default category マッピング
const CATEGORY_MAP: Record<Course, Category> = {
  junior: "school",
  senior: "school",
  toeic: "business",
  eiken: "daily",
  general: "daily",
  business: "business",
  conversation: "communication",
};

// Convert new word to legacy-compatible format
function toLegacyWord(w: InternalWord): Word {
  const ext = wordExtensions.get(w.id);
  return {
    id: w.id,
    word: w.word,
    meaning: w.meaning,
    example: w.example,
    exampleJa: exampleJaOverrides.get(w.id),
    difficulty: (DIFFICULTY_MAP[`${w.course}:${w.stage}`] ?? 3) as Difficulty,
    category: CATEGORY_MAP[w.course] ?? "daily",
    partOfSpeech: w.partOfSpeech as PartOfSpeech,
    coreImage: ext?.coreImage,
    usage: ext?.usage,
    synonymDifference: ext?.synonymDifference,
    englishDefinition: ext?.englishDefinition,
    etymology: ext?.etymology,
  };
}

// All words in legacy-compatible format
export const words: Word[] = allWords.map(toLegacyWord);

// Category labels (21 categories)
export const categoryLabels: Record<Category, string> = {
  business: "ビジネス一般",
  office: "オフィス・職場",
  travel: "旅行・交通",
  shopping: "買い物・店舗",
  finance: "金融・経済",
  technology: "技術・IT",
  daily: "日常生活",
  communication: "コミュニケーション",
  school: "学校",
  family: "家族・家庭",
  hobby: "趣味・娯楽",
  nature: "自然・環境",
  health: "健康・医療",
  food: "食事・料理",
  sports: "スポーツ",
  culture: "文化・芸術",
  greeting: "挨拶",
  emotion: "感情表現",
  opinion: "意見表明",
  request: "依頼・お願い",
  smalltalk: "雑談",
};

// Difficulty labels (7 levels)
export const difficultyLabels: Record<Difficulty, string> = {
  1: "中学1年",
  2: "中学2年",
  3: "中学3年",
  4: "高校基礎",
  5: "高校応用",
  6: "難関・準1級",
  7: "最難関・1級",
};

// Re-export V2 utilities for pages that need course filtering
export { getWordsByCourse } from "./index";
