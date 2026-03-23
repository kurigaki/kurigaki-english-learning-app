#!/usr/bin/env node
/**
 * モチタン英語辞典 スクレイピングスクリプト
 *
 * Puppeteerでモチタンの各コースページから単語データを取得し、
 * JSONファイルに保存する。
 *
 * Usage:
 *   node scripts/motitown/scrape.mjs                    # 全コース
 *   node scripts/motitown/scrape.mjs --course junior     # juniorのみ
 *   node scripts/motitown/scrape.mjs --course eiken --stage 5  # 英検5級のみ
 *
 * 必要パッケージ: puppeteer (自動インストール)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { PAGE_MAP, DATA_DIR } from "./config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const OUT_DIR = join(ROOT, DATA_DIR);

// --- CLI引数パース ---
const args = process.argv.slice(2);
const courseFilter = args.includes("--course") ? args[args.indexOf("--course") + 1] : null;
const stageFilter = args.includes("--stage") ? args[args.indexOf("--stage") + 1] : null;

// --- Puppeteer動的import ---
async function getPuppeteer() {
  try {
    return await import("puppeteer");
  } catch {
    console.log("puppeteer が見つかりません。インストールします...");
    const { execSync } = await import("child_process");
    execSync("npm install --no-save puppeteer", { cwd: ROOT, stdio: "inherit" });
    return await import("puppeteer");
  }
}

// --- ページ内の単語カードを抽出する関数（ブラウザ側で実行） ---
function extractWordCards() {
  return [...document.querySelectorAll("article.word-card")].map((card) => {
    const id = card.getAttribute("data-id") || "";
    const importance = card.getAttribute("data-importance") || "";
    const index =
      card.querySelector(".word-card__index")?.textContent?.trim() || "";
    const word =
      card.querySelector(".word-card__english a")?.textContent?.trim() || "";
    const pronunciation =
      card.querySelector(".word-card__pronunciation")?.textContent?.trim() ||
      "";
    const audio =
      card.querySelector(".word-card__sound")?.getAttribute("data-audio") || "";
    const image =
      card.querySelector(".word-card__image")?.getAttribute("src") || "";

    const pos =
      card.querySelector(".word-card__part-of-speech")?.textContent?.trim() ||
      "";
    const meaning =
      card.querySelector(".word-card__translation")?.textContent?.trim() || "";

    const exampleEn =
      card
        .querySelector(".word-card__example-en")
        ?.textContent?.replace("(例)", "")
        ?.trim() || "";
    const exampleJa =
      card.querySelector(".word-card__example-ja")?.textContent?.trim() || "";

    const coreImage =
      card
        .querySelector(".word-card__core-image")
        ?.textContent?.replace("(コア)", "")
        ?.trim() || "";

    const usage = [...card.querySelectorAll(".word-card__phrase")]
      .map((phrase) => {
        const en =
          phrase
            .querySelector(".word-card__phrase-text")
            ?.textContent?.trim() || "";
        const ja =
          phrase
            .querySelector(".word-card__phrase-translation")
            ?.textContent?.trim() || "";
        if (!en && !ja) return "";
        return `${en}=${ja}`.trim();
      })
      .filter(Boolean)
      .join(" / ");

    const antonymEl = card.querySelector(".word-card__antonym");
    const antonymWord =
      antonymEl
        ?.querySelector(".word-card__antonym-word")
        ?.textContent?.trim() || "";
    const antonymPos =
      antonymEl
        ?.querySelector(".word-card__antonym-pos")
        ?.textContent?.trim() || "";
    const antonymMeaning =
      antonymEl
        ?.querySelector(".word-card__antonym-meaning")
        ?.textContent?.trim() || "";

    return {
      motiId: id,
      importance,
      index,
      word,
      pronunciation,
      audio,
      image,
      pos,
      meaning,
      exampleEn,
      exampleJa,
      coreImage,
      usage,
      antonymWord,
      antonymPos,
      antonymMeaning,
    };
  });
}

// --- ページネーション: 総ページ数を取得 ---
async function getTotalPages(page) {
  return page.evaluate(() => {
    const links = document.querySelectorAll(".pagination-top .pagination__link");
    return links.length || 1;
  });
}

// --- ページネーション: 指定ページに移動（SPA方式） ---
async function goToPage(page, pageIndex) {
  // pageIndex は 0-based（pagination__link の index）
  await page.evaluate((idx) => {
    const links = document.querySelectorAll(".pagination-top .pagination__link");
    if (links[idx]) {
      links[idx].removeAttribute("href");
      links[idx].click();
    }
  }, pageIndex);
  await new Promise((r) => setTimeout(r, 2000));
}

// --- 「もっと見る」ボタンによる全件読み込み ---
async function loadAllCards(page) {
  let prevCount = 0;
  let retries = 0;
  const MAX_RETRIES = 3;

  while (retries < MAX_RETRIES) {
    const currentCount = await page.evaluate(
      () => document.querySelectorAll("article.word-card").length
    );

    if (currentCount === prevCount) {
      // 「もっと見る」ボタンを探してクリック
      const loadMore = await page.evaluateHandle(() => {
        // CSSセレクタで探す
        const btn = document.querySelector('button.load-more, a.load-more, [data-action="load-more"]');
        if (btn) return btn;
        // テキスト内容で探す
        const buttons = [...document.querySelectorAll("button, a")];
        return buttons.find((el) => el.textContent?.includes("もっと見る") || el.textContent?.includes("次へ")) || null;
      });
      if (loadMore && (await loadMore.evaluate((el) => !!el))) {
        await loadMore.click();
        await new Promise((r) => setTimeout(r, 2000));
        retries = 0;
      } else {
        // スクロールで追加読み込みを試す
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight)
        );
        await new Promise((r) => setTimeout(r, 1500));
        retries++;
      }
    } else {
      prevCount = currentCount;
      retries = 0;
    }
  }

  return prevCount;
}

// --- 1ページをスクレイプ ---
async function scrapePage(page, entry) {
  const { url, course, stage } = entry;
  console.log(`\n📖 ${course}/${stage}: ${url}`);

  const allWords = [];
  let pageNum = 1;

  // 最初のページにアクセス（タイムアウト延長）
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  // カードが読み込まれるまで待機
  try {
    await page.waitForSelector("article.word-card", { timeout: 15000 });
  } catch {
    console.log(`  ⚠️  article.word-card が見つかりません。スキップします。`);
    return [];
  }

  // 総ページ数を取得
  const totalPages = await getTotalPages(page);
  console.log(`  ページ数: ${totalPages}`);

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    // 2ページ目以降はSPAクリックで遷移
    if (pageIdx > 0) {
      await goToPage(page, pageIdx);
    }

    // カードを抽出
    const words = await page.evaluate(extractWordCards);
    console.log(`  ページ${pageIdx + 1}/${totalPages}: ${words.length}語を取得`);

    for (const w of words) {
      w.course = course;
      w.stage = stage;
      allWords.push(w);
    }

    // ページ間の待機
    if (pageIdx < totalPages - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`  ✅ 合計 ${allWords.length}語`);
  return allWords;
}

// --- メイン ---
async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // フィルタ適用
  let pages = PAGE_MAP;
  if (courseFilter) {
    pages = pages.filter((p) => p.course === courseFilter);
  }
  if (stageFilter) {
    pages = pages.filter((p) => p.stage === stageFilter);
  }

  if (pages.length === 0) {
    console.error("対象ページがありません。--course / --stage を確認してください。");
    process.exit(1);
  }

  console.log(`\n🚀 モチタン スクレイピング開始`);
  console.log(`   対象: ${pages.length} ページ\n`);

  const puppeteer = await getPuppeteer();
  const browser = await puppeteer.default.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  // UA設定（ブロック回避）
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  const results = {};

  for (const entry of pages) {
    const key = `${entry.course}_${entry.stage}`;
    try {
      const words = await scrapePage(page, entry);
      results[key] = words;

      // 中間保存（ページ単位）
      const outFile = join(OUT_DIR, `${key}.json`);
      writeFileSync(outFile, JSON.stringify(words, null, 2), "utf-8");
      console.log(`  💾 ${outFile}`);
    } catch (err) {
      console.error(`  ❌ ${key}: ${err.message}`);
      results[key] = [];
    }

    // レート制限対策
    await new Promise((r) => setTimeout(r, 2000));
  }

  await browser.close();

  // 全件まとめ保存
  const allFile = join(OUT_DIR, "all_scraped.json");
  writeFileSync(allFile, JSON.stringify(results, null, 2), "utf-8");

  // サマリー表示
  console.log("\n📊 スクレイピング結果:");
  let total = 0;
  for (const [key, words] of Object.entries(results)) {
    console.log(`  ${key}: ${words.length}語`);
    total += words.length;
  }
  console.log(`  合計: ${total}語`);
  console.log(`\n✅ 完了! データは ${OUT_DIR}/ に保存されました。`);
  console.log(`次のステップ: node scripts/motitown/import.mjs`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
