import { senior1Words } from "./senior1";
import { senior1B2Words } from "./senior1-b2";
import { senior1B3Words } from "./senior1-b3";
import { senior1B4Words } from "./senior1-b4";
import { senior1B5Words } from "./senior1-b5";
import { senior1B6Words } from "./senior1-b6";
import { senior2Words } from "./senior2";
import { senior2B2Words } from "./senior2-b2";
import { senior2B3Words } from "./senior2-b3";
import { senior2B4Words } from "./senior2-b4";
import { senior2B5Words } from "./senior2-b5";
import { senior2B6Words } from "./senior2-b6";
import { senior3Words } from "./senior3";
import { senior3B2Words } from "./senior3-b2";
import { senior3B3Words } from "./senior3-b3";
import { senior3B4Words } from "./senior3-b4";
import { senior3B5Words } from "./senior3-b5";
import { senior3B6Words } from "./senior3-b6";
import { Word } from "../types";

// 高校1年 全単語（オリジナル + 追加バッチ）
const allSenior1Words: Word[] = [
  ...senior1Words,
  ...senior1B2Words,
  ...senior1B3Words,
  ...senior1B4Words,
  ...senior1B5Words,
  ...senior1B6Words,
];

// 高校2年 全単語（オリジナル + 追加バッチ）
const allSenior2Words: Word[] = [
  ...senior2Words,
  ...senior2B2Words,
  ...senior2B3Words,
  ...senior2B4Words,
  ...senior2B5Words,
  ...senior2B6Words,
];

// 高校3年 全単語（オリジナル + 追加バッチ）
const allSenior3Words: Word[] = [
  ...senior3Words,
  ...senior3B2Words,
  ...senior3B3Words,
  ...senior3B4Words,
  ...senior3B5Words,
  ...senior3B6Words,
];

// 高校英語コース全単語
export const seniorWords: Word[] = [
  ...allSenior1Words,
  ...allSenior2Words,
  ...allSenior3Words,
];

// 学年別エクスポート
export { senior1Words, senior2Words, senior3Words };
export { senior1B2Words, senior1B3Words, senior1B4Words, senior1B5Words, senior1B6Words };
export { senior2B2Words, senior2B3Words, senior2B4Words, senior2B5Words, senior2B6Words };
export { senior3B2Words, senior3B3Words, senior3B4Words, senior3B5Words, senior3B6Words };

// 学年別単語数
export const seniorWordCounts = {
  senior1: allSenior1Words.length,
  senior2: allSenior2Words.length,
  senior3: allSenior3Words.length,
  total: seniorWords.length,
};
