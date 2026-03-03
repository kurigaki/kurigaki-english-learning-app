/**
 * Compatibility adapter: new Word data → legacy Word interface
 *
 * Provides the same export names as the old src/data/words.ts so that
 * UI pages can switch imports with zero logic changes.
 */
import { allWords, Word as InternalWord, Course } from "./index";
import type { PartOfSpeech, PronunciationData, WordExample, WordColumn, RelatedWordEntry, SynonymDifferenceEntry } from "@/types";
import { wordExtensions } from "../word-extensions";
import { exampleJaOverrides } from "../example-ja-overrides";
import { categoryOverrides } from "../category-overrides";

// Re-export Course as CourseType for backward compatibility
export type CourseType = Course;

// Category union (simplified: one default per course)
export type Category =
  | "business"
  | "office"
  | "travel"
  | "shopping"
  | "finance"
  | "technology"
  | "daily"
  | "communication"
  | "school"
  | "family"
  | "hobby"
  | "nature"
  | "health"
  | "food"
  | "sports"
  | "culture"
  | "greeting"
  | "emotion"
  | "opinion"
  | "request"
  | "smalltalk";

// Difficulty supports 1-7
export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Legacy-compatible Word type (singular `category` field)
export type Word = {
  id: number;
  word: string;
  meaning: string;
  example?: string;
  exampleJa?: string;
  difficulty: Difficulty;
  category: Category;
  categories?: Category[];    // 複数カテゴリ（あれば）
  pronunciation?: string | PronunciationData;
  partOfSpeech?: PartOfSpeech;
  examples?: WordExample[];
  synonyms?: string[];
  antonyms?: string[];
  relatedWords?: string[];                    // 関連語（後方互換）
  relatedWordEntries?: RelatedWordEntry[];     // 品詞・意味付き関連語
  column?: WordColumn;
  imageUrl?: string;
  imageKeyword?: string;
  coreImage?: string;
  usage?: string;
  synonymDifference?: string;                         // 類義語との違い（後方互換）
  synonymDifferenceEntries?: SynonymDifferenceEntry[]; // 類義語の違い（構造化）
  englishDefinition?: string;
  etymology?: string | string[]; // 複数語源対応
};

// course+stage → difficulty マッピング
const DIFFICULTY_MAP: Record<string, number> = {
  "junior:1": 1, "junior:2": 2, "junior:3": 3,
  "senior:1": 4, "senior:2": 4, "senior:3": 5,
  "eiken:5": 1, "eiken:4": 2, "eiken:3": 3, "eiken:pre2": 4, "eiken:2": 5, "eiken:pre1": 6, "eiken:1": 7,
  "toeic:500": 3, "toeic:600": 4, "toeic:700": 5, "toeic:800": 6, "toeic:900": 7,
  "conversation:1": 1, "conversation:2": 2, "conversation:3": 4, "conversation:4": 5, "conversation:5": 7,
};

// course → default category マッピング
const CATEGORY_MAP: Record<Course, Category> = {
  junior: "school",
  senior: "school",
  toeic: "business",
  eiken: "daily",
  general: "daily",
  business: "business",
  conversation: "communication",
};

const CATEGORY_PRIORITY: Category[] = [
  "business",
  "office",
  "finance",
  "technology",
  "travel",
  "shopping",
  "school",
  "family",
  "health",
  "food",
  "sports",
  "nature",
  "culture",
  "greeting",
  "request",
  "opinion",
  "emotion",
  "smalltalk",
  "communication",
  "hobby",
  "daily",
];

const ENGLISH_CATEGORY_KEYWORDS: Record<Category, string[]> = {
  business: [
    "company", "business", "project", "client", "manager", "strategy", "policy", "market",
    "contract", "sales", "revenue", "employee", "employment", "corporate",
  ],
  office: [
    "office", "meeting", "document", "report", "schedule", "department", "staff",
    "email", "memo", "file", "presentation", "deadline",
  ],
  travel: [
    "travel", "trip", "tour", "flight", "airport", "hotel", "station", "ticket",
    "reservation", "passport", "luggage", "tourist",
  ],
  shopping: [
    "shop", "shopping", "store", "price", "buy", "purchase", "order", "delivery",
    "customer", "receipt", "refund", "discount", "cart",
  ],
  finance: [
    "finance", "bank", "account", "payment", "budget", "cost", "expense", "salary",
    "profit", "invoice", "tax", "loan", "interest",
  ],
  technology: [
    "computer", "digital", "software", "device", "data", "system", "network",
    "online", "internet", "app", "robot", "machine",
  ],
  daily: ["daily", "everyday", "day", "life", "home", "basic", "common"],
  communication: [
    "talk", "speak", "say", "tell", "ask", "answer", "discuss", "explain",
    "call", "message", "conversation", "communicate",
  ],
  school: [
    "school", "class", "student", "teacher", "lesson", "study", "exam", "homework",
    "textbook", "library", "university", "college",
  ],
  family: [
    "family", "father", "mother", "parent", "child", "brother", "sister",
    "son", "daughter", "husband", "wife",
  ],
  hobby: ["hobby", "game", "music", "movie", "art", "craft", "collect", "draw"],
  nature: [
    "nature", "animal", "bird", "fish", "tree", "forest", "river", "mountain",
    "sea", "earth", "weather", "climate",
  ],
  health: [
    "health", "medical", "doctor", "hospital", "disease", "illness", "pain",
    "exercise", "healthy", "medicine", "cure",
  ],
  food: [
    "food", "eat", "drink", "breakfast", "lunch", "dinner", "meal", "cook",
    "restaurant", "fruit", "vegetable", "rice", "bread",
  ],
  sports: ["sport", "soccer", "baseball", "basketball", "tennis", "run", "swim", "athlete"],
  culture: ["culture", "history", "language", "festival", "tradition", "religion", "museum"],
  greeting: ["hello", "hi", "good morning", "good evening", "good night", "thank you", "sorry"],
  emotion: ["happy", "sad", "angry", "glad", "afraid", "worry", "excited", "feeling"],
  opinion: ["think", "believe", "opinion", "idea", "guess", "suppose", "probably", "maybe"],
  request: ["please", "can you", "could you", "would you", "let me", "shall we", "help"],
  smalltalk: ["how are you", "what's up", "by the way", "no worries", "sounds good", "see you"],
};

const JAPANESE_CATEGORY_KEYWORDS: Partial<Record<Category, string[]>> = {
  school: ["学校", "授業", "先生", "生徒", "学生", "教室", "勉強", "試験", "宿題", "図書館"],
  family: ["家族", "父", "母", "親", "兄", "姉", "弟", "妹", "祖父", "祖母", "子ども"],
  health: ["健康", "病気", "医師", "病院", "痛み", "治療", "薬", "運動"],
  food: ["食", "食べ", "飲", "朝食", "昼食", "夕食", "料理", "野菜", "果物"],
  nature: ["自然", "山", "川", "海", "空", "森", "動物", "植物", "天気", "地球"],
  business: ["会社", "業務", "企業", "契約", "顧客", "経営", "営業"],
  office: ["部署", "会議", "書類", "報告", "予定", "事務", "職場"],
  finance: ["金融", "経済", "予算", "支払い", "請求", "収益", "給料", "費用"],
  technology: ["技術", "機器", "データ", "システム", "ソフト", "オンライン", "端末"],
  travel: ["旅行", "空港", "駅", "ホテル", "便", "切符", "旅程"],
  shopping: ["買い物", "店", "購入", "価格", "注文", "配送", "返金"],
  greeting: ["こんにちは", "おはよう", "こんばんは", "おやすみ", "ありがとう", "すみません"],
  emotion: ["気持", "うれしい", "悲しい", "怒", "不安", "安心"],
  opinion: ["意見", "考え", "思う", "推測"],
  request: ["お願い", "ください", "してくれる", "してもらえる"],
  smalltalk: ["雑談", "調子", "ところで"],
};

const includesAny = (text: string, keywords: string[]): boolean =>
  keywords.some((k) => text.includes(k));

function normalizeCategories(categories: Category[]): Category[] {
  const unique = new Set<Category>(categories);
  return CATEGORY_PRIORITY.filter((c) => unique.has(c));
}

function inferCategories(word: InternalWord): Category[] {
  const result: Category[] = [];
  const textEn = `${word.word} ${word.meaning}`.toLowerCase();
  const textJa = word.meaning;
  const lowerWord = word.word.toLowerCase();
  const lowerExample = (word.example ?? "").toLowerCase();

  // course base
  if (word.course === "toeic") result.push("business", "office");
  if (word.course === "conversation") result.push("communication");
  if (word.course === "junior" || word.course === "senior") result.push("school");
  if (word.course === "eiken") result.push("daily");

  // lexical match (English)
  (Object.keys(ENGLISH_CATEGORY_KEYWORDS) as Category[]).forEach((category) => {
    if (includesAny(textEn, ENGLISH_CATEGORY_KEYWORDS[category])) {
      result.push(category);
    }
  });

  // lexical match (Japanese meaning)
  (Object.keys(JAPANESE_CATEGORY_KEYWORDS) as Category[]).forEach((category) => {
    const keywords = JAPANESE_CATEGORY_KEYWORDS[category];
    if (keywords && includesAny(textJa, keywords)) {
      result.push(category);
    }
  });

  // conversation-specific refinements
  if (word.course === "conversation") {
    if (
      includesAny(lowerWord, ENGLISH_CATEGORY_KEYWORDS.greeting) ||
      includesAny(lowerExample, ENGLISH_CATEGORY_KEYWORDS.greeting)
    ) {
      result.push("greeting");
    }
    if (
      includesAny(lowerWord, ENGLISH_CATEGORY_KEYWORDS.request) ||
      includesAny(lowerExample, ENGLISH_CATEGORY_KEYWORDS.request)
    ) {
      result.push("request");
    }
    if (
      includesAny(lowerWord, ENGLISH_CATEGORY_KEYWORDS.opinion) ||
      includesAny(lowerExample, ENGLISH_CATEGORY_KEYWORDS.opinion)
    ) {
      result.push("opinion");
    }
    if (
      includesAny(lowerWord, ENGLISH_CATEGORY_KEYWORDS.emotion) ||
      includesAny(lowerExample, ENGLISH_CATEGORY_KEYWORDS.emotion)
    ) {
      result.push("emotion");
    }
    if (word.word.includes(" ") || word.word.includes("'")) {
      result.push("smalltalk");
    }
  }

  if (result.length === 0) {
    result.push(CATEGORY_MAP[word.course] ?? "daily");
  }

  return normalizeCategories(result);
}

// Convert new word to legacy-compatible format
function toLegacyWord(w: InternalWord): Word {
  const ext = wordExtensions.get(w.id);  // 手動データのみ（自動生成は word/[id]/page.tsx の getWordExtension() に任せる）
  const inferredCategories = inferCategories(w);
  const overrideCategories = categoryOverrides.get(w.id) as Category[] | undefined;
  const mergedCategories = normalizeCategories([
    ...(overrideCategories ?? []),
    ...inferredCategories,
  ]);
  const primaryCategory =
    mergedCategories[0] ?? CATEGORY_MAP[w.course] ?? "daily";

  return {
    id: w.id,
    word: w.word,
    meaning: w.meaning,
    example: w.example,
    exampleJa: exampleJaOverrides.get(w.id),
    difficulty: (DIFFICULTY_MAP[`${w.course}:${w.stage}`] ?? 3) as Difficulty,
    category: primaryCategory,
    // string[] → Category[] キャスト（category-overrides.ts は循環インポート回避のため string[] を使用。typo は実行時まで検出されない点に注意）
    categories: mergedCategories.length > 0 ? mergedCategories : undefined,
    partOfSpeech: w.partOfSpeech as PartOfSpeech,
    pronunciation: ext?.pronunciation,
    examples: ext?.examples,
    relatedWords: ext?.relatedWords,
    relatedWordEntries: ext?.relatedWordEntries,
    synonyms: ext?.synonyms,
    antonyms: ext?.antonyms,
    column: ext?.column,
    coreImage: ext?.coreImage,
    usage: ext?.usage,
    synonymDifference: ext?.synonymDifference,
    synonymDifferenceEntries: ext?.synonymDifferenceEntries,
    englishDefinition: ext?.englishDefinition,
    etymology: ext?.etymology,
  };
}

// All words in legacy-compatible format
export const words: Word[] = allWords.map(toLegacyWord);

// Category labels (21 categories)
export const categoryLabels: Record<Category, string> = {
  business: "ビジネス一般",
  office: "オフィス・職場",
  travel: "旅行・交通",
  shopping: "買い物・店舗",
  finance: "金融・経済",
  technology: "技術・IT",
  daily: "日常生活",
  communication: "コミュニケーション",
  school: "学校",
  family: "家族・家庭",
  hobby: "趣味・娯楽",
  nature: "自然・環境",
  health: "健康・医療",
  food: "食事・料理",
  sports: "スポーツ",
  culture: "文化・芸術",
  greeting: "挨拶",
  emotion: "感情表現",
  opinion: "意見表明",
  request: "依頼・お願い",
  smalltalk: "雑談",
};

// Difficulty labels (7 levels)
export const difficultyLabels: Record<Difficulty, string> = {
  1: "中学1年",
  2: "中学2年",
  3: "中学3年",
  4: "高校基礎",
  5: "高校応用",
  6: "難関・準1級",
  7: "最難関・1級",
};

// Re-export V2 utilities for pages that need course filtering
export { getWordsByCourse } from "./index";
