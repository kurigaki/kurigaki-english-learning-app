#!/usr/bin/env node
// T-VQS-011: context フィールドを日本語に統一する
//
// 対象: 全 6,978 件の英語 context + 1 件の英日混在
// 戦略:
//   1. 直接マッピング（頻出カテゴリ）
//   2. キーワードベース推定（複合語・固有パターン）
//   3. フォールバック（日常）

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const dryRun = process.argv.includes("--dry");
const reportUnmapped = process.argv.includes("--report");

// レベル1: 完全一致マッピング（頻出語）
const DIRECT_MAP = {
  // Top 30 (> 50 件)
  academic: "学術",
  business: "ビジネス",
  daily: "日常",
  health: "健康",
  society: "社会",
  school: "学校",
  education: "教育",
  IT: "技術",
  politics: "政治",
  science: "科学",
  history: "歴史",
  technology: "技術",
  food: "食事",
  nature: "自然",
  travel: "旅行",
  finance: "金融",
  office: "職場",
  social: "社会",
  work: "仕事",
  sports: "スポーツ",
  law: "法律",
  culture: "文化",
  hr: "人事",
  HR: "人事",
  study: "学校",
  economy: "経済",
  emotion: "感情",
  home: "家庭",
  family: "家庭",
  research: "研究",
  general: "日常",
  // 追加頻出
  art: "芸術",
  music: "音楽",
  literature: "文学",
  environment: "環境",
  religion: "宗教",
  military: "軍事",
  medical: "医療",
  medicine: "医療",
  sport: "スポーツ",
  philosophy: "哲学",
  physics: "科学",
  chemistry: "科学",
  biology: "科学",
  math: "科学",
  mathematics: "科学",
  geography: "地理",
  weather: "天気",
  politics_election: "政治",
  communication: "会話",
  language: "言語",
  translation: "言語",
  government: "政治",
  economics: "経済",
  banking: "金融",
  investing: "金融",
  investment: "金融",
  marketing: "ビジネス",
  sales: "ビジネス",
  retail: "買い物",
  shopping: "買い物",
  cooking: "料理",
  kitchen: "料理",
  restaurant: "食事",
  hotel: "旅行",
  airport: "旅行",
  transport: "交通",
  transportation: "交通",
  traffic: "交通",
  driving: "交通",
  driver: "交通",
  car: "交通",
  vehicle: "交通",
  hobby: "趣味",
  entertainment: "娯楽",
  movie: "娯楽",
  film: "娯楽",
  games: "娯楽",
  game: "娯楽",
  leisure: "娯楽",
  party: "社交",
  celebration: "社交",
  wedding: "社交",
  birthday: "社交",
  relationship: "人間関係",
  friendship: "人間関係",
  love: "人間関係",
  dating: "人間関係",
  conversation: "会話",
  greeting: "挨拶",
  question: "会話",
  answer: "会話",
  opinion: "会話",
  agreement: "会話",
  disagreement: "会話",
  news: "報道",
  media: "報道",
  journalism: "報道",
  job: "仕事",
  career: "仕事",
  career_advancement: "仕事",
  interview: "仕事",
  meeting: "仕事",
  negotiation: "ビジネス",
  contract: "法律",
  legal: "法律",
  court: "法律",
  crime: "法律",
  police: "法律",
  justice: "法律",
  lifestyle: "日常",
  routine: "日常",
  morning: "日常",
  evening: "日常",
  night: "日常",
  sleep: "健康",
  exercise: "健康",
  fitness: "健康",
  yoga: "健康",
  beach: "旅行",
  vacation: "旅行",
  holiday: "旅行",
  adventure: "旅行",
  nature_trip: "旅行",
  park: "自然",
  garden: "自然",
  animal: "自然",
  weather_storm: "天気",
  climate: "環境",
  pollution: "環境",
  recycling: "環境",
  energy: "科学",
  space: "科学",
  astronomy: "科学",
  computer: "技術",
  internet: "技術",
  software: "技術",
  hardware: "技術",
  mobile: "技術",
  app: "技術",
  website: "技術",
  ai: "技術",
  AI: "技術",
  ML: "技術",
  data: "技術",
  database: "技術",
  server: "技術",
  cloud: "技術",
  network: "技術",
  security: "技術",
  cryptocurrency: "金融",
  crypto: "金融",
  stock: "金融",
  market: "金融",
  real_estate: "金融",
  insurance: "金融",
  tax: "金融",
  accounting: "金融",
  audit: "金融",
  budget: "金融",
  salary: "金融",
  wage: "金融",
  CEO: "ビジネス",
  boss: "ビジネス",
  employee: "ビジネス",
  worker: "ビジネス",
  manager: "ビジネス",
  colleague: "ビジネス",
  colleagues: "ビジネス",
  team: "ビジネス",
  project: "ビジネス",
  startup: "ビジネス",
  company: "ビジネス",
  organization: "ビジネス",
  CPR: "医療",
  paramedic: "医療",
  therapist: "医療",
  doctor: "医療",
  nurse: "医療",
  hospital: "医療",
  patient: "医療",
  pharmacy: "医療",
  drug: "医療",
  illness: "医療",
  disease: "医療",
  surgery: "医療",
  immunity: "医療",
  vaccine: "医療",
  pandemic: "医療",
  CSR: "ビジネス",
  "R&D": "技術",
  "CI/CD": "技術",
  REST: "技術",
  DevOps: "技術",
  SaaS: "技術",
  OOP: "技術",
  BBQ: "食事",
  tea: "食事",
  chef: "料理",
  model: "ビジネス",
  investor: "金融",
  senator: "政治",
  nation: "政治",
  engineer: "技術",
  activists: "社会",
  accusations: "法律",
  claim: "法律",
  claims: "法律",
  testing: "技術",
  program: "技術",
  knowledge: "学術",
  tools: "技術",
  commentary: "会話",
  records: "記録",
  traditions: "文化",
  Spanish: "言語",
  children: "家庭",
  horse: "動物",
  drinking: "食事",
  forests: "自然",
  bounced: "日常",
  encounter: "日常",
  glances: "日常",
  rainfall: "天気",
  clouds: "天気",
  rope: "日常",
  steps: "日常",
  goals: "日常",
  commitment: "日常",
  store: "買い物",
  vehicles: "交通",
  exit: "日常",
  temper: "感情",
  betrayed: "感情",
  renewable: "環境",
  donations: "社会",
  fortune: "日常",
  emotions: "感情",
  conditions: "日常",
  moment: "日常",
  paragraph: "学術",
  automation: "技術",
  command: "技術",
  control: "技術",
  parties: "社交",
  mediator: "法律",
  selection: "日常",
  gentleman: "日常",
  inflation: "経済",
  flooding: "天気",
  conviction: "法律",
  injustices: "社会",
  answer: "学校",
  exploration: "科学",
  supporter: "社会",
  mathematics: "科学",
  engineering: "技術",
  // 追加頻出（50+ 件）
  safety: "安全",
  event: "社交",
  policy: "政治",
  values: "哲学",
  thinking: "学術",
  workplace: "職場",
  "daily life": "日常",
  animals: "自然",
  animal: "自然",
  writing: "学術",
  community: "社会",
  ethics: "哲学",
  basic: "日常",
  rights: "社会",
  arts: "芸術",
  management: "ビジネス",
  activity: "日常",
  question: "会話",
  character: "文学",
  places: "旅行",
  psychology: "学術",
  request: "会話",
  life: "日常",
  appearance: "日常",
  motivation: "感情",
  planning: "ビジネス",
  decision: "日常",
  future: "日常",
  time: "日常",
  disaster: "災害",
  finance_tax: "金融",
  hobby_sports: "スポーツ",
  action: "日常",
  action_verb: "日常",
  person: "日常",
  people: "日常",
  place: "日常",
  thing: "日常",
  object: "日常",
  description: "日常",
  feeling: "感情",
  feelings: "感情",
  mind: "感情",
  body: "健康",
  mental: "感情",
  mental_health: "健康",
  wellness: "健康",
  cuisine: "食事",
  dining: "食事",
  drinks: "食事",
  beverage: "食事",
  coffee: "食事",
  dessert: "食事",
  fruit: "食事",
  vegetable: "食事",
  meal: "食事",
  grocery: "買い物",
  store_shopping: "買い物",
  clothes: "買い物",
  fashion: "買い物",
  clothing: "買い物",
  shopping_mall: "買い物",
  mall: "買い物",
  market_shopping: "買い物",
  purchase: "買い物",
  smartphone: "技術",
  phone: "技術",
  device: "技術",
  gadget: "技術",
  tech_startup: "技術",
  coding: "技術",
  programming: "技術",
  code: "技術",
  app_dev: "技術",
  web: "技術",
  website_dev: "技術",
  development: "技術",
  innovation: "技術",
  science_research: "科学",
  scientific: "科学",
  experiment: "科学",
  discovery: "科学",
  lab: "科学",
  laboratory: "科学",
  biology_sci: "科学",
  physics_sci: "科学",
  astronomy_sci: "科学",
  geology: "科学",
  botany: "科学",
  zoology: "科学",
  nursing: "医療",
  doctor_visit: "医療",
  symptom: "医療",
  diagnosis: "医療",
  treatment: "医療",
  prescription: "医療",
  psychology_med: "医療",
  psychiatry: "医療",
  mental_illness: "医療",
  fitness_gym: "健康",
  gym: "健康",
  diet: "健康",
  nutrition: "健康",
  sleep_health: "健康",
  hygiene: "健康",
  cleaning: "日常",
  housework: "家庭",
  laundry: "家庭",
  childcare: "家庭",
  parenting: "家庭",
  marriage: "家庭",
  pet: "家庭",
  dog: "家庭",
  cat: "家庭",
  vacation_travel: "旅行",
  tourist: "旅行",
  tourism: "旅行",
  flight: "旅行",
  cruise: "旅行",
  train_travel: "旅行",
  hotel_travel: "旅行",
  city: "旅行",
  country: "旅行",
  abroad: "旅行",
  international: "社会",
  global: "社会",
  world: "社会",
  culture_travel: "文化",
  music_art: "音楽",
  singer: "音楽",
  band: "音楽",
  concert: "音楽",
  instrument: "音楽",
  painting: "芸術",
  drawing: "芸術",
  sculpture: "芸術",
  photography: "芸術",
  design: "芸術",
  novel: "文学",
  poetry: "文学",
  poem: "文学",
  reading: "学校",
  book: "学校",
  library: "学校",
  exam: "学校",
  test: "学校",
  homework: "学校",
  graduation: "学校",
  university: "学校",
  college: "学校",
  student: "学校",
  teacher: "学校",
  class: "学校",
  classroom: "学校",
  lesson: "学校",
  course: "学校",
  degree: "学校",
  scholar: "学術",
  thesis: "学術",
  paper: "学術",
  journal: "学術",
  debate: "会話",
  speech: "会話",
  presentation: "仕事",
  interview_job: "仕事",
  job_search: "仕事",
  resume: "仕事",
  application: "仕事",
  promotion: "仕事",
  deadline: "仕事",
  task: "仕事",
  report: "仕事",
  review: "仕事",
  feedback: "仕事",
  morning_routine: "日常",
  evening_routine: "日常",
  commute: "交通",
  bus: "交通",
  train: "交通",
  subway: "交通",
  bicycle: "交通",
  walking: "交通",
  running: "スポーツ",
  gym_workout: "スポーツ",
  match: "スポーツ",
  race: "スポーツ",
  tournament: "スポーツ",
  championship: "スポーツ",
  team_sport: "スポーツ",
  // 追加マッピング（10+ 件）
  mindset: "哲学",
  manner: "日常",
  manners: "日常",
  logic: "学術",
  teamwork: "仕事",
  hospitality: "ビジネス",
  industry: "ビジネス",
  rules: "法律",
  plan: "ビジネス",
  situation: "日常",
  success: "日常",
  behavior: "感情",
  accident: "日常",
  money: "金融",
  service: "ビジネス",
  logistics: "ビジネス",
  training: "学校",
  attitude: "感情",
  analysis: "学術",
  facility: "日常",
  direction: "日常",
  conflict: "社会",
  problem: "日常",
  creativity: "芸術",
  repair: "日常",
  evidence: "学術",
  material: "日常",
  statistics: "学術",
  schedule: "仕事",
  personality: "感情",
  ceremony: "社交",
  "M&A": "ビジネス",
  document: "ビジネス",
  story: "文学",
  preference: "日常",
  occupation: "仕事",
  crowd: "日常",
  invitation: "社交",
  farewell: "挨拶",
  apology: "会話",
  challenge: "日常",
  outdoor: "自然",
  building: "日常",
  location: "日常",
  mail: "仕事",
  recruitment: "人事",
  instruction: "学校",
  talent: "日常",
  poverty: "社会",
  construction: "ビジネス",
  skill: "日常",
  housing: "家庭",
  expression: "会話",
  navigation: "技術",
  gardening: "趣味",
  goal: "日常",
  kindness: "感情",
  smell: "日常",
  leadership: "ビジネス",
  habit: "日常",
  competition: "スポーツ",
  view: "日常",
  curiosity: "感情",
  failure: "日常",
  reason: "日常",
  journalist: "報道",
  researcher: "研究",
  reform: "政治",
  legislation: "法律",
  freedom: "社会",
  workers: "職場",
  king: "歴史",
  army: "軍事",
  desire: "感情",
  past: "歴史",
  warning: "日常",
  gift: "社交",
  emergency: "日常",
  system: "技術",
  learning: "学校",
  // 複合語（同一ルール）
  "accounts receivable": "金融",
  "collect receivables": "金融",
  "outstanding receivable": "金融",
  "promotional offers": "ビジネス",
  "car towed": "交通",
  "tow vehicle": "交通",
  "truck tow": "交通",
  "zoom in": "技術",
  "zoom out": "技術",
  "zoom details": "技術",
  "undervalue work": "ビジネス",
  "undervalue skills": "ビジネス",
  "undervalue asset": "金融",
  "primary obligor": "金融",
  "joint obligor": "金融",
  "contingent obligor": "金融",
  "collateralize loan": "金融",
  "collateralize debt": "金融",
  "collateralize asset": "金融",
  "hypothecate property": "金融",
  "hypothecate asset": "金融",
  "legally hypothecate": "金融",
  "complete workbook": "学校",
  "workbook exercises": "学校",
  "workbook answers": "学校",
  "API設計": "技術", // 英日混在の唯一のケース
};

// レベル2: キーワードベース推定
function inferByKeyword(ctx) {
  const lc = ctx.toLowerCase();
  // office related
  if (/\b(office|meeting|colleague|boss|manager|employee|client|project|staff|department|memo|email)\b/.test(lc)) return "職場";
  // business
  if (/\b(business|corporate|company|firm|enterprise|sales|market|customer|revenue|profit|merger|acquisition|strategy|brand|branding|marketing|growth|investor|shareholder)\b/.test(lc)) return "ビジネス";
  // finance
  if (/\b(financ|bank|loan|debt|credit|tax|audit|budget|invest|fund|asset|liabilit|receivable|payable|accrual|collateral|hypothecate|mortgage|insurance|premium|equity|stock|bond|currency|fiscal)\b/.test(lc)) return "金融";
  // tech
  if (/\b(technolog|tech|software|hardware|comput|server|cloud|database|network|code|api|algorithm|devops|rest|saas|oop|ci|cd|automation|digital)\b/.test(lc)) return "技術";
  // medical
  if (/\b(medic|health|hospital|doctor|nurse|patient|therap|surger|vaccin|immun|disease|illness|drug|cpr|paramedic)\b/.test(lc)) return "医療";
  // legal
  if (/\b(law|legal|court|crime|police|justice|claim|plaintiff|defendant|prosecut|verdict|sentenc|jury|attorney|lawyer|statute|obligor|mediator|conviction|accusation)\b/.test(lc)) return "法律";
  // politics
  if (/\b(politic|government|president|senator|parliament|election|vote|democrac|constitution|nation|citizen)\b/.test(lc)) return "政治";
  // environment
  if (/\b(environ|pollut|climat|ecolog|sustainab|recycl|renewable|conservation|carbon|emission|forest)\b/.test(lc)) return "環境";
  // travel / transport
  if (/\b(travel|flight|airport|hotel|vacation|tourist|trip|journey|transport|traffic|car|vehicle|drive|train|subway|bus|sedan|towed|tow)\b/.test(lc)) return "旅行";
  // food / dining
  if (/\b(food|restaurant|cook|meal|dining|cuisine|chef|recipe|ingredient|flavor|taste|bbq|tea|coffee|snack|vend)\b/.test(lc)) return "食事";
  // education
  if (/\b(educat|school|student|teacher|class|lesson|exam|study|curriculum|university|academic|research|thesis|workbook)\b/.test(lc)) return "学校";
  // entertainment / leisure
  if (/\b(entertain|movie|film|tv|show|game|leisure|hobby|recreation|sauna|resort|suite)\b/.test(lc)) return "娯楽";
  // culture / arts
  if (/\b(art|music|literature|paint|sculpt|theater|novel|poetry|tradition|culture|heritage|museum)\b/.test(lc)) return "文化";
  // sports
  if (/\b(sport|athlet|football|baseball|basketball|tennis|golf|swim|race|team|championship)\b/.test(lc)) return "スポーツ";
  // nature
  if (/\b(nature|animal|plant|forest|river|ocean|mountain|weather|storm|rain|cloud|horse)\b/.test(lc)) return "自然";
  // social / community
  if (/\b(social|community|charity|volunteer|donat|activist|refugee|welfare|inequality|injust|society)\b/.test(lc)) return "社会";
  // conversation / phrases
  if (/\b(introduc|express|describ|transition|emphasiz|comment|phrase|statement|opinion|signal|highlight|suggest|ask|greet)\b/.test(lc)) return "会話";
  // spokesperson, showroom等の一般ビジネス用語
  if (/\b(spokesperson|showroom|storeroom|syndicate|penthouse)\b/.test(lc)) return "ビジネス";
  // spouse / family
  if (/\b(spouse|family|child|parent|wedding)\b/.test(lc)) return "家庭";
  // emotion
  if (/\b(emotion|feeling|angry|sad|happy|love|hate|fear|betray|wound)\b/.test(lc)) return "感情";
  // weather
  if (/\b(weather|rain|storm|flood|wind)\b/.test(lc)) return "天気";
  // 関係性
  if (/\b(relationship|friendship|dating)\b/.test(lc)) return "人間関係";
  return null;
}

// 単語の categories を日本語 context に変換
const CATEGORY_TO_LABEL = {
  business: "ビジネス",
  office: "職場",
  school: "学校",
  daily: "日常",
  travel: "旅行",
  shopping: "買い物",
  food: "食事",
  nature: "自然",
  health: "健康",
  sports: "スポーツ",
  communication: "会話",
  technology: "技術",
  finance: "金融",
  culture: "文化",
  emotion: "感情",
  art: "芸術",
  music: "音楽",
  family: "家庭",
  hobby: "趣味",
  weather: "天気",
};

function resolveJpContext(ctx, wordCategories = []) {
  // 1. 直接マッピング
  if (DIRECT_MAP[ctx]) return DIRECT_MAP[ctx];
  // 2. キーワード推定
  const inferred = inferByKeyword(ctx);
  if (inferred) return inferred;
  // 3. 単語の主カテゴリから推定
  for (const cat of wordCategories) {
    if (CATEGORY_TO_LABEL[cat]) return CATEGORY_TO_LABEL[cat];
  }
  // 4. フォールバック
  return "日常";
}

const hasJp = /[ぁ-んァ-ヶ一-龯]/;
const hasEn = /[a-zA-Z]/;

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
let updated = 0;
const byResult = {};
const unmapped = new Map(); // フォールバックにしか行けなかった元文字列 → 出現件数

for (const lv of levels) {
  const filePath = path.join(MASTER_DIR, `level-${lv}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let changed = false;

  for (const word of data) {
    for (const ex of word.examples) {
      const c = ex.context ?? "";
      if (!c) continue;
      // 英語のみ（または英日混在）の context を対象
      const jpOnly = hasJp.test(c) && !hasEn.test(c);
      if (jpOnly) continue;

      const jp = resolveJpContext(c, word.categories);
      if (jp === "日常" && !DIRECT_MAP[c]) {
        unmapped.set(c, (unmapped.get(c) || 0) + 1);
      }
      ex.context = jp;
      byResult[jp] = (byResult[jp] || 0) + 1;
      updated++;
      changed = true;
    }
  }

  if (changed && !dryRun) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    console.log(`Updated: ${path.basename(filePath)}`);
  }
}

console.log("\n=== Summary ===");
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Updated entries: ${updated}`);
console.log(`Fallback (日常) used on unmapped: ${unmapped.size} unique strings`);

console.log("\n=== Result distribution ===");
Object.entries(byResult)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${v.toString().padStart(5)} : ${k}`));

if (reportUnmapped && unmapped.size > 0) {
  console.log("\n=== Unmapped (fallback to 日常) top 80 ===");
  [...unmapped.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 80)
    .forEach(([k, v]) => console.log(`  ${v.toString().padStart(4)} : ${k}`));
}
