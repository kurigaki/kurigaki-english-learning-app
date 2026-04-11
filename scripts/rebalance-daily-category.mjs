#!/usr/bin/env node
// T-VQS-033: daily 単一カテゴリ語に第2カテゴリをヒューリスティックで付与
//
// 背景:
//   daily=7,509 語と偏重しており、うち 3,208 語は daily 単一。
//   カテゴリフィルタで探しても出てこない語が多数。
//
// アプローチ（保守的・精度優先）:
//   meaning（日本語訳）ベースで「確実にマッチする」複合語のみ付与。
//   単漢字マッチは禁止（例: 「月」は「8月」にマッチしてしまうため NG）。
//   多義語（「・」で 3 つ以上の意味を持つ語）はスキップ（文脈依存のため）。
//   daily は残したまま第 2 カテゴリを追加（非破壊的）。
//
// ポリシー: 1 語につき categories は 3 個まで（本タスクは第 2 を追加のみ）

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const dryRun = process.argv.includes("--dry");
const verbose = process.argv.includes("--verbose");

// meaning 日本語ベースのマッチルール（優先度順）
// 原則: 2 文字以上の複合語・熟語のみ。単漢字マッチ禁止。
const RULES = [
  {
    category: "health",
    patterns: [
      /(病気|疾患|症状|診断|治療|医療|医者|医師|看護師|看護|患者|診察|入院|退院|手術|救急|救命|介護|衛生|感染症|ウイルス|細菌|ワクチン|予防接種|薬|錠剤|処方)/,
      /(健康|不健康)/,
      /(筋肉|血液|血管|心臓|肺|肝臓|腎臓|神経|皮膚|骨折|怪我|負傷|火傷|出血)/,
      /(身体|肉体|全身|半身)/,
      /(疲労|睡眠|不眠|安静|休息)/,
      /(栄養|ビタミン|カロリー|肥満|ダイエット|体重)/,
      /(目の不自由|耳の不自由|口の不自由)/,
    ],
  },
  {
    category: "food",
    patterns: [
      /(食事|料理|調理|食材|食品|食物|食卓|食堂|食欲)/,
      /(野菜|果物|乳製品|チーズ|バター|ヨーグルト|牛乳|パン屋)/,
      /(朝食|昼食|夕食|ランチ|ディナー|デザート|お菓子|スナック|おやつ|ケーキ|クッキー|チョコレート|アイスクリーム)/,
      /(コーヒー|紅茶|ジュース|ワイン|ビール|アルコール|炭酸飲料)/,
      /(砂糖|胡椒|醤油|味噌|スパイス|調味料|出汁|ソース|ドレッシング)/,
      /(焼く・|煮る・|炒める|揚げる|蒸す)/,
      /(レストラン|カフェ|喫茶店|居酒屋|食堂|キッチン|台所)/,
    ],
  },
  {
    category: "family",
    patterns: [
      /(家族|親族|親戚|両親|父親|母親|兄弟|姉妹|息子|娘|孫|祖父|祖母|叔父|叔母|いとこ|甥|姪|配偶者|婚約)/,
      /(結婚式|離婚|新郎|新婦)/,
      /(育児|子育て|赤ちゃん|幼児|妊娠|出産)/,
    ],
  },
  {
    category: "travel",
    patterns: [
      /(旅行|観光|ツアー|出張|旅先|旅立ち)/,
      /(空港|飛行機|航空|搭乗|離陸|着陸|フライト|ターミナル)/,
      /(電車|列車|新幹線|地下鉄|路線|鉄道|改札|運賃)/,
      /(自動車|タクシー|自転車|エンジン|燃料|ガソリン|運転|駐車|車庫)/,
      /(高速道路|幹線道路|歩道|車線|交差点|信号機)/,
      /(ホテル|宿泊|チェックイン)/,
      /(パスポート|ビザ|税関|出国|入国)/,
      /(名所|景色|絶景|観光地)/,
    ],
  },
  {
    category: "nature",
    patterns: [
      /(自然|大自然|生態系|生息地|野生動物)/,
      /(山脈|川岸|海岸|湖畔|池|滝|渓谷|丘陵|森林|草原|砂漠|島|湾|岬|洞窟)/,
      /(花びら|芝生|苔|種子|若葉|落葉|新芽)/,
      /(哺乳類|爬虫類|両生類|昆虫|鳥類|魚類)/,
      /(大雨|小雨|豪雨|梅雨|雨天|大雪|吹雪|濃霧|嵐|台風|雹|虹|雷雨)/,
      /(太陽|星|宇宙|地球|惑星|銀河)/,
      /(気候|気温|季節|天気|気象)/,
      /(環境|汚染|公害)/,
    ],
  },
  {
    category: "emotion",
    patterns: [
      /(感情|気持ち|心情|感動|興奮|緊張)/,
      /(喜び|悲しみ|怒り|恐怖|不安|心配|安心|満足|不満|失望|後悔|羞恥|嫉妬|憧れ)/,
      /(希望|絶望|期待外れ|諦め)/,
      /(嬉しい|楽しい|悲しい|寂しい|怖い|恐ろしい)/,
      /(機嫌|気分|やる気)/,
    ],
  },
  {
    category: "sports",
    patterns: [
      /(スポーツ|競技|試合|大会|選手権|オリンピック|リーグ|トーナメント)/,
      /(野球|サッカー|テニス|バスケットボール|バレーボール|ラグビー|ゴルフ|水泳|陸上|マラソン|ボクシング|柔道|剣道|空手|相撲)/,
      /(優勝|準優勝|得点|失点|ホームラン)/,
      /(トレーニング|ウォーミングアップ)/,
      /(スタジアム|競技場|グラウンド|体育館)/,
    ],
  },
  {
    category: "finance",
    patterns: [
      /(金融|銀行|口座|預金|貯金|融資|ローン|借金|貸付|利子|利息|金利)/,
      /(投資|株式|株価|証券|債券|為替|外貨|両替|通貨)/,
      /(税金|課税|納税|徴収|関税|消費税|所得税|法人税)/,
      /(保険|年金)/,
      /(予算|財政|歳入|歳出|赤字|黒字|損失|経費)/,
      /(送金|振込|決済|精算|返金|返済)/,
    ],
  },
  {
    category: "shopping",
    patterns: [
      /(買い物|ショッピング)/,
      /(売り場|売店|スーパーマーケット|コンビニ|デパート|百貨店|商店街|ショッピングモール)/,
      /(在庫|陳列)/,
      /(定価|割引|セール|バーゲン|値引き|半額)/,
      /(レジ袋|ショッピングカート|包装紙|ラッピング)/,
      /(配達|配送|宅配)/,
    ],
  },
  {
    category: "technology",
    patterns: [
      /(技術|科学技術|ハイテク|情報技術|デジタル)/,
      /(コンピュータ|パソコン|サーバー)/,
      /(ソフトウェア|アプリ|プログラム|システム|データベース)/,
      /(インターネット|ネットワーク|オンライン|回線)/,
      /(スマートフォン|スマホ|携帯電話|タブレット)/,
      /(人工知能|機械学習|ロボット|自動化)/,
      /(プログラミング|コーディング|アルゴリズム)/,
      /(ディスプレイ|モニター|スクリーン|キーボード)/,
    ],
  },
  {
    category: "culture",
    patterns: [
      /(文化|伝統|風習|慣例|儀式|儀礼|祭り|祭典|年中行事)/,
      /(宗教|信仰|教会|神社|聖堂|モスク|礼拝)/,
      /(芸術|美術|絵画|彫刻|陶芸|書道|工芸)/,
      /(音楽|楽器|演奏|合唱)/,
      /(映画|演劇|舞台|オペラ|バレエ|舞踊)/,
      /(文学|小説|詩歌|俳句|短歌|物語)/,
      /(博物館|美術館|図書館|劇場)/,
    ],
  },
];

// -------- マスター処理 --------
const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
const masterFiles = {};
for (const lv of levels) {
  masterFiles[lv] = {
    path: path.join(MASTER_DIR, `level-${lv}.json`),
    data: JSON.parse(fs.readFileSync(path.join(MASTER_DIR, `level-${lv}.json`), "utf-8")),
  };
}

function classify(word) {
  // 多義語（「・」で 3 つ以上の意味）はスキップ（文脈依存のため）
  const senses = word.meaning.split("・").length;
  if (senses >= 3) return null;

  const hay = word.meaning;
  for (const rule of RULES) {
    for (const p of rule.patterns) {
      if (p.test(hay)) return rule.category;
    }
  }
  return null;
}

let touched = 0;
const perCategory = {};
const samples = {};
const changedLevels = new Set();

for (const lv of levels) {
  for (const w of masterFiles[lv].data) {
    // daily 単一カテゴリのみ対象
    if (w.categories.length !== 1 || w.categories[0] !== "daily") continue;
    const newCat = classify(w);
    if (!newCat) continue;

    w.categories.push(newCat);
    touched++;
    perCategory[newCat] = (perCategory[newCat] || 0) + 1;
    if (!samples[newCat]) samples[newCat] = [];
    if (samples[newCat].length < 12) {
      samples[newCat].push(`${w.word} — ${w.meaning.slice(0, 30)}`);
    }
    changedLevels.add(lv);
  }
}

console.log("=== Summary ===");
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Added secondary category: ${touched} words`);
console.log("\nBy category:");
for (const [cat, n] of Object.entries(perCategory).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: +${n}`);
}

if (verbose) {
  console.log("\nSamples:");
  for (const [cat, list] of Object.entries(samples)) {
    console.log(`  [${cat}]`);
    for (const s of list) console.log(`    - ${s}`);
  }
}

// 残りの daily-only
const remainingDailyOnly = levels
  .flatMap((lv) => masterFiles[lv].data)
  .filter((w) => w.categories.length === 1 && w.categories[0] === "daily").length;
console.log(`\nRemaining daily-only: ${remainingDailyOnly}`);

if (!dryRun) {
  for (const lv of changedLevels) {
    fs.writeFileSync(masterFiles[lv].path, JSON.stringify(masterFiles[lv].data, null, 2) + "\n");
    console.log(`Updated: level-${lv}.json`);
  }
}
