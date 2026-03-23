#!/usr/bin/env node
/**
 * 移行前スナップショット生成
 * compat.ts のロジックを再現して検証用データを JSON に出力
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src/data");

// --- 単語データ読み込み（正規表現パース） ---
function parseWordArray(filePath) {
  const content = readFileSync(filePath, "utf-8");
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
  return words;
}

// --- overrides読み込み ---
function parseMapFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const map = new Map();
  // [ID, "value"] or [ID, ["v1", "v2"]]
  const entryRegex = /\[\s*(\d+),\s*("(?:[^"\\]|\\.)*"|\[(?:[^\]]*)\])\s*\]/g;
  let m;
  while ((m = entryRegex.exec(content))) {
    const id = parseInt(m[1]);
    const raw = m[2];
    if (raw.startsWith("[")) {
      // 配列
      const items = [...raw.matchAll(/"([^"\\]|\\.)*"/g)].map(x => x[0].slice(1, -1));
      map.set(id, items);
    } else {
      map.set(id, raw.slice(1, -1));
    }
  }
  return map;
}

// --- compat.ts のロジックを再現 ---
const DIFFICULTY_MAP = {
  "junior:1": 1, "junior:2": 2, "junior:3": 3,
  "senior:1": 4, "senior:2": 4, "senior:3": 5,
  "eiken:5": 1, "eiken:4": 2, "eiken:3": 3, "eiken:pre2": 4, "eiken:2": 5, "eiken:pre1": 6, "eiken:1": 7,
  "toeic:500": 3, "toeic:600": 4, "toeic:700": 5, "toeic:800": 6, "toeic:900": 7,
  "conversation:1": 1, "conversation:2": 2, "conversation:3": 4, "conversation:4": 5, "conversation:5": 7,
};

const CATEGORY_MAP = {
  junior: "school", senior: "school", toeic: "business",
  eiken: "daily", general: "daily", business: "business", conversation: "communication",
};

const CATEGORY_PRIORITY = [
  "business","office","finance","technology","travel","shopping","school","family",
  "health","food","sports","nature","culture","greeting","request","opinion",
  "emotion","smalltalk","communication","hobby","daily",
];

const ENGLISH_CATEGORY_KEYWORDS = {
  business: ["company","business","project","client","manager","strategy","policy","market","contract","sales","revenue","employee","employment","corporate"],
  office: ["office","meeting","document","report","schedule","department","staff","email","memo","file","presentation","deadline"],
  travel: ["travel","trip","tour","flight","airport","hotel","station","ticket","reservation","passport","luggage","tourist"],
  shopping: ["shop","shopping","store","price","buy","purchase","order","delivery","customer","receipt","refund","discount","cart"],
  finance: ["finance","bank","account","payment","budget","cost","expense","salary","profit","invoice","tax","loan","interest"],
  technology: ["computer","digital","software","device","data","system","network","online","internet","app","robot","machine"],
  daily: ["daily","everyday","day","life","home","basic","common"],
  communication: ["talk","speak","say","tell","ask","answer","discuss","explain","call","message","conversation","communicate"],
  school: ["school","class","student","teacher","lesson","study","exam","homework","textbook","library","university","college"],
  family: ["family","father","mother","parent","child","brother","sister","son","daughter","husband","wife"],
  hobby: ["hobby","game","music","movie","art","craft","collect","draw"],
  nature: ["nature","animal","bird","fish","tree","forest","river","mountain","sea","earth","weather","climate"],
  health: ["health","medical","doctor","hospital","disease","illness","pain","exercise","healthy","medicine","cure"],
  food: ["food","eat","drink","breakfast","lunch","dinner","meal","cook","restaurant","fruit","vegetable","rice","bread"],
  sports: ["sport","soccer","baseball","basketball","tennis","swim","athlete","running","runner","marathon","coach","stadium","league","tournament","match"],
  culture: ["culture","history","language","festival","tradition","religion","museum"],
  greeting: ["hello","hi","good morning","good evening","good night","thank you","sorry"],
  emotion: ["happy","sad","angry","glad","afraid","worry","excited","feeling"],
  opinion: ["think","believe","opinion","idea","guess","suppose","probably","maybe"],
  request: ["please","can you","could you","would you","let me","shall we","help"],
  smalltalk: ["how are you","what's up","by the way","no worries","sounds good","see you"],
};

const JAPANESE_CATEGORY_KEYWORDS = {
  school: ["学校","授業","先生","生徒","学生","教室","勉強","試験","宿題","図書館"],
  family: ["家族","父","母","親","兄","姉","弟","妹","祖父","祖母","子ども"],
  health: ["健康","病気","医師","病院","痛み","治療","薬","運動"],
  food: ["食","食べ","飲","朝食","昼食","夕食","料理","野菜","果物"],
  nature: ["自然","山","川","海","空","森","動物","植物","天気","地球"],
  business: ["会社","業務","企業","契約","顧客","経営","営業"],
  office: ["部署","会議","書類","報告","予定","事務","職場"],
  finance: ["金融","経済","予算","支払い","請求","収益","給料","費用"],
  technology: ["技術","機器","データ","システム","ソフト","オンライン","端末"],
  travel: ["旅行","空港","駅","ホテル","便","切符","旅程"],
  shopping: ["買い物","店","購入","価格","注文","配送","返金"],
  greeting: ["こんにちは","おはよう","こんばんは","おやすみ","ありがとう","すみません"],
  emotion: ["気持","うれしい","悲しい","怒","不安","安心"],
  opinion: ["意見","考え","思う","推測"],
  request: ["お願い","ください","してくれる","してもらえる"],
  smalltalk: ["雑談","調子","ところで"],
};

function normalizeEnglishText(text) {
  return text.toLowerCase().replace(/[^a-z0-9'\s]+/g, " ").replace(/\s+/g, " ").trim();
}

function includesAnyEnglish(text, keywords) {
  const normalized = normalizeEnglishText(text);
  if (!normalized) return false;
  const tokens = new Set(normalized.split(" "));
  const padded = ` ${normalized} `;
  return keywords.some((k) => {
    const key = normalizeEnglishText(k);
    if (!key) return false;
    if (!key.includes(" ")) return tokens.has(key);
    return padded.includes(` ${key} `);
  });
}

function includesAnySubstring(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

function normalizeCategories(categories) {
  const unique = new Set(categories);
  return CATEGORY_PRIORITY.filter((c) => unique.has(c));
}

function inferCategories(word) {
  const result = [];
  const textEn = `${word.word} ${word.meaning}`.toLowerCase();
  const textJa = word.meaning;
  const lowerWord = word.word.toLowerCase();
  const lowerExample = (word.example ?? "").toLowerCase();

  if (word.course === "toeic") result.push("business", "office");
  if (word.course === "conversation") result.push("communication");
  if (word.course === "junior" || word.course === "senior") result.push("school");
  if (word.course === "eiken") result.push("daily");

  for (const [category, keywords] of Object.entries(ENGLISH_CATEGORY_KEYWORDS)) {
    if (includesAnyEnglish(textEn, keywords)) result.push(category);
  }
  for (const [category, keywords] of Object.entries(JAPANESE_CATEGORY_KEYWORDS)) {
    if (keywords && includesAnySubstring(textJa, keywords)) result.push(category);
  }

  if (word.course === "conversation") {
    if (includesAnyEnglish(lowerWord, ENGLISH_CATEGORY_KEYWORDS.greeting) ||
        includesAnyEnglish(lowerExample, ENGLISH_CATEGORY_KEYWORDS.greeting)) result.push("greeting");
    if (includesAnyEnglish(lowerWord, ENGLISH_CATEGORY_KEYWORDS.request) ||
        includesAnyEnglish(lowerExample, ENGLISH_CATEGORY_KEYWORDS.request)) result.push("request");
    if (includesAnyEnglish(lowerWord, ENGLISH_CATEGORY_KEYWORDS.opinion) ||
        includesAnyEnglish(lowerExample, ENGLISH_CATEGORY_KEYWORDS.opinion)) result.push("opinion");
    if (includesAnyEnglish(lowerWord, ENGLISH_CATEGORY_KEYWORDS.emotion) ||
        includesAnyEnglish(lowerExample, ENGLISH_CATEGORY_KEYWORDS.emotion)) result.push("emotion");
    if (word.word.includes(" ") || word.word.includes("'")) result.push("smalltalk");
  }

  if (result.length === 0) result.push(CATEGORY_MAP[word.course] ?? "daily");
  return normalizeCategories(result);
}

// --- メイン ---
console.log("📸 スナップショット生成中...");

const allWords = [
  ...parseWordArray(join(SRC, "words/junior.ts")),
  ...parseWordArray(join(SRC, "words/senior.ts")),
  ...parseWordArray(join(SRC, "words/toeic.ts")),
  ...parseWordArray(join(SRC, "words/eiken.ts")),
  ...parseWordArray(join(SRC, "words/conversation.ts")),
];

const exampleJaOverrides = parseMapFile(join(SRC, "example-ja-overrides.ts"));
const categoryOverrides = parseMapFile(join(SRC, "category-overrides.ts"));

console.log(`  単語数: ${allWords.length}`);
console.log(`  例文日本語訳: ${exampleJaOverrides.size}件`);
console.log(`  カテゴリ上書き: ${categoryOverrides.size}件`);

const snapshot = allWords.map((w) => {
  const inferredCats = inferCategories(w);
  const overrideCats = categoryOverrides.get(w.id);
  const cats = overrideCats && overrideCats.length > 0
    ? normalizeCategories(overrideCats) : inferredCats;
  const category = cats[0] ?? CATEGORY_MAP[w.course] ?? "daily";
  const difficulty = DIFFICULTY_MAP[`${w.course}:${w.stage}`] ?? 3;
  const exampleJa = exampleJaOverrides.get(w.id) || null;

  return {
    id: w.id, word: w.word, meaning: w.meaning,
    partOfSpeech: w.partOfSpeech, course: w.course, stage: w.stage,
    example: w.example || null, exampleJa,
    category, categories: cats, difficulty,
    frequencyRank: w.frequencyRank,
  };
});

const outPath = join(ROOT, "scripts/migration-snapshot.json");
writeFileSync(outPath, JSON.stringify(snapshot, null, 2), "utf-8");
console.log(`✅ ${snapshot.length}語のスナップショットを保存`);
