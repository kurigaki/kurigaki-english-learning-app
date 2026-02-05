import { juniorWords, juniorWordCounts } from "./junior";
import { seniorWords, seniorWordCounts } from "./senior";
import { eikenWords, eikenWordCounts } from "./eiken";
import { toeicWords, toeicWordCounts } from "./toeic";
import { conversationWords, conversationWordCounts } from "./conversation";
import { WordV2, CourseType, ExtendedCategory } from "./types";

// 全コースの単語を統合
export const allWordsV2: WordV2[] = [
  ...juniorWords,
  ...seniorWords,
  ...eikenWords,
  ...toeicWords,
  ...conversationWords,
];

// 重複を除去した全単語（同じIDの単語は1つだけ含める）
export const uniqueWordsV2: WordV2[] = Array.from(
  new Map(allWordsV2.map((word) => [word.id, word])).values()
);

// 全単語数
export const totalWordCounts = {
  junior: juniorWordCounts,
  senior: seniorWordCounts,
  eiken: eikenWordCounts,
  toeic: toeicWordCounts,
  conversation: conversationWordCounts,
  all: allWordsV2.length,
  unique: uniqueWordsV2.length,
};

// コース別フィルタ関数
export function getWordsByCourse(
  courseType: CourseType,
  level?: string
): WordV2[] {
  return uniqueWordsV2.filter((w) =>
    w.courses.some(
      (c) => c.courseType === courseType && (!level || c.level === level)
    )
  );
}

// 難易度でフィルタ
export function getWordsByDifficulty(
  minDifficulty: number,
  maxDifficulty: number
): WordV2[] {
  return uniqueWordsV2.filter(
    (w) => w.difficulty >= minDifficulty && w.difficulty <= maxDifficulty
  );
}

// カテゴリでフィルタ
export function getWordsByCategory(category: ExtendedCategory): WordV2[] {
  return uniqueWordsV2.filter((w) => w.categories.includes(category));
}

// 頻度ランクでフィルタ
export function getWordsByFrequency(ranks: string[]): WordV2[] {
  return uniqueWordsV2.filter((w) => ranks.includes(w.frequencyRank));
}

// 型とコース定義のエクスポート
export * from "./types";
export * from "./courses";

// 各コースのエクスポート
export * from "./junior";
export * from "./senior";
export * from "./eiken";
export * from "./toeic";
export * from "./conversation";
