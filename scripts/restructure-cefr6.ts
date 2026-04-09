/**
 * master/*.ts をCEFR 6レベル × 10,000/レベルに再構成するスクリプト
 *
 * level-a1: ID 1-10,000 (diff 1)
 * level-a2: ID 10,001-20,000 (diff 2)
 * level-b1: ID 20,001-30,000 (diff 3,4)
 * level-b2: ID 30,001-40,000 (diff 5,6)
 * level-c1: ID 40,001-50,000 (diff 7 - eiken:1除くC1語)
 * level-c2: ID 50,001-60,000 (diff 7 - conversation:c2のみ → 将来拡張)
 *
 * 実行: npx tsx scripts/restructure-cefr6.ts
 */

import { masterWords } from "../src/data/words/master";
import type { MasterWord } from "../src/data/words/types";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// CEFR level assignment
// ============================================================

// Map course:stage to CEFR level (1-6)
const CEFR_MAP: Record<string, number> = {
  "junior:1": 1, "junior:2": 2, "junior:3": 3,
  "senior:1": 3, "senior:2": 4, "senior:3": 4,
  "eiken:5": 1, "eiken:4": 2, "eiken:3": 3, "eiken:pre2": 3, "eiken:2": 4, "eiken:pre1": 5, "eiken:1": 5,
  "toeic:500": 2, "toeic:600": 3, "toeic:700": 4, "toeic:800": 5, "toeic:900": 5,
  "conversation:a1": 1, "conversation:a2": 2, "conversation:b1": 3, "conversation:b2": 4, "conversation:c1": 5, "conversation:c2": 6,
};

function getCefrLevel(w: MasterWord): number {
  return Math.min(
    ...w.courses.map((c) => {
      const key = `${c.course}:${c.stage}`;
      return CEFR_MAP[key] ?? 5;
    })
  );
}

// ============================================================
// Group by CEFR level
// ============================================================

const ID_PER_LEVEL = 10000;
const LEVEL_LABELS = ["a1", "a2", "b1", "b2", "c1", "c2"];
const LEVEL_NAMES = ["A1 基礎", "A2 初級", "B1 中級", "B2 上級", "C1 上級者", "C2 達人"];

const groups: MasterWord[][] = Array.from({ length: 6 }, () => []);

for (const w of masterWords) {
  const level = getCefrLevel(w);
  groups[level - 1].push(w);
}

// Sort each group alphabetically
for (const g of groups) {
  g.sort((a, b) => {
    const cmp = a.word.toLowerCase().localeCompare(b.word.toLowerCase());
    if (cmp !== 0) return cmp;
    return a.partOfSpeech.localeCompare(b.partOfSpeech);
  });
}

// ============================================================
// ID reassignment
// ============================================================

const oldToNewId: Record<number, number> = {};

for (let i = 0; i < 6; i++) {
  const baseId = i * ID_PER_LEVEL + 1;
  if (groups[i].length > ID_PER_LEVEL) {
    throw new Error(`Level ${LEVEL_LABELS[i]} has ${groups[i].length} words, exceeding ${ID_PER_LEVEL}`);
  }
  groups[i].forEach((w, j) => {
    const newId = baseId + j;
    oldToNewId[w.id] = newId;
    w.id = newId;
  });
}

console.log("=== CEFR 6レベル再構成 ===");
for (let i = 0; i < 6; i++) {
  const start = i * ID_PER_LEVEL + 1;
  const end = start + groups[i].length - 1;
  const endRange = (i + 1) * ID_PER_LEVEL;
  console.log(
    `${LEVEL_LABELS[i]} (${LEVEL_NAMES[i]}): ${groups[i].length}語 (ID ${start}-${end}, 余裕${endRange - end})`
  );
}
console.log(`合計: ${masterWords.length}語`);

// ============================================================
// Write files
// ============================================================

function escapeString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function formatEntry(w: MasterWord): string {
  const exLines = w.examples
    .map(
      (ex) =>
        `      { en: "${escapeString(ex.en)}", ja: "${escapeString(ex.ja)}", context: "${escapeString(ex.context)}" }`
    )
    .join(",\n");

  const cats = w.categories.map((c) => `"${escapeString(c)}"`).join(", ");
  const courses = w.courses
    .map((c) => `{ course: "${c.course}", stage: "${c.stage}" }`)
    .join(", ");

  return `  {
    id: ${w.id},
    word: "${escapeString(w.word)}",
    meaning: "${escapeString(w.meaning)}",
    partOfSpeech: "${w.partOfSpeech}",
    examples: [
${exLines},
    ],
    categories: [${cats}],
    frequencyTier: ${w.frequencyTier},
    courses: [${courses}],
  }`;
}

const masterDir = path.join(__dirname, "../src/data/words/master");

// Remove old files
const oldFiles = fs.readdirSync(masterDir).filter((f) => f.endsWith(".ts"));
for (const f of oldFiles) {
  fs.unlinkSync(path.join(masterDir, f));
}

for (let i = 0; i < 6; i++) {
  const fileName = `level-${LEVEL_LABELS[i]}.ts`;
  const entries = groups[i].map((w) => formatEntry(w));
  const content = `import type { MasterWord } from "../types";

/**
 * CEFR ${LEVEL_LABELS[i].toUpperCase()} — ${LEVEL_NAMES[i]}
 * ID範囲: ${i * ID_PER_LEVEL + 1} - ${(i + 1) * ID_PER_LEVEL}
 * 現在: ${groups[i].length}語
 */
export const words: MasterWord[] = [
${entries.join(",\n")},
];
`;

  fs.writeFileSync(path.join(masterDir, fileName), content);
  console.log(`Wrote ${fileName}`);
}

// Write index.ts
const indexContent = `import type { MasterWord } from "../types";
import { words as a1 } from "./level-a1";
import { words as a2 } from "./level-a2";
import { words as b1 } from "./level-b1";
import { words as b2 } from "./level-b2";
import { words as c1 } from "./level-c1";
import { words as c2 } from "./level-c2";

export const masterWords: MasterWord[] = [
  ...a1,
  ...a2,
  ...b1,
  ...b2,
  ...c1,
  ...c2,
];
`;

fs.writeFileSync(path.join(masterDir, "index.ts"), indexContent);
console.log("Wrote index.ts");

console.log("=== Complete ===");
