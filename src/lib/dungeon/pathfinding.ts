import type { TileType, Enemy } from "./types";
import { MW, MH } from "./constants";

type Pos = { x: number; y: number };

function h(a: Pos, b: Pos): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * A* でスタートからゴールまでの経路を返す。
 * 戻り値にスタートは含まれず、ゴールを含む。経路なしは空配列。
 * enemies はゴール以外の通行不可タイルとして扱う。
 */
export function findPath(
  map: TileType[][],
  start: Pos,
  goal: Pos,
  enemies: Enemy[],
): Pos[] {
  const ks = (x: number, y: number) => `${x},${y}`;
  const enemySet = new Set(enemies.map((e) => ks(e.x, e.y)));
  const goalKey = ks(goal.x, goal.y);
  const startKey = ks(start.x, start.y);

  type Node = { x: number; y: number; g: number; f: number };
  const open: Node[] = [{ x: start.x, y: start.y, g: 0, f: h(start, goal) }];
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startKey, 0]]);

  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

  while (open.length > 0) {
    // 最小 f を持つノードを取り出す
    let bestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bestIdx].f) bestIdx = i;
    }
    const cur = open.splice(bestIdx, 1)[0];
    const curKey = ks(cur.x, cur.y);

    if (curKey === goalKey) {
      const path: Pos[] = [];
      let k = curKey;
      while (cameFrom.has(k)) {
        const [px, py] = k.split(",").map(Number);
        path.unshift({ x: px, y: py });
        k = cameFrom.get(k)!;
      }
      return path;
    }

    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) continue;
      if (map[ny][nx] === 0) continue; // 壁
      const nk = ks(nx, ny);
      // ゴール以外の敵タイルは通行不可
      if (enemySet.has(nk) && nk !== goalKey) continue;
      const tentG = cur.g + 1;
      if (tentG < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, curKey);
        gScore.set(nk, tentG);
        open.push({ x: nx, y: ny, g: tentG, f: tentG + h({ x: nx, y: ny }, goal) });
      }
    }
  }

  return [];
}
