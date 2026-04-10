"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { words as allWordList } from "@/data/words";
import { getWordsByCourse } from "@/data/words/index";
import { RECOMMENDED_BOOKS } from "@/data/recommended-books";
import { vocabularyBooks, type MyVocabBook } from "@/lib/vocabulary-books";
import { resolveBookMeta } from "@/lib/vocab-book-meta";
import { unifiedStorage } from "@/lib/unified-storage";
import type { ManualMasteryLevel, WordStats } from "@/lib/storage";
import { getDisplayedManualMastery, MANUAL_MASTERY_OPTIONS_ORDERED } from "@/lib/manual-mastery";
import { saveBookWordIds, getQuizProgressState, clearQuizProgressState } from "@/lib/quiz-session";
import { saveTimeAttackContext } from "@/lib/time-attack-best";
import { saveQuickFlashcardSession } from "@/lib/flashcard-session";
import { speakWord, stopSpeaking } from "@/lib/audio";
import { getAccuracyBadgeClass } from "@/lib/accuracy-style";
import { getMasteryBadgeClass } from "@/lib/mastery-style";
import { SpeakButton } from "@/components/ui";
import BookmarkSelectDialog from "@/components/features/word-list/BookmarkSelectDialog";
import BookStudySettingsDialog, {
  computeWordIds,
  type StudySettings,
  type SortBy,
} from "@/components/features/word-list/BookStudySettingsDialog";
import BookProgressBar from "@/components/features/word-list/BookProgressBar";
import BookFilterSheet from "@/components/features/word-list/BookFilterSheet";
import CreateBookDialog from "@/components/features/word-list/CreateBookDialog";
import type { ContentFlag, Course } from "@/data/words/types";
import { useContentFilterEnabled } from "@/lib/content-filter";
import type { BookDetailFilter, WordDisplayMode, WordListSortOption } from "@/types";

type BookWord = {
  id: number;
  word: string;
  meaning: string;
  frequencyTier: 1 | 2 | 3;
  contentFlags?: ContentFlag[];
};

// 記憶度ソート用の数値マッピング
const MASTERY_ORDER: Record<ManualMasteryLevel, number> = {
  unlearned: 0,
  weak: 1,
  vague: 2,
  almost: 3,
  remembered: 4,
};

const DEFAULT_FILTER: BookDetailFilter = {
  accuracyRange: [0, 100],
  daysSince: null,
  masteryLevels: [],
  tiers: [],
};

function resolveBookWords(
  bookId: string,
  myBooks: MyVocabBook[],
  statsMap: Map<number, WordStats>,
  manualMap: Record<number, ManualMasteryLevel>
): BookWord[] {
  const parts = bookId.split(":");
  const type = parts[0];

  const toBookWord = (w: { id: number; word: string; meaning: string; frequencyTier: 1 | 2 | 3; contentFlags?: ContentFlag[] }): BookWord => ({
    id: w.id,
    word: w.word,
    meaning: w.meaning,
    frequencyTier: w.frequencyTier,
    contentFlags: w.contentFlags,
  });

  if (type === "course") {
    const course = parts[1] as Course;
    const stage = parts[2];
    const raw = getWordsByCourse(course, stage as Parameters<typeof getWordsByCourse>[1]);
    return raw.map(toBookWord);
  }

  if (type === "mastery") {
    const level = parts[1] as ManualMasteryLevel;
    return allWordList
      .filter((w) => getDisplayedManualMastery(w.id, statsMap, manualMap) === level)
      .map(toBookWord);
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
        .map(toBookWord);
    }
    const [lo, hi] = range.split("-").map(Number);
    return allWordList
      .filter((w) => {
        const stats = statsMap.get(w.id);
        if (!stats || stats.totalAttempts === 0) return false;
        const acc = stats.accuracy;
        return acc >= lo && acc < hi;
      })
      .map(toBookWord);
  }

  if (type === "recommended") {
    const id = parts.slice(1).join(":");
    const recBook = RECOMMENDED_BOOKS.find((b) => b.id === id);
    if (!recBook) return [];
    const wordSet = new Map<number, BookWord>();
    for (const course of recBook.courses) {
      for (const w of getWordsByCourse(course as Course)) {
        wordSet.set(w.id, toBookWord(w));
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
      .map(toBookWord);
  }

  return [];
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawBookId = params.bookId as string;
  const bookId = decodeURIComponent(rawBookId);
  const contentFilterEnabled = useContentFilterEnabled();

  const [isMounted, setIsMounted] = useState(false);
  // My単語帳リスト（bookMeta/bookWords の解決 と BookmarkSelectDialog の両方で共用）
  const [myBooks, setMyBooks] = useState<MyVocabBook[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [statsMap, setStatsMap] = useState<Map<number, WordStats>>(new Map());
  const [manualMap, setManualMap] = useState<Record<number, ManualMasteryLevel>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkDialog, setBookmarkDialog] = useState<{ wordId: number; wordText: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const pendingQuizStartRef = useRef<(() => void) | null>(null);
  // 出題設定（⚙️パネルで変更、FC/クイズ開始時に使用）
  const [studySettings, setStudySettings] = useState<StudySettings>({
    countMode: 10,
    sortBy: "random" as SortBy,
  });

  // 単語リスト表示ソート（⚙️の StudySettings とは独立）
  const [listSortBy, setListSortBy] = useState<WordListSortOption>("default");

  // 絞り込み
  const [listFilter, setListFilter] = useState<BookDetailFilter>(DEFAULT_FILTER);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // 表示モード
  const [displayMode, setDisplayMode] = useState<WordDisplayMode>("both");

  // 再生
  const isPlayingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(-1);

  useEffect(() => {
    setIsMounted(true);
    setMyBooks(vocabularyBooks.getMyVocabBooks());
    setIsFavorite(vocabularyBooks.isFavoriteBook(bookId));
    vocabularyBooks.addRecentlyViewedBook(bookId);

    // 保存済み学習設定の読み込み
    const saved = vocabularyBooks.loadBookStudySettings(bookId) as StudySettings | null;
    if (saved && saved.countMode !== undefined && saved.sortBy !== undefined) {
      setStudySettings(saved);
    }

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

  // ページ離脱時に再生を停止
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      stopSpeaking();
    };
  }, []);

  const bookMeta = useMemo(
    () => (isMounted ? resolveBookMeta(bookId, myBooks) : null),
    [bookId, myBooks, isMounted]
  );

  const bookWords = useMemo(
    () => (isMounted ? resolveBookWords(bookId, myBooks, statsMap, manualMap) : []),
    [bookId, myBooks, statsMap, manualMap, isMounted]
  );

  const filteredWords = useMemo(() => {
    // 0. コンテンツフィルター
    let result = contentFilterEnabled
      ? bookWords.filter((w) => !w.contentFlags || w.contentFlags.length === 0)
      : bookWords;

    // 1. 検索フィルター
    result = !searchQuery
      ? result
      : result.filter(
          (w) =>
            w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.meaning.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // 2. 正答率フィルター
    const [accMin, accMax] = listFilter.accuracyRange;
    if (accMin > 0 || accMax < 100) {
      result = result.filter((w) => {
        const acc = statsMap.get(w.id)?.accuracy ?? null;
        if (acc === null) return accMin === 0; // 未学習は下限0のときのみ含む
        return acc >= accMin && acc <= accMax;
      });
    }

    // 3. 最終遭遇日フィルター
    if (listFilter.daysSince !== null) {
      const cutoffMs = Date.now() - listFilter.daysSince * 86400000;
      result = result.filter((w) => {
        const lastStudied = statsMap.get(w.id)?.lastStudiedAt ?? null;
        if (!lastStudied) return false;
        return new Date(lastStudied).getTime() <= cutoffMs;
      });
    }

    // 4. 記憶度フィルター
    if (listFilter.masteryLevels.length > 0) {
      result = result.filter((w) => {
        const m = getDisplayedManualMastery(w.id, statsMap, manualMap);
        return (listFilter.masteryLevels as ManualMasteryLevel[]).includes(m);
      });
    }

    // 5. 頻出度ティアフィルター
    if (listFilter.tiers.length > 0) {
      result = result.filter((w) => listFilter.tiers.includes(w.frequencyTier));
    }

    // 6. ソート
    if (listSortBy !== "default") {
      result = [...result].sort((a, b) => {
        switch (listSortBy) {
          case "alphabetical":
            return a.word.localeCompare(b.word);
          case "alphabetical-desc":
            return b.word.localeCompare(a.word);
          case "accuracy":
            return (statsMap.get(a.id)?.accuracy ?? -1) - (statsMap.get(b.id)?.accuracy ?? -1);
          case "accuracy-desc":
            return (statsMap.get(b.id)?.accuracy ?? -1) - (statsMap.get(a.id)?.accuracy ?? -1);
          case "attempts":
            return (statsMap.get(b.id)?.totalAttempts ?? 0) - (statsMap.get(a.id)?.totalAttempts ?? 0);
          case "attempts-asc":
            return (statsMap.get(a.id)?.totalAttempts ?? 0) - (statsMap.get(b.id)?.totalAttempts ?? 0);
          case "mastery-asc":
            return (
              MASTERY_ORDER[getDisplayedManualMastery(a.id, statsMap, manualMap)] -
              MASTERY_ORDER[getDisplayedManualMastery(b.id, statsMap, manualMap)]
            );
          case "mastery-desc":
            return (
              MASTERY_ORDER[getDisplayedManualMastery(b.id, statsMap, manualMap)] -
              MASTERY_ORDER[getDisplayedManualMastery(a.id, statsMap, manualMap)]
            );
          default:
            return 0;
        }
      });
    }

    return result;
  }, [bookWords, contentFilterEnabled, searchQuery, statsMap, manualMap, listSortBy, listFilter]);

  const handleToggleFavorite = useCallback(() => {
    const next = vocabularyBooks.toggleFavoriteBook(bookId);
    setIsFavorite(next);
  }, [bookId]);

  const handleBookmarkToggle = useCallback((bookIdParam: string, wordId: number) => {
    vocabularyBooks.toggleWordInBook(bookIdParam, wordId);
    setMyBooks(vocabularyBooks.getMyVocabBooks());
  }, []);

  const handleCreateBook = useCallback((name: string) => {
    const created = vocabularyBooks.createMyVocabBook(name);
    if (!created) {
      alert(`My単語帳は最大${vocabularyBooks.getMyVocabBookLimit()}冊まで作成できます。`);
      return;
    }
    setMyBooks(vocabularyBooks.getMyVocabBooks());
  }, []);

  const getRegisteredBookIds = useCallback(
    (wordId: number) => vocabularyBooks.getBooksForWord(wordId),
    []
  );

  const isFilterActive = useMemo(
    () =>
      listFilter.accuracyRange[0] > 0 ||
      listFilter.accuracyRange[1] < 100 ||
      listFilter.daysSince !== null ||
      listFilter.masteryLevels.length > 0 ||
      listFilter.tiers.length > 0,
    [listFilter]
  );

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      stopSpeaking();
      isPlayingRef.current = false;
      setIsPlaying(false);
      setPlayingIndex(-1);
      return;
    }
    const words = filteredWords;
    const playNext = (index: number) => {
      if (!isPlayingRef.current || index >= words.length) {
        setIsPlaying(false);
        setPlayingIndex(-1);
        isPlayingRef.current = false;
        return;
      }
      setPlayingIndex(index);
      speakWord(words[index].word, {
        onEnd: () => setTimeout(() => playNext(index + 1), 400),
      });
    };
    isPlayingRef.current = true;
    setIsPlaying(true);
    playNext(0);
  }, [isPlaying, filteredWords]);

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

  // 単語帳の複製（My単語帳として保存）
  const handleDuplicateCreate = useCallback((name: string) => {
    const newBook = vocabularyBooks.createMyVocabBook(name);
    if (!newBook) {
      alert(`My単語帳は最大${vocabularyBooks.getMyVocabBookLimit()}冊まで作成できます。`);
      return;
    }
    for (const w of bookWords) {
      vocabularyBooks.addWordToBook(newBook.id, w.id);
    }
    setMyBooks(vocabularyBooks.getMyVocabBooks());
    router.push(`/word-list/book/my:${newBook.id}`);
  }, [bookWords, router]);

  // フラッシュカード開始（特定の単語から直接）— 個別単語行の🃏ボタン用
  const handleStartFlashcardAt = useCallback((startWordId: number) => {
    const wordIds = filteredWords.map((w) => w.id);
    const startIndex = Math.max(0, filteredWords.findIndex((w) => w.id === startWordId));
    saveQuickFlashcardSession(wordIds, startIndex);
    router.push("/flashcard");
  }, [filteredWords, router]);

  // 現在の出題設定を使ってフラッシュカード開始（底部ボタン用）
  const handleStartFlashcard = useCallback(() => {
    const wordIds = computeWordIds(
      filteredWords.map((w) => w.id),
      studySettings.countMode,
      studySettings.sortBy,
      statsMap,
      manualMap
    );
    saveQuickFlashcardSession(wordIds);
    router.push("/flashcard");
  }, [filteredWords, studySettings, statsMap, manualMap, router]);

  // 現在の出題設定を使ってクイズ開始（底部ボタン用）
  const handleStartQuiz = useCallback(() => {
    const startQuiz = () => {
      const wordIds = computeWordIds(
        filteredWords.map((w) => w.id),
        studySettings.countMode,
        studySettings.sortBy,
        statsMap,
        manualMap
      );
      saveBookWordIds(wordIds);
      router.push("/quiz?bookWords=true");
    };

    if (getQuizProgressState()) {
      pendingQuizStartRef.current = startQuiz;
      setShowDiscardConfirm(true);
    } else {
      startQuiz();
    }
  }, [filteredWords, studySettings, statsMap, manualMap, router]);

  const handleStartTimeAttack = useCallback(() => {
    const wordIds = computeWordIds(
      filteredWords.map((w) => w.id),
      studySettings.countMode,
      studySettings.sortBy,
      statsMap,
      manualMap
    );
    const key = `book:${bookId}`;
    saveTimeAttackContext({
      wordIds,
      bestKey: key,
      settingsLabel: bookMeta?.name ?? bookId,
    });
    router.push("/speed-challenge");
  }, [filteredWords, studySettings, statsMap, manualMap, router, bookId, bookMeta]);

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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => router.push("/word-list")}
              className="text-slate-900/80 hover:text-slate-900 dark:text-white/80 dark:hover:text-white transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl emoji-icon">{bookMeta.emoji}</span>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">{bookMeta.name}</h1>
              </div>
              <p className="text-slate-900/80 dark:text-white/70 text-xs mt-0.5">{bookWords.length}語</p>
            </div>
            {/* アクションボタン群 */}
            {/* My単語帳削除ボタン */}
            {isMyBook && (
              <button
                onClick={handleDeleteBook}
                className="p-2 rounded-full bg-white/20 hover:bg-red-500/60 transition-colors flex-shrink-0"
                title="この単語帳を削除"
              >
                <svg className="w-4 h-4 text-slate-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            {/* 複製ボタン */}
            <button
              onClick={() => setShowDuplicateDialog(true)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
              title="この単語帳を複製してMy単語帳に追加"
            >
              <svg className="w-4 h-4 text-slate-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            {/* お気に入りボタン */}
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
              title={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
            >
              <svg
                className="w-5 h-5 text-slate-900 dark:text-white"
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
            {/* 設定ボタン ⚙️ */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
              title="学習設定"
            >
              <svg className="w-4 h-4 text-slate-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

      {/* 進捗バー */}
      {bookWords.length > 0 && (
        <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
          <div className="max-w-4xl mx-auto">
            <BookProgressBar words={bookWords} statsMap={statsMap} manualMap={manualMap} />
          </div>
        </div>
      )}

      {/* ツールバー（並び替え・絞り込み・表示切替・再生） */}
      <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
        <div className="max-w-4xl mx-auto flex items-center gap-2 px-3 py-2 overflow-x-auto">
          {/* ソート */}
          <select
            value={listSortBy}
            onChange={(e) => setListSortBy(e.target.value as WordListSortOption)}
            className="text-xs py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none flex-shrink-0"
          >
            <option value="default">↕ 並び順</option>
            <option value="mastery-asc">記憶度 低→高</option>
            <option value="mastery-desc">記憶度 高→低</option>
            <option value="alphabetical">A → Z</option>
            <option value="alphabetical-desc">Z → A</option>
            <option value="attempts-asc">遭遇回数 少→多</option>
            <option value="attempts">遭遇回数 多→少</option>
            <option value="accuracy">正答率 低→高</option>
            <option value="accuracy-desc">正答率 高→低</option>
          </select>

          {/* 絞り込み */}
          <button
            onClick={() => setShowFilterSheet(true)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs flex-shrink-0 transition-colors ${
              isFilterActive
                ? "border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
            }`}
          >
            ▽ 絞り込み{isFilterActive ? " ●" : ""}
          </button>

          {/* 表示モード */}
          <button
            onClick={() =>
              setDisplayMode((m) =>
                m === "both" ? "hide-meaning" : m === "hide-meaning" ? "hide-word" : "both"
              )
            }
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-xs flex-shrink-0 text-slate-600 dark:text-slate-300 whitespace-nowrap"
          >
            文A{" "}
            {displayMode === "both"
              ? "両方表示"
              : displayMode === "hide-meaning"
              ? "和訳を隠す"
              : "単語を隠す"}
          </button>

          {/* 再生 */}
          <button
            onClick={handlePlay}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs flex-shrink-0 transition-colors ${
              isPlaying
                ? "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
            }`}
          >
            {isPlaying ? "■ 停止" : "▶ 再生"}
          </button>
        </div>
      </div>

      {/* 単語リスト */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto space-y-0">
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
                    className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 transition-colors ${
                      idx !== 0 ? "border-t border-slate-100 dark:border-slate-700" : ""
                    } ${
                      idx === playingIndex
                        ? "bg-primary-50 dark:bg-primary-900/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* 左側: 操作ボタン */}
                        <SpeakButton text={word.word} size="sm" />
                        {/* フラッシュカードボタン */}
                        <button
                          onClick={() => handleStartFlashcardAt(word.id)}
                          className="p-1.5 rounded-lg text-slate-300 dark:text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex-shrink-0"
                          title="この単語からフラッシュカード開始"
                        >
                          <span className="text-xs emoji-icon">🃏</span>
                        </button>
                        {/* ブックマーク（単語帳選択） */}
                        {(() => {
                          const isInMyBook = myBooks.some((b) => b.wordIds.includes(word.id));
                          return (
                            <button
                              onClick={() => setBookmarkDialog({ wordId: word.id, wordText: word.word })}
                              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                                isInMyBook
                                  ? "text-yellow-500 hover:text-yellow-600"
                                  : "text-slate-300 dark:text-slate-500 hover:text-yellow-400"
                              }`}
                              title="単語帳に追加"
                            >
                              <svg
                                className="w-4 h-4"
                                fill={isInMyBook ? "currentColor" : "none"}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                          );
                        })()}
                      </div>
                      {/* 単語詳細リンク */}
                      <Link
                        href={`/word/${word.id}`}
                        className="flex items-start flex-1 min-w-0 group gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          {/* 単語（displayModeで表示切替） */}
                          {displayMode !== "hide-word" ? (
                            <p className="font-bold text-base sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors break-words">
                              {word.word}
                            </p>
                          ) : (
                            <p className="font-bold text-primary-300 dark:text-primary-700 text-sm select-none">
                              ●●●
                            </p>
                          )}
                          {/* 意味（displayModeで表示切替） */}
                          {displayMode !== "hide-meaning" ? (
                            <p className="text-sm sm:text-xs text-slate-500 dark:text-slate-400 break-words">{word.meaning}</p>
                          ) : (
                            <p className="text-xs text-slate-300 dark:text-slate-600 select-none">- - -</p>
                          )}
                          <div
                            className="mt-1 flex items-center gap-1 sm:hidden"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <span className={`text-[10px] px-1 py-0.5 rounded border whitespace-nowrap ${getAccuracyBadgeClass(hasAttempts ? stats.accuracy : null)}`}>
                              正答率 {hasAttempts ? `${stats.accuracy}%` : "-"}
                            </span>
                            <select
                              value={mastery}
                              onChange={(e) => handleManualMasteryChange(word.id, e.target.value as ManualMasteryLevel)}
                              className={`text-[10px] px-1.5 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-primary-400 ${getMasteryBadgeClass(mastery)}`}
                            >
                              {MANUAL_MASTERY_OPTIONS_ORDERED
                                .filter((opt) => !hasAttempts || opt.key !== "unlearned")
                                .map((opt) => (
                                  <option key={`${word.id}-${opt.key}`} value={opt.key}>
                                    {opt.label}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-slate-300 dark:text-slate-500 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                    {/* 右側: 正答率・記憶度セレクト */}
                    <div className="hidden sm:block w-[170px] flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <span className={`text-[10px] px-1 py-0.5 rounded border whitespace-nowrap ${getAccuracyBadgeClass(hasAttempts ? stats.accuracy : null)}`}>
                          正答率 {hasAttempts ? `${stats.accuracy}%` : "-"}
                        </span>
                        <select
                          value={mastery}
                          onChange={(e) => handleManualMasteryChange(word.id, e.target.value as ManualMasteryLevel)}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-[10px] px-1.5 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-primary-400 ${getMasteryBadgeClass(mastery)}`}
                        >
                          {MANUAL_MASTERY_OPTIONS_ORDERED
                            .filter((opt) => !hasAttempts || opt.key !== "unlearned")
                            .map((opt) => (
                              <option key={`${word.id}-${opt.key}`} value={opt.key}>
                                {opt.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 下部ボタン（現在の設定で直接開始） */}
      {filteredWords.length > 0 && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto flex gap-2">
            <button
              onClick={handleStartFlashcard}
              className="flex items-center justify-center gap-1.5 flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs whitespace-nowrap"
            >
              <span className="emoji-icon">🃏</span>
              カード
            </button>
            <button
              onClick={handleStartQuiz}
              className="flex items-center justify-center gap-1.5 flex-1 py-3 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors text-xs whitespace-nowrap shadow-sm"
            >
              <span className="emoji-icon">📝</span>
              クイズ
            </button>
            <button
              onClick={handleStartTimeAttack}
              className="flex items-center justify-center gap-1.5 flex-1 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors text-xs whitespace-nowrap shadow-sm"
            >
              <span className="emoji-icon">⚡</span>
              スピード
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
          canCreate={vocabularyBooks.canCreateMyVocabBook()}
          maxCount={vocabularyBooks.getMyVocabBookLimit()}
        />
      )}

      {/* 学習設定ダイアログ（⚙️から開く） */}
      {showSettings && (
        <BookStudySettingsDialog
          allWordIds={filteredWords.map((w) => w.id)}
          currentSettings={studySettings}
          onSave={(settings) => {
            setStudySettings(settings);
            vocabularyBooks.saveBookStudySettings(bookId, settings);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 複製ダイアログ */}
      {showDuplicateDialog && (
        <CreateBookDialog
          defaultName={`${bookMeta.name} のコピー`}
          onCreate={handleDuplicateCreate}
          onClose={() => setShowDuplicateDialog(false)}
          isDisabled={!vocabularyBooks.canCreateMyVocabBook()}
          maxCount={vocabularyBooks.getMyVocabBookLimit()}
        />
      )}

      {/* 絞り込みパネル */}
      {showFilterSheet && (
        <BookFilterSheet
          filter={listFilter}
          onApply={(f) => {
            setListFilter(f);
            setShowFilterSheet(false);
          }}
          onClose={() => setShowFilterSheet(false)}
        />
      )}

      {/* 途中クイズ破棄確認ダイアログ */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl emoji-icon">⚠️</span>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">前回の途中クイズがあります</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
              新しいクイズを始めると、前回の途中クイズは破棄されます。よろしいですか？
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  clearQuizProgressState();
                  setShowDiscardConfirm(false);
                  pendingQuizStartRef.current?.();
                  pendingQuizStartRef.current = null;
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
              >
                破棄して開始
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
