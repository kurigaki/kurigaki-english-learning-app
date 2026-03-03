"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { words, categoryLabels, difficultyLabels } from "@/data/words/compat";
import { allWords } from "@/data/words";
import { getWordExtension } from "@/data/word-extensions";
import { Card, Button } from "@/components/ui";
import {
  WordHeader,
  WordExamples,
  WordRelations,
  WordColumn,
  WordMastery,
  WordImage,
  WordPlaceholderSection,
  WordSynonymDiff,
} from "@/components/features/word-detail";
import { unifiedStorage } from "@/lib/unified-storage";
import { getWordNavState } from "@/lib/word-nav-state";
import { useEffect, useState } from "react";

export default function WordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const wordId = Number(params.id);

  // 遷移元を取得（quiz, history, weak-words など）
  const fromPage = searchParams.get("from");

  // 前後ナビゲーション状態（sessionStorage から取得）
  // useState 遅延初期化でマウント時に一度だけ読み込む（← → で遷移すると新規マウントになるため）
  const [navState] = useState(() => getWordNavState());
  const currentNavIndex = navState ? navState.wordIds.indexOf(wordId) : -1;
  const prevNavWordId =
    navState && currentNavIndex > 0 ? navState.wordIds[currentNavIndex - 1] : null;
  const nextNavWordId =
    navState && currentNavIndex >= 0 && currentNavIndex < navState.wordIds.length - 1
      ? navState.wordIds[currentNavIndex + 1]
      : null;

  const [masteryData, setMasteryData] = useState<{
    accuracy: number | null;
    totalAttempts: number;
  }>({ accuracy: null, totalAttempts: 0 });
  const [isBookmarked, setIsBookmarked] = useState(false);

  const word = words.find((w) => w.id === wordId);
  const internalWord = allWords.find((w) => w.id === wordId);
  const wordExt = internalWord ? getWordExtension(internalWord) : undefined;

  // 学習履歴から記憶度を計算し、ブックマーク状態を取得
  useEffect(() => {
    if (!word) return;
    const loadData = async () => {
      const statsMap = await unifiedStorage.getWordStats();
      const stats = statsMap.get(word.id);
      if (stats) {
        setMasteryData({
          accuracy: stats.accuracy,
          totalAttempts: stats.totalAttempts,
        });
      }
      const bookmarked = await unifiedStorage.isWordBookmarked(word.id);
      setIsBookmarked(bookmarked);
    };
    loadData();
  }, [word]);

  // ブックマークの切り替え
  const handleToggleBookmark = async () => {
    if (!word) return;
    const newState = await unifiedStorage.toggleBookmark(word.id);
    setIsBookmarked(newState);
  };

  // 戻るボタンの処理
  const handleBack = () => {
    // 遷移元に応じて適切な画面に戻る
    switch (fromPage) {
      case "quiz":
        // クイズリザルト画面に戻る
        router.push("/quiz");
        break;
      case "speed":
        // スピードチャレンジリザルト画面に戻る
        router.push("/speed-challenge");
        break;
      case "history":
        // 学習履歴画面に戻る
        router.push("/history");
        break;
      case "weak":
        // 苦手単語画面に戻る
        router.push("/weak-words");
        break;
      case "wordlist":
        // 単語帳画面に戻る
        router.push("/word-list");
        break;
      case "bookmarks":
        // ブックマーク画面に戻る
        router.push("/bookmarks");
        break;
      default:
        // それ以外はブラウザの履歴を使用
        router.back();
    }
  };

  // 戻り先のラベルを取得
  const getBackLabel = () => {
    switch (fromPage) {
      case "quiz":
        return "リザルトに戻る";
      case "speed":
        return "リザルトに戻る";
      case "history":
        return "学習履歴に戻る";
      case "weak":
        return "苦手単語に戻る";
      case "wordlist":
        return "単語帳に戻る";
      case "bookmarks":
        return "ブックマークに戻る";
      default:
        return "戻る";
    }
  };

  if (!word) {
    return (
      <div className="main-content-scroll px-4 pt-8 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <span className="text-6xl mb-4 block emoji-icon">😵</span>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            単語が見つかりません
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            指定された単語は存在しないか、削除された可能性があります。
          </p>
          <Link href="/">
            <Button fullWidth>ホームに戻る</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // 例文データを変換（例文がある場合）
  const examples =
    word.examples ??
    wordExt?.examples ??
    (word.example
      ? [{
          en: word.example,
          ja: word.exampleJa ?? "",
        }]
      : []);

  // ナビゲーション状態が有効かどうか（スティッキー底部バーの表示判定）
  const hasBottomNav = navState !== null && currentNavIndex >= 0;

  return (
    // ナビあり: main-content(固定高さ) + 内部スクロール でスティッキー底部バーを実現
    // ナビなし: main-content-scroll で通常スクロール
    <div className={hasBottomNav ? "main-content flex flex-col" : "main-content-scroll"}>
      {/* スクロール可能なコンテンツ領域 */}
      <div
        className={`px-4 pt-6 ${hasBottomNav ? "flex-1 overflow-y-auto pb-4" : "pb-6"}`}
        style={!hasBottomNav ? { paddingBottom: "max(24px, var(--safe-area-bottom))" } : undefined}
      >
        <div className="max-w-lg mx-auto">
          {/* 戻るボタン */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-200 mb-3 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>{getBackLabel()}</span>
          </button>

          {/* 位置インジケーター（N / 総数）- ナビあり時のみ表示 */}
          {hasBottomNav && (
            <div className="flex items-center justify-center mb-4">
              <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums bg-slate-50 dark:bg-slate-800 rounded-full px-3 py-1">
                {currentNavIndex + 1} / {navState!.wordIds.length}
              </span>
            </div>
          )}

          <Card className="overflow-hidden">
            {/* カテゴリ・難易度バッジ・ブックマーク */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap items-center gap-2">
                {(word.categories ?? [word.category]).map((cat) => (
                  <span
                    key={cat}
                    className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full"
                  >
                    {categoryLabels[cat]}
                  </span>
                ))}
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                  {difficultyLabels[word.difficulty]}
                </span>
              </div>
              <button
                onClick={handleToggleBookmark}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isBookmarked
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-yellow-50 hover:text-yellow-600"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill={isBookmarked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                {isBookmarked ? "保存済み" : "保存"}
              </button>
            </div>

            {/* イメージ画像 */}
            <WordImage
              word={word.word}
              category={word.category}
              imageUrl={word.imageUrl}
              imageKeyword={word.imageKeyword}
            />

            {/* ヘッダー（単語・発音・品詞・意味） */}
            <WordHeader
              word={word.word}
              meaning={word.meaning}
              pronunciation={word.pronunciation ?? wordExt?.pronunciation}
              partOfSpeech={word.partOfSpeech}
            />

            {/* 記憶度 */}
            <WordMastery
              accuracy={masteryData.accuracy}
              totalAttempts={masteryData.totalAttempts}
            />

            {/* 例文 */}
            {examples.length > 0 && (
              <WordExamples examples={examples} currentWord={word.word} />
            )}

            {/* コアイメージ */}
            <WordPlaceholderSection
              title="コアイメージ"
              emoji="💡"
              content={word.coreImage ?? wordExt?.coreImage}
              placeholder="この単語のコアイメージは今後追加予定です"
              currentWord={word.word}
            />

            {/* 関連語 */}
            <WordRelations
              relatedWordEntries={word.relatedWordEntries ?? wordExt?.relatedWordEntries}
              currentWord={word.word}
            />

            {/* 使い方 */}
            <WordPlaceholderSection
              title="使い方"
              emoji="📝"
              content={word.usage ?? wordExt?.usage}
              placeholder="この単語の使い方解説は今後追加予定です"
              currentWord={word.word}
            />

            {/* 類義語との違い（構造化データがあればリスト表示、なければプレーンテキスト） */}
            {((word.synonymDifferenceEntries ?? wordExt?.synonymDifferenceEntries) &&
              (word.synonymDifferenceEntries ?? wordExt?.synonymDifferenceEntries)!.length > 0) ? (
              <WordSynonymDiff
                entries={(word.synonymDifferenceEntries ?? wordExt?.synonymDifferenceEntries)!}
                currentWord={word.word}
              />
            ) : (
              <WordPlaceholderSection
                title="類義語との違い"
                emoji="🔍"
                content={word.synonymDifference ?? wordExt?.synonymDifference}
                placeholder="類義語との使い分けは今後追加予定です"
                currentWord={word.word}
              />
            )}

            {/* 英英定義 */}
            <WordPlaceholderSection
              title="英英定義"
              emoji="🇬🇧"
              content={word.englishDefinition ?? wordExt?.englishDefinition}
              placeholder="英語による定義は今後追加予定です"
              currentWord={word.word}
            />

            {/* 語源（配列対応：複数語源をリスト表示） */}
            <WordPlaceholderSection
              title="語源"
              emoji="📜"
              content={word.etymology ?? wordExt?.etymology}
              placeholder="語源解説は今後追加予定です"
              currentWord={word.word}
            />

            {/* コラム */}
            <WordColumn column={word.column ?? wordExt?.column} currentWord={word.word} />

            {/* アクションボタン */}
            <div className="pt-6 space-y-3">
              <Link href={`/quiz?wordId=${word.id}`}>
                <Button fullWidth variant="primary">
                  この単語を復習する
                </Button>
              </Link>
              {/* ナビなし時のみ戻るボタンをここに表示（ナビあり時は底部バーに統合） */}
              {!hasBottomNav && (
                fromPage ? (
                  <Button fullWidth variant="secondary" onClick={handleBack}>
                    {getBackLabel()}
                  </Button>
                ) : (
                  <Link href="/">
                    <Button fullWidth variant="secondary">
                      ホームに戻る
                    </Button>
                  </Link>
                )
              )}
            </div>
          </Card>

        </div>
      </div>

      {/* ─── スティッキー底部ナビゲーション ───
          hasBottomNav のときのみ表示。flex-shrink-0 で高さを固定し、
          コンテンツ領域が flex-1 で残りの高さを占める構造でスティッキーを実現。 */}
      {hasBottomNav && (
        <div
          className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-3"
          style={{ paddingBottom: "max(12px, var(--safe-area-bottom))" }}
        >
          <div className="max-w-lg mx-auto flex items-center gap-2">
            {/* ← 前の単語（円形ボタン） */}
            {prevNavWordId !== null ? (
              <Link
                href={`/word/${prevNavWordId}${fromPage ? `?from=${fromPage}` : ""}`}
                className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-colors"
                aria-label="前の単語"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            ) : (
              <span
                className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-600 cursor-not-allowed"
                aria-disabled="true"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </span>
            )}

            {/* 中央: 戻るボタン（幅広） */}
            <Button fullWidth variant="secondary" onClick={handleBack}>
              {getBackLabel()}
            </Button>

            {/* 次の単語 →（円形ボタン） */}
            {nextNavWordId !== null ? (
              <Link
                href={`/word/${nextNavWordId}${fromPage ? `?from=${fromPage}` : ""}`}
                className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-colors"
                aria-label="次の単語"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span
                className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-600 cursor-not-allowed"
                aria-disabled="true"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
