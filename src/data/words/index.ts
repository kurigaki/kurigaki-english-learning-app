import { juniorWords, juniorWordCounts } from "./junior";
import { seniorWords, seniorWordCounts } from "./senior";
import { eikenWords, eikenWordCounts } from "./eiken";
import { toeicWords, toeicWordCounts } from "./toeic";
import { conversationWords, conversationWordCounts } from "./conversation";
import { Word, CourseType, ExtendedCategory } from "./types";

// 全コースの単語を統合
export const allWords: Word[] = [
  ...juniorWords,
  ...seniorWords,
  ...eikenWords,
  ...toeicWords,
  ...conversationWords,
];

// 重複を除去した全単語（同じIDの単語は1つだけ含める）
export const uniqueWords: Word[] = Array.from(
  new Map(allWords.map((word) => [word.id, word])).values()
);

// 全単語数
export const totalWordCounts = {
  junior: juniorWordCounts,
  senior: seniorWordCounts,
  eiken: eikenWordCounts,
  toeic: toeicWordCounts,
  conversation: conversationWordCounts,
  all: allWords.length,
  unique: uniqueWords.length,
};

// コース別フィルタ関数
export function getWordsByCourse(
  courseType: CourseType,
  level?: string
): Word[] {
  return uniqueWords.filter((w) =>
    w.courses.some(
      (c) => c.courseType === courseType && (!level || c.level === level)
    )
  );
}

// 難易度でフィルタ
export function getWordsByDifficulty(
  minDifficulty: number,
  maxDifficulty: number
): Word[] {
  return uniqueWords.filter(
    (w) => w.difficulty >= minDifficulty && w.difficulty <= maxDifficulty
  );
}

// カテゴリでフィルタ
export function getWordsByCategory(category: ExtendedCategory): Word[] {
  return uniqueWords.filter((w) => w.categories.includes(category));
}

// 頻度ランクでフィルタ
export function getWordsByFrequency(ranks: string[]): Word[] {
  return uniqueWords.filter((w) => ranks.includes(w.frequencyRank));
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
