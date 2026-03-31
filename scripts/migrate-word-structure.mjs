/**
 * 案D: 単語データ完全リストラクチャリング — 移行スクリプト
 *
 * 1. 各コースの .js ファイルを読み込み
 * 2. ステージ別に分割
 * 3. ID再採番（ギャップ解消）
 * 4. 冗長フィールド除去（course, stage, difficulty, category, example, exampleJa, frequencyRank, source）
 * 5. ステージ別 .ts ファイルとして書き出し
 * 6. コース index.ts を生成
 * 7. word-extensions/manual.ts のIDキーを更新
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const WORDS_DIR = join(ROOT, "src/data/words");
const EXT_DIR = join(ROOT, "src/data/word-extensions");

// ── ID再採番の範囲定義 ──
const ID_RANGES = {
  junior:       { start: 10001 },
  senior:       { start: 13001 },
  toeic:        { start: 18001 },
  eiken:        { start: 23001 },
  conversation: { start: 38001 },
};

// ── コース定義: ステージ順序とファイル名 ──
const COURSE_DEFS = {
  junior: {
    exportName: "juniorWords",
    file: "junior.js",
    stages: [
      { stage: "1", fileName: "stage1" },
      { stage: "2", fileName: "stage2" },
      { stage: "3", fileName: "stage3" },
    ],
  },
  senior: {
    exportName: "seniorWords",
    file: "senior.js",
    stages: [
      { stage: "1", fileName: "stage1" },
      { stage: "2", fileName: "stage2" },
      { stage: "3", fileName: "stage3" },
    ],
  },
  toeic: {
    exportName: "toeicWords",
    file: "toeic.js",
    stages: [
      { stage: "500", fileName: "stage500" },
      { stage: "600", fileName: "stage600" },
      { stage: "700", fileName: "stage700" },
      { stage: "800", fileName: "stage800" },
      { stage: "900", fileName: "stage900" },
    ],
  },
  eiken: {
    exportName: "eikenWords",
    file: "eiken.js",
    stages: [
      { stage: "5", fileName: "stage5" },
      { stage: "4", fileName: "stage4" },
      { stage: "3", fileName: "stage3" },
      { stage: "pre2", fileName: "stagePre2" },
      { stage: "2", fileName: "stage2" },
      { stage: "pre1", fileName: "stagePre1" },
      { stage: "1", fileName: "stage1" },
    ],
  },
  conversation: {
    exportName: "conversationWords",
    file: "conversation.js",
    stages: [
      { stage: "1", fileName: "stage1" },
      { stage: "2", fileName: "stage2" },
      { stage: "3", fileName: "stage3" },
      { stage: "4", fileName: "stage4" },
      { stage: "5", fileName: "stage5" },
    ],
  },
};

// ── ヘルパー: .js ファイルから単語データを読み込み ──
async function loadWordsFromJs(filePath) {
  const mod = await import(filePath);
  const exportName = Object.keys(mod)[0];
  return mod[exportName];
}

// ── ヘルパー: RawWord形式の文字列を生成 ──
function formatRawWord(w) {
  const examples = w.examples.map(
    (ex) => `      { en: ${JSON.stringify(ex.en)}, ja: ${JSON.stringify(ex.ja)}, context: ${JSON.stringify(ex.context)} }`
  );
  const categories = w.categories.map((c) => JSON.stringify(c)).join(", ");

  return [
    `  {`,
    `    id: ${w.id},`,
    `    word: ${JSON.stringify(w.word)},`,
    `    meaning: ${JSON.stringify(w.meaning)},`,
    `    partOfSpeech: ${JSON.stringify(w.partOfSpeech)},`,
    `    examples: [`,
    examples.join(",\n") + ",",
    `    ],`,
    `    categories: [${categories}],`,
    `  },`,
  ].join("\n");
}

// ── ヘルパー: ステージ .ts ファイルを書き出し ──
function writeStageFile(dir, fileName, words) {
  const filePath = join(dir, `${fileName}.ts`);
  const lines = [
    `import type { RawWord } from "../types";`,
    ``,
    `export const words: RawWord[] = [`,
    ...words.map(formatRawWord),
    `];`,
    ``,
  ];
  writeFileSync(filePath, lines.join("\n"), "utf-8");
  return words.length;
}

// ── ヘルパー: コース index.ts を書き出し ──
function writeCourseIndex(dir, courseName, stages) {
  const imports = stages.map(
    (s) => `import { words as ${s.fileName} } from "./${s.fileName}";`
  );
  const spreads = stages.map(
    (s) => `  ...enrichWords(${s.fileName}, "${courseName}", "${s.stage}"),`
  );

  const exportName =
    courseName === "junior" ? "juniorWords" :
    courseName === "senior" ? "seniorWords" :
    courseName === "toeic" ? "toeicWords" :
    courseName === "eiken" ? "eikenWords" :
    "conversationWords";

  const lines = [
    `import { enrichWords } from "../enrich";`,
    ...imports,
    ``,
    `export const ${exportName} = [`,
    ...spreads,
    `];`,
    ``,
  ];
  writeFileSync(join(dir, "index.ts"), lines.join("\n"), "utf-8");
}

// ── ヘルパー: manual.ts のIDキーを更新 ──
function updateManualExtensions(idMap) {
  const filePath = join(EXT_DIR, "manual.ts");
  let content = readFileSync(filePath, "utf-8");

  // [oldId, { ... }] パターンを [newId, { ... }] に置換
  let updateCount = 0;
  for (const [oldId, newId] of idMap.entries()) {
    // 行頭の [ で始まるID参照を更新
    const pattern = new RegExp(`\\[\\s*${oldId}\\s*,`, "g");
    const replacement = `[${newId},`;
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) updateCount++;

    // コメント内の (oldId) も更新
    const commentPattern = new RegExp(`\\(${oldId}\\)`, "g");
    content = content.replace(commentPattern, `(${newId})`);
  }

  writeFileSync(filePath, content, "utf-8");
  return updateCount;
}

// ── メイン処理 ──
async function main() {
  console.log("=== 案D: 単語データ完全リストラクチャリング ===\n");

  const idMap = new Map(); // oldId → newId
  const stats = {};

  for (const [courseName, def] of Object.entries(COURSE_DEFS)) {
    console.log(`\n── ${courseName} ──`);

    // 1. 現在のデータを読み込み
    const filePath = join(WORDS_DIR, def.file);
    const allWords = await loadWordsFromJs(filePath);
    console.log(`  読み込み: ${allWords.length}語`);

    // 2. ステージ別に分割
    const byStage = new Map();
    for (const s of def.stages) {
      byStage.set(s.stage, []);
    }
    for (const w of allWords) {
      const stageWords = byStage.get(w.stage);
      if (!stageWords) {
        console.warn(`  ⚠️ 未知のステージ: ${w.word} (stage=${w.stage})`);
        continue;
      }
      stageWords.push(w);
    }

    // 3. ディレクトリ作成
    const courseDir = join(WORDS_DIR, courseName);
    if (!existsSync(courseDir)) {
      mkdirSync(courseDir, { recursive: true });
    }

    // 4. ID再採番 + ファイル書き出し
    let nextId = ID_RANGES[courseName].start;
    const courseStat = { total: 0, stages: {} };

    for (const stageDef of def.stages) {
      const stageWords = byStage.get(stageDef.stage);

      // ID再採番
      const newWords = stageWords.map((w) => {
        const newId = nextId++;
        if (w.id !== newId) {
          idMap.set(w.id, newId);
        }

        // categories を正規化: category が categories[0] にない場合は先頭に追加
        let categories = w.categories || [w.category];
        if (categories.length === 0) {
          categories = [w.category || "daily"];
        }
        if (w.category && categories[0] !== w.category) {
          categories = [w.category, ...categories.filter((c) => c !== w.category)];
        }

        return {
          id: newId,
          word: w.word,
          meaning: w.meaning,
          partOfSpeech: w.partOfSpeech,
          examples: w.examples || [
            { en: w.example || "", ja: w.exampleJa || "", context: "日常" },
            { en: w.example || "", ja: w.exampleJa || "", context: "日常" },
            { en: w.example || "", ja: w.exampleJa || "", context: "日常" },
          ],
          categories,
        };
      });

      const count = writeStageFile(courseDir, stageDef.fileName, newWords);
      courseStat.stages[stageDef.stage] = count;
      courseStat.total += count;
      console.log(`  ${stageDef.fileName}: ${count}語 (ID ${ID_RANGES[courseName].start + courseStat.total - count}–${nextId - 1})`);
    }

    // 5. コース index.ts を生成
    writeCourseIndex(courseDir, courseName, def.stages);
    stats[courseName] = courseStat;
  }

  // 6. word-extensions/manual.ts のID更新
  console.log(`\n── word-extensions/manual.ts ──`);
  const changedIds = [...idMap.entries()].filter(([old, nw]) => old !== nw);
  if (changedIds.length > 0) {
    const updateCount = updateManualExtensions(idMap);
    console.log(`  ${updateCount}件のIDキーを更新`);
  } else {
    console.log(`  ID変更なし`);
  }

  // 7. サマリー
  console.log(`\n=== サマリー ===`);
  let grandTotal = 0;
  for (const [course, stat] of Object.entries(stats)) {
    console.log(`  ${course}: ${stat.total}語`);
    grandTotal += stat.total;
  }
  console.log(`  合計: ${grandTotal}語`);
  console.log(`  ID再マッピング: ${idMap.size}件`);
  console.log(`\n✅ 完了！次のステップ:`);
  console.log(`  1. src/data/words/index.ts を更新`);
  console.log(`  2. 旧 .js ファイルを削除`);
  console.log(`  3. npx vitest run src/data/words/__tests__/ でテスト`);
}

main().catch(console.error);
