/**
 * ID Reassignment + 1-Line Format Conversion Script
 *
 * Reads all word data files in the specified order, assigns sequential IDs
 * starting from 1, and rewrites each file in 1-line format.
 *
 * Usage: node scripts/reassign-ids.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(__dirname, "..", "src", "data", "words");

// File order for ID assignment (matches plan)
const FILE_ORDER = [
  // Junior
  "junior/junior1.ts",
  "junior/junior1-b2.ts",
  "junior/junior1-b3.ts",
  "junior/junior1-b4.ts",
  "junior/junior1-b5.ts",
  "junior/junior1-b6.ts",
  "junior/junior2.ts",
  "junior/junior2-b2.ts",
  "junior/junior2-b3.ts",
  "junior/junior2-b4.ts",
  "junior/junior2-b5.ts",
  "junior/junior2-b6.ts",
  "junior/junior3.ts",
  "junior/junior3-b2.ts",
  "junior/junior3-b3.ts",
  "junior/junior3-b4.ts",
  "junior/junior3-b5.ts",
  "junior/junior3-b6.ts",
  // Senior
  "senior/senior1.ts",
  "senior/senior1-b2.ts",
  "senior/senior1-b3.ts",
  "senior/senior1-b4.ts",
  "senior/senior1-b5.ts",
  "senior/senior1-b6.ts",
  "senior/senior2.ts",
  "senior/senior2-b2.ts",
  "senior/senior2-b3.ts",
  "senior/senior2-b4.ts",
  "senior/senior2-b5.ts",
  "senior/senior2-b6.ts",
  "senior/senior3.ts",
  "senior/senior3-b2.ts",
  "senior/senior3-b3.ts",
  "senior/senior3-b4.ts",
  "senior/senior3-b5.ts",
  "senior/senior3-b6.ts",
  // Eiken
  "eiken/eiken5.ts",
  "eiken/eiken4.ts",
  "eiken/eiken3.ts",
  "eiken/eikenPre2.ts",
  "eiken/eiken2.ts",
  "eiken/eikenPre1.ts",
  "eiken/eiken1.ts",
  // TOEIC
  "toeic/toeic500.ts",
  "toeic/toeic500-b2.ts",
  "toeic/toeic500-b3.ts",
  "toeic/toeic600.ts",
  "toeic/toeic600-b2.ts",
  "toeic/toeic600-b3.ts",
  "toeic/toeic700.ts",
  "toeic/toeic700-b2.ts",
  "toeic/toeic700-b3.ts",
  "toeic/toeic800.ts",
  "toeic/toeic800-b2.ts",
  "toeic/toeic800-b3.ts",
  "toeic/toeic900.ts",
  "toeic/toeic900-b2.ts",
  "toeic/toeic900-b3.ts",
  // Conversation
  "conversation/beginner.ts",
  "conversation/elementary.ts",
  "conversation/intermediate.ts",
  "conversation/advanced.ts",
  "conversation/native.ts",
];

/**
 * Parse a TypeScript word data file to extract the array variable name,
 * comment header, and word objects.
 */
function parseWordFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract import line
  const importMatch = content.match(/^import\s+\{[^}]+\}\s+from\s+"[^"]+";/m);
  const importLine = importMatch ? importMatch[0] : 'import { Word } from "../types";';

  // Extract comment line(s) before the export
  const commentMatch = content.match(/\/\/[^\n]*\n(?=export\s+const)/);
  const comment = commentMatch ? commentMatch[0].trim() : "";

  // Extract variable name and type
  const varMatch = content.match(/export\s+const\s+(\w+):\s*Word\[\]\s*=\s*\[/);
  if (!varMatch) {
    throw new Error(`Could not parse variable declaration in ${filePath}`);
  }
  const varName = varMatch[1];

  // Extract word objects by evaluating the array content
  // We'll use a regex-based approach to find each { ... } block
  const words = [];
  const arrayContent = content.slice(content.indexOf("[") + 1, content.lastIndexOf("]"));

  // Parse each word object
  let depth = 0;
  let start = -1;
  for (let i = 0; i < arrayContent.length; i++) {
    if (arrayContent[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (arrayContent[i] === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        const objStr = arrayContent.slice(start, i + 1);
        words.push(parseWordObject(objStr));
        start = -1;
      }
    }
  }

  return { importLine, comment, varName, words };
}

/**
 * Parse a single word object string into a structured object.
 */
function parseWordObject(objStr) {
  const word = {};

  // Remove outer braces and normalize
  const inner = objStr.slice(1, -1).trim();

  // Parse fields using a state machine approach
  let pos = 0;
  while (pos < inner.length) {
    // Skip whitespace and commas
    while (pos < inner.length && /[\s,]/.test(inner[pos])) pos++;
    if (pos >= inner.length) break;

    // Skip comments
    if (inner[pos] === "/" && inner[pos + 1] === "/") {
      while (pos < inner.length && inner[pos] !== "\n") pos++;
      continue;
    }

    // Read key
    const keyMatch = inner.slice(pos).match(/^(\w+)\s*:/);
    if (!keyMatch) {
      pos++;
      continue;
    }
    const key = keyMatch[1];
    pos += keyMatch[0].length;

    // Skip whitespace
    while (pos < inner.length && /\s/.test(inner[pos])) pos++;

    // Read value
    const value = readValue(inner, pos);
    word[key] = value.value;
    pos = value.endPos;
  }

  return word;
}

function readValue(str, pos) {
  // Skip whitespace
  while (pos < str.length && /\s/.test(str[pos])) pos++;

  if (str[pos] === '"') {
    return readString(str, pos);
  } else if (str[pos] === "'") {
    return readSingleString(str, pos);
  } else if (str[pos] === "[") {
    return readArray(str, pos);
  } else if (str[pos] === "{") {
    return readObject(str, pos);
  } else {
    // number, boolean, etc.
    const match = str.slice(pos).match(/^[^\s,}\]]+/);
    if (match) {
      let val = match[0];
      // Try to parse as number
      if (/^\d+$/.test(val)) val = parseInt(val, 10);
      else if (val === "true") val = true;
      else if (val === "false") val = false;
      return { value: val, endPos: pos + match[0].length };
    }
    return { value: undefined, endPos: pos + 1 };
  }
}

function readString(str, pos) {
  let result = "";
  pos++; // skip opening "
  while (pos < str.length) {
    if (str[pos] === "\\" && pos + 1 < str.length) {
      if (str[pos + 1] === '"') {
        result += '"';
        pos += 2;
      } else if (str[pos + 1] === "\\") {
        result += "\\";
        pos += 2;
      } else if (str[pos + 1] === "n") {
        result += "\n";
        pos += 2;
      } else {
        result += str[pos + 1];
        pos += 2;
      }
    } else if (str[pos] === '"') {
      pos++; // skip closing "
      return { value: result, endPos: pos };
    } else {
      result += str[pos];
      pos++;
    }
  }
  return { value: result, endPos: pos };
}

function readSingleString(str, pos) {
  let result = "";
  pos++; // skip opening '
  while (pos < str.length) {
    if (str[pos] === "\\" && pos + 1 < str.length) {
      if (str[pos + 1] === "'") {
        result += "'";
        pos += 2;
      } else {
        result += str[pos + 1];
        pos += 2;
      }
    } else if (str[pos] === "'") {
      pos++; // skip closing '
      return { value: result, endPos: pos };
    } else {
      result += str[pos];
      pos++;
    }
  }
  return { value: result, endPos: pos };
}

function readArray(str, pos) {
  const items = [];
  pos++; // skip [
  while (pos < str.length) {
    while (pos < str.length && /[\s,]/.test(str[pos])) pos++;
    if (str[pos] === "]") {
      pos++;
      return { value: items, endPos: pos };
    }
    const val = readValue(str, pos);
    items.push(val.value);
    pos = val.endPos;
  }
  return { value: items, endPos: pos };
}

function readObject(str, pos) {
  const obj = {};
  pos++; // skip {
  while (pos < str.length) {
    while (pos < str.length && /[\s,]/.test(str[pos])) pos++;
    if (str[pos] === "}") {
      pos++;
      return { value: obj, endPos: pos };
    }
    // Read key
    const keyMatch = str.slice(pos).match(/^(\w+)\s*:/);
    if (!keyMatch) {
      pos++;
      continue;
    }
    const key = keyMatch[1];
    pos += keyMatch[0].length;
    const val = readValue(str, pos);
    obj[key] = val.value;
    pos = val.endPos;
  }
  return { value: obj, endPos: pos };
}

/**
 * Convert a word object to a 1-line string.
 */
function wordToOneLine(word) {
  const escape = (s) => {
    if (s === undefined || s === null) return undefined;
    return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  };

  const parts = [];
  parts.push(`id: ${word.id}`);
  parts.push(`word: "${escape(word.word)}"`);
  parts.push(`meaning: "${escape(word.meaning)}"`);

  if (word.example !== undefined) {
    parts.push(`example: "${escape(word.example)}"`);
  }
  if (word.exampleJa !== undefined) {
    parts.push(`exampleJa: "${escape(word.exampleJa)}"`);
  }

  // courses array
  if (word.courses && word.courses.length > 0) {
    const coursesStr = word.courses
      .map(
        (c) =>
          `{ courseType: "${c.courseType}", level: "${c.level}", displayName: "${escape(c.displayName)}" }`
      )
      .join(", ");
    parts.push(`courses: [${coursesStr}]`);
  }

  parts.push(`difficulty: ${word.difficulty}`);

  // categories array
  if (word.categories && word.categories.length > 0) {
    parts.push(
      `categories: [${word.categories.map((c) => `"${c}"`).join(", ")}]`
    );
  }

  if (word.frequencyRank) {
    parts.push(`frequencyRank: "${word.frequencyRank}"`);
  }
  if (word.partOfSpeech) {
    parts.push(`partOfSpeech: "${word.partOfSpeech}"`);
  }
  if (word.pronunciation !== undefined) {
    if (typeof word.pronunciation === "string") {
      parts.push(`pronunciation: "${escape(word.pronunciation)}"`);
    } else if (typeof word.pronunciation === "object") {
      const pronParts = [];
      if (word.pronunciation.us)
        pronParts.push(`us: "${escape(word.pronunciation.us)}"`);
      if (word.pronunciation.uk)
        pronParts.push(`uk: "${escape(word.pronunciation.uk)}"`);
      parts.push(`pronunciation: { ${pronParts.join(", ")} }`);
    }
  }

  return `  { ${parts.join(", ")} },`;
}

/**
 * Write a word file back in 1-line format.
 */
function writeWordFile(filePath, { importLine, comment, varName, words }) {
  const lines = [];
  lines.push(importLine);
  lines.push("");
  if (comment) {
    lines.push(comment);
  }
  lines.push(`export const ${varName}: Word[] = [`);
  for (const word of words) {
    lines.push(wordToOneLine(word));
  }
  lines.push("];");
  lines.push("");

  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
}

// Main execution
let nextId = 1;
let totalWords = 0;

for (const relPath of FILE_ORDER) {
  const filePath = path.join(BASE, relPath);
  if (!fs.existsSync(filePath)) {
    console.error(`WARNING: File not found: ${relPath}`);
    continue;
  }

  const parsed = parseWordFile(filePath);
  const count = parsed.words.length;

  // Assign sequential IDs
  for (const word of parsed.words) {
    word.id = nextId++;
  }

  writeWordFile(filePath, parsed);
  totalWords += count;
  console.log(
    `${relPath}: ${count} words (IDs ${nextId - count}–${nextId - 1})`
  );
}

console.log(`\nTotal: ${totalWords} words, IDs 1–${nextId - 1}`);
