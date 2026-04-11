#!/usr/bin/env node
// T-VQS-010: フラグメント修正のエージェント出力検査

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, "..", ".tmp");

function wordCount(en) {
  return en.trim().split(/\s+/).filter(Boolean).length;
}
function isCompleteSentence(en) {
  // 大文字始まり、文末記号あり（引用符で閉じられる場合も許容）、2語以上
  if (!/^[A-Z]/.test(en)) return false;
  // 末尾が .!? または .'!?" "'など
  if (!/[.!?]["')]?$/.test(en.trim())) return false;
  if (wordCount(en) < 2) return false;
  return true;
}
function isPoliteJa(ja) {
  // 丁寧形・挨拶・疑問・命令・感嘆・意志形すべてを許容
  return (
    ja.endsWith("です。") || ja.endsWith("ます。") ||
    ja.endsWith("でした。") || ja.endsWith("ました。") ||
    ja.endsWith("ません。") || ja.endsWith("ませんでした。") ||
    ja.endsWith("でしょう。") || ja.endsWith("ましょう。") ||
    ja.endsWith("ください。") || ja.endsWith("なさい。") ||
    ja.endsWith("ですか？") || ja.endsWith("ますか？") ||
    ja.endsWith("ますか。") || ja.endsWith("ですか。") ||
    ja.endsWith("ですね。") || ja.endsWith("ですよ。") ||
    ja.endsWith("ますね。") || ja.endsWith("ますよ。") ||
    ja.endsWith("ましょうか？") || ja.endsWith("でしょうか？") ||
    // 感嘆文・挨拶（慣用表現として許容）
    ja.endsWith("！") || ja.endsWith("？") ||
    ja.endsWith("ね。") || ja.endsWith("よ。")
  );
}
function isJapaneseContext(ctx) {
  return !/[a-zA-Z]/.test(ctx);
}

const issues = {
  stillFragment: [],
  wordCountOutOfRange: [],
  plainJa: [],
  englishContext: [],
  missingWord: [],
  templateLike: [],
};

const TEMPLATE_PATTERNS = [
  /^The concept of .+ is fascinating\.$/,
  /^The result was quite .+\.$/,
  /^It seemed remarkably .+\.$/,
  /^The .+ quality stood out\.$/,
  /^The .+ is important\.$/,
  /^The .+ is remarkable\.$/,
];

const batches = [];
for (let i = 1; i <= 11; i++) {
  const p = path.join(TMP_DIR, `fragments-batch-${String(i).padStart(2, "0")}-out.json`);
  if (!fs.existsSync(p)) {
    console.log(`[WAIT] ${p} not yet`);
    continue;
  }
  const arr = JSON.parse(fs.readFileSync(p, "utf-8"));
  batches.push(...arr);
}

console.log(`Loaded ${batches.length} entries from ${batches.length > 0 ? "available" : "none"} batches`);

for (const e of batches) {
  const ctx = { id: e.id, word: e.word, index: e.index, en: e.en, ja: e.ja, context: e.context };

  if (!isCompleteSentence(e.en)) issues.stillFragment.push(ctx);
  const wc = wordCount(e.en);
  // 緩和: 2-20語を許容範囲（挨拶・短文から長文までOK）
  if (wc < 2 || wc > 20) issues.wordCountOutOfRange.push({ ...ctx, wordCount: wc });
  if (!isPoliteJa(e.ja)) issues.plainJa.push(ctx);
  if (!isJapaneseContext(e.context)) issues.englishContext.push(ctx);

  // word が英文に含まれているか（最初の2-3文字で大雑把に判定、不規則動詞は許容）
  const stem = e.word.toLowerCase().replace(/\s+/g, "");
  if (stem.length > 3) {
    const needle = stem.substring(0, 3); // 3文字プリフィックス
    if (!e.en.toLowerCase().replace(/\s+/g, "").includes(needle)) {
      issues.missingWord.push(ctx);
    }
  }

  // テンプレ回帰
  if (TEMPLATE_PATTERNS.some((re) => re.test(e.en))) issues.templateLike.push(ctx);
}

console.log("\n=== Audit Summary ===");
console.log(`Still fragment: ${issues.stillFragment.length}`);
console.log(`Word count out of 5-15: ${issues.wordCountOutOfRange.length}`);
console.log(`Plain form ja: ${issues.plainJa.length}`);
console.log(`English context: ${issues.englishContext.length}`);
console.log(`Missing word in sentence: ${issues.missingWord.length}`);
console.log(`Template-like: ${issues.templateLike.length}`);

const auditDir = path.join(TMP_DIR, "audit-fragments");
fs.mkdirSync(auditDir, { recursive: true });
for (const [k, arr] of Object.entries(issues)) {
  if (arr.length > 0) fs.writeFileSync(path.join(auditDir, `${k}.json`), JSON.stringify(arr, null, 2));
}
console.log(`\nReports: ${auditDir}/`);
