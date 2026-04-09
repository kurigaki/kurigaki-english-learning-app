import { masterWords } from "./master";
import { getWordsForCourse } from "./enrich";
import type { Course, Stage } from "./types";

// マスターリスト（13,311語、重複なし）
export { masterWords };

// コース別ビュー（Word型 = MasterWord & コース固有情報）
export const juniorWords = getWordsForCourse(masterWords, "junior");
export const seniorWords = getWordsForCourse(masterWords, "senior");
export const toeicWords = getWordsForCourse(masterWords, "toeic");
export const eikenWords = getWordsForCourse(masterWords, "eiken");
export const conversationWords = getWordsForCourse(masterWords, "conversation");

// 後方互換（コース別ビューの合計、重複を含む）
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
