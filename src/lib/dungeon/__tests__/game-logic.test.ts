import { describe, it, expect } from "vitest";
import { initExplored, generateMap, revealAround } from "@/lib/dungeon/map";
import { adj, sameRoom, getAllCorridorEntrances } from "@/lib/dungeon/ai";
import { ITEMS_DEF, ENEMIES_DEF, GUARDIAN_DEFS, SHOPKEEPER_DEF, MW, MH } from "@/lib/dungeon/constants";
import type { GameState } from "@/lib/dungeon/types";

function createTestGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    floor: 1,
    p: { hp: 25, mhp: 25, lv: 1, exp: 0, enext: 30, atk: 4 },
    items: [],
    map: [],
    explored: [],
    rooms: [],
    px: 2, py: 2,
    enemies: [],
    itemTiles: [],
    stairsPos: null,
    turn: 0, kills: 0, correct: 0, wrong: 0,
    missedWords: [],
    answeredQuestions: [],
    powerUp: false, sureHit: false, onStairs: false,
    swiftTurns: 0, blindTurns: 0,
    cane_blow_charges: 3, cane_sleep_charges: 4, cane_seal_charges: 4, cane_warp_charges: 2,
    hunger: 100, maxHunger: 100, gold: 0,
    traps: [], shopItems: [],
    shopkeeper: null, shopRoomIdx: null, stolenItems: [], theftTriggered: false,
    dungeonMode: "easy",
    monsterHouseRoomIdx: null,
    playerDir: { dx: 0, dy: 0 },
    playerSleepTurns: 0, playerConfusedTurns: 0, playerSlowTurns: 0,
    diagMove: false,
    ...overrides,
  };
}

describe("Map Generation", () => {
  it("generates a valid map with rooms and corridors", () => {
    const g = createTestGameState();
    generateMap(g);
    expect(g.map.length).toBe(MH);
    expect(g.map[0].length).toBe(MW);
    expect(g.rooms.length).toBeGreaterThan(0);
    expect(g.stairsPos).not.toBeNull();
  });

  it("places player in first room", () => {
    const g = createTestGameState();
    generateMap(g);
    const firstRoom = g.rooms[0];
    expect(g.px).toBeGreaterThanOrEqual(firstRoom.x);
    expect(g.px).toBeLessThan(firstRoom.x + firstRoom.w);
    expect(g.py).toBeGreaterThanOrEqual(firstRoom.y);
    expect(g.py).toBeLessThan(firstRoom.y + firstRoom.h);
  });

  it("places stairs in last room", () => {
    const g = createTestGameState();
    generateMap(g);
    const lastRoom = g.rooms[g.rooms.length - 1];
    expect(g.stairsPos!.x).toBeGreaterThanOrEqual(lastRoom.x);
    expect(g.stairsPos!.x).toBeLessThan(lastRoom.x + lastRoom.w);
  });

  it("generates enemies", () => {
    const g = createTestGameState();
    generateMap(g);
    expect(g.enemies.length).toBeGreaterThan(0);
  });

  it("generates shop with shopkeeper on floor >= 2", () => {
    // テンプレートベース生成: ショップは行き止まり部屋(5×5以上)がある場合のみ
    // 複数回生成して少なくとも1回はショップが出ることを確認
    let shopFound = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      const g = createTestGameState({ floor: 3 });
      generateMap(g);
      if (g.shopkeeper) {
        expect(g.shopkeeper.hp).toBe(SHOPKEEPER_DEF.mhp);
        expect(g.shopkeeper.hostile).toBe(false);
        expect(g.shopRoomIdx).not.toBeNull();
        shopFound = true;
        break;
      }
    }
    expect(shopFound).toBe(true);
  });

  it("does not generate shop on floor 1", () => {
    const g = createTestGameState({ floor: 1 });
    generateMap(g);
    expect(g.shopkeeper).toBeNull();
    expect(g.shopItems).toHaveLength(0);
  });

  it("initializes theftTriggered to false", () => {
    const g = createTestGameState({ floor: 3 });
    generateMap(g);
    expect(g.theftTriggered).toBe(false);
    expect(g.stolenItems).toHaveLength(0);
  });
});

describe("AI Helpers", () => {
  it("adj detects adjacent tiles (Chebyshev distance 1)", () => {
    expect(adj(5, 5, 6, 5)).toBe(true);  // right
    expect(adj(5, 5, 5, 6)).toBe(true);  // down
    expect(adj(5, 5, 6, 6)).toBe(true);  // diagonal
    expect(adj(5, 5, 7, 5)).toBe(false); // too far
    expect(adj(5, 5, 5, 5)).toBe(false); // same tile
  });

  it("sameRoom detects two points in same room", () => {
    const rooms = [{ x: 5, y: 5, w: 4, h: 3 }];
    expect(sameRoom(rooms, 6, 6, 7, 7)).toBe(true);
    expect(sameRoom(rooms, 6, 6, 15, 15)).toBe(false);
  });

  it("getAllCorridorEntrances finds room tiles adjacent to corridors", () => {
    const g = createTestGameState();
    generateMap(g);
    const entrances = getAllCorridorEntrances(g);
    expect(entrances.length).toBeGreaterThan(0);
    // Each entrance should be a room tile
    for (const e of entrances) {
      expect(g.map[e.y][e.x]).toBe(1); // R = 1
    }
  });
});

describe("Constants Integrity", () => {
  it("all items have required fields", () => {
    for (const item of ITEMS_DEF) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.icon).toBeTruthy();
      expect(["grass", "scroll", "cane", "food", "jar", "special"]).toContain(item.cat);
      expect(item.rarity).toBeGreaterThanOrEqual(1);
    }
  });

  it("all enemies have valid stats", () => {
    for (const enemy of ENEMIES_DEF) {
      expect(enemy.mhp).toBeGreaterThan(0);
      expect(enemy.atk).toBeGreaterThan(0);
      expect(enemy.floor).toBeGreaterThanOrEqual(1);
      expect(enemy.sleepChance).toBeGreaterThanOrEqual(0);
      expect(enemy.sleepChance).toBeLessThanOrEqual(1);
    }
  });

  it("guardian stats are balanced (ATK < shopkeeper)", () => {
    for (const g of GUARDIAN_DEFS) {
      expect(g.atk).toBeLessThan(SHOPKEEPER_DEF.atk);
      expect(g.mhp).toBeGreaterThan(0);
      expect(g.sleepChance).toBe(0); // guardians never sleep
      expect(g.exp).toBe(0); // no exp reward
    }
  });

  it("shopkeeper has high stats", () => {
    expect(SHOPKEEPER_DEF.mhp).toBeGreaterThanOrEqual(200);
    expect(SHOPKEEPER_DEF.atk).toBeGreaterThanOrEqual(50);
    expect(SHOPKEEPER_DEF.exp).toBe(0);
  });
});

describe("Fog of War", () => {
  it("initExplored creates all-false grid", () => {
    const g = createTestGameState();
    g.map = Array.from({ length: MH }, () => new Array(MW).fill(0));
    initExplored(g);
    expect(g.explored.length).toBe(MH);
    expect(g.explored[0].length).toBe(MW);
    expect(g.explored[0][0]).toBe(false);
  });

  it("revealAround reveals tiles around player", () => {
    const g = createTestGameState();
    generateMap(g);
    initExplored(g);
    expect(g.explored[g.py][g.px]).toBe(false);
    revealAround(g, g.px, g.py);
    expect(g.explored[g.py][g.px]).toBe(true);
  });
});
