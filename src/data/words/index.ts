import { juniorWords as _juniorWords } from "./junior";
import { seniorWords as _seniorWords } from "./senior";
import { toeicWords as _toeicWords } from "./toeic";
import { eikenWords as _eikenWords } from "./eiken";
import { conversationWords as _conversationWords } from "./conversation";
import { Word, Course, Stage } from "./types";

// 型アサーション（データファイルは型注釈なしで定義、ここで型を付与）
export const juniorWords = _juniorWords as Word[];
export const seniorWords = _seniorWords as Word[];
export const toeicWords = _toeicWords as Word[];
export const eikenWords = _eikenWords as Word[];
export const conversationWords = _conversationWords as Word[];

// 全コースの単語を統合
export const allWords: Word[] = [
  ...juniorWords,
  ...seniorWords,
  ...toeicWords,
  ...eikenWords,
  ...conversationWords,
];

// コース別フィルタ
export function getWordsByCourse(course: Course, stage?: Stage): Word[] {
  return allWords.filter(
    (w) => w.course === course && (!stage || w.stage === stage)
  );
}

// 型のエクスポート
export * from "./types";
