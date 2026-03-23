/**
 * モチタン スクレイピング設定
 */

// モチタンURL → アプリのコース・ステージのマッピング
export const PAGE_MAP = [
  // junior
  { url: "https://motitown.com/vocabulary/junior/first-year/", course: "junior", stage: "1" },
  { url: "https://motitown.com/vocabulary/junior/second-year/", course: "junior", stage: "2" },
  { url: "https://motitown.com/vocabulary/junior/third-year/", course: "junior", stage: "3" },
  // senior
  { url: "https://motitown.com/vocabulary/high/first-year/", course: "senior", stage: "1" },
  { url: "https://motitown.com/vocabulary/high/second-year/", course: "senior", stage: "2" },
  { url: "https://motitown.com/vocabulary/high/third-year/", course: "senior", stage: "3" },
  // toeic (500 is already complete, skip)
  { url: "https://motitown.com/vocabulary/toeic/toeic600/", course: "toeic", stage: "600" },
  { url: "https://motitown.com/vocabulary/toeic/toeic700/", course: "toeic", stage: "700" },
  { url: "https://motitown.com/vocabulary/toeic/toeic800/", course: "toeic", stage: "800" },
  { url: "https://motitown.com/vocabulary/toeic/toeic900/", course: "toeic", stage: "900" },
  // eiken
  { url: "https://motitown.com/vocabulary/eiken/grade-5/", course: "eiken", stage: "5" },
  { url: "https://motitown.com/vocabulary/eiken/grade-4/", course: "eiken", stage: "4" },
  { url: "https://motitown.com/vocabulary/eiken/grade-3/", course: "eiken", stage: "3" },
  { url: "https://motitown.com/vocabulary/eiken/grade-p2/", course: "eiken", stage: "pre2" },
  { url: "https://motitown.com/vocabulary/eiken/grade-2/", course: "eiken", stage: "2" },
  { url: "https://motitown.com/vocabulary/eiken/grade-p1/", course: "eiken", stage: "pre1" },
  { url: "https://motitown.com/vocabulary/eiken/grade-1/", course: "eiken", stage: "1" },
  // conversation
  { url: "https://motitown.com/vocabulary/others/daily-conversation/", course: "conversation", stage: "1" },
];

// コース別ID範囲
export const ID_RANGES = {
  junior: { start: 10001, end: 19999 },
  senior: { start: 20001, end: 29999 },
  toeic: { start: 30001, end: 39999 },
  eiken: { start: 40001, end: 49999 },
  conversation: { start: 70001, end: 79999 },
};

// コース別TSファイルパス
export const COURSE_FILES = {
  junior: "src/data/words/junior.ts",
  senior: "src/data/words/senior.ts",
  toeic: "src/data/words/toeic.ts",
  eiken: "src/data/words/eiken.ts",
  conversation: "src/data/words/conversation.ts",
};

// スクレイプ結果の保存先
export const DATA_DIR = "scripts/motitown/data";
