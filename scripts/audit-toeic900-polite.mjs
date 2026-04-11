#!/usr/bin/env node
// T-VQS-012: エージェントによる変換結果の自動検査スクリプト
//
// - エージェント出力 (.tmp/toeic900-batch-*-out.json) を読み込み
// - 文体変換として適切か、自動ルールで検査
// - 疑わしいケースをすべて列挙して人間レビューに提示
//
// 検査項目:
//   1. after が丁寧形で終わっているか
//      （です。/ます。/でした。/ました。/ません。/ませんでした。/でしょう。/下さい。/ください。/ですか？/ますか？）
//   2. 文字長の極端な変化（±30%以上は疑う）
//   3. 意味単語（漢字）の有意な欠落
//   4. 意味単語（漢字）の追加
//   5. 変換前と完全一致（変換されていない）
//   6. 不自然な末尾（「なかりました」「るです」「えるです」等）

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, "..", ".tmp");

const POLITE_SUFFIXES = [
  "です。", "ます。", "でした。", "ました。",
  "ません。", "ませんでした。", "でしょう。",
  "ください。", "下さい。",
  "ですか？", "ますか？", "でしょうか？",
  "ですね。", "ですよ。", "ますね。", "ますよ。",
  "ですか。", "ますか。",
  "ですが、", // 文中で切れないはずだが念のため
];

// 不自然な末尾パターン（誤変換の痕跡）
const BAD_ENDINGS = [
  /なかりました。$/, /なかりません。$/,
  /るです。$/, /えるです。$/, /いるです。$/,
  /あるです。$/, /いるです。$/,
  /だです。$/, /だました。$/,
  /ないです。$/, // これは口語で許容される場合あり → フラグのみ
];

// 漢字抽出
function extractKanji(s) {
  return Array.from(s.matchAll(/[\u4e00-\u9fff]/g)).map((m) => m[0]);
}

function endsWithPolite(s) {
  return POLITE_SUFFIXES.some((suf) => s.endsWith(suf));
}

// 読み込み
const all = [];
for (let i = 1; i <= 10; i++) {
  const p = path.join(TMP_DIR, `toeic900-batch-${i}-out.json`);
  if (!fs.existsSync(p)) {
    console.error(`[WARN] Missing: ${p}`);
    continue;
  }
  const arr = JSON.parse(fs.readFileSync(p, "utf-8"));
  all.push(...arr);
}
console.log(`Loaded ${all.length} entries`);

const issues = {
  notPolite: [],
  badEnding: [],
  unchanged: [],
  lengthJump: [],
  kanjiDiff: [],
};

for (const item of all) {
  const before = item.ja;
  const after = item.after;
  if (typeof after !== "string" || after.length === 0) {
    issues.notPolite.push({ ...item, reason: "after is empty or non-string" });
    continue;
  }

  // 1. 丁寧形チェック
  if (!endsWithPolite(after)) {
    issues.notPolite.push({ id: item.id, word: item.word, index: item.index, en: item.en, before, after });
  }

  // 2. 不自然な末尾
  if (BAD_ENDINGS.some((re) => re.test(after))) {
    issues.badEnding.push({ id: item.id, word: item.word, index: item.index, en: item.en, before, after });
  }

  // 3. 変換なし
  if (before === after) {
    // before が元々丁寧形ならOK、そうでなければ問題
    if (!endsWithPolite(before)) {
      issues.unchanged.push({ id: item.id, word: item.word, index: item.index, en: item.en, before, after });
    }
  }

  // 4. 文字長の極端な変化
  const ratio = after.length / before.length;
  if (ratio < 0.7 || ratio > 1.5) {
    issues.lengthJump.push({ id: item.id, word: item.word, index: item.index, en: item.en, before, after, ratio: ratio.toFixed(2) });
  }

  // 5. 漢字の差分
  const kBefore = new Set(extractKanji(before));
  const kAfter = new Set(extractKanji(after));
  const removed = [...kBefore].filter((k) => !kAfter.has(k));
  const added = [...kAfter].filter((k) => !kBefore.has(k));
  if (removed.length > 0 || added.length > 0) {
    issues.kanjiDiff.push({
      id: item.id,
      word: item.word,
      index: item.index,
      en: item.en,
      before,
      after,
      removed: removed.join(""),
      added: added.join(""),
    });
  }
}

console.log("\n=== Audit Summary ===");
console.log(`Total entries: ${all.length}`);
console.log(`Not polite ending: ${issues.notPolite.length}`);
console.log(`Bad ending (suspect): ${issues.badEnding.length}`);
console.log(`Unchanged (not polite): ${issues.unchanged.length}`);
console.log(`Length jump ±30%+: ${issues.lengthJump.length}`);
console.log(`Kanji added/removed: ${issues.kanjiDiff.length}`);

// Write reports
const reportDir = path.join(TMP_DIR, "audit");
fs.mkdirSync(reportDir, { recursive: true });
for (const [key, arr] of Object.entries(issues)) {
  fs.writeFileSync(
    path.join(reportDir, `${key}.json`),
    JSON.stringify(arr, null, 2),
  );
}
console.log(`\nReports written to ${reportDir}/`);
