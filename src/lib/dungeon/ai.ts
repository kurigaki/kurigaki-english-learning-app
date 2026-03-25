import type { GameState, Room, Enemy, Shopkeeper } from "./types";
import { W, C, R } from "./types";
import { MW, MH } from "./constants";

// 8方向隣接判定（ナナメ含む）: Chebyshev距離 = 1
export function adj(ax: number, ay: number, bx: number, by: number): boolean {
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by)) === 1;
}

// ナナメ移動のコーナーカット判定: 片方でも壁があれば不可
function canMoveDiag(g: GameState, fx: number, fy: number, dx: number, dy: number): boolean {
  const hBlocked = g.map[fy][fx + dx] === W;
  const vBlocked = g.map[fy + dy][fx] === W;
  return !(hBlocked || vBlocked);
}

export function getRoom(rooms: Room[], x: number, y: number): Room | undefined {
  return rooms.find((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
}

// プレイヤーが廊下入口にいる（部屋に隣接する廊下タイル）かつ敵がその部屋にいるか判定
// 「フロアから1歩出た廊下」では同部屋にいるのと同様に認識する
function isPlayerAtCorridorEntranceOfEnemyRoom(
  g: GameState,
  px: number, py: number,
  ex: number, ey: number,
): boolean {
  if (g.map[py][px] !== C) return false;            // プレイヤーが廊下タイルにいる
  const eRoom = getRoom(g.rooms, ex, ey);
  if (!eRoom) return false;                          // 敵が部屋にいる
  // プレイヤーの4近傍に敵の部屋タイルがあれば「廊下入口」
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]] as [number,number][]) {
    const nx = px + dx; const ny = py + dy;
    if (nx >= 0 && nx < MW && ny >= 0 && ny < MH &&
        nx >= eRoom.x && nx < eRoom.x + eRoom.w &&
        ny >= eRoom.y && ny < eRoom.y + eRoom.h) {
      return true;
    }
  }
  return false;
}

export function sameRoom(rooms: Room[], ax: number, ay: number, bx: number, by: number): boolean {
  const ra = getRoom(rooms, ax, ay);
  if (!ra) return false;
  return bx >= ra.x && bx < ra.x + ra.w && by >= ra.y && by < ra.y + ra.h;
}

export function getAllCorridorEntrances(g: GameState): { x: number; y: number }[] {
  const list: { x: number; y: number }[] = [];
  const seen = new Set<number>();
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      if (g.map[y][x] !== R) continue;
      let hasCorridor = false;
      for (const [dx, dy] of [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < MW && ny >= 0 && ny < MH && g.map[ny][nx] === C) {
          hasCorridor = true;
          break;
        }
      }
      if (hasCorridor) {
        const k = y * MW + x;
        if (!seen.has(k)) {
          seen.add(k);
          list.push({ x, y });
        }
      }
    }
  }
  return list;
}

export function bfsStep(
  g: GameState,
  sx: number,
  sy: number,
  gx: number,
  gy: number,
  skipId: number
): [number, number] | null {
  if (sx === gx && sy === gy) return null;
  const key = (x: number, y: number) => y * MW + x;
  const visited = new Set<number>([key(sx, sy)]);
  // queue: [x, y, firstStepX, firstStepY]
  // diagMove に応じて4方向 or 8方向で経路探索
  const DIRS8: [number, number][] = g.diagMove
    ? [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]]
    : [[0, -1], [0, 1], [-1, 0], [1, 0]];
  const queue: [number, number, number, number][] = [];
  for (const [dx, dy] of DIRS8) {
    const nx = sx + dx;
    const ny = sy + dy;
    if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) continue;
    if (g.map[ny][nx] === W) continue;
    if (dx !== 0 && dy !== 0 && !canMoveDiag(g, sx, sy, dx, dy)) continue;
    if (g.enemies.find((o) => o.id !== skipId && o.x === nx && o.y === ny)) continue;
    if (!visited.has(key(nx, ny))) {
      visited.add(key(nx, ny));
      queue.push([nx, ny, nx, ny]);
    }
  }
  let head = 0;
  while (head < queue.length) {
    const [cx, cy, fx, fy] = queue[head++];
    if (cx === gx && cy === gy) return [fx, fy];
    for (const [dx, dy] of DIRS8) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) continue;
      if (g.map[ny][nx] === W) continue;
      if (dx !== 0 && dy !== 0 && !canMoveDiag(g, cx, cy, dx, dy)) continue;
      if (!visited.has(key(nx, ny))) {
        visited.add(key(nx, ny));
        queue.push([nx, ny, fx, fy]);
      }
    }
  }
  return null;
}

export function wanderMove(g: GameState, e: Enemy): void {
  const curTile = g.map[e.y][e.x];

  if (curTile === C) {
    // ── 廊下内：直進する ──
    if (e.lastDx !== undefined && e.lastDy !== undefined) {
      const nx = e.x + e.lastDx;
      const ny = e.y + e.lastDy;
      const canGo =
        nx >= 0 && nx < MW && ny >= 0 && ny < MH &&
        g.map[ny][nx] !== W &&
        !g.enemies.find((o) => o.id !== e.id && o.x === nx && o.y === ny);

      if (canGo) {
        // 部屋に入ったらlastDxリセット（部屋ロジックに切り替え）
        if (g.map[ny][nx] === R) {
          e.lastDx = undefined;
          e.lastDy = undefined;
          e.wanderTarget = null;
        }
        e.x = nx;
        e.y = ny;
        e.stuckCount = 0;
        return;
      }

      // 進めない → 分岐を探す
      const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      // 現在の方向と逆方向以外で進める方向を探す
      const altDirs = dirs.filter(([dx, dy]) => {
        if (dx === -e.lastDx! && dy === -e.lastDy!) return false; // Uターンは最終手段
        const ax = e.x + dx, ay = e.y + dy;
        return ax >= 0 && ax < MW && ay >= 0 && ay < MH &&
          g.map[ay][ax] !== W && !g.enemies.find((o) => o.id !== e.id && o.x === ax && o.y === ay);
      });
      if (altDirs.length > 0) {
        const [dx, dy] = altDirs[Math.floor(Math.random() * altDirs.length)];
        e.lastDx = dx;
        e.lastDy = dy;
        e.x = e.x + dx;
        e.y = e.y + dy;
        e.stuckCount = 0;
        return;
      }
      // 分岐もない → Uターン
      e.lastDx = -e.lastDx;
      e.lastDy = -e.lastDy;
      e.stuckCount = 0;
      e.wanderTarget = null;
      const ux = e.x + e.lastDx;
      const uy = e.y + e.lastDy;
      if (ux >= 0 && ux < MW && uy >= 0 && uy < MH &&
          g.map[uy][ux] !== W && !g.enemies.find((o) => o.id !== e.id && o.x === ux && o.y === uy)) {
        e.x = ux;
        e.y = uy;
      }
      return;
    }
    // lastDx がない → 下の部屋ロジックへ
  }

  // ── 部屋内：最も近い廊下出口をBFSで目指す ──
  e.stuckCount = 0;

  if (!e.wanderTarget || (e.x === e.wanderTarget.x && e.y === e.wanderTarget.y)) {
    const myRoom = getRoom(g.rooms, e.x, e.y);
    let candidates: { x: number; y: number }[];
    if (myRoom) {
      const exits: { x: number; y: number }[] = [];
      for (let ry = myRoom.y; ry < myRoom.y + myRoom.h; ry++) {
        for (let rx = myRoom.x; rx < myRoom.x + myRoom.w; rx++) {
          if (g.map[ry][rx] !== R) continue;
          for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
            if (rx + dx >= 0 && rx + dx < MW && ry + dy >= 0 && ry + dy < MH && g.map[ry + dy][rx + dx] === C) {
              exits.push({ x: rx, y: ry });
              break;
            }
          }
        }
      }
      candidates = exits.filter((t) => !(t.x === e.x && t.y === e.y));
    } else {
      const entrances = getAllCorridorEntrances(g);
      candidates = entrances.filter((t) => !(t.x === e.x && t.y === e.y));
    }
    if (candidates.length === 0) {
      e.wanderTarget = null;
    } else {
      // 最も近い出口を選択（無駄な動きを防止）
      candidates.sort((a, b) => {
        const da = Math.abs(a.x - e.x) + Math.abs(a.y - e.y);
        const db = Math.abs(b.x - e.x) + Math.abs(b.y - e.y);
        return da - db;
      });
      e.wanderTarget = candidates[0];
    }
  }

  if (e.wanderTarget) {
    const step = bfsStep(g, e.x, e.y, e.wanderTarget.x, e.wanderTarget.y, e.id);
    if (step) {
      const [nx, ny] = step;
      e.lastDx = nx - e.x;
      e.lastDy = ny - e.y;
      e.x = nx;
      e.y = ny;
      return;
    }
    e.wanderTarget = null;
  }

  // フォールバック: BFS失敗時はランダムに移動（停止しない）
  const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  const shuffled = dirs.sort(() => Math.random() - 0.5);
  for (const [dx, dy] of shuffled) {
    const nx = e.x + dx, ny = e.y + dy;
    if (nx >= 0 && nx < MW && ny >= 0 && ny < MH &&
        g.map[ny][nx] !== W &&
        !g.enemies.find((o) => o.id !== e.id && o.x === nx && o.y === ny) &&
        !(nx === g.px && ny === g.py)) {
      e.x = nx;
      e.y = ny;
      e.lastDx = dx;
      e.lastDy = dy;
      return;
    }
  }
}

export type EnemyMoveResult = {
  enemyHit: boolean;
  damage: number;
  killedPlayer: boolean;
  enemy: Enemy;
};

export function moveEnemies(
  g: GameState
): EnemyMoveResult[] {
  const px = g.px;
  const py = g.py;
  const results: EnemyMoveResult[] = [];

  for (const e of g.enemies) {
    if (e.sleeping) continue;
    // justSlowed: 鈍足付与ターンは行動しない
    if (e.justSlowed) {
      e.justSlowed = false;
      continue;
    }
    // 永続鈍足（slowed）: 1ターンおきに行動
    if (e.slowed) {
      if (e.slowSkip) {
        e.slowSkip = false;
        continue;
      } else {
        e.slowSkip = true;
        // 以降に通常行動へ
      }
    }
    // 後方互換: 従来の slowTurns（一時的な鈍足）
    if (!e.slowed && (e.slowTurns ?? 0) > 0) {
      if (e.slowSkip) {
        e.slowSkip = false;
        if ((e.slowTurns ?? 0) > 0) e.slowTurns!--;
        continue;
      } else {
        e.slowSkip = true;
      }
    }
    // 起床したターンは行動しない
    if (e.justWoke) {
      e.justWoke = false;
      continue;
    }
    // 封印カウントダウン
    if (e.sealed > 0) {
      e.sealed--;
      continue;
    }
    // 混乱：ランダム方向に動く。プレイヤーの方向なら攻撃する
    if (e.confused > 0) {
      e.confused--;
      const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const [ddx, ddy] = dirs[Math.floor(Math.random() * 4)];
      const nx = e.x + ddx;
      const ny = e.y + ddy;
      if (nx === px && ny === py) {
        // 偶然プレイヤー方向に向かって攻撃
        const dmg = Math.max(1, e.atk - 1 + Math.floor(Math.random() * 3));
        g.p.hp = Math.max(0, g.p.hp - dmg);
        results.push({ enemyHit: true, damage: dmg, killedPlayer: g.p.hp <= 0, enemy: e });
      } else if (
        nx >= 0 && nx < MW && ny >= 0 && ny < MH &&
        g.map[ny][nx] !== W &&
        !g.enemies.find((o) => o.id !== e.id && o.x === nx && o.y === ny)
      ) {
        e.x = nx;
        e.y = ny;
      }
      continue;
    }

    // アラート判定：同じ部屋 or 隣接 or 廊下入口でプレイヤーを認識
    // このターンに初めて認識した場合は行動しない（移動＋攻撃の2ターン行動を防ぐ）
    if (!e.alert) {
      if (sameRoom(g.rooms, e.x, e.y, px, py) || adj(e.x, e.y, px, py) ||
          isPlayerAtCorridorEntranceOfEnemyRoom(g, px, py, e.x, e.y)) {
        e.alert = true;
        continue;
      }
    }

    if (e.alert) {
      // ■ 認識中：プレイヤーへ直進追跡
      // 隣接していれば攻撃（移動せず攻撃のみ）
      if (adj(e.x, e.y, px, py)) {
        const ddx = px - e.x;
        const ddy = py - e.y;
        const isDiag = ddx !== 0 && ddy !== 0;
        // ナナメ攻撃: diagMove OFF → 斜め位置からは攻撃せず移動へ
        // ナナメ攻撃: コーナーカット防止（壁があれば攻撃不可）
        let canAttack = true;
        if (isDiag) {
          if (!g.diagMove) {
            canAttack = false;
          } else {
            const hBlocked = g.map[e.y][e.x + ddx] === W;
            const vBlocked = g.map[e.y + ddy][e.x] === W;
            if (hBlocked || vBlocked) canAttack = false;
          }
        }
        if (canAttack) {
          const dmg = Math.max(1, e.atk - 1 + Math.floor(Math.random() * 3));
          g.p.hp = Math.max(0, g.p.hp - dmg);
          results.push({
            enemyHit: true,
            damage: dmg,
            killedPlayer: g.p.hp <= 0,
            enemy: e,
          });
          continue;
        }
        // canAttack=false: 下の移動ロジックへ落ちる
      }
      // 隣接していなければ移動のみ（攻撃しない）
      const dx = px - e.x;
      const dy = py - e.y;
      const moves: [number, number][] = [];
      // ナナメ方向を最優先（diagMove ON時のみ）
      if (g.diagMove && dx !== 0 && dy !== 0) moves.push([Math.sign(dx), Math.sign(dy)]);
      // 4方向をランダム順で次の候補に
      const cardinals: [number, number][] = [];
      if (dx !== 0) cardinals.push([Math.sign(dx), 0]);
      if (dy !== 0) cardinals.push([0, Math.sign(dy)]);
      if (Math.random() < 0.5) cardinals.reverse();
      moves.push(...cardinals);
      for (const [ddx, ddy] of moves) {
        const nx = e.x + ddx;
        const ny = e.y + ddy;
        if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) continue;
        if (g.map[ny][nx] === W) continue;
        // ナナメ移動のコーナーチェック
        if (ddx !== 0 && ddy !== 0 && !canMoveDiag(g, e.x, e.y, ddx, ddy)) continue;
        if (g.enemies.find((o) => o.id !== e.id && o.x === nx && o.y === ny)) continue;
        // プレイヤーのタイルには移動不可（攻撃は隣接チェック時のみ）
        if (nx === px && ny === py) continue;
        e.x = nx;
        e.y = ny;
        break;
      }
    } else {
      // ■ 非認識中：廊下出口を目指して徘徊
      wanderMove(g, e);
    }

    // プレイヤーが視野外になったらアラートをリセット
    // 同じ部屋・隣接・廊下入口のいずれでもない → 追跡をやめる
    if (e.alert &&
        !sameRoom(g.rooms, e.x, e.y, px, py) &&
        !adj(e.x, e.y, px, py) &&
        !isPlayerAtCorridorEntranceOfEnemyRoom(g, px, py, e.x, e.y)) {
      e.alert = false;
    }
  }

  // 倍速敵: 2回目の行動（攻撃のみ、移動はしない）
  for (const e of g.enemies) {
    if ((e.swiftTurns ?? 0) <= 0) continue;
    e.swiftTurns!--;
    if (e.sleeping || (e.sealed > 0) || (e.confused > 0)) continue;
    if (!e.alert) continue;
    if (adj(e.x, e.y, px, py)) {
      const ddx2 = px - e.x;
      const ddy2 = py - e.y;
      const isDiag2 = ddx2 !== 0 && ddy2 !== 0;
      // diagMove OFF → 斜め攻撃不可、コーナーカットも不可
      const blocked2 = isDiag2 && (!g.diagMove || g.map[e.y][e.x + ddx2] === W || g.map[e.y + ddy2][e.x] === W);
      if (!blocked2) {
        const dmg = Math.max(1, e.atk - 1 + Math.floor(Math.random() * 3));
        g.p.hp = Math.max(0, g.p.hp - dmg);
        results.push({ enemyHit: true, damage: dmg, killedPlayer: g.p.hp <= 0, enemy: e });
      }
    }
    // 追加行動後も視野外ならアラートをリセット
    if (e.alert &&
        !sameRoom(g.rooms, e.x, e.y, px, py) &&
        !adj(e.x, e.y, px, py) &&
        !isPlayerAtCorridorEntranceOfEnemyRoom(g, px, py, e.x, e.y)) {
      e.alert = false;
    }
  }

  return results;
}

export function adjEnemy(g: GameState): Enemy | undefined {
  return g.enemies.find((e) => adj(e.x, e.y, g.px, g.py) && !e.sleeping);
}

// プレイヤーの向きの先にいる敵を返す（方向攻撃用）
export function adjEnemyInDir(g: GameState): Enemy | undefined {
  const { dx, dy } = g.playerDir ?? { dx: 0, dy: 1 };
  return g.enemies.find((e) => e.x === g.px + dx && e.y === g.py + dy && !e.sleeping);
}

// プレイヤーの向きの先に店主がいるか
export function adjShopkeeperInDir(g: GameState): Shopkeeper | null {
  if (!g.shopkeeper) return null;
  const { dx, dy } = g.playerDir ?? { dx: 0, dy: 1 };
  if (g.shopkeeper.x === g.px + dx && g.shopkeeper.y === g.py + dy) return g.shopkeeper;
  return null;
}

// 店主が隣接しているか
export function adjShopkeeper(g: GameState): Shopkeeper | null {
  if (!g.shopkeeper) return null;
  if (adj(g.shopkeeper.x, g.shopkeeper.y, g.px, g.py)) return g.shopkeeper;
  return null;
}

export type ShopkeeperMoveResult = {
  hit: boolean;
  damage: number;
  killedPlayer: boolean;
};

/**
 * 店主AI — 毎ターン呼ばれる
 * - 通常時（未払いなし）: 定位置で待機（動かない）
 * - 通常時（未払いあり）: 廊下入口に移動して出口を塞ぐ
 * - 敵化時: プレイヤーをBFS追跡、隣接で攻撃（倍速: 1ターンに2回行動）
 *   ※ 移動を2回した後は攻撃しない（移動1+攻撃1はOK）
 */
export function moveShopkeeper(g: GameState): ShopkeeperMoveResult[] {
  const sk = g.shopkeeper;
  if (!sk || sk.hp <= 0) return [];

  // 非敵化時
  if (!sk.hostile) {
    if (g.stolenItems.length > 0) {
      // 未払いあり: 出口封鎖（入口タイルに移動）
      if (sk.x !== sk.entranceX || sk.y !== sk.entranceY) {
        if (!(g.px === sk.entranceX && g.py === sk.entranceY)) {
          const step = bfsStep(g, sk.x, sk.y, sk.entranceX, sk.entranceY, -1);
          if (step) { sk.x = step[0]; sk.y = step[1]; }
        }
      }
    } else {
      // 未払いなし: ホーム位置（出口の1歩横）に戻る
      if (sk.x !== sk.homeX || sk.y !== sk.homeY) {
        if (!(g.px === sk.homeX && g.py === sk.homeY)) {
          const step = bfsStep(g, sk.x, sk.y, sk.homeX, sk.homeY, -1);
          if (step) { sk.x = step[0]; sk.y = step[1]; }
        }
      }
    }
    return [];
  }

  const results: ShopkeeperMoveResult[] = [];
  const px = g.px;
  const py = g.py;

  // diagMove に応じた方向セット（通常敵と同じルール）
  const DIRS: [number, number][] = g.diagMove
    ? [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]]
    : [[0, -1], [0, 1], [-1, 0], [1, 0]];

  // 隣接判定（diagMove OFF 時はナナメ隣接を無視）
  const isAdj = (ax: number, ay: number, bx: number, by: number): boolean => {
    const ddx = Math.abs(ax - bx);
    const ddy = Math.abs(ay - by);
    if (ddx > 1 || ddy > 1) return false;
    if (ddx === 0 && ddy === 0) return false;
    if (!g.diagMove && ddx !== 0 && ddy !== 0) return false; // ナナメ隣接は不可
    // ナナメ時はコーナーカットチェック
    if (ddx !== 0 && ddy !== 0) {
      if (g.map[ay][ax + (bx - ax)] === W || g.map[ay + (by - ay)][ax] === W) return false;
    }
    return true;
  };

  // 敵化店主: 倍速（2回行動）。移動した後は攻撃不可（移動+移動 or 攻撃+攻撃）
  let moved = false;
  for (let action = 0; action < 2; action++) {
    if (sk.hp <= 0) break;

    // 隣接していれば攻撃（ただし移動済みなら攻撃不可→ターン終了）
    if (isAdj(sk.x, sk.y, px, py)) {
      if (moved) break; // 移動後は攻撃しない
      const dmg = Math.max(1, sk.atk - 1 + Math.floor(Math.random() * 3));
      g.p.hp = Math.max(0, g.p.hp - dmg);
      results.push({ hit: true, damage: dmg, killedPlayer: g.p.hp <= 0 });
      continue;
    }

    // 隣接していなければ移動（1アクション消費）
    const key = (x: number, y: number) => y * MW + x;
    const visited = new Set<number>([key(sk.x, sk.y)]);
    const queue: [number, number, number, number][] = [];
    for (const [dx, dy] of DIRS) {
      const nx = sk.x + dx;
      const ny = sk.y + dy;
      if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) continue;
      if (g.map[ny][nx] === W) continue;
      // ナナメ移動時のコーナーカット防止
      if (dx !== 0 && dy !== 0 && !canMoveDiag(g, sk.x, sk.y, dx, dy)) continue;
      if (g.enemies.find((o) => o.x === nx && o.y === ny)) continue;
      if (nx === px && ny === py) continue;
      if (!visited.has(key(nx, ny))) {
        visited.add(key(nx, ny));
        queue.push([nx, ny, nx, ny]);
      }
    }
    let head = 0;
    let nextStep: [number, number] | null = null;
    while (head < queue.length) {
      const [cx, cy, fx, fy] = queue[head++];
      if (cx === px && cy === py) { nextStep = [fx, fy]; break; }
      for (const [dx, dy] of DIRS) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) continue;
        if (g.map[ny][nx] === W) continue;
        if (dx !== 0 && dy !== 0 && !canMoveDiag(g, cx, cy, dx, dy)) continue;
        if (!visited.has(key(nx, ny))) {
          visited.add(key(nx, ny));
          queue.push([nx, ny, fx, fy]);
        }
      }
    }
    if (nextStep) {
      sk.x = nextStep[0];
      sk.y = nextStep[1];
      moved = true;
    }
  }

  return results;
}
