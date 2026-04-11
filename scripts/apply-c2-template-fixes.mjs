#!/usr/bin/env node
// T-VQS-045: C2 テンプレ例文の修正結果を master JSON に適用
//
// 入力:
//   .tmp/c2-template-fix-verbs.json    — 28 語 × 3 例文（replace-all）
//   .tmp/c2-template-fix-nouns-[1-5].json — 合計 226 語 × 1 例文（replace-partial）

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MASTER_DIR = path.join(ROOT, "src", "data", "words", "master");
const TMP_DIR = path.join(ROOT, ".tmp");

const dryRun = process.argv.includes("--dry");

// verb バッチ: { id, word, newExamples: [{en,ja,context} x3] }
const verbBatch = JSON.parse(fs.readFileSync(path.join(TMP_DIR, "c2-template-fix-verbs.json"), "utf-8"));
const updateMap = new Map();
for (const entry of verbBatch) {
  updateMap.set(entry.id, { type: "replace-all", examples: entry.newExamples });
}

// noun バッチ: { id, index, en, ja, context }
const nounReplacements = new Map(); // id -> [{ index, en, ja, context }]
for (let i = 1; i <= 5; i++) {
  const data = JSON.parse(fs.readFileSync(path.join(TMP_DIR, `c2-template-fix-nouns-${i}.json`), "utf-8"));
  for (const entry of data) {
    if (!nounReplacements.has(entry.id)) nounReplacements.set(entry.id, []);
    nounReplacements.get(entry.id).push({
      index: entry.index,
      en: entry.en,
      ja: entry.ja,
      context: entry.context,
    });
  }
}
for (const [id, replacements] of nounReplacements.entries()) {
  if (updateMap.has(id)) {
    throw new Error(`Conflict: id ${id} is in both verb and noun batches`);
  }
  updateMap.set(id, { type: "replace-partial", replacements });
}

console.log(`Loaded: ${verbBatch.length} verb words (replace-all) + ${nounReplacements.size} noun words (replace-partial)`);
console.log(`Total words to update: ${updateMap.size}`);

// -------- master 適用 --------
const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
let wordsUpdated = 0;
let examplesReplaced = 0;
const changedLevels = new Set();

for (const lv of levels) {
  const filePath = path.join(MASTER_DIR, `level-${lv}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let changed = false;

  for (const word of data) {
    const update = updateMap.get(word.id);
    if (!update) continue;

    if (update.type === "replace-all") {
      if (update.examples.length !== 3) {
        console.warn(`[WARN] word ${word.id} ${word.word}: expected 3 examples, got ${update.examples.length}`);
        continue;
      }
      for (let i = 0; i < 3; i++) {
        const ex = update.examples[i];
        word.examples[i] = { en: ex.en, ja: ex.ja, context: ex.context };
      }
      examplesReplaced += 3;
    } else if (update.type === "replace-partial") {
      for (const rep of update.replacements) {
        word.examples[rep.index] = { en: rep.en, ja: rep.ja, context: rep.context };
        examplesReplaced++;
      }
    }

    wordsUpdated++;
    changed = true;
  }

  if (changed) {
    changedLevels.add(lv);
    if (!dryRun) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    }
  }
}

console.log(`\n=== Summary ===`);
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Words updated: ${wordsUpdated}`);
console.log(`Examples replaced: ${examplesReplaced}`);
console.log(`Changed levels: ${[...changedLevels].join(", ")}`);
if (wordsUpdated !== updateMap.size) {
  console.warn(`[WARN] Expected ${updateMap.size} updates but applied ${wordsUpdated}`);
}
