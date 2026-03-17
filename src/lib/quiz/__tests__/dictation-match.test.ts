import { describe, it, expect } from "vitest";
import { normalizeDictationWord, isDictationWordCorrect } from "../dictation-match";

describe("normalizeDictationWord", () => {
  it("小文字化・trim する", () => {
    expect(normalizeDictationWord("  Apple  ", "normal")).toBe("apple");
  });

  it("末尾のピリオドを除去する", () => {
    expect(normalizeDictationWord("apple.", "normal")).toBe("apple");
  });

  it("先頭と末尾の句読点を除去する", () => {
    expect(normalizeDictationWord("!hello,", "normal")).toBe("hello");
  });

  it("normal: アポストロフィは除去しない", () => {
    expect(normalizeDictationWord("it's", "normal")).toBe("it's");
  });

  it("easy: アポストロフィを除去する", () => {
    expect(normalizeDictationWord("it's", "easy")).toBe("its");
  });
});

describe("isDictationWordCorrect - strict", () => {
  it("完全一致（正規化後）は正解", () => {
    expect(isDictationWordCorrect("Apple", "apple", "strict")).toBe(true);
  });

  it("1文字ミスは不正解", () => {
    expect(isDictationWordCorrect("applle", "apple", "strict")).toBe(false);
  });

  it("末尾ピリオドありでも正解", () => {
    expect(isDictationWordCorrect("apple.", "apple", "strict")).toBe(true);
  });
});

describe("isDictationWordCorrect - normal", () => {
  it("完全一致は正解", () => {
    expect(isDictationWordCorrect("tennis", "tennis", "normal")).toBe(true);
  });

  it("5文字以上で1文字ミスは正解", () => {
    expect(isDictationWordCorrect("tennnis", "tennis", "normal")).toBe(true); // 距離1
  });

  it("5文字以上で2文字ミスは不正解", () => {
    expect(isDictationWordCorrect("tennniss", "tennis", "normal")).toBe(false); // 距離2
  });

  it("4文字以下の単語でのミスは不正解", () => {
    expect(isDictationWordCorrect("runn", "run", "normal")).toBe(false); // 距離1だが短すぎ
  });
});

describe("isDictationWordCorrect - easy", () => {
  it("4文字以上で1文字ミスは正解", () => {
    expect(isDictationWordCorrect("plaay", "play", "easy")).toBe(true); // 距離1, len=4
  });

  it("8文字以上で2文字ミスは正解", () => {
    expect(isDictationWordCorrect("beautifll", "beautiful", "easy")).toBe(true); // 距離2, len=9
  });

  it("アポストロフィの有無を無視する", () => {
    expect(isDictationWordCorrect("its", "it's", "easy")).toBe(true);
  });

  it("3文字以下の単語はミス不可", () => {
    expect(isDictationWordCorrect("teh", "the", "easy")).toBe(false); // 距離1だが3文字
  });
});
