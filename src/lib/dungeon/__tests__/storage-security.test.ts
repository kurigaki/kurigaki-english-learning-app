import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "@/lib/storage";

describe("Dungeon Storage Security", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getWarehouse", () => {
    it("returns empty array when no data", () => {
      expect(storage.getWarehouse()).toEqual([]);
    });

    it("rejects items with count > 99", () => {
      localStorage.setItem("dungeon_warehouse", JSON.stringify([
        { id: "heal_grass", name: "test", icon: "🌿", cat: "grass", desc: "test", count: 999 },
      ]));
      // count > 99 はバリデーションで除外される
      expect(storage.getWarehouse()).toHaveLength(0);
    });

    it("rejects items with count < 1", () => {
      localStorage.setItem("dungeon_warehouse", JSON.stringify([
        { id: "heal_grass", name: "test", icon: "🌿", cat: "grass", desc: "test", count: 0 },
      ]));
      expect(storage.getWarehouse()).toHaveLength(0);
    });

    it("rejects items with empty id", () => {
      localStorage.setItem("dungeon_warehouse", JSON.stringify([
        { id: "", name: "test", icon: "🌿", cat: "grass", desc: "test", count: 5 },
      ]));
      expect(storage.getWarehouse()).toHaveLength(0);
    });

    it("rejects items with excessively long id", () => {
      localStorage.setItem("dungeon_warehouse", JSON.stringify([
        { id: "a".repeat(51), name: "test", icon: "🌿", cat: "grass", desc: "test", count: 5 },
      ]));
      expect(storage.getWarehouse()).toHaveLength(0);
    });

    it("rejects non-array data", () => {
      localStorage.setItem("dungeon_warehouse", JSON.stringify({ id: "hack", count: 99 }));
      expect(storage.getWarehouse()).toEqual([]);
    });

    it("rejects malformed JSON", () => {
      localStorage.setItem("dungeon_warehouse", "not json");
      expect(storage.getWarehouse()).toEqual([]);
    });

    it("accepts valid items", () => {
      localStorage.setItem("dungeon_warehouse", JSON.stringify([
        { id: "heal_grass", name: "ヒールワード", icon: "🌿", cat: "grass", desc: "HPを回復", count: 3 },
      ]));
      const items = storage.getWarehouse();
      expect(items).toHaveLength(1);
      expect(items[0].count).toBe(3);
      expect(items[0].id).toBe("heal_grass");
    });
  });

  describe("saveWarehouse", () => {
    it("clamps count to 99", () => {
      storage.saveWarehouse([
        { id: "heal_grass", name: "test", icon: "🌿", cat: "grass", desc: "test", count: 200 },
      ]);
      const stored = JSON.parse(localStorage.getItem("dungeon_warehouse")!);
      expect(stored[0].count).toBe(99);
    });

    it("removes items with count 0", () => {
      storage.saveWarehouse([
        { id: "heal_grass", name: "test", icon: "🌿", cat: "grass", desc: "test", count: 0 },
      ]);
      const stored = JSON.parse(localStorage.getItem("dungeon_warehouse")!);
      expect(stored).toHaveLength(0);
    });
  });

  describe("getGoldBank", () => {
    it("returns 0 when no data", () => {
      expect(storage.getGoldBank()).toBe(0);
    });

    it("clamps to max 999999", () => {
      localStorage.setItem("dungeon_gold_bank", "99999999");
      expect(storage.getGoldBank()).toBe(999999);
    });

    it("clamps negative to 0", () => {
      localStorage.setItem("dungeon_gold_bank", "-1000");
      expect(storage.getGoldBank()).toBe(0);
    });

    it("handles non-numeric values", () => {
      localStorage.setItem("dungeon_gold_bank", "not a number");
      expect(storage.getGoldBank()).toBe(0);
    });
  });

  describe("saveGoldBank", () => {
    it("clamps to max 999999", () => {
      storage.saveGoldBank(5000000);
      expect(localStorage.getItem("dungeon_gold_bank")).toBe("999999");
    });

    it("clamps negative to 0", () => {
      storage.saveGoldBank(-100);
      expect(localStorage.getItem("dungeon_gold_bank")).toBe("0");
    });

    it("floors decimals", () => {
      storage.saveGoldBank(123.7);
      expect(localStorage.getItem("dungeon_gold_bank")).toBe("123");
    });
  });

  describe("addDungeonRanking", () => {
    it("rejects score > 999999", () => {
      const result = storage.addDungeonRanking({
        score: 9999999, floor: 5, lv: 10, kills: 20,
        correct: 30, wrong: 5, turns: 100,
        cleared: true, cause: "クリア", date: "2026-03-24", mode: "easy",
      });
      expect(result).toBe(-1);
    });

    it("rejects negative score", () => {
      const result = storage.addDungeonRanking({
        score: -100, floor: 5, lv: 10, kills: 20,
        correct: 30, wrong: 5, turns: 100,
        cleared: true, cause: "クリア", date: "2026-03-24", mode: "easy",
      });
      expect(result).toBe(-1);
    });

    it("rejects invalid floor", () => {
      const result = storage.addDungeonRanking({
        score: 5000, floor: 0, lv: 10, kills: 20,
        correct: 30, wrong: 5, turns: 100,
        cleared: true, cause: "クリア", date: "2026-03-24", mode: "easy",
      });
      expect(result).toBe(-1);
    });

    it("accepts valid ranking", () => {
      const result = storage.addDungeonRanking({
        score: 5000, floor: 5, lv: 10, kills: 20,
        correct: 30, wrong: 5, turns: 100,
        cleared: true, cause: "クリア", date: "2026-03-24", mode: "easy",
      });
      expect(result).toBe(1); // first entry = rank 1
      expect(storage.getDungeonRankings()).toHaveLength(1);
    });
  });
});
