"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { words, categoryLabels, Category } from "@/data/words";
import { storage } from "@/lib/storage";
import { Card, SpeakButton } from "@/components/ui";

type MasteryLevel = "new" | "learning" | "familiar" | "mastered";

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

const getMasteryLevel = (accuracy: number | null, attempts: number): MasteryLevel => {
  if (attempts === 0 || accuracy === null) return "new";
  if (accuracy >= 80 && attempts >= 3) return "mastered";
  if (accuracy >= 60) return "familiar";
  return "learning";
};

const masteryConfig: Record<MasteryLevel, { label: string; color: string; bg: string }> = {
  new: { label: "未学習", color: "text-slate-500", bg: "bg-slate-100" },
  learning: { label: "学習中", color: "text-orange-600", bg: "bg-orange-100" },
  familiar: { label: "習得中", color: "text-blue-600", bg: "bg-blue-100" },
  mastered: { label: "習得済", color: "text-green-600", bg: "bg-green-100" },
};

const categories: (Category | "all")[] = [
  "all",
  "business",
  "office",
  "travel",
  "shopping",
  "finance",
  "technology",
  "daily",
  "communication",
];

const categoryLabelMap: Record<Category | "all", string> = {
  all: "すべて",
  ...categoryLabels,
};

export default function WordListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | "all">("all");
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [wordsWithStats, setWordsWithStats] = useState<WordWithStats[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load word stats and bookmarks on mount
  useEffect(() => {
    setIsMounted(true);
    const statsMap = storage.getWordStats();
    const bookmarkedIds = storage.getBookmarkedWordIds();

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
  }, []);

  // Toggle bookmark for a word
  const toggleBookmark = (wordId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIsBookmarked = storage.toggleBookmark(wordId);
    setWordsWithStats((prev) =>
      prev.map((w) =>
        w.id === wordId ? { ...w, isBookmarked: newIsBookmarked } : w
      )
    );
  };

  // Filter words based on search, category, difficulty, and bookmarks
  const filteredWords = useMemo(() => {
    let filtered = wordsWithStats.filter((word) => {
      // Bookmark filter
      if (showBookmarksOnly && !word.isBookmarked) {
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
  }, [wordsWithStats, selectedCategory, selectedDifficulty, showBookmarksOnly, searchQuery, sortOption]);

  // Group words by category
  const groupedWords = useMemo(() => {
    if (selectedCategory !== "all") {
      return { [selectedCategory]: filteredWords };
    }

    const grouped: Record<string, WordWithStats[]> = {};
    for (const word of filteredWords) {
      if (!grouped[word.category]) {
        grouped[word.category] = [];
      }
      grouped[word.category].push(word);
    }
    return grouped;
  }, [filteredWords, selectedCategory]);

  // Stats summary
  const stats = useMemo(() => {
    const total = wordsWithStats.length;
    const mastered = wordsWithStats.filter((w) => w.mastery === "mastered").length;
    const learning = wordsWithStats.filter((w) => w.mastery === "learning" || w.mastery === "familiar").length;
    const newWords = wordsWithStats.filter((w) => w.mastery === "new").length;
    const bookmarked = wordsWithStats.filter((w) => w.isBookmarked).length;
    return { total, mastered, learning, newWords, bookmarked };
  }, [wordsWithStats]);

  return (
    <div className="h-[calc(100vh-64px)] px-4 py-3 flex flex-col">
      <div className="max-w-2xl w-full mx-auto flex flex-col h-full">
        {/* 上部固定: ヘッダー */}
        <div className="flex-shrink-0 flex items-center gap-3 mb-2">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-slate-800">単語帳</h1>
        </div>

        {/* 上部固定: 統計サマリー */}
        {isMounted && (
          <Card className="flex-shrink-0 mb-2 !p-3 bg-gradient-to-r from-primary-50 to-accent-50">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-slate-700">{stats.total}</p>
                <p className="text-xs text-slate-500">全単語</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{stats.mastered}</p>
                <p className="text-xs text-slate-500">習得済</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">{stats.learning}</p>
                <p className="text-xs text-slate-500">学習中</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-400">{stats.newWords}</p>
                <p className="text-xs text-slate-500">未学習</p>
              </div>
            </div>
          </Card>
        )}

        {/* 上部固定: 検索・フィルター */}
        <div className="flex-shrink-0 space-y-2 mb-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="単語・意味で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-9 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
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
              {[1, 2, 3, 4, 5].map((level) => (
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
            {searchQuery && ` (「${searchQuery}」)`}
            {selectedDifficulty !== "all" && ` / 難易度${selectedDifficulty}`}
          </p>
        </div>

        {/* 中央スクロール: Word List */}
        {isMounted && (
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
            {Object.entries(groupedWords).map(([category, categoryWords]) => (
              <div key={category}>
                {selectedCategory === "all" && (
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
                              {"★".repeat(word.difficulty)}{"☆".repeat(5 - word.difficulty)}
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
                    setSelectedCategory("all");
                    setSelectedDifficulty("all");
                    setShowBookmarksOnly(false);
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
