import type { GameState, TileType, TrapType } from "./types";
import { W, R, C } from "./types";
import { MW, MH, ITEMS_DEF, ENEMIES_DEF, EASY_TRAP_TYPES, HARD_TRAP_TYPES, SHOP_PRICES, SHOPKEEPER_DEF } from "./constants";

/** explored 配列を全 false で初期化 */
export function initExplored(g: GameState): void {
  g.explored = Array.from({ length: MH }, () => new Array(MW).fill(false));
}

/**
 * プレイヤー位置を起点に視野を開く
 * - 部屋内: 部屋全体＋壁ボーダー＋隣接廊下1マスを開示
 * - 廊下 : 1タイル半径（8近傍）を開示
 */
export function revealAround(g: GameState, px: number, py: number): void {
  if (!g.explored) return;
  const mark = (x: number, y: number) => {
    if (x >= 0 && x < MW && y >= 0 && y < MH) g.explored[y][x] = true;
  };

  const tile = g.map[py][px];
  if (tile === R) {
    // 部屋タイル: 部屋全体＋壁ボーダー（廊下入口も含む）を開示
    const room = g.rooms.find(
      (r) => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h
    );
    if (room) {
      for (let ry = room.y - 1; ry <= room.y + room.h; ry++) {
        for (let rx = room.x - 1; rx <= room.x + room.w; rx++) {
          mark(rx, ry);
        }
      }
    }
  } else {
    // 廊下（または不明）: 1マス半径を開示
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        mark(px + dx, py + dy);
      }
    }
  }
}

/** 部屋タイルのうち廊下に隣接しているタイル（部屋の入口）かどうかを判定 */
function isRoomEntrance(m: TileType[][], x: number, y: number): boolean {
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx; const ny = y + dy;
    if (nx >= 0 && nx < MW && ny >= 0 && ny < MH && m[ny][nx] === C) return true;
  }
  return false;
}

/** BFS: 全部屋が連結しているか確認 */
function isAllRoomsConnected(m: TileType[][], rooms: { x: number; y: number; w: number; h: number }[]): boolean {
  if (rooms.length === 0) return true;
  const s = rooms[0];
  const sx = s.x + Math.floor(s.w / 2);
  const sy = s.y + Math.floor(s.h / 2);
  const visited = new Set<number>([sy * MW + sx]);
  const queue: [number, number][] = [[sx, sy]];
  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) continue;
      if (m[ny][nx] === W) continue;
      const k = ny * MW + nx;
      if (visited.has(k)) continue;
      visited.add(k);
      queue.push([nx, ny]);
    }
  }
  for (const room of rooms) {
    const rx = room.x + Math.floor(room.w / 2);
    const ry = room.y + Math.floor(room.h / 2);
    if (!visited.has(ry * MW + rx)) return false;
  }
  return true;
}

/** 後処理: 2幅の廊下を1幅に縮小 & 部屋入口を1マス幅に制限 */
function narrowCorridors(m: TileType[][], rooms: { x: number; y: number; w: number; h: number }[]): void {
  // Pass 1: 2×2 の C ブロックを解消（連結性を維持）
  let changed = true;
  while (changed) {
    changed = false;
    for (let y = 0; y < MH - 1; y++) {
      for (let x = 0; x < MW - 1; x++) {
        if (m[y][x] !== C || m[y][x + 1] !== C || m[y + 1][x] !== C || m[y + 1][x + 1] !== C) continue;
        for (const [cy, cx] of [[y + 1, x + 1], [y + 1, x], [y, x + 1], [y, x]] as [number, number][]) {
          m[cy][cx] = W;
          if (isAllRoomsConnected(m, rooms)) { changed = true; break; }
          m[cy][cx] = C;
        }
      }
    }
  }

  // Pass 2: 部屋の各辺に隣接する C タイルが2つ以上あれば1つに絞る
  for (const room of rooms) {
    const sides: { x: number; y: number }[][] = [
      Array.from({ length: room.w }, (_, i) => ({ x: room.x + i, y: room.y - 1 })),
      Array.from({ length: room.w }, (_, i) => ({ x: room.x + i, y: room.y + room.h })),
      Array.from({ length: room.h }, (_, i) => ({ x: room.x - 1, y: room.y + i })),
      Array.from({ length: room.h }, (_, i) => ({ x: room.x + room.w, y: room.y + i })),
    ];
    for (const side of sides) {
      const cTiles = side.filter(({ x, y }) =>
        x >= 0 && x < MW && y >= 0 && y < MH && m[y][x] === C
      );
      if (cTiles.length <= 1) continue;
      const keepIdx = Math.floor(cTiles.length / 2);
      for (let i = 0; i < cTiles.length; i++) {
        if (i === keepIdx) continue;
        const { x, y } = cTiles[i];
        m[y][x] = W;
        if (!isAllRoomsConnected(m, rooms)) m[y][x] = C;
      }
    }
  }
}

let _trapId = 0;

export function generateMap(g: GameState): void {
  const m: TileType[][] = [];
  for (let y = 0; y < MH; y++) {
    m.push(new Array(MW).fill(W) as TileType[]);
  }
  g.map = m;
  g.rooms = [];
  initExplored(g);

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

  // ── ショップ部屋・モンスターハウスの早期選択（廊下ルーティングに必要） ──
  let monsterHouseRoomIdx: number | null = null;
  if (g.dungeonMode === "hard" && rooms.length >= 4) {
    monsterHouseRoomIdx = 1 + Math.floor(Math.random() * (rooms.length - 2));
  }

  let shopRoomIdx: number | null = null;
  if (g.floor >= 2 && rooms.length >= 3) {
    const shopCandidates: number[] = [];
    for (let i = 1; i < rooms.length - 1; i++) {
      if (i !== monsterHouseRoomIdx) shopCandidates.push(i);
    }
    if (shopCandidates.length > 0) {
      const largeCandidates = shopCandidates.filter((i) => rooms[i].w >= 5 && rooms[i].h >= 5);
      shopRoomIdx = largeCandidates.length > 0
        ? largeCandidates[Math.floor(Math.random() * largeCandidates.length)]
        : shopCandidates[Math.floor(Math.random() * shopCandidates.length)];
    }
  }

  // corridors — 1タイル幅、部屋の各辺に最大1接続
  // 各部屋の辺ごとに使用済みフラグを管理: top/bottom/left/right
  const usedSides: Map<number, Set<string>> = new Map();
  for (let i = 0; i < rooms.length; i++) usedSides.set(i, new Set());

  /** 部屋の辺から廊下接続点を1つ選ぶ（辺の内側からランダムに1タイル） */
  function pickExit(room: { x: number; y: number; w: number; h: number }, side: string): { x: number; y: number } {
    switch (side) {
      case "top":    return { x: room.x + 1 + Math.floor(Math.random() * (room.w - 2)), y: room.y - 1 };
      case "bottom": return { x: room.x + 1 + Math.floor(Math.random() * (room.w - 2)), y: room.y + room.h };
      case "left":   return { x: room.x - 1, y: room.y + 1 + Math.floor(Math.random() * (room.h - 2)) };
      case "right":  return { x: room.x + room.w, y: room.y + 1 + Math.floor(Math.random() * (room.h - 2)) };
      default:       return { x: room.x, y: room.y };
    }
  }

  /** 2部屋間の最適な辺ペアを決定 */
  function bestSides(ai: number, bi: number): { aSide: string; bSide: string } | null {
    const a = rooms[ai], b = rooms[bi];
    const aCx = a.x + a.w / 2, aCy = a.y + a.h / 2;
    const bCx = b.x + b.w / 2, bCy = b.y + b.h / 2;
    const dx = bCx - aCx, dy = bCy - aCy;
    const usedA = usedSides.get(ai)!, usedB = usedSides.get(bi)!;

    // 優先順: 主方向に合った辺ペア
    const candidates: { aSide: string; bSide: string }[] = [];
    if (Math.abs(dx) >= Math.abs(dy)) {
      // 横方向優先
      if (dx > 0) candidates.push({ aSide: "right", bSide: "left" });
      else candidates.push({ aSide: "left", bSide: "right" });
      if (dy > 0) candidates.push({ aSide: "bottom", bSide: "top" });
      else if (dy < 0) candidates.push({ aSide: "top", bSide: "bottom" });
    } else {
      // 縦方向優先
      if (dy > 0) candidates.push({ aSide: "bottom", bSide: "top" });
      else candidates.push({ aSide: "top", bSide: "bottom" });
      if (dx > 0) candidates.push({ aSide: "right", bSide: "left" });
      else if (dx < 0) candidates.push({ aSide: "left", bSide: "right" });
    }
    for (const c of candidates) {
      if (!usedA.has(c.aSide) && !usedB.has(c.bSide)) return c;
    }
    // フォールバック: 空いている辺を探す
    const allSides = ["top", "bottom", "left", "right"];
    for (const as2 of allSides) {
      if (usedA.has(as2)) continue;
      for (const bs2 of allSides) {
        if (usedB.has(bs2)) continue;
        return { aSide: as2, bSide: bs2 };
      }
    }
    return null; // 4辺すべて使用済み
  }

  /** L字型廊下を掘る（1タイル幅） */
  function digCorridor(fromX: number, fromY: number, toX: number, toY: number, horizontalFirst: boolean): void {
    if (horizontalFirst) {
      // 横 → 縦
      const step = fromX <= toX ? 1 : -1;
      for (let x = fromX; x !== toX + step; x += step) {
        if (x >= 0 && x < MW && m[fromY][x] === W) m[fromY][x] = C;
      }
      const stepY = fromY <= toY ? 1 : -1;
      for (let y = fromY; y !== toY + stepY; y += stepY) {
        if (y >= 0 && y < MH && m[y][toX] === W) m[y][toX] = C;
      }
    } else {
      // 縦 → 横
      const stepY = fromY <= toY ? 1 : -1;
      for (let y = fromY; y !== toY + stepY; y += stepY) {
        if (y >= 0 && y < MH && m[y][fromX] === W) m[y][fromX] = C;
      }
      const step = fromX <= toX ? 1 : -1;
      for (let x = fromX; x !== toX + step; x += step) {
        if (x >= 0 && x < MW && m[toY][x] === W) m[toY][x] = C;
      }
    }
  }

  for (let i = 1; i < rooms.length; i++) {
    let fromIdx = i - 1;
    const toIdx = i;

    // ショップ部屋は1出口のみ: ショップからの接続はバイパスに変更
    // rooms[shop-1] → rooms[shop] は通常通り、rooms[shop] → rooms[shop+1] を
    // rooms[shop-1] → rooms[shop+1] に置き換える
    if (shopRoomIdx !== null && fromIdx === shopRoomIdx) {
      fromIdx = shopRoomIdx - 1;
      if (fromIdx < 0) continue;
    }

    const sides = bestSides(fromIdx, toIdx);
    if (!sides) continue; // 辺が全部埋まっている（稀）
    const exitA = pickExit(rooms[fromIdx], sides.aSide);
    const exitB = pickExit(rooms[toIdx], sides.bSide);
    // 辺を使用済みに
    usedSides.get(fromIdx)!.add(sides.aSide);
    usedSides.get(toIdx)!.add(sides.bSide);
    // 横優先か縦優先かはA側の辺で決定
    const hFirst = sides.aSide === "left" || sides.aSide === "right";
    digCorridor(exitA.x, exitA.y, exitB.x, exitB.y, hFirst);
  }

  // 後処理: 廊下を1列化 & 入口を1マス幅に制限
  narrowCorridors(m, rooms);

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
    const cnt = 1 + Math.floor(Math.random() * 2) + (g.floor >= 4 ? 1 : 0);
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
      const pool = ENEMIES_DEF.filter((e) => e.floor <= g.floor);
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
  g.monsterHouseRoomIdx = monsterHouseRoomIdx;
  if (monsterHouseRoomIdx !== null) {
    const mhRoom = rooms[monsterHouseRoomIdx];
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
    // エネミーラッシュの報酬: アイテムを3〜5個配置（挑む動機）
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

  // Shop — 1フロアに1箇所、3×3グリッド配置 + 店主NPC配置
  // ショップ部屋は廊下接続が1本のみ（店主が出口を塞げるように）
  g.shopItems = [];
  g.shopkeeper = null;
  g.shopRoomIdx = null;
  g.stolenItems = [];
  g.theftTriggered = false;
  if (shopRoomIdx !== null) {
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
      if (sx <= shopRoom.x || sx >= shopRoom.x + shopRoom.w - 1) continue;
      if (sy <= shopRoom.y || sy >= shopRoom.y + shopRoom.h - 1) continue;
      const itemId = shopPool[Math.floor(Math.random() * shopPool.length)];
      g.shopItems.push({ x: sx, y: sy, itemId, price: SHOP_PRICES[itemId] });
    }
    // 入口位置を特定（部屋のRタイルでCに隣接しているもの）
    g.shopRoomIdx = shopRoomIdx;
    let entranceX = shopRoom.x + 1;
    let entranceY = shopRoom.y + 1;
    let corridorDx = 0;
    let corridorDy = -1;
    findEntrance:
    for (let ry = shopRoom.y; ry < shopRoom.y + shopRoom.h; ry++) {
      for (let rx = shopRoom.x; rx < shopRoom.x + shopRoom.w; rx++) {
        if (m[ry][rx] !== R) continue;
        for (const [ddx, ddy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
          const nx = rx + ddx, ny = ry + ddy;
          if (nx >= 0 && nx < MW && ny >= 0 && ny < MH && m[ny][nx] === C) {
            entranceX = rx;
            entranceY = ry;
            corridorDx = ddx;
            corridorDy = ddy;
            break findEntrance;
          }
        }
      }
    }
    // 店主配置: 入口の1歩横（入口を塞がない位置）
    let skX = entranceX;
    let skY = entranceY;
    // 廊下方向と垂直な方向に1歩ずらす
    const perpDirs: [number, number][] = corridorDx !== 0
      ? [[0, -1], [0, 1]]
      : [[-1, 0], [1, 0]];
    for (const [pdx, pdy] of perpDirs) {
      const nx = entranceX + pdx;
      const ny = entranceY + pdy;
      if (nx > shopRoom.x && nx < shopRoom.x + shopRoom.w - 1 &&
          ny > shopRoom.y && ny < shopRoom.y + shopRoom.h - 1 &&
          !g.shopItems.find((s) => s.x === nx && s.y === ny)) {
        skX = nx;
        skY = ny;
        break;
      }
    }
    // フォールバック: 入口から部屋内側に1歩
    if (skX === entranceX && skY === entranceY) {
      const insideX = entranceX - corridorDx;
      const insideY = entranceY - corridorDy;
      if (insideX > shopRoom.x && insideX < shopRoom.x + shopRoom.w - 1 &&
          insideY > shopRoom.y && insideY < shopRoom.y + shopRoom.h - 1 &&
          !g.shopItems.find((s) => s.x === insideX && s.y === insideY)) {
        skX = insideX;
        skY = insideY;
      }
    }
    g.shopkeeper = {
      x: skX,
      y: skY,
      hp: SHOPKEEPER_DEF.mhp,
      mhp: SHOPKEEPER_DEF.mhp,
      atk: SHOPKEEPER_DEF.atk,
      hostile: false,
      homeX: skX,
      homeY: skY,
      entranceX,
      entranceY,
    };
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
