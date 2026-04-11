#!/usr/bin/env node
// T-VQS-047: TOEIC 多義語の欠落していた品詞別エントリに CourseAssignment を追加
//
// 背景:
//   T-VQS-042 で master meaning を拡張したが、同じ語の別品詞エントリ
//   (例: record(noun) に対する record(verb) の TOEIC assignment) が
//   欠落しているケースが多数あった。これらを追加して TOEIC 学習者が
//   動詞/名詞両方で多義語を学習できるようにする。
//
// 方針:
//   - 既存の他品詞 TOEIC assignment の stage を参考に設定
//   - tier は 1（頻出）を基本とし、c1 レベル語のみ tier 2
//   - idempotent: 既に TOEIC 所属なら スキップ

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const dryRun = process.argv.includes("--dry");

// word + pos + stage + tier を指定
const ADDITIONS = [
  { word: "ship",    pos: "verb", stage: "500", tier: 1 },
  { word: "trade",   pos: "verb", stage: "500", tier: 1 },
  { word: "test",    pos: "verb", stage: "500", tier: 1 },
  { word: "record",  pos: "noun", stage: "600", tier: 1 },
  { word: "plan",    pos: "noun", stage: "500", tier: 1 },
  { word: "offer",   pos: "noun", stage: "500", tier: 1 },
  { word: "promise", pos: "noun", stage: "500", tier: 1 },
  { word: "contact", pos: "verb", stage: "500", tier: 1 },
  { word: "sort",    pos: "verb", stage: "900", tier: 2 },
  { word: "project", pos: "verb", stage: "700", tier: 1 },
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
const appliedLog = [];

for (const upd of ADDITIONS) {
  let found = false;
  for (const lv of levels) {
    for (const w of masterFiles[lv].data) {
      if (w.word.toLowerCase() !== upd.word) continue;
      if (w.partOfSpeech !== upd.pos) continue;
      found = true;
      const existing = w.courses.find((c) => c.course === "toeic");
      if (existing) {
        skipped++;
        appliedLog.push(`  [SKIP] [${lv}] ${upd.word}(${upd.pos}): 既に TOEIC:${existing.stage} 所属`);
        continue;
      }
      w.courses.push({ course: "toeic", stage: upd.stage, tier: upd.tier });
      added++;
      changedLevels.add(lv);
      appliedLog.push(`  [${lv}] ${upd.word}(${upd.pos}): + TOEIC:${upd.stage} tier:${upd.tier}`);
    }
  }
  if (!found) notFound.push(`${upd.word}(${upd.pos})`);
}

console.log("=== Summary ===");
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Added: ${added}`);
console.log(`Skipped: ${skipped}`);
if (notFound.length) console.log(`Not found: ${notFound.join(", ")}`);

console.log(`\n=== Log ===`);
for (const s of appliedLog) console.log(s);

if (!dryRun) {
  for (const lv of changedLevels) {
    fs.writeFileSync(masterFiles[lv].path, JSON.stringify(masterFiles[lv].data, null, 2) + "\n");
    console.log(`\nUpdated: level-${lv}.json`);
  }
}
