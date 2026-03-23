"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { categoryLabels, difficultyLabels } from "@/data/words";
import { Card, Button } from "@/components/ui";
import {
  WordHeader,
  WordExamples,
  WordRelations,
  WordColumn,
  WordMastery,
  // WordImage, // TODO: Stable Diffusion (Replicate API) 一括生成後に再有効化
  WordPlaceholderSection,
  WordSynonymDiff,
  WordQuizHistory,
} from "@/components/features/word-detail";
import type { ManualMasteryLevel } from "@/lib/storage";
import { MANUAL_MASTERY_OPTIONS_ORDERED } from "@/lib/manual-mastery";
import { getMasteryBadgeClass } from "@/lib/mastery-style";
import { useWordDetail } from "@/lib/hooks/useWordDetail";
import BookmarkSelectDialog from "@/components/features/word-list/BookmarkSelectDialog";
import { vocabularyBooks, type MyVocabBook } from "@/lib/vocabulary-books";

export default function WordDetailPage() {
  const {
    word,
    wordExt,
    isLoading,
    wordStats,
    quizHistory,
    currentMastery,
    handleManualMasteryChange,
    fromPage,
    navState,
    currentNavIndex,
    prevNavWordId,
    nextNavWordId,
    handleBack,
    getBackLabel,
  } = useWordDetail();

  // ── My単語帳 state ──────────────────────────────────────────────
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [myBooks, setMyBooks] = useState<MyVocabBook[]>([]);

  const refreshMyBooks = useCallback(() => {
    setMyBooks(vocabularyBooks.getMyVocabBooks());
  }, []);

  // 旧ブックマーク → My単語帳 移行（初回のみ）＋初期ロード
  useEffect(() => {
    if (typeof window === "undefined") return;
    const MIGRATED_KEY = "bookmark_migrated_v2";
    if (!localStorage.getItem(MIGRATED_KEY)) {
      try {
        const raw = localStorage.getItem("bookmarked_words");
        const oldIds: number[] = raw ? (JSON.parse(raw) as number[]) : [];
        if (oldIds.length > 0) {
          const books = vocabularyBooks.getMyVocabBooks();
          if (books.length > 0) {
            oldIds.forEach((id) => vocabularyBooks.addWordToBook(books[0].id, id));
          }
        }
      } catch {
        // 移行エラーは無視
      }
      localStorage.setItem(MIGRATED_KEY, "1");
    }
    refreshMyBooks();
  }, [refreshMyBooks]);

  const registeredBookIds = word
    ? myBooks.filter((b) => b.wordIds.includes(word.id)).map((b) => b.id)
    : [];

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
    wordExt?.examples ??
    (word.example
      ? [{
          en: word.example,
          ja: word.exampleJa ?? "",
        }]
      : []);

  // ナビゲーション状態が有効かどうか（スティッキー底部バーの表示判定）
  const hasBottomNav = !isLoading && navState !== null && currentNavIndex >= 0;

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
                    {(categoryLabels as Record<string, string>)[cat] ?? cat}
                  </span>
                ))}
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                  {difficultyLabels[word.difficulty]}
                </span>
              </div>
              <button
                onClick={() => {
                  refreshMyBooks();
                  setShowBookmarkDialog(true);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  registeredBookIds.length > 0
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600"
                }`}
              >
                <span className="emoji-icon">📚</span>
                <span>{registeredBookIds.length > 0 ? "登録済み" : "単語帳に追加"}</span>
              </button>
            </div>

            {/* イメージ画像 */}
            {/* TODO: Stable Diffusion (Replicate API) で全単語の画像を一括生成後に再有効化
            <WordImage
              word={word.word}
              category={word.category}
              imageUrl={word.imageUrl}
              imageKeyword={word.imageKeyword}
            />
            */}

            {/* ヘッダー（単語・発音・品詞・意味） */}
            <WordHeader
              word={word.word}
              meaning={word.meaning}
              pronunciation={wordExt?.pronunciation}
              partOfSpeech={word.partOfSpeech}
            />

            {/* 記憶度 */}
            <WordMastery
              accuracy={wordStats?.accuracy ?? null}
              totalAttempts={wordStats?.totalAttempts ?? 0}
              manualLevel={currentMastery}
            />
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">記憶度</span>
              <select
                value={currentMastery}
                onChange={(e) => handleManualMasteryChange(e.target.value as ManualMasteryLevel)}
                className={`text-sm px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-primary-400 ${getMasteryBadgeClass(currentMastery)}`}
              >
                {MANUAL_MASTERY_OPTIONS_ORDERED.filter(
                  (opt) => (wordStats?.totalAttempts ?? 0) === 0 || opt.key !== "unlearned"
                ).map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* クイズ履歴 */}
            <WordQuizHistory history={quizHistory} />

            {/* 例文 */}
            {examples.length > 0 && (
              <WordExamples examples={examples} currentWord={word.word} />
            )}

            {/* コアイメージ */}
            <WordPlaceholderSection
              title="コアイメージ"
              emoji="💡"
              content={wordExt?.coreImage}
              placeholder="この単語のコアイメージは今後追加予定です"
              currentWord={word.word}
            />

            {/* 関連語 */}
            <WordRelations
              relatedWordEntries={wordExt?.relatedWordEntries}
              currentWord={word.word}
            />

            {/* 使い方 */}
            <WordPlaceholderSection
              title="使い方"
              emoji="📝"
              content={wordExt?.usage}
              placeholder="この単語の使い方解説は今後追加予定です"
              currentWord={word.word}
            />

            {/* 類義語との違い（構造化データがあればリスト表示、なければプレーンテキスト） */}
            {(wordExt?.synonymDifferenceEntries &&
              wordExt.synonymDifferenceEntries.length > 0) ? (
              <WordSynonymDiff
                entries={wordExt.synonymDifferenceEntries}
                currentWord={word.word}
              />
            ) : (
              <WordPlaceholderSection
                title="類義語との違い"
                emoji="🔍"
                content={wordExt?.synonymDifference}
                placeholder="類義語との使い分けは今後追加予定です"
                currentWord={word.word}
              />
            )}

            {/* 英英定義 */}
            <WordPlaceholderSection
              title="英英定義"
              emoji="🇬🇧"
              content={wordExt?.englishDefinition}
              placeholder="英語による定義は今後追加予定です"
              currentWord={word.word}
            />

            {/* 語源（配列対応：複数語源をリスト表示） */}
            <WordPlaceholderSection
              title="語源"
              emoji="📜"
              content={wordExt?.etymology}
              placeholder="語源解説は今後追加予定です"
              currentWord={word.word}
            />

            {/* コラム */}
            <WordColumn column={wordExt?.column} currentWord={word.word} />

            {/* アクションボタン */}
            <div className="pt-6 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/quiz?wordId=${word.id}`}>
                  <Button fullWidth variant="primary">
                    この単語を復習する
                  </Button>
                </Link>
                <Link href={`/dungeon?wordId=${word.id}`}>
                  <Button fullWidth variant="secondary">
                    <span className="emoji-icon">⚔️</span> ダンジョンで鍛える
                  </Button>
                </Link>
              </div>
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

      {/* My単語帳選択ダイアログ */}
      {showBookmarkDialog && word && (
        <BookmarkSelectDialog
          wordId={word.id}
          wordText={word.word}
          books={myBooks}
          registeredBookIds={registeredBookIds}
          onToggle={(bookId) => {
            vocabularyBooks.toggleWordInBook(bookId, word.id);
            refreshMyBooks();
          }}
          onCreateBook={(name) => {
            const newBook = vocabularyBooks.createMyVocabBook(name);
            if (!newBook) {
              alert(`My単語帳は最大${vocabularyBooks.getMyVocabBookLimit()}冊まで作成できます。`);
              return;
            }
            vocabularyBooks.addWordToBook(newBook.id, word.id);
            refreshMyBooks();
          }}
          onClose={() => setShowBookmarkDialog(false)}
          canCreate={vocabularyBooks.canCreateMyVocabBook()}
          maxCount={vocabularyBooks.getMyVocabBookLimit()}
        />
      )}
    </div>
  );
}
