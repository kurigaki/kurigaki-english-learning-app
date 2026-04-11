#!/usr/bin/env node
// TOEIC900 例文の和訳文末パターンを集計するスクリプト

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const endings = {};
let total = 0, polite = 0, plain = 0;

// 文末から最長8文字を抽出
function getEnding(ja) {
  // 「。」を含めた末尾
  return ja.slice(-8);
}

// 「です/ます調」判定
function isPolite(ja) {
  return (
    ja.endsWith("です。") ||
    ja.endsWith("ます。") ||
    ja.endsWith("でした。") ||
    ja.endsWith("ました。") ||
    ja.endsWith("ません。") ||
    ja.endsWith("ませんでした。") ||
    ja.endsWith("ですか？") ||
    ja.endsWith("ますか？") ||
    ja.endsWith("ください。")
  );
}

for (const lv of levels) {
  const data = JSON.parse(
    fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8"),
  );
  for (const word of data) {
    if (!word.courses.some((c) => c.course === "toeic" && c.stage === "900")) continue;
    for (const ex of word.examples) {
      total++;
      if (isPolite(ex.ja)) {
        polite++;
      } else {
        plain++;
        // 最後の2-5文字を見る
        for (const len of [5, 4, 3, 2]) {
          const suffix = ex.ja.slice(-len);
          endings[suffix] = (endings[suffix] || 0) + 1;
          break; // 1つだけカウント
        }
      }
    }
  }
}

console.log(`Total: ${total}`);
console.log(`Polite: ${polite}`);
console.log(`Plain: ${plain} (${(plain/total*100).toFixed(1)}%)`);
console.log("\nTop 30 plain endings (last 5 chars):");
Object.entries(endings)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .forEach(([k, v]) => console.log(`  ${v.toString().padStart(4)} : ${k}`));
