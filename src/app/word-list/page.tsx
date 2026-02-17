"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Course, Stage } from "@/data/words/types";
import { COURSE_DEFINITIONS } from "@/data/words/courses";
import { words, categoryLabels, Category, getWordsByCourse } from "@/data/words/compat";
import { unifiedStorage } from "@/lib/unified-storage";
import { Card, SpeakButton } from "@/components/ui";
import { getMasteryLevel } from "@/types";
import type { MasteryLevel } from "@/types";

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
};

type SortOption = "default" | "alphabetical" | "alphabetical-desc" | "accuracy" | "accuracy-desc" | "attempts" | "difficulty";

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
  new: { label: "未学習", color: "text-slate-500", bg: "bg-slate-100", activeBg: "bg-slate-500" },
  learning: { label: "苦手", color: "text-orange-600", bg: "bg-orange-100", activeBg: "bg-orange-500" },
  familiar: { label: "あと少し", color: "text-blue-600", bg: "bg-blue-100", activeBg: "bg-blue-500" },
  mastered: { label: "習得済", color: "text-green-600", bg: "bg-green-100", activeBg: "bg-green-500" },
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
  const [showLegend, setShowLegend] = useState(false);

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
        };
      });

      setWordsWithStats(enrichedWords);
    };
    loadData();
  }, []);

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

  // Filter words based on search, category, difficulty, and bookmarks
  const filteredWords = useMemo(() => {
    let filtered = wordsWithStats;

    // Course filter
    if (courseWordIds) {
      filtered = filtered.filter((w) => courseWordIds.has(w.id));
    }

    filtered = filtered.filter((word) => {
      // Bookmark filter
      if (showBookmarksOnly && !word.isBookmarked) {
        return false;
      }

      // Mastery filter
      if (selectedMastery !== "all" && word.mastery !== selectedMastery) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && word.category !== selectedCategory) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== "all" && word.difficulty !== selectedDifficulty) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          word.word.toLowerCase().includes(query) ||
          word.meaning.toLowerCase().includes(query)
        );
      }

      return true;
    });

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
  }, [wordsWithStats, courseWordIds, selectedCategory, selectedDifficulty, showBookmarksOnly, selectedMastery, searchQuery, sortOption]);

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
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-slate-800">単語帳</h1>
        </div>

        {/* 上部固定: 統計サマリー */}
        {isMounted && (
          <div className="flex-shrink-0 mb-1.5">
            <Card className="!p-2 bg-gradient-to-r from-primary-50 to-accent-50">
              <div className="relative">
                <button
                  onClick={() => setShowLegend(!showLegend)}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
                  title={showLegend ? "凡例を閉じる" : "凡例を表示"}
                >
                  ?
                </button>
                <div className="grid grid-cols-5 gap-1 text-center">
                  <div>
                    <p className="text-base font-bold text-slate-700">{stats.total}</p>
                    <p className="text-[10px] text-slate-500">全単語</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-green-600">{stats.mastered}</p>
                    <p className="text-[10px] text-slate-500">習得済</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-blue-600">{stats.familiar}</p>
                    <p className="text-[10px] text-slate-500">あと少し</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-orange-600">{stats.learning}</p>
                    <p className="text-[10px] text-slate-500">苦手</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-400">{stats.newWords}</p>
                    <p className="text-[10px] text-slate-500">未学習</p>
                  </div>
                </div>
              </div>
            </Card>
            {showLegend && (
              <div className="mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-0.5">
                <p><span className="emoji-icon">✅</span> <span className="font-medium">習得済</span>: 正答率80%以上 &amp; 3回以上学習</p>
                <p><span className="emoji-icon">💡</span> <span className="font-medium">あと少し</span>: 正答率60%以上</p>
                <p><span className="emoji-icon">📖</span> <span className="font-medium">苦手</span>: 正答率60%未満</p>
                <p><span className="emoji-icon">🆕</span> <span className="font-medium">未学習</span>: まだ学習していません</p>
              </div>
            )}
          </div>
        )}

        {/* 上部固定: 検索・フィルター */}
        <div className="flex-shrink-0 space-y-1.5 mb-1.5">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="単語・意味で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 pl-8 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
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
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
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
                      : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
                  }`}
                >
                  {categoryLabelMap[category]}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row: Bookmark + Difficulty + Sort */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Bookmark Filter */}
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                showBookmarksOnly
                  ? "bg-yellow-500 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-yellow-400"
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

            {/* Mastery Filter */}
            <div className="flex items-center gap-1">
              {([
                { key: "all" as const, label: "全て" },
                { key: "mastered" as const, label: "習得済" },
                { key: "familiar" as const, label: "あと少し" },
                { key: "learning" as const, label: "苦手" },
                { key: "new" as const, label: "未学習" },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedMastery(key)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedMastery === key
                      ? key === "all"
                        ? "bg-slate-700 text-white"
                        : `${masteryConfig[key].activeBg} text-white shadow-sm`
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedDifficulty("all")}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedDifficulty === "all"
                    ? "bg-slate-700 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
                }`}
              >
                全難易度
              </button>
              {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`w-6 h-6 rounded text-xs font-medium transition-all ${
                    selectedDifficulty === level
                      ? "bg-amber-500 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-amber-400"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="ml-auto px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <p className="text-xs text-slate-500">
            {filteredWords.length}語
            {showBookmarksOnly && " (ブックマーク)"}
            {selectedMastery !== "all" && ` (${masteryConfig[selectedMastery].label})`}
            {searchQuery && ` (「${searchQuery}」)`}
            {courseLabel && ` / ${courseLabel}${stageLabel ? ` - ${stageLabel}` : ""}`}
            {selectedDifficulty !== "all" && ` / 難易度${selectedDifficulty}`}
          </p>
        </div>

        {/* 中央スクロール: Word List */}
        {isMounted && (
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
            {Object.entries(groupedWords).map(([category, categoryWords]) => (
              <div key={category}>
                {selectedCategory === "all" && selectedCourse === null && (
                  <h2 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-400" />
                    {categoryLabelMap[category as Category]} ({categoryWords.length})
                  </h2>
                )}
                <Card className="divide-y divide-slate-100">
                  {categoryWords.map((word) => (
                    <Link
                      key={word.id}
                      href={`/word/${word.id}?from=wordlist`}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors group first:rounded-t-xl last:rounded-b-xl"
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors truncate">
                              {word.word}
                            </p>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                masteryConfig[word.mastery].bg
                              } ${masteryConfig[word.mastery].color}`}
                            >
                              {masteryConfig[word.mastery].label}
                            </span>
                            <span className="text-xs text-amber-500" title={`難易度 ${word.difficulty}`}>
                              {"★".repeat(word.difficulty)}{"☆".repeat(7 - word.difficulty)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 truncate">{word.meaning}</p>
                        </div>
                      </div>
                      <div className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all ml-2">
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
                <p className="text-slate-500 text-sm">該当する単語が見つかりません</p>
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
      </div>
    </div>
  );
}
