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

  if (!isMounted) {
    return (
      <div className="h-[calc(100vh-64px)] px-4 py-3 flex items-center justify-center">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] px-4 py-3 flex flex-col">
      <div className="max-w-2xl w-full mx-auto flex flex-col h-full">
        {/* 上部固定: ヘッダー */}
        <div className="flex-shrink-0 mb-2">
          <Link
            href="/"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-2 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>戻る</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-2xl emoji-icon">📝</span>
            <span>苦手な単語</span>
          </h1>
          <p className="text-slate-500 text-sm">
            正答率70%未満（{weakWords.length}語）
          </p>
        </div>

        {/* 上部固定: ソートオプション */}
        {weakWords.length > 0 && (
          <div className="flex-shrink-0 flex gap-1.5 mb-2">
            <button
              onClick={() => setSortBy("accuracy")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                sortBy === "accuracy"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              正答率順
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                sortBy === "recent"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              最近学習した順
            </button>
          </div>
        )}

        {/* 中央スクロール: 単語リスト */}
        {weakWords.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="text-center py-8">
              <span className="text-5xl mb-3 block emoji-icon">🎉</span>
              <h2 className="text-lg font-bold text-slate-800 mb-2">
                苦手な単語はありません！
              </h2>
              <p className="text-slate-500 text-sm mb-4">
                クイズに挑戦して、学習を続けましょう。
              </p>
              <Link href="/quiz">
                <Button>クイズに挑戦</Button>
              </Link>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
              {weakWords.map((word) => (
                <Link key={word.id} href={`/word/${word.id}?from=weak`}>
                  <Card
                    hover
                    className="flex items-center gap-3 group !p-3"
                  >
                    {/* 正答率バッジ */}
                    <div
                      className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${getAccuracyColor(
                        word.stats.accuracy
                      )}`}
                    >
                      <span className="text-base font-bold">{word.stats.accuracy}%</span>
                      <span className="text-xs opacity-70">正答率</span>
                    </div>

                    {/* 単語情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-800 group-hover:text-primary-600 transition-colors">
                          {word.word}
                        </h3>
                        <SpeakButton text={word.word} size="sm" />
                      </div>
                      <p className="text-slate-500 text-xs truncate">{word.meaning}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span>{categoryLabels[word.category]}</span>
                        <span>·</span>
                        <span>{word.stats.totalAttempts}回</span>
                      </div>
                    </div>

                    {/* 矢印 */}
                    <div className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* 下部固定: 復習ボタン */}
            <div className="flex-shrink-0 pt-2">
              <Card className="!p-3 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100">
                <div className="text-center">
                  <Link href="/quiz">
                    <Button fullWidth size="sm">
                      苦手単語を復習する
                    </Button>
                  </Link>
                  <p className="text-xs text-slate-400 mt-1">
                    クイズでは苦手単語が優先的に出題されます
                  </p>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
