/**
 * 難易度定義・ラベル・マッピング
 */

// Difficulty supports 1-7
export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Difficulty labels (7 levels)
export const difficultyLabels: Record<Difficulty, string> = {
  1: "中学1年",
  2: "中学2年",
  3: "中学3年",
  4: "高校基礎",
  5: "高校応用",
  6: "難関・準1級",
  7: "最難関・1級",
};

// course+stage → difficulty マッピング
export const DIFFICULTY_MAP: Record<string, Difficulty> = {
  "junior:1": 1, "junior:2": 2, "junior:3": 3,
  "senior:1": 4, "senior:2": 4, "senior:3": 5,
  "eiken:5": 1, "eiken:4": 2, "eiken:3": 3, "eiken:pre2": 4, "eiken:2": 5, "eiken:pre1": 6, "eiken:1": 7,
  "toeic:500": 3, "toeic:600": 4, "toeic:700": 5, "toeic:800": 6, "toeic:900": 7,
  "conversation:1": 1, "conversation:2": 2, "conversation:3": 4, "conversation:4": 5, "conversation:5": 7,
};
