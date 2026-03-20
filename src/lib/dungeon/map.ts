import type { GameState, TileType, TrapType } from "./types";
import { W, R, C } from "./types";
import { MW, MH, ITEMS_DEF, ENEMIES_DEF, EASY_TRAP_TYPES, HARD_TRAP_TYPES, SHOP_PRICES } from "./constants";

let _trapId = 0;

export function generateMap(g: GameState): void {
  const m: TileType[][] = [];
  for (let y = 0; y < MH; y++) {
    m.push(new Array(MW).fill(W) as TileType[]);
  }
  g.map = m;
  g.rooms = [];

  // generate rooms
  const rooms: { x: number; y: number; w: number; h: number }[] = [];
  for (let attempt = 0; attempt < 300 && rooms.length < 9; attempt++) {
    const rw = 4 + Math.floor(Math.random() * 6);
    const rh = 3 + Math.floor(Math.random() * 4);
    const rx = 1 + Math.floor(Math.random() * (MW - rw - 2));
    const ry = 1 + Math.floor(Math.random() * (MH - rh - 2));
    let ok = true;
    for (const r of rooms) {
      if (rx < r.x + r.w + 2 && rx + rw + 2 > r.x && ry < r.y + r.h + 2 && ry + rh + 2 > r.y) {
        ok = false;
        break;
      }
    }
    if (ok) {
      rooms.push({ x: rx, y: ry, w: rw, h: rh });
      for (let y = ry; y < ry + rh; y++)
        for (let x = rx; x < rx + rw; x++) m[y][x] = R;
    }
  }
  g.rooms = rooms;

  // corridors (L-shaped)
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1];
    const b = rooms[i];
    const ax = a.x + Math.floor(a.w / 2);
    const ay = a.y + Math.floor(a.h / 2);
    const bx = b.x + Math.floor(b.w / 2);
    const by = b.y + Math.floor(b.h / 2);
    for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
      if (m[ay][x] === W) m[ay][x] = C;
    }
    for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
      if (m[y][bx] === W) m[y][bx] = C;
    }
  }

  // player start
  g.px = rooms[0].x + 1;
  g.py = rooms[0].y + 1;

  // stairs in last room
  const lr = rooms[rooms.length - 1];
  g.stairsPos = {
    x: lr.x + Math.floor(lr.w / 2),
    y: lr.y + Math.floor(lr.h / 2),
  };

  // enemies
  g.enemies = [];
  let eid = 0;
  for (let ri = 1; ri < rooms.length; ri++) {
    const r = rooms[ri];
    const cnt = 1 + Math.floor(Math.random() * 2);
    for (let c = 0; c < cnt; c++) {
      let ex = 0;
      let ey = 0;
      let att = 0;
      do {
        ex = r.x + 1 + Math.floor(Math.random() * (r.w - 2));
        ey = r.y + 1 + Math.floor(Math.random() * (r.h - 2));
        att++;
      } while (
        att < 20 &&
        (g.enemies.find((e) => e.x === ex && e.y === ey) ||
          (g.stairsPos && ex === g.stairsPos.x && ey === g.stairsPos.y))
      );
      const pool = ENEMIES_DEF.filter((e) => e.floor <= Math.min(g.floor, 3));
      const t = pool[Math.floor(Math.random() * pool.length)];
      const sleeping = Math.random() < t.sleepChance;
      g.enemies.push({
        ...t,
        hp: t.mhp,
        x: ex,
        y: ey,
        id: eid++,
        alert: false,
        sleeping,
        confused: 0,
        sealed: 0,
        wanderTarget: null,
        lastDx: undefined,
        lastDy: undefined,
        stuckCount: 0,
      });
    }
  }

  // items
  g.itemTiles = [];
  const pool = getItemPool(g.floor);
  for (let ri = 1; ri < rooms.length - 1; ri++) {
    if (Math.random() < 0.6) {
      const r = rooms[ri];
      const ix = r.x + 1 + Math.floor(Math.random() * (r.w - 2));
      const iy = r.y + 1 + Math.floor(Math.random() * (r.h - 2));
      if (!g.enemies.find((e) => e.x === ix && e.y === iy)) {
        g.itemTiles.push({ x: ix, y: iy, id: pool[Math.floor(Math.random() * pool.length)] });
      }
    }
  }

  // Traps
  g.traps = [];
  const trapPool: TrapType[] = g.dungeonMode === "hard" ? HARD_TRAP_TYPES : EASY_TRAP_TYPES;
  const trapCount = g.dungeonMode === "hard"
    ? 3 + Math.floor(Math.random() * 4) // 3-6 traps in hard
    : 1 + Math.floor(Math.random() * 2); // 1-2 traps in easy
  for (let t = 0; t < trapCount * 5 && g.traps.length < trapCount; t++) {
    const ri = 1 + Math.floor(Math.random() * (rooms.length - 1));
    const r = rooms[ri];
    const tx = r.x + 1 + Math.floor(Math.random() * (r.w - 2));
    const ty = r.y + 1 + Math.floor(Math.random() * (r.h - 2));
    if (
      tx === g.px && ty === g.py) continue;
    if (g.stairsPos && tx === g.stairsPos.x && ty === g.stairsPos.y) continue;
    if (g.enemies.find((e) => e.x === tx && e.y === ty)) continue;
    if (g.traps.find((tr) => tr.x === tx && tr.y === ty)) continue;
    const type = trapPool[Math.floor(Math.random() * trapPool.length)];
    g.traps.push({ id: ++_trapId, x: tx, y: ty, type, visible: false });
  }

  // Monster house (hard mode only, one room packed with enemies) — generated first to exclude from shop
  g.monsterHouseRoomIdx = null;
  if (g.dungeonMode === "hard" && rooms.length >= 4) {
    const mhRoomIdx = 1 + Math.floor(Math.random() * (rooms.length - 2));
    g.monsterHouseRoomIdx = mhRoomIdx;
    const mhRoom = rooms[mhRoomIdx];
    const mhCount = 5 + Math.floor(Math.random() * 4); // 5-8 enemies
    const alreadyInRoom = g.enemies.filter(
      (e) => e.x >= mhRoom.x && e.x < mhRoom.x + mhRoom.w && e.y >= mhRoom.y && e.y < mhRoom.y + mhRoom.h
    ).length;
    const toAdd = mhCount - alreadyInRoom;
    for (let att = 0; att < toAdd * 10 && g.enemies.filter(
      (e2) => e2.x >= mhRoom.x && e2.x < mhRoom.x + mhRoom.w && e2.y >= mhRoom.y && e2.y < mhRoom.y + mhRoom.h
    ).length < mhCount; att++) {
      const ex = mhRoom.x + 1 + Math.floor(Math.random() * (mhRoom.w - 2));
      const ey = mhRoom.y + 1 + Math.floor(Math.random() * (mhRoom.h - 2));
      if (g.enemies.find((e) => e.x === ex && e.y === ey)) continue;
      const epool = ENEMIES_DEF.filter((e) => e.floor <= Math.min(g.floor, 3));
      const tmpl = epool[Math.floor(Math.random() * epool.length)];
      g.enemies.push({
        ...tmpl, hp: tmpl.mhp, x: ex, y: ey, id: eid++,
        alert: false, sleeping: true, confused: 0, sealed: 0,
        wanderTarget: null, lastDx: undefined, lastDy: undefined, stuckCount: 0,
      });
    }
  }

  // Shop (floor 2+ only, random room, not first/last, not the monster house room)
  g.shopItems = [];
  if (g.floor >= 2 && rooms.length >= 4 && Math.random() < 0.7) {
    const excludedRoomIdx = g.monsterHouseRoomIdx ?? -1;
    const candidateIdxs: number[] = [];
    for (let i = 1; i < rooms.length - 1; i++) {
      if (i !== excludedRoomIdx) candidateIdxs.push(i);
    }
    if (candidateIdxs.length > 0) {
      const shopRoomIdx = candidateIdxs[Math.floor(Math.random() * candidateIdxs.length)];
      const shopRoom = rooms[shopRoomIdx];
      const shopPool = Object.keys(SHOP_PRICES);
      const shopItemCount = 2 + Math.floor(Math.random() * 2); // 2-3 shop items
      let placed = 0;
      for (let att = 0; att < 30 && placed < shopItemCount; att++) {
        const sx = shopRoom.x + 1 + Math.floor(Math.random() * (shopRoom.w - 2));
        const sy = shopRoom.y + 1 + Math.floor(Math.random() * (shopRoom.h - 2));
        if (g.enemies.find((e) => e.x === sx && e.y === sy)) continue;
        if (g.itemTiles.find((i) => i.x === sx && i.y === sy)) continue;
        if (g.traps.find((tr) => tr.x === sx && tr.y === sy)) continue;
        if (g.shopItems.find((s) => s.x === sx && s.y === sy)) continue;
        const itemId = shopPool[Math.floor(Math.random() * shopPool.length)];
        g.shopItems.push({ x: sx, y: sy, itemId, price: SHOP_PRICES[itemId] });
        placed++;
      }
    }
  }
}

export function getItemPool(floor: number): string[] {
  const basePool = ITEMS_DEF.filter((d) => d.cat !== "jar" || floor >= 2);
  const weighted: string[] = [];
  for (const d of basePool) {
    const w = d.rarity + (floor > 2 ? 1 : 0);
    for (let i = 0; i < w; i++) weighted.push(d.id);
  }
  return weighted;
}
