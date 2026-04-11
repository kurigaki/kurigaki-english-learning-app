#!/usr/bin/env node
// T-VQS-010: エージェント生成のフラグメント修正を master JSON に適用

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MASTER_DIR = path.join(ROOT, "src", "data", "words", "master");
const TMP_DIR = path.join(ROOT, ".tmp");

const dryRun = process.argv.includes("--dry");

// (id, index) → new example
const replacementMap = new Map();
for (let i = 1; i <= 11; i++) {
  const p = path.join(TMP_DIR, `fragments-batch-${String(i).padStart(2, "0")}-out.json`);
  if (!fs.existsSync(p)) {
    console.warn(`[WARN] Missing ${p}`);
    continue;
  }
  const arr = JSON.parse(fs.readFileSync(p, "utf-8"));
  for (const e of arr) {
    const key = `${e.id}::${e.index}`;
    if (replacementMap.has(key)) continue;
    replacementMap.set(key, { en: e.en, ja: e.ja, context: e.context });
  }
}

console.log(`Loaded ${replacementMap.size} unique replacements`);

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
let applied = 0, notFound = 0;

for (const lv of levels) {
  const filePath = path.join(MASTER_DIR, `level-${lv}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let changed = false;

  for (const word of data) {
    for (let i = 0; i < word.examples.length; i++) {
      const key = `${word.id}::${i}`;
      const rep = replacementMap.get(key);
      if (!rep) continue;
      word.examples[i] = { en: rep.en, ja: rep.ja, context: rep.context };
      applied++;
      changed = true;
    }
  }

  if (changed && !dryRun) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    console.log(`Updated: ${path.basename(filePath)}`);
  }
}

console.log("\n=== Summary ===");
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Applied: ${applied}`);
console.log(`Expected: ${replacementMap.size}`);
if (applied !== replacementMap.size) {
  notFound = replacementMap.size - applied;
  console.warn(`[WARN] Not applied: ${notFound}`);
}
