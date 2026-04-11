#!/usr/bin/env node
// T-VQS-042: TOEIC ビジネス文脈の意味を master meaning に追加 + 必要なら courseMeaning で絞る
//
// 設計（重要）:
//   既存テスト "course meaningの全語義がmaster meaningに含まれる" により、
//   courseMeaning の各語義は master meaning に含まれる必要がある。
//   そのため、TOEIC 文脈の意味が master meaning に欠けている場合は
//   まず master meaning を拡張する。
//
//   1 つの語に複数品詞（例: trust noun/verb）がある場合は、対象の品詞エントリのみを更新する。
//
// 更新方針（noun/verb の主要 10 語に限定。子供向けの junior にも正しく使える意味のみ採用）:
//   - space(noun):     宇宙 → 宇宙・空間・余地
//   - source(noun):    源 → 源・情報源・仕入れ先
//   - station(noun):   駅 → 駅・基地
//   - suit(noun):      スーツ → スーツ・訴訟
//   - view(noun):      眺め → 眺め・見解
//   - wire(noun):      電線 → 電線・電信送金
//   - duty(noun):      義務 → 義務・関税
//   - premium(noun):   保険料 → 保険料・割増料金
//   - regard(noun):    敬意 → 敬意・配慮
//   - range(noun):     範囲 → 範囲・品揃え

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const dryRun = process.argv.includes("--dry");

// word + partOfSpeech をキーに、新 master meaning を指定
const UPDATES = [
  { word: "space",   pos: "noun", newMeaning: "宇宙・空間・余地" },
  { word: "source",  pos: "noun", newMeaning: "源・情報源・仕入れ先" },
  { word: "station", pos: "noun", newMeaning: "駅・基地" },
  { word: "suit",    pos: "noun", newMeaning: "スーツ・訴訟" },
  { word: "view",    pos: "noun", newMeaning: "眺め・見解" },
  { word: "wire",    pos: "noun", newMeaning: "電線・電信送金" },
  { word: "duty",    pos: "noun", newMeaning: "義務・関税" },
  { word: "premium", pos: "noun", newMeaning: "保険料・割増料金" },
  { word: "regard",  pos: "noun", newMeaning: "敬意・配慮" },
  { word: "range",   pos: "noun", newMeaning: "範囲・品揃え" },
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
      const oldMeaning = w.meaning;
      w.meaning = upd.newMeaning;
      updated++;
      changedLevels.add(lv);
      appliedLog.push(`[${lv}] ${upd.word}(${upd.pos}): "${oldMeaning}" → "${upd.newMeaning}"`);
    }
  }
  if (!found) notFound.push(`${upd.word}(${upd.pos})`);
}

console.log("=== Summary ===");
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Updated: ${updated}`);
if (notFound.length) console.log(`Not found: ${notFound.join(", ")}`);

console.log(`\n=== Applied ===`);
for (const s of appliedLog) console.log(`  ${s}`);

if (!dryRun) {
  for (const lv of changedLevels) {
    fs.writeFileSync(masterFiles[lv].path, JSON.stringify(masterFiles[lv].data, null, 2) + "\n");
    console.log(`\nUpdated: level-${lv}.json`);
  }
}
