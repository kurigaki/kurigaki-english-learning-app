#!/usr/bin/env node
/**
 * word-extensions-motitown.ts から orphan ID を削除
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// 現在の単語IDを収集
const wordIds = new Set();
for (const file of ["junior.js", "senior.js", "toeic.js", "eiken.js", "conversation.js"]) {
  const content = readFileSync(join(ROOT, `src/data/words/${file}`), "utf-8");
  for (const m of content.matchAll(/id: (\d+)/g)) wordIds.add(parseInt(m[1]));
}
console.log(`単語ID: ${wordIds.size}件`);

// motitown.ts をエントリ単位で処理
const motiPath = join(ROOT, "src/data/word-extensions-motitown.ts");
const content = readFileSync(motiPath, "utf-8");
const lines = content.split("\n");
const newLines = [];
let i = 0;
let removed = 0;

while (i < lines.length) {
  const line = lines[i];

  // コメント行: `  // word (12345)`
  const commentMatch = line.match(/^\s*\/\/\s+.+\((\d+)\)\s*$/);
  if (commentMatch) {
    const id = parseInt(commentMatch[1]);
    if (!wordIds.has(id)) {
      // このエントリ全体をスキップ（コメント行 + [ + 中身 + ], + 空行）
      i++; // skip comment
      // `[` 〜 `],` をスキップ
      let depth = 0;
      while (i < lines.length) {
        const l = lines[i];
        depth += (l.match(/\[/g) || []).length;
        depth -= (l.match(/\]/g) || []).length;
        i++;
        if (depth <= 0) break;
      }
      // 空行もスキップ
      while (i < lines.length && lines[i].trim() === "") i++;
      removed++;
      continue;
    }
  }

  newLines.push(line);
  i++;
}

writeFileSync(motiPath, newLines.join("\n"), "utf-8");
console.log(`✅ ${removed}件の orphan エントリを削除`);
