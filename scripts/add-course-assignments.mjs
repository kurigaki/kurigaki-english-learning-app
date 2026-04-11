#!/usr/bin/env node
// T-VQS-034/030/036: 既存 MasterWord に追加の CourseAssignment を投入
//
// 対象:
//   T-VQS-034: 英検5級 WH疑問詞 → 既存語に eiken:5 を追加
//   T-VQS-030: 英会話A1 旅行語彙 → 既存語に conversation:a1 を追加
//   T-VQS-036: TOEIC500 ビジネス語 → 既存語に toeic:500 を追加
//
// ポリシー:
//   - 該当語の所属リストに新コースを追加するだけ（新規作成しない）
//   - 既に所属済みならスキップ
//   - tier は新規コース用に個別設定（CEFR 目標範囲 と 一致するため tier1 を期待）
//   - T-VQS-034 の whom/whose は未登録なのでこのスクリプトでは処理しない（T-VQS-035 と合流）

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const dryRun = process.argv.includes("--dry");

// 追加対象: word → (course, stage, tier) の追加
const ADDITIONS = [
  // T-VQS-034 英検5級 WH疑問詞（A1 レベル → tier1）
  { word: "what",  course: "eiken", stage: "5", tier: 1 },
  { word: "where", course: "eiken", stage: "5", tier: 1 },
  { word: "when",  course: "eiken", stage: "5", tier: 1 },
  { word: "who",   course: "eiken", stage: "5", tier: 1 },
  { word: "which", course: "eiken", stage: "5", tier: 1 },
  { word: "why",   course: "eiken", stage: "5", tier: 1 },
  { word: "how",   course: "eiken", stage: "5", tier: 1 },

  // T-VQS-030 英会話A1 旅行語彙（A1-A2 → tier1）
  { word: "passport",    course: "conversation", stage: "a1", tier: 1 },
  { word: "flight",      course: "conversation", stage: "a1", tier: 1 },
  { word: "taxi",        course: "conversation", stage: "a1", tier: 1 },
  { word: "menu",        course: "conversation", stage: "a1", tier: 1 },
  { word: "map",         course: "conversation", stage: "a1", tier: 1 },
  { word: "luggage",     course: "conversation", stage: "a1", tier: 1 },
  { word: "suitcase",    course: "conversation", stage: "a1", tier: 1 },
  { word: "reservation", course: "conversation", stage: "a1", tier: 1 },
  { word: "bill",        course: "conversation", stage: "a1", tier: 1 },
  { word: "receipt",     course: "conversation", stage: "a1", tier: 1 },
  { word: "customs",     course: "conversation", stage: "a1", tier: 1 },
  { word: "visa",        course: "conversation", stage: "a1", tier: 1 },
  { word: "straight",    course: "conversation", stage: "a1", tier: 1 },
  { word: "entrance",    course: "conversation", stage: "a1", tier: 1 },
  { word: "exit",        course: "conversation", stage: "a1", tier: 1 },
  { word: "seat",        course: "conversation", stage: "a1", tier: 1 },
  { word: "boarding",    course: "conversation", stage: "a1", tier: 1 },
  { word: "arrival",     course: "conversation", stage: "a1", tier: 1 },
  { word: "departure",   course: "conversation", stage: "a1", tier: 1 },

  // T-VQS-036 TOEIC500 ビジネス語（B1 → tier1-2）
  { word: "schedule",     course: "toeic", stage: "500", tier: 1 },
  { word: "client",       course: "toeic", stage: "500", tier: 1 },
  { word: "budget",       course: "toeic", stage: "500", tier: 1 },
  { word: "deadline",     course: "toeic", stage: "500", tier: 1 },
  { word: "invoice",      course: "toeic", stage: "500", tier: 1 },
  { word: "conference",   course: "toeic", stage: "500", tier: 1 },
  { word: "presentation", course: "toeic", stage: "500", tier: 1 },
  { word: "colleague",    course: "toeic", stage: "500", tier: 1 },
  { word: "contract",     course: "toeic", stage: "500", tier: 1 },
  { word: "agenda",       course: "toeic", stage: "500", tier: 1 },
  { word: "profit",       course: "toeic", stage: "500", tier: 1 },
  { word: "revenue",      course: "toeic", stage: "500", tier: 1 },
  { word: "expense",      course: "toeic", stage: "500", tier: 1 },
  { word: "hire",         course: "toeic", stage: "500", tier: 1 },
  { word: "resign",       course: "toeic", stage: "500", tier: 1 },
  { word: "negotiate",    course: "toeic", stage: "500", tier: 1 },
  { word: "propose",      course: "toeic", stage: "500", tier: 1 },
  { word: "submit",       course: "toeic", stage: "500", tier: 1 },
  { word: "approve",      course: "toeic", stage: "500", tier: 1 },
  { word: "clarify",      course: "toeic", stage: "500", tier: 1 },
  { word: "respond",      course: "toeic", stage: "500", tier: 1 },
];

// -------- マスター読み込み --------
const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const masterFiles = {};
for (const lv of levels) {
  masterFiles[lv] = {
    path: path.join(MASTER_DIR, `level-${lv}.json`),
    data: JSON.parse(fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8")),
  };
}

// 単語をすべて検索できるインデックス
const wordIndex = new Map();
for (const lv of levels) {
  for (const w of masterFiles[lv].data) {
    const key = w.word.toLowerCase();
    if (!wordIndex.has(key)) wordIndex.set(key, []);
    wordIndex.get(key).push({ lv, word: w });
  }
}

// -------- 適用 --------
let added = 0, skipped = 0, notFound = [];
const changedLevels = new Set();

for (const addition of ADDITIONS) {
  const entries = wordIndex.get(addition.word.toLowerCase()) ?? [];
  if (entries.length === 0) {
    notFound.push(addition.word);
    continue;
  }
  // 複数ある場合は最初のエントリを選択（通常は1エントリ）
  // 複数品詞ある場合は動詞を優先（旅行語彙の "straight" 等）
  const entry = entries.find((e) => e.word.partOfSpeech === "noun") ?? entries[0];
  const w = entry.word;
  const already = w.courses.some((c) => c.course === addition.course && c.stage === addition.stage);
  if (already) {
    skipped++;
    continue;
  }
  w.courses.push({
    course: addition.course,
    stage: addition.stage,
    tier: addition.tier,
  });
  added++;
  changedLevels.add(entry.lv);
}

console.log("=== Summary ===");
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Added: ${added}`);
console.log(`Skipped (already assigned): ${skipped}`);
if (notFound.length) console.log(`Not found: ${notFound.join(", ")}`);

if (!dryRun) {
  for (const lv of changedLevels) {
    fs.writeFileSync(masterFiles[lv].path, JSON.stringify(masterFiles[lv].data, null, 2) + "\n");
    console.log(`Updated: level-${lv}.json`);
  }
}
