"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, Button } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { unifiedStorage } from "@/lib/unified-storage";
import { saveBookmarkSort, getAndClearBookmarkSort } from "@/lib/navigation-state";
import { saveWordNavState } from "@/lib/word-nav-state";
import { words, Word, categoryLabels, difficultyLabels } from "@/data/words/compat";
import type { WordStats, ManualMasteryLevel } from "@/lib/storage";
import { getDisplayedManualMastery, MANUAL_MASTERY_OPTIONS_ORDERED } from "@/lib/manual-mastery";
import { saveQuickFlashcardSession } from "@/lib/flashcard-session";
import { vocabularyBooks } from "@/lib/vocabulary-books";

type SortOption = "added" | "name" | "difficulty";

const getDifficultyColor = (difficulty: number): string => {
  if (difficulty === 1) return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/40";
  if (difficulty === 2) return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40";
  if (difficulty === 3) return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/40";
  return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40";
};

export default function BookmarksPage() {
  const router = useRouter();
  // isLoading: 認証初期化中はデータを読み込まない（Supabaseセッションが未準備のため）
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [bookmarkedWords, setBookmarkedWords] = useState<Word[]>([]);
  const [wordStatsMap, setWordStatsMap] = useState<Map<number, WordStats>>(new Map());
  const [manualMemoryById, setManualMemoryById] = useState<Record<number, ManualMasteryLevel>>({});
  const [sortBy, setSortBy] = useState<SortOption>("added");
  const [isMounted, setIsMounted] = useState(false);

  const loadBookmarks = useCallback(async () => {
    const [bookmarkedIds, statsMap, manualMap] = await Promise.all([
      unifiedStorage.getBookmarkedWordIds(),
      unifiedStorage.getWordStats(),
      unifiedStorage.getManualMasteryMap(),
    ]);
    setWordStatsMap(statsMap);
    setManualMemoryById(manualMap);

    // My単語帳の単語IDも取得し、旧ブックマークと統合（重複排除）
    const myBooks = vocabularyBooks.getMyVocabBooks();
    const myVocabWordIdSet = new Set<number>();
    myBooks.forEach((book) => book.wordIds.forEach((id) => myVocabWordIdSet.add(id)));

    const oldBookmarkedSet = new Set(bookmarkedIds);
    const allWordIds = [...bookmarkedIds];
    myVocabWordIdSet.forEach((id) => {
      if (!oldBookmarkedSet.has(id)) allWordIds.push(id);
    });

    const wordById = new Map(words.map((w) => [w.id, w]));
    const bookmarked: Word[] = [];
    allWordIds.forEach((id) => {
      const word = wordById.get(id);
      if (word) bookmarked.push(word);
    });

    // ソート
    if (sortBy === "name") {
      bookmarked.sort((a, b) => a.word.localeCompare(b.word));
    } else if (sortBy === "difficulty") {
      bookmarked.sort((a, b) => a.difficulty - b.difficulty);
    }
    // "added" の場合はそのまま（登録順）

    setBookmarkedWords(bookmarked);
  }, [sortBy]);

  useEffect(() => {
    setIsMounted(true);
    // 単語詳細から戻った際にソート状態を復元
    const saved = getAndClearBookmarkSort();
    if (saved) setSortBy(saved);
  }, []);

  // 認証初期化完了後にデータを再取得（認証中はSupabaseセッションが未準備のため待機）
  useEffect(() => {
    if (!isAuthLoading) {
      loadBookmarks();
    }
  }, [isAuthLoading, isAuthenticated, loadBookmarks]);

  const getDisplayedMastery = useCallback((wordId: number): ManualMasteryLevel => (
    getDisplayedManualMastery(wordId, wordStatsMap, manualMemoryById)
  ), [manualMemoryById, wordStatsMap]);

  const handleManualMasteryChange = useCallback(async (wordId: number, mastery: ManualMasteryLevel) => {
    setManualMemoryById((prev) => ({ ...prev, [wordId]: mastery }));
    await unifiedStorage.setManualMastery(wordId, mastery);
  }, []);

  const handleRemoveBookmark = useCallback(async (wordId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 旧ブックマークシステムから削除
    await unifiedStorage.removeBookmark(wordId);
    // My単語帳からも削除（全ての単語帳から）
    const myBooks = vocabularyBooks.getMyVocabBooks();
    myBooks.forEach((book) => {
      if (book.wordIds.includes(wordId)) {
        vocabularyBooks.removeWordFromBook(book.id, wordId);
      }
    });
    loadBookmarks();
  }, [loadBookmarks]);

  const startFlashcard = useCallback((wordId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 全単語リストを渡し、クリックした単語のインデックスから開始する
    const allIds = bookmarkedWords.map((w) => w.id);
    const startIndex = Math.max(0, allIds.indexOf(wordId));
    saveQuickFlashcardSession(allIds, startIndex);
    router.push("/flashcard");
  }, [bookmarkedWords, router]);

  if (!isMounted) {
    return (
      <div className="main-content flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="main-content px-3 py-2 flex flex-col">
      <div className="max-w-2xl w-full mx-auto flex flex-col h-full">
        {/* 上部固定: ヘッダー */}
        <div className="flex-shrink-0 mb-1.5">
          <Link
            href="/"
            className="flex items-center gap-0.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-200 mb-1 transition-colors text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>戻る</span>
          </Link>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span className="text-xl emoji-icon">🔖</span>
            <span>ブックマーク</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            {bookmarkedWords.length}語を保存中
          </p>
        </div>

        {/* 上部固定: ソートオプション */}
        {bookmarkedWords.length > 0 && (
          <div className="flex-shrink-0 flex gap-1 mb-1.5">
            <button
              onClick={() => setSortBy("added")}
              className={`px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                sortBy === "added"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              登録順
            </button>
            <button
              onClick={() => setSortBy("name")}
              className={`px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                sortBy === "name"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              名前順
            </button>
            <button
              onClick={() => setSortBy("difficulty")}
              className={`px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                sortBy === "difficulty"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              難易度順
            </button>
          </div>
        )}

        {/* 中央スクロール: 単語リスト */}
        {bookmarkedWords.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="text-center py-6">
              <span className="text-4xl mb-2 block emoji-icon">📚</span>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                ブックマークがありません
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                単語帳ページで単語を<br />
                My単語帳に追加しましょう。
              </p>
              <Link href="/word-list">
                <Button size="sm">単語帳を見る</Button>
              </Link>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5">
              {bookmarkedWords.map((word) => (
                <Card
                  key={word.id}
                  hover
                  className="flex items-center gap-2 group !p-2"
                >
                    {/* 難易度バッジ */}
                    <div
                      className={`w-10 h-10 rounded-md flex flex-col items-center justify-center ${getDifficultyColor(
                        word.difficulty
                      )}`}
                    >
                      <span className="text-[10px] font-medium">Lv.{word.difficulty}</span>
                      <span className="text-[9px] opacity-70">
                        {difficultyLabels[word.difficulty]}
                      </span>
                    </div>

                    <Link
                      href={`/word/${word.id}?from=bookmarks`}
                      onClick={() => { saveBookmarkSort(sortBy); saveWordNavState(bookmarkedWords.map((w) => w.id), "bookmarks"); }}
                      className="flex items-center gap-2 flex-1 min-w-0 group/link"
                    >
                      {/* 単語情報 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover/link:text-primary-600 transition-colors">
                            {word.word}
                          </h3>
                          <SpeakButton text={word.word} size="sm" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] truncate">{word.meaning}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                          <span>{categoryLabels[word.category]}</span>
                        </div>
                      </div>
                      {/* 矢印 */}
                      <div className="text-slate-400 dark:text-slate-500 group-hover/link:text-primary-500 group-hover/link:translate-x-1 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>

                    {/* フラッシュカードボタン */}
                    <button
                      onClick={(e) => startFlashcard(word.id, e)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex-shrink-0"
                      title="この単語からフラッシュカード開始"
                    >
                      <span className="text-xs emoji-icon">🃏</span>
                    </button>
                    {/* ブックマーク解除ボタン */}
                    <button
                      onClick={(e) => handleRemoveBookmark(word.id, e)}
                      className="p-1.5 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                      title="ブックマークを解除"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                      </svg>
                    </button>
                    <div className="w-[170px] flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-[10px] px-1 py-0.5 rounded bg-white/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          正答率 {wordStatsMap.get(word.id)?.accuracy !== null && wordStatsMap.get(word.id)?.accuracy !== undefined
                            ? `${wordStatsMap.get(word.id)?.accuracy}%`
                            : "-"}
                        </span>
                        <select
                          value={getDisplayedMastery(word.id)}
                          onChange={(e) => handleManualMasteryChange(word.id, e.target.value as ManualMasteryLevel)}
                          className="text-[10px] px-1.5 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                        >
                          {MANUAL_MASTERY_OPTIONS_ORDERED
                            .filter((opt) => (wordStatsMap.get(word.id)?.totalAttempts ?? 0) === 0 || opt.key !== "unlearned")
                            .map((opt) => (
                              <option key={`${word.id}-${opt.key}`} value={opt.key}>
                                {opt.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                </Card>
              ))}
            </div>

            {/* 下部固定: クイズ誘導 */}
            <div className="flex-shrink-0 pt-1.5">
              <Card className="!p-2 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-100 dark:border-primary-800/30">
                <div className="text-center">
                  <Link href="/quiz?bookmarksOnly=true">
                    <Button fullWidth size="sm">
                      ブックマーク単語でクイズ
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
