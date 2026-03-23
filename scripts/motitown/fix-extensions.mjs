#!/usr/bin/env node
/**
 * word-extensions.ts の挿入位置を修正する
 * 誤って関数内に挿入されたモチタンデータを、Map定義の末尾に移動する
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const EXT_FILE = join(ROOT, "src/data/word-extensions.ts");

const content = readFileSync(EXT_FILE, "utf-8");
const lines = content.split("\n");

// マーカーを探す
const markerIdx = lines.findIndex((l) =>
  l.includes("── モチタン取り込み ──")
);
if (markerIdx === -1) {
  console.error("モチタンマーカーが見つかりません");
  process.exit(1);
}
console.log(`マーカー位置: ${markerIdx + 1}行目`);

// Map の正しい終端を探す（最初の `]);`）
// wordExtensions Map は `export const wordExtensions: Map<...> = new Map([` で始まる
let mapEndIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "]);") {
    // マーカーより前にある最初の `]);` が Map の終端
    if (i < markerIdx) {
      mapEndIdx = i;
    }
    break;
  }
}

if (mapEndIdx === -1) {
  console.error("Mapの終端が見つかりません");
  process.exit(1);
}
console.log(`Map終端: ${mapEndIdx + 1}行目`);

// マーカーの前の行（本来の関数コードの一部）を確認
// `}) ?? [` の行を見つけてデータの開始位置を特定
let dataStartIdx = markerIdx; // マーカー行から
// マーカーの1行前が `}) ?? [` なら、そこも復元が必要
const lineBeforeMarker = lines[markerIdx - 1]?.trim();
console.log(`マーカー前の行: "${lineBeforeMarker}"`);

// データの終端を探す（マーカー以降の最後の `]);` の直前）
// 最後の `]);` が関数のreturn文の一部なので、その前がデータの終端
let dataEndIdx = -1;
for (let i = lines.length - 1; i > markerIdx; i--) {
  if (lines[i].trim() === "]);") {
    dataEndIdx = i;
    break;
  }
}

if (dataEndIdx === -1) {
  console.error("データ終端が見つかりません");
  process.exit(1);
}
console.log(`データ終端: ${dataEndIdx + 1}行目`);

// モチタンデータを抽出（マーカー行からデータ終端の直前まで）
// データ終端の `]);` は元の関数コードの一部なので含めない
const motiData = lines.slice(markerIdx, dataEndIdx);
console.log(`モチタンデータ: ${motiData.length}行`);

// ファイルを再構成
// 1. Map終端（`]);`）の直前にモチタンデータを挿入
// 2. 元の位置からモチタンデータを削除し、元のコード（`]) ?? [`の続き）を復元

// Part A: 0 ~ mapEndIdx-1 (Map の中身)
const partA = lines.slice(0, mapEndIdx);

// Part B: モチタンデータ
const partB = motiData;

// Part C: Map の `]);` + それ以降のコード（モチタンデータの部分を除く）
// mapEndIdx の `]);` から markerIdx-1 まで（元のコード）
const partC_before = lines.slice(mapEndIdx, markerIdx);
// dataEndIdx の `]);` から最後まで（元のコード）
const partC_after = lines.slice(dataEndIdx);

const newLines = [...partA, ...partB, ...partC_before, ...partC_after];

writeFileSync(EXT_FILE, newLines.join("\n"), "utf-8");

console.log(`\n修正完了:`);
console.log(`  元: ${lines.length}行`);
console.log(`  後: ${newLines.length}行`);
