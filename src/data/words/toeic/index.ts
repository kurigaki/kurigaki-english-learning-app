import { toeic500Words } from "./toeic500";
import { toeic500B2Words } from "./toeic500-b2";
import { toeic600Words } from "./toeic600";
import { toeic600B2Words } from "./toeic600-b2";
import { toeic700Words } from "./toeic700";
import { toeic700B2Words } from "./toeic700-b2";
import { toeic800Words } from "./toeic800";
import { toeic800B2Words } from "./toeic800-b2";
import { toeic900Words } from "./toeic900";
import { toeic900B2Words } from "./toeic900-b2";
import { WordV2 } from "../types";

// TOEICコース全単語
export const toeicWords: WordV2[] = [
  ...toeic500Words,
  ...toeic500B2Words,
  ...toeic600Words,
  ...toeic600B2Words,
  ...toeic700Words,
  ...toeic700B2Words,
  ...toeic800Words,
  ...toeic800B2Words,
  ...toeic900Words,
  ...toeic900B2Words,
];

// レベル別エクスポート
export {
  toeic500Words,
  toeic500B2Words,
  toeic600Words,
  toeic600B2Words,
  toeic700Words,
  toeic700B2Words,
  toeic800Words,
  toeic800B2Words,
  toeic900Words,
  toeic900B2Words,
};

// レベル別単語数
export const toeicWordCounts = {
  toeic500: toeic500Words.length + toeic500B2Words.length,
  toeic600: toeic600Words.length + toeic600B2Words.length,
  toeic700: toeic700Words.length + toeic700B2Words.length,
  toeic800: toeic800Words.length + toeic800B2Words.length,
  toeic900: toeic900Words.length + toeic900B2Words.length,
  total: toeicWords.length,
};
