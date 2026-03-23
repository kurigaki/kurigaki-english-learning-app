import { juniorWords as _juniorWords } from "./junior";
import { seniorWords as _seniorWords } from "./senior";
import { toeicWords as _toeicWords } from "./toeic";
import { eikenWords as _eikenWords } from "./eiken";
import { conversationWords as _conversationWords } from "./conversation";
import { Word, Course, Stage } from "./types";

// 型アサーション（データファイルは型注釈なしで定義、ここで型を付与）
// categories フィールドの組み合わせ数が多いため、直接キャストすると TS2590 になる
export const juniorWords = _juniorWords as unknown as Word[];
export const seniorWords = _seniorWords as unknown as Word[];
export const toeicWords = _toeicWords as unknown as Word[];
export const eikenWords = _eikenWords as unknown as Word[];
export const conversationWords = _conversationWords as unknown as Word[];

// 全コースの単語を統合
export const allWords: Word[] = [
  ...juniorWords,
  ...seniorWords,
  ...toeicWords,
  ...eikenWords,
  ...conversationWords,
];

// compat.ts が提供していた `words` エイリアス（後方互換）
export const words = allWords;

// コース別フィルタ
export function getWordsByCourse(course: Course, stage?: Stage): Word[] {
  return allWords.filter(
    (w) => w.course === course && (!stage || w.stage === stage)
  );
}

// 型のエクスポート
export * from "./types";

// カテゴリ・難易度の型とラベルを再エクスポート
export { type Category, categoryLabels } from "./category";
export { type Difficulty, difficultyLabels } from "./difficulty";

// コース定義
export * from "./courses";
