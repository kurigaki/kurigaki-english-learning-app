"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { storage, WordStats } from "@/lib/storage";
import { words, Word, categoryLabels } from "@/data/words";

type WeakWord = Word & {
  stats: WordStats;
};

export default function WeakWordsPage() {
  const [weakWords, setWeakWords] = useState<WeakWord[]>([]);
  const [sortBy, setSortBy] = useState<"accuracy" | "recent">("accuracy");
  const [isMounted, setIsMounted] = useState(false);

  const loadWeakWords = useCallback(() => {
    const statsMap = storage.getWordStats();
    const weak: WeakWord[] = [];

    statsMap.forEach((stats, wordId) => {
      // 正答率70%未満を苦手とみなす
      if (stats.accuracy < 70 && stats.totalAttempts >= 1) {
        const word = words.find((w) => w.id === wordId);
        if (word) {
          weak.push({ ...word, stats });
        }
      }
    });

    // ソート
    if (sortBy === "accuracy") {
      weak.sort((a, b) => a.stats.accuracy - b.stats.accuracy);
    } else {
      weak.sort((a, b) => {
        const dateA = a.stats.lastStudiedAt ? new Date(a.stats.lastStudiedAt).getTime() : 0;
        const dateB = b.stats.lastStudiedAt ? new Date(b.stats.lastStudiedAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    setWeakWords(weak);
  }, [sortBy]);

  useEffect(() => {
    setIsMounted(true);
    loadWeakWords();
  }, [loadWeakWords]);

  useEffect(() => {
    if (isMounted) {
      loadWeakWords();
    }
  }, [sortBy, isMounted, loadWeakWords]);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 30) return "text-red-600 bg-red-100";
    if (accuracy < 50) return "text-orange-600 bg-orange-100";
    return "text-yellow-600 bg-yellow-100";
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "---";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  };

  if (!isMounted) {
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-8 flex items-center justify-center">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link
            href="/"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>戻る</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-3xl">📝</span>
            苦手な単語
          </h1>
          <p className="text-slate-500 mt-1">
            正答率70%未満の単語一覧（{weakWords.length}語）
          </p>
        </div>

        {/* ソートオプション */}
        {weakWords.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSortBy("accuracy")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sortBy === "accuracy"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              正答率順
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sortBy === "recent"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              最近学習した順
            </button>
          </div>
        )}

        {/* 単語がない場合 */}
        {weakWords.length === 0 ? (
          <Card className="text-center py-12">
            <span className="text-6xl mb-4 block">🎉</span>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              苦手な単語はありません！
            </h2>
            <p className="text-slate-500 mb-6">
              クイズに挑戦して、学習を続けましょう。
            </p>
            <Link href="/quiz">
              <Button>クイズに挑戦</Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* 苦手単語リスト */}
            <div className="space-y-3 mb-6">
              {weakWords.map((word) => (
                <Link key={word.id} href={`/word/${word.id}`}>
                  <Card
                    hover
                    className="flex items-center gap-4 group"
                  >
                    {/* 正答率バッジ */}
                    <div
                      className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${getAccuracyColor(
                        word.stats.accuracy
                      )}`}
                    >
                      <span className="text-lg font-bold">{word.stats.accuracy}%</span>
                      <span className="text-xs opacity-70">正答率</span>
                    </div>

                    {/* 単語情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                          {word.word}
                        </h3>
                        <SpeakButton text={word.word} size="sm" />
                      </div>
                      <p className="text-slate-500 text-sm truncate">{word.meaning}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>{categoryLabels[word.category]}</span>
                        <span>·</span>
                        <span>{word.stats.totalAttempts}回回答</span>
                        <span>·</span>
                        <span>最終: {formatDate(word.stats.lastStudiedAt)}</span>
                      </div>
                    </div>

                    {/* 矢印 */}
                    <div className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* 復習ボタン */}
            <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100">
              <div className="text-center">
                <p className="text-slate-600 mb-4">
                  苦手な単語を重点的に復習しましょう
                </p>
                <Link href="/quiz">
                  <Button fullWidth>
                    苦手単語を復習する
                  </Button>
                </Link>
                <p className="text-xs text-slate-400 mt-2">
                  クイズでは苦手単語が優先的に出題されます
                </p>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
