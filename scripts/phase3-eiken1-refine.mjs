#!/usr/bin/env node
// Phase 3 パイロット: 英検1級 tier3 の語を SUBTLEX-US 頻度で再判定
//
// 判定ルール（docs/tier-calibration-policy.md §5 Phase 3 追補）:
//   現在 tier3 の英検1級語に対して、SUBTLEX-US ランクで再評価:
//     rank 15,001-40,000   → tier1 (C1-C2 sweet spot、1級 最頻出 specialty)
//     rank 5,001-15,000    → tier2 (borderline, 学習価値あり)
//     rank 40,001-60,000   → tier2 (やや rare, stretch)
//     rank 1-5,000         → tier3 継続（基本語、既習で優先度低）
//     rank 60,001+         → tier3 継続（極稀、1級 priority には入らない）
//     SUBTLEX 未登録       → tier3 継続（判定不能）

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MASTER_DIR = path.join(ROOT, "src", "data", "words", "master");
const SOURCES_DIR = path.join(ROOT, "data", "vocab-sources");

const dryRun = process.argv.includes("--dry");

// -------- SUBTLEX 読み込み --------
const subtlexRaw = JSON.parse(fs.readFileSync(path.join(SOURCES_DIR, "subtlex.json"), "utf-8"));
const subtlexRank = new Map();
for (let i = 0; i < subtlexRaw.length; i++) {
  const w = subtlexRaw[i].word.toLowerCase();
  if (!subtlexRank.has(w)) subtlexRank.set(w, i + 1);
}
console.log(`SUBTLEX: ${subtlexRank.size} words loaded`);

// -------- 変換候補の判定 --------
function inferVariants(word) {
  const w = word.toLowerCase().replace(/^the\s+/, "").trim();
  return [
    w,
    w.replace(/s$/, ""),
    w.replace(/es$/, ""),
    w.replace(/ed$/, ""),
    w.replace(/ed$/, "e"),
    w.replace(/ing$/, ""),
    w.replace(/ing$/, "e"),
    w.replace(/ies$/, "y"),
    w.replace(/ly$/, ""),
  ].filter((v) => v && v.length >= 2);
}

function getSubtlexRank(word) {
  for (const v of inferVariants(word)) {
    if (subtlexRank.has(v)) return subtlexRank.get(v);
  }
  return null;
}

function reClassifyTier(word) {
  const rank = getSubtlexRank(word);
  if (rank === null) return { tier: 3, source: "unranked (stay)" };
  if (rank <= 5000) return { tier: 3, source: `SUBTLEX rank ${rank} (basic, stay)` };
  if (rank <= 15000) return { tier: 2, source: `SUBTLEX rank ${rank} (borderline)` };
  if (rank <= 40000) return { tier: 1, source: `SUBTLEX rank ${rank} (1級 core)` };
  if (rank <= 60000) return { tier: 2, source: `SUBTLEX rank ${rank} (stretch)` };
  return { tier: 3, source: `SUBTLEX rank ${rank} (rare, stay)` };
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

// 英検1級語のうち、tier3 のものを抽出 → 再判定
let total = 0, tier3Count = 0;
const changes = { "3→1": 0, "3→2": 0, "3→3": 0 };
const sampleByChange = { "3→1": [], "3→2": [], "3→3": [] };

for (const lv of levels) {
  for (const word of masterFiles[lv].data) {
    const assignment = word.courses.find((c) => c.course === "eiken" && c.stage === "1");
    if (!assignment) continue;
    total++;
    if (assignment.tier !== 3) continue;
    tier3Count++;

    const { tier: newTier, source } = reClassifyTier(word.word);
    const key = `3→${newTier}`;
    changes[key]++;
    if (sampleByChange[key].length < 10) {
      sampleByChange[key].push(`${word.word} (${source})`);
    }
    if (newTier !== 3) {
      assignment.tier = newTier;
    }
  }
}

console.log(`\n=== Phase 3 パイロット結果（英検1級） ===`);
console.log(`対象語数: ${total}`);
console.log(`元 tier3 (再判定対象): ${tier3Count}`);
console.log(`  → tier1: ${changes["3→1"]} (昇格)`);
console.log(`  → tier2: ${changes["3→2"]} (昇格)`);
console.log(`  → tier3: ${changes["3→3"]} (据え置き)`);
console.log(`\nサンプル 3→1:`, sampleByChange["3→1"]);
console.log(`\nサンプル 3→2:`, sampleByChange["3→2"]);
console.log(`\nサンプル 3→3:`, sampleByChange["3→3"]);

// -------- 書き込み --------
if (!dryRun) {
  for (const lv of levels) {
    fs.writeFileSync(masterFiles[lv].path, JSON.stringify(masterFiles[lv].data, null, 2) + "\n");
  }
  console.log(`\nUpdated ${levels.length} level-*.json files`);
} else {
  console.log(`\n(DRY-RUN — no changes applied)`);
}
