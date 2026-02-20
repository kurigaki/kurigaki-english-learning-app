import { describe, it, expect } from "vitest";
import { pickDailyWords } from "../daily-words";
import type { Word } from "@/data/words/compat";

// テスト用単語データ（10語）
const makeWord = (id: number): Word =>
  ({
    id,
    word: `word${id}`,
    meaning: `意味${id}`,
    category: "daily",
    difficulty: 1,
  } as Word);

const testWords: Word[] = Array.from({ length: 10 }, (_, i) => makeWord(i + 1));

describe("pickDailyWords", () => {
  it("指定した件数の単語を返す", () => {
    const result = pickDailyWords(testWords, "2026-02-20", 3);
    expect(result).toHaveLength(3);
  });

  it("同じ日付は常に同じ単語セットを返す（再現性）", () => {
    const first  = pickDailyWords(testWords, "2026-02-20", 3);
    const second = pickDailyWords(testWords, "2026-02-20", 3);
    expect(first.map((w) => w.id)).toEqual(second.map((w) => w.id));
  });

  it("異なる日付は異なる単語セットを返す", () => {
    const day1 = pickDailyWords(testWords, "2026-02-20", 3).map((w) => w.id);
    const day2 = pickDailyWords(testWords, "2026-02-21", 3).map((w) => w.id);
    const day3 = pickDailyWords(testWords, "2026-06-15", 3).map((w) => w.id);
    // 連続日・離れた日の少なくともいずれかで差分があることを確認
    const allSame = JSON.stringify(day1) === JSON.stringify(day2) &&
                    JSON.stringify(day1) === JSON.stringify(day3);
    expect(allSame).toBe(false);
  });

  it("重複した単語を返さない", () => {
    const result = pickDailyWords(testWords, "2026-02-20", 5);
    const ids = result.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("単語リスト数より多い件数を指定した場合は全単語を返す", () => {
    const small: Word[] = [makeWord(1), makeWord(2)];
    const result = pickDailyWords(small, "2026-02-20", 5);
    expect(result).toHaveLength(2);
  });

  it("空の単語リストには空配列を返す", () => {
    const result = pickDailyWords([], "2026-02-20", 3);
    expect(result).toHaveLength(0);
  });

  it("count=1 のとき1語だけ返す", () => {
    const result = pickDailyWords(testWords, "2026-02-20", 1);
    expect(result).toHaveLength(1);
  });

  it("結果の単語は元のリストに存在する", () => {
    const result = pickDailyWords(testWords, "2026-02-20", 3);
    const validIds = new Set(testWords.map((w) => w.id));
    result.forEach((w) => expect(validIds.has(w.id)).toBe(true));
  });
});
