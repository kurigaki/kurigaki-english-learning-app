import { juniorWords } from "./junior";
import { seniorWords } from "./senior";
import { toeicWords } from "./toeic";
import { eikenWords } from "./eiken";
import { conversationWords } from "./conversation";
import type { Course, Stage } from "./types";

export { juniorWords, seniorWords, toeicWords, eikenWords, conversationWords };

// 全コースの単語を統合
export const allWords = [
  ...juniorWords,
  ...seniorWords,
  ...toeicWords,
  ...eikenWords,
  ...conversationWords,
];

// 後方互換エイリアス
export const words = allWords;

// コース別フィルタ
export function getWordsByCourse(course: Course, stage?: Stage) {
  return allWords.filter(
    (w) => w.course === course && (!stage || w.stage === stage),
  );
}

// 型のエクスポート
export * from "./types";

// カテゴリ・難易度の型とラベルを再エクスポート
export { type Category, categoryLabels } from "./category";
export { type Difficulty, difficultyLabels } from "./difficulty";

// コース定義
export * from "./courses";
