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
  const [wordsWithStats, setWordsWithStats] = useState<WordWithStats[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load word stats on mount
  useEffect(() => {
    setIsMounted(true);
    const statsMap = storage.getWordStats();

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
      };
    });

    setWordsWithStats(enrichedWords);
  }, []);

  // Filter words based on search and category
  const filteredWords = useMemo(() => {
    return wordsWithStats.filter((word) => {
      // Category filter
      if (selectedCategory !== "all" && word.category !== selectedCategory) {
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
  }, [wordsWithStats, selectedCategory, searchQuery]);

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
    return { total, mastered, learning, newWords };
  }, [wordsWithStats]);

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">単語帳</h1>
        </div>

        {/* Stats Summary */}
        {isMounted && (
          <Card className="mb-6 bg-gradient-to-r from-primary-50 to-accent-50">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-700">{stats.total}</p>
                <p className="text-xs text-slate-500">全単語</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.mastered}</p>
                <p className="text-xs text-slate-500">習得済</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.learning}</p>
                <p className="text-xs text-slate-500">学習中</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-400">{stats.newWords}</p>
                <p className="text-xs text-slate-500">未学習</p>
              </div>
            </div>
          </Card>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="単語・意味で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-primary-500 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
                }`}
              >
                {categoryLabelMap[category]}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-4">
          {filteredWords.length}語 {searchQuery && `(「${searchQuery}」で検索)`}
        </p>

        {/* Word List */}
        {isMounted && (
          <div className="space-y-6">
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
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <SpeakButton text={word.word} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
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
              <Card className="text-center py-12">
                <span className="text-5xl mb-4 block">🔍</span>
                <p className="text-slate-500">該当する単語が見つかりません</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 text-primary-500 hover:underline"
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
