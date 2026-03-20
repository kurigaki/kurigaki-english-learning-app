"use client";

import type { GameState } from "./types";
import { W, R } from "./types";
import { MW, MH, TILE, TRAP_ICONS } from "./constants";

export { TILE, MW, MH };

// Colors
const CWALL = "#0d0d1a";
const CWALL2 = "#111120";
const CROOM = "#1c1c2e";
const CROOM2 = "#202034";
const CCORR = "#161628";
const CCORR2 = "#1a1a30";
const CGRID = "#1f1f33";

function drawEmoji(
  ctx: CanvasRenderingContext2D,
  em: string,
  gx: number,
  gy: number,
  size: number
): void {
  ctx.font = `${size}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(em, gx * TILE + TILE / 2, gy * TILE + TILE / 2 + 1);
}

export function scrollToPlayer(canvas: HTMLCanvasElement, g: GameState, vpW: number, vpH: number): void {
  const cx = g.px * TILE + TILE / 2;
  const cy = g.py * TILE + TILE / 2;
  const sl = Math.max(0, Math.min(cx - vpW / 2, MW * TILE - vpW));
  const st = Math.max(0, Math.min(cy - vpH / 2, MH * TILE - vpH));
  canvas.style.transform = `translate(${-sl}px,${-st}px)`;
}

export function drawMap(canvas: HTMLCanvasElement, g: GameState, vpW: number, vpH: number): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      const t = g.map[y][x];
      const px2 = x * TILE;
      const py2 = y * TILE;
      if (t === W) {
        ctx.fillStyle = CWALL;
        ctx.fillRect(px2, py2, TILE, TILE);
        ctx.fillStyle = CWALL2;
        ctx.fillRect(px2 + 1, py2 + 1, TILE - 2, TILE - 2);
        // brick dot
        ctx.fillStyle = "#181828";
        ctx.fillRect(px2 + 2, py2 + 2, TILE - 4, TILE - 4);
      } else if (t === R) {
        ctx.fillStyle = CROOM;
        ctx.fillRect(px2, py2, TILE, TILE);
        ctx.fillStyle = CROOM2;
        ctx.fillRect(px2 + 1, py2 + 1, TILE - 2, TILE - 2);
        // subtle floor grid
        ctx.fillStyle = CGRID;
        if (x % 4 === 0) ctx.fillRect(px2, py2, 1, TILE);
        if (y % 4 === 0) ctx.fillRect(px2, py2, TILE, 1);
      } else {
        // corridor
        ctx.fillStyle = CCORR;
        ctx.fillRect(px2, py2, TILE, TILE);
        ctx.fillStyle = CCORR2;
        ctx.fillRect(px2, py2, TILE, TILE);
        // center strip highlight
        ctx.fillStyle = "#22223a";
        ctx.fillRect(px2 + TILE / 2 - 4, py2, 8, TILE);
        ctx.fillRect(px2, py2 + TILE / 2 - 4, TILE, 8);
      }
    }
  }

  // stairs
  if (g.stairsPos) {
    const { x, y } = g.stairsPos;
    ctx.fillStyle = "#1a2a3a";
    ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    drawEmoji(ctx, "🔽", x, y, TILE - 6);
  }

  // monster house room highlight
  if (g.monsterHouseRoomIdx != null && g.rooms[g.monsterHouseRoomIdx]) {
    const mhr = g.rooms[g.monsterHouseRoomIdx];
    ctx.fillStyle = "rgba(224,82,82,0.06)";
    ctx.fillRect(mhr.x * TILE, mhr.y * TILE, mhr.w * TILE, mhr.h * TILE);
  }

  // items
  for (const it of g.itemTiles) {
    ctx.fillStyle = "rgba(245,200,66,0.08)";
    ctx.fillRect(it.x * TILE, it.y * TILE, TILE, TILE);
    drawEmoji(ctx, "✨", it.x, it.y, TILE - 8);
  }

  // shop items
  if (g.shopItems) {
    for (const s of g.shopItems) {
      ctx.fillStyle = "rgba(82,200,150,0.12)";
      ctx.fillRect(s.x * TILE, s.y * TILE, TILE, TILE);
      drawEmoji(ctx, "🏪", s.x, s.y, TILE - 8);
    }
  }

  // traps (only visible ones shown)
  if (g.traps) {
    for (const tr of g.traps) {
      if (tr.visible) {
        ctx.fillStyle = "rgba(180,60,60,0.10)";
        ctx.fillRect(tr.x * TILE, tr.y * TILE, TILE, TILE);
        drawEmoji(ctx, TRAP_ICONS[tr.type] || "⚠️", tr.x, tr.y, TILE - 10);
      }
    }
  }

  // enemies
  for (const e of g.enemies) {
    if (e.alert && !e.sleeping) {
      ctx.fillStyle = "rgba(224,82,82,0.12)";
      ctx.fillRect(e.x * TILE, e.y * TILE, TILE, TILE);
    }
    if (e.sleeping) {
      ctx.fillStyle = "rgba(82,100,200,0.10)";
      ctx.fillRect(e.x * TILE, e.y * TILE, TILE, TILE);
      drawEmoji(ctx, e.icon, e.x, e.y, TILE - 6);
      // zz overlay
      ctx.font = "bold 9px sans-serif";
      ctx.fillStyle = "#8888cc";
      ctx.fillText("💤", e.x * TILE + TILE - 12, e.y * TILE + 6);
    } else {
      drawEmoji(ctx, e.icon, e.x, e.y, TILE - 4);
    }
    // hp bar
    const hpRatio = e.hp / e.mhp;
    ctx.fillStyle = "#300000";
    ctx.fillRect(e.x * TILE + 1, e.y * TILE + TILE - 5, TILE - 2, 4);
    ctx.fillStyle = hpRatio > 0.5 ? "#409030" : "#d04040";
    ctx.fillRect(e.x * TILE + 1, e.y * TILE + TILE - 5, Math.floor((TILE - 2) * hpRatio), 4);
  }

  // player
  {
    ctx.fillStyle = "rgba(124,106,247,0.15)";
    ctx.fillRect(g.px * TILE, g.py * TILE, TILE, TILE);
    drawEmoji(ctx, "🧙", g.px, g.py, TILE - 2);
  }

  scrollToPlayer(canvas, g, vpW, vpH);
}

export function getCanvasScrollOffset(canvas: HTMLCanvasElement): { tx: number; ty: number } {
  const m = canvas.style.transform.match(/translate\(([^,]+)px,([^)]+)px\)/);
  return { tx: m ? parseFloat(m[1]) : 0, ty: m ? parseFloat(m[2]) : 0 };
}
