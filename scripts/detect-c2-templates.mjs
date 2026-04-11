#!/usr/bin/env node
// T-VQS-013: 英会話 C2 の例文でテンプレートパターンに完全一致するものを検出
//
// レビューで発見された4パターン:
//   1. "The concept of X is fascinating."
//   2. "The result was quite X."
//   3. "It seemed remarkably X."
//   4. "The X quality stood out."
//
// X は単語ごとに置換される変数。各語を 1 パターンずつテスト。

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

function matchesTemplate(en, word) {
  const patterns = [
    `The concept of ${word} is fascinating.`,
    `The result was quite ${word}.`,
    `It seemed remarkably ${word}.`,
    `The ${word} quality stood out.`,
  ];
  return patterns.includes(en);
}

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const hits = [];
const wordHitCount = new Map();
const allTemplateWords = new Set();

for (const lv of levels) {
  const data = JSON.parse(
    fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8"),
  );
  for (const word of data) {
    if (!word.courses.some((c) => c.course === "conversation" && c.stage === "c2")) continue;
    let templateCount = 0;
    for (let i = 0; i < word.examples.length; i++) {
      const ex = word.examples[i];
      if (matchesTemplate(ex.en, word.word)) {
        hits.push({
          id: word.id,
          word: word.word,
          partOfSpeech: word.partOfSpeech,
          meaning: word.meaning,
          categories: word.categories,
          index: i,
          en: ex.en,
          ja: ex.ja,
          context: ex.context,
          // 他の例文（非テンプレート）を参照情報として保持
          otherExamples: word.examples
            .map((e, ii) => ({ index: ii, en: e.en, ja: e.ja }))
            .filter((_, ii) => ii !== i),
        });
        templateCount++;
      }
    }
    if (templateCount > 0) {
      wordHitCount.set(word.id, { word: word.word, count: templateCount });
      allTemplateWords.add(word.id);
    }
  }
}

console.log("=== Detection Summary ===");
console.log(`Words with template examples: ${wordHitCount.size}`);
console.log(`Total template example entries: ${hits.length}`);

// 語ごとの件数分布
const byCount = { 1: 0, 2: 0, 3: 0 };
for (const { count } of wordHitCount.values()) {
  byCount[count] = (byCount[count] || 0) + 1;
}
console.log(`Words with 1 template: ${byCount[1]}`);
console.log(`Words with 2 templates: ${byCount[2]}`);
console.log(`Words with 3 templates (all): ${byCount[3]}`);

const outDir = path.join(__dirname, "..", ".tmp");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "c2-template-hits.json"),
  JSON.stringify(hits, null, 2),
);
console.log(`\nDetail written to: ${path.join(outDir, "c2-template-hits.json")}`);
