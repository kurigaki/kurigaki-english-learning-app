#!/usr/bin/env node
/**
 * モチタン単語データ インポートスクリプト
 *
 * scrape.mjs で取得したJSONを読み込み、
 * 既存データとの重複チェック・例文生成・TSファイル出力を行う。
 *
 * Usage:
 *   node scripts/motitown/import.mjs                     # 全コース
 *   node scripts/motitown/import.mjs --course junior      # juniorのみ
 *   node scripts/motitown/import.mjs --dry-run            # 書き込みなし確認
 *   node scripts/motitown/import.mjs --skip-ai            # AI例文生成をスキップ
 *
 * 環境変数:
 *   ANTHROPIC_API_KEY - Claude APIキー（例文生成に必要）
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { ID_RANGES, COURSE_FILES, DATA_DIR } from "./config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const SCRAPED_DIR = join(ROOT, DATA_DIR);

// --- CLI引数 ---
const args = process.argv.slice(2);
const courseFilter = args.includes("--course")
  ? args[args.indexOf("--course") + 1]
  : null;
const dryRun = args.includes("--dry-run");
const skipAi = args.includes("--skip-ai");

// --- 品詞マッピング（モチタン → アプリ） ---
const POS_MAP = {
  名: "noun",
  動: "verb",
  形: "adjective",
  副: "adverb",
  前: "other",
  接: "other",
  代: "other",
  感: "other",
  助: "other",
  名詞: "noun",
  動詞: "verb",
  形容詞: "adjective",
  副詞: "adverb",
  前置詞: "other",
  接続詞: "other",
  代名詞: "other",
  感動詞: "other",
  助動詞: "other",
  noun: "noun",
  verb: "verb",
  adjective: "adjective",
  adverb: "adverb",
};

function mapPos(rawPos) {
  if (!rawPos) return "other";
  // 「名/動」「名・動」のようなケースは最初の品詞を採用
  const first = rawPos.split(/[\/・,\s]/)[0].trim();
  return POS_MAP[first] || "other";
}

// --- 既存単語の読み込み ---
function loadExistingWords(course) {
  const filePath = join(ROOT, COURSE_FILES[course]);
  if (!existsSync(filePath)) return [];

  const content = readFileSync(filePath, "utf-8");
  const words = [];
  // 簡易パース: { id: ..., word: "...", ... } の各行を抽出
  const regex =
    /\{\s*id:\s*(\d+),\s*word:\s*"([^"]*)".*?meaning:\s*"([^"]*)".*?partOfSpeech:\s*"([^"]*)".*?course:\s*"([^"]*)".*?stage:\s*"([^"]*)".*?example:\s*"([^"]*)".*?frequencyRank:\s*(\d+)/g;
  let match;
  while ((match = regex.exec(content))) {
    words.push({
      id: parseInt(match[1]),
      word: match[2],
      meaning: match[3],
      partOfSpeech: match[4],
      course: match[5],
      stage: match[6],
      example: match[7],
      frequencyRank: parseInt(match[8]),
    });
  }
  return words;
}

// --- スクレイプデータの読み込み ---
function loadScrapedData(course) {
  const files = readdirSync(SCRAPED_DIR).filter(
    (f) => f.endsWith(".json") && f !== "all_scraped.json"
  );

  const allWords = [];
  for (const file of files) {
    const [fileCourse] = file.replace(".json", "").split("_");
    if (course && fileCourse !== course) continue;

    const data = JSON.parse(
      readFileSync(join(SCRAPED_DIR, file), "utf-8")
    );
    allWords.push(...data);
  }
  return allWords;
}

// --- 重複チェック・マージ判定 ---
function deduplicateAndClassify(scraped, existing) {
  const existingMap = new Map();
  for (const w of existing) {
    existingMap.set(w.word.toLowerCase(), w);
  }

  const newWords = [];
  const updateCandidates = [];

  for (const s of scraped) {
    if (!s.word) continue;

    const key = s.word.toLowerCase();
    const ex = existingMap.get(key);

    if (!ex) {
      newWords.push(s);
    } else {
      // 既存だがモチタンの情報で更新すべきか判定
      const needsUpdate =
        // 意味が空 or モチタンの方が詳しい（文字数で判定）
        (!ex.meaning && s.meaning) ||
        (s.meaning && s.meaning.length > ex.meaning.length * 1.3) ||
        // 例文が空
        (!ex.example && s.exampleEn);

      if (needsUpdate) {
        updateCandidates.push({ existing: ex, scraped: s });
      }
    }
  }

  return { newWords, updateCandidates };
}

// --- Claude APIで例文生成 ---
async function generateExamples(words, course, stage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error(
      "⚠️  ANTHROPIC_API_KEY が設定されていません。例文生成をスキップします。"
    );
    return words.map((w) => ({ ...w, generatedExamples: [] }));
  }

  const BATCH_SIZE = 20;
  const results = [];

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(words.length / BATCH_SIZE);
    console.log(
      `  🤖 例文生成 バッチ ${batchNum}/${totalBatches} (${batch.length}語)...`
    );

    const wordList = batch
      .map(
        (w, idx) =>
          `${idx + 1}. ${w.word} (${w.pos || "unknown"}) - ${w.meaning}`
      )
      .join("\n");

    const levelDesc = getLevelDescription(course, stage);

    const prompt = `あなたは英語教育の専門家です。以下の英単語それぞれに対して、例文を2つずつ作成してください。

## ルール
- 各例文は英語(en)と日本語訳(ja)のペアで出力
- 例文は${levelDesc}の学習者に適したレベルにする
- 1つ目の例文は日常的な場面、2つ目は学術・ビジネスなど別の場面で作成
- 既存の例文と重複しないこと
- 各例文の使用場面(context)も1語で付与（日常/ビジネス/学術/旅行/医療など）
- JSON配列で出力（マークダウンのコードブロックなし）

## 単語リスト
${wordList}

## 出力形式
[
  {
    "word": "単語",
    "examples": [
      { "en": "English sentence.", "ja": "日本語訳。", "context": "場面" },
      { "en": "English sentence.", "ja": "日本語訳。", "context": "場面" }
    ]
  }
]`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const text = data.content[0].text;

      // JSONを抽出（コードブロック内の場合も対応）
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("JSON parse failed");

      const generated = JSON.parse(jsonMatch[0]);
      const genMap = new Map();
      for (const g of generated) {
        genMap.set(g.word.toLowerCase(), g.examples);
      }

      for (const w of batch) {
        const examples = genMap.get(w.word.toLowerCase()) || [];
        results.push({ ...w, generatedExamples: examples });
      }
    } catch (err) {
      console.error(`  ❌ バッチ${batchNum}の例文生成失敗: ${err.message}`);
      for (const w of batch) {
        results.push({ ...w, generatedExamples: [] });
      }
    }

    // レート制限対策（1秒待機）
    await new Promise((r) => setTimeout(r, 1000));
  }

  return results;
}

function getLevelDescription(course, stage) {
  const descs = {
    junior: { 1: "中学1年生", 2: "中学2年生", 3: "中学3年生" },
    senior: { 1: "高校1年生", 2: "高校2年生", 3: "高校3年生" },
    toeic: {
      500: "TOEIC 500点レベル",
      600: "TOEIC 600点レベル",
      700: "TOEIC 700点レベル",
      800: "TOEIC 800点レベル",
      900: "TOEIC 900点レベル",
    },
    eiken: {
      5: "英検5級",
      4: "英検4級",
      3: "英検3級",
      pre2: "英検準2級",
      2: "英検2級",
      pre1: "英検準1級",
      1: "英検1級",
    },
    conversation: { 1: "英会話初心者" },
  };
  return descs[course]?.[stage] || `${course} ${stage}`;
}

// --- frequencyRank の推定 ---
function estimateFrequencyRank(importance, course, stage) {
  // モチタンの importance (A/B/C) → frequencyRank (1-3)
  if (importance) {
    const map = { A: 1, B: 2, C: 3, D: 3 };
    return map[importance.toUpperCase()] || 1;
  }
  return 1;
}

// --- TSファイルへの書き込み ---
function writeToTsFile(course, newWords) {
  const filePath = join(ROOT, COURSE_FILES[course]);
  if (!existsSync(filePath)) {
    console.error(`  ❌ ファイルが見つかりません: ${filePath}`);
    return;
  }

  let content = readFileSync(filePath, "utf-8");

  // 既存の最大IDを取得
  const existingWords = loadExistingWords(course);
  let maxId = ID_RANGES[course].start - 1;
  for (const w of existingWords) {
    if (w.id > maxId) maxId = w.id;
  }

  // 新しい単語のエントリを生成
  const entries = [];
  for (const w of newWords) {
    maxId++;
    const id = maxId;
    const word = w.word.replace(/"/g, '\\"');
    const meaning = (w.meaning || "").replace(/"/g, '\\"');
    const pos = mapPos(w.pos);
    const example = (w.exampleEn || "").replace(/"/g, '\\"');
    const freq = estimateFrequencyRank(w.importance, w.course, w.stage);
    const stage = w.stage;

    entries.push(
      `  { id: ${id}, word: "${word}", meaning: "${meaning}", partOfSpeech: "${pos}", course: "${course}", stage: "${stage}", example: "${example}", frequencyRank: ${freq} },`
    );
  }

  if (entries.length === 0) return;

  // 配列の閉じ括弧の直前に挿入
  const closeIdx = content.lastIndexOf("];");
  if (closeIdx === -1) {
    console.error(`  ❌ 配列終端が見つかりません: ${filePath}`);
    return;
  }

  const before = content.slice(0, closeIdx);
  const after = content.slice(closeIdx);
  content = before + entries.join("\n") + "\n" + after;

  if (!dryRun) {
    writeFileSync(filePath, content, "utf-8");
    console.log(`  ✅ ${filePath} に ${entries.length}語を追加`);
  } else {
    console.log(`  [DRY RUN] ${filePath} に ${entries.length}語を追加予定`);
  }

  return entries.length;
}

// --- word-extensions.ts への追記 ---
function writeExtensions(allNewWords) {
  const extPath = join(ROOT, "src/data/word-extensions.ts");
  if (!existsSync(extPath)) {
    console.log("  ⚠️  word-extensions.ts が見つかりません。スキップ。");
    return;
  }

  // 既存のIDを確認
  const extContent = readFileSync(extPath, "utf-8");
  const existingIds = new Set();
  const idRegex = /\[\s*(\d+),/g;
  let m;
  while ((m = idRegex.exec(extContent))) {
    existingIds.add(parseInt(m[1]));
  }

  const entries = [];
  for (const w of allNewWords) {
    if (!w.id || existingIds.has(w.id)) continue;
    if (!w.coreImage && !w.usage && w.generatedExamples?.length === 0) continue;

    const examples = [];
    // モチタンの例文
    if (w.exampleEn) {
      examples.push({
        en: w.exampleEn,
        ja: w.exampleJa || "",
        context: "一般",
      });
    }
    // AI生成例文
    if (w.generatedExamples) {
      examples.push(...w.generatedExamples);
    }

    if (examples.length === 0 && !w.coreImage && !w.usage) continue;

    const pronunciation = w.pronunciation
      ? `      pronunciation: { us: "${w.pronunciation.replace(/"/g, '\\"')}" },`
      : "";
    const coreImage = w.coreImage
      ? `      coreImage: "${w.coreImage.replace(/"/g, '\\"')}",`
      : "";
    const usage = w.usage
      ? `      usage: "${w.usage.replace(/"/g, '\\"')}",`
      : "";

    const antonyms =
      w.antonymWord
        ? `      antonyms: ["${w.antonymWord.replace(/"/g, '\\"')}"],
      relatedWordEntries: [
        { word: "${w.antonymWord.replace(/"/g, '\\"')}", partOfSpeech: "${w.antonymPos || ""}", meaning: "${(w.antonymMeaning || "").replace(/"/g, '\\"')}", isAntonym: true },
      ],`
        : "";

    const examplesStr =
      examples.length > 0
        ? `      examples: [
${examples
  .map(
    (ex) =>
      `        { en: "${(ex.en || "").replace(/"/g, '\\"')}", ja: "${(ex.ja || "").replace(/"/g, '\\"')}", context: "${(ex.context || "一般").replace(/"/g, '\\"')}" },`
  )
  .join("\n")}
      ],`
        : "";

    const parts = [
      pronunciation,
      coreImage,
      usage,
      antonyms,
      examplesStr,
    ].filter(Boolean);

    if (parts.length === 0) continue;

    entries.push(`  // ${w.word} (${w.id})
  [
    ${w.id},
    {
${parts.join("\n")}
    },
  ],`);
  }

  if (entries.length === 0) return;

  // Map の閉じ括弧の直前に挿入
  const closeIdx = extContent.lastIndexOf("]);");
  if (closeIdx === -1) {
    console.log("  ⚠️  word-extensions.ts の終端が見つかりません。");
    return;
  }

  const newContent =
    extContent.slice(0, closeIdx) +
    "\n  // ── モチタン取り込み ──────────────────────────────────────\n\n" +
    entries.join("\n\n") +
    "\n" +
    extContent.slice(closeIdx);

  if (!dryRun) {
    writeFileSync(extPath, newContent, "utf-8");
    console.log(`  ✅ word-extensions.ts に ${entries.length}件の拡張データを追加`);
  } else {
    console.log(
      `  [DRY RUN] word-extensions.ts に ${entries.length}件追加予定`
    );
  }
}

// --- 既存単語の更新 ---
function updateExistingWords(course, updates) {
  if (updates.length === 0) return;

  const filePath = join(ROOT, COURSE_FILES[course]);
  let content = readFileSync(filePath, "utf-8");
  let updated = 0;

  for (const { existing: ex, scraped: s } of updates) {
    // meaning の更新（モチタンの方が詳しい場合）
    if (s.meaning && s.meaning.length > ex.meaning.length * 1.3) {
      const oldEntry = `meaning: "${ex.meaning}"`;
      const newMeaning = s.meaning.replace(/"/g, '\\"');
      const newEntry = `meaning: "${newMeaning}"`;
      content = content.replace(oldEntry, newEntry);
      updated++;
    }
  }

  if (updated > 0 && !dryRun) {
    writeFileSync(filePath, content, "utf-8");
    console.log(`  🔄 ${course}: ${updated}語の意味を更新`);
  } else if (updated > 0) {
    console.log(`  [DRY RUN] ${course}: ${updated}語の意味を更新予定`);
  }
}

// --- メイン ---
async function main() {
  console.log("\n🚀 モチタン単語データ インポート開始");
  if (dryRun) console.log("   (DRY RUN モード: ファイル書き込みなし)\n");
  if (skipAi) console.log("   (AI例文生成スキップ)\n");

  // スクレイプデータの存在確認
  if (!existsSync(SCRAPED_DIR)) {
    console.error(
      `❌ スクレイプデータがありません。先に scrape.mjs を実行してください。`
    );
    console.error(`   期待パス: ${SCRAPED_DIR}/`);
    process.exit(1);
  }

  const courses = courseFilter
    ? [courseFilter]
    : ["junior", "senior", "toeic", "eiken", "conversation"];

  let totalNew = 0;
  let totalUpdated = 0;
  const allNewWordsWithIds = [];

  for (const course of courses) {
    console.log(`\n📦 ${course} コース処理中...`);

    // スクレイプデータ読み込み
    const scraped = loadScrapedData(course);
    if (scraped.length === 0) {
      console.log(`  スクレイプデータなし。スキップ。`);
      continue;
    }
    console.log(`  スクレイプデータ: ${scraped.length}語`);

    // 既存データ読み込み
    const existing = loadExistingWords(course);
    console.log(`  既存データ: ${existing.length}語`);

    // 重複チェック・分類
    const { newWords, updateCandidates } = deduplicateAndClassify(
      scraped,
      existing
    );
    console.log(`  新規: ${newWords.length}語 / 更新候補: ${updateCandidates.length}語`);

    // 既存単語の更新
    updateExistingWords(course, updateCandidates);
    totalUpdated += updateCandidates.length;

    if (newWords.length === 0) continue;

    // AI例文生成
    let enrichedWords;
    if (skipAi) {
      enrichedWords = newWords.map((w) => ({
        ...w,
        generatedExamples: [],
      }));
    } else {
      // ステージごとにバッチ処理（レベルに合った例文を生成するため）
      const byStage = new Map();
      for (const w of newWords) {
        const key = w.stage;
        if (!byStage.has(key)) byStage.set(key, []);
        byStage.get(key).push(w);
      }

      enrichedWords = [];
      for (const [stage, words] of byStage) {
        const enriched = await generateExamples(words, course, stage);
        enrichedWords.push(...enriched);
      }
    }

    // TSファイルに書き込み
    const maxExistingId = existing.reduce((max, w) => Math.max(max, w.id), ID_RANGES[course].start - 1);
    let nextId = maxExistingId + 1;
    for (const w of enrichedWords) {
      w.id = nextId++;
    }

    const addedCount = writeToTsFile(course, enrichedWords);
    totalNew += addedCount || 0;

    // 拡張データ用に保持
    allNewWordsWithIds.push(...enrichedWords);
  }

  // word-extensions.ts への追記
  if (allNewWordsWithIds.length > 0) {
    console.log("\n📝 拡張データの書き込み...");
    writeExtensions(allNewWordsWithIds);
  }

  // サマリー
  console.log("\n" + "═".repeat(50));
  console.log("📊 インポート結果:");
  console.log(`  新規追加: ${totalNew}語`);
  console.log(`  更新: ${totalUpdated}語`);
  if (dryRun) console.log("  ※ DRY RUNのため実際の書き込みは行われていません");
  console.log("═".repeat(50) + "\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
