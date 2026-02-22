import { describe, it, expect } from "vitest";
import type { WordExtension } from "@/types";
import { wordExtensions } from "../word-extensions";
import { words } from "../words/compat";

describe("wordExtensions", () => {
  describe("マップ構造", () => {
    it("拡張データが存在する", () => {
      expect(wordExtensions.size).toBeGreaterThan(0);
    });

    it("全エントリのフィールドが string 型または undefined である", () => {
      const stringOrUndefined = (v: unknown) =>
        v === undefined || typeof v === "string";

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
        expect(stringOrUndefined(ext.etymology), `id=${id} etymology`).toBe(
          true
        );
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

  describe("compat words との結合", () => {
    it("拡張データが登録された単語のフィールドが words 配列に反映されている", () => {
      const appointment = words.find((w) => w.id === 30001);
      expect(appointment).toBeDefined();
      expect(appointment?.coreImage).toBeTruthy();
      expect(appointment?.usage).toBeTruthy();
      expect(appointment?.synonymDifference).toBeTruthy();
      expect(appointment?.englishDefinition).toBeTruthy();
      expect(appointment?.etymology).toBeTruthy();
    });

    it("拡張データが存在しない単語のフィールドは undefined になる", () => {
      // apple (10001) は拡張データなし
      const apple = words.find((w) => w.id === 10001);
      expect(apple).toBeDefined();
      expect(apple?.coreImage).toBeUndefined();
      expect(apple?.usage).toBeUndefined();
      expect(apple?.synonymDifference).toBeUndefined();
      expect(apple?.englishDefinition).toBeUndefined();
      expect(apple?.etymology).toBeUndefined();
    });

    it("複数の拡張データ単語がすべて正しくマージされている", () => {
      const extendedIds = Array.from(wordExtensions.keys());
      extendedIds.forEach((id) => {
        const word = words.find((w) => w.id === id);
        expect(word, `id=${id} の単語が words に存在する`).toBeDefined();
        // 拡張データの少なくとも1フィールドが反映されている
        const ext = wordExtensions.get(id)!;
        if (ext.coreImage) expect(word?.coreImage).toBe(ext.coreImage);
        if (ext.usage) expect(word?.usage).toBe(ext.usage);
        if (ext.synonymDifference)
          expect(word?.synonymDifference).toBe(ext.synonymDifference);
        if (ext.englishDefinition)
          expect(word?.englishDefinition).toBe(ext.englishDefinition);
        if (ext.etymology) expect(word?.etymology).toBe(ext.etymology);
      });
    });
  });
});
