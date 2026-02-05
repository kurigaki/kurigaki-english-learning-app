import { junior1Words } from "./junior1";
import { junior1B2Words } from "./junior1-b2";
import { junior1B3Words } from "./junior1-b3";
import { junior1B4Words } from "./junior1-b4";
import { junior1B5Words } from "./junior1-b5";
import { junior1B6Words } from "./junior1-b6";
import { junior2Words } from "./junior2";
import { junior3Words } from "./junior3";
import { WordV2 } from "../types";

// 中学1年 全単語（オリジナル + 追加バッチ）
const allJunior1Words: WordV2[] = [
  ...junior1Words,
  ...junior1B2Words,
  ...junior1B3Words,
  ...junior1B4Words,
  ...junior1B5Words,
  ...junior1B6Words,
];

// 中学英語コース全単語
export const juniorWords: WordV2[] = [
  ...allJunior1Words,
  ...junior2Words,
  ...junior3Words,
];

// 学年別エクスポート
export { junior1Words, junior2Words, junior3Words };
export { junior1B2Words, junior1B3Words, junior1B4Words, junior1B5Words, junior1B6Words };

// 学年別単語数
export const juniorWordCounts = {
  junior1: allJunior1Words.length,
  junior2: junior2Words.length,
  junior3: junior3Words.length,
  total: juniorWords.length,
};
