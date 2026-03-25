"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Course, Stage } from "@/data/words/types";
import { COURSE_DEFINITIONS } from "@/data/words/courses";
import { words, categoryLabels, Category, getWordsByCourse } from "@/data/words";
import { unifiedStorage } from "@/lib/unified-storage";
import { vocabularyBooks, type MyVocabBook } from "@/lib/vocabulary-books";
import { Card, SpeakButton } from "@/components/ui";
import { getMasteryLevel } from "@/types";
import type { MasteryLevel, WordListSortOption } from "@/types";
import type { ManualMasteryLevel } from "@/lib/storage";
import { MANUAL_MASTERY_OPTIONS_ORDERED } from "@/lib/manual-mastery";
import BookmarkSelectDialog from "@/components/features/word-list/BookmarkSelectDialog";
import { getAccuracyBadgeClass } from "@/lib/accuracy-style";
import { getMasteryBadgeClass } from "@/lib/mastery-style";
import {
  type WordListAccuracyFilter,
  saveQuickFlashcardSession,
  saveWordListFilter, getWordListFilter, clearWordListFilter,
} from "@/lib/flashcard-session";
import { saveWordNavState } from "@/lib/word-nav-state";

type WordWithStats = {
  id: number;
  word: string;
  meaning: string;
  category: string;
  categories?: string[];
  difficulty: number;
  mastery: MasteryLevel;
  accuracy: number | null;
  attempts: number;
  isBookmarked: boolean;
  example?: string;
  exampleJa?: string;
};

type SortOption = WordListSortOption;

const sortLabels: Record<SortOption, string> = {
  default: "デフォルト",
  alphabetical: "アルファベット順 (A→Z)",
  "alphabetical-desc": "アルファベット順 (Z→A)",
  accuracy: "正答率が低い順",
  "accuracy-desc": "正答率が高い順",
  attempts: "遭遇回数が多い順",
  "attempts-asc": "遭遇回数が少ない順",
  "mastery-asc": "記憶度が低い順",
  "mastery-desc": "記憶度が高い順",
  difficulty: "難易度順",
};

// 記憶度ソート用の数値マッピング（mastery-asc / mastery-desc で共有）
const MASTERY_ORDER: Record<string, number> = { unlearned: 0, weak: 1, vague: 2, almost: 3, remembered: 4 };

const memoryFilterOptions: { key: ManualMasteryLevel | "all"; label: string }[] = [
  { key: "all", label: "全て" },
  { key: "remembered", label: "覚えた単語" },
  { key: "almost", label: "ほぼ覚えた単語" },
  { key: "vague", label: "うろ覚え単語" },
  { key: "weak", label: "苦手単語" },
  { key: "unlearned", label: "未学習単語" },
];

const accuracyFilterOptions: { key: WordListAccuracyFilter; label: string }[] = [
  { key: "all", label: "全て" },
  { key: "100", label: "100%" },
  { key: "67-99", label: "67-99%" },
  { key: "34-66", label: "34-66%" },
  { key: "0-33", label: "0-33%" },
  { key: "unattempted", label: "未回答" },
];

const categories: (Category | "all")[] = [
  "all",
  "daily", "school", "family", "food", "hobby",
  "nature", "health", "sports", "culture",
  "business", "office", "travel", "shopping",
  "finance", "technology", "communication",
  "greeting", "emotion", "opinion", "request", "smalltalk",
];

const categoryLabelMap: Record<Category | "all", string> = {
  all: "全て",
  ...categoryLabels,
};

const mapLegacyMasteryToMemory = (legacy: MasteryLevel | "all"): ManualMasteryLevel | "all" => {
  if (legacy === "new") return "unlearned";
  if (legacy === "learning") return "weak";
  if (legacy === "familiar") return "almost";
  if (legacy === "mastered") return "remembered";
  return "all";
};

export default function WordListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMastery = (searchParams.get("mastery") as MasteryLevel | null) ?? "all";
  const initialCourse = (searchParams.get("course") as Course | null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | "all">("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(
    initialCourse && Object.keys(COURSE_DEFINITIONS).includes(initialCourse) ? initialCourse : null
  );
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<ManualMasteryLevel | "all">(
    mapLegacyMasteryToMemory(["new", "learning", "familiar", "mastered"].includes(initialMastery) ? initialMastery as MasteryLevel : "all")
  );
  const [selectedAccuracy, setSelectedAccuracy] = useState<WordListAccuracyFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [wordsWithStats, setWordsWithStats] = useState<WordWithStats[]>([]);
  const [manualMasteryById, setManualMasteryById] = useState<Record<number, ManualMasteryLevel>>({});
  const [myBooks, setMyBooks] = useState<MyVocabBook[]>([]);
  const [bookmarkDialog, setBookmarkDialog] = useState<{ wordId: number; wordText: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  // 仮想スクロール: 表示件数制限（メモリ/DOM溢れ防止）
  const [displayLimit, setDisplayLimit] = useState(100);
  // スクロール位置の保存・復元用
  const listScrollRef = useRef<HTMLDivElement>(null);
  const pendingScrollTopRef = useRef<number | null>(null);

  // フラッシュカード・リストモード共通: 詳細画面から戻った際にフィルター状態を復元
  useEffect(() => {
    // リストモードのフィルターセッションを確認
    const filterSession = getWordListFilter();
    if (!filterSession) return;
    clearWordListFilter();
    setSelectedCourse(filterSession.selectedCourse);
    setSelectedStage(filterSession.selectedStage);
    setSelectedCategory(filterSession.selectedCategory);
    setSelectedDifficulty(filterSession.selectedDifficulty);
    setSelectedMemory(
      filterSession.selectedMemory ??
      mapLegacyMasteryToMemory(filterSession.selectedMastery ?? "all")
    );
    setSelectedAccuracy(filterSession.selectedAccuracy ?? "all");
    setSearchQuery(filterSession.searchQuery);
    setShowBookmarksOnly(filterSession.showBookmarksOnly);
    setSortOption(filterSession.sortOption);
    // スクロール位置を復元予約（データ読み込み完了後に適用）
    if (filterSession.scrollTop > 0) {
      pendingScrollTopRef.current = filterSession.scrollTop;
    }
  }, []);

  // Load word stats and bookmarks on mount
  useEffect(() => {
    setIsMounted(true);
    const loadData = async () => {
      const [statsMap, manualMap] = await Promise.all([
        unifiedStorage.getWordStats(),
        unifiedStorage.getManualMasteryMap(),
      ]);
      const books = vocabularyBooks.getMyVocabBooks();
      const bookmarkedSet = new Set(books.flatMap((b) => b.wordIds));

      const enrichedWords: WordWithStats[] = words.map((word) => {
        const stats = statsMap.get(word.id);
        const accuracy = stats?.accuracy ?? null;
        const attempts = stats?.totalAttempts ?? 0;

        return {
          id: word.id,
          word: word.word,
          meaning: word.meaning,
          category: word.category,
          categories: word.categories,
          difficulty: word.difficulty,
          mastery: getMasteryLevel(accuracy, attempts),
          accuracy,
          attempts,
          isBookmarked: bookmarkedSet.has(word.id),
          example: word.example,
          exampleJa: word.exampleJa,
        };
      });

      setWordsWithStats(enrichedWords);
      setManualMasteryById(manualMap);
      setMyBooks(books);
    };
    loadData();
  }, []);

  const resolveMastery = useCallback((word: WordWithStats): MasteryLevel => {
    const manual = manualMasteryById[word.id];
    if (manual) {
      if (manual === "unlearned") return word.attempts === 0 ? "new" : word.mastery;
      if (manual === "remembered") return "mastered";
      if (manual === "almost") return "familiar";
      if (manual === "vague") return "learning";
      return "learning"; // weak
    }
    return word.mastery;
  }, [manualMasteryById]);

  const getDisplayedManualMastery = useCallback((word: WordWithStats): ManualMasteryLevel => {
    const manual = manualMasteryById[word.id];
    if (manual && !(manual === "unlearned" && word.attempts > 0)) {
      return manual;
    }
    if (word.attempts === 0) return "unlearned";
    if (word.accuracy === null || word.accuracy < 34) return "weak";
    if (word.accuracy < 67) return "vague";
    if (word.accuracy < 100) return "almost";
    return "remembered";
  }, [manualMasteryById]);

  const handleManualMasteryChange = useCallback(async (wordId: number, mastery: ManualMasteryLevel) => {
    setManualMasteryById((prev) => ({ ...prev, [wordId]: mastery }));
    await unifiedStorage.setManualMastery(wordId, mastery);
  }, []);

  const matchesAccuracyFilter = useCallback((word: WordWithStats, filter: WordListAccuracyFilter): boolean => {
    if (filter === "all") return true;
    if (filter === "unattempted") return word.attempts === 0;
    if (word.attempts === 0 || word.accuracy === null) return false;
    if (filter === "0-33") return word.accuracy < 34;
    if (filter === "34-66") return word.accuracy >= 34 && word.accuracy < 67;
    if (filter === "67-99") return word.accuracy >= 67 && word.accuracy < 100;
    return word.accuracy === 100;
  }, []);

  // データ読み込み完了後、保留中のスクロール位置を適用
  useEffect(() => {
    if (pendingScrollTopRef.current === null || !listScrollRef.current) return;
    const scrollTo = pendingScrollTopRef.current;
    pendingScrollTopRef.current = null;
    listScrollRef.current.scrollTop = scrollTo;
  }, [wordsWithStats]);

  const refreshMyBooks = useCallback(() => {
    const books = vocabularyBooks.getMyVocabBooks();
    setMyBooks(books);
    const bookmarkedSet = new Set(books.flatMap((b) => b.wordIds));
    setWordsWithStats((prev) =>
      prev.map((w) => ({ ...w, isBookmarked: bookmarkedSet.has(w.id) }))
    );
  }, []);

  const handleBookmarkToggle = useCallback((bookIdParam: string, wordId: number) => {
    vocabularyBooks.toggleWordInBook(bookIdParam, wordId);
    refreshMyBooks();
  }, [refreshMyBooks]);

  const handleCreateBook = useCallback((name: string) => {
    const created = vocabularyBooks.createMyVocabBook(name);
    if (!created) {
      alert(`My単語帳は最大${vocabularyBooks.getMyVocabBookLimit()}冊まで作成できます。`);
      return;
    }
    refreshMyBooks();
  }, [refreshMyBooks]);

  const getRegisteredBookIds = useCallback(
    (wordId: number) => vocabularyBooks.getBooksForWord(wordId),
    []
  );

  // Course word IDs (shared between filteredWords and stats)
  const courseWordIds = useMemo(() => {
    if (!selectedCourse) return null;
    const courseWords = getWordsByCourse(selectedCourse, selectedStage ?? undefined);
    return new Set(courseWords.map((w) => w.id));
  }, [selectedCourse, selectedStage]);

  // 正答率・記憶度フィルターを除く全フィルターを適用したベースリスト
  // filteredWords / filteredAccuracyCounts / filteredMemoryCounts の共通母集団
  const baseFilteredWords = useMemo(() => {
    return wordsWithStats.filter((word) => {
      if (courseWordIds && !courseWordIds.has(word.id)) return false;
      if (showBookmarksOnly && !word.isBookmarked) return false;
      if (selectedCategory !== "all") {
        const wordCategories = word.categories && word.categories.length > 0
          ? word.categories
          : [word.category];
        if (!wordCategories.includes(selectedCategory)) return false;
      }
      if (selectedDifficulty !== "all" && word.difficulty !== selectedDifficulty) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          word.word.toLowerCase().includes(query) ||
          word.meaning.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [wordsWithStats, courseWordIds, showBookmarksOnly, selectedCategory, selectedDifficulty, searchQuery]);

  // Filter words based on search, category, difficulty, bookmarks, accuracy, and memory
  const filteredWords = useMemo(() => {
    let filtered = baseFilteredWords;

    // Accuracy filter
    if (selectedAccuracy !== "all") {
      filtered = filtered.filter((word) => matchesAccuracyFilter(word, selectedAccuracy));
    }

    // Memory filter
    if (selectedMemory !== "all") {
      filtered = filtered.filter((word) => getDisplayedManualMastery(word) === selectedMemory);
    }

    // Sort
    if (sortOption !== "default") {
      filtered = [...filtered].sort((a, b) => {
        switch (sortOption) {
          case "alphabetical":
            return a.word.localeCompare(b.word);
          case "alphabetical-desc":
            return b.word.localeCompare(a.word);
          case "accuracy":
            // Null values (unstudied) go to the end
            if (a.accuracy === null && b.accuracy === null) return 0;
            if (a.accuracy === null) return 1;
            if (b.accuracy === null) return -1;
            return a.accuracy - b.accuracy;
          case "accuracy-desc":
            if (a.accuracy === null && b.accuracy === null) return 0;
            if (a.accuracy === null) return 1;
            if (b.accuracy === null) return -1;
            return b.accuracy - a.accuracy;
          case "attempts":
            return b.attempts - a.attempts;
          case "attempts-asc":
            return a.attempts - b.attempts;
          case "mastery-asc": {
            const aM = MASTERY_ORDER[getDisplayedManualMastery(a)] ?? 0;
            const bM = MASTERY_ORDER[getDisplayedManualMastery(b)] ?? 0;
            return aM - bM;
          }
          case "mastery-desc": {
            const aM = MASTERY_ORDER[getDisplayedManualMastery(a)] ?? 0;
            const bM = MASTERY_ORDER[getDisplayedManualMastery(b)] ?? 0;
            return bM - aM;
          }
          case "difficulty":
            return a.difficulty - b.difficulty;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [baseFilteredWords, selectedAccuracy, selectedMemory, sortOption, matchesAccuracyFilter, getDisplayedManualMastery]);

  // フィルタ変更時に表示件数をリセット
  useEffect(() => { setDisplayLimit(100); }, [baseFilteredWords, selectedAccuracy, selectedMemory, sortOption]);

  // wordId → filteredWords 内インデックスの逆引き Map（フラッシュカード開始位置に使用）
  const wordIndexMap = useMemo(
    () => new Map(filteredWords.map((w, i) => [w.id, i])),
    [filteredWords]
  );

  const handleStartFlashcardAt = useCallback((startWordId?: number) => {
    const wordIds = filteredWords.map((w) => w.id);
    if (wordIds.length === 0) return;
    const startIndex = startWordId ? (wordIndexMap.get(startWordId) ?? 0) : 0;
    saveWordListFilter({
      selectedCourse,
      selectedStage,
      selectedCategory,
      selectedDifficulty,
      selectedMemory,
      selectedAccuracy,
      searchQuery,
      showBookmarksOnly,
      sortOption,
      scrollTop: listScrollRef.current?.scrollTop ?? 0,
    });
    saveQuickFlashcardSession(wordIds, startIndex);
    router.push("/flashcard");
  }, [
    filteredWords,
    wordIndexMap,
    selectedCourse,
    selectedStage,
    selectedCategory,
    selectedDifficulty,
    selectedMemory,
    selectedAccuracy,
    searchQuery,
    showBookmarksOnly,
    sortOption,
    router,
  ]);

  // Group words by category
  const groupedWords = useMemo(() => {
    if (selectedCategory !== "all" || selectedCourse !== null) {
      return { [selectedCategory !== "all" ? selectedCategory : "all"]: filteredWords };
    }

    const grouped: Record<string, WordWithStats[]> = {};
    for (const word of filteredWords) {
      if (!grouped[word.category]) {
        grouped[word.category] = [];
      }
      grouped[word.category].push(word);
    }
    return grouped;
  }, [filteredWords, selectedCategory, selectedCourse]);

  // Stats summary
  const stats = useMemo(() => {
    const baseWords = courseWordIds
      ? wordsWithStats.filter((w) => courseWordIds.has(w.id))
      : wordsWithStats;
    const total = baseWords.length;
    const mastered = baseWords.filter((w) => resolveMastery(w) === "mastered").length;
    const familiar = baseWords.filter((w) => resolveMastery(w) === "familiar").length;
    const learning = baseWords.filter((w) => resolveMastery(w) === "learning").length;
    const newWords = baseWords.filter((w) => resolveMastery(w) === "new").length;
    const bookmarked = baseWords.filter((w) => w.isBookmarked).length;
    return { total, mastered, familiar, learning, newWords, bookmarked };
  }, [wordsWithStats, courseWordIds, resolveMastery]);

  // baseFilteredWords から正答率別件数を集計（正答率フィルターボタンの件数表示に使用）
  const filteredAccuracyCounts = useMemo(() => ({
    all: baseFilteredWords.length,
    unattempted: baseFilteredWords.filter((w) => w.attempts === 0).length,
    "0-33": baseFilteredWords.filter((w) => w.attempts > 0 && w.accuracy !== null && w.accuracy < 34).length,
    "34-66": baseFilteredWords.filter((w) => w.attempts > 0 && w.accuracy !== null && w.accuracy >= 34 && w.accuracy < 67).length,
    "67-99": baseFilteredWords.filter((w) => w.attempts > 0 && w.accuracy !== null && w.accuracy >= 67 && w.accuracy < 100).length,
    "100": baseFilteredWords.filter((w) => w.accuracy === 100).length,
  }), [baseFilteredWords]);

  // baseFilteredWords から記憶度別件数を集計（記憶度フィルターボタンの件数表示に使用）
  const filteredMemoryCounts = useMemo(() => ({
    all: baseFilteredWords.length,
    unlearned: baseFilteredWords.filter((w) => getDisplayedManualMastery(w) === "unlearned").length,
    weak: baseFilteredWords.filter((w) => getDisplayedManualMastery(w) === "weak").length,
    vague: baseFilteredWords.filter((w) => getDisplayedManualMastery(w) === "vague").length,
    almost: baseFilteredWords.filter((w) => getDisplayedManualMastery(w) === "almost").length,
    remembered: baseFilteredWords.filter((w) => getDisplayedManualMastery(w) === "remembered").length,
  }), [baseFilteredWords, getDisplayedManualMastery]);

  const courseLabel = selectedCourse
    ? COURSE_DEFINITIONS[selectedCourse].name
    : null;
  const stageLabel = selectedCourse && selectedStage
    ? COURSE_DEFINITIONS[selectedCourse].stages.find((s) => s.stage === selectedStage)?.displayName
    : null;

  return (
    <div className="main-content px-3 py-2 flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex flex-col h-full">
        {/* 上部固定: ヘッダー */}
        <div className="flex-shrink-0 flex items-center gap-2 mb-1.5">
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1">単語帳</h1>
          {isMounted && filteredWords.length > 0 && (
            <button
              onClick={() => handleStartFlashcardAt()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 text-xs font-medium hover:bg-primary-200 dark:hover:bg-primary-800/40 transition-colors flex-shrink-0"
            >
              <span className="emoji-icon">🃏</span>
              <span>フラッシュカード</span>
            </button>
          )}
        </div>

        {/* 上部固定: 検索・フィルター */}
        <div className="flex-shrink-0 space-y-1.5 mb-1.5">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="単語・意味で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 pl-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Course Filter */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 px-1 whitespace-nowrap">コース</span>
              <div className="overflow-x-auto flex-1 pb-0.5 -mx-1 px-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setSelectedCourse(null); setSelectedStage(null); }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                      selectedCourse === null
                        ? "bg-primary-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    全コース
                  </button>
                  {(Object.keys(COURSE_DEFINITIONS) as Course[])
                    .filter((ct) => COURSE_DEFINITIONS[ct].stages.length > 0)
                    .map((ct) => (
                      <button
                        key={ct}
                        onClick={() => { setSelectedCourse(selectedCourse === ct ? null : ct); setSelectedStage(null); }}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                          selectedCourse === ct
                            ? "bg-primary-500 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {COURSE_DEFINITIONS[ct].name}
                      </button>
                    ))}
                </div>
              </div>
              <button
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  showBookmarksOnly
                    ? "bg-yellow-500 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-yellow-400"
                }`}
              >
                <svg
                  className="w-3 h-3"
                  fill={showBookmarksOnly ? "currentColor" : "none"}
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
                ブックマークのみ ({stats.bookmarked})
              </button>
            </div>
            {selectedCourse && (
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedStage(null)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                    selectedStage === null
                      ? "bg-accent-500 text-white"
                      : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  全レベル
                </button>
                {COURSE_DEFINITIONS[selectedCourse].stages.map((stg) => (
                  <button
                    key={stg.stage}
                    onClick={() => setSelectedStage(selectedStage === stg.stage ? null : stg.stage)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                      selectedStage === stg.stage
                        ? "bg-accent-500 text-white"
                        : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {stg.displayName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 px-1 whitespace-nowrap">カテゴリ</span>
            <div className="overflow-x-auto pb-1 -mx-1 px-1 flex-1">
              <div className="flex gap-1.5">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? "bg-primary-500 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300"
                    }`}
                  >
                    {categoryLabelMap[category]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filters Row 1: 正答率（横スクロール） */}
          <div className="overflow-x-auto pb-0.5 -mx-1 px-1">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 px-1 whitespace-nowrap">正答率</span>
              {accuracyFilterOptions.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedAccuracy(key)}
                  className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    selectedAccuracy === key
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300"
                  }`}
                >
                  {label}
                  {isMounted && filteredAccuracyCounts[key] > 0 && (
                    <span className="ml-1 opacity-70">({filteredAccuracyCounts[key]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row 2: 記憶度（横スクロール） */}
          <div className="overflow-x-auto pb-0.5 -mx-1 px-1">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 px-1 whitespace-nowrap">記憶度</span>
              {memoryFilterOptions.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedMemory(key)}
                  className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    selectedMemory === key
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300"
                  }`}
                >
                  {label}
                  {isMounted && filteredMemoryCounts[key] > 0 && (
                    <span className="ml-1 opacity-70">({filteredMemoryCounts[key]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row 3: Difficulty（横スクロール） + Sort（右端固定） */}
          <div className="flex items-center gap-1.5">
            <div className="overflow-x-auto flex-1 pb-0.5 -mx-1 px-1">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 px-1 whitespace-nowrap">難易度</span>
                <button
                  onClick={() => setSelectedDifficulty("all")}
                  className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    selectedDifficulty === "all"
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300"
                  }`}
                >
                  全て
                </button>
                {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`w-6 h-6 rounded flex-shrink-0 text-xs font-medium transition-all ${
                      selectedDifficulty === level
                        ? "bg-primary-500 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="flex-shrink-0 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredWords.length}語
            {showBookmarksOnly && " (ブックマーク)"}
            {selectedAccuracy !== "all" && ` (正答率: ${accuracyFilterOptions.find((o) => o.key === selectedAccuracy)?.label})`}
            {selectedMemory !== "all" && ` (記憶度: ${memoryFilterOptions.find((o) => o.key === selectedMemory)?.label})`}
            {searchQuery && ` (「${searchQuery}」)`}
            {courseLabel && ` / ${courseLabel}${stageLabel ? ` - ${stageLabel}` : ""}`}
            {selectedDifficulty !== "all" && ` / 難易度${selectedDifficulty}`}
          </p>
        </div>

        {/* 中央スクロール: Word List */}
        {isMounted && (
          <div ref={listScrollRef} className="flex-1 overflow-y-auto min-h-0 space-y-4">
            {(() => {
              // 表示件数制限: 全グループを通じてdisplayLimit件まで表示
              let remaining = displayLimit;
              return Object.entries(groupedWords).map(([category, categoryWords]) => {
                if (remaining <= 0) return null;
                const visibleWords = categoryWords.slice(0, remaining);
                remaining -= visibleWords.length;
                return (
              <div key={category}>
                {selectedCategory === "all" && selectedCourse === null && (
                  <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-400" />
                    {categoryLabelMap[category as Category]} ({categoryWords.length})
                  </h2>
                )}
                <Card className="divide-y divide-slate-100 dark:divide-slate-700">
                  {visibleWords.map((word) => (
                    <div
                      id={`word-item-${word.id}`}
                      key={word.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="flex items-start gap-2 w-full">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <SpeakButton text={word.word} size="sm" />
                          <button
                            onClick={() => {
                              refreshMyBooks();
                              setBookmarkDialog({ wordId: word.id, wordText: word.word });
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              word.isBookmarked
                                ? "text-yellow-500 hover:text-yellow-600"
                                : "text-slate-300 hover:text-yellow-400"
                            }`}
                            title="単語帳に追加"
                          >
                            <svg
                              className="w-4 h-4"
                              fill={word.isBookmarked ? "currentColor" : "none"}
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
                          </button>
                          <button
                            onClick={() => handleStartFlashcardAt(word.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex-shrink-0"
                            title="この単語からフラッシュカード開始"
                          >
                            <span className="text-xs emoji-icon">🃏</span>
                          </button>
                        </div>
                        <Link
                          href={`/word/${word.id}?from=wordlist`}
                          onClick={() => {
                            saveWordListFilter({
                              selectedCourse,
                              selectedStage,
                              selectedCategory,
                              selectedDifficulty,
                              selectedMemory,
                              selectedAccuracy,
                              searchQuery,
                              showBookmarksOnly,
                              sortOption,
                              scrollTop: listScrollRef.current?.scrollTop ?? 0,
                            });
                            saveWordNavState(filteredWords.map((w) => w.id), "wordlist");
                          }}
                          className="flex items-start justify-between gap-2 flex-1 min-w-0 group/link"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-base sm:text-sm text-slate-800 dark:text-slate-100 group-hover/link:text-primary-600 transition-colors break-words">
                              {word.word}
                            </p>
                            <p className="text-sm sm:text-xs text-slate-500 dark:text-slate-400 break-words">
                              {word.meaning}
                            </p>
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
                              <span className={`text-[10px] px-1 py-0.5 rounded border whitespace-nowrap ${getAccuracyBadgeClass(word.accuracy)}`}>
                                正答率 {word.accuracy !== null ? `${word.accuracy}%` : "-"}
                              </span>
                              <select
                                value={getDisplayedManualMastery(word)}
                                onChange={(e) => {
                                  handleManualMasteryChange(word.id, e.target.value as ManualMasteryLevel);
                                }}
                                className={`text-[10px] px-1.5 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-primary-400 ${getMasteryBadgeClass(getDisplayedManualMastery(word))}`}
                              >
                                {MANUAL_MASTERY_OPTIONS_ORDERED
                                  .filter((opt) => word.attempts === 0 || opt.key !== "unlearned")
                                  .map((opt) => (
                                  <option key={`${word.id}-${opt.key}`} value={opt.key}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="text-slate-400 dark:text-slate-500 group-hover/link:text-primary-500 group-hover/link:translate-x-1 transition-all flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      </div>
                      <div className="hidden sm:block w-[170px] flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <span className={`text-[10px] px-1 py-0.5 rounded border whitespace-nowrap ${getAccuracyBadgeClass(word.accuracy)}`}>
                            正答率 {word.accuracy !== null ? `${word.accuracy}%` : "-"}
                          </span>
                          <select
                            value={getDisplayedManualMastery(word)}
                            onChange={(e) => {
                              handleManualMasteryChange(word.id, e.target.value as ManualMasteryLevel);
                            }}
                            className={`text-[10px] px-1.5 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-primary-400 ${getMasteryBadgeClass(getDisplayedManualMastery(word))}`}
                          >
                            {MANUAL_MASTERY_OPTIONS_ORDERED
                              .filter((opt) => word.attempts === 0 || opt.key !== "unlearned")
                              .map((opt) => (
                              <option key={`${word.id}-${opt.key}`} value={opt.key}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
                );
              });
            })()}

            {/* もっと表示ボタン */}
            {filteredWords.length > displayLimit && (
              <div className="flex justify-center py-4">
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 100)}
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  もっと表示（残り{filteredWords.length - displayLimit}語）
                </button>
              </div>
            )}

            {filteredWords.length === 0 && (
              <Card className="text-center py-8">
                <span className="text-4xl mb-3 block emoji-icon">🔍</span>
                <p className="text-slate-500 dark:text-slate-400 text-sm">該当する単語が見つかりません</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCourse(null);
                    setSelectedStage(null);
                    setSelectedCategory("all");
                    setSelectedDifficulty("all");
                    setShowBookmarksOnly(false);
                    setSelectedMemory("all");
                    setSelectedAccuracy("all");
                    setSortOption("default");
                  }}
                  className="mt-3 text-sm text-primary-500 hover:underline"
                >
                  フィルタをクリア
                </button>
              </Card>
            )}
          </div>
        )}

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
      </div>
    </div>
  );
}
