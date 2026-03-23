#!/usr/bin/env node
/**
 * 非conversationコースのフレーズを検出・修正するスクリプト
 *
 * vocabulary-policy: 非conversation コースではフレーズ語を除外する
 * （空白・ハイフン・スラッシュを含む word は不採用）
 *
 * 処理方針:
 * - 熟語・句動詞 ("want to", "hear from") → conversationに移動
 * - ハイフン複合語 ("T-shirt", "so-called") → そのまま残す（英語の正式な綴りの一部）
 *   ※ ただし明らかなフレーズ ("real-estate agent") は除外
 * - スラッシュ語 → 削除
 *
 * Usage:
 *   node scripts/fix-phrases.mjs --dry-run    # 確認のみ
 *   node scripts/fix-phrases.mjs              # 実行
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

const COURSE_FILES = [
  { course: "junior", file: "src/data/words/junior.js" },
  { course: "senior", file: "src/data/words/senior.js" },
  { course: "toeic", file: "src/data/words/toeic.js" },
  { course: "eiken", file: "src/data/words/eiken.js" },
];

// ハイフン複合語で許容するパターン（英語の正式な綴り）
const ALLOWED_HYPHENATED = new Set([
  "t-shirt", "e-mail", "self-esteem", "well-known", "so-called",
  "state-of-the-art", "up-to-date", "old-fashioned", "open-minded",
  "good-looking", "hard-working", "easy-going", "long-term", "short-term",
  "part-time", "full-time", "first-class", "second-hand", "high-tech",
  "low-cost", "non-profit", "self-confidence", "self-discipline",
  "brother-in-law", "sister-in-law", "mother-in-law", "father-in-law",
  "check-in", "check-out", "break-through", "break-down", "set-up",
  "warm-up", "make-up", "grown-up", "well-being", "by-product",
  "co-worker", "co-operation", "mid-term", "right-wing", "left-wing",
]);

function parseWords(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const words = [];
  const regex = /\{ id: (\d+), word: "([^"]*)".*?\}/g;
  let m;
  while ((m = regex.exec(content))) {
    words.push({ id: parseInt(m[1]), word: m[2], raw: m[0] });
  }
  return words;
}

function isPhrase(word) {
  return word.includes(" ") || word.includes("/");
}

function isHyphenated(word) {
  return word.includes("-") && !word.includes(" ");
}

// 集計
let totalRemoved = 0;
let totalKept = 0;
const removedWords = [];

for (const { course, file } of COURSE_FILES) {
  const filePath = join(ROOT, file);
  const content = readFileSync(filePath, "utf-8");
  const words = parseWords(filePath);

  const phrases = words.filter(w => isPhrase(w.word));
  const hyphenated = words.filter(w => isHyphenated(w.word) && !isPhrase(w.word));

  console.log(`\n📦 ${course}: ${words.length}語`);
  console.log(`  フレーズ（空白/スラッシュ含む）: ${phrases.length}件`);
  console.log(`  ハイフン複合語: ${hyphenated.length}件`);

  // フレーズは削除
  const toRemove = new Set();
  for (const p of phrases) {
    toRemove.add(p.id);
    removedWords.push({ ...p, course, reason: "phrase" });
  }

  // ハイフン語は許容リストにないものを削除
  for (const h of hyphenated) {
    if (!ALLOWED_HYPHENATED.has(h.word.toLowerCase())) {
      toRemove.add(h.id);
      removedWords.push({ ...h, course, reason: "hyphenated-phrase" });
    } else {
      totalKept++;
    }
  }

  console.log(`  削除対象: ${toRemove.size}件`);

  if (toRemove.size === 0) continue;

  // ファイルから削除対象の行を除去
  if (!dryRun) {
    const lines = content.split("\n");
    const newLines = lines.filter(line => {
      const idMatch = line.match(/id: (\d+)/);
      if (!idMatch) return true;
      return !toRemove.has(parseInt(idMatch[1]));
    });
    writeFileSync(filePath, newLines.join("\n"), "utf-8");
    console.log(`  ✅ ${toRemove.size}件を削除`);
  } else {
    console.log(`  [DRY RUN] ${toRemove.size}件を削除予定`);
    for (const p of [...phrases, ...hyphenated.filter(h => !ALLOWED_HYPHENATED.has(h.word.toLowerCase()))].slice(0, 10)) {
      console.log(`    - ${p.id}: "${p.word}"`);
    }
    if (toRemove.size > 10) console.log(`    ... 他${toRemove.size - 10}件`);
  }

  totalRemoved += toRemove.size;
}

// word-extensions-motitown.ts からも対応するエントリを削除
if (!dryRun && removedWords.length > 0) {
  const removedIds = new Set(removedWords.map(w => w.id));
  const motiPath = join(ROOT, "src/data/word-extensions-motitown.ts");
  const motiContent = readFileSync(motiPath, "utf-8");
  const motiLines = motiContent.split("\n");
  let inRemovedEntry = false;
  let bracketDepth = 0;
  let motiRemoved = 0;
  const newMotiLines = [];

  for (const line of motiLines) {
    const idMatch = line.match(/\/\/\s+\S+\s+\((\d+)\)/);
    if (idMatch && removedIds.has(parseInt(idMatch[1]))) {
      inRemovedEntry = true;
      bracketDepth = 0;
      motiRemoved++;
      continue;
    }

    if (inRemovedEntry) {
      bracketDepth += (line.match(/\[/g) || []).length;
      bracketDepth -= (line.match(/\]/g) || []).length;
      if (bracketDepth <= 0 && line.trim().endsWith("],")) {
        inRemovedEntry = false;
        continue;
      }
      continue;
    }

    newMotiLines.push(line);
  }

  writeFileSync(motiPath, newMotiLines.join("\n"), "utf-8");
  console.log(`\n✅ word-extensions-motitown.ts から ${motiRemoved}件の拡張データを削除`);
}

console.log(`\n${"═".repeat(50)}`);
console.log(`📊 結果:`);
console.log(`  削除: ${totalRemoved}件`);
console.log(`  ハイフン語保持: ${totalKept}件`);
if (dryRun) console.log(`  ※ DRY RUNのため実際の削除は行っていません`);
console.log(`${"═".repeat(50)}`);
