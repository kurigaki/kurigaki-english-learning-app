"use client";

import type { GameState, Enemy, Shopkeeper } from "./types";
import { W, R, C } from "./types";
import { MW, MH, TILE, ITEMS_DEF } from "./constants";

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

function drawGrassItem(ctx: CanvasRenderingContext2D, cx: number, y: number): void {
  // 茎
  fr(ctx, "#228844", cx - 1, y + 9, 2, 13);
  // 葉1（左）
  ctx.fillStyle = "#33aa55";
  ctx.beginPath();
  ctx.ellipse(cx - 5, y + 16, 6, 3, -0.6, 0, Math.PI * 2);
  ctx.fill();
  // 葉2（右）
  ctx.beginPath();
  ctx.ellipse(cx + 4, y + 12, 6, 3, 0.6, 0, Math.PI * 2);
  ctx.fill();
  // 葉ハイライト
  ctx.fillStyle = "#55cc77";
  ctx.beginPath();
  ctx.ellipse(cx - 5, y + 15, 4, 2, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 4, y + 11, 4, 2, 0.6, 0, Math.PI * 2);
  ctx.fill();
  // 芽の先
  fc(ctx, "#66dd88", cx, y + 9, 2.5);
}

function drawScrollItem(ctx: CanvasRenderingContext2D, cx: number, y: number): void {
  // 羊皮紙（中央）
  fr(ctx, "#e8d090", cx - 7, y + 12, 14, 8);
  fr(ctx, "#f0dca0", cx - 6, y + 13, 12, 6);
  // 上のロール
  fr(ctx, "#b87820", cx - 8, y + 8, 16, 5);
  fr(ctx, "#c89030", cx - 7, y + 9, 14, 3);
  fr(ctx, "#d4a840", cx - 6, y + 9, 12, 2);
  // 下のロール
  fr(ctx, "#b87820", cx - 8, y + 19, 16, 5);
  fr(ctx, "#c89030", cx - 7, y + 20, 14, 3);
  fr(ctx, "#d4a840", cx - 6, y + 21, 12, 2);
  // 文字ライン
  fr(ctx, "#a08040", cx - 5, y + 14, 10, 1);
  fr(ctx, "#a08040", cx - 5, y + 16, 8, 1);
}

function drawCaneItem(ctx: CanvasRenderingContext2D, cx: number, y: number): void {
  // 杖の柄（木材）
  fr(ctx, "#7a4a1a", cx - 1, y + 10, 3, 17);
  fr(ctx, "#9a6a2a", cx, y + 11, 1, 15);
  // 宝玉（先端）
  fc(ctx, "#8822ee", cx, y + 9, 5.5);
  fc(ctx, "#aa44ff", cx, y + 9, 4);
  fc(ctx, "#cc88ff", cx - 1, y + 8, 2);
  fc(ctx, "#ffffff", cx - 1, y + 7, 1);
  // 輝きエフェクト
  fr(ctx, "#cc88ff", cx - 7, y + 9, 3, 1);
  fr(ctx, "#cc88ff", cx + 5, y + 9, 3, 1);
  fr(ctx, "#cc88ff", cx, y + 3, 1, 3);
  fr(ctx, "#cc88ff", cx - 1, y + 5, 1, 1);
  fr(ctx, "#cc88ff", cx + 1, y + 5, 1, 1);
}

function drawFoodItem(ctx: CanvasRenderingContext2D, cx: number, y: number): void {
  // ── 食料 ──
  // ご飯（大きな三角形・クリーム白）
  ctx.fillStyle = "#f0ece0";
  ctx.beginPath();
  ctx.moveTo(cx, y + 2);           // 頂点
  ctx.lineTo(cx - 11, y + 27);    // 左下
  ctx.lineTo(cx + 11, y + 27);    // 右下
  ctx.closePath();
  ctx.fill();
  // 海苔（台形・下部1/3を覆う濃い緑/黒）
  // 三角形の y+18 での幅 = 11 * (18-2)/(27-2) = 11 * 0.64 ≈ 7
  ctx.fillStyle = "#1c2e12";
  ctx.beginPath();
  ctx.moveTo(cx - 7, y + 18);     // 左上
  ctx.lineTo(cx + 7, y + 18);     // 右上
  ctx.lineTo(cx + 11, y + 27);    // 右下
  ctx.lineTo(cx - 11, y + 27);    // 左下
  ctx.closePath();
  ctx.fill();
  // 海苔の明暗テクスチャ（横ライン2本）
  fr(ctx, "#2a4018", cx - 6, y + 20, 12, 1);
  fr(ctx, "#2a4018", cx - 8, y + 23, 16, 1);
  // ご飯のハイライト（頂点付近の光沢）
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(cx, y + 4);
  ctx.lineTo(cx - 4, y + 14);
  ctx.lineTo(cx + 4, y + 14);
  ctx.closePath();
  ctx.fill();
  // 塩の点
  fr(ctx, "#e0dcd0", cx - 1, y + 10, 2, 2);
}

function drawJarItem(ctx: CanvasRenderingContext2D, cx: number, y: number): void {
  // 壷本体
  ctx.fillStyle = "#9a6840";
  ctx.beginPath();
  ctx.ellipse(cx, y + 20, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b07c52";
  ctx.beginPath();
  ctx.ellipse(cx, y + 19, 8, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // 光沢
  fc(ctx, "#c89060", cx - 3, y + 15, 3.5);
  fc(ctx, "#d8a880", cx - 3, y + 14, 1.5);
  // 蓋
  fr(ctx, "#7a5030", cx - 7, y + 11, 14, 3);
  fr(ctx, "#9a7050", cx - 6, y + 10, 12, 2);
  fr(ctx, "#b08060", cx - 4, y + 9, 8, 2);
  // 口の縁
  fr(ctx, "#7a5030", cx - 3, y + 8, 6, 2);
}

function drawSpecialItem(ctx: CanvasRenderingContext2D, cx: number, y: number): void {
  // 星形（特殊アイテム）
  const cy = y + TILE / 2;
  const outerR = 9, innerR = 4;
  ctx.fillStyle = "#f5c530";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px2 = cx + r * Math.cos(angle);
    const py2 = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px2, py2);
    else ctx.lineTo(px2, py2);
  }
  ctx.closePath();
  ctx.fill();
  // ハイライト
  ctx.fillStyle = "#fff0a0";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR - 2 : innerR - 1;
    const px2 = cx + r * Math.cos(angle);
    const py2 = cy - 1 + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px2, py2);
    else ctx.lineTo(px2, py2);
  }
  ctx.closePath();
  ctx.fill();
}

function drawItemTile(ctx: CanvasRenderingContext2D, tx: number, ty: number, cat?: string): void {
  const x = tx * TILE, y = ty * TILE;
  const cx = x + TILE / 2;
  // カテゴリ別の背景色
  const bgColors: Record<string, string> = {
    grass:  "rgba(50,160,80,0.15)",
    scroll: "rgba(200,160,60,0.15)",
    cane:   "rgba(150,60,220,0.15)",
    food:   "rgba(220,160,80,0.15)",
    jar:    "rgba(140,90,50,0.15)",
    special:"rgba(245,200,66,0.18)",
  };
  ctx.fillStyle = bgColors[cat ?? "special"] ?? bgColors.special;
  ctx.fillRect(x, y, TILE, TILE);

  switch (cat) {
    case "grass":   drawGrassItem(ctx, cx, y);   break;
    case "scroll":  drawScrollItem(ctx, cx, y);  break;
    case "cane":    drawCaneItem(ctx, cx, y);     break;
    case "food":    drawFoodItem(ctx, cx, y);     break;
    case "jar":     drawJarItem(ctx, cx, y);      break;
    default:        drawSpecialItem(ctx, cx, y);  break;
  }
}

// ── Shopkeeper ───────────────────────────────────────────────────────────────
function drawShopkeeper(ctx: CanvasRenderingContext2D, sk: Shopkeeper): void {
  const x = sk.x * TILE, y = sk.y * TILE;
  const cx = x + TILE / 2, cy = y + TILE / 2;

  if (sk.hostile) {
    // 敵化モード: 赤い怒りオーラ
    ctx.fillStyle = "rgba(220,40,40,0.18)";
    ctx.fillRect(x, y, TILE, TILE);
  }

  // 体（ローブ）
  const robeColor = sk.hostile ? "#8b1a1a" : "#2e6b4f";
  fr(ctx, robeColor, cx - 8, cy + 2, 16, 12);

  // 頭
  const skinColor = "#f0c890";
  fc(ctx, skinColor, cx, cy - 4, 8);

  // ひげ
  ctx.fillStyle = "#a0a0a0";
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy);
  ctx.lineTo(cx, cy + 5);
  ctx.lineTo(cx + 4, cy);
  ctx.fill();

  // 目
  const eyeColor = sk.hostile ? "#ff2020" : "#222";
  fr(ctx, eyeColor, cx - 4, cy - 6, 2, 2);
  fr(ctx, eyeColor, cx + 2, cy - 6, 2, 2);

  // 怒りマーク（敵化時）
  if (sk.hostile) {
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ff0000";
    ctx.fillText("💢", x + TILE - 6, y + 6);
  }

  // HPバー
  const hpRatio = sk.hp / sk.mhp;
  fr(ctx, "#300000", x + 1, y + TILE - 5, TILE - 2, 4);
  fr(ctx, hpRatio > 0.5 ? "#409030" : "#d04040", x + 1, y + TILE - 5, Math.floor((TILE - 2) * hpRatio), 4);
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
function drawPlayer(ctx: CanvasRenderingContext2D, tx: number, ty: number, dir: { dx: number; dy: number } = { dx: 0, dy: 1 }): void {
  const x = tx * TILE, y = ty * TILE;
  const cx = x + TILE / 2;

  // 選択オーラ
  ctx.fillStyle = "rgba(120,100,255,0.18)";
  ctx.fillRect(x, y, TILE, TILE);

  const { dx: ddx, dy: ddy } = dir;
  type Facing = "up" | "down" | "left" | "right" | "diagUL" | "diagUR" | "diagDL" | "diagDR";
  const facing: Facing =
    (ddx === -1 && ddy === -1) ? "diagUL" :
    (ddx ===  1 && ddy === -1) ? "diagUR" :
    (ddx === -1 && ddy ===  1) ? "diagDL" :
    (ddx ===  1 && ddy ===  1) ? "diagDR" :
    (ddy === -1) ? "up" : (ddx === 1) ? "right" : (ddx === -1) ? "left" : "down";

  if (facing === "diagUR") {
    // 右上向き（後ろ右3/4）— 頭・体を大きく右に寄せ、後ろ姿を強調
    fr(ctx, "#6644aa", x + 2, y + 8, 2, 20); fc(ctx, "#aa55ee", x + 3, y + 7, 3); fc(ctx, "#ddaaff", x + 3, y + 7, 1.5);
    ctx.fillStyle = "#231577";
    ctx.beginPath();
    ctx.moveTo(cx + 6, y + 0); ctx.lineTo(cx - 2, y + 9); ctx.lineTo(cx + 11, y + 9); ctx.closePath(); ctx.fill();
    fr(ctx, "#2e1e99", cx - 3, y + 8, 15, 3); fr(ctx, "#3828aa", cx - 2, y + 8, 13, 2);
    fc(ctx, "#c8a070", cx + 4, y + 16, 5); fc(ctx, "#d4aa80", cx + 4, y + 15, 3);
    // 耳（右寄りで後ろ姿らしさを出す）
    fr(ctx, "#c8a070", cx + 8, y + 15, 2, 2);
    ctx.fillStyle = "#3d2db8";
    ctx.beginPath();
    ctx.moveTo(cx - 3, y + 20); ctx.lineTo(cx + 10, y + 20); ctx.lineTo(cx + 12, y + 29); ctx.lineTo(cx - 5, y + 29); ctx.closePath(); ctx.fill();
    fr(ctx, "#2d1e9a", cx + 2, y + 20, 4, 9);
  } else if (facing === "diagUL") {
    // 左上向き（後ろ左3/4）— diagUR の左右反転
    fr(ctx, "#6644aa", x + 24, y + 8, 2, 20); fc(ctx, "#aa55ee", x + 25, y + 7, 3); fc(ctx, "#ddaaff", x + 25, y + 7, 1.5);
    ctx.fillStyle = "#231577";
    ctx.beginPath();
    ctx.moveTo(cx - 6, y + 0); ctx.lineTo(cx - 11, y + 9); ctx.lineTo(cx + 2, y + 9); ctx.closePath(); ctx.fill();
    fr(ctx, "#2e1e99", cx - 12, y + 8, 15, 3); fr(ctx, "#3828aa", cx - 11, y + 8, 13, 2);
    fc(ctx, "#c8a070", cx - 4, y + 16, 5); fc(ctx, "#d4aa80", cx - 4, y + 15, 3);
    // 耳（左寄り）
    fr(ctx, "#c8a070", cx - 10, y + 15, 2, 2);
    ctx.fillStyle = "#3d2db8";
    ctx.beginPath();
    ctx.moveTo(cx - 10, y + 20); ctx.lineTo(cx + 3, y + 20); ctx.lineTo(cx + 5, y + 29); ctx.lineTo(cx - 12, y + 29); ctx.closePath(); ctx.fill();
    fr(ctx, "#2d1e9a", cx - 6, y + 20, 4, 9);
  } else if (facing === "diagDR") {
    // 右下向き（前右3/4）— right寄りの正面、目1つ（横顔に近い3/4ビュー）
    fr(ctx, "#6644aa", x + 2, y + 8, 2, 20); fc(ctx, "#aa55ee", x + 3, y + 7, 3); fc(ctx, "#ddaaff", x + 3, y + 7, 1.5);
    ctx.fillStyle = "#231577";
    ctx.beginPath();
    ctx.moveTo(cx + 4, y + 1); ctx.lineTo(cx - 3, y + 9); ctx.lineTo(cx + 10, y + 9); ctx.closePath(); ctx.fill();
    fr(ctx, "#2e1e99", cx - 4, y + 8, 15, 3); fr(ctx, "#3828aa", cx - 3, y + 8, 13, 2);
    fc(ctx, "#f5c898", cx + 3, y + 16, 5); fc(ctx, "#f8d8b0", cx + 3, y + 15, 3);
    // 目1つ（右寄り・3/4ビュー）
    fr(ctx, "#2a1a10", cx + 3, y + 15, 2, 2); fr(ctx, "#ffffff", cx + 3, y + 15, 1, 1);
    // 鼻のドット
    fr(ctx, "#c89060", cx + 7, y + 17, 1, 1);
    ctx.fillStyle = "#3d2db8";
    ctx.beginPath();
    ctx.moveTo(cx - 3, y + 20); ctx.lineTo(cx + 10, y + 20); ctx.lineTo(cx + 12, y + 29); ctx.lineTo(cx - 5, y + 29); ctx.closePath(); ctx.fill();
    fr(ctx, "#4e3ecc", cx, y + 20, 4, 9);
  } else if (facing === "diagDL") {
    // 左下向き（前左3/4）— diagDR の左右反転
    fr(ctx, "#6644aa", x + 24, y + 8, 2, 20); fc(ctx, "#aa55ee", x + 25, y + 7, 3); fc(ctx, "#ddaaff", x + 25, y + 7, 1.5);
    ctx.fillStyle = "#231577";
    ctx.beginPath();
    ctx.moveTo(cx - 4, y + 1); ctx.lineTo(cx - 10, y + 9); ctx.lineTo(cx + 3, y + 9); ctx.closePath(); ctx.fill();
    fr(ctx, "#2e1e99", cx - 11, y + 8, 15, 3); fr(ctx, "#3828aa", cx - 10, y + 8, 13, 2);
    fc(ctx, "#f5c898", cx - 3, y + 16, 5); fc(ctx, "#f8d8b0", cx - 3, y + 15, 3);
    // 目1つ（左寄り・3/4ビュー）
    fr(ctx, "#2a1a10", cx - 5, y + 15, 2, 2); fr(ctx, "#ffffff", cx - 5, y + 15, 1, 1);
    // 鼻のドット
    fr(ctx, "#c89060", cx - 8, y + 17, 1, 1);
    ctx.fillStyle = "#3d2db8";
    ctx.beginPath();
    ctx.moveTo(cx - 10, y + 20); ctx.lineTo(cx + 3, y + 20); ctx.lineTo(cx + 5, y + 29); ctx.lineTo(cx - 12, y + 29); ctx.closePath(); ctx.fill();
    fr(ctx, "#4e3ecc", cx - 4, y + 20, 4, 9);
  } else if (facing === "up") {
    // 上向き（後ろ姿）
    // スタッフ（右側に立てる）
    fr(ctx, "#6644aa", x + 22, y + 7, 2, 21);
    fc(ctx, "#aa55ee", x + 23, y + 6, 3);
    fc(ctx, "#ddaaff", x + 23, y + 6, 1.5);

    // 帽子（後ろ向き：先端が少し太め）
    ctx.fillStyle = "#231577";
    ctx.beginPath();
    ctx.moveTo(cx - 1, y + 1);
    ctx.lineTo(cx + 1, y + 1);
    ctx.lineTo(cx + 6, y + 9);
    ctx.lineTo(cx - 6, y + 9);
    ctx.closePath();
    ctx.fill();
    fr(ctx, "#2e1e99", cx - 7, y + 8, 14, 3); // つば（後ろ）
    fr(ctx, "#3828aa", cx - 6, y + 8, 12, 2);

    // 頭の後ろ（顔なし）
    fc(ctx, "#c8a070", cx, y + 16, 5);

    // ローブ（後ろ姿）
    ctx.fillStyle = "#3d2db8";
    ctx.beginPath();
    ctx.moveTo(cx - 7, y + 20);
    ctx.lineTo(cx + 7, y + 20);
    ctx.lineTo(cx + 9, y + 29);
    ctx.lineTo(cx - 9, y + 29);
    ctx.closePath();
    ctx.fill();
    fr(ctx, "#2d1e9a", cx, y + 20, 4, 9); // ローブ中央線（後ろ姿らしく）
  } else if (facing === "right") {
    // 右向き（横顔）
    // スタッフ（後ろ＝左側）
    fr(ctx, "#6644aa", x + 6, y + 7, 2, 21);
    fc(ctx, "#aa55ee", x + 7, y + 6, 3);
    fc(ctx, "#ddaaff", x + 7, y + 6, 1.5);

    // 帽子（横から見た三角形、先端右上）
    ctx.fillStyle = "#231577";
    ctx.beginPath();
    ctx.moveTo(cx + 3, y + 1);
    ctx.lineTo(cx - 5, y + 9);
    ctx.lineTo(cx + 7, y + 9);
    ctx.closePath();
    ctx.fill();
    fr(ctx, "#2e1e99", cx - 5, y + 8, 14, 3);
    fr(ctx, "#3828aa", cx - 4, y + 8, 12, 2);

    // 顔（右向き横顔：右寄り）
    fc(ctx, "#f5c898", cx + 1, y + 16, 5);
    fc(ctx, "#f8d8b0", cx + 1, y + 15, 3);
    // 目（右側のみ）
    fr(ctx, "#2a1a10", cx + 2, y + 15, 2, 2);
    fr(ctx, "#ffffff", cx + 2, y + 15, 1, 1);
    // 鼻のドット
    fr(ctx, "#c89060", cx + 5, y + 17, 1, 1);

    // ローブ（縦長・右向き）
    ctx.fillStyle = "#3d2db8";
    ctx.beginPath();
    ctx.moveTo(cx - 4, y + 20);
    ctx.lineTo(cx + 6, y + 20);
    ctx.lineTo(cx + 7, y + 29);
    ctx.lineTo(cx - 5, y + 29);
    ctx.closePath();
    ctx.fill();
    fr(ctx, "#4e3ecc", cx - 2, y + 20, 3, 9);
  } else if (facing === "left") {
    // 左向き（右向きの鏡像）
    // スタッフ（後ろ＝右側）
    fr(ctx, "#6644aa", x + 22, y + 7, 2, 21);
    fc(ctx, "#aa55ee", x + 23, y + 6, 3);
    fc(ctx, "#ddaaff", x + 23, y + 6, 1.5);

    // 帽子（左向き三角形）
    ctx.fillStyle = "#231577";
    ctx.beginPath();
    ctx.moveTo(cx - 3, y + 1);
    ctx.lineTo(cx - 7, y + 9);
    ctx.lineTo(cx + 5, y + 9);
    ctx.closePath();
    ctx.fill();
    fr(ctx, "#2e1e99", cx - 9, y + 8, 14, 3);
    fr(ctx, "#3828aa", cx - 8, y + 8, 12, 2);

    // 顔（左向き横顔：左寄り）
    fc(ctx, "#f5c898", cx - 1, y + 16, 5);
    fc(ctx, "#f8d8b0", cx - 1, y + 15, 3);
    // 目（左側のみ）
    fr(ctx, "#2a1a10", cx - 4, y + 15, 2, 2);
    fr(ctx, "#ffffff", cx - 4, y + 15, 1, 1);
    // 鼻のドット
    fr(ctx, "#c89060", cx - 6, y + 17, 1, 1);

    // ローブ（左向き）
    ctx.fillStyle = "#3d2db8";
    ctx.beginPath();
    ctx.moveTo(cx - 6, y + 20);
    ctx.lineTo(cx + 4, y + 20);
    ctx.lineTo(cx + 5, y + 29);
    ctx.lineTo(cx - 7, y + 29);
    ctx.closePath();
    ctx.fill();
    fr(ctx, "#4e3ecc", cx - 1, y + 20, 3, 9);
  } else {
    // 下向き（正面）- デフォルト
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
}

// ── Enemies ───────────────────────────────────────────────────────────────────
function drawGremlin(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2;
  // 体（丸っこい緑灰色）
  ctx.fillStyle = "#5a8840";
  ctx.beginPath();
  ctx.ellipse(cx, y + 21, 8, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // 頭
  fc(ctx, "#6a9850", cx, y + 14, 8);
  fc(ctx, "#7aaa60", cx, y + 13, 5);
  // コウモリ耳（とがった耳）
  ctx.fillStyle = "#4a7830";
  ctx.beginPath();
  ctx.moveTo(cx - 6, y + 10); ctx.lineTo(cx - 13, y + 2); ctx.lineTo(cx - 2, y + 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 6, y + 10); ctx.lineTo(cx + 13, y + 2); ctx.lineTo(cx + 2, y + 8);
  ctx.fill();
  // 耳の内側
  ctx.fillStyle = "#8acc60";
  ctx.beginPath();
  ctx.moveTo(cx - 6, y + 10); ctx.lineTo(cx - 11, y + 4); ctx.lineTo(cx - 3, y + 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 6, y + 10); ctx.lineTo(cx + 11, y + 4); ctx.lineTo(cx + 3, y + 8);
  ctx.fill();
  // 目（黄色く光る）
  fc(ctx, "#ffcc00", cx - 3, y + 14, 2.5);
  fc(ctx, "#ffcc00", cx + 3, y + 14, 2.5);
  fc(ctx, "#ff8800", cx - 3, y + 14, 1.2);
  fc(ctx, "#ff8800", cx + 3, y + 14, 1.2);
  fc(ctx, "#ffffff", cx - 3.5, y + 13, 0.8);
  fc(ctx, "#ffffff", cx + 2.5, y + 13, 0.8);
  // 口（鋭い歯）
  fr(ctx, "#2a4a1a", cx - 4, y + 17, 8, 2);
  fr(ctx, "#ffffff", cx - 3, y + 18, 2, 2);
  fr(ctx, "#ffffff", cx + 1, y + 18, 2, 2);
  // 腕
  fr(ctx, "#5a8840", cx - 12, y + 19, 5, 5);
  fr(ctx, "#5a8840", cx + 8, y + 19, 5, 5);
  // 爪
  fr(ctx, "#3a5820", cx - 12, y + 23, 2, 2);
  fr(ctx, "#3a5820", cx + 11, y + 23, 2, 2);
}

function drawSlime(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // スライム：丸いドーム＋先端のツノ
  const cx = x + TILE / 2;
  const bodyY = y + 20; // 体の中心Y
  // 影
  ctx.fillStyle = "rgba(0,60,140,0.22)";
  ctx.beginPath();
  ctx.ellipse(cx, y + 28, 9, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // ボディ（ドーム形）
  ctx.fillStyle = "#2266cc";
  ctx.beginPath();
  ctx.arc(cx, bodyY, 11, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, bodyY, 11, Math.PI, Math.PI * 2);
  ctx.fill();
  // 先端ツノ（波形）
  ctx.fillStyle = "#2266cc";
  ctx.beginPath();
  ctx.moveTo(cx - 5, bodyY - 9);
  ctx.quadraticCurveTo(cx - 3, bodyY - 16, cx, bodyY - 18);
  ctx.quadraticCurveTo(cx + 3, bodyY - 16, cx + 5, bodyY - 9);
  ctx.fill();
  // 光沢（上部ハイライト）
  ctx.fillStyle = "#4488ee";
  ctx.beginPath();
  ctx.arc(cx, bodyY - 1, 8, Math.PI, Math.PI * 2);
  ctx.fill();
  fc(ctx, "#6699ff", cx - 3, bodyY - 6, 5);
  fc(ctx, "#88bbff", cx - 4, bodyY - 9, 3);
  fc(ctx, "#bbddff", cx - 5, bodyY - 11, 1.5);
  // 大きな可愛い目
  fc(ctx, "#0a0a22", cx - 4, bodyY - 1, 3.5);
  fc(ctx, "#0a0a22", cx + 4, bodyY - 1, 3.5);
  // 目の白ハイライト
  fc(ctx, "#ffffff", cx - 5, bodyY - 2.5, 1.2);
  fc(ctx, "#ffffff", cx + 3, bodyY - 2.5, 1.2);
  // スマイル
  ctx.strokeStyle = "#1144aa";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, bodyY + 5, 4, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
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

// ── Guardian（泥棒時出現の強敵）──────────────────────────────────────────
function drawGuardian(ctx: CanvasRenderingContext2D, x: number, y: number, elite: boolean): void {
  const cx = x + TILE / 2, cy = y + TILE / 2;
  // 体（重装鎧）
  const armorColor = elite ? "#4a2a7a" : "#2a4a7a";
  fr(ctx, armorColor, cx - 9, cy - 2, 18, 16);
  // 肩パッド
  fr(ctx, elite ? "#6a3aaa" : "#3a6aaa", cx - 12, cy - 2, 6, 6);
  fr(ctx, elite ? "#6a3aaa" : "#3a6aaa", cx + 6, cy - 2, 6, 6);
  // 頭（ヘルメット）
  fc(ctx, elite ? "#5a2a9a" : "#2a5a9a", cx, cy - 6, 8);
  // バイザー（目の部分）
  fr(ctx, "#111", cx - 5, cy - 8, 10, 3);
  // 目（赤く光る）
  fr(ctx, "#ff3030", cx - 4, cy - 8, 3, 2);
  fr(ctx, "#ff3030", cx + 1, cy - 8, 3, 2);
  // 盾（ガーディアン）or 剣（センチネル）
  if (elite) {
    // 大剣
    ctx.fillStyle = "#c0c0c0";
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 10);
    ctx.lineTo(cx + 12, cy + 6);
    ctx.lineTo(cx + 8, cy + 6);
    ctx.closePath();
    ctx.fill();
    // 柄
    fr(ctx, "#8a6a30", cx + 8, cy + 6, 4, 4);
  } else {
    // 盾
    ctx.fillStyle = "#c0c0c0";
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 4);
    ctx.lineTo(cx - 6, cy - 4);
    ctx.lineTo(cx - 6, cy + 8);
    ctx.lineTo(cx - 9, cy + 10);
    ctx.lineTo(cx - 12, cy + 8);
    ctx.closePath();
    ctx.fill();
    // 盾の紋章
    fr(ctx, armorColor, cx - 11, cy, 4, 4);
  }
}

// ── Ghost（半透明の幽霊）──────────────────────────────────────────
function drawGhost(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2, cy = y + TILE / 2;
  ctx.globalAlpha = 0.7;
  // 体（半透明の白いドーム）
  ctx.fillStyle = "#ccccff";
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 10, Math.PI, 0);
  ctx.lineTo(cx + 10, cy + 8);
  // 裾のギザギザ
  ctx.lineTo(cx + 6, cy + 4); ctx.lineTo(cx + 3, cy + 8);
  ctx.lineTo(cx, cy + 4); ctx.lineTo(cx - 3, cy + 8);
  ctx.lineTo(cx - 6, cy + 4); ctx.lineTo(cx - 10, cy + 8);
  ctx.closePath(); ctx.fill();
  // 目（暗い穴）
  ctx.globalAlpha = 1;
  fc(ctx, "#1a0a2a", cx - 4, cy - 4, 3);
  fc(ctx, "#1a0a2a", cx + 4, cy - 4, 3);
  fc(ctx, "#6666ff", cx - 4, cy - 4, 1.5);
  fc(ctx, "#6666ff", cx + 4, cy - 4, 1.5);
  // 口
  ctx.fillStyle = "#2a1a3a";
  ctx.beginPath(); ctx.arc(cx, cy + 1, 3, 0, Math.PI); ctx.fill();
  ctx.globalAlpha = 1;
}

// ── Wizard（紫ローブの魔法使い）──────────────────────────────────────────
function drawWizard(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2, cy = y + TILE / 2;
  // ローブ
  fr(ctx, "#4a2a6a", cx - 8, cy, 16, 14);
  // 頭
  fc(ctx, "#ddccbb", cx, cy - 2, 7);
  // 帽子（三角）
  ctx.fillStyle = "#3a1a5a";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 16);
  ctx.lineTo(cx + 9, cy - 4);
  ctx.lineTo(cx - 9, cy - 4);
  ctx.closePath(); ctx.fill();
  // 帽子のつば
  fr(ctx, "#2a0a4a", cx - 10, cy - 5, 20, 3);
  // 目（光る）
  fc(ctx, "#ff44ff", cx - 3, cy - 3, 2);
  fc(ctx, "#ff44ff", cx + 3, cy - 3, 2);
  // 杖
  fr(ctx, "#8a6a30", cx + 9, cy - 8, 2, 20);
  fc(ctx, "#ff88ff", cx + 10, cy - 10, 3);
}

// ── Minotaur（茶色の牛頭人）──────────────────────────────────────────
function drawMinotaur(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2, cy = y + TILE / 2;
  // 体（大きい）
  fr(ctx, "#6a3a1a", cx - 10, cy - 2, 20, 16);
  // 頭
  fc(ctx, "#8a5a2a", cx, cy - 5, 9);
  // 角（左右）
  ctx.fillStyle = "#ccbb99";
  ctx.beginPath(); ctx.moveTo(cx - 8, cy - 8); ctx.lineTo(cx - 14, cy - 14); ctx.lineTo(cx - 5, cy - 10); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + 8, cy - 8); ctx.lineTo(cx + 14, cy - 14); ctx.lineTo(cx + 5, cy - 10); ctx.closePath(); ctx.fill();
  // 鼻輪
  ctx.strokeStyle = "#ccaa66"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, 3, 0.2, Math.PI - 0.2); ctx.stroke();
  // 目（赤）
  fc(ctx, "#ff2200", cx - 4, cy - 6, 2.5);
  fc(ctx, "#ff2200", cx + 4, cy - 6, 2.5);
  // 斧
  fr(ctx, "#7a5a2a", cx - 14, cy - 6, 3, 18);
  ctx.fillStyle = "#aaaaaa";
  ctx.beginPath(); ctx.moveTo(cx - 16, cy - 6); ctx.lineTo(cx - 11, cy - 3); ctx.lineTo(cx - 11, cy - 9); ctx.closePath(); ctx.fill();
}

// ── Dragon（緑のドラゴン）──────────────────────────────────────────
function drawDragon(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2, cy = y + TILE / 2;
  // 翼
  ctx.fillStyle = "#1a6a2a";
  ctx.beginPath(); ctx.moveTo(cx - 6, cy - 4); ctx.lineTo(cx - 18, cy - 12); ctx.lineTo(cx - 14, cy + 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + 6, cy - 4); ctx.lineTo(cx + 18, cy - 12); ctx.lineTo(cx + 14, cy + 2); ctx.closePath(); ctx.fill();
  // 体
  fc(ctx, "#2a8a3a", cx, cy + 2, 11);
  // 頭
  fc(ctx, "#3aaa4a", cx, cy - 6, 7);
  // 角
  ctx.fillStyle = "#ccbb66";
  ctx.beginPath(); ctx.moveTo(cx - 4, cy - 10); ctx.lineTo(cx - 2, cy - 16); ctx.lineTo(cx, cy - 10); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + 4, cy - 10); ctx.lineTo(cx + 2, cy - 16); ctx.lineTo(cx, cy - 10); ctx.closePath(); ctx.fill();
  // 目（金色）
  fc(ctx, "#ffcc00", cx - 3, cy - 7, 2.5);
  fc(ctx, "#ffcc00", cx + 3, cy - 7, 2.5);
  fc(ctx, "#111", cx - 3, cy - 7, 1);
  fc(ctx, "#111", cx + 3, cy - 7, 1);
  // 口から炎
  ctx.fillStyle = "#ff6600";
  ctx.beginPath(); ctx.moveTo(cx - 2, cy - 2); ctx.lineTo(cx, cy + 6); ctx.lineTo(cx + 2, cy - 2); ctx.closePath(); ctx.fill();
}

// ── Lich（紫の死霊魔術師）──────────────────────────────────────────
function drawLich(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = x + TILE / 2, cy = y + TILE / 2;
  // ローブ（暗い紫）
  fr(ctx, "#2a1a3a", cx - 9, cy, 18, 14);
  // フード
  ctx.fillStyle = "#1a0a2a";
  ctx.beginPath();
  ctx.arc(cx, cy - 3, 10, Math.PI + 0.3, -0.3);
  ctx.lineTo(cx + 8, cy + 2); ctx.lineTo(cx - 8, cy + 2);
  ctx.closePath(); ctx.fill();
  // ドクロ顔
  fc(ctx, "#bbbb99", cx, cy - 2, 6);
  // 目（緑に光る）
  fc(ctx, "#00ff66", cx - 3, cy - 4, 2.5);
  fc(ctx, "#00ff66", cx + 3, cy - 4, 2.5);
  // 歯
  fr(ctx, "#bbbb99", cx - 3, cy + 1, 2, 2);
  fr(ctx, "#bbbb99", cx + 1, cy + 1, 2, 2);
  // 魔法のオーブ
  fc(ctx, "#9900ff", cx, cy + 10, 4);
  fc(ctx, "#cc66ff", cx, cy + 10, 2);
}

function drawEnemySprite(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  tx: number, ty: number,
): void {
  const x = tx * TILE, y = ty * TILE;
  switch (enemy.name) {
    case "Gremlin":  case "グレムリン": drawGremlin(ctx, x, y);  break;
    case "Slime":    case "スライム":   drawSlime(ctx, x, y);    break;
    case "Bat":      case "コウモリ":   drawBat(ctx, x, y);      break;
    case "Skeleton": case "スケルトン": drawSkeleton(ctx, x, y); break;
    case "Orc":      case "オーク":     drawOrc(ctx, x, y);      break;
    case "Ghost":    case "ゴースト":   drawGhost(ctx, x, y);     break;
    case "Golem":    case "ゴーレム":   drawGolem(ctx, x, y);     break;
    case "Wizard":   case "ウィザード": drawWizard(ctx, x, y);    break;
    case "Devil":    case "デビル":     drawDevil(ctx, x, y);     break;
    case "Minotaur": case "ミノタウロス": drawMinotaur(ctx, x, y); break;
    case "Dragon":   case "ドラゴン":   drawDragon(ctx, x, y);    break;
    case "Lich":     case "リッチ":     drawLich(ctx, x, y);      break;
    case "ガーディアン": drawGuardian(ctx, x, y, false); break;
    case "センチネル":   drawGuardian(ctx, x, y, true);  break;
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

/** クイズ画面用: 敵のピクセルアートを描画（32x32 canvas） */
export function drawEnemySpriteForQuiz(ctx: CanvasRenderingContext2D, enemy: Enemy, x: number, y: number): void {
  drawEnemySprite(ctx, enemy, x, y);
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

  const exp = g.explored;
  // explored がない（旧セーブ互換）場合は全開示。廊下と隣接壁は常に表示。
  const isExp = (tx: number, ty: number): boolean => {
    if (!exp || !exp[ty] || exp[ty][tx] === true) return true;
    // 廊下タイルと廊下に隣接する壁は常に表示（地図には反映しない）
    if (g.map[ty][tx] === C) return true;
    for (const [ddx, ddy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
      const nx2 = tx + ddx, ny2 = ty + ddy;
      if (nx2 >= 0 && nx2 < MW && ny2 >= 0 && ny2 < MH && g.map[ny2][nx2] === C) return true;
    }
    return false;
  };

  // マップタイル
  for (let ty = 0; ty < MH; ty++) {
    for (let tx = 0; tx < MW; tx++) {
      const t = g.map[ty][tx];
      if (t === W) {
        if (isExp(tx, ty)) {
          drawWall(ctx, tx, ty);
        } else {
          // 未探索の壁: 輪郭だけ暗く表示（部屋の形が分かる）
          fr(ctx, "#0e0c18", tx * TILE, ty * TILE, TILE, TILE);
          fr(ctx, "#1a1838", tx * TILE, ty * TILE, TILE, 1);
          fr(ctx, "#1a1838", tx * TILE, ty * TILE, 1, TILE);
        }
      } else if (t === R) {
        if (isExp(tx, ty)) {
          drawFloor(ctx, tx, ty);
        } else {
          // 未探索の床: 暗い茶色（真っ暗でなく、部屋の範囲が分かる）
          fr(ctx, "#1e1810", tx * TILE, ty * TILE, TILE, TILE);
          fr(ctx, "#2a2218", tx * TILE, ty * TILE, TILE, 1);
          fr(ctx, "#2a2218", tx * TILE, ty * TILE, 1, TILE);
        }
      } else {
        // 廊下: 常に全表示（explored に関わらず）
        drawCorridor(ctx, tx, ty);
      }
    }
  }

  // 階段（探索済みのみ）
  if (g.stairsPos && isExp(g.stairsPos.x, g.stairsPos.y)) {
    drawStairs(ctx, g.stairsPos.x, g.stairsPos.y);
  }

  // エネミーラッシュの部屋ハイライト（探索済みのみ）
  if (g.monsterHouseRoomIdx != null && g.rooms[g.monsterHouseRoomIdx]) {
    const mhr = g.rooms[g.monsterHouseRoomIdx];
    if (isExp(mhr.x, mhr.y)) {
      ctx.fillStyle = "rgba(224,82,82,0.06)";
      ctx.fillRect(mhr.x * TILE, mhr.y * TILE, mhr.w * TILE, mhr.h * TILE);
    }
  }

  // アイテム（探索済みのみ）
  for (const it of g.itemTiles) {
    if (isExp(it.x, it.y)) {
      const cat = ITEMS_DEF.find((d) => d.id === it.id)?.cat;
      drawItemTile(ctx, it.x, it.y, cat);
    }
  }

  // ショップアイテム（探索済みのみ）
  if (g.shopItems) {
    for (const s of g.shopItems) {
      if (isExp(s.x, s.y)) drawShopItemTile(ctx, s.x, s.y);
    }
  }

  // 罠（探索済みかつ可視のみ）
  if (g.traps) {
    for (const tr of g.traps) {
      if (tr.visible && isExp(tr.x, tr.y)) {
        drawTrapTile(ctx, tr.x, tr.y, tr.type);
      }
    }
  }

  // 敵（探索済みのみ）
  for (const e of g.enemies) {
    if (!isExp(e.x, e.y)) continue;

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

    // 状態異常アイコン表示
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (e.sleeping) {
      ctx.fillText("💤", e.x * TILE + TILE - 9, e.y * TILE + 7);
    } else if (e.confused > 0) {
      ctx.fillStyle = "rgba(200,150,50,0.15)";
      ctx.fillRect(e.x * TILE, e.y * TILE, TILE, TILE);
      ctx.fillText("😵", e.x * TILE + TILE - 9, e.y * TILE + 7);
    } else if (e.sealed > 0) {
      ctx.fillStyle = "rgba(100,100,150,0.15)";
      ctx.fillRect(e.x * TILE, e.y * TILE, TILE, TILE);
      ctx.fillText("🔒", e.x * TILE + TILE - 9, e.y * TILE + 7);
    } else if (e.slowed || (e.slowTurns ?? 0) > 0) {
      ctx.fillText("🐌", e.x * TILE + TILE - 9, e.y * TILE + 7);
    } else if ((e.swiftTurns ?? 0) > 0) {
      ctx.fillStyle = "rgba(255,200,50,0.12)";
      ctx.fillRect(e.x * TILE, e.y * TILE, TILE, TILE);
      ctx.fillText("⚡", e.x * TILE + TILE - 9, e.y * TILE + 7);
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

  // 店主NPC（探索済みのみ）
  if (g.shopkeeper && g.shopkeeper.hp > 0 && isExp(g.shopkeeper.x, g.shopkeeper.y)) {
    drawShopkeeper(ctx, g.shopkeeper);
  }

  // プレイヤー（常に表示）
  drawPlayer(ctx, g.px, g.py, g.playerDir ?? { dx: 0, dy: 1 });

  scrollToPlayer(canvas, g, vpW, vpH);
}

// ── 全体マップ（オーバービュー）描画 ─────────────────────────────────────────
const MINI_TILE = 7; // ミニマップ1タイルのピクセル数

export const FULL_MAP_W = MW * MINI_TILE;
export const FULL_MAP_H = MH * MINI_TILE;

export function drawFullMap(canvas: HTMLCanvasElement, g: GameState): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const exp = g.explored;
  const isExp = (tx: number, ty: number): boolean =>
    !exp || !exp[ty] || exp[ty][tx] === true;

  // 背景
  ctx.fillStyle = "#05040e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // タイル
  for (let ty = 0; ty < MH; ty++) {
    for (let tx = 0; tx < MW; tx++) {
      const t = g.map[ty][tx];
      const x = tx * MINI_TILE;
      const y = ty * MINI_TILE;
      const explored = isExp(tx, ty);

      let color: string;
      if (t === W) {
        // 壁: 探索済みのみ表示（未探索は完全に非表示）
        color = explored ? "#302858" : "#05040e";
      } else if (t === R) {
        // 部屋の床: 探索済みのみ表示
        color = explored ? "#28244a" : "#05040e";
      } else {
        // 廊下: 探索済みのみ表示（ゲーム画面は常に表示だが、全体マップは通過済みのみ）
        color = explored ? "#1e1c3c" : "#05040e";
      }
      ctx.fillStyle = color;
      ctx.fillRect(x, y, MINI_TILE, MINI_TILE);
    }
  }

  // 階段（探索済みのみ）
  if (g.stairsPos && isExp(g.stairsPos.x, g.stairsPos.y)) {
    ctx.fillStyle = "#4488cc";
    ctx.fillRect(
      g.stairsPos.x * MINI_TILE + 1,
      g.stairsPos.y * MINI_TILE + 1,
      MINI_TILE - 2,
      MINI_TILE - 2,
    );
  }

  // アイテム（探索済みのみ・黄色ドット）
  ctx.fillStyle = "#f5c842";
  for (const it of g.itemTiles) {
    if (isExp(it.x, it.y)) {
      ctx.beginPath();
      ctx.arc(it.x * MINI_TILE + MINI_TILE / 2, it.y * MINI_TILE + MINI_TILE / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ショップアイテム（探索済みのみ・緑ドット）
  ctx.fillStyle = "#52d47a";
  for (const s of g.shopItems ?? []) {
    if (isExp(s.x, s.y)) {
      ctx.beginPath();
      ctx.arc(s.x * MINI_TILE + MINI_TILE / 2, s.y * MINI_TILE + MINI_TILE / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 店主NPC（探索済みのみ・紫ドット）
  if (g.shopkeeper && g.shopkeeper.hp > 0 && isExp(g.shopkeeper.x, g.shopkeeper.y)) {
    ctx.fillStyle = g.shopkeeper.hostile ? "#e05252" : "#a060d0";
    ctx.beginPath();
    ctx.arc(g.shopkeeper.x * MINI_TILE + MINI_TILE / 2, g.shopkeeper.y * MINI_TILE + MINI_TILE / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 敵（探索済みのみ・赤ドット）
  ctx.fillStyle = "#e05252";
  for (const e of g.enemies) {
    if (isExp(e.x, e.y)) {
      ctx.beginPath();
      ctx.arc(e.x * MINI_TILE + MINI_TILE / 2, e.y * MINI_TILE + MINI_TILE / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // プレイヤー（常に表示・明るい黄色）
  const plx = g.px * MINI_TILE + MINI_TILE / 2;
  const ply = g.py * MINI_TILE + MINI_TILE / 2;
  ctx.fillStyle = "#f5c842";
  ctx.beginPath();
  ctx.arc(plx, ply, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(245,200,66,0.55)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(plx, ply, 5, 0, Math.PI * 2);
  ctx.stroke();
}

export function getCanvasScrollOffset(
  canvas: HTMLCanvasElement,
): { tx: number; ty: number } {
  const m = canvas.style.transform.match(/translate\(([^,]+)px,([^)]+)px\)/);
  return { tx: m ? parseFloat(m[1]) : 0, ty: m ? parseFloat(m[2]) : 0 };
}
