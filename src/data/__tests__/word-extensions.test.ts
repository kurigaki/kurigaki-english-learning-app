import { describe, it, expect } from "vitest";
import type { WordExtension } from "@/types";
import { wordExtensions } from "../word-extensions";
import { words, type Word } from "../words";

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
});
