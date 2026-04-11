#!/usr/bin/env node
// Phase 3: 高難度ステージ tier3 を SUBTLEX-US 頻度で再判定
//
// 対象:
//   英検準1級 (55% tier3) / 高3 (71%) / TOEIC900 (52%)
//   会話C1 (77%) / 会話C2 (95%)
//
// ステージ別の SUBTLEX rank 閾値:
//   - 高3 / 英検準1級 / TOEIC900 (B2-C1 target):
//     tier1: rank 8,001-25,000
//     tier2: rank 3,001-8,000 OR 25,001-45,000
//     tier3: rank ≤ 3,000 (basic) OR 45,001+ (rare) OR unranked
//
//   - 会話C1 (C1 target, same as eiken:pre1 logic):
//     tier1: rank 10,001-30,000
//     tier2: rank 4,001-10,000 OR 30,001-50,000
//     tier3: rank ≤ 4,000 OR 50,001+ OR unranked
//
//   - 会話C2 (C2 target):
//     tier1: rank 15,001-40,000
//     tier2: rank 5,001-15,000 OR 40,001-60,000
//     tier3: rank ≤ 5,000 OR 60,001+ OR unranked

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MASTER_DIR = path.join(ROOT, "src", "data", "words", "master");
const SOURCES_DIR = path.join(ROOT, "data", "vocab-sources");

const dryRun = process.argv.includes("--dry");

// SUBTLEX
const subtlexRaw = JSON.parse(fs.readFileSync(path.join(SOURCES_DIR, "subtlex.json"), "utf-8"));
const subtlexRank = new Map();
for (let i = 0; i < subtlexRaw.length; i++) {
  const w = subtlexRaw[i].word.toLowerCase();
  if (!subtlexRank.has(w)) subtlexRank.set(w, i + 1);
}

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

// ステージ別の tier 判定ロジック
const STAGE_RULES = {
  // B2-C1 target (rank 8k-25k core)
  "senior:3":   { tier1: [8001, 25000], tier2_low: [3001, 8000], tier2_high: [25001, 45000] },
  "eiken:pre1": { tier1: [8001, 25000], tier2_low: [3001, 8000], tier2_high: [25001, 45000] },
  "toeic:900":  { tier1: [8001, 25000], tier2_low: [3001, 8000], tier2_high: [25001, 45000] },
  // C1 target (rank 10k-30k core)
  "conversation:c1": { tier1: [10001, 30000], tier2_low: [4001, 10000], tier2_high: [30001, 50000] },
  // C2 target (rank 15k-40k core)
  "conversation:c2": { tier1: [15001, 40000], tier2_low: [5001, 15000], tier2_high: [40001, 60000] },
};

function reClassify(word, stageRule) {
  const rank = getSubtlexRank(word);
  if (rank === null) return { tier: 3, reason: "unranked" };
  if (rank < stageRule.tier2_low[0]) return { tier: 3, reason: `basic(${rank})` };
  if (rank <= stageRule.tier2_low[1]) return { tier: 2, reason: `tier2_low(${rank})` };
  if (rank <= stageRule.tier1[1]) return { tier: 1, reason: `tier1(${rank})` };
  if (rank <= stageRule.tier2_high[1]) return { tier: 2, reason: `tier2_high(${rank})` };
  return { tier: 3, reason: `rare(${rank})` };
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

const results = {};
for (const stageKey of Object.keys(STAGE_RULES)) {
  results[stageKey] = { total: 0, t1: 0, t2: 0, t3: 0, changes: { "3→1": 0, "3→2": 0, "3→3": 0 } };
}

for (const lv of levels) {
  for (const word of masterFiles[lv].data) {
    for (const assignment of word.courses) {
      const stageKey = `${assignment.course}:${assignment.stage}`;
      if (!STAGE_RULES[stageKey]) continue;
      const r = results[stageKey];
      r.total++;

      // 集計: 全 tier
      const currentTier = assignment.tier ?? 3;
      if (currentTier !== 3) {
        r[`t${currentTier}`]++;
        continue;
      }

      // tier3 を再判定
      const { tier: newTier } = reClassify(word.word, STAGE_RULES[stageKey]);
      r.changes[`3→${newTier}`]++;
      r[`t${newTier}`]++;
      if (newTier !== 3) {
        assignment.tier = newTier;
      }
    }
  }
}

// -------- レポート --------
console.log("=== Phase 3 拡張: 高難度ステージ tier 再判定 ===\n");
for (const [stageKey, r] of Object.entries(results)) {
  const p1 = (r.t1 / r.total * 100).toFixed(1);
  const p2 = (r.t2 / r.total * 100).toFixed(1);
  const p3 = (r.t3 / r.total * 100).toFixed(1);
  console.log(`[${stageKey}] total:${r.total}`);
  console.log(`  tier1: ${r.t1} (${p1}%) / tier2: ${r.t2} (${p2}%) / tier3: ${r.t3} (${p3}%)`);
  console.log(`  変化: 3→1:${r.changes["3→1"]} / 3→2:${r.changes["3→2"]} / 3→3据置:${r.changes["3→3"]}`);
}

// -------- 書き込み --------
if (!dryRun) {
  for (const lv of levels) {
    fs.writeFileSync(masterFiles[lv].path, JSON.stringify(masterFiles[lv].data, null, 2) + "\n");
  }
  console.log(`\nUpdated ${levels.length} level-*.json files`);
} else {
  console.log(`\n(DRY-RUN — no changes applied)`);
}
