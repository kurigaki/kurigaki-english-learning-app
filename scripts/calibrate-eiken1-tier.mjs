#!/usr/bin/env node
// T-VQS-020 Phase 2.2: 英検1級パイロット tier 投入スクリプト
//
// 判定ロジック（docs/tier-calibration-policy.md 準拠）:
//   tier1: Octanove C1（英検1級の C1 コア語彙）または NAWL（1級長文に頻出する学術語）
//   tier2: Octanove C2（C1-C2 境界の難語）or CEFR-J B2（既習だが1級で再出題される範囲）or BSL（ビジネス・経済語彙）
//   tier3: NGSL 基本語（既習で学習優先度低） or 未マッチの専門語（Phase 3 で手動補完）
//
// 基本原則:
//   - オーナー方針「参考文献に従う」に従い、目標分布は強制しない
//   - 結果分布を出力してユーザーが検証可能にする
//   - CourseAssignment.tier に値を投入（後方互換、未設定ならフォールバック）

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
  // 簡易 CSV パーサ（引用符なしを想定）
  const lines = text.trim().split("\n");
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const parts = line.split(",");
    const obj = {};
    header.forEach((h, i) => (obj[h.trim()] = (parts[i] || "").trim()));
    return obj;
  });
}

// Octanove C1/C2
const octanoveRaw = parseCsvSimple(fs.readFileSync(path.join(SOURCES_DIR, "octanove-c1c2-v10.csv"), "utf-8"));
const octanoveC1 = new Set(octanoveRaw.filter((r) => r.CEFR === "C1").map((r) => r.headword.toLowerCase()));
const octanoveC2 = new Set(octanoveRaw.filter((r) => r.CEFR === "C2").map((r) => r.headword.toLowerCase()));
console.log(`Octanove C1: ${octanoveC1.size} words`);
console.log(`Octanove C2: ${octanoveC2.size} words`);

// NAWL
const nawlObj = JSON.parse(fs.readFileSync(path.join(SOURCES_DIR, "nawl.json"), "utf-8"));
const nawl = new Set(Object.keys(nawlObj).map((w) => w.toLowerCase()));
console.log(`NAWL: ${nawl.size} words`);

// CEFR-J（参考用、英検1級では基本使わないが全レベル集計のため保持）
const cefrjRaw = parseCsvSimple(fs.readFileSync(path.join(SOURCES_DIR, "cefrj-v15.csv"), "utf-8"));
const cefrjMap = new Map(); // headword → CEFR level
for (const r of cefrjRaw) {
  const headword = r.headword.toLowerCase().trim();
  // 複数行あったら最も厳しいレベルを採用
  const existing = cefrjMap.get(headword);
  const levels = ["A1", "A2", "B1", "B2"];
  if (!existing || levels.indexOf(r.CEFR) > levels.indexOf(existing)) {
    cefrjMap.set(headword, r.CEFR);
  }
}
console.log(`CEFR-J: ${cefrjMap.size} words (参考用)`);

// NGSL（バンド別に分けて保持）
const ngslRaw = JSON.parse(fs.readFileSync(path.join(SOURCES_DIR, "ngsl.json"), "utf-8"));
const ngslBasic = new Set(); // band 1000/2000 — 基礎語（既習、tier3 for 1級）
const ngslIntermediate = new Set(); // band 3000 — 中級語（tier2 for 1級、復習価値あり）
for (const w of Object.keys(ngslRaw["1000"] ?? {})) ngslBasic.add(w.toLowerCase());
for (const w of Object.keys(ngslRaw["2000"] ?? {})) ngslBasic.add(w.toLowerCase());
for (const w of Object.keys(ngslRaw["3000"] ?? {})) ngslIntermediate.add(w.toLowerCase());
console.log(`NGSL basic (1000+2000): ${ngslBasic.size} words`);
console.log(`NGSL intermediate (3000): ${ngslIntermediate.size} words`);

// BSL（ビジネス語彙）
const bslRaw = fs.readFileSync(path.join(SOURCES_DIR, "bsl-v12.csv"), "utf-8").trim().split("\n").slice(1);
const bsl = new Set();
for (const line of bslRaw) {
  const word = line.split(",")[0].trim().toLowerCase();
  if (word) bsl.add(word);
}
console.log(`BSL: ${bsl.size} words`);

// CEFR-J B2（英検2級～準1級レベル、1級でも tier2 扱い）
const cefrjB2 = new Set();
for (const [w, lv] of cefrjMap) if (lv === "B2") cefrjB2.add(w);
console.log(`CEFR-J B2: ${cefrjB2.size} words`);

// -------- 判定ロジック --------

/**
 * 英検1級の語に対する tier 判定
 * policy（改訂版）:
 *   tier1: Octanove C1 OR NAWL（1級で必ず出る C1 コア + 学術語）
 *   tier2: Octanove C2 OR CEFR-J B2 OR BSL（C1-C2 境界 + 既習だが1級で出る + ビジネス）
 *   tier3: それ以外（NGSL 基本語含む、既習で学習優先度が低い or 未マッチ）
 */
function decideTierForEiken1(word) {
  const w = word.toLowerCase().replace(/^the\s+/, "").trim();
  // 複数形・活用形の正規化
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
    w.replace(/ion$/, "e"),   // -tion 系の名詞から動詞
    w.replace(/ation$/, "ate"),
    w.replace(/tion$/, "t"),
  ].filter((v) => v && v.length >= 2);

  const hitC1 = variants.some((v) => octanoveC1.has(v));
  const hitC2 = variants.some((v) => octanoveC2.has(v));
  const hitNawl = variants.some((v) => nawl.has(v));
  const hitB2 = variants.some((v) => cefrjB2.has(v));
  const hitBsl = variants.some((v) => bsl.has(v));
  const hitNgslInter = variants.some((v) => ngslIntermediate.has(v));
  const hitNgslBasic = variants.some((v) => ngslBasic.has(v));

  // 優先順位: tier1 > tier2 > tier3
  // 英検1級では、Octanove C1 / NAWL を tier1（コア C1・学術語）、
  // Octanove C2 / CEFR-J B2 / BSL / NGSL band 3000 を tier2 (復習価値あり)、
  // NGSL basic (band 1000/2000) は tier3（既に超基礎語なので 1級 学習優先度低）、
  // 未マッチも tier3（Phase 3 で手動補完）。
  if (hitC1) return { tier: 1, source: "Octanove C1" };
  if (hitNawl) return { tier: 1, source: "NAWL" };
  if (hitC2) return { tier: 2, source: "Octanove C2" };
  if (hitB2) return { tier: 2, source: "CEFR-J B2" };
  if (hitBsl) return { tier: 2, source: "BSL" };
  if (hitNgslInter) return { tier: 2, source: "NGSL 3000 band" };
  if (hitNgslBasic) return { tier: 3, source: "NGSL basic (既習)" };
  return { tier: 3, source: "unranked" };
}

// -------- 英検1級語の抽出と判定 --------

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const allMaster = [];
for (const lv of levels) {
  const data = JSON.parse(fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8"));
  allMaster.push({ level: lv, data });
}

let totalEiken1 = 0;
const distribution = { 1: 0, 2: 0, 3: 0 };
const bySource = {};
const sampleByTier = { 1: [], 2: [], 3: [] };

for (const { data } of allMaster) {
  for (const word of data) {
    const eiken1Assignment = word.courses.find((c) => c.course === "eiken" && c.stage === "1");
    if (!eiken1Assignment) continue;
    totalEiken1++;
    const { tier, source } = decideTierForEiken1(word.word);
    distribution[tier]++;
    bySource[source] = (bySource[source] || 0) + 1;
    if (sampleByTier[tier].length < 10) {
      sampleByTier[tier].push(`${word.word} (${source})`);
    }
  }
}

console.log(`\n=== 英検1級 tier 判定結果 ===`);
console.log(`対象語数: ${totalEiken1}`);
console.log(`tier1: ${distribution[1]} (${(distribution[1] / totalEiken1 * 100).toFixed(1)}%)`);
console.log(`tier2: ${distribution[2]} (${(distribution[2] / totalEiken1 * 100).toFixed(1)}%)`);
console.log(`tier3: ${distribution[3]} (${(distribution[3] / totalEiken1 * 100).toFixed(1)}%)`);
console.log(`\n判定ソース別:`);
Object.entries(bySource).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log(`\nサンプル tier1:`, sampleByTier[1]);
console.log(`サンプル tier2:`, sampleByTier[2]);
console.log(`サンプル tier3:`, sampleByTier[3]);

// -------- 適用 --------

if (!dryRun) {
  let applied = 0;
  for (const { level, data } of allMaster) {
    let changed = false;
    for (const word of data) {
      const assignment = word.courses.find((c) => c.course === "eiken" && c.stage === "1");
      if (!assignment) continue;
      const { tier } = decideTierForEiken1(word.word);
      if (assignment.tier !== tier) {
        assignment.tier = tier;
        applied++;
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(path.join(MASTER_DIR, `level-${level}.json`), JSON.stringify(data, null, 2) + "\n");
      console.log(`Updated: level-${level}.json`);
    }
  }
  console.log(`\nApplied: ${applied} entries`);
} else {
  console.log(`\n(DRY-RUN — 変更は適用されていません。--apply を省略して本番実行してください)`);
}
