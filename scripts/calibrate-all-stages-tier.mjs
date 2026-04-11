#!/usr/bin/env node
// T-VQS-020 Phase 2.4: 全24ステージのコース別 tier を参考文献に基づいて自動判定・投入
//
// 方針（docs/tier-calibration-policy.md 準拠）:
//   1. 各語の CEFR レベルを参考文献から推定（CEFR-J > Octanove > NGSL 推定）
//   2. 各ステージに対応する CEFR 目標範囲を定義
//   3. 語の CEFR と目標範囲の関係から tier を決定
//      - 目標範囲内 → tier1
//      - 目標範囲 ±1 → tier2
//      - それ以外 → tier3

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MASTER_DIR = path.join(ROOT, "src", "data", "words", "master");
const SOURCES_DIR = path.join(ROOT, "data", "vocab-sources");

const dryRun = process.argv.includes("--dry");

// -------- 参考文献読み込み --------

function parseCsvSimple(text) {
  const lines = text.trim().split("\n");
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const parts = line.split(",");
    const obj = {};
    header.forEach((h, i) => (obj[h.trim()] = (parts[i] || "").trim()));
    return obj;
  });
}

// CEFR-J: headword → CEFR level
const cefrjRaw = parseCsvSimple(fs.readFileSync(path.join(SOURCES_DIR, "cefrj-v15.csv"), "utf-8"));
const cefrjMap = new Map();
const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
for (const r of cefrjRaw) {
  const headword = r.headword.toLowerCase().trim();
  // 複数品詞あるなら最も厳しいレベルを採用
  const existing = cefrjMap.get(headword);
  if (!existing || levelOrder.indexOf(r.CEFR) > levelOrder.indexOf(existing)) {
    cefrjMap.set(headword, r.CEFR);
  }
}

// Octanove C1/C2
const octanoveRaw = parseCsvSimple(fs.readFileSync(path.join(SOURCES_DIR, "octanove-c1c2-v10.csv"), "utf-8"));
const octanoveMap = new Map();
for (const r of octanoveRaw) {
  const headword = r.headword.toLowerCase().trim();
  octanoveMap.set(headword, r.CEFR);
}

// NAWL: 学術語 → 概ね B2-C1
const nawlObj = JSON.parse(fs.readFileSync(path.join(SOURCES_DIR, "nawl.json"), "utf-8"));
const nawlSet = new Set(Object.keys(nawlObj).map((w) => w.toLowerCase()));

// NGSL: バンド別 → CEFR 推定
const ngslRaw = JSON.parse(fs.readFileSync(path.join(SOURCES_DIR, "ngsl.json"), "utf-8"));
const ngslBand1 = new Set(); // rank 1-1000 → A1
const ngslBand2 = new Set(); // rank 1001-2000 → A2
const ngslBand3 = new Set(); // rank 2001-2800 → B1
for (const w of Object.keys(ngslRaw["1000"] ?? {})) ngslBand1.add(w.toLowerCase());
for (const w of Object.keys(ngslRaw["2000"] ?? {})) ngslBand2.add(w.toLowerCase());
for (const w of Object.keys(ngslRaw["3000"] ?? {})) ngslBand3.add(w.toLowerCase());

// BSL: ビジネス語 → 概ね B1-B2
const bslRaw = fs.readFileSync(path.join(SOURCES_DIR, "bsl-v12.csv"), "utf-8").trim().split("\n").slice(1);
const bslSet = new Set();
for (const line of bslRaw) {
  const w = line.split(",")[0].trim().toLowerCase();
  if (w) bslSet.add(w);
}

// TSL: TOEIC語 → 概ね B1-B2
const tslRaw = fs.readFileSync(path.join(SOURCES_DIR, "tsl-v12.csv"), "utf-8").trim().split("\n").slice(1);
const tslSet = new Set();
for (const line of tslRaw) {
  const w = line.split(",")[0].trim().toLowerCase();
  if (w) tslSet.add(w);
}

console.log(`参考文献読込:`);
console.log(`  CEFR-J: ${cefrjMap.size} words`);
console.log(`  Octanove C1/C2: ${octanoveMap.size} words`);
console.log(`  NAWL: ${nawlSet.size} words`);
console.log(`  NGSL band1/2/3: ${ngslBand1.size}/${ngslBand2.size}/${ngslBand3.size}`);
console.log(`  BSL: ${bslSet.size}, TSL: ${tslSet.size}`);

// -------- CEFR 推定ロジック --------

/**
 * 1単語の CEFR レベルを推定
 * 優先順位: CEFR-J（最も確実）> Octanove > NGSL 推定 > NAWL/BSL/TSL 推定
 */
function inferCefr(word) {
  const w = word.toLowerCase().replace(/^the\s+/, "").trim();
  // 活用形・複数形の変換候補
  const variants = [
    w,
    w.replace(/s$/, ""),
    w.replace(/es$/, ""),
    w.replace(/ed$/, ""),
    w.replace(/ed$/, "e"),
    w.replace(/ing$/, ""),
    w.replace(/ing$/, "e"),
    w.replace(/ies$/, "y"),
    w.replace(/ly$/, ""),
    w.replace(/er$/, ""),
    w.replace(/est$/, ""),
    w.replace(/ation$/, "ate"),
    w.replace(/tion$/, "t"),
  ].filter((v) => v && v.length >= 2);

  // 1. CEFR-J 直接ヒット
  for (const v of variants) {
    if (cefrjMap.has(v)) return { level: cefrjMap.get(v), source: `CEFR-J` };
  }
  // 2. Octanove C1/C2
  for (const v of variants) {
    if (octanoveMap.has(v)) return { level: octanoveMap.get(v), source: `Octanove` };
  }
  // 3. NAWL → C1 推定（学術語）
  for (const v of variants) {
    if (nawlSet.has(v)) return { level: "C1", source: `NAWL (推定)` };
  }
  // 4. NGSL band1 → A1
  for (const v of variants) {
    if (ngslBand1.has(v)) return { level: "A1", source: `NGSL band1 (推定)` };
  }
  // 5. NGSL band2 → A2
  for (const v of variants) {
    if (ngslBand2.has(v)) return { level: "A2", source: `NGSL band2 (推定)` };
  }
  // 6. NGSL band3 → B1
  for (const v of variants) {
    if (ngslBand3.has(v)) return { level: "B1", source: `NGSL band3 (推定)` };
  }
  // 7. BSL → B2 推定（ビジネス語）
  for (const v of variants) {
    if (bslSet.has(v)) return { level: "B2", source: `BSL (推定)` };
  }
  // 8. TSL → B1 推定（TOEIC語、B1-B2境界だが B1 寄り）
  for (const v of variants) {
    if (tslSet.has(v)) return { level: "B1", source: `TSL (推定)` };
  }

  return { level: null, source: `unranked` };
}

// -------- ステージ別目標 CEFR 範囲 --------

const levelToNum = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

// [min, max] の CEFR 番号範囲
const STAGE_TARGET = {
  // junior
  "junior:1": [1, 1],   // A1
  "junior:2": [1, 2],   // A1-A2
  "junior:3": [2, 2],   // A2
  // senior
  "senior:1": [2, 3],   // A2-B1
  "senior:2": [3, 4],   // B1-B2
  "senior:3": [4, 4],   // B2
  // eiken
  "eiken:5": [1, 1],    // A1 以下 → A1 扱い
  "eiken:4": [1, 1],    // A1
  "eiken:3": [1, 2],    // A1-A2
  "eiken:pre2": [2, 3], // A2-B1
  "eiken:2": [3, 3],    // B1
  "eiken:pre1": [4, 4], // B2
  "eiken:1": [5, 6],    // C1-C2
  // toeic
  "toeic:500": [2, 3],  // A2-B1
  "toeic:600": [3, 3],  // B1
  "toeic:700": [4, 4],  // B2（B1からの次ステップ、B1は復習扱いで tier2）
  "toeic:800": [4, 5],  // B2-C1（B2 応用 + C1 導入）
  "toeic:900": [5, 5],  // C1
  // conversation
  "conversation:a1": [1, 1],
  "conversation:a2": [2, 2],
  "conversation:b1": [3, 3],
  "conversation:b2": [4, 4],
  "conversation:c1": [5, 5],
  "conversation:c2": [6, 6],
};

/**
 * 語の CEFR レベルと目標範囲から tier を決定
 *   範囲内 → tier1
 *   範囲 +1 or -1 → tier2
 *   それ以外 → tier3
 */
function decideTier(wordCefr, target) {
  if (!wordCefr) return 3; // unranked
  const wNum = levelToNum[wordCefr];
  if (!wNum) return 3;
  const [minT, maxT] = target;
  if (wNum >= minT && wNum <= maxT) return 1;
  if (wNum === minT - 1 || wNum === maxT + 1) return 2;
  return 3;
}

// -------- マスターデータ読み込み＆判定 --------

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const masterFiles = {};
for (const lv of levels) {
  masterFiles[lv] = JSON.parse(fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8"));
}

// ステージ別の分布集計
const stageStats = {};
for (const key of Object.keys(STAGE_TARGET)) {
  stageStats[key] = { total: 0, t1: 0, t2: 0, t3: 0 };
}

let totalApplied = 0;

for (const lv of levels) {
  const data = masterFiles[lv];
  for (const word of data) {
    const cefr = inferCefr(word.word);
    for (const assignment of word.courses) {
      const key = `${assignment.course}:${assignment.stage}`;
      const target = STAGE_TARGET[key];
      if (!target) continue; // 未定義ステージはスキップ
      const tier = decideTier(cefr.level, target);
      if (assignment.tier !== tier) {
        assignment.tier = tier;
        totalApplied++;
      }
      const s = stageStats[key];
      s.total++;
      s[`t${tier}`]++;
    }
  }
}

// -------- 分布レポート --------

console.log(`\n=== ステージ別 tier 分布 ===`);
const courseOrder = ["junior", "senior", "eiken", "toeic", "conversation"];
for (const course of courseOrder) {
  console.log(`\n[${course}]`);
  for (const [key, s] of Object.entries(stageStats)) {
    if (!key.startsWith(course + ":")) continue;
    const stage = key.split(":")[1];
    const p1 = (s.t1 / s.total * 100).toFixed(1);
    const p2 = (s.t2 / s.total * 100).toFixed(1);
    const p3 = (s.t3 / s.total * 100).toFixed(1);
    console.log(`  ${stage.padEnd(6)} total:${s.total.toString().padStart(4)} | tier1:${s.t1.toString().padStart(4)} (${p1.padStart(5)}%) | tier2:${s.t2.toString().padStart(4)} (${p2.padStart(5)}%) | tier3:${s.t3.toString().padStart(4)} (${p3.padStart(5)}%)`);
  }
}

// -------- 書き込み --------

if (!dryRun) {
  for (const lv of levels) {
    fs.writeFileSync(path.join(MASTER_DIR, `level-${lv}.json`), JSON.stringify(masterFiles[lv], null, 2) + "\n");
    console.log(`Updated: level-${lv}.json`);
  }
  console.log(`\nApplied: ${totalApplied} tier assignments`);
} else {
  console.log(`\n(DRY-RUN — 変更は適用されていません)`);
}
