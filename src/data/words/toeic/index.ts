import { toeic500Words } from "./toeic500";
import { toeic500B2Words } from "./toeic500-b2";
import { toeic500B3Words } from "./toeic500-b3";
import { toeic600Words } from "./toeic600";
import { toeic600B2Words } from "./toeic600-b2";
import { toeic600B3Words } from "./toeic600-b3";
import { toeic700Words } from "./toeic700";
import { toeic700B2Words } from "./toeic700-b2";
import { toeic700B3Words } from "./toeic700-b3";
import { toeic800Words } from "./toeic800";
import { toeic800B2Words } from "./toeic800-b2";
import { toeic800B3Words } from "./toeic800-b3";
import { toeic900Words } from "./toeic900";
import { toeic900B2Words } from "./toeic900-b2";
import { toeic900B3Words } from "./toeic900-b3";
import { Word } from "../types";

// TOEICコース全単語
export const toeicWords: Word[] = [
  ...toeic500Words,
  ...toeic500B2Words,
  ...toeic500B3Words,
  ...toeic600Words,
  ...toeic600B2Words,
  ...toeic600B3Words,
  ...toeic700Words,
  ...toeic700B2Words,
  ...toeic700B3Words,
  ...toeic800Words,
  ...toeic800B2Words,
  ...toeic800B3Words,
  ...toeic900Words,
  ...toeic900B2Words,
  ...toeic900B3Words,
];

// レベル別エクスポート
export {
  toeic500Words,
  toeic500B2Words,
  toeic500B3Words,
  toeic600Words,
  toeic600B2Words,
  toeic600B3Words,
  toeic700Words,
  toeic700B2Words,
  toeic700B3Words,
  toeic800Words,
  toeic800B2Words,
  toeic800B3Words,
  toeic900Words,
  toeic900B2Words,
  toeic900B3Words,
};

// レベル別単語数
export const toeicWordCounts = {
  toeic500: toeic500Words.length + toeic500B2Words.length + toeic500B3Words.length,
  toeic600: toeic600Words.length + toeic600B2Words.length + toeic600B3Words.length,
  toeic700: toeic700Words.length + toeic700B2Words.length + toeic700B3Words.length,
  toeic800: toeic800Words.length + toeic800B2Words.length + toeic800B3Words.length,
  toeic900: toeic900Words.length + toeic900B2Words.length + toeic900B3Words.length,
  total: toeicWords.length,
};
