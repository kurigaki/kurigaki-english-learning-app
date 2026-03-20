import type { GameState, TileType, TrapType } from "./types";
import { W, R, C } from "./types";
import { MW, MH, ITEMS_DEF, ENEMIES_DEF, EASY_TRAP_TYPES, HARD_TRAP_TYPES, SHOP_PRICES } from "./constants";

/** 部屋タイルのうち廊下に隣接しているタイル（部屋の入口）かどうかを判定 */
function isRoomEntrance(m: TileType[][], x: number, y: number): boolean {
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx; const ny = y + dy;
    if (nx >= 0 && nx < MW && ny >= 0 && ny < MH && m[ny][nx] === C) return true;
  }
  return false;
}

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

  // items（出現率: 通常部屋は75%、アイテム不足を防ぐ）
  g.itemTiles = [];
  const pool = getItemPool(g.floor);
  for (let ri = 1; ri < rooms.length - 1; ri++) {
    if (Math.random() < 0.75) {
      const r = rooms[ri];
      const ix = r.x + 1 + Math.floor(Math.random() * (r.w - 2));
      const iy = r.y + 1 + Math.floor(Math.random() * (r.h - 2));
      if (!g.enemies.find((e) => e.x === ix && e.y === iy)) {
        g.itemTiles.push({ x: ix, y: iy, id: pool[Math.floor(Math.random() * pool.length)] });
      }
    }
  }

  // アイテムの重複チェック用セット
  const itemPositions = new Set(g.itemTiles.map((it) => `${it.x},${it.y}`));

  // Traps（アイテムと重ならない・部屋入口を避ける）
  g.traps = [];
  const trapPool: TrapType[] = g.dungeonMode === "hard" ? HARD_TRAP_TYPES : EASY_TRAP_TYPES;
  const trapCount = g.dungeonMode === "hard"
    ? 3 + Math.floor(Math.random() * 4) // 3-6 traps in hard
    : 1 + Math.floor(Math.random() * 2); // 1-2 traps in easy
  for (let t = 0; t < trapCount * 10 && g.traps.length < trapCount; t++) {
    const ri = 1 + Math.floor(Math.random() * (rooms.length - 1));
    const r = rooms[ri];
    const tx = r.x + 1 + Math.floor(Math.random() * (r.w - 2));
    const ty = r.y + 1 + Math.floor(Math.random() * (r.h - 2));
    if (tx === g.px && ty === g.py) continue;
    if (g.stairsPos && tx === g.stairsPos.x && ty === g.stairsPos.y) continue;
    if (g.enemies.find((e) => e.x === tx && e.y === ty)) continue;
    if (g.traps.find((tr) => tr.x === tx && tr.y === ty)) continue;
    // アイテムと重ならない
    if (itemPositions.has(`${tx},${ty}`)) continue;
    // 部屋入口（廊下隣接タイル）には罠を置かない
    if (isRoomEntrance(m, tx, ty)) continue;
    const type = trapPool[Math.floor(Math.random() * trapPool.length)];
    g.traps.push({ id: ++_trapId, x: tx, y: ty, type, visible: false });
  }

  // Monster house (hard mode only, one room packed with enemies + items as reward)
  // — generated first to exclude from shop
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
    // モンスターハウスの報酬: アイテムを3〜5個配置（挑む動機）
    const mhItemPool = getItemPool(g.floor);
    const mhItemCount = 3 + Math.floor(Math.random() * 3); // 3-5 items
    for (let att = 0; att < mhItemCount * 10 && g.itemTiles.filter(
      (it) => it.x >= mhRoom.x && it.x < mhRoom.x + mhRoom.w && it.y >= mhRoom.y && it.y < mhRoom.y + mhRoom.h
    ).length < mhItemCount; att++) {
      const ix = mhRoom.x + 1 + Math.floor(Math.random() * (mhRoom.w - 2));
      const iy = mhRoom.y + 1 + Math.floor(Math.random() * (mhRoom.h - 2));
      if (g.enemies.find((e) => e.x === ix && e.y === iy)) continue;
      if (g.itemTiles.find((it) => it.x === ix && it.y === iy)) continue;
      g.itemTiles.push({ x: ix, y: iy, id: mhItemPool[Math.floor(Math.random() * mhItemPool.length)] });
    }
  }

  // Shop — 1フロアに1箇所、3×3グリッド配置
  // (将来: 店主キャラ配置・泥棒システム対応のため shopRoomIdx を明示)
  g.shopItems = [];
  if (g.floor >= 2 && rooms.length >= 3) {
    const excludedRoomIdx = g.monsterHouseRoomIdx ?? -1;
    const candidateIdxs: number[] = [];
    for (let i = 1; i < rooms.length - 1; i++) {
      if (i !== excludedRoomIdx) candidateIdxs.push(i);
    }
    if (candidateIdxs.length > 0) {
      // 3×3グリッドが収まる5×5以上の部屋を優先
      const largeRoomIdxs = candidateIdxs.filter((i) => rooms[i].w >= 5 && rooms[i].h >= 5);
      const shopRoomIdx = largeRoomIdxs.length > 0
        ? largeRoomIdxs[Math.floor(Math.random() * largeRoomIdxs.length)]
        : candidateIdxs[Math.floor(Math.random() * candidateIdxs.length)];
      const shopRoom = rooms[shopRoomIdx];
      const shopPool = Object.keys(SHOP_PRICES);
      // ショップ部屋の敵・アイテム・罠を除去してスペースを確保
      g.enemies = g.enemies.filter(
        (e) => !(e.x >= shopRoom.x && e.x < shopRoom.x + shopRoom.w && e.y >= shopRoom.y && e.y < shopRoom.y + shopRoom.h)
      );
      g.itemTiles = g.itemTiles.filter(
        (it) => !(it.x >= shopRoom.x && it.x < shopRoom.x + shopRoom.w && it.y >= shopRoom.y && it.y < shopRoom.y + shopRoom.h)
      );
      g.traps = g.traps.filter(
        (tr) => !(tr.x >= shopRoom.x && tr.x < shopRoom.x + shopRoom.w && tr.y >= shopRoom.y && tr.y < shopRoom.y + shopRoom.h)
      );
      // 3×3グリッドを部屋中央に配置（内部タイルに収まる位置のみ使用）
      const centerX = shopRoom.x + Math.floor(shopRoom.w / 2);
      const centerY = shopRoom.y + Math.floor(shopRoom.h / 2);
      const gridOffsets: [number, number][] = [
        [-1, -1], [0, -1], [1, -1],
        [-1,  0], [0,  0], [1,  0],
        [-1,  1], [0,  1], [1,  1],
      ];
      for (const [dx, dy] of gridOffsets) {
        const sx = centerX + dx;
        const sy = centerY + dy;
        // 内部タイル（壁の1マス内側）のみ配置
        if (sx <= shopRoom.x || sx >= shopRoom.x + shopRoom.w - 1) continue;
        if (sy <= shopRoom.y || sy >= shopRoom.y + shopRoom.h - 1) continue;
        const itemId = shopPool[Math.floor(Math.random() * shopPool.length)];
        g.shopItems.push({ x: sx, y: sy, itemId, price: SHOP_PRICES[itemId] });
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
