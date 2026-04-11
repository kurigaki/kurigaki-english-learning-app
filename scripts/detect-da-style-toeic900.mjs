#!/usr/bin/env node
// T-VQS-012: TOEIC900 の和訳で「だ/である調」の例文を検出し、
// 「です/ます調」への変換候補を出力するスクリプト。
//
// 使い方:
//   node scripts/detect-da-style-toeic900.mjs           # 検出+変換候補を出力（dry-run）
//   node scripts/detect-da-style-toeic900.mjs --apply   # 本番実行

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const applyMode = process.argv.includes("--apply");

// 変換ルール: 文末パターン → 置換後
// より長いパターンを先に評価する
const CONVERT_RULES = [
  // 過去形
  { from: /だった。$/, to: "でした。" },
  { from: /であった。$/, to: "でした。" },
  { from: /だったのだ。$/, to: "だったのです。" },
  // 現在否定
  { from: /ではない。$/, to: "ではありません。" },
  { from: /でない。$/, to: "ではありません。" },
  // 動詞否定
  { from: /しない。$/, to: "しません。" },
  { from: /ない。$/, to: "ありません。" }, // 慎重に：「存在しない」などに影響しうる
  // 受動/使役 文末
  { from: /される。$/, to: "されます。" },
  { from: /られる。$/, to: "られます。" },
  { from: /せる。$/, to: "せます。" },
  // 「〜だ。」「〜である。」
  { from: /である。$/, to: "です。" },
  { from: /だ。$/, to: "です。" },
  // 動詞普通形（る/う/く/す/つ/ぬ/ぶ/む/ぐ）で終わるもの
  // これは TOEIC900 の例文で「〜する。」「〜られる。」などが多いため
  // 限定的な動詞パターンをリストで対応
];

// 動詞普通形 → ます形 の変換マップ（頻出のみ）
const VERB_RULES = [
  // サ変動詞
  { from: /する。$/, to: "します。" },
  { from: /した。$/, to: "しました。" },
  // 一段動詞
  { from: /見える。$/, to: "見えます。" },
  { from: /見せる。$/, to: "見せます。" },
  { from: /見る。$/, to: "見ます。" },
  { from: /出る。$/, to: "出ます。" },
  { from: /入る。$/, to: "入ります。" },
  { from: /上がる。$/, to: "上がります。" },
  { from: /下がる。$/, to: "下がります。" },
  { from: /変わる。$/, to: "変わります。" },
  { from: /終わる。$/, to: "終わります。" },
  { from: /始まる。$/, to: "始まります。" },
  { from: /決まる。$/, to: "決まります。" },
  { from: /分かる。$/, to: "分かります。" },
  { from: /かかる。$/, to: "かかります。" },
  { from: /残る。$/, to: "残ります。" },
  { from: /広がる。$/, to: "広がります。" },
  { from: /含む。$/, to: "含みます。" },
  { from: /求める。$/, to: "求めます。" },
  { from: /進める。$/, to: "進めます。" },
  { from: /高める。$/, to: "高めます。" },
  { from: /支える。$/, to: "支えます。" },
  { from: /与える。$/, to: "与えます。" },
  { from: /迎える。$/, to: "迎えます。" },
  { from: /抱える。$/, to: "抱えます。" },
  { from: /考える。$/, to: "考えます。" },
  { from: /伝える。$/, to: "伝えます。" },
  { from: /加える。$/, to: "加えます。" },
  { from: /含める。$/, to: "含めます。" },
  { from: /続ける。$/, to: "続けます。" },
  { from: /離れる。$/, to: "離れます。" },
  { from: /現れる。$/, to: "現れます。" },
  { from: /生まれる。$/, to: "生まれます。" },
  { from: /流れる。$/, to: "流れます。" },
  // 五段・う動詞の頻出形
  { from: /行う。$/, to: "行います。" },
  { from: /扱う。$/, to: "扱います。" },
  { from: /従う。$/, to: "従います。" },
  { from: /伴う。$/, to: "伴います。" },
  { from: /失う。$/, to: "失います。" },
  { from: /支払う。$/, to: "支払います。" },
  { from: /買う。$/, to: "買います。" },
  { from: /使う。$/, to: "使います。" },
  { from: /狙う。$/, to: "狙います。" },
  { from: /担う。$/, to: "担います。" },
  // 五段・く動詞
  { from: /動く。$/, to: "動きます。" },
  { from: /働く。$/, to: "働きます。" },
  { from: /続く。$/, to: "続きます。" },
  { from: /開く。$/, to: "開きます。" },
  { from: /書く。$/, to: "書きます。" },
  { from: /届く。$/, to: "届きます。" },
  { from: /招く。$/, to: "招きます。" },
  { from: /置く。$/, to: "置きます。" },
  // 五段・す動詞
  { from: /話す。$/, to: "話します。" },
  { from: /示す。$/, to: "示します。" },
  { from: /出す。$/, to: "出します。" },
  { from: /増す。$/, to: "増します。" },
  { from: /通す。$/, to: "通します。" },
  { from: /押す。$/, to: "押します。" },
  { from: /任す。$/, to: "任せます。" },
  // 五段・つ動詞
  { from: /保つ。$/, to: "保ちます。" },
  { from: /持つ。$/, to: "持ちます。" },
  { from: /勝つ。$/, to: "勝ちます。" },
  { from: /立つ。$/, to: "立ちます。" },
  // 五段・ぶ動詞
  { from: /呼ぶ。$/, to: "呼びます。" },
  { from: /運ぶ。$/, to: "運びます。" },
  { from: /学ぶ。$/, to: "学びます。" },
  { from: /選ぶ。$/, to: "選びます。" },
  // 五段・む動詞
  { from: /読む。$/, to: "読みます。" },
  { from: /進む。$/, to: "進みます。" },
  { from: /休む。$/, to: "休みます。" },
  { from: /望む。$/, to: "望みます。" },
  { from: /組む。$/, to: "組みます。" },
  { from: /済む。$/, to: "済みます。" },
  // 五段・ぐ動詞
  { from: /急ぐ。$/, to: "急ぎます。" },
  { from: /防ぐ。$/, to: "防ぎます。" },
  { from: /注ぐ。$/, to: "注ぎます。" },
  // 過去形ー た
  { from: /いた。$/, to: "いました。" },
  { from: /えた。$/, to: "えました。" },
  { from: /けた。$/, to: "けました。" },
  { from: /せた。$/, to: "せました。" },
  { from: /てた。$/, to: "てました。" },
  { from: /ねた。$/, to: "ねました。" },
  { from: /めた。$/, to: "めました。" },
  { from: /れた。$/, to: "れました。" },
  { from: /わった。$/, to: "わりました。" },
  { from: /った。$/, to: "りました。" }, // 「走った」→「走りました」etc
  { from: /んだ。$/, to: "みました。" }, // 「読んだ」→「読みました」※「飲んだ」なども対象
  { from: /いた。$/, to: "きました。" }, // overwrite 上は有効
];

// 「だ/である調」の痕跡を持つかどうか
function hasDaStyle(ja) {
  if (ja.endsWith("だ。")) return true;
  if (ja.endsWith("だった。")) return true;
  if (ja.endsWith("である。")) return true;
  if (ja.endsWith("であった。")) return true;
  // 動詞普通形（終止形）で終わる典型パターン
  const verbEndings = [
    /する。$/, /した。$/,
    /ある。$/,
    /える。$/, /いる。$/, /おる。$/, /うる。$/,
    /れる。$/, /られる。$/, /せる。$/, /させる。$/,
    /う。$/, /く。$/, /ぐ。$/, /す。$/, /つ。$/, /ぬ。$/, /ぶ。$/, /む。$/, /る。$/,
    /った。$/, /んだ。$/, /いた。$/, /えた。$/, /けた。$/, /せた。$/, /てた。$/, /めた。$/, /れた。$/,
  ];
  // 「ません。」「です。」「ました。」「でした。」で終わる場合は対象外
  if (
    ja.endsWith("ません。") ||
    ja.endsWith("です。") ||
    ja.endsWith("ました。") ||
    ja.endsWith("でした。") ||
    ja.endsWith("ますか？") ||
    ja.endsWith("ませ。") ||
    ja.endsWith("してください。")
  ) return false;
  return verbEndings.some((re) => re.test(ja));
}

// 単純な置換関数（この段階では提案のみ）
function convertJa(ja) {
  // 過去形 + 「た」 から優先的に評価
  for (const { from, to } of VERB_RULES) {
    if (from.test(ja)) return ja.replace(from, to);
  }
  for (const { from, to } of CONVERT_RULES) {
    if (from.test(ja)) return ja.replace(from, to);
  }
  return null; // 変換不能
}

// toeic:900 所属語のみを対象
const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const diffs = [];
let affectedWords = 0;

for (const lv of levels) {
  const filePath = path.join(MASTER_DIR, `level-${lv}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  for (const word of data) {
    const inToeic900 = word.courses.some(
      (c) => c.course === "toeic" && c.stage === "900",
    );
    if (!inToeic900) continue;
    let hit = false;
    for (let i = 0; i < word.examples.length; i++) {
      const ex = word.examples[i];
      if (!hasDaStyle(ex.ja)) continue;
      const candidate = convertJa(ex.ja);
      diffs.push({
        id: word.id,
        word: word.word,
        index: i,
        en: ex.en,
        before: ex.ja,
        after: candidate,
        level: lv,
      });
      hit = true;
    }
    if (hit) affectedWords++;
  }
}

console.log("=== Summary ===");
console.log(`Mode: ${applyMode ? "APPLY" : "DRY-RUN"}`);
console.log(`Affected words: ${affectedWords}`);
console.log(`Affected example entries: ${diffs.length}`);
const unconverted = diffs.filter((d) => d.after === null);
console.log(`Unconverted (need manual): ${unconverted.length}`);
console.log();

if (!applyMode) {
  // dry-run: 全件を JSON として出力
  const outPath = path.join(__dirname, "..", ".tmp", "toeic900-da-style-diffs.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(diffs, null, 2));
  console.log(`Diff report written to: ${outPath}`);
  console.log("\nFirst 20 diffs preview:");
  for (const d of diffs.slice(0, 20)) {
    console.log(`[${d.id}] ${d.word} ex[${d.index}]`);
    console.log(`  en: ${d.en}`);
    console.log(`  BEFORE: ${d.before}`);
    console.log(`  AFTER : ${d.after ?? "★MANUAL★"}`);
  }
} else {
  // apply mode
  for (const lv of levels) {
    const filePath = path.join(MASTER_DIR, `level-${lv}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    let changed = false;
    for (const word of data) {
      const inToeic900 = word.courses.some(
        (c) => c.course === "toeic" && c.stage === "900",
      );
      if (!inToeic900) continue;
      for (let i = 0; i < word.examples.length; i++) {
        const ex = word.examples[i];
        if (!hasDaStyle(ex.ja)) continue;
        const candidate = convertJa(ex.ja);
        if (candidate !== null) {
          ex.ja = candidate;
          changed = true;
        }
      }
    }
    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
      console.log(`Updated: ${path.basename(filePath)}`);
    }
  }
}
