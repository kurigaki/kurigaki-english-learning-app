import { junior1Words } from "./junior1";
import { junior1B2Words } from "./junior1-b2";
import { junior1B3Words } from "./junior1-b3";
import { junior1B4Words } from "./junior1-b4";
import { junior1B5Words } from "./junior1-b5";
import { junior1B6Words } from "./junior1-b6";
import { junior2Words } from "./junior2";
import { junior2B2Words } from "./junior2-b2";
import { junior2B3Words } from "./junior2-b3";
import { junior2B4Words } from "./junior2-b4";
import { junior2B5Words } from "./junior2-b5";
import { junior2B6Words } from "./junior2-b6";
import { junior3Words } from "./junior3";
import { junior3B2Words } from "./junior3-b2";
import { junior3B3Words } from "./junior3-b3";
import { junior3B4Words } from "./junior3-b4";
import { junior3B5Words } from "./junior3-b5";
import { junior3B6Words } from "./junior3-b6";
import { Word } from "../types";

// 中学1年 全単語（オリジナル + 追加バッチ）
const allJunior1Words: Word[] = [
  ...junior1Words,
  ...junior1B2Words,
  ...junior1B3Words,
  ...junior1B4Words,
  ...junior1B5Words,
  ...junior1B6Words,
];

// 中学2年 全単語（オリジナル + 追加バッチ）
const allJunior2Words: Word[] = [
  ...junior2Words,
  ...junior2B2Words,
  ...junior2B3Words,
  ...junior2B4Words,
  ...junior2B5Words,
  ...junior2B6Words,
];

// 中学3年 全単語（オリジナル + 追加バッチ）
const allJunior3Words: Word[] = [
  ...junior3Words,
  ...junior3B2Words,
  ...junior3B3Words,
  ...junior3B4Words,
  ...junior3B5Words,
  ...junior3B6Words,
];

// 中学英語コース全単語
export const juniorWords: Word[] = [
  ...allJunior1Words,
  ...allJunior2Words,
  ...allJunior3Words,
];

// 学年別エクスポート
export { junior1Words, junior2Words, junior3Words };
export { junior1B2Words, junior1B3Words, junior1B4Words, junior1B5Words, junior1B6Words };
export { junior2B2Words, junior2B3Words, junior2B4Words, junior2B5Words, junior2B6Words };
export { junior3B2Words, junior3B3Words, junior3B4Words, junior3B5Words, junior3B6Words };

// 学年別単語数
export const juniorWordCounts = {
  junior1: allJunior1Words.length,
  junior2: allJunior2Words.length,
  junior3: allJunior3Words.length,
  total: juniorWords.length,
};
