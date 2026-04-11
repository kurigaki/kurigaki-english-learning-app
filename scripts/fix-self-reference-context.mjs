#!/usr/bin/env node
// T-VQS-003: context フィールドが単語名そのものになっている例文を
// 適切な日本語場面ラベルに一括置換するスクリプト
//
// 使い方:
//   node scripts/fix-self-reference-context.mjs --dry   # dry-run（変更なし、集計のみ）
//   node scripts/fix-self-reference-context.mjs         # 本番実行（ファイル更新）

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const dryRun = process.argv.includes("--dry");

// categories → 日本語場面ラベル のマッピング
const CATEGORY_TO_LABEL = {
  business: "ビジネス",
  office: "職場",
  school: "学校",
  daily: "日常",
  travel: "旅行",
  shopping: "買い物",
  food: "食事",
  nature: "自然",
  health: "健康",
  sports: "スポーツ",
  communication: "会話",
  technology: "技術",
  finance: "金融",
  culture: "文化",
  emotion: "感情",
  art: "芸術",
  music: "音楽",
  family: "家庭",
  hobby: "趣味",
  weather: "天気",
  education: "学校",
  social: "社会",
};

// 日常カテゴリの場合に3例文で変化をつける汎用ラベル
const DAILY_VARIATION = ["日常", "会話", "家庭"];
const GENERIC_FALLBACK = "日常";

/**
 * 1語の3例文に対して異なる context ラベルを決定する
 * @param {string[]} categories 単語の categories 配列
 * @returns {string[]} 3例文分の日本語ラベル配列
 */
function resolveContextLabels(categories) {
  const primary = categories[0];
  const mappedCats = categories
    .map((c) => CATEGORY_TO_LABEL[c])
    .filter(Boolean);

  // カテゴリが3つ以上あるならそれぞれを使う
  if (mappedCats.length >= 3) {
    return mappedCats.slice(0, 3);
  }

  // カテゴリが2つ → [cat0, cat1, cat0]
  if (mappedCats.length === 2) {
    return [mappedCats[0], mappedCats[1], mappedCats[0]];
  }

  // カテゴリが1つ
  if (mappedCats.length === 1) {
    const label = mappedCats[0];
    // daily の場合は変化をつける
    if (primary === "daily") {
      return DAILY_VARIATION;
    }
    // 他カテゴリは同ラベル3連
    return [label, label, label];
  }

  // カテゴリ不明 → 全て fallback
  return [GENERIC_FALLBACK, GENERIC_FALLBACK, GENERIC_FALLBACK];
}

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const stats = { updated: 0, words: 0, byLabel: {} };

for (const lv of levels) {
  const filePath = path.join(MASTER_DIR, `level-${lv}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let changed = false;

  for (const word of data) {
    // 自己参照 context を持つ例文があるか
    const hasSelfRef = word.examples.some((ex) => ex.context === word.word);
    if (!hasSelfRef) continue;

    const labels = resolveContextLabels(word.categories);

    for (let i = 0; i < word.examples.length; i++) {
      const ex = word.examples[i];
      if (ex.context === word.word) {
        const newLabel = labels[i] || labels[0];
        ex.context = newLabel;
        stats.updated++;
        stats.byLabel[newLabel] = (stats.byLabel[newLabel] || 0) + 1;
        changed = true;
      }
    }
    stats.words++;
  }

  if (changed && !dryRun) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    console.log(`Updated: ${path.basename(filePath)}`);
  }
}

console.log("\n=== Summary ===");
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Words affected: ${stats.words}`);
console.log(`Example entries updated: ${stats.updated}`);
console.log(`\nNew labels distribution:`);
Object.entries(stats.byLabel)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v}`));
