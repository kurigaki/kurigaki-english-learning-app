"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, Button } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { unifiedStorage } from "@/lib/unified-storage";
import { saveWeakWordSort, getAndClearWeakWordSort } from "@/lib/navigation-state";
import { saveWordNavState } from "@/lib/word-nav-state";
import type { WordStats, ManualMasteryLevel } from "@/lib/storage";
import { words, Word, categoryLabels } from "@/data/words/compat";
import { isWeakWord } from "@/types";
import { getDisplayedManualMastery, MANUAL_MASTERY_OPTIONS_ORDERED } from "@/lib/manual-mastery";
import { getAccuracyBadgeClass } from "@/lib/accuracy-style";
import { getMasteryBadgeClass } from "@/lib/mastery-style";
import { saveQuickFlashcardSession } from "@/lib/flashcard-session";

type WeakWord = Word & {
  stats: WordStats;
};

export default function WeakWordsPage() {
  const router = useRouter();
  // isLoading: 認証初期化中はデータを読み込まない（Supabaseセッションが未準備のため）
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [weakWords, setWeakWords] = useState<WeakWord[]>([]);
  const [wordStatsMap, setWordStatsMap] = useState<Map<number, WordStats>>(new Map());
  const [manualMemoryById, setManualMemoryById] = useState<Record<number, ManualMasteryLevel>>({});
  const [bookmarkedWordIds, setBookmarkedWordIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<"accuracy" | "recent">("accuracy");
  const [isMounted, setIsMounted] = useState(false);

  const loadWeakWords = useCallback(async () => {
    const [statsMap, manualMap, bookmarkedIds] = await Promise.all([
      unifiedStorage.getWordStats(),
      unifiedStorage.getManualMasteryMap(),
      unifiedStorage.getBookmarkedWordIds(),
    ]);
    setWordStatsMap(statsMap);
    setManualMemoryById(manualMap);
    setBookmarkedWordIds(bookmarkedIds);
    const weak: WeakWord[] = [];

    statsMap.forEach((stats, wordId) => {
      if (isWeakWord(stats.accuracy, stats.totalAttempts)) {
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
    // 単語詳細から戻った際にソート状態を復元
    const saved = getAndClearWeakWordSort();
    if (saved) setSortBy(saved);
  }, []);

  // 認証初期化完了後にデータを再取得（認証中はSupabaseセッションが未準備のため待機）
  useEffect(() => {
    if (!isAuthLoading) {
      loadWeakWords();
    }
  }, [isAuthLoading, isAuthenticated, loadWeakWords]);

  const getDisplayedMastery = useCallback((wordId: number): ManualMasteryLevel => (
    getDisplayedManualMastery(wordId, wordStatsMap, manualMemoryById)
  ), [manualMemoryById, wordStatsMap]);

  const handleManualMasteryChange = useCallback(async (wordId: number, mastery: ManualMasteryLevel) => {
    setManualMemoryById((prev) => ({ ...prev, [wordId]: mastery }));
    await unifiedStorage.setManualMastery(wordId, mastery);
  }, []);

  const toggleBookmark = useCallback(async (wordId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = await unifiedStorage.toggleBookmark(wordId);
    setBookmarkedWordIds((prev) => (
      next ? (prev.includes(wordId) ? prev : [...prev, wordId]) : prev.filter((id) => id !== wordId)
    ));
  }, []);

  const startFlashcard = useCallback((wordId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saveQuickFlashcardSession([wordId]);
    router.push("/flashcard");
  }, [router]);

  if (!isMounted) {
    return (
      <div className="main-content flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="main-content px-3 py-2 flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex flex-col h-full">
        {/* 上部固定: ヘッダー */}
        <div className="flex-shrink-0 mb-1.5">
          <Link
            href="/"
            className="flex items-center gap-0.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-200 mb-1 transition-colors text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>戻る</span>
          </Link>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span className="text-xl emoji-icon">📝</span>
            <span>苦手な単語</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            正答率60%未満（{weakWords.length}語）
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
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              正答率順
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                sortBy === "recent"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
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
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                苦手な単語はありません！
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
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
                <Card
                  key={word.id}
                  hover
                  className="flex items-center gap-2 group !p-2"
                >
                  <button
                    onClick={(e) => toggleBookmark(word.id, e)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      bookmarkedWordIds.includes(word.id)
                        ? "text-yellow-500 hover:text-yellow-600"
                        : "text-slate-300 hover:text-yellow-400"
                    }`}
                    title={bookmarkedWordIds.includes(word.id) ? "ブックマーク解除" : "ブックマークに追加"}
                  >
                    <svg
                      className="w-4 h-4"
                      fill={bookmarkedWordIds.includes(word.id) ? "currentColor" : "none"}
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
                    onClick={(e) => startFlashcard(word.id, e)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex-shrink-0"
                    title="この単語からフラッシュカード開始"
                  >
                    <span className="text-xs emoji-icon">🃏</span>
                  </button>
                  <Link
                    href={`/word/${word.id}?from=weak`}
                    onClick={() => { saveWeakWordSort(sortBy); saveWordNavState(weakWords.map((w) => w.id), "weak"); }}
                    className="flex items-center gap-2 flex-1 min-w-0 group/link"
                  >
                    <SpeakButton text={word.word} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover/link:text-primary-600 transition-colors">
                          {word.word}
                        </h3>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] truncate">{word.meaning}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                        <span>{categoryLabels[word.category]}</span>
                        <span>·</span>
                        <span>{word.stats.totalAttempts}回</span>
                      </div>
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 group-hover/link:text-primary-500 group-hover/link:translate-x-1 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                  <div className="w-[170px] flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <span className={`text-[10px] px-1 py-0.5 rounded border whitespace-nowrap ${getAccuracyBadgeClass(word.stats.accuracy)}`}>
                        正答率 {word.stats.accuracy}%
                      </span>
                      <select
                        value={getDisplayedMastery(word.id)}
                        onChange={(e) => handleManualMasteryChange(word.id, e.target.value as ManualMasteryLevel)}
                        className={`text-[10px] px-1.5 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-primary-400 ${getMasteryBadgeClass(getDisplayedMastery(word.id))}`}
                      >
                        {MANUAL_MASTERY_OPTIONS_ORDERED
                          .filter((opt) => (wordStatsMap.get(word.id)?.totalAttempts ?? 0) === 0 || opt.key !== "unlearned")
                          .map((opt) => (
                            <option key={`${word.id}-${opt.key}`} value={opt.key}>
                              {opt.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* 下部固定: 復習ボタン */}
            <div className="flex-shrink-0 pt-1.5">
              <Card className="!p-2 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-100 dark:border-primary-800/30">
                <div className="text-center">
                  <Link href="/quiz?weakOnly=true">
                    <Button fullWidth size="sm">
                      苦手単語を復習する
                    </Button>
                  </Link>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
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
