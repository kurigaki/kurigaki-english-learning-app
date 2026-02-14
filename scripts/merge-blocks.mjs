/**
 * Block file merger: Consolidate block files (-b2, -b3, ...) into base files.
 *
 * For each course level (e.g. junior1), reads all block files in order,
 * extracts word data lines, and appends them to the base file.
 * Then deletes the block files.
 *
 * Usage: node scripts/merge-blocks.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(__dirname, "..", "src", "data", "words");

// Define merge groups: [baseFile, ...blockFiles]
const MERGE_GROUPS = [
  // Junior
  { dir: "junior", base: "junior1", blocks: ["junior1-b2", "junior1-b3", "junior1-b4", "junior1-b5", "junior1-b6"] },
  { dir: "junior", base: "junior2", blocks: ["junior2-b2", "junior2-b3", "junior2-b4", "junior2-b5", "junior2-b6"] },
  { dir: "junior", base: "junior3", blocks: ["junior3-b2", "junior3-b3", "junior3-b4", "junior3-b5", "junior3-b6"] },
  // Senior
  { dir: "senior", base: "senior1", blocks: ["senior1-b2", "senior1-b3", "senior1-b4", "senior1-b5", "senior1-b6"] },
  { dir: "senior", base: "senior2", blocks: ["senior2-b2", "senior2-b3", "senior2-b4", "senior2-b5", "senior2-b6"] },
  { dir: "senior", base: "senior3", blocks: ["senior3-b2", "senior3-b3", "senior3-b4", "senior3-b5", "senior3-b6"] },
  // TOEIC
  { dir: "toeic", base: "toeic500", blocks: ["toeic500-b2", "toeic500-b3"] },
  { dir: "toeic", base: "toeic600", blocks: ["toeic600-b2", "toeic600-b3"] },
  { dir: "toeic", base: "toeic700", blocks: ["toeic700-b2", "toeic700-b3"] },
  { dir: "toeic", base: "toeic800", blocks: ["toeic800-b2", "toeic800-b3"] },
  { dir: "toeic", base: "toeic900", blocks: ["toeic900-b2", "toeic900-b3"] },
];

/**
 * Extract data lines (word entries) from a word file.
 * Each line between the opening `[` and closing `];` that starts with `  {` is a data line.
 */
function extractDataLines(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const dataLines = [];

  let inArray = false;
  for (const line of lines) {
    if (line.includes("Word[] = [")) {
      inArray = true;
      continue;
    }
    if (inArray && line.trim() === "];") {
      break;
    }
    if (inArray && line.trim().startsWith("{ id:")) {
      dataLines.push(line);
    }
  }

  return dataLines;
}

/**
 * Read the base file, extract its header (import + comment + export const line)
 * and its existing data lines.
 */
function parseBaseFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const headerLines = [];
  const dataLines = [];
  let inArray = false;
  let arrayStartLine = "";

  for (const line of lines) {
    if (!inArray && line.includes("Word[] = [")) {
      arrayStartLine = line;
      inArray = true;
      continue;
    }
    if (!inArray) {
      headerLines.push(line);
      continue;
    }
    if (inArray && line.trim() === "];") {
      break;
    }
    if (inArray && line.trim().startsWith("{ id:")) {
      dataLines.push(line);
    }
  }

  return { headerLines, arrayStartLine, dataLines };
}

// Main execution
let totalMerged = 0;
const deletedFiles = [];

for (const group of MERGE_GROUPS) {
  const basePath = path.join(BASE, group.dir, `${group.base}.ts`);

  if (!fs.existsSync(basePath)) {
    console.error(`WARNING: Base file not found: ${group.dir}/${group.base}.ts`);
    continue;
  }

  const { headerLines, arrayStartLine, dataLines } = parseBaseFile(basePath);
  let allDataLines = [...dataLines];
  let blocksProcessed = 0;

  for (const block of group.blocks) {
    const blockPath = path.join(BASE, group.dir, `${block}.ts`);
    if (!fs.existsSync(blockPath)) {
      console.error(`WARNING: Block file not found: ${group.dir}/${block}.ts`);
      continue;
    }

    const blockData = extractDataLines(blockPath);
    allDataLines = [...allDataLines, ...blockData];
    blocksProcessed++;

    // Delete the block file
    fs.unlinkSync(blockPath);
    deletedFiles.push(`${group.dir}/${block}.ts`);
  }

  // Update the comment to show total word count
  const updatedHeader = headerLines.map((line) => {
    // Update the word count comment if present
    if (line.startsWith("//") && /\d+語/.test(line)) {
      return line.replace(/\d+語/, `${allDataLines.length}語`);
    }
    return line;
  });

  // Write merged file
  const output = [
    ...updatedHeader,
    arrayStartLine,
    ...allDataLines,
    "];",
    "",
  ].join("\n");

  fs.writeFileSync(basePath, output, "utf-8");

  console.log(
    `${group.dir}/${group.base}.ts: ${dataLines.length} + ${allDataLines.length - dataLines.length} = ${allDataLines.length} words (merged ${blocksProcessed} blocks)`
  );
  totalMerged += blocksProcessed;
}

console.log(`\nTotal: ${totalMerged} block files merged and deleted`);
console.log(`Deleted files:\n${deletedFiles.map((f) => `  - ${f}`).join("\n")}`);
