"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Card, Button } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { unifiedStorage } from "@/lib/unified-storage";
import type { WordStats } from "@/lib/storage";
import { words, Word, categoryLabels } from "@/data/words/compat";

type WeakWord = Word & {
  stats: WordStats;
};

export default function WeakWordsPage() {
  // isLoading: 認証初期化中はデータを読み込まない（Supabaseセッションが未準備のため）
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [weakWords, setWeakWords] = useState<WeakWord[]>([]);
  const [sortBy, setSortBy] = useState<"accuracy" | "recent">("accuracy");
  const [isMounted, setIsMounted] = useState(false);

  const loadWeakWords = useCallback(async () => {
    const statsMap = await unifiedStorage.getWordStats();
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
  }, []);

  // 認証初期化完了後にデータを再取得（認証中はSupabaseセッションが未準備のため待機）
  useEffect(() => {
    if (!isAuthLoading) {
      loadWeakWords();
    }
  }, [isAuthLoading, isAuthenticated, loadWeakWords]);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 30) return "text-red-600 bg-red-100";
    if (accuracy < 50) return "text-orange-600 bg-orange-100";
    return "text-yellow-600 bg-yellow-100";
  };

  if (!isMounted) {
    return (
      <div className="main-content flex items-center justify-center">
        <p className="text-slate-500">読み込み中...</p>
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
            className="flex items-center gap-0.5 text-slate-500 hover:text-slate-700 mb-1 transition-colors text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>戻る</span>
          </Link>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <span className="text-xl emoji-icon">📝</span>
            <span>苦手な単語</span>
          </h1>
          <p className="text-slate-500 text-xs">
            正答率70%未満（{weakWords.length}語）
          </p>
        </div>

        {/* 上部固定: ソートオプション */}
        {weakWords.length > 0 && (
          <div className="flex-shrink-0 flex gap-1 mb-1.5">
            <button
              onClick={() => setSortBy("accuracy")}
              className={`px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                sortBy === "accuracy"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              正答率順
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
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
            <Card className="text-center py-6">
              <span className="text-4xl mb-2 block emoji-icon">🎉</span>
              <h2 className="text-base font-bold text-slate-800 mb-1.5">
                苦手な単語はありません！
              </h2>
              <p className="text-slate-500 text-xs mb-3">
                クイズに挑戦して、学習を続けましょう。
              </p>
              <Link href="/quiz">
                <Button size="sm">クイズに挑戦</Button>
              </Link>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5">
              {weakWords.map((word) => (
                <Link key={word.id} href={`/word/${word.id}?from=weak`}>
                  <Card
                    hover
                    className="flex items-center gap-2 group !p-2"
                  >
                    {/* 正答率バッジ */}
                    <div
                      className={`w-10 h-10 rounded-md flex flex-col items-center justify-center ${getAccuracyColor(
                        word.stats.accuracy
                      )}`}
                    >
                      <span className="text-sm font-bold">{word.stats.accuracy}%</span>
                      <span className="text-[9px] opacity-70">正答率</span>
                    </div>

                    {/* 単語情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-xs text-slate-800 group-hover:text-primary-600 transition-colors">
                          {word.word}
                        </h3>
                        <SpeakButton text={word.word} size="sm" />
                      </div>
                      <p className="text-slate-500 text-[10px] truncate">{word.meaning}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                        <span>{categoryLabels[word.category]}</span>
                        <span>·</span>
                        <span>{word.stats.totalAttempts}回</span>
                      </div>
                    </div>

                    {/* 矢印 */}
                    <div className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* 下部固定: 復習ボタン */}
            <div className="flex-shrink-0 pt-1.5">
              <Card className="!p-2 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100">
                <div className="text-center">
                  <Link href="/quiz?weakOnly=true">
                    <Button fullWidth size="sm">
                      苦手単語を復習する
                    </Button>
                  </Link>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    苦手単語だけを集中的に復習します
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
