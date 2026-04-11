#!/usr/bin/env node
// T-VQS-046: MasterWord.sources に data/vocab-sources/ の各出典を一括付与
//
// 目的:
//   各語について「どの参考文献に載っているか」を復元し、
//   ライセンス帰属表示（/profile）の裏付けと将来の検証に使う。
//
// アプローチ:
//   各 source ファイルから語彙 Set（変化形を含む）を構築し、
//   master 全語の word フィールドと突き合わせる。
//   1 語は複数 source に重複して載る（例: cefrj にも ngsl にも）。
//
// 取り扱う source:
//   - cefrj-v15       : A1-B2 (CEFR-J Wordlist)
//   - octanove-c1c2-v10: C1-C2 (Octanove Vocabulary Profile)
//   - ngsl            : NGSL (General Service List)
//   - nawl            : NAWL (New Academic Word List)
//   - tsl-v12         : TSL (TOEIC Service List)
//   - bsl-v12         : BSL (Business Service List)
//   - subtlex         : SUBTLEX-US (rank ≤ 60000 のみ記録、頻度参考)
//
// manual はソースに載っていない自作語（中1基礎語など）に付与する

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MASTER_DIR = path.join(ROOT, "src", "data", "words", "master");
const SOURCES_DIR = path.join(ROOT, "data", "vocab-sources");

const dryRun = process.argv.includes("--dry");
const verbose = process.argv.includes("--verbose");

// -------- Source 読み込み --------

function parseCsvHeadwordColumn(filePath, headerIndex = 0) {
  const set = new Set();
  const text = fs.readFileSync(filePath, "utf-8");
  const lines = text.split("\n").slice(1); // skip header
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(",");
    const word = (cols[headerIndex] || "").trim().toLowerCase();
    if (!word) continue;
    // cefrj には "a.m./A.M./am/AM" のように / 区切りで複数表記がある
    for (const variant of word.split("/")) {
      if (variant) set.add(variant.trim());
    }
  }
  return set;
}

// cefrj-v15: headword (0), pos (1), CEFR (2)
const cefrjSet = parseCsvHeadwordColumn(path.join(SOURCES_DIR, "cefrj-v15.csv"), 0);

// octanove-c1c2: headword (0), pos (1), CEFR (2)
const octanoveSet = parseCsvHeadwordColumn(path.join(SOURCES_DIR, "octanove-c1c2-v10.csv"), 0);

// tsl-v12: Word (0), Rank (1)
const tslSet = parseCsvHeadwordColumn(path.join(SOURCES_DIR, "tsl-v12.csv"), 0);

// bsl-v12: Word (0), Rank (1)
const bslSet = parseCsvHeadwordColumn(path.join(SOURCES_DIR, "bsl-v12.csv"), 0);

// ngsl.json: {band: {lemma: [inflections]}}
const ngslRaw = JSON.parse(fs.readFileSync(path.join(SOURCES_DIR, "ngsl.json"), "utf-8"));
const ngslSet = new Set();
for (const band of Object.values(ngslRaw)) {
  for (const [lemma, inflections] of Object.entries(band)) {
    ngslSet.add(lemma.toLowerCase());
    for (const i of inflections) ngslSet.add(i.toLowerCase());
  }
}

// nawl.json: {lemma: [inflections]}
const nawlRaw = JSON.parse(fs.readFileSync(path.join(SOURCES_DIR, "nawl.json"), "utf-8"));
const nawlSet = new Set();
for (const [lemma, inflections] of Object.entries(nawlRaw)) {
  nawlSet.add(lemma.toLowerCase());
  for (const i of inflections) nawlSet.add(i.toLowerCase());
}

// subtlex.json: [{word, count}] - rank <= 60000 のみ記録（頻度参考）
const subtlexRaw = JSON.parse(fs.readFileSync(path.join(SOURCES_DIR, "subtlex.json"), "utf-8"));
const subtlexSet = new Set();
for (let i = 0; i < Math.min(subtlexRaw.length, 60000); i++) {
  subtlexSet.add(subtlexRaw[i].word.toLowerCase());
}

console.log(`Loaded sources:`);
console.log(`  cefrj-v15:        ${cefrjSet.size}`);
console.log(`  octanove-c1c2:    ${octanoveSet.size}`);
console.log(`  ngsl:             ${ngslSet.size}`);
console.log(`  nawl:             ${nawlSet.size}`);
console.log(`  tsl-v12:          ${tslSet.size}`);
console.log(`  bsl-v12:          ${bslSet.size}`);
console.log(`  subtlex (top60k): ${subtlexSet.size}`);

// -------- 語形変化の展開（マッチ率を上げる） --------

function inferVariants(word) {
  const w = word.toLowerCase().replace(/^the\s+/, "").replace(/^to\s+/, "").trim();
  const variants = new Set([w]);
  // 代表的な語尾パターンで素の形に戻す
  if (w.endsWith("ies")) variants.add(w.slice(0, -3) + "y");
  if (w.endsWith("es")) variants.add(w.slice(0, -2));
  if (w.endsWith("s") && w.length > 2) variants.add(w.slice(0, -1));
  if (w.endsWith("ed")) {
    variants.add(w.slice(0, -2));
    variants.add(w.slice(0, -1)); // "loved" -> "love"
  }
  if (w.endsWith("ing")) {
    variants.add(w.slice(0, -3));
    variants.add(w.slice(0, -3) + "e"); // "making" -> "make"
  }
  if (w.endsWith("ly")) variants.add(w.slice(0, -2));
  if (w.endsWith("er")) variants.add(w.slice(0, -2));
  if (w.endsWith("est")) variants.add(w.slice(0, -3));
  // 元単語は長さ関係なく残す（"I"/"a" 等）。派生は 2 文字以上のみ。
  return [...variants].filter((v) => v && (v === w || v.length >= 2));
}

function hitAnySource(set, variants) {
  for (const v of variants) {
    if (set.has(v)) return true;
  }
  return false;
}

// -------- マスター処理 --------

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const masterFiles = {};
for (const lv of levels) {
  masterFiles[lv] = {
    path: path.join(MASTER_DIR, `level-${lv}.json`),
    data: JSON.parse(fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8")),
  };
}

let totalWords = 0;
let attachedCount = 0;
let manualCount = 0;
const perSource = {};
const noMatchSamples = [];

for (const lv of levels) {
  for (const w of masterFiles[lv].data) {
    totalWords++;
    const variants = inferVariants(w.word);
    const sources = [];

    if (hitAnySource(cefrjSet, variants)) sources.push("cefrj-v15");
    if (hitAnySource(octanoveSet, variants)) sources.push("octanove-c1c2-v10");
    if (hitAnySource(ngslSet, variants)) sources.push("ngsl");
    if (hitAnySource(nawlSet, variants)) sources.push("nawl");
    if (hitAnySource(tslSet, variants)) sources.push("tsl-v12");
    if (hitAnySource(bslSet, variants)) sources.push("bsl-v12");
    if (hitAnySource(subtlexSet, variants)) sources.push("subtlex");

    if (sources.length === 0) {
      sources.push("manual");
      manualCount++;
      if (noMatchSamples.length < 20) noMatchSamples.push(`[${lv}] ${w.word}`);
    } else {
      attachedCount++;
    }

    for (const s of sources) perSource[s] = (perSource[s] || 0) + 1;
    w.sources = sources;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Total words: ${totalWords}`);
console.log(`Attached (any source hit): ${attachedCount}`);
console.log(`Manual only (no source hit): ${manualCount}`);
console.log(`\nPer-source counts (重複を含む):`);
for (const [s, n] of Object.entries(perSource).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${s}: ${n}`);
}

if (verbose) {
  console.log(`\nManual-only samples (first 20):`);
  for (const s of noMatchSamples) console.log(`  ${s}`);
}

if (!dryRun) {
  for (const lv of levels) {
    fs.writeFileSync(masterFiles[lv].path, JSON.stringify(masterFiles[lv].data, null, 2) + "\n");
  }
  console.log(`\nUpdated ${levels.length} level-*.json files`);
}
