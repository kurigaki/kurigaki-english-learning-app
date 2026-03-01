"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Course, Stage } from "@/data/words/types";
import { COURSE_DEFINITIONS } from "@/data/words/courses";
import { words, categoryLabels, Category, getWordsByCourse } from "@/data/words/compat";
import { unifiedStorage } from "@/lib/unified-storage";
import { Card, SpeakButton } from "@/components/ui";
import { getMasteryLevel } from "@/types";
import type { MasteryLevel, WordListSortOption } from "@/types";
import FlashcardView from "@/components/features/word-list/FlashcardView";
import {
  saveFlashcardSession, getFlashcardSession, clearFlashcardSession,
  saveWordListFilter, getWordListFilter, clearWordListFilter,
} from "@/lib/flashcard-session";

type WordWithStats = {
  id: number;
  word: string;
  meaning: string;
  category: Category;
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
  attempts: "学習回数が多い順",
  difficulty: "難易度順",
};

const masteryConfig: Record<MasteryLevel, { label: string; color: string; bg: string; activeBg: string }> = {
  new: { label: "未学習", color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-700", activeBg: "bg-slate-500" },
  learning: { label: "苦手", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/40", activeBg: "bg-orange-500" },
  familiar: { label: "あと少し", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/40", activeBg: "bg-blue-500" },
  mastered: { label: "習得済", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/40", activeBg: "bg-green-500" },
};

const categories: (Category | "all")[] = [
  "all",
  "daily", "school", "family", "food", "hobby",
  "nature", "health", "sports", "culture",
  "business", "office", "travel", "shopping",
  "finance", "technology", "communication",
  "greeting", "emotion", "opinion", "request", "smalltalk",
];

const categoryLabelMap: Record<Category | "all", string> = {
  all: "すべて",
  ...categoryLabels,
};

export default function WordListPage() {
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
  const [selectedMastery, setSelectedMastery] = useState<MasteryLevel | "all">(
    ["new", "learning", "familiar", "mastered"].includes(initialMastery) ? initialMastery as MasteryLevel : "all"
  );
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [wordsWithStats, setWordsWithStats] = useState<WordWithStats[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [flashcardInitialIndex, setFlashcardInitialIndex] = useState(0);
  // スクロール位置の保存・復元用
  const listScrollRef = useRef<HTMLDivElement>(null);
  const pendingScrollTopRef = useRef<number | null>(null);
  // フラッシュカードから戻った際のスクロール対象単語ID
  const pendingScrollWordIdRef = useRef<number | null>(null);

  // フラッシュカード・リストモード共通: 詳細画面から戻った際にフィルター状態を復元
  useEffect(() => {
    // フラッシュカードセッションを優先確認
    const flashcardSession = getFlashcardSession();
    if (flashcardSession) {
      clearFlashcardSession();
      setIsFlashcardMode(true);
      setFlashcardInitialIndex(flashcardSession.currentIndex);
      setSelectedCourse(flashcardSession.selectedCourse);
      setSelectedStage(flashcardSession.selectedStage);
      setSelectedCategory(flashcardSession.selectedCategory);
      setSelectedDifficulty(flashcardSession.selectedDifficulty);
      setSelectedMastery(flashcardSession.selectedMastery);
      setSearchQuery(flashcardSession.searchQuery);
      setShowBookmarksOnly(flashcardSession.showBookmarksOnly);
      setSortOption(flashcardSession.sortOption);
      return;
    }

    // リストモードのフィルターセッションを確認
    const filterSession = getWordListFilter();
    if (!filterSession) return;
    clearWordListFilter();
    setSelectedCourse(filterSession.selectedCourse);
    setSelectedStage(filterSession.selectedStage);
    setSelectedCategory(filterSession.selectedCategory);
    setSelectedDifficulty(filterSession.selectedDifficulty);
    setSelectedMastery(filterSession.selectedMastery);
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
      const statsMap = await unifiedStorage.getWordStats();
      const bookmarkedIds = await unifiedStorage.getBookmarkedWordIds();

      const enrichedWords: WordWithStats[] = words.map((word) => {
        const stats = statsMap.get(word.id);
        const accuracy = stats?.accuracy ?? null;
        const attempts = stats?.totalAttempts ?? 0;

        return {
          id: word.id,
          word: word.word,
          meaning: word.meaning,
          category: word.category,
          difficulty: word.difficulty,
          mastery: getMasteryLevel(accuracy, attempts),
          accuracy,
          attempts,
          isBookmarked: bookmarkedIds.includes(word.id),
          example: word.example,
          exampleJa: word.exampleJa,
        };
      });

      setWordsWithStats(enrichedWords);
    };
    loadData();
  }, []);

  // データ読み込み完了後、保留中のスクロール位置を適用
  useEffect(() => {
    if (pendingScrollTopRef.current === null || !listScrollRef.current) return;
    const scrollTo = pendingScrollTopRef.current;
    pendingScrollTopRef.current = null;
    listScrollRef.current.scrollTop = scrollTo;
  }, [wordsWithStats]);

  // フラッシュカードから戻った際、該当単語の位置にスクロール
  useEffect(() => {
    if (isFlashcardMode || pendingScrollWordIdRef.current === null) return;
    const wordId = pendingScrollWordIdRef.current;
    pendingScrollWordIdRef.current = null;
    requestAnimationFrame(() => {
      document.getElementById(`word-item-${wordId}`)?.scrollIntoView({ block: "center" });
    });
  }, [isFlashcardMode]);

  // Toggle bookmark for a word
  const toggleBookmark = useCallback(async (wordId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIsBookmarked = await unifiedStorage.toggleBookmark(wordId);
    setWordsWithStats((prev) =>
      prev.map((w) =>
        w.id === wordId ? { ...w, isBookmarked: newIsBookmarked } : w
      )
    );
  }, []);

  // Course word IDs (shared between filteredWords and stats)
  const courseWordIds = useMemo(() => {
    if (!selectedCourse) return null;
    const courseWords = getWordsByCourse(selectedCourse, selectedStage ?? undefined);
    return new Set(courseWords.map((w) => w.id));
  }, [selectedCourse, selectedStage]);

  // selectedMastery を除く全フィルターを適用したベースリスト
  // filteredWords と filteredMasteryCounts の両方がこれを使用
  const baseFilteredWords = useMemo(() => {
    return wordsWithStats.filter((word) => {
      if (courseWordIds && !courseWordIds.has(word.id)) return false;
      if (showBookmarksOnly && !word.isBookmarked) return false;
      if (selectedCategory !== "all" && word.category !== selectedCategory) return false;
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

  // Filter words based on search, category, difficulty, bookmarks, and mastery
  const filteredWords = useMemo(() => {
    let filtered = baseFilteredWords;

    // Mastery filter
    if (selectedMastery !== "all") {
      filtered = filtered.filter((word) => word.mastery === selectedMastery);
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
          case "difficulty":
            return a.difficulty - b.difficulty;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [baseFilteredWords, selectedMastery, sortOption]);

  // wordId → filteredWords 内インデックスの逆引き Map（フラッシュカード開始位置に使用）
  const wordIndexMap = useMemo(
    () => new Map(filteredWords.map((w, i) => [w.id, i])),
    [filteredWords]
  );

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
    const mastered = baseWords.filter((w) => w.mastery === "mastered").length;
    const familiar = baseWords.filter((w) => w.mastery === "familiar").length;
    const learning = baseWords.filter((w) => w.mastery === "learning").length;
    const newWords = baseWords.filter((w) => w.mastery === "new").length;
    const bookmarked = baseWords.filter((w) => w.isBookmarked).length;
    return { total, mastered, familiar, learning, newWords, bookmarked };
  }, [wordsWithStats, courseWordIds]);

  // baseFilteredWords から記憶度別件数を集計（記憶度フィルターボタンの件数表示に使用）
  const filteredMasteryCounts = useMemo(() => ({
    total:    baseFilteredWords.length,
    mastered: baseFilteredWords.filter((w) => w.mastery === "mastered").length,
    familiar: baseFilteredWords.filter((w) => w.mastery === "familiar").length,
    learning: baseFilteredWords.filter((w) => w.mastery === "learning").length,
    newWords: baseFilteredWords.filter((w) => w.mastery === "new").length,
  }), [baseFilteredWords]);

  const courseLabel = selectedCourse
    ? COURSE_DEFINITIONS[selectedCourse].name
    : null;
  const stageLabel = selectedCourse && selectedStage
    ? COURSE_DEFINITIONS[selectedCourse].stages.find((s) => s.stage === selectedStage)?.displayName
    : null;

  return (
    <div className="main-content px-3 py-2 flex flex-col">
      <div className="max-w-2xl w-full mx-auto flex flex-col h-full">
        {/* 上部固定: ヘッダー */}
        <div className="flex-shrink-0 flex items-center gap-2 mb-1.5">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1">単語帳</h1>
          {isMounted && filteredWords.length > 0 && (
            <button
              onClick={() => setIsFlashcardMode(true)}
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
            <div className="flex flex-wrap gap-1 mb-1">
              <button
                onClick={() => { setSelectedCourse(null); setSelectedStage(null); }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
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
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                      selectedCourse === ct
                        ? "bg-primary-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {COURSE_DEFINITIONS[ct].name}
                  </button>
                ))}
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
          <div className="overflow-x-auto pb-1 -mx-1 px-1">
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

          {/* Filters Row 1: Bookmark + Mastery（横スクロール・折り返しなし） */}
          <div className="overflow-x-auto pb-0.5 -mx-1 px-1">
            <div className="flex items-center gap-1">
              {/* Bookmark Filter */}
              <button
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
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
                {stats.bookmarked}
              </button>
              <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
              {/* Mastery Filter */}
              {([
                { key: "all" as const, label: "全て", count: filteredMasteryCounts.total },
                { key: "mastered" as const, label: "習得済", count: filteredMasteryCounts.mastered },
                { key: "familiar" as const, label: "あと少し", count: filteredMasteryCounts.familiar },
                { key: "learning" as const, label: "苦手", count: filteredMasteryCounts.learning },
                { key: "new" as const, label: "未学習", count: filteredMasteryCounts.newWords },
              ] as const).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setSelectedMastery(key)}
                  className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    selectedMastery === key
                      ? key === "all"
                        ? "bg-slate-700 text-white"
                        : `${masteryConfig[key].activeBg} text-white shadow-sm`
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                >
                  {label}{isMounted && count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row 2: Difficulty（横スクロール） + Sort（右端固定） */}
          <div className="flex items-center gap-1.5">
            <div className="overflow-x-auto flex-1 pb-0.5 -mx-1 px-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedDifficulty("all")}
                  className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    selectedDifficulty === "all"
                      ? "bg-slate-700 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                >
                  難易度
                </button>
                {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`w-6 h-6 rounded flex-shrink-0 text-xs font-medium transition-all ${
                      selectedDifficulty === level
                        ? "bg-amber-500 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400"
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
            {selectedMastery !== "all" && ` (${masteryConfig[selectedMastery].label})`}
            {searchQuery && ` (「${searchQuery}」)`}
            {courseLabel && ` / ${courseLabel}${stageLabel ? ` - ${stageLabel}` : ""}`}
            {selectedDifficulty !== "all" && ` / 難易度${selectedDifficulty}`}
          </p>
        </div>

        {/* フラッシュカードモード or リストモード */}
        {isFlashcardMode ? (
          <div className="flex-1 min-h-0">
            <FlashcardView
              words={filteredWords}
              initialIndex={flashcardInitialIndex}
              onExit={(currentWordId) => {
                if (currentWordId !== undefined) {
                  pendingScrollWordIdRef.current = currentWordId;
                }
                setIsFlashcardMode(false);
                setFlashcardInitialIndex(0);
              }}
              onDetailView={(index) => {
                saveFlashcardSession({
                  currentIndex: index,
                  selectedCourse,
                  selectedStage,
                  selectedCategory,
                  selectedDifficulty,
                  selectedMastery,
                  searchQuery,
                  showBookmarksOnly,
                  sortOption,
                });
              }}
            />
          </div>
        ) : (
          <>
            {/* 中央スクロール: Word List */}
            {isMounted && (
              <div ref={listScrollRef} className="flex-1 overflow-y-auto min-h-0 space-y-4">
                {Object.entries(groupedWords).map(([category, categoryWords]) => (
                  <div key={category}>
                    {selectedCategory === "all" && selectedCourse === null && (
                      <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary-400" />
                        {categoryLabelMap[category as Category]} ({categoryWords.length})
                      </h2>
                    )}
                    <Card className="divide-y divide-slate-100 dark:divide-slate-700">
                      {categoryWords.map((word) => (
                        <Link
                          id={`word-item-${word.id}`}
                          key={word.id}
                          href={`/word/${word.id}?from=wordlist`}
                          onClick={() => saveWordListFilter({
                            selectedCourse,
                            selectedStage,
                            selectedCategory,
                            selectedDifficulty,
                            selectedMastery,
                            searchQuery,
                            showBookmarksOnly,
                            sortOption,
                            scrollTop: listScrollRef.current?.scrollTop ?? 0,
                          })}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <SpeakButton text={word.word} size="sm" />
                            <button
                              onClick={(e) => toggleBookmark(word.id, e)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                word.isBookmarked
                                  ? "text-yellow-500 hover:text-yellow-600"
                                  : "text-slate-300 hover:text-yellow-400"
                              }`}
                              title={word.isBookmarked ? "ブックマーク解除" : "ブックマークに追加"}
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
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const index = wordIndexMap.get(word.id) ?? 0;
                                setFlashcardInitialIndex(index);
                                setIsFlashcardMode(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex-shrink-0"
                              title="この単語からフラッシュカード開始"
                            >
                              <span className="text-xs emoji-icon">🃏</span>
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors truncate">
                                  {word.word}
                                </p>
                                <span
                                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    masteryConfig[word.mastery].bg
                                  } ${masteryConfig[word.mastery].color}`}
                                >
                                  {masteryConfig[word.mastery].label}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{word.meaning}</p>
                            </div>
                          </div>
                          <div className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 group-hover:translate-x-1 transition-all ml-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </Card>
                  </div>
                ))}

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
                        setSelectedMastery("all");
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
          </>
        )}
      </div>
    </div>
  );
}
