import { toeic500Words } from "./toeic500";
import { toeic600Words } from "./toeic600";
import { toeic700Words } from "./toeic700";
import { toeic800Words } from "./toeic800";
import { toeic900Words } from "./toeic900";
import { Word } from "../types";

// TOEICコース全単語
export const toeicWords: Word[] = [
  ...toeic500Words,
  ...toeic600Words,
  ...toeic700Words,
  ...toeic800Words,
  ...toeic900Words,
];

// レベル別エクスポート
export {
  toeic500Words,
  toeic600Words,
  toeic700Words,
  toeic800Words,
  toeic900Words,
};

// レベル別単語数
export const toeicWordCounts = {
  toeic500: toeic500Words.length,
  toeic600: toeic600Words.length,
  toeic700: toeic700Words.length,
  toeic800: toeic800Words.length,
  toeic900: toeic900Words.length,
  total: toeicWords.length,
};
