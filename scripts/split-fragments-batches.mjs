#!/usr/bin/env node
// T-VQS-010: ユニークフラグメント 2,131 件をバッチ分割
//
// 戦略: 単語の全所属コースから「最も易しいステージ」を基準にグループ化。
// easiest level 順にバッチを作成（junior/eiken5 など簡単なものから）。
//
// 出力: .tmp/fragments-unique-batch-XX.json (各 ~200 件)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, "..", ".tmp");
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

// course:stage → 難易度スコア（小さい方が易しい）
const LEVEL_SCORE = {
  "eiken:5": 1,
  "junior:1": 1,
  "conversation:a1": 1,
  "eiken:4": 2,
  "junior:2": 2,
  "toeic:500": 2,
  "conversation:a2": 2,
  "eiken:3": 3,
  "junior:3": 3,
  "senior:1": 3,
  "toeic:600": 3,
  "conversation:b1": 3,
  "eiken:pre2": 4,
  "senior:2": 4,
  "toeic:700": 4,
  "conversation:b2": 4,
  "eiken:2": 5,
  "senior:3": 5,
  "toeic:800": 5,
  "conversation:c1": 5,
  "eiken:pre1": 6,
  "toeic:900": 6,
  "conversation:c2": 6,
  "eiken:1": 7,
};

// 全マスター単語を読み込み（courses情報取得用）
const allMaster = new Map(); // id → word
for (const lv of ["a1", "a2", "b1", "b2", "c1", "c2"]) {
  const data = JSON.parse(fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8"));
  for (const w of data) allMaster.set(w.id, w);
}

const unique = JSON.parse(fs.readFileSync(path.join(TMP_DIR, "fragments-all-unique.json"), "utf-8"));

// 各エントリに easiestLevel を付与
for (const e of unique) {
  const w = allMaster.get(e.id);
  if (!w) {
    e.easiestLevel = 99;
    e.allCourses = [];
    continue;
  }
  let minScore = 99;
  for (const c of w.courses) {
    const key = `${c.course}:${c.stage}`;
    const s = LEVEL_SCORE[key] ?? 99;
    if (s < minScore) minScore = s;
  }
  e.easiestLevel = minScore;
  e.allCourses = w.courses.map((c) => `${c.course}:${c.stage}`);
  // 他の例文も参照できるよう付与
  e.otherExamples = w.examples
    .map((ex, i) => ({ index: i, en: ex.en, ja: ex.ja }))
    .filter((_, i) => i !== e.index);
}

// 難易度順にソート
unique.sort((a, b) => a.easiestLevel - b.easiestLevel || a.id - b.id);

// バッチ分割（各200件）
const BATCH_SIZE = 200;
const batches = Math.ceil(unique.length / BATCH_SIZE);
for (let i = 0; i < batches; i++) {
  const slice = unique.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
  const outPath = path.join(TMP_DIR, `fragments-batch-${String(i + 1).padStart(2, "0")}.json`);
  fs.writeFileSync(outPath, JSON.stringify(slice, null, 2));
  const levelCounts = {};
  for (const e of slice) {
    levelCounts[e.easiestLevel] = (levelCounts[e.easiestLevel] || 0) + 1;
  }
  console.log(
    `Batch ${i + 1}: ${slice.length} entries, levels:`,
    Object.entries(levelCounts).sort().map(([k, v]) => `L${k}:${v}`).join(" "),
  );
}
console.log(`\nTotal: ${unique.length} entries, ${batches} batches`);
