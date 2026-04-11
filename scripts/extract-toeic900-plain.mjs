#!/usr/bin/env node
// TOEIC900 の plain form 和訳をすべて抽出して JSON に保存する

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

function isPolite(ja) {
  return (
    ja.endsWith("です。") ||
    ja.endsWith("ます。") ||
    ja.endsWith("でした。") ||
    ja.endsWith("ました。") ||
    ja.endsWith("ません。") ||
    ja.endsWith("ませんでした。") ||
    ja.endsWith("ですか？") ||
    ja.endsWith("ますか？") ||
    ja.endsWith("ください。") ||
    ja.endsWith("ください")
  );
}

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const items = [];

for (const lv of levels) {
  const data = JSON.parse(
    fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8"),
  );
  for (const word of data) {
    if (!word.courses.some((c) => c.course === "toeic" && c.stage === "900")) continue;
    for (let i = 0; i < word.examples.length; i++) {
      const ex = word.examples[i];
      if (isPolite(ex.ja)) continue;
      items.push({
        id: word.id,
        word: word.word,
        index: i,
        en: ex.en,
        ja: ex.ja,
      });
    }
  }
}

const outDir = path.join(__dirname, "..", ".tmp");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "toeic900-plain-sentences.json");
fs.writeFileSync(outPath, JSON.stringify(items, null, 2));
console.log(`Extracted ${items.length} plain-form sentences → ${outPath}`);
