#!/usr/bin/env node
// 初回コンテンツフラグ付与スクリプト（T-VQS-001-B）
// 指定したIDの単語に contentFlags を追加する

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

// id → contentFlags のマッピング
// ID 3 (abortion), 9 (abuse), 50 (alcohol) は手動編集済みのためここには含めない
const FLAG_MAP = {
  151: ["substance"],            // beer
  182: ["violence"],             // bomb
  277: ["substance"],            // cigarette
  564: ["violence"],             // gun
  936: ["substance"],            // smoking
  10439: ["substance"],          // drug
  10772: ["violence"],           // kill
  10901: ["violence"],           // murder (noun)
  11242: ["substance"],          // smoke (verb)
  11402: ["violence"],           // violent
  11417: ["violence"],           // weapon
  11430: ["substance"],          // wine
  21970: ["violence"],           // murder (verb)
  22387: ["sensitive"],          // racism
  22673: ["sensitive"],          // slave
  22830: ["violence"],           // terror
  22831: ["violence"],           // terrorist
  22982: ["violence"],           // violence
};

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const stats = { updated: 0, skipped: 0, notFound: [] };
const targetIds = new Set(Object.keys(FLAG_MAP).map(Number));
const found = new Set();

for (const lv of levels) {
  const filePath = path.join(MASTER_DIR, `level-${lv}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let changed = false;

  for (const word of data) {
    if (!targetIds.has(word.id)) continue;
    found.add(word.id);
    const flags = FLAG_MAP[word.id];
    if (word.contentFlags && JSON.stringify(word.contentFlags) === JSON.stringify(flags)) {
      stats.skipped++;
      continue;
    }
    // contentFlags を frequencyTier の直後に挿入する形で追加
    // JSON.stringifyではkey順が元のオブジェクトの順序に従うため、
    // 一旦オブジェクトを再構築して順序を制御する
    const newWord = {};
    for (const [k, v] of Object.entries(word)) {
      newWord[k] = v;
      if (k === "frequencyTier") {
        newWord.contentFlags = flags;
      }
    }
    // word のキーを in-place で置換
    for (const k of Object.keys(word)) delete word[k];
    for (const [k, v] of Object.entries(newWord)) word[k] = v;
    stats.updated++;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    console.log(`Updated: ${path.basename(filePath)}`);
  }
}

for (const id of targetIds) {
  if (!found.has(id)) stats.notFound.push(id);
}

console.log("\n=== Summary ===");
console.log(`Updated: ${stats.updated}`);
console.log(`Skipped (already flagged): ${stats.skipped}`);
if (stats.notFound.length) console.log(`Not found: ${stats.notFound.join(", ")}`);
