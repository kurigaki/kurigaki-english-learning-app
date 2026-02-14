import { eiken5Words } from "./eiken5";
import { eiken4Words } from "./eiken4";
import { eiken3Words } from "./eiken3";
import { eikenPre2Words } from "./eikenPre2";
import { eiken2Words } from "./eiken2";
import { eikenPre1Words } from "./eikenPre1";
import { eiken1Words } from "./eiken1";
import { Word } from "../types";

// 英検コース全単語
export const eikenWords: Word[] = [
  ...eiken5Words,
  ...eiken4Words,
  ...eiken3Words,
  ...eikenPre2Words,
  ...eiken2Words,
  ...eikenPre1Words,
  ...eiken1Words,
];

// 級別エクスポート
export {
  eiken5Words,
  eiken4Words,
  eiken3Words,
  eikenPre2Words,
  eiken2Words,
  eikenPre1Words,
  eiken1Words,
};

// 級別単語数
export const eikenWordCounts = {
  eiken5: eiken5Words.length,
  eiken4: eiken4Words.length,
  eiken3: eiken3Words.length,
  eikenPre2: eikenPre2Words.length,
  eiken2: eiken2Words.length,
  eikenPre1: eikenPre1Words.length,
  eiken1: eiken1Words.length,
  total: eikenWords.length,
};
