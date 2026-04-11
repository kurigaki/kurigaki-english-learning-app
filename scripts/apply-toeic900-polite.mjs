#!/usr/bin/env node
// T-VQS-012: エージェントによる変換結果を元の JSON に適用するスクリプト
//
// 手順:
//   1. .tmp/toeic900-batch-*-out.json をすべて読み込んでマージ
//   2. 元の JSON に対して id + index で特定し、ja フィールドを after で上書き
//   3. `--dry` で件数とサンプルを表示、無しで本番実行
//
// 前提: 事前に `npm run test` を走らせて現状が green であること

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MASTER_DIR = path.join(ROOT, "src", "data", "words", "master");
const TMP_DIR = path.join(ROOT, ".tmp");

const dryRun = process.argv.includes("--dry");

// 全バッチ結果を読み込み
const batches = [];
for (let i = 1; i <= 10; i++) {
  const p = path.join(TMP_DIR, `toeic900-batch-${i}-out.json`);
  if (!fs.existsSync(p)) {
    console.error(`Missing: ${p}`);
    process.exit(1);
  }
  const arr = JSON.parse(fs.readFileSync(p, "utf-8"));
  batches.push(...arr);
}
console.log(`Loaded ${batches.length} conversion entries from 10 batches`);

// (id, index) → after のマップ
const conversionMap = new Map();
for (const item of batches) {
  if (typeof item.after !== "string" || item.after.length === 0) {
    console.error("Invalid entry (missing after):", item);
    process.exit(1);
  }
  const key = `${item.id}::${item.index}`;
  conversionMap.set(key, item);
}

// 各レベルファイルを更新
const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
let applied = 0, skippedSame = 0, notFound = 0;

for (const lv of levels) {
  const filePath = path.join(MASTER_DIR, `level-${lv}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let changed = false;

  for (const word of data) {
    if (!word.courses.some((c) => c.course === "toeic" && c.stage === "900")) continue;
    for (let i = 0; i < word.examples.length; i++) {
      const key = `${word.id}::${i}`;
      const conv = conversionMap.get(key);
      if (!conv) continue;
      if (conv.ja !== word.examples[i].ja) {
        notFound++;
        console.warn(`Mismatch at ${key}: expected "${conv.ja}" but file has "${word.examples[i].ja}"`);
        continue;
      }
      if (conv.after === word.examples[i].ja) {
        skippedSame++;
        continue;
      }
      word.examples[i].ja = conv.after;
      applied++;
      changed = true;
    }
  }

  if (changed && !dryRun) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    console.log(`Updated: ${path.basename(filePath)}`);
  }
}

console.log("\n=== Summary ===");
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Applied: ${applied}`);
console.log(`Skipped (already equal): ${skippedSame}`);
console.log(`Not found / mismatch: ${notFound}`);
