import { describe, it, expect } from "vitest";
import type { WordExtension } from "@/types";
import { wordExtensions, getWordExtension } from "@/data/word-extensions";
import { words, type Word, categoryLabels } from "@/data/words";

describe("wordExtensions", () => {
  describe("マップ構造", () => {
    it("拡張データが存在する", () => {
      expect(wordExtensions.size).toBeGreaterThan(0);
    });

    it("全エントリのフィールドが期待する型または undefined である", () => {
      const stringOrUndefined = (v: unknown) =>
        v === undefined || typeof v === "string";
      // etymology は string | string[] | undefined を許容
      const etymologyValid = (v: unknown) =>
        v === undefined ||
        typeof v === "string" ||
        (Array.isArray(v) && v.every((item) => typeof item === "string"));

      wordExtensions.forEach((ext: WordExtension, id: number) => {
        expect(stringOrUndefined(ext.coreImage), `id=${id} coreImage`).toBe(
          true
        );
        expect(stringOrUndefined(ext.usage), `id=${id} usage`).toBe(true);
        expect(
          stringOrUndefined(ext.synonymDifference),
          `id=${id} synonymDifference`
        ).toBe(true);
        expect(
          stringOrUndefined(ext.englishDefinition),
          `id=${id} englishDefinition`
        ).toBe(true);
        expect(etymologyValid(ext.etymology), `id=${id} etymology`).toBe(true);
      });
    });

    it("各フィールド（5種）が少なくとも1つのエントリで定義されている", () => {
      const entries = Array.from(wordExtensions.values());
      expect(entries.some((e) => e.coreImage)).toBe(true);
      expect(entries.some((e) => e.usage)).toBe(true);
      expect(entries.some((e) => e.synonymDifference)).toBe(true);
      expect(entries.some((e) => e.englishDefinition)).toBe(true);
      expect(entries.some((e) => e.etymology)).toBe(true);
    });
  });

  describe("特定の単語データ", () => {
    it("appointment (30001) の拡張データが正しく取得できる", () => {
      const ext = wordExtensions.get(30001);
      expect(ext).toBeDefined();
      expect(ext?.coreImage).toBeTruthy();
      expect(ext?.usage).toBeTruthy();
      expect(ext?.synonymDifference).toBeTruthy();
      expect(ext?.englishDefinition).toBeTruthy();
      expect(ext?.etymology).toBeTruthy();
    });

    it("schedule (30010) の拡張データが正しく取得できる", () => {
      const ext = wordExtensions.get(30010);
      expect(ext).toBeDefined();
      expect(ext?.coreImage).toBeTruthy();
    });

    it("happy (10008) の拡張データが正しく取得できる", () => {
      const ext = wordExtensions.get(10008);
      expect(ext).toBeDefined();
      expect(ext?.synonymDifference).toBeTruthy();
    });
  });

  describe("拡張データのIDが words に存在する", () => {
    it("全拡張データのIDに対応する単語が存在する", () => {
      const wordIds = new Set(words.map((w: Word) => w.id));
      const orphanIds: number[] = [];
      wordExtensions.forEach((_ext, id) => {
        if (!wordIds.has(id)) orphanIds.push(id);
      });
      expect(orphanIds, `orphan IDs: ${orphanIds.join(", ")}`).toHaveLength(0);
    });
  });
});

describe("統一Word型のフィールド検証", () => {
  it("全単語に difficulty フィールドがある", () => {
    const missing = words.filter((w: Word) => w.difficulty === undefined);
    expect(missing).toHaveLength(0);
  });

  it("全単語に category フィールドがある", () => {
    const missing = words.filter((w: Word) => !w.category);
    expect(missing).toHaveLength(0);
  });

  it("difficulty は 1-7 の範囲内", () => {
    const invalid = words.filter(
      (w: Word) => w.difficulty < 1 || w.difficulty > 7
    );
    expect(invalid).toHaveLength(0);
  });

  it("全単語に exampleJa（例文の日本語訳）がある", () => {
    const missing = words.filter((w: Word) => !w.exampleJa);
    expect(
      missing,
      `exampleJa 未設定: ${missing.slice(0, 5).map((w) => `${w.id}:${w.word}`).join(", ")}${missing.length > 5 ? "..." : ""}`
    ).toHaveLength(0);
  });

  it("全単語に example（英語例文）がある", () => {
    const missing = words.filter((w: Word) => !w.example);
    expect(missing).toHaveLength(0);
  });

  it("example と exampleJa に空文字列がない", () => {
    const emptyExample = words.filter((w: Word) => w.example === "");
    const emptyJa = words.filter((w: Word) => w.exampleJa === "");
    expect(emptyExample, "空のexample").toHaveLength(0);
    expect(emptyJa, "空のexampleJa").toHaveLength(0);
  });

  it("category が categoryLabels に定義されたカテゴリである", () => {
    // categoryLabels は top-level import 済み
    const validCategories = new Set(Object.keys(categoryLabels));
    const invalid = words.filter((w: Word) => !validCategories.has(w.category));
    expect(
      invalid,
      `不正なカテゴリ: ${invalid.slice(0, 5).map((w) => `${w.id}:${w.word}:${w.category}`).join(", ")}`
    ).toHaveLength(0);
  });
});

describe("自動補完エンジンの品質", () => {
  it("getWordExtension が全単語で正常に動作する", () => {
    // getWordExtension は top-level import 済み
    const sampleWords = words.slice(0, 100);
    for (const w of sampleWords) {
      const ext = getWordExtension(w);
      expect(ext, `id=${w.id} ${w.word}`).toBeDefined();
      expect(ext.coreImage, `id=${w.id} coreImage`).toBeTruthy();
      expect(ext.usage, `id=${w.id} usage`).toBeTruthy();
    }
  });

  it("生成されたコアイメージに「するする」「なな」等の重複がない", () => {
    // getWordExtension は top-level import 済み
    const badPatterns = [/するする/, /なな[状態]/, /にに/];
    const problems: string[] = [];
    for (const w of words) {
      const ext = getWordExtension(w);
      if (!ext.coreImage) continue;
      for (const pat of badPatterns) {
        if (pat.test(ext.coreImage)) {
          problems.push(`${w.id}:${w.word}: "${ext.coreImage.slice(0, 50)}"`);
        }
      }
    }
    expect(problems, problems.slice(0, 5).join("\n")).toHaveLength(0);
  });

  it("生成された英英定義に日本語が混入していない", () => {
    // getWordExtension は top-level import 済み
    const jaPattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
    const problems: string[] = [];
    const sampleWords = words.filter((w: Word) => !wordExtensions.has(w.id)).slice(0, 200);
    for (const w of sampleWords) {
      const ext = getWordExtension(w);
      if (ext.englishDefinition && jaPattern.test(ext.englishDefinition)) {
        problems.push(`${w.id}:${w.word}: "${ext.englishDefinition}"`);
      }
    }
    expect(problems, problems.slice(0, 5).join("\n")).toHaveLength(0);
  });
});
