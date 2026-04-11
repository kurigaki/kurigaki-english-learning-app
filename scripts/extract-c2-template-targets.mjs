#!/usr/bin/env node
// T-VQS-045: C2 の 4 テンプレパターンに該当する例文を抽出
//
// 対象パターン:
//   1. "We studied the {word} in detail."
//   2. "They decided to {word} the situation."
//   3. "She managed to {word} effectively."
//   4. "We need to {word} before proceeding."

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MASTER_DIR = path.join(ROOT, "src", "data", "words", "master");

const TEMPLATES = [
  (w) => `We studied the ${w} in detail.`,
  (w) => `They decided to ${w} the situation.`,
  (w) => `She managed to ${w} effectively.`,
  (w) => `We need to ${w} before proceeding.`,
];

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const hits = [];

for (const lv of levels) {
  const data = JSON.parse(fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8"));
  for (const w of data) {
    for (let i = 0; i < w.examples.length; i++) {
      const ex = w.examples[i];
      for (const tpl of TEMPLATES) {
        if (ex.en === tpl(w.word)) {
          hits.push({
            id: w.id,
            word: w.word,
            meaning: w.meaning,
            partOfSpeech: w.partOfSpeech,
            categories: w.categories,
            level: lv,
            index: i,
            currentEn: ex.en,
            currentJa: ex.ja,
            currentContext: ex.context,
            // 他の例文を参考に
            otherExamples: w.examples
              .map((e, ii) => ({ index: ii, en: e.en, ja: e.ja }))
              .filter((_, ii) => ii !== i),
          });
          break;
        }
      }
    }
  }
}

console.log(`Extracted ${hits.length} template hits`);
const wordSet = new Set(hits.map((h) => h.id));
console.log(`Unique words: ${wordSet.size}`);

// 1 語で複数テンプレにヒットする語の内訳
const byWord = new Map();
for (const h of hits) {
  if (!byWord.has(h.id)) byWord.set(h.id, []);
  byWord.get(h.id).push(h);
}
const multi = [...byWord.values()].filter((arr) => arr.length >= 2);
console.log(`Words with ≥2 template hits: ${multi.length}`);

const outDir = path.join(ROOT, ".tmp");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "c2-template-targets.json"),
  JSON.stringify(hits, null, 2),
);
console.log(`\nWritten: .tmp/c2-template-targets.json`);
