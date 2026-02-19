"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { unifiedStorage } from "@/lib/unified-storage";
import { words as allWords, categoryLabels } from "@/data/words/compat";
import { SpeakButton, Card } from "@/components/ui";
import type { Word } from "@/data/words/compat";
import type { SrsStatus } from "@/lib/srs";

type ReviewMode = "srs" | "weak";

type ReviewWord = Word & {
  accuracy?: number;
  attempts?: number;
  srsStatus?: SrsStatus;
};

const srsStatusConfig: Record<SrsStatus, { label: string; color: string }> = {
  new:      { label: "新規",     color: "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700" },
  learning: { label: "学習中",   color: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40" },
  review:   { label: "復習",     color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40" },
  mastered: { label: "習得済",   color: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40" },
};

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ReviewMode) ?? "srs";
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [reviewWords, setReviewWords] = useState<ReviewWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWords = useCallback(async () => {
    setIsLoading(true);
    if (mode === "srs") {
      const dueWords = await unifiedStorage.getDueWords();
      const dueMap = new Map(dueWords.map((p) => [p.wordId, p]));
      const result: ReviewWord[] = allWords
        .filter((w) => dueMap.has(w.id))
        .map((w) => ({ ...w, srsStatus: dueMap.get(w.id)!.status }));
      setReviewWords(result);
    } else {
      const statsMap = await unifiedStorage.getWordStats();
      const result: ReviewWord[] = [];
      statsMap.forEach((stats, wordId) => {
        if (stats.accuracy < 70 && stats.totalAttempts >= 1) {
          const word = allWords.find((w) => w.id === wordId);
          if (word) {
            result.push({ ...word, accuracy: stats.accuracy, attempts: stats.totalAttempts });
          }
        }
      });
      result.sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100));
      setReviewWords(result);
    }
    setIsLoading(false);
  }, [mode]);

  useEffect(() => {
    if (!isAuthLoading) {
      loadWords();
    }
  }, [isAuthLoading, isAuthenticated, loadWords]);

  const isSrs = mode === "srs";
  const title = isSrs ? "今日の復習" : "苦手単語の復習";
  const icon = isSrs ? "🧠" : "🔄";
  const quizUrl = isSrs ? "/quiz?srsReview=true" : "/quiz?weakOnly=true";
  const emptyMessage = isSrs
    ? "今日復習すべき単語はありません"
    : "苦手な単語はありません";

  return (
    <div className="main-content px-3 py-2 flex flex-col">
      <div className="max-w-2xl w-full mx-auto flex flex-col h-full">

        {/* 上部固定: ヘッダー */}
        <div className="flex-shrink-0 flex items-center gap-2 mb-2">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl emoji-icon">{icon}</span>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h1>
          </div>
          {!isLoading && reviewWords.length > 0 && (
            <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
              {reviewWords.length}語
            </span>
          )}
        </div>

        {/* 説明文 */}
        <p className="flex-shrink-0 text-xs text-slate-500 dark:text-slate-400 mb-2">
          {isSrs
            ? "記憶を定着させるタイミングです。単語を確認してからクイズを始めましょう。"
            : "正答率が低い単語です。もう一度確認してからクイズに挑戦しましょう。"}
        </p>

        {/* 中央スクロール: 単語リスト */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : reviewWords.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-4xl mb-3 emoji-icon">{isSrs ? "✅" : "🎉"}</p>
              <p className="text-slate-600 dark:text-slate-300 font-medium">{emptyMessage}</p>
              <Link href="/" className="mt-4 inline-block text-sm text-primary-500 hover:underline">
                ホームに戻る
              </Link>
            </Card>
          ) : (
            <Card className="divide-y divide-slate-100 dark:divide-slate-700 !p-0">
              {reviewWords.map((word) => (
                <Link
                  key={word.id}
                  href={`/word/${word.id}`}
                  className="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group first:rounded-t-3xl last:rounded-b-3xl"
                >
                  <SpeakButton text={word.word} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {word.word}
                      </p>
                      {/* SRSモード: ステータスバッジ */}
                      {isSrs && word.srsStatus && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${srsStatusConfig[word.srsStatus].color}`}>
                          {srsStatusConfig[word.srsStatus].label}
                        </span>
                      )}
                      {/* 苦手モード: 正答率バッジ */}
                      {!isSrs && word.accuracy !== undefined && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40">
                          正答率 {Math.round(word.accuracy)}%
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {categoryLabels[word.category] ?? word.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{word.meaning}</p>
                  </div>
                  <svg
                    className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </Card>
          )}
        </div>

        {/* 下部固定: クイズ開始ボタン */}
        {!isLoading && reviewWords.length > 0 && (
          <div className="flex-shrink-0 pt-3">
            <Link href={quizUrl} className="block">
              <button className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-2xl shadow-button hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2">
                <span className="emoji-icon">{icon}</span>
                クイズを始める（{reviewWords.length}語）
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="main-content px-3 py-2 flex flex-col">
        <div className="max-w-2xl w-full mx-auto">
          <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
