#!/usr/bin/env node
/**
 * モチタン取り込み単語に例文2つを追加するスクリプト
 *
 * word-extensions-motitown.ts の各エントリの examples 配列に
 * 2つの例文を追加し、合計3つにする。
 *
 * スクレイプ済みJSONから単語の品詞・意味・コース・ステージ情報を取得し、
 * コンテキストに合った例文を生成する。
 *
 * Usage:
 *   node scripts/motitown/generate-examples.mjs
 *   node scripts/motitown/generate-examples.mjs --dry-run
 *   node scripts/motitown/generate-examples.mjs --course junior
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const EXT_FILE = join(ROOT, "src/data/word-extensions-motitown.ts");
const DATA_DIR = join(ROOT, "scripts/motitown/data");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const courseFilter = args.includes("--course") ? args[args.indexOf("--course") + 1] : null;

// --- スクレイプデータからID→単語情報マップを構築 ---
function buildWordMap() {
  const map = new Map();
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith(".json") && f !== "all_scraped.json");
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
    for (const w of data) {
      // motiIdではなく、import時に割り当てたIDが必要
      // word名でマッチさせる
      const key = `${w.course}_${w.stage}_${w.word.toLowerCase()}`;
      map.set(key, w);
    }
  }
  return map;
}

// --- 既存の単語ファイルからID→単語情報を構築 ---
function buildIdMap() {
  const map = new Map();
  const courseFiles = {
    junior: "src/data/words/junior.ts",
    senior: "src/data/words/senior.ts",
    toeic: "src/data/words/toeic.ts",
    eiken: "src/data/words/eiken.ts",
    conversation: "src/data/words/conversation.ts",
  };

  for (const [course, file] of Object.entries(courseFiles)) {
    const content = readFileSync(join(ROOT, file), "utf-8");
    const regex = /\{\s*id:\s*(\d+),\s*word:\s*"([^"]*)".*?meaning:\s*"([^"]*)".*?partOfSpeech:\s*"([^"]*)".*?course:\s*"([^"]*)".*?stage:\s*"([^"]*)"/g;
    let m;
    while ((m = regex.exec(content))) {
      map.set(parseInt(m[1]), {
        id: parseInt(m[1]),
        word: m[2],
        meaning: m[3],
        pos: m[4],
        course: m[5],
        stage: m[6],
      });
    }
  }
  return map;
}

// --- 例文生成エンジン ---

// コース×レベル別の文脈テンプレート
const CONTEXTS = {
  junior: {
    "1": { contexts: ["日常", "学校"], complexity: "simple" },
    "2": { contexts: ["日常", "学校"], complexity: "simple" },
    "3": { contexts: ["日常", "社会"], complexity: "moderate" },
  },
  senior: {
    "1": { contexts: ["学術", "社会"], complexity: "moderate" },
    "2": { contexts: ["学術", "ビジネス"], complexity: "moderate" },
    "3": { contexts: ["学術", "国際"], complexity: "advanced" },
  },
  toeic: {
    "500": { contexts: ["ビジネス", "日常"], complexity: "moderate" },
    "600": { contexts: ["ビジネス", "会議"], complexity: "moderate" },
    "700": { contexts: ["ビジネス", "マーケティング"], complexity: "advanced" },
    "800": { contexts: ["ビジネス", "金融"], complexity: "advanced" },
    "900": { contexts: ["ビジネス", "経営"], complexity: "advanced" },
  },
  eiken: {
    "5": { contexts: ["日常", "学校"], complexity: "simple" },
    "4": { contexts: ["日常", "学校"], complexity: "simple" },
    "3": { contexts: ["日常", "社会"], complexity: "moderate" },
    "pre2": { contexts: ["社会", "文化"], complexity: "moderate" },
    "2": { contexts: ["学術", "社会"], complexity: "moderate" },
    "pre1": { contexts: ["学術", "科学"], complexity: "advanced" },
    "1": { contexts: ["学術", "専門"], complexity: "advanced" },
  },
  conversation: {
    "1": { contexts: ["日常", "旅行"], complexity: "simple" },
    "2": { contexts: ["日常", "買い物"], complexity: "simple" },
    "3": { contexts: ["日常", "ビジネス"], complexity: "moderate" },
    "4": { contexts: ["ビジネス", "交渉"], complexity: "moderate" },
    "5": { contexts: ["ビジネス", "議論"], complexity: "advanced" },
  },
};

// 品詞別テンプレート（complexity別）
const TEMPLATES = {
  noun: {
    simple: [
      (w) => ({ en: `I can see a ${w} over there.`, ja: null }),
      (w) => ({ en: `The ${w} is very important.`, ja: null }),
      (w) => ({ en: `Do you know about the ${w}?`, ja: null }),
      (w) => ({ en: `This ${w} is really nice.`, ja: null }),
      (w) => ({ en: `We need a new ${w}.`, ja: null }),
      (w) => ({ en: `She has a ${w} in her hand.`, ja: null }),
      (w) => ({ en: `There is a ${w} on the table.`, ja: null }),
      (w) => ({ en: `Can you bring me the ${w}?`, ja: null }),
    ],
    moderate: [
      (w) => ({ en: `The ${w} plays a key role in this situation.`, ja: null }),
      (w) => ({ en: `We should consider the ${w} more carefully.`, ja: null }),
      (w) => ({ en: `The importance of ${w} cannot be overstated.`, ja: null }),
      (w) => ({ en: `This ${w} has changed significantly over the years.`, ja: null }),
      (w) => ({ en: `They discussed the ${w} at the meeting.`, ja: null }),
      (w) => ({ en: `Understanding this ${w} is essential for students.`, ja: null }),
    ],
    advanced: [
      (w) => ({ en: `The concept of ${w} has been debated extensively.`, ja: null }),
      (w) => ({ en: `Recent studies have shed new light on ${w}.`, ja: null }),
      (w) => ({ en: `The ${w} is a critical factor in achieving success.`, ja: null }),
      (w) => ({ en: `Experts agree that ${w} requires further investigation.`, ja: null }),
      (w) => ({ en: `The implications of this ${w} are far-reaching.`, ja: null }),
    ],
  },
  verb: {
    simple: [
      (w) => ({ en: `I ${w} every day.`, ja: null }),
      (w) => ({ en: `She likes to ${w}.`, ja: null }),
      (w) => ({ en: `Can you ${w} for me?`, ja: null }),
      (w) => ({ en: `We ${w} together on weekends.`, ja: null }),
      (w) => ({ en: `He wants to ${w} tomorrow.`, ja: null }),
      (w) => ({ en: `Let's ${w} after school.`, ja: null }),
      (w) => ({ en: `Please ${w} again.`, ja: null }),
      (w) => ({ en: `I will ${w} later.`, ja: null }),
    ],
    moderate: [
      (w) => ({ en: `It is necessary to ${w} before making a decision.`, ja: null }),
      (w) => ({ en: `The team decided to ${w} the project.`, ja: null }),
      (w) => ({ en: `You should ${w} the document before submitting it.`, ja: null }),
      (w) => ({ en: `They plan to ${w} the new system next month.`, ja: null }),
      (w) => ({ en: `We need to ${w} this issue as soon as possible.`, ja: null }),
      (w) => ({ en: `She was asked to ${w} the presentation.`, ja: null }),
    ],
    advanced: [
      (w) => ({ en: `The committee voted to ${w} the proposed amendments.`, ja: null }),
      (w) => ({ en: `Failure to ${w} these regulations may result in penalties.`, ja: null }),
      (w) => ({ en: `The organization aims to ${w} its global operations.`, ja: null }),
      (w) => ({ en: `Researchers are trying to ${w} the underlying mechanism.`, ja: null }),
      (w) => ({ en: `The policy was designed to ${w} economic growth.`, ja: null }),
    ],
  },
  adjective: {
    simple: [
      (w) => ({ en: `This is very ${w}.`, ja: null }),
      (w) => ({ en: `She looks ${w} today.`, ja: null }),
      (w) => ({ en: `The weather is ${w}.`, ja: null }),
      (w) => ({ en: `That was a ${w} experience.`, ja: null }),
      (w) => ({ en: `I feel ${w} about it.`, ja: null }),
      (w) => ({ en: `It is ${w} to study hard.`, ja: null }),
    ],
    moderate: [
      (w) => ({ en: `The results were quite ${w}.`, ja: null }),
      (w) => ({ en: `It is ${w} to address this problem promptly.`, ja: null }),
      (w) => ({ en: `The situation became increasingly ${w}.`, ja: null }),
      (w) => ({ en: `This approach is considered ${w} by many experts.`, ja: null }),
      (w) => ({ en: `The report highlighted several ${w} trends.`, ja: null }),
    ],
    advanced: [
      (w) => ({ en: `The ${w} nature of this phenomenon has puzzled scientists.`, ja: null }),
      (w) => ({ en: `Such ${w} measures are necessary to maintain stability.`, ja: null }),
      (w) => ({ en: `The evidence presented was particularly ${w}.`, ja: null }),
      (w) => ({ en: `A more ${w} analysis is needed before drawing conclusions.`, ja: null }),
    ],
  },
  adverb: {
    simple: [
      (w) => ({ en: `She runs ${w}.`, ja: null }),
      (w) => ({ en: `He speaks English ${w}.`, ja: null }),
      (w) => ({ en: `Please walk ${w}.`, ja: null }),
      (w) => ({ en: `The train arrived ${w}.`, ja: null }),
    ],
    moderate: [
      (w) => ({ en: `The project was ${w} completed on time.`, ja: null }),
      (w) => ({ en: `She ${w} accepted the offer.`, ja: null }),
      (w) => ({ en: `The issue was ${w} resolved through negotiation.`, ja: null }),
    ],
    advanced: [
      (w) => ({ en: `The data ${w} supports the original hypothesis.`, ja: null }),
      (w) => ({ en: `The legislation was ${w} enacted despite opposition.`, ja: null }),
    ],
  },
  other: {
    simple: [
      (w) => ({ en: `${w.charAt(0).toUpperCase() + w.slice(1)}, I have a question.`, ja: null }),
      (w) => ({ en: `I think ${w} is useful to know.`, ja: null }),
    ],
    moderate: [
      (w) => ({ en: `${w.charAt(0).toUpperCase() + w.slice(1)} is commonly used in this context.`, ja: null }),
      (w) => ({ en: `The expression "${w}" appears frequently in conversation.`, ja: null }),
    ],
    advanced: [
      (w) => ({ en: `The usage of "${w}" varies across dialects.`, ja: null }),
      (w) => ({ en: `"${w.charAt(0).toUpperCase() + w.slice(1)}" carries a nuanced meaning in formal writing.`, ja: null }),
    ],
  },
};

// 日本語訳生成（意味フィールドから推測）
function generateJa(word, meaning, template) {
  // テンプレートのJaがnullの場合はシンプルな訳を生成
  // ここでは日本語テンプレートも用意
  return null; // 日本語はbuilddGeneratedExtensionフォールバックに任せる
}

// 2つの例文を生成
function generateTwoExamples(wordInfo) {
  const { word, pos, course, stage } = wordInfo;
  const posKey = pos || "other";
  const config = CONTEXTS[course]?.[stage] || { contexts: ["日常", "一般"], complexity: "moderate" };
  const templates = TEMPLATES[posKey]?.[config.complexity] || TEMPLATES.other[config.complexity] || TEMPLATES.other.moderate;

  // ランダムに2つ選ぶ（重複なし）
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 2);

  return selected.map((tmpl, idx) => {
    const result = tmpl(word);
    return {
      en: result.en,
      ja: "", // フォールバック生成に任せる
      context: config.contexts[idx % config.contexts.length],
    };
  });
}

// --- メイン処理 ---
function main() {
  console.log("📖 単語IDマップ構築中...");
  const idMap = buildIdMap();
  console.log(`  ${idMap.size}語のIDマップを構築`);

  console.log("📝 word-extensions-motitown.ts を読み込み中...");
  let content = readFileSync(EXT_FILE, "utf-8");

  // IDで対象をフィルタ
  const courseIdRanges = {
    junior: [10001, 19999],
    senior: [20001, 29999],
    toeic: [30001, 39999],
    eiken: [40001, 49999],
    conversation: [70001, 79999],
  };

  // examples配列に1つだけのエントリを見つけて2つ追加
  // パターン: examples: [\n        { en: "...", ja: "...", context: "..." },\n      ],
  const exampleBlockRegex = /(\s*)(examples:\s*\[\s*\n\s*\{[^}]+\},?\s*\n\s*\],)/g;

  let matchCount = 0;
  let addedCount = 0;
  let skippedCount = 0;

  // IDを抽出するためのパターン
  // 各エントリは `// word (ID)\n  [\n    ID,` の形式
  // examples ブロックの前にあるIDを見つける

  // 別アプローチ: エントリごとに処理
  // エントリの区切り: `  // word (ID)` コメント行
  const entryRegex = /\/\/\s+\S+\s+\((\d+)\)\s*\n\s*\[\s*\n\s*\1,\s*\n\s*\{([\s\S]*?)\n\s*\},?\s*\n\s*\],?/g;

  // もっとシンプルなアプローチ: IDとexamplesの位置関係で処理
  // 各エントリのIDを取得 → そのエントリ内の examples を書き換え

  // 行ベースで処理
  const lines = content.split("\n");
  const newLines = [];
  let currentId = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // IDコメント行: `  // word (12345)`
    const idMatch = line.match(/\/\/\s+\S+\s+\((\d+)\)/);
    if (idMatch) {
      currentId = parseInt(idMatch[1]);
    }

    // examples配列の開始: `      examples: [`
    if (line.trim().startsWith("examples: [") && currentId) {
      const wordInfo = idMap.get(currentId);

      // コースフィルタ
      if (courseFilter && wordInfo?.course !== courseFilter) {
        newLines.push(line);
        i++;
        continue;
      }

      // examples の中身を数える
      let bracketDepth = 0;
      let exampleCount = 0;
      let j = i;
      const exampleLines = [line];

      // `[` を数えてブロック全体を取得
      for (let k = i; k < lines.length; k++) {
        const l = lines[k];
        bracketDepth += (l.match(/\[/g) || []).length;
        bracketDepth -= (l.match(/\]/g) || []).length;
        if (k > i) exampleLines.push(l);
        if (l.includes("context:")) exampleCount++;
        if (bracketDepth <= 0) {
          j = k;
          break;
        }
      }

      matchCount++;

      if (exampleCount >= 3) {
        // 既に3つ以上ある場合はスキップ
        skippedCount++;
        for (const el of exampleLines) newLines.push(el);
        i = j + 1;
        currentId = null;
        continue;
      }

      if (!wordInfo) {
        // 単語情報がない場合はスキップ
        skippedCount++;
        for (const el of exampleLines) newLines.push(el);
        i = j + 1;
        currentId = null;
        continue;
      }

      // 2つの例文を生成
      const newExamples = generateTwoExamples(wordInfo);
      addedCount++;

      // 既存のexamplesブロックの閉じ `],` の前に挿入
      // exampleLines の最後の行が `      ],` のはず
      const indent = "        ";
      const insertLines = newExamples.map(
        (ex) => `${indent}{ en: "${ex.en.replace(/"/g, '\\"')}", ja: "${ex.ja}", context: "${ex.context}" },`
      );

      // 閉じ括弧の行を探す
      for (let k = 0; k < exampleLines.length; k++) {
        if (exampleLines[k].trim() === "]," || exampleLines[k].trim() === "]") {
          // 閉じ括弧の前に挿入
          const before = exampleLines.slice(0, k);
          const after = exampleLines.slice(k);
          const combined = [...before, ...insertLines, ...after];
          for (const cl of combined) newLines.push(cl);
          i = j + 1;
          break;
        }
      }

      currentId = null;
      continue;
    }

    newLines.push(line);
    i++;
  }

  console.log(`\n📊 処理結果:`);
  console.log(`  検出エントリ: ${matchCount}`);
  console.log(`  例文追加: ${addedCount}`);
  console.log(`  スキップ: ${skippedCount}`);

  if (!dryRun && addedCount > 0) {
    writeFileSync(EXT_FILE, newLines.join("\n"), "utf-8");
    console.log(`  ✅ ${EXT_FILE} を更新しました`);
  } else if (dryRun) {
    console.log(`  [DRY RUN] 書き込みは行いません`);
  }
}

main();
