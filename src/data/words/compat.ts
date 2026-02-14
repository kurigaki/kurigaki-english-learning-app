/**
 * Compatibility adapter: V2 word data → legacy Word interface
 *
 * Provides the same export names as the old src/data/words.ts so that
 * UI pages can switch imports with zero logic changes.
 */
import { uniqueWords, Word as WordV2 } from "./index";
import type { ExtendedCategory } from "./types";
import type { PartOfSpeech, PronunciationData, WordExample, WordColumn } from "@/types";

// Re-export Category as the union of all ExtendedCategory values
export type Category = ExtendedCategory;

// Difficulty now supports 1-7
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
};

// Convert V2 word to legacy-compatible format
function toLegacyWord(w: WordV2): Word {
  return {
    id: w.id,
    word: w.word,
    meaning: w.meaning,
    example: w.example,
    exampleJa: w.exampleJa,
    difficulty: w.difficulty as Difficulty,
    category: w.categories[0] ?? "daily",
    pronunciation: w.pronunciation,
    partOfSpeech: w.partOfSpeech,
    examples: w.examples,
    synonyms: w.synonyms,
    antonyms: w.antonyms,
    column: w.column,
    imageUrl: w.imageUrl,
    imageKeyword: w.imageKeyword,
  };
}

// All words in legacy-compatible format
export const words: Word[] = uniqueWords.map(toLegacyWord);

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
export type { CourseType } from "./types";
