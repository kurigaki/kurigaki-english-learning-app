#!/usr/bin/env node
// T-VQS-010: 全ステージの名詞句フラグメント例文を検出
//
// 判定基準（ポリシー §5.1「5〜12語の完全文」）:
//   1. 4語以下 → フラグメント（完全文ではない）
//   2. 小文字始まり（"absolute power." 等）→ フラグメント
//   3. 主語 + 動詞がない名詞句のみ → フラグメント
//      簡易判定: 大文字始まりかつピリオド終わりでも、動詞らしきトークンがない
//
// 重要: この判定は保守的に。疑わしいものは「要確認」として出力。

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

function wordCount(en) {
  return en.trim().split(/\s+/).filter(Boolean).length;
}

function startsLowercase(en) {
  return /^[a-z]/.test(en);
}

function endsWithPeriod(en) {
  return /[.!?]$/.test(en.trim());
}

// 判定: フラグメントであるかどうか
function isFragment(en) {
  const wc = wordCount(en);
  if (wc < 5) return true;
  if (startsLowercase(en)) return true;
  if (!endsWithPeriod(en)) return true;
  return false;
}

// フラグメント分類
function classifyFragment(en) {
  const wc = wordCount(en);
  if (startsLowercase(en)) return "lowercase";
  if (wc < 3) return "2words";
  if (wc < 5) return `${wc}words`;
  if (!endsWithPeriod(en)) return "no-period";
  return "other";
}

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];

// 集計結果
const byCoursesAndStages = new Map(); // "course:stage" → { words: Set, entries: [] }

for (const lv of levels) {
  const data = JSON.parse(fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8"));
  for (const word of data) {
    for (let i = 0; i < word.examples.length; i++) {
      const ex = word.examples[i];
      if (!isFragment(ex.en)) continue;

      const cls = classifyFragment(ex.en);
      // 属する全コース・ステージに記録
      for (const c of word.courses) {
        const key = `${c.course}:${c.stage}`;
        if (!byCoursesAndStages.has(key)) {
          byCoursesAndStages.set(key, { words: new Set(), entries: [], byClass: {} });
        }
        const g = byCoursesAndStages.get(key);
        g.words.add(word.id);
        g.byClass[cls] = (g.byClass[cls] || 0) + 1;
        g.entries.push({
          id: word.id,
          word: word.word,
          partOfSpeech: word.partOfSpeech,
          meaning: word.meaning,
          categories: word.categories,
          courseMeaning: c.meaning,
          course: c.course,
          stage: c.stage,
          index: i,
          en: ex.en,
          ja: ex.ja,
          context: ex.context,
          class: cls,
        });
      }
    }
  }
}

// コース順に出力
const courseOrder = ["junior", "senior", "eiken", "toeic", "conversation"];
const stageOrder = {
  junior: ["1", "2", "3"],
  senior: ["1", "2", "3"],
  eiken: ["5", "4", "3", "pre2", "2", "pre1", "1"],
  toeic: ["500", "600", "700", "800", "900"],
  conversation: ["a1", "a2", "b1", "b2", "c1", "c2"],
};

let totalEntries = 0;
console.log("=== Fragment Summary by Stage ===\n");
for (const course of courseOrder) {
  let courseTotal = 0;
  console.log(`[${course}]`);
  for (const stage of stageOrder[course]) {
    const key = `${course}:${stage}`;
    const g = byCoursesAndStages.get(key);
    if (!g) {
      console.log(`  ${stage}: 0`);
      continue;
    }
    console.log(`  ${stage}: ${g.entries.length} entries / ${g.words.size} words`);
    Object.entries(g.byClass)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cls, n]) => console.log(`     - ${cls}: ${n}`));
    courseTotal += g.entries.length;
  }
  console.log(`  SUBTOTAL: ${courseTotal}\n`);
  totalEntries += courseTotal;
}
console.log(`=== GRAND TOTAL (sum, 複数コース所属語は複数計上): ${totalEntries} ===`);

// 全フラグメント単語のユニークリストも出力（重複なし）
const uniqueFragments = new Map(); // key: `${id}::${index}` → entry
for (const g of byCoursesAndStages.values()) {
  for (const e of g.entries) {
    const key = `${e.id}::${e.index}`;
    if (!uniqueFragments.has(key)) uniqueFragments.set(key, e);
  }
}
console.log(`Unique fragment example entries: ${uniqueFragments.size}`);

// 出力
const outDir = path.join(__dirname, "..", ".tmp");
fs.mkdirSync(outDir, { recursive: true });

// コース別 JSON
for (const course of courseOrder) {
  const entries = [];
  for (const stage of stageOrder[course]) {
    const key = `${course}:${stage}`;
    const g = byCoursesAndStages.get(key);
    if (g) entries.push(...g.entries);
  }
  if (entries.length > 0) {
    // 語ID+インデックスでユニーク化（同じ語が同ステージ内で重複するケース対応）
    const seen = new Set();
    const unique = [];
    for (const e of entries) {
      const key = `${e.id}::${e.index}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(e);
    }
    fs.writeFileSync(
      path.join(outDir, `fragments-${course}.json`),
      JSON.stringify(unique, null, 2),
    );
    console.log(`Written: fragments-${course}.json (${unique.length} entries)`);
  }
}

// 全体ユニーク版
fs.writeFileSync(
  path.join(outDir, "fragments-all-unique.json"),
  JSON.stringify([...uniqueFragments.values()], null, 2),
);
console.log(`Written: fragments-all-unique.json (${uniqueFragments.size} entries)`);
