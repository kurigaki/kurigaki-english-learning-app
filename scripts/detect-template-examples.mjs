#!/usr/bin/env node
// T-VQS-045: 非 C2 ステージを含む全単語の例文でテンプレート（使い回し）パターンを検出
//
// 方法:
//   各例文から対象単語を "__W__" に置換し、残った「骨格文」の出現頻度を集計する。
//   骨格が N 件以上の単語で使われている場合、それはテンプレート例文の可能性が高い。
//
// 出力:
//   .tmp/template-skeletons.json — 骨格別の出現数 + サンプル語
//   .tmp/template-example-hits.json — 個別ヒット一覧

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MASTER_DIR = path.join(ROOT, "src", "data", "words", "master");

const MIN_HITS = Number(process.argv.find((a) => a.startsWith("--min="))?.slice(6) || 3);

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];

function maskWord(sentence, word) {
  // 単語の完全一致（語境界あり）+ 変化形（最後に s/es/ed/ing 付き）を __W__ に置換
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${esc}(s|es|ed|ing|d|'s)?\\b`, "gi");
  return sentence.replace(re, "__W__").trim();
}

const skeletonStats = new Map(); // skeleton -> { count, samples: [{word, en}] }

for (const lv of levels) {
  const data = JSON.parse(fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8"));
  for (const w of data) {
    for (const ex of w.examples) {
      const sk = maskWord(ex.en, w.word);
      // __W__ が含まれない場合（固有名詞や熟語等で書き換わらない）はスキップ
      if (!sk.includes("__W__")) continue;
      if (!skeletonStats.has(sk)) {
        skeletonStats.set(sk, { count: 0, samples: [], levels: new Set() });
      }
      const entry = skeletonStats.get(sk);
      entry.count++;
      entry.levels.add(lv);
      if (entry.samples.length < 8) {
        entry.samples.push({ level: lv, word: w.word, en: ex.en });
      }
    }
  }
}

// 頻度 MIN_HITS 以上のテンプレを抽出
const templates = [];
for (const [sk, info] of skeletonStats.entries()) {
  if (info.count >= MIN_HITS) {
    templates.push({
      skeleton: sk,
      count: info.count,
      levels: [...info.levels].sort(),
      samples: info.samples,
    });
  }
}
templates.sort((a, b) => b.count - a.count);

console.log(`=== Template Detection (min hits: ${MIN_HITS}) ===`);
console.log(`Total unique skeletons: ${skeletonStats.size}`);
console.log(`Templates (≥${MIN_HITS} hits): ${templates.length}`);
console.log(`Total template example occurrences: ${templates.reduce((s, t) => s + t.count, 0)}`);

console.log(`\nTop 30 templates:`);
for (const t of templates.slice(0, 30)) {
  console.log(`  [${t.count}x ${t.levels.join(",")}] ${t.skeleton.slice(0, 80)}`);
}

const outDir = path.join(ROOT, ".tmp");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "template-skeletons.json"),
  JSON.stringify(templates, null, 2),
);
console.log(`\nWritten: .tmp/template-skeletons.json`);
