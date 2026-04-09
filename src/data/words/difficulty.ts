/**
 * 難易度定義・ラベル・マッピング
 *
 * CEFR 6段階に完全対応:
 * 1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2
 */

// Difficulty supports 1-6 (CEFR A1-C2)
export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6;

// Difficulty labels (6 levels, CEFR aligned)
export const difficultyLabels: Record<Difficulty, string> = {
  1: "A1 基礎",
  2: "A2 初級",
  3: "B1 中級",
  4: "B2 上級",
  5: "C1 上級者",
  6: "C2 達人",
};

// course+stage → difficulty マッピング
export const DIFFICULTY_MAP: Record<string, Difficulty> = {
  "junior:1": 1, "junior:2": 2, "junior:3": 3,
  "senior:1": 3, "senior:2": 4, "senior:3": 4,
  "eiken:5": 1, "eiken:4": 2, "eiken:3": 3, "eiken:pre2": 3, "eiken:2": 4, "eiken:pre1": 5, "eiken:1": 5,
  "toeic:500": 2, "toeic:600": 3, "toeic:700": 4, "toeic:800": 5, "toeic:900": 5,
  "conversation:a1": 1, "conversation:a2": 2, "conversation:b1": 3, "conversation:b2": 4, "conversation:c1": 5, "conversation:c2": 6,
};
