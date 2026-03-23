#!/usr/bin/env node
/**
 * 単語データ移行スクリプト
 *
 * スナップショットのcategory/difficulty/exampleJaを各コースファイルに書き込む。
 * 既存フィールド(id,word,meaning,partOfSpeech,course,stage,example,frequencyRank)は維持。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// スナップショット読み込み
const snapshot = JSON.parse(readFileSync(join(ROOT, "scripts/migration-snapshot.json"), "utf-8"));
const snapMap = new Map();
for (const s of snapshot) snapMap.set(s.id, s);

const COURSE_FILES = {
  junior: { file: "src/data/words/junior.ts", varName: "juniorWords", idRange: "10000-19999" },
  senior: { file: "src/data/words/senior.ts", varName: "seniorWords", idRange: "20000-29999" },
  toeic: { file: "src/data/words/toeic.ts", varName: "toeicWords", idRange: "30000-39999" },
  eiken: { file: "src/data/words/eiken.ts", varName: "eikenWords", idRange: "40000-49999" },
  conversation: { file: "src/data/words/conversation.ts", varName: "conversationWords", idRange: "70000-79999" },
};

function escapeStr(s) {
  if (!s) return "";
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

for (const [course, config] of Object.entries(COURSE_FILES)) {
  const filePath = join(ROOT, config.file);
  const content = readFileSync(filePath, "utf-8");

  // 既存の単語をパース
  const words = [];
  const regex = /\{\s*id:\s*(\d+),\s*word:\s*"([^"]*)".*?meaning:\s*"([^"]*)".*?partOfSpeech:\s*"([^"]*)".*?course:\s*"([^"]*)".*?stage:\s*"([^"]*)".*?example:\s*"([^"]*)".*?frequencyRank:\s*(\d+)/g;
  let m;
  while ((m = regex.exec(content))) {
    words.push({
      id: parseInt(m[1]), word: m[2], meaning: m[3],
      partOfSpeech: m[4], course: m[5], stage: m[6],
      example: m[7], frequencyRank: parseInt(m[8]),
    });
  }

  console.log(`📝 ${course}: ${words.length}語`);

  // 新フォーマットで出力
  const lines = words.map((w) => {
    const snap = snapMap.get(w.id);
    if (!snap) {
      console.warn(`  ⚠️ ID ${w.id} (${w.word}) のスナップショットが見つかりません`);
      return `  { id: ${w.id}, word: "${escapeStr(w.word)}", meaning: "${escapeStr(w.meaning)}", partOfSpeech: "${w.partOfSpeech}", course: "${w.course}", stage: "${w.stage}", example: "${escapeStr(w.example)}", difficulty: 3, category: "daily", frequencyRank: ${w.frequencyRank} },`;
    }

    const parts = [
      `id: ${w.id}`,
      `word: "${escapeStr(w.word)}"`,
      `meaning: "${escapeStr(w.meaning)}"`,
      `partOfSpeech: "${w.partOfSpeech}"`,
      `course: "${w.course}"`,
      `stage: "${w.stage}"`,
      `example: "${escapeStr(w.example)}"`,
    ];

    if (snap.exampleJa) {
      parts.push(`exampleJa: "${escapeStr(snap.exampleJa)}"`);
    }

    parts.push(`difficulty: ${snap.difficulty}`);
    parts.push(`category: "${snap.category}"`);

    if (snap.categories && snap.categories.length > 1) {
      const catsStr = snap.categories.map(c => `"${c}"`).join(", ");
      parts.push(`categories: [${catsStr}]`);
    }

    parts.push(`frequencyRank: ${w.frequencyRank}`);

    return `  { ${parts.join(", ")} },`;
  });

  const newContent = `

// ${course} コース — ID範囲: ${config.idRange}
export const ${config.varName} = [
${lines.join("\n")}
];
`;

  writeFileSync(filePath, newContent, "utf-8");
  console.log(`  ✅ ${config.file} を更新`);
}

console.log("\n✅ 全コースファイルの移行完了");
