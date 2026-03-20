"use client";

import type { GameState, Enemy } from "./types";
import { W, R } from "./types";
import { MW, MH, TILE } from "./constants";

export { TILE, MW, MH };

// ── Canvas helpers ────────────────────────────────────────────────────────────
function fr(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number, y: number, w: number, h: number,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function fc(
  ctx: CanvasRenderingContext2D,
  color: string,
  cx: number, cy: number, r: number,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

// ── Map Tiles ─────────────────────────────────────────────────────────────────
function drawWall(ctx: CanvasRenderingContext2D, tx: number, ty: number): void {
  const x = tx * TILE, y = ty * TILE;
  // ベース
  fr(ctx, "#0e0c18", x, y, TILE, TILE);
  // レンガ2段（互い違い）
  const bh = 14, bw = 14;
  for (let row = 0; row < 3; row++) {
    const oy = y + row * bh;
    if (oy >= y + TILE) break;
    const off = row % 2 === 0 ? 1 : 8;
    for (let col = 0; col < 3; col++) {
      const ox = x + col * bw + off;
      const fx = Math.max(x, ox);
      const fw = Math.min(ox + bw - 2, x + TILE - 1) - fx;
      const fh = Math.min(bh - 2, y + TILE - 1 - oy);
      if (fw <= 0 || fh <= 0) continue;
      fr(ctx, "#221e38", fx, oy + 1, fw, fh);   // レンガ面
      fr(ctx, "#2e2a48", fx, oy + 1, fw, 2);    // 上ハイライト
      fr(ctx, "#0a0916", fx, oy + fh, fw, 1);   // 下影
    }
  }
  // 壁上部のハイライト（床との境界を明確に）
  fr(ctx, "#332e52", x, y, TILE, 2);
}

function drawFloor(ctx: CanvasRenderingContext2D, tx: number, ty: number): void {
  const x = tx * TILE, y = ty * TILE;
  fr(ctx, "#171626", x, y, TILE, TILE);
  fr(ctx, "#1f1e30", x + 1, y + 1, TILE - 2, TILE - 2);
  // 石畳の縁
  fr(ctx, "#111020", x, y, TILE, 1);
  fr(ctx, "#111020", x, y, 1, TILE);
  fr(ctx, "#282638", x + 1, y + 1, TILE - 2, 1); // 内側上ハイライト
}

function drawCorridor(ctx: CanvasRenderingContext2D, tx: number, ty: number): void {
  const x = tx * TILE, y = ty * TILE;
  fr(ctx, "#0f0f1e", x, y, TILE, TILE);
  fr(ctx, "#181828", x + 5, y + 5, TILE - 10, TILE - 10);
}

// ── Stairs ────────────────────────────────────────────────────────────────────
function drawStairs(ctx: CanvasRenderingContext2D, tx: number, ty: number): void {
  const x = tx * TILE, y = ty * TILE;
  fr(ctx, "#0d1828", x, y, TILE, TILE);
  // 3段の階段（奥から手前へ）
  const steps = [
    { ox: 11, oy: 5,  w: 10, h: 5 },
    { ox: 7,  oy: 12, w: 16, h: 5 },
    { ox: 3,  oy: 19, w: 24, h: 5 },
  ];
  for (const s of steps) {
    fr(ctx, "#1a3858", x + s.ox,     y + s.oy,     s.w, s.h);   // 段の面
    fr(ctx, "#2a5888", x + s.ox,     y + s.oy,     s.w, 2);     // 上面（明るい）
    fr(ctx, "#0d2038", x + s.ox,     y + s.oy + s.h - 1, s.w, 1); // 下影
  }
  // 最上段の輝き
  fr(ctx, "#5a98c8", x + 11, y + 5, 10, 1);
}

// ── Items ─────────────────────────────────────────────────────────────────────
function drawItemTile(ctx: CanvasRenderingContext2D, tx: number, ty: number): void {
  const x = tx * TILE, y = ty * TILE;
  const cx = x + TILE / 2, cy = y + TILE / 2;
  ctx.fillStyle = "rgba(245,200,66,0.14)";
  ctx.fillRect(x, y, TILE, TILE);
  // ダイヤ形ジェム
  ctx.fillStyle = "#d4a820";
  ctx.beginPath();
  ctx.moveTo(cx,      cy - 9);
  ctx.lineTo(cx + 7,  cy - 2);
  ctx.lineTo(cx + 7,  cy + 3);
  ctx.lineTo(cx,      cy + 9);
  ctx.lineTo(cx - 7,  cy + 3);
  ctx.lineTo(cx - 7,  cy - 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f5c542";
  ctx.beginPath();
  ctx.moveTo(cx,      cy - 7);
  ctx.lineTo(cx + 5,  cy - 1);
  ctx.lineTo(cx + 5,  cy + 2);
  ctx.lineTo(cx,      cy + 7);
  ctx.lineTo(cx - 5,  cy + 2);
  ctx.lineTo(cx - 5,  cy - 1);
  ctx.closePath();
  ctx.fill();
  // ハイライト
  ctx.fillStyle = "#fff8b0";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 5); ctx.lineTo(cx + 3, cy - 1);
  ctx.lineTo(cx, cy + 3); ctx.lineTo(cx - 3, cy - 1);
  ctx.closePath();
  ctx.fill();
}

function drawShopItemTile(ctx: CanvasRenderingContext2D, tx: number, ty: number): void {
  const x = tx * TILE, y = ty * TILE;
  const cx = x + TILE / 2, cy = y + TILE / 2;
  ctx.fillStyle = "rgba(82,210,160,0.14)";
  ctx.fillRect(x, y, TILE, TILE);
  fc(ctx, "#b89020", cx, cy, 9);
  fc(ctx, "#f0c030", cx, cy, 7);
  fc(ctx, "#f8d84a", cx, cy - 1, 5);
  ctx.fillStyle = "#7a5a10";
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("G", cx, cy + 1);
}

// ── Traps ─────────────────────────────────────────────────────────────────────
function drawTrapTile(ctx: CanvasRenderingContext2D, tx: number, ty: number, type: string): void {
  const x = tx * TILE, y = ty * TILE;
  const cx = x + TILE / 2, cy = y + TILE / 2;
  ctx.fillStyle = "rgba(200,60,60,0.14)";
  ctx.fillRect(x, y, TILE, TILE);
  // 警告の×印
  ctx.strokeStyle = "#882222";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 7); ctx.lineTo(cx + 7, cy + 7);
  ctx.moveTo(cx + 7, cy - 7); ctx.lineTo(cx - 7, cy + 7);
  ctx.stroke();
  const icons: Record<string, string> = {
    damage: "⚡", sleep: "💤", warp: "🌀", hunger: "🍂",
  };
  ctx.font = `${TILE - 16}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(icons[type] ?? "⚠", cx, cy + 1);
}

// ── Player ────────────────────────────────────────────────────────────────────
function drawPlayer(ctx: CanvasRenderingContext2D, tx: number, ty: number): void {
  const x = tx * TILE, y = ty * TILE;
  const cx = x + TILE / 2;

  // 選択オーラ
  ctx.fillStyle = "rgba(120,100,255,0.18)";
  ctx.fillRect(x, y, TILE, TILE);

  // スタッフ（体の後ろ）
  fr(ctx, "#6644aa", x + 22, y + 7, 2, 21);
  fc(ctx, "#aa55ee", x + 23, y + 6, 3);
  fc(ctx, "#ddaaff", x + 23, y + 6, 1.5);

  // 帽子
  ctx.fillStyle = "#231577";
  ctx.beginPath();
  ctx.moveTo(cx, y + 1);
  ctx.lineTo(cx - 5, y + 9);
  ctx.lineTo(cx + 5, y + 9);
  ctx.closePath();
  ctx.fill();
  fr(ctx, "#2e1e99", cx - 7, y + 8, 14, 3); // つば
  fr(ctx, "#3828aa", cx - 6, y + 8, 12, 2); // つばハイライト

  // 顔
  fc(ctx, "#f5c898", cx, y + 16, 5);
  fc(ctx, "#f8d8b0", cx, y + 15, 3); // 顔ハイライト
  // 目
  fr(ctx, "#2a1a10", cx - 3, y + 15, 2, 2);
  fr(ctx, "#2a1a10", cx + 1, y + 15, 2, 2);
  fr(ctx, "#ffffff", cx - 3, y + 15, 1, 1);
  fr(ctx, "#ffffff", cx + 1, y + 15, 1, 1);

  // ローブ
  ctx.fillStyle = "#3d2db8";
  ctx.beginPath();
  ctx.moveTo(cx - 7, y + 20);
  ctx.lineTo(cx + 7, y + 20);
  ctx.lineTo(cx + 9, y + 29);
  ctx.lineTo(cx - 9, y + 29);
  ctx.closePath();
  ctx.fill();
  fr(ctx, "#4e3ecc", cx - 4, y + 20, 4, 9); // ローブハイライト
}

// ── Enemies ───────────────────────────────────────────────────────────────────
function drawMaml(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2;
  // 耳
  fc(ctx, "#e8b898", cx - 6, y + 9, 4);
  fc(ctx, "#e8b898", cx + 6, y + 9, 4);
  fc(ctx, "#f8c8b0", cx - 6, y + 9, 2);
  fc(ctx, "#f8c8b0", cx + 6, y + 9, 2);
  // 体
  ctx.fillStyle = "#c8a060";
  ctx.beginPath();
  ctx.ellipse(cx, y + 20, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // 頭
  fc(ctx, "#c8a060", cx, y + 13, 7);
  fc(ctx, "#d8b878", cx, y + 12, 4); // ハイライト
  // 目
  fc(ctx, "#ee2222", cx - 3, y + 12, 1.8);
  fc(ctx, "#ee2222", cx + 3, y + 12, 1.8);
  fc(ctx, "#ff8888", cx - 3, y + 12, 0.7);
  fc(ctx, "#ff8888", cx + 3, y + 12, 0.7);
  // 鼻
  fc(ctx, "#dd8888", cx, y + 14, 1.5);
  // ヒゲ
  ctx.strokeStyle = "#a07840";
  ctx.lineWidth = 0.8;
  for (const [sx, angle] of [[-1, -0.15], [-1, 0.15], [1, -0.15], [1, 0.15]] as [number, number][]) {
    ctx.beginPath();
    ctx.moveTo(cx + sx, y + 14);
    ctx.lineTo(cx + sx * 8, y + 14 + angle * 10);
    ctx.stroke();
  }
  // 尻尾
  ctx.strokeStyle = "#a07840";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx + 8, y + 23);
  ctx.quadraticCurveTo(cx + 14, y + 26, cx + 11, y + 28);
  ctx.stroke();
}

function drawSlime(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2, cy = y + TILE / 2;
  // 影
  ctx.fillStyle = "rgba(0,80,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(cx, y + 27, 9, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // ボディ（しずく形）
  ctx.fillStyle = "#1e9938";
  ctx.beginPath();
  ctx.arc(cx, cy + 2, 10, 0, Math.PI);
  ctx.quadraticCurveTo(cx + 9, cy - 8, cx + 4, cy - 12);
  ctx.quadraticCurveTo(cx, cy - 15, cx - 4, cy - 12);
  ctx.quadraticCurveTo(cx - 9, cy - 8, cx, cy + 2);
  ctx.fill();
  // 光沢
  ctx.fillStyle = "#33bb55";
  ctx.beginPath();
  ctx.arc(cx, cy + 2, 8, 0, Math.PI);
  ctx.quadraticCurveTo(cx + 7, cy - 6, cx + 3, cy - 10);
  ctx.quadraticCurveTo(cx, cy - 12, cx - 3, cy - 10);
  ctx.quadraticCurveTo(cx - 7, cy - 6, cx, cy + 2);
  ctx.fill();
  fc(ctx, "#55dd77", cx - 3, cy - 6, 4);
  fc(ctx, "#99ffbb", cx - 4, cy - 8, 2);
  // 目
  fc(ctx, "#0a1a0a", cx - 3, cy - 2, 2.5);
  fc(ctx, "#0a1a0a", cx + 3, cy - 2, 2.5);
  fc(ctx, "#ffffff", cx - 2, cy - 3, 1);
  fc(ctx, "#ffffff", cx + 4, cy - 3, 1);
}

function drawBat(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2, cy = y + TILE / 2;
  // 翼（左）
  ctx.fillStyle = "#3a1a44";
  ctx.beginPath();
  ctx.moveTo(cx - 2, cy - 2);
  ctx.quadraticCurveTo(cx - 8, cy - 8, cx - 14, cy - 3);
  ctx.quadraticCurveTo(cx - 10, cy + 5, cx - 2, cy + 3);
  ctx.fill();
  // 翼（右）
  ctx.fillStyle = "#3a1a44";
  ctx.beginPath();
  ctx.moveTo(cx + 2, cy - 2);
  ctx.quadraticCurveTo(cx + 8, cy - 8, cx + 14, cy - 3);
  ctx.quadraticCurveTo(cx + 10, cy + 5, cx + 2, cy + 3);
  ctx.fill();
  // 翼膜
  ctx.fillStyle = "#552266";
  ctx.beginPath();
  ctx.moveTo(cx - 2, cy - 2);
  ctx.quadraticCurveTo(cx - 7, cy - 6, cx - 13, cy - 2);
  ctx.quadraticCurveTo(cx - 8, cy + 4, cx - 2, cy + 2);
  ctx.fill();
  ctx.fillStyle = "#552266";
  ctx.beginPath();
  ctx.moveTo(cx + 2, cy - 2);
  ctx.quadraticCurveTo(cx + 7, cy - 6, cx + 13, cy - 2);
  ctx.quadraticCurveTo(cx + 8, cy + 4, cx + 2, cy + 2);
  ctx.fill();
  // 体
  fc(ctx, "#552266", cx, cy, 5);
  // 耳
  ctx.fillStyle = "#442055";
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy - 4); ctx.lineTo(cx - 7, cy - 11); ctx.lineTo(cx - 1, cy - 5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 4, cy - 4); ctx.lineTo(cx + 7, cy - 11); ctx.lineTo(cx + 1, cy - 5);
  ctx.fill();
  // 目
  fc(ctx, "#ff3333", cx - 2, cy - 1, 2.2);
  fc(ctx, "#ff3333", cx + 2, cy - 1, 2.2);
  fc(ctx, "#ffaaaa", cx - 2, cy - 1, 0.8);
  fc(ctx, "#ffaaaa", cx + 2, cy - 1, 0.8);
}

function drawSkeleton(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2;
  // 頭蓋骨
  fc(ctx, "#bbbbaa", cx, y + 9, 7);
  fc(ctx, "#ccccbb", cx, y + 8, 5);
  // 目のくぼみ
  fc(ctx, "#1a1520", cx - 3, y + 9, 2.5);
  fc(ctx, "#1a1520", cx + 3, y + 9, 2.5);
  fc(ctx, "#dd1111", cx - 3, y + 9, 1.2);
  fc(ctx, "#dd1111", cx + 3, y + 9, 1.2);
  // 顎
  fr(ctx, "#999988", cx - 5, y + 14, 10, 2);
  fr(ctx, "#888877", cx - 4, y + 15, 2, 2);
  fr(ctx, "#888877", cx, y + 15, 2, 2);
  // 背骨
  for (let i = 0; i < 4; i++) fr(ctx, "#aaaaaa", cx - 1, y + 16 + i * 3, 3, 2);
  // 肋骨
  for (let i = 0; i < 3; i++) {
    fr(ctx, "#aaaaaa", cx - 7, y + 16 + i * 3, 5, 1);
    fr(ctx, "#aaaaaa", cx + 3, y + 16 + i * 3, 5, 1);
  }
  // 腕
  fr(ctx, "#aaaaaa", cx - 8, y + 16, 2, 11);
  fr(ctx, "#aaaaaa", cx + 7, y + 16, 2, 11);
  // 脚
  fr(ctx, "#aaaaaa", cx - 4, y + 22, 2, 7);
  fr(ctx, "#aaaaaa", cx + 3, y + 22, 2, 7);
}

function drawOrc(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2;
  // 体（がっしり）
  ctx.fillStyle = "#295529";
  ctx.beginPath();
  ctx.ellipse(cx, y + 21, 10, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // 頭
  fc(ctx, "#3a8a3a", cx, y + 13, 8);
  fc(ctx, "#4aaa4a", cx, y + 12, 5);
  // 眉（怒り眉）
  fr(ctx, "#226622", cx - 8, y + 9, 7, 2);
  fr(ctx, "#226622", cx + 2, y + 9, 7, 2);
  // 目
  fc(ctx, "#ff8800", cx - 3, y + 12, 2.2);
  fc(ctx, "#ff8800", cx + 3, y + 12, 2.2);
  fc(ctx, "#ffcc66", cx - 3, y + 12, 1);
  fc(ctx, "#ffcc66", cx + 3, y + 12, 1);
  // 牙
  ctx.fillStyle = "#eeeedd";
  ctx.beginPath();
  ctx.moveTo(cx - 4, y + 17); ctx.lineTo(cx - 6, y + 21); ctx.lineTo(cx - 2, y + 17);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 4, y + 17); ctx.lineTo(cx + 6, y + 21); ctx.lineTo(cx + 2, y + 17);
  ctx.fill();
  // 武器（棍棒）
  fr(ctx, "#7a5a2a", cx + 11, y + 10, 3, 17);
  fr(ctx, "#aaaaaa", cx + 10, y + 8, 5, 5);
  fr(ctx, "#888888", cx + 9, y + 9, 1, 3);
  fr(ctx, "#cccccc", cx + 11, y + 8, 3, 2);
}

function drawGolem(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2;
  // 体（四角く重厚）
  fr(ctx, "#556677", cx - 9, y + 15, 18, 14);
  fr(ctx, "#667788", cx - 8, y + 16, 16, 12);
  // 頭（立方体）
  fr(ctx, "#667788", cx - 8, y + 5, 16, 11);
  fr(ctx, "#7788aa", cx - 7, y + 6, 14, 9);
  fr(ctx, "#8899bb", cx - 6, y + 6, 12, 3); // 頭上面
  // 目（魔法で光る）
  fc(ctx, "#2233dd", cx - 3, y + 10, 3);
  fc(ctx, "#2233dd", cx + 3, y + 10, 3);
  fc(ctx, "#8899ff", cx - 3, y + 10, 1.8);
  fc(ctx, "#8899ff", cx + 3, y + 10, 1.8);
  fc(ctx, "#ffffff", cx - 3, y + 9, 0.8);
  fc(ctx, "#ffffff", cx + 3, y + 9, 0.8);
  // 石のひび割れ
  ctx.strokeStyle = "#445566";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 5, y + 19); ctx.lineTo(cx - 2, y + 24); ctx.lineTo(cx + 2, y + 21);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 4, y + 7); ctx.lineTo(cx + 2, y + 12);
  ctx.stroke();
  // 腕（分厚い）
  fr(ctx, "#556677", cx - 15, y + 17, 8, 9);
  fr(ctx, "#667788", cx - 14, y + 18, 6, 7);
  fr(ctx, "#556677", cx + 8, y + 17, 8, 9);
  fr(ctx, "#667788", cx + 9, y + 18, 6, 7);
}

function drawDevil(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2, cy = y + TILE / 2;
  // 翼
  ctx.fillStyle = "#7a1010";
  ctx.beginPath();
  ctx.moveTo(cx - 5, y + 15);
  ctx.quadraticCurveTo(cx - 16, y + 3, cx - 13, y + 0);
  ctx.quadraticCurveTo(cx - 9, y + 9, cx - 3, y + 15);
  ctx.fill();
  ctx.fillStyle = "#7a1010";
  ctx.beginPath();
  ctx.moveTo(cx + 5, y + 15);
  ctx.quadraticCurveTo(cx + 16, y + 3, cx + 13, y + 0);
  ctx.quadraticCurveTo(cx + 9, y + 9, cx + 3, y + 15);
  ctx.fill();
  // 体
  fc(ctx, "#bb1f1f", cx, cy + 2, 9);
  fc(ctx, "#cc2222", cx, cy, 7);
  // 頭
  fc(ctx, "#cc2222", cx, y + 12, 8);
  fc(ctx, "#dd3333", cx, y + 11, 6);
  // ツノ
  ctx.fillStyle = "#991111";
  ctx.beginPath();
  ctx.moveTo(cx - 5, y + 7); ctx.lineTo(cx - 8, y + 0); ctx.lineTo(cx - 2, y + 6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 5, y + 7); ctx.lineTo(cx + 8, y + 0); ctx.lineTo(cx + 2, y + 6);
  ctx.fill();
  // 目
  fc(ctx, "#eecc00", cx - 3, y + 12, 2.5);
  fc(ctx, "#eecc00", cx + 3, y + 12, 2.5);
  fc(ctx, "#ff8800", cx - 3, y + 12, 1);
  fc(ctx, "#ff8800", cx + 3, y + 12, 1);
  // 尻尾
  ctx.strokeStyle = "#991111";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy + 8);
  ctx.quadraticCurveTo(cx + 15, cy + 12, cx + 12, cy + 18);
  ctx.stroke();
  ctx.fillStyle = "#991111";
  ctx.beginPath();
  ctx.moveTo(cx + 12, cy + 17); ctx.lineTo(cx + 9, cy + 22); ctx.lineTo(cx + 15, cy + 22);
  ctx.closePath();
  ctx.fill();
}

function drawEnemySprite(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  tx: number, ty: number,
): void {
  const x = tx * TILE, y = ty * TILE;
  switch (enemy.name) {
    case "マムル":     drawMaml(ctx, x, y);     break;
    case "スライム":   drawSlime(ctx, x, y);    break;
    case "コウモリ":   drawBat(ctx, x, y);      break;
    case "スケルトン": drawSkeleton(ctx, x, y); break;
    case "オーク":     drawOrc(ctx, x, y);      break;
    case "ゴーレム":   drawGolem(ctx, x, y);    break;
    case "デビル":     drawDevil(ctx, x, y);    break;
    default:
      // 未知の敵：色付き円 + 頭文字
      fc(ctx, "#cc6633", x + TILE / 2, y + TILE / 2, 10);
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${TILE / 2}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(enemy.name[0], x + TILE / 2, y + TILE / 2 + 1);
  }
}

// ── Main exports ──────────────────────────────────────────────────────────────
export function scrollToPlayer(
  canvas: HTMLCanvasElement,
  g: GameState,
  vpW: number,
  vpH: number,
): void {
  const cx = g.px * TILE + TILE / 2;
  const cy = g.py * TILE + TILE / 2;
  const sl = Math.max(0, Math.min(cx - vpW / 2, MW * TILE - vpW));
  const st = Math.max(0, Math.min(cy - vpH / 2, MH * TILE - vpH));
  canvas.style.transform = `translate(${-sl}px,${-st}px)`;
}

export function drawMap(
  canvas: HTMLCanvasElement,
  g: GameState,
  vpW: number,
  vpH: number,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // マップタイル
  for (let ty = 0; ty < MH; ty++) {
    for (let tx = 0; tx < MW; tx++) {
      const t = g.map[ty][tx];
      if (t === W) drawWall(ctx, tx, ty);
      else if (t === R) drawFloor(ctx, tx, ty);
      else drawCorridor(ctx, tx, ty);
    }
  }

  // 階段
  if (g.stairsPos) {
    drawStairs(ctx, g.stairsPos.x, g.stairsPos.y);
  }

  // モンスターハウスの部屋ハイライト
  if (g.monsterHouseRoomIdx != null && g.rooms[g.monsterHouseRoomIdx]) {
    const mhr = g.rooms[g.monsterHouseRoomIdx];
    ctx.fillStyle = "rgba(224,82,82,0.06)";
    ctx.fillRect(mhr.x * TILE, mhr.y * TILE, mhr.w * TILE, mhr.h * TILE);
  }

  // アイテム
  for (const it of g.itemTiles) {
    drawItemTile(ctx, it.x, it.y);
  }

  // ショップアイテム
  if (g.shopItems) {
    for (const s of g.shopItems) {
      drawShopItemTile(ctx, s.x, s.y);
    }
  }

  // 罠（踏んで可視化されたもの）
  if (g.traps) {
    for (const tr of g.traps) {
      if (tr.visible) {
        drawTrapTile(ctx, tr.x, tr.y, tr.type);
      }
    }
  }

  // 敵
  for (const e of g.enemies) {
    // アラート状態の背景
    if (e.alert && !e.sleeping) {
      ctx.fillStyle = "rgba(224,82,82,0.10)";
      ctx.fillRect(e.x * TILE, e.y * TILE, TILE, TILE);
    }
    if (e.sleeping) {
      ctx.fillStyle = "rgba(82,100,200,0.12)";
      ctx.fillRect(e.x * TILE, e.y * TILE, TILE, TILE);
    }

    drawEnemySprite(ctx, e, e.x, e.y);

    // 睡眠中のZZZ
    if (e.sleeping) {
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💤", e.x * TILE + TILE - 9, e.y * TILE + 7);
    }

    // HPバー
    const hpRatio = e.hp / e.mhp;
    fr(ctx, "#300000", e.x * TILE + 1, e.y * TILE + TILE - 5, TILE - 2, 4);
    fr(
      ctx,
      hpRatio > 0.5 ? "#409030" : "#d04040",
      e.x * TILE + 1,
      e.y * TILE + TILE - 5,
      Math.floor((TILE - 2) * hpRatio),
      4,
    );
  }

  // プレイヤー
  drawPlayer(ctx, g.px, g.py);

  scrollToPlayer(canvas, g, vpW, vpH);
}

export function getCanvasScrollOffset(
  canvas: HTMLCanvasElement,
): { tx: number; ty: number } {
  const m = canvas.style.transform.match(/translate\(([^,]+)px,([^)]+)px\)/);
  return { tx: m ? parseFloat(m[1]) : 0, ty: m ? parseFloat(m[2]) : 0 };
}
