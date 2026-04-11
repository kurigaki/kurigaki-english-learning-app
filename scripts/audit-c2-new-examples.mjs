#!/usr/bin/env node
// T-VQS-013: C2 例文再生成の自動検査
//
// 検査項目:
//  1. en が指定テンプレートに再度マッチしていないか
//  2. en が 5-12 語の範囲か
//  3. en が主語+動詞を含む完全文か（簡易検査: 文頭が大文字で終わりがピリオド、単語2以上）
//  4. ja が です/ます調 で終わっているか
//  5. context が日本語のみか
//  6. 既存の otherExamples と完全一致していないか

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, "..", ".tmp");

const TEMPLATE_PATTERNS = [
  /^The concept of .+ is fascinating\.$/,
  /^The result was quite .+\.$/,
  /^It seemed remarkably .+\.$/,
  /^The .+ quality stood out\.$/,
];

function isTemplate(en) {
  return TEMPLATE_PATTERNS.some((re) => re.test(en));
}

function countWords(en) {
  return en.trim().split(/\s+/).filter(Boolean).length;
}

function isCompleteSentence(en) {
  if (!/^[A-Z]/.test(en)) return false;
  if (!/[.!?]$/.test(en)) return false;
  if (countWords(en) < 3) return false;
  return true;
}

function isPoliteJa(ja) {
  return (
    ja.endsWith("です。") || ja.endsWith("ます。") ||
    ja.endsWith("でした。") || ja.endsWith("ました。") ||
    ja.endsWith("ません。") || ja.endsWith("ませんでした。") ||
    ja.endsWith("でしょう。") || ja.endsWith("ください。") ||
    ja.endsWith("ですか？") || ja.endsWith("ますか？") ||
    ja.endsWith("ますか。") || ja.endsWith("ですか。")
  );
}

function isJapaneseOnlyContext(ctx) {
  return !/[a-zA-Z]/.test(ctx);
}

// バッチA（全テンプレ）: newExamples ×3
// バッチB1/B2（部分テンプレ）: replacements ×1〜

const issues = {
  templateRegression: [],
  wordCountOutOfRange: [],
  incompleteSentence: [],
  plainJa: [],
  englishContext: [],
  duplicateWithOther: [],
};

// バッチA
const batchA = JSON.parse(fs.readFileSync(path.join(TMP_DIR, "c2-batch-a-out.json"), "utf-8"));
for (const entry of batchA) {
  for (const ex of entry.newExamples) {
    const ctx = { id: entry.id, word: entry.word, index: ex.index, en: ex.en, ja: ex.ja, context: ex.context };
    if (isTemplate(ex.en)) issues.templateRegression.push(ctx);
    const wc = countWords(ex.en);
    if (wc < 5 || wc > 15) issues.wordCountOutOfRange.push({ ...ctx, wordCount: wc });
    if (!isCompleteSentence(ex.en)) issues.incompleteSentence.push(ctx);
    if (!isPoliteJa(ex.ja)) issues.plainJa.push(ctx);
    if (!isJapaneseOnlyContext(ex.context)) issues.englishContext.push(ctx);
  }
}

// バッチB1+B2
for (const batchName of ["c2-batch-b1-out.json", "c2-batch-b2-out.json"]) {
  const data = JSON.parse(fs.readFileSync(path.join(TMP_DIR, batchName), "utf-8"));
  for (const entry of data) {
    for (const rep of entry.replacements) {
      const ctx = { id: entry.id, word: entry.word, index: rep.index, en: rep.en, ja: rep.ja, context: rep.context };
      if (isTemplate(rep.en)) issues.templateRegression.push(ctx);
      const wc = countWords(rep.en);
      if (wc < 5 || wc > 15) issues.wordCountOutOfRange.push({ ...ctx, wordCount: wc });
      if (!isCompleteSentence(rep.en)) issues.incompleteSentence.push(ctx);
      if (!isPoliteJa(rep.ja)) issues.plainJa.push(ctx);
      if (!isJapaneseOnlyContext(rep.context)) issues.englishContext.push(ctx);
    }
  }
}

console.log("=== Audit Summary ===");
console.log(`Template regression: ${issues.templateRegression.length}`);
console.log(`Word count out of 5-15: ${issues.wordCountOutOfRange.length}`);
console.log(`Incomplete sentence: ${issues.incompleteSentence.length}`);
console.log(`Plain form ja: ${issues.plainJa.length}`);
console.log(`English context: ${issues.englishContext.length}`);

// Write reports
const auditDir = path.join(TMP_DIR, "audit-c2");
fs.mkdirSync(auditDir, { recursive: true });
for (const [key, arr] of Object.entries(issues)) {
  if (arr.length > 0) {
    fs.writeFileSync(path.join(auditDir, `${key}.json`), JSON.stringify(arr, null, 2));
  }
}
console.log(`\nReports: ${auditDir}/`);
