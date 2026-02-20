import { describe, it, expect } from "vitest";
import {
  generateReviewChoices,
  formatNextReviewDate,
} from "../review-quiz";
import type { Word } from "@/data/words/compat";

// テスト用単語データ
const makeWord = (id: number, word: string, meaning: string): Word =>
  ({
    id,
    word,
    meaning,
    category: "daily",
    difficulty: 1,
  } as Word);

const allWords: Word[] = [
  makeWord(1, "apple",  "りんご"),
  makeWord(2, "book",   "本"),
  makeWord(3, "cat",    "猫"),
  makeWord(4, "dog",    "犬"),
  makeWord(5, "egg",    "卵"),
  makeWord(6, "fish",   "魚"),
];

describe("generateReviewChoices", () => {
  it("returns exactly 4 choices", () => {
    const choices = generateReviewChoices(allWords[0], allWords);
    expect(choices).toHaveLength(4);
  });

  it("includes the correct answer (word meaning)", () => {
    const correctWord = allWords[0]; // meaning: "りんご"
    const choices = generateReviewChoices(correctWord, allWords);
    expect(choices).toContain(correctWord.meaning);
  });

  it("does not include duplicate meanings", () => {
    const correctWord = allWords[0];
    const choices = generateReviewChoices(correctWord, allWords);
    const unique = new Set(choices);
    expect(unique.size).toBe(4);
  });

  it("does not include the correct word's meaning more than once", () => {
    const correctWord = allWords[0];
    const choices = generateReviewChoices(correctWord, allWords);
    const count = choices.filter((c) => c === correctWord.meaning).length;
    expect(count).toBe(1);
  });

  it("returns all choices as strings", () => {
    const correctWord = allWords[0];
    const choices = generateReviewChoices(correctWord, allWords);
    choices.forEach((c) => expect(typeof c).toBe("string"));
  });

  it("works when allWords has fewer than 4 words", () => {
    const tinyList: Word[] = [
      makeWord(1, "apple", "りんご"),
      makeWord(2, "book",  "本"),
    ];
    const choices = generateReviewChoices(tinyList[0], tinyList);
    expect(choices.length).toBeGreaterThanOrEqual(1);
    expect(choices).toContain("りんご");
  });
});

describe("formatNextReviewDate", () => {
  const todayStr = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  };

  const daysLater = (n: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
  };

  it("returns '今日' when nextReviewDate is today", () => {
    expect(formatNextReviewDate(todayStr())).toBe("今日");
  });

  it("returns '今日' when nextReviewDate is in the past", () => {
    expect(formatNextReviewDate(daysLater(-3))).toBe("今日");
  });

  it("returns '明日' when nextReviewDate is tomorrow", () => {
    expect(formatNextReviewDate(daysLater(1))).toBe("明日");
  });

  it("returns 'n日後' for n > 1", () => {
    expect(formatNextReviewDate(daysLater(6))).toBe("6日後");
    expect(formatNextReviewDate(daysLater(21))).toBe("21日後");
  });

  it("returns '未設定' when null", () => {
    expect(formatNextReviewDate(null)).toBe("未設定");
  });
});
