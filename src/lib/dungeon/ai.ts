import type { GameState, Room, Enemy } from "./types";
import { W, C, R } from "./types";
import { MW, MH } from "./constants";

export function adj(ax: number, ay: number, bx: number, by: number): boolean {
  return Math.abs(ax - bx) + Math.abs(ay - by) === 1;
}

export function getRoom(rooms: Room[], x: number, y: number): Room | undefined {
  return rooms.find((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
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
  const queue: [number, number, number, number][] = [];
  for (const [dx, dy] of [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ]) {
    const nx = sx + dx;
    const ny = sy + dy;
    if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) continue;
    if (g.map[ny][nx] === W) continue;
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
    for (const [dx, dy] of [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ]) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) continue;
      if (g.map[ny][nx] === W) continue;
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
        nx >= 0 &&
        nx < MW &&
        ny >= 0 &&
        ny < MH &&
        g.map[ny][nx] !== W &&
        !g.enemies.find((o) => o.id !== e.id && o.x === nx && o.y === ny);
      if (canGo) {
        e.x = nx;
        e.y = ny;
        e.stuckCount = 0;
        return;
      }
      // 進めない
      e.stuckCount = (e.stuckCount || 0) + 1;
      if (e.stuckCount >= 3) {
        // Uターン
        e.lastDx = -e.lastDx;
        e.lastDy = -e.lastDy;
        e.stuckCount = 0;
        e.wanderTarget = null;
        const ux = e.x + e.lastDx;
        const uy = e.y + e.lastDy;
        if (
          ux >= 0 &&
          ux < MW &&
          uy >= 0 &&
          uy < MH &&
          g.map[uy][ux] !== W &&
          !g.enemies.find((o) => o.id !== e.id && o.x === ux && o.y === uy)
        ) {
          e.x = ux;
          e.y = uy;
        }
      }
      return;
    }
    // lastDx がない → 下の部屋ロジックへ
  }

  // ── 部屋内：廊下入口をBFSで目指す ──
  e.stuckCount = 0;

  if (!e.wanderTarget || (e.x === e.wanderTarget.x && e.y === e.wanderTarget.y)) {
    const entrances = getAllCorridorEntrances(g);
    if (entrances.length === 0) {
      e.wanderTarget = null;
      return;
    }
    const candidates = entrances.filter((t) => !(t.x === e.x && t.y === e.y));
    if (candidates.length === 0) {
      e.wanderTarget = null;
      return;
    }
    e.wanderTarget = candidates[Math.floor(Math.random() * candidates.length)];
  }

  const step = bfsStep(g, e.x, e.y, e.wanderTarget.x, e.wanderTarget.y, e.id);
  if (step) {
    const [nx, ny] = step;
    e.lastDx = nx - e.x;
    e.lastDy = ny - e.y;
    e.x = nx;
    e.y = ny;
  } else {
    e.wanderTarget = null;
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
    // 鈍足: 1ターンおきに行動
    if ((e.slowTurns ?? 0) > 0) {
      if (e.slowSkip) {
        e.slowSkip = false;
        if (e.slowTurns! > 0) e.slowTurns!--;
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

    // アラート判定：同じ部屋 or 隣接でプレイヤーを認識
    // このターンに初めて認識した場合は行動しない（移動＋攻撃の2ターン行動を防ぐ）
    if (!e.alert) {
      if (sameRoom(g.rooms, e.x, e.y, px, py) || adj(e.x, e.y, px, py)) {
        e.alert = true;
        continue;
      }
    }

    if (e.alert) {
      // ■ 認識中：プレイヤーへ直進追跡
      // 隣接していれば攻撃（移動せず攻撃のみ）
      if (adj(e.x, e.y, px, py)) {
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
      // 隣接していなければ移動のみ（攻撃しない）
      const dx = px - e.x;
      const dy = py - e.y;
      const moves: [number, number][] = [];
      if (dx !== 0) moves.push([Math.sign(dx), 0]);
      if (dy !== 0) moves.push([0, Math.sign(dy)]);
      if (Math.random() < 0.5) moves.reverse();
      if (dx !== 0 && dy !== 0) moves.push([Math.sign(dx), Math.sign(dy)]);
      for (const [ddx, ddy] of moves) {
        const nx = e.x + ddx;
        const ny = e.y + ddy;
        if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) continue;
        if (g.map[ny][nx] === W) continue;
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
  }

  // 倍速敵: 2回目の行動（攻撃のみ、移動はしない）
  for (const e of g.enemies) {
    if ((e.swiftTurns ?? 0) <= 0) continue;
    e.swiftTurns!--;
    if (e.sleeping || (e.sealed > 0) || (e.confused > 0)) continue;
    if (!e.alert) continue;
    if (adj(e.x, e.y, px, py)) {
      const dmg = Math.max(1, e.atk - 1 + Math.floor(Math.random() * 3));
      g.p.hp = Math.max(0, g.p.hp - dmg);
      results.push({ enemyHit: true, damage: dmg, killedPlayer: g.p.hp <= 0, enemy: e });
    }
  }

  return results;
}

export function adjEnemy(g: GameState): Enemy | undefined {
  return g.enemies.find((e) => adj(e.x, e.y, g.px, g.py) && !e.sleeping);
}
