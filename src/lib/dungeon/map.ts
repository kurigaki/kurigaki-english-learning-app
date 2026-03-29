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
    // 廊下（または不明）: 3マス半径を開示（敵が事前に見える）
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        mark(px + dx, py + dy);
      }
    }
  }
}

/** 廊下タイルかどうか判定（画面描画で常時表示用） */
export function isCorridorOrAdjacentWall(g: GameState, x: number, y: number): boolean {
  if (g.map[y][x] === C) return true;
  // 廊下に隣接する壁も表示（輪郭が見えるように）
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && nx < MW && ny >= 0 && ny < MH && g.map[ny][nx] === C) return true;
  }
  return false;
}

/** 部屋タイルのうち廊下に隣接しているタイル（部屋の入口）かどうかを判定 */
function isRoomEntrance(m: TileType[][], x: number, y: number): boolean {
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx; const ny = y + dy;
    if (nx >= 0 && nx < MW && ny >= 0 && ny < MH && m[ny][nx] === C) return true;
  }
  return false;
}

/**
 * BFS廊下掘り: 部屋に隣接しない・部屋の角を避ける1幅経路を探す
 * 失敗時は false を返す（L字フォールバック用）
 */
let _trapId = 0;

export function generateMap(g: GameState): void {
  const m: TileType[][] = [];
  for (let y = 0; y < MH; y++) {
    m.push(new Array(MW).fill(W) as TileType[]);
  }
  g.map = m;
  g.rooms = [];
  initExplored(g);

  // ── テンプレートベースの部屋配置 ──────────────────────────────────
  // 3×3 グリッドに部屋を配置。隣接セル間をL字廊下で接続。
  // 部屋がグリッドセル内に収まるため、廊下が他の部屋を通過しない。
  const GRID_COLS = 3;
  const GRID_ROWS = 3;
  const CELL_W = Math.floor(MW / GRID_COLS); // 14
  const CELL_H = Math.floor(MH / GRID_ROWS); // 10

  // フロアテンプレート: 1=部屋あり, 0=なし（全パターン隣接接続で到達可能を保証）
  // minFloor: この階層以降で出現、easyOk: 初心者モードで出現可
  const TEMPLATES: { grid: number[][]; minFloor: number; easyOk: boolean }[] = [
    // 初心者向け（5-6部屋、シンプル構造）
    { grid: [[0,1,0],[1,1,1],[0,1,0]], minFloor: 1, easyOk: true },   // Cross 5
    { grid: [[1,1,0],[0,1,0],[0,1,1]], minFloor: 1, easyOk: true },   // Zigzag 5
    { grid: [[1,1,0],[1,0,0],[1,1,1]], minFloor: 1, easyOk: true },   // L-shape 6
    { grid: [[1,1,1],[0,1,0],[0,1,0]], minFloor: 1, easyOk: true },   // T-top 6
    // 中級（7部屋 + ループ構造）
    { grid: [[1,0,1],[1,1,1],[1,0,1]], minFloor: 1, easyOk: true },   // H-shape 7
    { grid: [[1,0,1],[1,0,1],[1,1,1]], minFloor: 1, easyOk: true },   // U-shape 7
    { grid: [[1,1,1],[1,0,0],[1,1,1]], minFloor: 1, easyOk: true },   // 7 variant
    // ループ構造（行き止まりなし = 逃げ回れる）
    { grid: [[1,1,1],[1,0,1],[1,1,1]], minFloor: 1, easyOk: true },   // Ring 8（ループ）
    { grid: [[1,1,1],[1,1,1],[1,1,1]], minFloor: 2, easyOk: true },   // Full 9
    // 追加パターン
    { grid: [[1,1,1],[1,0,1],[1,1,0]], minFloor: 1, easyOk: true },   // C-shape 7（ループ）
    { grid: [[0,1,1],[1,1,0],[1,1,1]], minFloor: 1, easyOk: true },   // S-shape 7（ループ）
  ];

  // 階層・難易度に応じたテンプレートフィルタ
  const available = TEMPLATES.filter((t) =>
    g.floor >= t.minFloor && (g.dungeonMode !== "easy" || t.easyOk)
  );
  const chosen = available.length > 0 ? available : TEMPLATES.slice(0, 4); // フォールバック
  const template = chosen[Math.floor(Math.random() * chosen.length)].grid;
  const rooms: { x: number; y: number; w: number; h: number }[] = [];
  const gridRoomIdx: (number | null)[][] = Array.from({ length: GRID_ROWS }, () => new Array(GRID_COLS).fill(null));

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (!template[row][col]) continue;
      const cellX = col * CELL_W;
      const cellY = row * CELL_H;
      // 部屋サイズ: セル内にマージン2以上で収まるランダムサイズ
      const maxRW = Math.min(CELL_W - 3, 9);
      const maxRH = Math.min(CELL_H - 3, 6);
      const rw = 4 + Math.floor(Math.random() * Math.max(1, maxRW - 3));
      const rh = 3 + Math.floor(Math.random() * Math.max(1, maxRH - 2));
      // セル内でランダム配置（マージン2確保）
      const offX = 2 + Math.floor(Math.random() * Math.max(1, CELL_W - rw - 3));
      const offY = 2 + Math.floor(Math.random() * Math.max(1, CELL_H - rh - 3));
      const rx = Math.max(1, Math.min(MW - rw - 1, cellX + offX));
      const ry = Math.max(1, Math.min(MH - rh - 1, cellY + offY));
      rooms.push({ x: rx, y: ry, w: rw, h: rh });
      gridRoomIdx[row][col] = rooms.length - 1;
      for (let y = ry; y < ry + rh; y++)
        for (let x = rx; x < rx + rw; x++) m[y][x] = R;
    }
  }
  g.rooms = rooms;

  // ── 隣接セル間をL字廊下で接続 ──────────────────────────────────
  const carveH = (y: number, x1: number, x2: number) => {
    const step = x1 <= x2 ? 1 : -1;
    for (let x = x1; x !== x2 + step; x += step) {
      if (x >= 0 && x < MW && m[y][x] === W) m[y][x] = C;
    }
  };
  const carveV = (x: number, y1: number, y2: number) => {
    const step = y1 <= y2 ? 1 : -1;
    for (let y = y1; y !== y2 + step; y += step) {
      if (y >= 0 && y < MH && m[y][x] === W) m[y][x] = C;
    }
  };

  /** 部屋の辺から廊下接続点を1つ選ぶ（角を避けて辺の内側） */
  function pickExit(room: { x: number; y: number; w: number; h: number }, side: string): { x: number; y: number } {
    switch (side) {
      case "top":    return { x: room.x + 1 + Math.floor(Math.random() * Math.max(1, room.w - 2)), y: room.y - 1 };
      case "bottom": return { x: room.x + 1 + Math.floor(Math.random() * Math.max(1, room.w - 2)), y: room.y + room.h };
      case "left":   return { x: room.x - 1, y: room.y + 1 + Math.floor(Math.random() * Math.max(1, room.h - 2)) };
      case "right":  return { x: room.x + room.w, y: room.y + 1 + Math.floor(Math.random() * Math.max(1, room.h - 2)) };
      default:       return { x: room.x, y: room.y };
    }
  }

  const connected = new Set<string>();
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const ri = gridRoomIdx[row][col];
      if (ri === null) continue;
      // 右隣
      if (col + 1 < GRID_COLS && gridRoomIdx[row][col + 1] !== null) {
        const rj = gridRoomIdx[row][col + 1]!;
        const ck = `${Math.min(ri, rj)}-${Math.max(ri, rj)}`;
        if (!connected.has(ck)) {
          connected.add(ck);
          const eA = pickExit(rooms[ri], "right");
          const eB = pickExit(rooms[rj], "left");
          const midX = Math.floor((eA.x + eB.x) / 2);
          carveH(eA.y, eA.x, midX);
          carveV(midX, eA.y, eB.y);
          carveH(eB.y, midX, eB.x);
        }
      }
      // 下隣
      if (row + 1 < GRID_ROWS && gridRoomIdx[row + 1][col] !== null) {
        const rj = gridRoomIdx[row + 1][col]!;
        const ck = `${Math.min(ri, rj)}-${Math.max(ri, rj)}`;
        if (!connected.has(ck)) {
          connected.add(ck);
          const eA = pickExit(rooms[ri], "bottom");
          const eB = pickExit(rooms[rj], "top");
          const midY = Math.floor((eA.y + eB.y) / 2);
          carveV(eA.x, eA.y, midY);
          carveH(midY, eA.x, eB.x);
          carveV(eB.x, midY, eB.y);
        }
      }
    }
  }

  // ── ショップ部屋・モンスターハウス選択 ──
  // ショップ: 隣接部屋が1つだけの部屋（行き止まり=出口1つ）を優先
  let shopRoomIdx: number | null = null;
  let monsterHouseRoomIdx: number | null = null;

  if (g.dungeonMode === "hard" && rooms.length >= 4) {
    // モンスターハウスは最低5×5以上の部屋（敵とアイテムが収まるように）
    const mhCandidates = rooms.map((_, i) => i)
      .filter((i) => i !== 0 && i !== rooms.length - 1)
      .filter((i) => rooms[i].w >= 5 && rooms[i].h >= 5);
    if (mhCandidates.length > 0) monsterHouseRoomIdx = mhCandidates[Math.floor(Math.random() * mhCandidates.length)];
  }

  if (g.floor >= 2 && rooms.length >= 3) {
    // 隣接数を計算
    const adjCount = new Map<number, number>();
    connected.forEach((ck) => {
      const [a, b] = ck.split("-").map(Number);
      adjCount.set(a, (adjCount.get(a) ?? 0) + 1);
      adjCount.set(b, (adjCount.get(b) ?? 0) + 1);
    });
    // ショップは行き止まり部屋（隣接数1）のみ選択（中継部屋の封鎖は詰みの原因）
    // 行き止まり部屋（隣接数1）を優先、なければ隣接数2以上も候補
    const shopBase = rooms.map((_, i) => i)
      .filter((i) => i !== 0 && i !== rooms.length - 1 && i !== monsterHouseRoomIdx)
      .filter((i) => rooms[i].w >= 5 && rooms[i].h >= 5);
    const leafShops = shopBase.filter((i) => (adjCount.get(i) ?? 0) === 1);
    const candidates = leafShops.length > 0 ? leafShops : shopBase;
    if (candidates.length > 0) {
      shopRoomIdx = candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  // 後処理: 1マス行き止まり廊下を除去
  let cleaned = true;
  while (cleaned) {
    cleaned = false;
    for (let y = 1; y < MH - 1; y++) {
      for (let x = 1; x < MW - 1; x++) {
        if (m[y][x] !== C) continue;
        let neighbors = 0;
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
          if (m[y + dy][x + dx] !== W) neighbors++;
        }
        if (neighbors <= 1) { m[y][x] = W; cleaned = true; }
      }
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
    const cnt = 2 + Math.floor(Math.random() * 2) + (g.floor >= 3 ? 1 : 0);
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
    // アイテムと重ならない（通常アイテム + ショップアイテム）
    if (itemPositions.has(`${tx},${ty}`)) continue;
    if (g.shopItems.find((s) => s.x === tx && s.y === ty)) continue;
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
    // 店主配置: 入口の壁沿いに1歩ずらす（壁に接するタイルを優先）
    let skX = entranceX;
    let skY = entranceY;
    // 壁沿い方向（廊下方向と垂直）に1歩ずらす
    const perpDirs: [number, number][] = corridorDx !== 0
      ? [[0, -1], [0, 1]]
      : [[-1, 0], [1, 0]];
    for (const [pdx, pdy] of perpDirs) {
      const nx = entranceX + pdx;
      const ny = entranceY + pdy;
      if (nx >= shopRoom.x && nx < shopRoom.x + shopRoom.w &&
          ny >= shopRoom.y && ny < shopRoom.y + shopRoom.h &&
          m[ny][nx] === R &&
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
