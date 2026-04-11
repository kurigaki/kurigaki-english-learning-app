#!/usr/bin/env node
// T-VQS-013: エージェント生成結果を master JSON に適用
//
// バッチA: newExamples 3件すべてを差し替え
// バッチB1/B2: replacements で指定された index のみ差し替え

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MASTER_DIR = path.join(ROOT, "src", "data", "words", "master");
const TMP_DIR = path.join(ROOT, ".tmp");

const dryRun = process.argv.includes("--dry");

// 語ID → 変更内容
const updateMap = new Map();

// バッチA: newExamples で全3件を差し替え
const batchA = JSON.parse(fs.readFileSync(path.join(TMP_DIR, "c2-batch-a-out.json"), "utf-8"));
for (const entry of batchA) {
  updateMap.set(entry.id, { type: "replace-all", examples: entry.newExamples });
}

// バッチB1, B2: replacements で指定 index のみ差し替え
for (const batchName of ["c2-batch-b1-out.json", "c2-batch-b2-out.json"]) {
  const data = JSON.parse(fs.readFileSync(path.join(TMP_DIR, batchName), "utf-8"));
  for (const entry of data) {
    updateMap.set(entry.id, { type: "replace-partial", replacements: entry.replacements });
  }
}

console.log(`Loaded ${updateMap.size} word updates`);

// c2 の語は level-c2.json 以外にもあるので全レベル対象
const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
let applied = 0, wordsUpdated = 0;

for (const lv of levels) {
  const filePath = path.join(MASTER_DIR, `level-${lv}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let changed = false;

  for (const word of data) {
    const update = updateMap.get(word.id);
    if (!update) continue;

    if (update.type === "replace-all") {
      // 3件のnewExamples をそのまま差し替え
      const sorted = [...update.examples].sort((a, b) => a.index - b.index);
      if (sorted.length !== 3) {
        console.warn(`[WARN] word ${word.id} ${word.word}: expected 3 new examples, got ${sorted.length}`);
        continue;
      }
      for (let i = 0; i < 3; i++) {
        const ex = sorted[i];
        word.examples[i] = { en: ex.en, ja: ex.ja, context: ex.context };
      }
    } else {
      // 部分差し替え
      for (const rep of update.replacements) {
        if (rep.index < 0 || rep.index >= word.examples.length) {
          console.warn(`[WARN] word ${word.id} invalid index ${rep.index}`);
          continue;
        }
        word.examples[rep.index] = { en: rep.en, ja: rep.ja, context: rep.context };
      }
    }
    wordsUpdated++;
    applied += update.type === "replace-all" ? 3 : update.replacements.length;
    changed = true;
  }

  if (changed && !dryRun) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    console.log(`Updated: ${path.basename(filePath)}`);
  }
}

console.log("\n=== Summary ===");
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Words updated: ${wordsUpdated} / ${updateMap.size}`);
console.log(`Example entries updated: ${applied}`);
