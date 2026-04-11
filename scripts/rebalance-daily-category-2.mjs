#!/usr/bin/env node
// T-VQS-051: daily 単一カテゴリ語の第2カテゴリ付与（第2弾）
//
// T-VQS-033 で 89 語を付与後、残り 3,119 語に対してより広いヒューリスティック
// を適用する。前回より対応カテゴリを増やし、business/office/school/communication/
// opinion/hobby などの抽象カテゴリも追加する。
//
// 保守的ポリシーは維持:
//   - 複合語・熟語のみマッチ（単漢字マッチ禁止）
//   - 「・」で 3 つ以上の意味を持つ多義語はスキップ
//   - idempotent: 既に該当カテゴリがあればスキップ

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DIR = path.join(__dirname, "..", "src", "data", "words", "master");

const dryRun = process.argv.includes("--dry");
const verbose = process.argv.includes("--verbose");

const RULES = [
  {
    category: "school",
    patterns: [
      /(学校|授業|教師|先生|教員|生徒|学生|教育|教科|宿題|試験|受験|講義|教科書|卒業|入学|学期|履修|講座|大学|小学|中学|高校)/,
      /(学ぶ|学習|勉強|教える|指導|暗記|復習|予習|出席|欠席)/,
      /(学問|学術|研究|論文|修士|博士|学位|奨学)/,
    ],
  },
  {
    category: "communication",
    patterns: [
      /(挨拶|会話|発言|発表|話し合い|伝える|伝言|伝達|連絡する|連絡事項|発信|発信する)/,
      /(尋ねる|質問する|問いかける|返答|回答する|受け答え|応答)/,
      /(案内|案内する|報告する|説明する|指示する|助言|忠告)/,
      /(対話|討論|議論|議会|演説|講演|会見)/,
      /(手紙|便り|電報|電話する|通話|通知する)/,
    ],
  },
  {
    category: "opinion",
    patterns: [
      /(意見|見解|考え方|判断|決断|結論|主張|論点|論拠)/,
      /(賛成|反対|同意|不同意|支持|否定|肯定)/,
      /(疑問|疑念|確信|信念|理論|原理|根拠|理由|論理)/,
      /(解釈|分析|評価|批判|批評|反論|反駁)/,
      /(思想|哲学|倫理|道徳|正義|価値観)/,
    ],
  },
  {
    category: "business",
    patterns: [
      /(会議|商談|契約|交渉|取引|営業|販売する|売上|顧客|競合|市場)/,
      /(ビジネス|企業|会社|経営|経済|産業|業界|業種)/,
      /(成果|目標|戦略|方針|計画書|業績|収益|売上高)/,
      /(広告|宣伝|マーケティング|プロモーション|キャンペーン)/,
      /(採用|求人|面接|人事|給与|賃金|昇進|昇給)/,
      /(発注|受注|納品|請求書|領収書|発送|配送業者)/,
    ],
  },
  {
    category: "office",
    patterns: [
      /(事務所|オフィス|職場|会議室|応接室|受付)/,
      /(書類|文書|申請書|届け出|提出|承認|決裁|押印|捺印)/,
      /(ファイル|フォルダ|アーカイブ|クリップ|ホッチキス|付箋)/,
      /(電子メール|メール|メッセージ|添付|添付ファイル|CC|BCC)/,
      /(プリンター|印刷機|コピー機|スキャナー|シュレッダー)/,
      /(同僚|上司|部下|先輩|後輩|部長|課長|係長|役職)/,
    ],
  },
  {
    category: "hobby",
    patterns: [
      /(趣味|娯楽|余暇|レジャー|レクリエーション)/,
      /(遊ぶ|遊び場|お楽しみ|暇つぶし|息抜き)/,
      /(映画鑑賞|読書|ゲーム|ボードゲーム|テレビゲーム|ビデオゲーム)/,
      /(カメラ|写真撮影|絵画|スケッチ|楽器演奏)/,
      /(コレクション|コレクター|マニア|愛好家|愛好者)/,
    ],
  },
  {
    category: "family",
    patterns: [
      /(夫婦|新郎|新婦|花嫁|花婿|婚約者)/,
      /(実家|生家|故郷|帰省|親孝行|親元)/,
      /(養子|養女|里親|里子)/,
    ],
  },
  {
    category: "health",
    patterns: [
      /(呼吸器|循環器|消化器|免疫|免疫系)/,
      /(アレルギー|花粉症|糖尿病|高血圧|喘息)/,
      /(リハビリ|理学療法|作業療法|運動療法)/,
      /(医学|看護|外科|内科|歯科|小児科|産科|婦人科)/,
      /(診療所|病院|病棟|救急車|救急外来)/,
    ],
  },
  {
    category: "finance",
    patterns: [
      /(資金調達|資本金|資金繰り|キャッシュフロー)/,
      /(投資家|株主|配当|利回り|収益率)/,
      /(融資する|貸し付け|借り入れ|担保|抵当)/,
      /(破産|倒産|清算|買収|合併)/,
    ],
  },
  {
    category: "technology",
    patterns: [
      /(オンライン|ウェブサイト|ウェブページ|ホームページ|サイト)/,
      /(サーバー|クラウド|ストレージ|バックアップ)/,
      /(プログラマー|エンジニア|開発者|コーダー)/,
      /(バグ|エラー|デバッグ|テスト駆動|デプロイ)/,
      /(セキュリティ|暗号|認証|パスワード|ログイン|ログアウト)/,
    ],
  },
  {
    category: "nature",
    patterns: [
      /(生き物|野生生物|絶滅危惧|生物多様性)/,
      /(氷河|氷山|極地|熱帯|温帯|亜寒帯)/,
      /(地震|津波|火山|噴火|洪水|干ばつ)/,
      /(岩石|鉱物|化石|地層|地質)/,
    ],
  },
  {
    category: "travel",
    patterns: [
      /(観光客|旅行者|ツアー客|バックパッカー)/,
      /(旅費|交通費|滞在費|宿泊費)/,
      /(乗客|運転手|車掌|客室乗務員|機長|船長)/,
      /(国境|検疫|税関申告|出入国|査証|滞在許可)/,
      /(温泉|露天風呂|宿坊|民宿|ペンション)/,
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
    if (w.categories.length !== 1 || w.categories[0] !== "daily") continue;
    const newCat = classify(w);
    if (!newCat) continue;
    w.categories.push(newCat);
    touched++;
    perCategory[newCat] = (perCategory[newCat] || 0) + 1;
    if (!samples[newCat]) samples[newCat] = [];
    if (samples[newCat].length < 10) {
      samples[newCat].push(`${w.word} — ${w.meaning.slice(0, 30)}`);
    }
    changedLevels.add(lv);
  }
}

console.log("=== Summary ===");
console.log(`Mode: ${dryRun ? "DRY-RUN" : "APPLIED"}`);
console.log(`Added secondary category: ${touched}`);
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
