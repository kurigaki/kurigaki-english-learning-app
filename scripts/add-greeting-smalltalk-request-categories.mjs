#!/usr/bin/env node
// T-VQS-031: greeting / smalltalk / request カテゴリを既存語に付与
//
// 目的:
//   現状 greeting=13, smalltalk=2, request=0 と極端に少ないため、
//   該当する既存の基本語にカテゴリを追加する。
//
// ポリシー: 既存の categories を保持したまま、該当カテゴリを追加。
//   1語につき categories は最大5個程度まで（現状の規約は1-3個だが、
//   基本語は用途が複数あるため緩和）

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const dryRun = process.argv.includes("--dry");

// カテゴリ追加対象: word → 追加する category
const ADDITIONS = [
  // greeting（挨拶）
  { word: "hello",     category: "greeting" },
  { word: "goodbye",   category: "greeting" },
  { word: "please",    category: "greeting" },
  { word: "sorry",     category: "greeting" },
  { word: "excuse me", category: "greeting" },
  { word: "thank you", category: "greeting" },
  { word: "thanks",    category: "greeting" }, // 既にgreetingのはず
  { word: "welcome",   category: "greeting" },
  { word: "hi",        category: "greeting" }, // 既にgreetingのはず
  { word: "bye",       category: "greeting" }, // 既にgreetingのはず
  { word: "good morning",   category: "greeting" },
  { word: "good afternoon", category: "greeting" },
  { word: "good night",     category: "greeting" },
  { word: "see you",        category: "greeting" },

  // smalltalk（雑談）
  { word: "weather",   category: "smalltalk" },
  { word: "nice",      category: "smalltalk" },
  { word: "fine",      category: "smalltalk" },
  { word: "today",     category: "smalltalk" },
  { word: "yesterday", category: "smalltalk" },
  { word: "tomorrow",  category: "smalltalk" },
  { word: "weekend",   category: "smalltalk" },
  { word: "morning",   category: "smalltalk" },
  { word: "afternoon", category: "smalltalk" },
  { word: "evening",   category: "smalltalk" },
  { word: "night",     category: "smalltalk" },
  { word: "sounds good", category: "smalltalk" }, // 既にあるはず
  { word: "not bad",   category: "smalltalk" },   // 既にあるはず

  // request（依頼）
  { word: "please",  category: "request" },
  { word: "could",   category: "request" },
  { word: "would",   category: "request" },
  { word: "may",     category: "request" },
  { word: "can",     category: "request" },
  { word: "help",    category: "request" },
  { word: "ask",     category: "request" },
  { word: "need",    category: "request" },
  { word: "want",    category: "request" },
  { word: "let",     category: "request" },
  { word: "mind",    category: "request" }, // "would you mind"
];

// -------- マスター処理 --------
const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const masterFiles = {};
for (const lv of levels) {
  masterFiles[lv] = {
    path: path.join(MASTER_DIR, `level-${lv}.json`),
    data: JSON.parse(fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8")),
  };
}

let added = 0, skipped = 0;
const notFound = [];
const changedLevels = new Set();

for (const { word, category } of ADDITIONS) {
  let found = false;
  for (const lv of levels) {
    for (const w of masterFiles[lv].data) {
      if (w.word.toLowerCase() !== word.toLowerCase()) continue;
      found = true;
      // 該当カテゴリが既にあるならスキップ
      if (w.categories.includes(category)) {
        skipped++;
        continue;
      }
      // 「can」のように複数 partOfSpeech がある場合は最初にマッチしたものに付与
      // 名詞・動詞両方ある場合 → 全てに付与
      w.categories.push(category);
      added++;
      changedLevels.add(lv);
    }
  }
  if (!found) notFound.push(word);
}

console.log("=== Summary ===");
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Added: ${added}`);
console.log(`Skipped (already has category): ${skipped}`);
if (notFound.length) console.log(`Not found: ${notFound.join(", ")}`);

// カテゴリ分布再集計
const all = levels.flatMap((lv) => masterFiles[lv].data);
const greeting = all.filter((w) => w.categories.includes("greeting")).length;
const smalltalk = all.filter((w) => w.categories.includes("smalltalk")).length;
const request = all.filter((w) => w.categories.includes("request")).length;
console.log(`\nAfter: greeting=${greeting}, smalltalk=${smalltalk}, request=${request}`);

if (!dryRun) {
  for (const lv of changedLevels) {
    fs.writeFileSync(masterFiles[lv].path, JSON.stringify(masterFiles[lv].data, null, 2) + "\n");
    console.log(`Updated: level-${lv}.json`);
  }
}
