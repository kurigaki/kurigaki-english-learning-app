#!/usr/bin/env node
/**
 * exampleJa 補完スクリプト
 * モチタンスクレイプデータから exampleJa が未設定の単語に日本語訳を補完する
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "scripts/motitown/data");

// モチタンスクレイプデータからword→exampleJaのマップを構築
const motiMap = new Map();
const files = readdirSync(DATA_DIR).filter(f => f.endsWith(".json") && f !== "all_scraped.json");
for (const file of files) {
  const data = JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
  for (const w of data) {
    if (w.exampleJa && w.word) {
      const key = w.word.toLowerCase();
      if (!motiMap.has(key)) motiMap.set(key, w.exampleJa);
    }
  }
}
console.log(`モチタンデータ: ${motiMap.size}語の exampleJa を取得`);

const COURSE_FILES = [
  "src/data/words/junior.js",
  "src/data/words/senior.js",
  "src/data/words/toeic.js",
  "src/data/words/eiken.js",
  "src/data/words/conversation.js",
];

let totalFilled = 0;

for (const relPath of COURSE_FILES) {
  const filePath = join(ROOT, relPath);
  let content = readFileSync(filePath, "utf-8");
  let filled = 0;

  // exampleJa がないエントリを探してモチタンデータで補完
  // パターン: example: "...", difficulty: (exampleJaフィールドなし)
  // または: example: "...", exampleJa: undefined (明示的undefined)

  // 各単語エントリを正規表現で処理
  content = content.replace(
    /\{ id: (\d+), word: "([^"]*)"(.*?), example: "([^"]*)"((?:, exampleJa: "[^"]*")?)(.*?) \}/g,
    (match, id, word, pre, example, exJaPart, post) => {
      // 既にexampleJaがある場合はスキップ
      if (exJaPart && exJaPart.includes('exampleJa: "') && !exJaPart.includes('exampleJa: ""')) {
        return match;
      }

      // モチタンデータから取得
      const ja = motiMap.get(word.toLowerCase());
      if (!ja) return match;

      const escapedJa = ja.replace(/"/g, '\\"');
      filled++;

      if (exJaPart) {
        // 既存の空exampleJaを置換
        return match.replace(exJaPart, `, exampleJa: "${escapedJa}"`);
      } else {
        // exampleJaフィールドを追加（exampleの後に）
        return match.replace(
          `example: "${example}"`,
          `example: "${example}", exampleJa: "${escapedJa}"`
        );
      }
    }
  );

  if (filled > 0) {
    writeFileSync(filePath, content, "utf-8");
    console.log(`✅ ${relPath}: ${filled}語に exampleJa を補完`);
    totalFilled += filled;
  } else {
    console.log(`  ${relPath}: 補完対象なし`);
  }
}

console.log(`\n✅ 合計 ${totalFilled}語に exampleJa を補完しました`);
