"use client";

import Link from "next/link";
import { useHomeData } from "@/lib/hooks/useHomeData";
import { StatusHeader } from "@/components/features/home/StatusHeader";
import { MainAction } from "@/components/features/home/MainAction";
import { ReviewShortcuts } from "@/components/features/home/ReviewShortcuts";
import { QuickLinks } from "@/components/features/home/QuickLinks";
import { DailyWordList } from "@/components/features/home/DailyWordList";
import { DungeonCard } from "@/components/features/home/DungeonCard";

export default function Home() {
  const {
    isMounted,
    userProgress,
    weakWordCount,
    srsReviewCount,
    studiedWordCount,
    dailyWords,
    wordStatsMap,
    bookmarkedWordIds,
    savedProgressInfo,
    getDisplayedMastery,
    handleManualMasteryChange,
    toggleBookmark,
    startFlashcard,
    startDailyQuiz,
    discardProgress,
  } = useHomeData();

  return (
    <div className="main-content-scroll px-4 pt-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 1. ミニステータスバー */}
        {isMounted && userProgress && <StatusHeader userProgress={userProgress} />}

        {/* 中断クイズバナー */}
        {isMounted && savedProgressInfo && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-2xl flex items-center overflow-hidden">
            <Link href="/quiz" className="flex-1 flex items-center gap-3 p-3 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
              <div className="w-9 h-9 bg-amber-200 dark:bg-amber-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg emoji-icon">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">前回のクイズが途中です</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {savedProgressInfo.answeredCount} / {savedProgressInfo.total} 問 — タップして続きから再開
                </p>
              </div>
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              onClick={() => {
                if (window.confirm("途中のクイズを破棄しますか？この操作は元に戻せません。")) {
                  discardProgress();
                }
              }}
              className="flex-shrink-0 self-stretch px-3 border-l border-amber-300 dark:border-amber-700 text-amber-500 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center"
              aria-label="途中クイズを破棄"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* 2. メインCTA: クイズに挑戦 */}
        <MainAction />

        {/* 3. SRS復習 / 苦手復習（常時表示） */}
        {isMounted && (
          <ReviewShortcuts
            srsReviewCount={srsReviewCount}
            weakWordCount={weakWordCount}
            studiedWordCount={studiedWordCount}
          />
        )}

        {/* 4. ダンジョンカード */}
        {isMounted && <DungeonCard />}

        {/* 5. 今日の単語 */}
        {isMounted && (
          <DailyWordList
            words={dailyWords}
            wordStatsMap={wordStatsMap}
            bookmarkedWordIds={bookmarkedWordIds}
            getDisplayedMastery={getDisplayedMastery}
            onToggleBookmark={toggleBookmark}
            onStartFlashcard={startFlashcard}
            onMasteryChange={handleManualMasteryChange}
            onStartQuiz={startDailyQuiz}
          />
        )}

        {/* 5. サブ機能ショートカット: 実績 / ブックマーク / 苦手単語 */}
        <QuickLinks />
      </div>
    </div>
  );
}
