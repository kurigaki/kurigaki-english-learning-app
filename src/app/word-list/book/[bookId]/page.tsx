"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { words as allWordList } from "@/data/words/compat";
import { getWordsByCourse } from "@/data/words/index";
import { RECOMMENDED_BOOKS } from "@/data/recommended-books";
import { vocabularyBooks, type MyVocabBook } from "@/lib/vocabulary-books";
import { resolveBookMeta } from "@/lib/vocab-book-meta";
import { unifiedStorage } from "@/lib/unified-storage";
import type { ManualMasteryLevel, WordStats } from "@/lib/storage";
import { getDisplayedManualMastery, MANUAL_MASTERY_OPTIONS_ORDERED } from "@/lib/manual-mastery";
import { saveBookWordIds } from "@/lib/quiz-session";
import { saveQuickFlashcardSession } from "@/lib/flashcard-session";
import { SpeakButton } from "@/components/ui";
import BookmarkSelectDialog from "@/components/features/word-list/BookmarkSelectDialog";
import BookStudySettingsDialog from "@/components/features/word-list/BookStudySettingsDialog";
import type { Course } from "@/data/words/types";

type BookWord = {
  id: number;
  word: string;
  meaning: string;
};

function resolveBookWords(
  bookId: string,
  myBooks: MyVocabBook[],
  statsMap: Map<number, WordStats>,
  manualMap: Record<number, ManualMasteryLevel>
): BookWord[] {
  const parts = bookId.split(":");
  const type = parts[0];

  if (type === "course") {
    const course = parts[1] as Course;
    const stage = parts[2];
    const raw = getWordsByCourse(course, stage as Parameters<typeof getWordsByCourse>[1]);
    return raw.map((w) => ({ id: w.id, word: w.word, meaning: w.meaning }));
  }

  if (type === "mastery") {
    const level = parts[1] as ManualMasteryLevel;
    return allWordList
      .filter((w) => getDisplayedManualMastery(w.id, statsMap, manualMap) === level)
      .map((w) => ({ id: w.id, word: w.word, meaning: w.meaning }));
  }

  if (type === "accuracy") {
    const range = parts[1];
    // "100" は正答率ちょうど100%のみ、"lo-hi" は lo以上 hi未満
    if (range === "100") {
      return allWordList
        .filter((w) => {
          const stats = statsMap.get(w.id);
          return stats && stats.totalAttempts > 0 && stats.accuracy === 100;
        })
        .map((w) => ({ id: w.id, word: w.word, meaning: w.meaning }));
    }
    const [lo, hi] = range.split("-").map(Number);
    return allWordList
      .filter((w) => {
        const stats = statsMap.get(w.id);
        if (!stats || stats.totalAttempts === 0) return false;
        const acc = stats.accuracy;
        return acc >= lo && acc < hi;
      })
      .map((w) => ({ id: w.id, word: w.word, meaning: w.meaning }));
  }

  if (type === "recommended") {
    const id = parts.slice(1).join(":");
    const recBook = RECOMMENDED_BOOKS.find((b) => b.id === id);
    if (!recBook) return [];
    const wordSet = new Map<number, BookWord>();
    for (const course of recBook.courses) {
      for (const w of getWordsByCourse(course as Course)) {
        wordSet.set(w.id, { id: w.id, word: w.word, meaning: w.meaning });
      }
    }
    return Array.from(wordSet.values());
  }

  if (type === "my") {
    const bookUuid = parts.slice(1).join(":");
    const myBook = myBooks.find((b) => b.id === bookUuid);
    if (!myBook) return [];
    const wordById = new Map(allWordList.map((w) => [w.id, w]));
    return myBook.wordIds
      .map((wid) => wordById.get(wid))
      .filter((w): w is NonNullable<typeof w> => !!w)
      .map((w) => ({ id: w.id, word: w.word, meaning: w.meaning }));
  }

  return [];
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawBookId = params.bookId as string;
  const bookId = decodeURIComponent(rawBookId);

  const [isMounted, setIsMounted] = useState(false);
  // My単語帳リスト（bookMeta/bookWords の解決 と BookmarkSelectDialog の両方で共用）
  const [myBooks, setMyBooks] = useState<MyVocabBook[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [statsMap, setStatsMap] = useState<Map<number, WordStats>>(new Map());
  const [manualMap, setManualMap] = useState<Record<number, ManualMasteryLevel>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkDialog, setBookmarkDialog] = useState<{ wordId: number; wordText: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setMyBooks(vocabularyBooks.getMyVocabBooks());
    setIsFavorite(vocabularyBooks.isFavoriteBook(bookId));
    vocabularyBooks.addRecentlyViewedBook(bookId);

    const loadStats = async () => {
      const [sm, mm] = await Promise.all([
        unifiedStorage.getWordStats(),
        unifiedStorage.getManualMasteryMap(),
      ]);
      setStatsMap(sm);
      setManualMap(mm);
    };
    loadStats();
  }, [bookId]);

  const bookMeta = useMemo(
    () => (isMounted ? resolveBookMeta(bookId, myBooks) : null),
    [bookId, myBooks, isMounted]
  );

  const bookWords = useMemo(
    () => (isMounted ? resolveBookWords(bookId, myBooks, statsMap, manualMap) : []),
    [bookId, myBooks, statsMap, manualMap, isMounted]
  );

  const filteredWords = useMemo(() => {
    if (!searchQuery) return bookWords;
    const q = searchQuery.toLowerCase();
    return bookWords.filter(
      (w) => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q)
    );
  }, [bookWords, searchQuery]);

  const handleToggleFavorite = useCallback(() => {
    const next = vocabularyBooks.toggleFavoriteBook(bookId);
    setIsFavorite(next);
  }, [bookId]);

  const handleBookmarkToggle = useCallback((bookIdParam: string, wordId: number) => {
    vocabularyBooks.toggleWordInBook(bookIdParam, wordId);
    setMyBooks(vocabularyBooks.getMyVocabBooks());
  }, []);

  const handleCreateBook = useCallback((name: string) => {
    vocabularyBooks.createMyVocabBook(name);
    setMyBooks(vocabularyBooks.getMyVocabBooks());
  }, []);

  const getRegisteredBookIds = useCallback(
    (wordId: number) => vocabularyBooks.getBooksForWord(wordId),
    []
  );

  const handleManualMasteryChange = useCallback(async (wordId: number, mastery: ManualMasteryLevel) => {
    setManualMap((prev) => ({ ...prev, [wordId]: mastery }));
    await unifiedStorage.setManualMastery(wordId, mastery);
  }, []);

  // My単語帳の削除（my:uuid タイプのみ）
  const isMyBook = bookId.startsWith("my:");
  const handleDeleteBook = useCallback(() => {
    const uuid = bookId.replace(/^my:/, "");
    const name = bookMeta?.name ?? "";
    if (confirm(`「${name}」を削除しますか？\nこの操作は取り消せません。`)) {
      vocabularyBooks.deleteMyVocabBook(uuid);
      router.push("/word-list");
    }
  }, [bookId, bookMeta, router]);

  // フラッシュカード開始（特定の単語から直接）— 個別単語行の🃏ボタン用
  const handleStartFlashcardAt = useCallback((startWordId: number) => {
    const wordIds = filteredWords.map((w) => w.id);
    const startIndex = Math.max(0, filteredWords.findIndex((w) => w.id === startWordId));
    saveQuickFlashcardSession(wordIds, startIndex);
    router.push("/flashcard");
  }, [filteredWords, router]);

  // 設定ダイアログからフラッシュカード開始
  const handleStartFlashcardFromSettings = useCallback((wordIds: number[]) => {
    saveQuickFlashcardSession(wordIds);
    router.push("/flashcard");
  }, [router]);

  // 設定ダイアログからクイズ開始
  const handleStartQuizFromSettings = useCallback((wordIds: number[]) => {
    saveBookWordIds(wordIds);
    router.push("/quiz?bookWords=true");
  }, [router]);

  if (!isMounted) return null;

  if (!bookMeta) {
    return (
      <div className="main-content flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400">単語帳が見つかりません</p>
          <button
            onClick={() => router.push("/word-list")}
            className="mt-3 text-sm text-primary-500 hover:underline"
          >
            単語帳トップへ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content flex flex-col">
      {/* ヘッダー */}
      <div className={`flex-shrink-0 bg-gradient-to-r ${bookMeta.gradientClass} px-4 pt-4 pb-3`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.push("/word-list")}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl emoji-icon">{bookMeta.emoji}</span>
                <h1 className="text-lg font-bold text-white leading-tight">{bookMeta.name}</h1>
              </div>
              <p className="text-white/70 text-xs mt-0.5">{bookWords.length}語</p>
            </div>
            {/* My単語帳削除ボタン */}
            {isMyBook && (
              <button
                onClick={handleDeleteBook}
                className="p-2 rounded-full bg-white/20 hover:bg-red-500/60 transition-colors"
                title="この単語帳を削除"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            {/* お気に入りボタン */}
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
            >
              <svg
                className="w-5 h-5 text-white"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          </div>
          {/* 検索バー */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="この単語帳内を検索..."
              className="w-full pl-8 pr-8 py-2 text-sm rounded-xl bg-white/90 dark:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-white/50 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 単語リスト */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2">
        <div className="max-w-2xl mx-auto space-y-0">
          {filteredWords.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl emoji-icon block mb-3">🔍</span>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {searchQuery ? `「${searchQuery}」に一致する単語がありません` : "この単語帳には単語がありません"}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
              {filteredWords.map((word, idx) => {
                const stats = statsMap.get(word.id);
                const mastery = getDisplayedManualMastery(word.id, statsMap, manualMap);
                const hasAttempts = stats && stats.totalAttempts > 0;
                return (
                  <div
                    key={word.id}
                    className={`flex items-center gap-1.5 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      idx !== 0 ? "border-t border-slate-100 dark:border-slate-700" : ""
                    }`}
                  >
                    {/* 左側: 操作ボタン */}
                    <SpeakButton text={word.word} size="sm" />
                    {/* フラッシュカードボタン */}
                    <button
                      onClick={() => handleStartFlashcardAt(word.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex-shrink-0"
                      title="この単語からフラッシュカード開始"
                    >
                      <span className="text-xs emoji-icon">🃏</span>
                    </button>
                    {/* ブックマーク（単語帳選択） */}
                    <button
                      onClick={() => setBookmarkDialog({ wordId: word.id, wordText: word.word })}
                      className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                        myBooks.some((b) => b.wordIds.includes(word.id))
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-slate-300 hover:text-yellow-400"
                      }`}
                      title="単語帳に追加"
                    >
                      <svg
                        className="w-4 h-4"
                        fill={myBooks.some((b) => b.wordIds.includes(word.id)) ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    {/* 単語詳細リンク */}
                    <Link
                      href={`/word/${word.id}`}
                      className="flex items-center flex-1 min-w-0 group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors truncate text-sm">
                          {word.word}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{word.meaning}</p>
                      </div>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    {/* 右側: 正答率・記憶度セレクト */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-0.5 ml-1">
                      <span className="text-[10px] px-1 py-0.5 rounded bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        {hasAttempts ? `${stats.accuracy}%` : "-"}
                      </span>
                      <select
                        value={mastery}
                        onChange={(e) => handleManualMasteryChange(word.id, e.target.value as ManualMasteryLevel)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-400 max-w-[80px]"
                      >
                        {MANUAL_MASTERY_OPTIONS_ORDERED
                          .filter((opt) => !hasAttempts || opt.key !== "unlearned")
                          .map((opt) => (
                            <option key={`${word.id}-${opt.key}`} value={opt.key}>
                              {opt.label.split(" ")[0]}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 下部ボタン */}
      {filteredWords.length > 0 && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="max-w-2xl mx-auto flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center gap-2 flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
            >
              <span className="emoji-icon">🃏</span>
              フラッシュカード
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center gap-2 flex-1 py-3 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors text-sm shadow-sm"
            >
              <span className="emoji-icon">📝</span>
              クイズ
            </button>
          </div>
        </div>
      )}

      {/* ブックマーク選択ダイアログ */}
      {bookmarkDialog && (
        <BookmarkSelectDialog
          wordId={bookmarkDialog.wordId}
          wordText={bookmarkDialog.wordText}
          books={myBooks}
          registeredBookIds={getRegisteredBookIds(bookmarkDialog.wordId)}
          onToggle={handleBookmarkToggle}
          onCreateBook={handleCreateBook}
          onClose={() => setBookmarkDialog(null)}
        />
      )}

      {/* 出題設定ダイアログ */}
      {showSettings && (
        <BookStudySettingsDialog
          allWordIds={filteredWords.map((w) => w.id)}
          statsMap={statsMap}
          manualMap={manualMap}
          onStartFlashcard={(wordIds) => {
            setShowSettings(false);
            handleStartFlashcardFromSettings(wordIds);
          }}
          onStartQuiz={(wordIds) => {
            setShowSettings(false);
            handleStartQuizFromSettings(wordIds);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
