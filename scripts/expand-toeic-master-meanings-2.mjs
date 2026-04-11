#!/usr/bin/env node
// T-VQS-042 拡充: TOEIC 多義語の master meaning 追加 (第2弾)
//
// 第1弾 (add-toeic-course-meanings.mjs) で 10 語を拡張済み。
// 本スクリプトでは TOEIC コースに所属する主要な多義語のうち、
// 既存 master meaning に TOEIC ビジネス文脈の意味が欠けている
// 10 語をさらに拡張する。
//
// 設計は第1弾と同じ: master meaning 拡張のみで、他コースの既存データは
// そのまま利用可能。courseMeaning は既存テスト整合性のため拡張対象外。

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const dryRun = process.argv.includes("--dry");

const UPDATES = [
  { word: "contact",   pos: "noun", newMeaning: "連絡・連絡先" },
  { word: "introduce", pos: "verb", newMeaning: "紹介する・導入する" },
  { word: "project",   pos: "noun", newMeaning: "計画・プロジェクト" },
  { word: "schedule",  pos: "noun", newMeaning: "スケジュール・予定表" },
  { word: "test",      pos: "noun", newMeaning: "テスト・試験・検査" },
  { word: "enter",     pos: "verb", newMeaning: "入る・入力する" },
  { word: "offer",     pos: "verb", newMeaning: "申し出る・提供する" },
  { word: "trade",     pos: "noun", newMeaning: "貿易・取引" },
  { word: "load",      pos: "noun", newMeaning: "荷物・積載量" },
  { word: "sort",      pos: "noun", newMeaning: "種類・分類" },
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

let updated = 0;
const notFound = [];
const changedLevels = new Set();
const appliedLog = [];

for (const upd of UPDATES) {
  let found = false;
  for (const lv of levels) {
    for (const w of masterFiles[lv].data) {
      if (w.word.toLowerCase() !== upd.word) continue;
      if (w.partOfSpeech !== upd.pos) continue;
      found = true;
      // TOEIC コースに所属していない語はスキップ
      const hasToeic = w.courses.some((c) => c.course === "toeic");
      if (!hasToeic) {
        appliedLog.push(`  [SKIP] [${lv}] ${upd.word}(${upd.pos}): TOEIC 未所属`);
        continue;
      }
      const oldMeaning = w.meaning;
      if (oldMeaning === upd.newMeaning) {
        appliedLog.push(`  [SKIP] [${lv}] ${upd.word}(${upd.pos}): 既に更新済み`);
        continue;
      }
      w.meaning = upd.newMeaning;
      updated++;
      changedLevels.add(lv);
      appliedLog.push(`  [${lv}] ${upd.word}(${upd.pos}): "${oldMeaning}" → "${upd.newMeaning}"`);
    }
  }
  if (!found) notFound.push(`${upd.word}(${upd.pos})`);
}

console.log("=== Summary ===");
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Updated: ${updated}`);
if (notFound.length) console.log(`Not found: ${notFound.join(", ")}`);

console.log(`\n=== Log ===`);
for (const s of appliedLog) console.log(s);

if (!dryRun) {
  for (const lv of changedLevels) {
    fs.writeFileSync(masterFiles[lv].path, JSON.stringify(masterFiles[lv].data, null, 2) + "\n");
    console.log(`\nUpdated: level-${lv}.json`);
  }
}
