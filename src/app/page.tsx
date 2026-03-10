"use client";

import { useHomeData } from "@/lib/hooks/useHomeData";
import { StatusHeader } from "@/components/features/home/StatusHeader";
import { MainAction } from "@/components/features/home/MainAction";
import { ReviewShortcuts } from "@/components/features/home/ReviewShortcuts";
import { QuickLinks } from "@/components/features/home/QuickLinks";
import { DailyWordList } from "@/components/features/home/DailyWordList";

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
    getDisplayedMastery,
    handleManualMasteryChange,
    toggleBookmark,
    startFlashcard,
  } = useHomeData();

  return (
    <div className="main-content-scroll px-4 pt-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 1. ミニステータスバー */}
        {isMounted && userProgress && <StatusHeader userProgress={userProgress} />}

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

        {/* 4. 今日の単語 */}
        {isMounted && (
          <DailyWordList
            words={dailyWords}
            wordStatsMap={wordStatsMap}
            bookmarkedWordIds={bookmarkedWordIds}
            getDisplayedMastery={getDisplayedMastery}
            onToggleBookmark={toggleBookmark}
            onStartFlashcard={startFlashcard}
            onMasteryChange={handleManualMasteryChange}
          />
        )}

        {/* 5. サブ機能ショートカット: 実績 / ブックマーク / 苦手単語 */}
        <QuickLinks />
      </div>
    </div>
  );
}
