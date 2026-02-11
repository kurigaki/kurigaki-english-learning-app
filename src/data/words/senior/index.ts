import { senior1Words } from "./senior1";
import { senior1B2Words } from "./senior1-b2";
import { senior1B3Words } from "./senior1-b3";
import { senior1B4Words } from "./senior1-b4";
import { senior1B5Words } from "./senior1-b5";
import { senior1B6Words } from "./senior1-b6";
import { senior2Words } from "./senior2";
import { senior3Words } from "./senior3";
import { WordV2 } from "../types";

// 高校1年 全単語（オリジナル + 追加バッチ）
const allSenior1Words: WordV2[] = [
  ...senior1Words,
  ...senior1B2Words,
  ...senior1B3Words,
  ...senior1B4Words,
  ...senior1B5Words,
  ...senior1B6Words,
];

// 高校2年 全単語
const allSenior2Words: WordV2[] = [
  ...senior2Words,
];

// 高校3年 全単語
const allSenior3Words: WordV2[] = [
  ...senior3Words,
];

// 高校英語コース全単語
export const seniorWords: WordV2[] = [
  ...allSenior1Words,
  ...allSenior2Words,
  ...allSenior3Words,
];

// 学年別エクスポート
export { senior1Words, senior2Words, senior3Words };
export { senior1B2Words, senior1B3Words, senior1B4Words, senior1B5Words, senior1B6Words };

// 学年別単語数
export const seniorWordCounts = {
  senior1: allSenior1Words.length,
  senior2: allSenior2Words.length,
  senior3: allSenior3Words.length,
  total: seniorWords.length,
};
