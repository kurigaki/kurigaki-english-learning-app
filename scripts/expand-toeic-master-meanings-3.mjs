#!/usr/bin/env node
// T-VQS-049: TOEIC 多義語 master meaning 拡充 (第3弾)
//
// 第1弾 10 語 + 第2弾 10 語 + 新規エントリ 3 語に続き、
// さらに 14 語の TOEIC 多義語を master 拡張する。

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const dryRun = process.argv.includes("--dry");

const UPDATES = [
  { word: "benefit",  pos: "noun",      newMeaning: "利益・給付・恩恵" },
  { word: "career",   pos: "noun",      newMeaning: "職業・経歴" },
  { word: "decline",  pos: "noun",      newMeaning: "衰退・減少・辞退" },
  { word: "gain",     pos: "noun",      newMeaning: "利益・増加" },
  { word: "guard",    pos: "noun",      newMeaning: "警備員・警備" },
  { word: "study",    pos: "verb",      newMeaning: "勉強する・研究する" },
  { word: "treat",    pos: "verb",      newMeaning: "扱う・治療する" },
  { word: "well",     pos: "adverb",    newMeaning: "上手に・十分に" },
  { word: "estimate", pos: "noun",      newMeaning: "見積もり・推定" },
  { word: "evidence", pos: "noun",      newMeaning: "証拠・根拠" },
  { word: "extent",   pos: "noun",      newMeaning: "程度・範囲" },
  { word: "factor",   pos: "noun",      newMeaning: "要因・要素" },
  { word: "finance",  pos: "noun",      newMeaning: "財政・金融" },
  { word: "tax",      pos: "noun",      newMeaning: "税金・重い負担" },
];

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
      const hasToeic = w.courses.some((c) => c.course === "toeic");
      if (!hasToeic) {
        appliedLog.push(`  [SKIP] [${lv}] ${upd.word}(${upd.pos}): TOEIC 未所属`);
        continue;
      }
      if (w.meaning === upd.newMeaning) continue;
      const oldMeaning = w.meaning;
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
