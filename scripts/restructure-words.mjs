#!/usr/bin/env node
/**
 * Migration script: Restructure word data files
 *
 * Reads all 25 existing word data files, converts each word to the new
 * simplified Word type, and outputs 5 course files (1 per course).
 *
 * Usage: node scripts/restructure-words.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const WORDS_DIR = join(ROOT, "src/data/words");

// --- Configuration ---

const ID_START = {
  junior: 10001,
  senior: 20001,
  toeic: 30001,
  eiken: 40001,
  conversation: 70001,
};

const STAGE_MAP = {
  junior1: "1", junior2: "2", junior3: "3",
  senior1: "1", senior2: "2", senior3: "3",
  eiken5: "5", eiken4: "4", eiken3: "3", eikenPre2: "pre2", eiken2: "2", eikenPre1: "pre1", eiken1: "1",
  toeic500: "500", toeic600: "600", toeic700: "700", toeic800: "800", toeic900: "900",
  convBeginner: "1", convElementary: "2", convIntermediate: "3", convAdvanced: "4", convNative: "5",
};

const FREQ_MAP = { A: 1, B: 2, C: 3, D: 4 };

const POS_MAP = {
  noun: "noun", verb: "verb", adjective: "adjective", adverb: "adverb",
  preposition: "other", conjunction: "other", pronoun: "other", interjection: "other",
};

const COURSE_FILES = {
  junior: [
    { file: "junior/junior1.ts", level: "junior1" },
    { file: "junior/junior2.ts", level: "junior2" },
    { file: "junior/junior3.ts", level: "junior3" },
  ],
  senior: [
    { file: "senior/senior1.ts", level: "senior1" },
    { file: "senior/senior2.ts", level: "senior2" },
    { file: "senior/senior3.ts", level: "senior3" },
  ],
  toeic: [
    { file: "toeic/toeic500.ts", level: "toeic500" },
    { file: "toeic/toeic600.ts", level: "toeic600" },
    { file: "toeic/toeic700.ts", level: "toeic700" },
    { file: "toeic/toeic800.ts", level: "toeic800" },
    { file: "toeic/toeic900.ts", level: "toeic900" },
  ],
  eiken: [
    { file: "eiken/eiken5.ts", level: "eiken5" },
    { file: "eiken/eiken4.ts", level: "eiken4" },
    { file: "eiken/eiken3.ts", level: "eiken3" },
    { file: "eiken/eikenPre2.ts", level: "eikenPre2" },
    { file: "eiken/eiken2.ts", level: "eiken2" },
    { file: "eiken/eikenPre1.ts", level: "eikenPre1" },
    { file: "eiken/eiken1.ts", level: "eiken1" },
  ],
  conversation: [
    { file: "conversation/beginner.ts", level: "convBeginner" },
    { file: "conversation/elementary.ts", level: "convElementary" },
    { file: "conversation/intermediate.ts", level: "convIntermediate" },
    { file: "conversation/advanced.ts", level: "convAdvanced" },
    { file: "conversation/native.ts", level: "convNative" },
  ],
};

// --- Parse words from TS file ---

/**
 * Extract individual field values from a word object string using targeted regexes.
 * Each word is on a single line so we parse line by line.
 */
function extractField(line, fieldName) {
  // Match: fieldName: "value"
  const strRegex = new RegExp(`${fieldName}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g");
  const m = strRegex.exec(line);
  return m ? m[1] : undefined;
}

function extractNumField(line, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*(\\d+)`);
  const m = regex.exec(line);
  return m ? parseInt(m[1]) : undefined;
}

function parseWordsFromFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const words = [];

  // Each word object is on a single line starting with "  { id:"
  for (const line of content.split("\n")) {
    if (!line.trim().startsWith("{ id:")) continue;

    const id = extractNumField(line, "id");
    const word = extractField(line, "word");
    const meaning = extractField(line, "meaning");
    const example = extractField(line, "example");
    const frequencyRank = extractField(line, "frequencyRank");
    const partOfSpeech = extractField(line, "partOfSpeech");

    if (id === undefined || !word || !meaning) {
      console.warn(`  WARNING: Could not parse line: ${line.substring(0, 80)}...`);
      continue;
    }

    words.push({ id, word, meaning, example, frequencyRank, partOfSpeech });
  }

  return words;
}

// --- Convert & generate ---

function escapeString(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatWord(w) {
  const parts = [
    `id: ${w.id}`,
    `word: "${escapeString(w.word)}"`,
    `meaning: "${escapeString(w.meaning)}"`,
    `partOfSpeech: "${w.partOfSpeech}"`,
    `course: "${w.course}"`,
    `stage: "${w.stage}"`,
  ];
  if (w.example) {
    parts.push(`example: "${escapeString(w.example)}"`);
  }
  if (w.frequencyRank !== undefined) {
    parts.push(`frequencyRank: ${w.frequencyRank}`);
  }
  return `  { ${parts.join(", ")} }`;
}

function processCourse(courseName) {
  const files = COURSE_FILES[courseName];
  let idCounter = ID_START[courseName];
  const allWords = [];

  for (const { file, level } of files) {
    const filePath = join(WORDS_DIR, file);
    const stage = STAGE_MAP[level];
    const rawWords = parseWordsFromFile(filePath);

    console.log(`  ${file}: ${rawWords.length} words (stage=${stage})`);

    for (const raw of rawWords) {
      const converted = {
        id: idCounter++,
        word: raw.word,
        meaning: raw.meaning,
        partOfSpeech: POS_MAP[raw.partOfSpeech] || "other",
        course: courseName,
        stage,
        example: raw.example,
        frequencyRank: FREQ_MAP[raw.frequencyRank],
      };
      allWords.push(converted);
    }
  }

  return allWords;
}

function generateCourseFile(courseName, words) {
  const idMin = ID_START[courseName] - (ID_START[courseName] % 10000);
  const idMax = idMin + 9999;
  const varName = `${courseName}Words`;

  const lines = [
    `import { Word } from "./types";`,
    ``,
    `// ${courseName} コース — ID範囲: ${idMin}-${idMax}`,
    `export const ${varName} = [`,
    ...words.map((w) => formatWord(w) + ","),
    `] satisfies Word[];`,
    ``,
  ];

  return lines.join("\n");
}

// --- Main ---

console.log("=== Word Data Restructuring ===\n");

const stats = {};

for (const courseName of Object.keys(COURSE_FILES)) {
  console.log(`Processing ${courseName}...`);
  const words = processCourse(courseName);
  stats[courseName] = words.length;

  const output = generateCourseFile(courseName, words);
  const outPath = join(WORDS_DIR, `${courseName}.ts`);
  writeFileSync(outPath, output, "utf-8");
  console.log(`  -> Written ${words.length} words to ${courseName}.ts\n`);
}

console.log("=== Summary ===");
let total = 0;
for (const [course, count] of Object.entries(stats)) {
  console.log(`  ${course}: ${count} words`);
  total += count;
}
console.log(`  TOTAL: ${total} words`);
console.log("\nDone!");
