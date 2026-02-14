import { senior1Words } from "./senior1";
import { senior2Words } from "./senior2";
import { senior3Words } from "./senior3";
import { Word } from "../types";

// 高校英語コース全単語
export const seniorWords: Word[] = [
  ...senior1Words,
  ...senior2Words,
  ...senior3Words,
];

// 学年別エクスポート
export { senior1Words, senior2Words, senior3Words };

// 学年別単語数
export const seniorWordCounts = {
  senior1: senior1Words.length,
  senior2: senior2Words.length,
  senior3: senior3Words.length,
  total: seniorWords.length,
};
