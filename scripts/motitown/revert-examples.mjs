#!/usr/bin/env node
/**
 * テンプレート生成した例文を削除し、モチタンオリジナルの1例文のみに戻す
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const EXT_FILE = join(ROOT, "src/data/word-extensions-motitown.ts");

const content = readFileSync(EXT_FILE, "utf-8");
const lines = content.split("\n");
const newLines = [];

let i = 0;
let removedCount = 0;

while (i < lines.length) {
  const line = lines[i];

  // examples配列の開始を検出
  if (line.trim().startsWith("examples: [")) {
    newLines.push(line);
    i++;

    // 最初の例文（モチタンオリジナル）を保持
    let firstExampleFound = false;
    let bracketDepth = 1; // 最初の [ がある

    while (i < lines.length && bracketDepth > 0) {
      const l = lines[i];
      bracketDepth += (l.match(/\[/g) || []).length;
      bracketDepth -= (l.match(/\]/g) || []).length;

      if (!firstExampleFound && l.includes("context:")) {
        // 最初の例文行を保持
        newLines.push(l);
        firstExampleFound = true;
      } else if (firstExampleFound && l.includes("context:") && l.includes('ja: ""')) {
        // テンプレート生成例文（ja: "" が特徴）を削除
        removedCount++;
      } else {
        newLines.push(l);
      }
      i++;
    }
    continue;
  }

  newLines.push(line);
  i++;
}

writeFileSync(EXT_FILE, newLines.join("\n"), "utf-8");
console.log(`${removedCount}件のテンプレート例文を削除しました`);
