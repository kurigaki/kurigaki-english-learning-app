#!/usr/bin/env node
// T-VQS-048: TOEIC 多義語で品詞エントリが欠落していた語を新規追加
//
// 対象:
//   firm(noun)="会社・企業"     → b1 末尾に追加
//   state(noun)="状態・国家・声明" → a2 末尾に追加
//   state(verb)="述べる・表明する" → a2 末尾に追加
//
// 既存の firm(adjective)="しっかりした" / state(adjective)="国家の" とは別の
// 品詞として共存する。

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const dryRun = process.argv.includes("--dry");

// 新規エントリ定義（level, data）
const ADDITIONS = [
  {
    level: "b1",
    data: {
      word: "firm",
      meaning: "会社・企業",
      partOfSpeech: "noun",
      examples: [
        { en: "She joined a prestigious law firm right after graduating.", ja: "彼女は卒業後すぐに名門の法律事務所に入った。", context: "ビジネス" },
        { en: "The accounting firm handles audits for dozens of multinational corporations.", ja: "その会計事務所は多数の多国籍企業の監査を担当している。", context: "ビジネス" },
        { en: "A small consulting firm can often provide more personalized service than a large one.", ja: "小規模なコンサルティング会社は大手よりも個別対応に優れていることが多い。", context: "ビジネス" },
      ],
      categories: ["business", "office"],
      frequencyTier: 1,
      courses: [
        { course: "eiken", stage: "pre2", tier: 1 },
        { course: "toeic", stage: "600", tier: 1 },
      ],
    },
  },
  {
    level: "a2",
    data: {
      word: "state",
      meaning: "状態・国家・声明",
      partOfSpeech: "noun",
      examples: [
        { en: "The old bridge is in a poor state of repair.", ja: "その古い橋は修繕状態が悪い。", context: "日常" },
        { en: "Texas is one of the largest states in the United States.", ja: "テキサスはアメリカで最も大きな州の一つだ。", context: "地理" },
        { en: "The prime minister issued an official state of the economy.", ja: "首相は経済に関する公式声明を発表した。", context: "政治" },
      ],
      categories: ["school", "business"],
      frequencyTier: 1,
      courses: [
        { course: "junior", stage: "3", tier: 1 },
        { course: "eiken", stage: "4", tier: 1 },
        { course: "toeic", stage: "500", tier: 1 },
        { course: "conversation", stage: "a2", tier: 1 },
      ],
    },
  },
  {
    level: "a2",
    data: {
      word: "state",
      meaning: "述べる・表明する",
      partOfSpeech: "verb",
      examples: [
        { en: "Please state your name and purpose of visit clearly.", ja: "お名前と訪問目的をはっきり述べてください。", context: "ビジネス" },
        { en: "The report clearly states that sales increased by twenty percent last quarter.", ja: "その報告書は前四半期の売上が20パーセント増加したと明確に述べている。", context: "ビジネス" },
        { en: "He stated his opposition to the new policy during the meeting.", ja: "彼は会議で新方針への反対を表明した。", context: "議論" },
      ],
      categories: ["communication", "business"],
      frequencyTier: 1,
      courses: [
        { course: "junior", stage: "3", tier: 1 },
        { course: "eiken", stage: "4", tier: 1 },
        { course: "toeic", stage: "500", tier: 1 },
        { course: "conversation", stage: "a2", tier: 1 },
      ],
    },
  },
];

// -------- マスター処理 --------
const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const masterFiles = {};
for (const lv of levels) {
  masterFiles[lv] = {
    path: path.join(MASTER_DIR, `level-${lv}.json`),
    data: JSON.parse(fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8")),
  };
}

// level 毎に次の ID を採番
const nextIds = {};
for (const lv of levels) {
  nextIds[lv] = Math.max(...masterFiles[lv].data.map((w) => w.id)) + 1;
}

// 重複チェック: word + partOfSpeech
function exists(word, pos) {
  for (const lv of levels) {
    if (masterFiles[lv].data.some((w) => w.word.toLowerCase() === word.toLowerCase() && w.partOfSpeech === pos)) {
      return true;
    }
  }
  return false;
}

let added = 0;
const skipped = [];

for (const add of ADDITIONS) {
  if (exists(add.data.word, add.data.partOfSpeech)) {
    skipped.push(`${add.data.word}(${add.data.partOfSpeech})`);
    continue;
  }
  const id = nextIds[add.level]++;
  const entry = { id, ...add.data };
  masterFiles[add.level].data.push(entry);
  added++;
  console.log(`  [${add.level}] +${id} ${add.data.word}(${add.data.partOfSpeech}): "${add.data.meaning}"`);
}

console.log(`\n=== Summary ===`);
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Added: ${added}`);
if (skipped.length) console.log(`Skipped (already exists): ${skipped.join(", ")}`);

if (!dryRun && added > 0) {
  const changedLevels = new Set(ADDITIONS.map((a) => a.level));
  for (const lv of changedLevels) {
    fs.writeFileSync(masterFiles[lv].path, JSON.stringify(masterFiles[lv].data, null, 2) + "\n");
    console.log(`Updated: level-${lv}.json`);
  }
}
