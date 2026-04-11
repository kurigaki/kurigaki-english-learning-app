#!/usr/bin/env node
// T-VQS-035: 中1基礎語（be動詞・代名詞・助動詞）を新規 MasterWord として追加
//
// 追加対象 24 語:
//   be動詞:  am, is, are, was, were
//   代名詞:  I, you, he, she, we, they
//   所有格:  my, your, his, her, its, our, their
//   助動詞:  can(verb), cannot, does, did, has, had
//
// ID 割当:
//   level-a1.json の末尾に追加（1154〜1177）
//   アルファベット順の並びは一時的に崩れるが、Phase 4 で一括再ソート予定
//
// 所属コース:
//   junior:1 (tier1) / eiken:5 (tier1) / conversation:a1 (tier1)
//   be動詞の一部は eiken:4 にも所属させる

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");
const A1_PATH = path.join(MASTER_DIR, "level-a1.json");

const dryRun = process.argv.includes("--dry");

// 共通: junior:1 / eiken:5 / conversation:a1 の3コースに tier1 で所属
const BASIC_COURSES = [
  { course: "junior", stage: "1", tier: 1 },
  { course: "eiken", stage: "5", tier: 1 },
  { course: "conversation", stage: "a1", tier: 1 },
];

const DAILY = ["daily"];
const COMM = ["communication"];

function entry(id, word, meaning, partOfSpeech, examples, categories = DAILY, courses = BASIC_COURSES) {
  return {
    id,
    word,
    meaning,
    partOfSpeech,
    examples,
    categories,
    frequencyTier: 1,
    courses,
  };
}

function ex(en, ja, context) {
  return { en, ja, context };
}

// ID は level-a1.json の末尾から 1154 以降を使う（実行時に計算）

const NEW_WORDS_DATA = [
  // --- be動詞 ---
  {
    word: "am",
    meaning: "〜です・いる（主語が I のとき）",
    pos: "verb",
    cats: DAILY,
    examples: [
      ex("I am a student.", "私は学生です。", "自己紹介"),
      ex("I am happy today.", "私は今日うれしいです。", "日常"),
      ex("I am from Japan.", "私は日本出身です。", "自己紹介"),
    ],
  },
  {
    word: "is",
    meaning: "〜です・いる（主語が三人称単数のとき）",
    pos: "verb",
    cats: DAILY,
    examples: [
      ex("She is my sister.", "彼女は私の姉です。", "家庭"),
      ex("This is my book.", "これは私の本です。", "学校"),
      ex("He is a teacher.", "彼は先生です。", "学校"),
    ],
  },
  {
    word: "are",
    meaning: "〜です・いる（主語が you/複数のとき）",
    pos: "verb",
    cats: DAILY,
    examples: [
      ex("You are my friend.", "あなたは私の友達です。", "会話"),
      ex("We are in the same class.", "私たちは同じクラスです。", "学校"),
      ex("They are very kind.", "彼らはとても親切です。", "日常"),
    ],
  },
  {
    word: "was",
    meaning: "〜でした・いた（is / am の過去形）",
    pos: "verb",
    cats: DAILY,
    examples: [
      ex("I was tired yesterday.", "私は昨日疲れていました。", "日常"),
      ex("She was a nurse.", "彼女は看護師でした。", "仕事"),
      ex("The movie was fun.", "その映画は楽しかったです。", "日常"),
    ],
  },
  {
    word: "were",
    meaning: "〜でした・いた（are の過去形）",
    pos: "verb",
    cats: DAILY,
    examples: [
      ex("You were right.", "あなたは正しかったです。", "会話"),
      ex("We were at home.", "私たちは家にいました。", "家庭"),
      ex("They were busy last week.", "彼らは先週忙しかったです。", "日常"),
    ],
  },

  // --- 主格代名詞 ---
  {
    word: "I",
    meaning: "私・私は（主格）",
    pos: "other",
    cats: COMM,
    examples: [
      ex("I like music.", "私は音楽が好きです。", "会話"),
      ex("I go to school every day.", "私は毎日学校に行きます。", "学校"),
      ex("I have a dog.", "私は犬を飼っています。", "家庭"),
    ],
  },
  {
    word: "you",
    meaning: "あなた・あなたたち",
    pos: "other",
    cats: COMM,
    examples: [
      ex("You are kind.", "あなたは親切です。", "会話"),
      ex("Do you like pizza?", "あなたはピザが好きですか？", "会話"),
      ex("Thank you very much.", "どうもありがとうございます。", "挨拶"),
    ],
  },
  {
    word: "he",
    meaning: "彼・彼は",
    pos: "other",
    cats: COMM,
    examples: [
      ex("He is my brother.", "彼は私の兄です。", "家庭"),
      ex("He plays soccer well.", "彼はサッカーが上手です。", "スポーツ"),
      ex("He lives in Tokyo.", "彼は東京に住んでいます。", "日常"),
    ],
  },
  {
    word: "she",
    meaning: "彼女・彼女は",
    pos: "other",
    cats: COMM,
    examples: [
      ex("She is very smart.", "彼女はとても賢いです。", "学校"),
      ex("She likes flowers.", "彼女は花が好きです。", "日常"),
      ex("She sings beautifully.", "彼女は美しく歌います。", "音楽"),
    ],
  },
  {
    word: "we",
    meaning: "私たち・私たちは",
    pos: "other",
    cats: COMM,
    examples: [
      ex("We are classmates.", "私たちはクラスメートです。", "学校"),
      ex("We play baseball after school.", "私たちは放課後に野球をします。", "スポーツ"),
      ex("We love animals.", "私たちは動物が大好きです。", "日常"),
    ],
  },
  {
    word: "they",
    meaning: "彼ら・彼女ら・それら",
    pos: "other",
    cats: COMM,
    examples: [
      ex("They are my best friends.", "彼らは私の親友です。", "会話"),
      ex("They live near the park.", "彼らは公園の近くに住んでいます。", "日常"),
      ex("They are new students.", "彼らは新入生です。", "学校"),
    ],
  },

  // --- 所有格 ---
  {
    word: "my",
    meaning: "私の",
    pos: "other",
    cats: COMM,
    examples: [
      ex("This is my bag.", "これは私のかばんです。", "学校"),
      ex("My sister is a nurse.", "私の姉は看護師です。", "家庭"),
      ex("My name is Ken.", "私の名前はケンです。", "自己紹介"),
    ],
  },
  {
    word: "your",
    meaning: "あなたの・あなたたちの",
    pos: "other",
    cats: COMM,
    examples: [
      ex("What is your name?", "あなたの名前は何ですか？", "自己紹介"),
      ex("I like your dress.", "私はあなたの服が好きです。", "会話"),
      ex("Is this your pen?", "これはあなたのペンですか？", "学校"),
    ],
  },
  {
    word: "his",
    meaning: "彼の・彼のもの",
    pos: "other",
    cats: COMM,
    examples: [
      ex("His car is red.", "彼の車は赤いです。", "日常"),
      ex("That is his guitar.", "あれは彼のギターです。", "音楽"),
      ex("I know his father.", "私は彼のお父さんを知っています。", "家庭"),
    ],
  },
  {
    word: "her",
    meaning: "彼女の・彼女を",
    pos: "other",
    cats: COMM,
    examples: [
      ex("This is her notebook.", "これは彼女のノートです。", "学校"),
      ex("I saw her at the park.", "私は公園で彼女を見ました。", "日常"),
      ex("Her voice is beautiful.", "彼女の声は美しいです。", "音楽"),
    ],
  },
  {
    word: "its",
    meaning: "それの・その",
    pos: "other",
    cats: COMM,
    examples: [
      ex("The dog wags its tail.", "犬はその尻尾を振ります。", "日常"),
      ex("The cat drinks its milk.", "猫はその牛乳を飲みます。", "家庭"),
      ex("The bird opens its wings.", "その鳥は翼を広げます。", "自然"),
    ],
  },
  {
    word: "our",
    meaning: "私たちの",
    pos: "other",
    cats: COMM,
    examples: [
      ex("Our school is big.", "私たちの学校は大きいです。", "学校"),
      ex("This is our classroom.", "ここは私たちの教室です。", "学校"),
      ex("Our team won the game.", "私たちのチームは試合に勝ちました。", "スポーツ"),
    ],
  },
  {
    word: "their",
    meaning: "彼らの・彼女らの",
    pos: "other",
    cats: COMM,
    examples: [
      ex("Their house is new.", "彼らの家は新しいです。", "日常"),
      ex("I met their parents.", "私は彼らの両親に会いました。", "家庭"),
      ex("This is their dog.", "これは彼らの犬です。", "家庭"),
    ],
  },

  // --- 助動詞・一般動詞活用 ---
  {
    word: "can",
    meaning: "〜できる（可能・許可）",
    pos: "verb",
    cats: COMM,
    examples: [
      ex("I can swim.", "私は泳げます。", "スポーツ"),
      ex("Can you help me?", "手伝ってもらえますか？", "会話"),
      ex("She can speak English.", "彼女は英語を話せます。", "学校"),
    ],
  },
  {
    word: "cannot",
    meaning: "〜できない（can の否定）",
    pos: "other",
    cats: COMM,
    examples: [
      ex("I cannot find my key.", "私は鍵が見つかりません。", "日常"),
      ex("He cannot come today.", "彼は今日来られません。", "会話"),
      ex("We cannot stay here.", "私たちはここにいられません。", "日常"),
    ],
  },
  {
    word: "does",
    meaning: "する・行う（do の三人称単数現在形）",
    pos: "verb",
    cats: COMM,
    examples: [
      ex("She does her homework every day.", "彼女は毎日宿題をします。", "学校"),
      ex("Does he like music?", "彼は音楽が好きですか？", "会話"),
      ex("What does this word mean?", "この単語はどういう意味ですか？", "学校"),
    ],
  },
  {
    word: "did",
    meaning: "した・行った（do の過去形）",
    pos: "verb",
    cats: COMM,
    examples: [
      ex("I did my best.", "私は最善を尽くしました。", "会話"),
      ex("Did you see the movie?", "あなたはその映画を見ましたか？", "会話"),
      ex("She did not come.", "彼女は来ませんでした。", "日常"),
    ],
  },
  {
    word: "has",
    meaning: "持っている・食べる（have の三人称単数現在形）",
    pos: "verb",
    cats: DAILY,
    examples: [
      ex("She has a blue car.", "彼女は青い車を持っています。", "日常"),
      ex("He has breakfast at seven.", "彼は7時に朝食を食べます。", "家庭"),
      ex("This book has many pictures.", "この本には絵がたくさんあります。", "学校"),
    ],
  },
  {
    word: "had",
    meaning: "持っていた・食べた（have の過去形）",
    pos: "verb",
    cats: DAILY,
    examples: [
      ex("I had a good time yesterday.", "私は昨日楽しい時間を過ごしました。", "日常"),
      ex("She had lunch at noon.", "彼女は正午に昼食を食べました。", "家庭"),
      ex("We had a party last night.", "私たちは昨夜パーティーを開きました。", "社交"),
    ],
  },
];

// -------- メイン処理 --------

const data = JSON.parse(fs.readFileSync(A1_PATH, "utf-8"));
const existingIds = new Set(data.map((w) => w.id));
const existingWords = new Set(data.map((w) => w.word.toLowerCase()));

// 最大 ID の次から割り当て
const maxId = Math.max(...data.map((w) => w.id));
let nextId = maxId + 1;

// 重複チェック
const duplicates = [];
for (const nw of NEW_WORDS_DATA) {
  if (existingWords.has(nw.word.toLowerCase())) {
    duplicates.push(nw.word);
  }
}
if (duplicates.length > 0) {
  console.error("Error: These words already exist as level-a1 entries:", duplicates.join(", "));
  console.error("Consider adding CourseAssignment instead.");
  process.exit(1);
}

const newEntries = [];
for (const nw of NEW_WORDS_DATA) {
  newEntries.push(
    entry(
      nextId++,
      nw.word,
      nw.meaning,
      nw.pos,
      nw.examples,
      nw.cats,
      BASIC_COURSES,
    ),
  );
}

console.log(`Adding ${newEntries.length} new MasterWord entries to level-a1.json`);
console.log(`ID range: ${newEntries[0].id} - ${newEntries[newEntries.length - 1].id}`);

if (!dryRun) {
  data.push(...newEntries);
  fs.writeFileSync(A1_PATH, JSON.stringify(data, null, 2) + "\n");
  console.log(`Updated: level-a1.json (${data.length} total entries)`);
} else {
  console.log("(DRY-RUN — no changes applied)");
  console.log("\nFirst 3 entries preview:");
  for (const e of newEntries.slice(0, 3)) {
    console.log(JSON.stringify(e, null, 2));
  }
}
