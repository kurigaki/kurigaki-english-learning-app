import type { GameState, TileType } from "./types";
import { W, R, C } from "./types";
import { MW, MH, ITEMS_DEF, ENEMIES_DEF } from "./constants";

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
