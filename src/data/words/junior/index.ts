import { junior1Words } from "./junior1";
import { junior2Words } from "./junior2";
import { junior3Words } from "./junior3";
import { Word } from "../types";

// 中学英語コース全単語
export const juniorWords: Word[] = [
  ...junior1Words,
  ...junior2Words,
  ...junior3Words,
];

// 学年別エクスポート
export { junior1Words, junior2Words, junior3Words };

// 学年別単語数
export const juniorWordCounts = {
  junior1: junior1Words.length,
  junior2: junior2Words.length,
  junior3: junior3Words.length,
  total: juniorWords.length,
};
